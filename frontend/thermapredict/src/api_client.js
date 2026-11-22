import { supabase } from "./supabase";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function authenticatedRequest(path, options = {}) {
  if (!supabase) throw new Error("Authentication is not configured.");
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw Object.assign(new Error("Please sign in to continue."), { status: 401 });
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", "Bearer " + data.session.access_token);

  const response = await fetch(apiBaseUrl.replace(/\/$/, "") + path, { ...options, headers });
  if (!response.ok) {
    const message = response.status === 401 ? "Your session could not be verified." : "The machine service is unavailable.";
    throw Object.assign(new Error(message), { status: response.status });
  }
  const result = await response.json();
  if (result?.error) throw new Error("The machine service could not complete this request.");
  return result;
}
