import { authenticatedRequest } from "./api_client";

export function getMachines() {
  return authenticatedRequest("/machines");
}
