export async function getMachines() {

  const response = await fetch(
    `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/machines`
  );

  return response.json();

}