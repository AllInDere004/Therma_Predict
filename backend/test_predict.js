// Simple external tester for the Flask backend (no frontend changes)
// Run:
//   node backend/test_predict.js (set SUPABASE_ACCESS_TOKEN to a test user access token)

const API_BASE = "http://127.0.0.1:5000";

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) throw new Error("Set SUPABASE_ACCESS_TOKEN to a test user access token.");

  const payload = {
    Machine_Type: "Pump", // <-- set to a value your machine_type_encoder.pkl supports
    Installation_Year: 2012,
    Temperature_C: 85,
    Vibration_mms: 3.2,
    Sound_dB: 78,
    Oil_Level_pct: 55,
    Coolant_Level_pct: 60,
    Power_Consumption_kW: 12.5,
    Operational_Hours: 2400,
    Last_Maintenance_Days_Ago: 120,
    Maintenance_History_Count: 3,
    Failure_History_Count: 0,
    AI_Supervision: 1,
    Error_Codes_Last_30_Days: 2,
    AI_Override_Events: 0,
  };

  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    console.error("Backend error:", data);
    process.exit(1);
  }

  console.log("Prediction response:", data);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

