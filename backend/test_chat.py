"""Flask chat contract tests with mocked JWKS verification and Gemini transport."""

import json
import os
import unittest
from unittest.mock import patch

import httpx
from google.genai import errors
from jwt.exceptions import InvalidTokenError

from backend import chat
from backend.app import app, df, predict_machine


class ChatTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.token = "fixture-user-token"
        self.user_id = "fixture-user"
        self.machine_id = df.iloc[0]["Machine_ID"]

        patches = [
            patch.dict(app.config, SUPABASE_URL="https://supabase-test.invalid"),
            patch.dict(os.environ, GEMINI_API_KEY="fixture-provider-key", GEMINI_MODEL="fixture-model"),
            patch("backend.supabase_auth.verify_supabase_token", return_value={"sub": self.user_id}),
            patch("backend.chat.genai.Client"),
            patch("backend.chat._attempts", chat.deque()),
        ]
        self.mocks = [p.start() for p in patches]
        for p in patches:
            self.addCleanup(p.stop)
        self.verify = self.mocks[2]
        self.provider = self.mocks[3].return_value.__enter__.return_value.models.generate_content
        self.provider.return_value.text = "Ask qualified maintenance personnel to review the readings."

    def send(self, payload=None):
        return self.client.post(
            "/chat",
            json={"message": "What should I inspect?"} if payload is None else payload,
            headers={"Authorization": f"Bearer {self.token}"},
        )

    def test_missing_or_invalid_authentication(self):
        response = self.client.post("/chat", json={"message": "Hello"})
        self.assertEqual(response.status_code, 401)
        self.verify.assert_not_called()
        self.verify.side_effect = InvalidTokenError()
        self.assertEqual(self.send().status_code, 401)
        self.provider.assert_not_called()

    def test_general_chat_with_history(self):
        response = self.send({
            "message": "Which reading is most useful?",
            "history": [
                {"role": "user", "content": "What readings help?"},
                {"role": "assistant", "content": "Consider vibration and temperature."},
            ],
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {"reply": self.provider.return_value.text})
        args = self.provider.call_args.kwargs
        self.assertEqual(args["model"], "fixture-model")
        self.assertEqual([item.role for item in args["contents"]], ["user", "model", "user"])
        self.assertTrue(args["config"].system_instruction.endswith("context: null"))
        self.assertEqual(args["config"].max_output_tokens, 2048)

    def test_machine_context_uses_prediction_and_allowlisted_fields(self):
        response = self.send({"message": "Explain this machine.", "machine_id": self.machine_id})
        self.assertEqual(response.status_code, 200)
        args = self.provider.call_args.kwargs
        instruction = args["config"].system_instruction
        context = json.loads(instruction.split("Server machine context: ", 1)[1])
        readings = context["dataset_readings"]
        self.assertEqual(readings["Temperature_C"], df.iloc[0]["Temperature_C"])
        self.assertLessEqual(set(readings), set(chat.READINGS))
        self.assertNotIn("Failure_Within_7_Days", instruction)
        self.assertNotIn("Remaining_Useful_Life_days", instruction)
        self.assertNotIn(self.user_id, instruction)
        self.assertNotIn(self.token, instruction)
        self.assertNotIn("fixture-provider-key", instruction)
        self.assertEqual(context["adaboost_estimate"], predict_machine(df.iloc[0].fillna(0).to_dict()))

    def test_rejects_invalid_input_before_gemini(self):
        for payload in (
            [],
            {"message": " "},
            {"message": "x" * (chat.MAX_MESSAGE + 1)},
            {"message": "hello", "history": [{"role": "user", "content": "unpaired"}]},
            {"message": "hello", "history": [{"role": "user", "content": "history"}] * 10},
            {"message": "hello", "machine_id": 123},
            {"message": "hello", "system": "override"},
            {"message": "my password: fake-password"},
            {"message": "Bearer fixture-user-token"},
            {"message": "fixture-provider-key"},
            {"message": "hello", "history": [
                {"role": "user", "content": "eyJabc.def.ghi"},
                {"role": "assistant", "content": "ignored"},
            ]},
        ):
            with self.subTest(payload_type=type(payload).__name__):
                self.assertEqual(self.send(payload).status_code, 400)
        headers = {"Authorization": "Bearer fixture"}
        malformed = self.client.post("/chat", data="{", content_type="application/json", headers=headers)
        oversized = self.client.post("/chat", data="x" * (128 * 1024 + 1), content_type="application/json", headers=headers)
        self.assertEqual(malformed.status_code, 400)
        self.assertEqual(oversized.status_code, 413)
        self.provider.assert_not_called()

    def test_unknown_machine(self):
        self.assertEqual(self.send({"message": "check this", "machine_id": "missing-fixture"}).status_code, 404)
        self.provider.assert_not_called()

    def test_model_failures_are_sanitized(self):
        failures = [
            (httpx.ReadTimeout("private upstream timeout details"), 504),
            (httpx.ConnectError("private transport error"), 502),
            (errors.ClientError(403, {"error": {"message": "provider credential detail"}}), 503),
            (errors.ClientError(404, {"error": {"message": "provider model detail"}}), 503),
            (errors.ClientError(429, {"error": {"message": "provider quota detail"}}), 429),
            (errors.ServerError(500, {"error": {"message": "private upstream error"}}), 502),
        ]
        for failure, status in failures:
            with self.subTest(status=status):
                self.provider.side_effect = failure
                response = self.send()
                self.assertEqual(response.status_code, status)
                self.assertNotRegex(response.get_json()["error"], "private|credential detail|provider")

    def test_missing_key_and_bounded_output(self):
        with patch.dict(os.environ, GEMINI_API_KEY=""):
            self.assertEqual(self.send().status_code, 503)
        self.provider.assert_not_called()
        self.provider.return_value.text = "x" * (chat.MAX_REPLY + 1)
        self.assertEqual(len(self.send().get_json()["reply"]), chat.MAX_REPLY)
        self.provider.return_value.text = None
        self.assertEqual(self.send().status_code, 502)

    def test_rate_limit_is_per_user(self):
        for _ in range(chat.PER_USER_LIMIT):
            self.assertEqual(self.send().status_code, 200)
        response = self.send()
        self.assertEqual(response.status_code, 429)
        self.assertGreater(int(response.headers["Retry-After"]), 0)
        self.assertEqual(self.provider.call_count, chat.PER_USER_LIMIT)
        self.verify.return_value = {"sub": "another-user"}
        self.assertEqual(self.send().status_code, 200)
