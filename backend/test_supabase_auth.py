"""Exercise Flask's authentication boundary with a local RSA key and test JWKS."""

import json
import time
import unittest
from unittest.mock import patch

import jwt
from cryptography.hazmat.primitives.asymmetric import ec, rsa
from jwt.algorithms import ECAlgorithm, RSAAlgorithm
from jwt.exceptions import PyJWKClientConnectionError

from backend.app import app
from backend.supabase_auth import jwks_client


PROJECT = "https://therma-test.invalid"
ISSUER = f"{PROJECT}/auth/v1"


class SupabaseAuthTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        cls.other_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        cls.jwk = json.loads(RSAAlgorithm.to_jwk(cls.key.public_key()))
        cls.jwk.update(kid="test-key", alg="RS256", use="sig")

    def setUp(self):
        self.client = app.test_client()
        self.config = patch.dict(app.config, SUPABASE_URL=PROJECT)
        self.config.start()
        self.addCleanup(self.config.stop)
        jwks_client.cache_clear()
        self.keys = patch.object(jwks_client(ISSUER), "fetch_data", return_value={"keys": [self.jwk]})
        self.fetch_keys = self.keys.start()
        self.addCleanup(self.keys.stop)
        self.addCleanup(jwks_client.cache_clear)

    def token(self, *, key=None, algorithm="RS256", kid="test-key", **claims):
        payload = {
            "iss": ISSUER,
            "aud": "authenticated",
            "sub": "test-user",
            "role": "authenticated",
            "exp": int(time.time()) + 60,
        }
        payload.update(claims)
        if payload["exp"] is None:
            del payload["exp"]
        return jwt.encode(payload, key or self.key, algorithm=algorithm, headers={"kid": kid})

    def request(self, path, token=None, payload=None):
        headers = {"Authorization": f"Bearer {token}"} if token is not None else {}
        if path == "/predict":
            return self.client.post(path, json=payload or {}, headers=headers)
        return self.client.get(path, headers=headers)

    def test_public_health_and_cors_preflight(self):
        self.assertEqual(self.client.get("/").status_code, 200)
        response = self.client.options("/predict", headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization, content-type",
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn("authorization", response.headers["Access-Control-Allow-Headers"].lower())
        self.fetch_keys.assert_not_called()

    def test_missing_token(self):
        for path in ("/machines", "/predict"):
            with self.subTest(path=path):
                self.assertEqual(self.request(path).status_code, 401)
        self.fetch_keys.assert_not_called()

    def test_invalid_and_expired_tokens(self):
        cases = {
            "malformed": "not-a-jwt",
            "expired": self.token(exp=int(time.time()) - 10),
            "missing expiration": self.token(exp=None),
            "wrong issuer": self.token(iss="https://other.invalid/auth/v1"),
            "wrong audience": self.token(aud="anon"),
            "wrong role": self.token(role="service_role"),
            "anonymous session": self.token(is_anonymous=True),
            "bad signature": self.token(key=self.other_key),
            "unknown kid": self.token(kid="unknown"),
            "symmetric algorithm": self.token(algorithm="HS256", key="test-shared-secret-for-hs256-only"),
        }
        for path in ("/machines", "/predict"):
            for name, token in cases.items():
                with self.subTest(path=path, case=name):
                    response = self.request(path, token)
                    self.assertEqual(response.status_code, 401)
                    self.assertIn("invalid_token", response.headers["WWW-Authenticate"])

    def test_key_service_unavailable(self):
        self.fetch_keys.side_effect = PyJWKClientConnectionError("internal test error")
        response = self.request("/machines", self.token())
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.get_json(), {"error": "Authentication service unavailable"})

    def test_es256_access_token(self):
        key = ec.generate_private_key(ec.SECP256R1())
        jwk = json.loads(ECAlgorithm.to_jwk(key.public_key()))
        jwk.update(kid="ec-key", alg="ES256", use="sig")
        self.fetch_keys.return_value = {"keys": [jwk]}
        token = self.token(key=key, algorithm="ES256", kid="ec-key")
        self.assertEqual(self.request("/machines", token).status_code, 200)

    def test_valid_token_preserves_ml_contract(self):
        token = self.token()
        response = self.request("/machines", token)
        self.assertEqual(response.status_code, 200)
        machines = response.get_json()
        self.assertEqual(len(machines), 100)
        row = machines[0]
        response = self.request("/predict", token, row)
        self.assertEqual(response.status_code, 200)
        prediction = response.get_json()
        self.assertEqual(set(prediction), {"prediction", "failure_probability", "status", "alert"})
        row["Vibration_mm_s"] = row.pop("Vibration_mms")
        self.assertEqual(self.request("/predict", token, row).get_json(), prediction)
