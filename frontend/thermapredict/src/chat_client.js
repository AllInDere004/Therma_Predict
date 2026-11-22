import { authenticatedRequest } from "./api_client";

export const MAX_CHAT_MESSAGE = 1600;
export const MAX_CHAT_HISTORY = 8;

export function sendChatMessage(message, history, machineId, signal) {
  return authenticatedRequest("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({ message, history, machine_id: machineId }),
  });
}
