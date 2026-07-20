export async function predictFailure({ apiBaseUrl = "http://localhost:5000", payload }) {

  if (!payload) throw new Error("payload is required");

  const res = await fetch(`${apiBaseUrl}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error
      ? String(data.error)
      : `Request failed with status ${res.status}`;

    throw new Error(msg);
  }

  return data;
}