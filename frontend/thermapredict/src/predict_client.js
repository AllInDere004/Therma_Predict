import { authenticatedRequest } from "./api_client";

export async function predictFailure({ payload }) {
  if (!payload) throw new Error("payload is required");

  return authenticatedRequest("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
