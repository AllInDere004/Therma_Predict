import Sidebar from "../components/Sidebar";

import { useState, useEffect } from "react";

import { predictFailure } from "../predict_client";
import { getMachines } from "../machines_client";

function Support() {

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  const [machines, setMachines] = useState([]);

  const [selectedMachine, setSelectedMachine] = useState(null);

  const [supportData, setSupportData] = useState(null);

  useEffect(() => {

    async function loadMachines() {

      try {

        const rows = await getMachines();

        const cleanedRows = rows.map((machine) => {

          const cleanedMachine = {};

          Object.keys(machine).forEach((key) => {

            cleanedMachine[key] =
              machine[key] === null ||
              machine[key] === undefined ||
              Number.isNaN(machine[key])
                ? 0
                : machine[key];

          });

          return cleanedMachine;

        });

        setMachines(cleanedRows);

        if (cleanedRows.length > 0) {

          setSelectedMachine(cleanedRows[0]);

          setSupportData(cleanedRows[0]);

        }

      } catch (err) {

        console.log(err);

      }
    }

    loadMachines();

  }, []);


  useEffect(() => {

    if (!supportData) return;

    async function fetchPrediction() {

      try {

        setLoading(true);

        const response = await predictFailure({
          payload: supportData,
        });

        setResult(response);

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);

      }
    }

    fetchPrediction();

  }, [supportData]);


  const statusColor =
    result?.status === "Critical"
      ? "text-red-600"
      : result?.status === "Warning"
      ? "text-yellow-500"
      : "text-green-600";


  const badgeColor =
    result?.status === "Critical"
      ? "bg-red-100 text-red-600"
      : result?.status === "Warning"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-green-100 text-green-700";


  const maintenanceAlert =
    result?.failure_probability >= 70
      ? "⚠ Immediate maintenance required"
      : result?.failure_probability >= 40
      ? "🛠 Schedule maintenance soon"
      : "✅ Machine operating normally";


  if (loading && !result) {

    return (
      <div className="flex items-center justify-center h-screen text-3xl font-bold">
        Loading Support...
      </div>
    );

  }


  return (

    <div className="flex h-screen bg-[#f5f6fb] overflow-hidden">

      {/* SIDEBAR */}

      <Sidebar />


      {/* CONVERSATION PANEL */}

      <div className="w-[420px] bg-[#f7f7fd] border-r border-gray-200 px-8 py-10 flex flex-col overflow-y-auto gap-6">

        <h2 className="text-[40px] font-bold text-[#111827]">
          Conversations
        </h2>

        <input
          type="text"
          placeholder="Search history..."
          className="mt-2 w-full min-h-[64px] rounded-2xl border border-gray-200 bg-white px-6 text-lg outline-none"
        />


        {/* ACTIVE CARD */}

        <div className="bg-white rounded-[36px] p-8 border border-gray-200 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">

          <div className="flex justify-between items-center gap-4">

            <span className={`text-sm font-bold ${statusColor}`}>
              {result?.status || "ACTIVE"}
            </span>

            <span className="text-gray-400 text-sm">
              Live ML
            </span>

          </div>

          <h3 className="text-[32px] font-bold mt-5 leading-[1.2] break-words">
            {supportData?.Machine_Type} Thermal Analysis
          </h3>

          <p className="text-gray-400 mt-5 leading-[1.8] text-lg">

            ML detected
            {" "}

            {result
              ? `${result.failure_probability}%`
              : "--"}

            {" "}
            failure probability.

          </p>

        </div>


        {/* ARCHIVE */}

        <div className="space-y-10 pt-2">

          <div className="bg-white rounded-[32px] p-6 border border-gray-200">

            <div className="flex justify-between items-center">

              <span className="text-gray-400 text-sm font-bold">
                ARCHIVED
              </span>

              <span className="text-gray-400 text-sm">
                Yesterday
              </span>

            </div>

            <h3 className="text-[26px] mt-5 font-semibold leading-[1.4]">
              Weekly Maintenance Report
            </h3>

          </div>

          <div className="bg-white rounded-[32px] p-6 border border-gray-200">

            <div className="flex justify-between items-center">

              <span className="text-gray-400 text-sm font-bold">
                ARCHIVED
              </span>

              <span className="text-gray-400 text-sm">
                Mar 12
              </span>

            </div>

            <h3 className="text-[26px] mt-5 font-semibold leading-[1.4]">
              Industrial Oven Calibration
            </h3>

          </div>

        </div>


        {/* MACHINE SELECTOR */}

        <div className="pt-2">

          <select
            className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-5 text-lg shadow-sm min-h-[68px]"
            onChange={(e) => {

              const selected = machines.find(
                (_, index) => index === Number(e.target.value)
              );

              setSelectedMachine(selected);

              setSupportData(selected);

            }}
          >

            {machines.map((machine, index) => (

              <option
                key={index}
                value={index}
              >

                {machine.Machine_Type}
                {" "}
                #{index + 1}

              </option>

            ))}

          </select>

        </div>


        <button className="mt-2 border-2 border-dashed border-gray-300 min-h-[96px] rounded-[36px] text-[28px] font-semibold hover:bg-gray-100 transition">
          + New Conversation
        </button>

      </div>


      {/* CHAT AREA */}

      <div className="flex-1 flex flex-col bg-[#f7f7fd]">


        {/* TOP BAR */}

        <div className="min-h-[110px] bg-white border-b border-gray-200 px-16 py-6 flex flex-wrap items-center justify-between gap-6">

          <div className="flex items-center gap-6">

            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl">
              🤖
            </div>

            <div>

              <h2 className="text-[32px] font-bold">
                ThermaBot
              </h2>

              <p className="text-green-600 text-sm font-semibold mt-1">
                ● AI SYSTEM ONLINE
              </p>

            </div>

          </div>

          <button className="bg-[#fff4eb] border border-[#f3d8bf] px-8 py-4 rounded-2xl text-[20px] font-semibold min-h-[62px]">
            🎧 Connect to Human
          </button>

        </div>


        {/* CENTER */}

        <div className="flex-1 overflow-auto px-20 py-16 pb-32">

          <div className="flex flex-col items-center">

            <div className="w-[130px] h-[130px] rounded-[42px] bg-[#eef2ff] flex items-center justify-center text-6xl">
              🤖
            </div>

            <h1 className="text-[64px] font-bold mt-12 text-[#111827] text-center leading-[1.1]">
              How can I help today?
            </h1>

            <p className="text-gray-400 text-center text-[26px] leading-[1.7] mt-8 max-w-[1050px]">

              Real-time predictive AI support powered by
              ThermaPredict ML monitoring engine.

            </p>


            {/* ACTION BUTTONS */}

            <div className="flex flex-wrap justify-center gap-8 mt-16">

              <button className="min-h-[82px] px-12 py-5 rounded-full bg-white border border-gray-200 text-[22px] shadow-sm flex items-center justify-center">
                ⚠ {result?.status || "Loading"} Alerts
              </button>

              <button className="min-h-[82px] px-12 py-5 rounded-full bg-white border border-gray-200 text-[22px] shadow-sm flex items-center justify-center">
                🌡 Temp: {supportData?.Temperature_C}°C
              </button>

              <button className="min-h-[82px] px-12 py-5 rounded-full bg-white border border-gray-200 text-[22px] shadow-sm flex items-center justify-center">
                📊 ML Risk:
                {" "}
                {result
                  ? `${result.failure_probability}%`
                  : "--"}
              </button>

            </div>

          </div>


          {/* MESSAGE */}

          <div className="mt-24 max-w-[1350px] mx-auto space-y-8">

            <div className="bg-[#eef2ff] rounded-[40px] p-12">

              <p className="text-[28px] leading-[1.9]">

                I've analyzed the recent thermal spikes in the

                <span className="text-blue-600 font-bold">
                  {" "}
                  {supportData?.Machine_Type}
                </span>.

                Current ML engine predicts

                <span className={`font-bold ${statusColor}`}>
                  {" "}
                  {result
                    ? `${result.failure_probability}%`
                    : "--"}
                </span>

                {" "}
                failure probability based on thermal,
                vibration and operational history.

              </p>

            </div>


            {/* ALERT CARD */}

            <div className="bg-white rounded-[40px] border border-gray-200 p-12 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">

              <div className="flex flex-wrap justify-between items-center gap-8">

                <div>

                  <p className="text-gray-400 text-sm uppercase tracking-wide">
                    Maintenance Alert
                  </p>

                  <h2 className={`text-[36px] font-bold mt-5 leading-[1.3] ${statusColor}`}>

                    {maintenanceAlert}

                  </h2>

                </div>

                <div className="text-7xl">
                  🚨
                </div>

              </div>

            </div>


            {/* ANALYTICS CARD */}

            <div className="bg-white rounded-[40px] border border-gray-200 p-12 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">

              <div className="flex flex-wrap justify-between items-center gap-6">

                <h2 className="text-[36px] font-bold leading-[1.2] break-words">
                  {supportData?.Machine_Type}
                </h2>

                <span className={`${badgeColor} px-6 py-3 rounded-xl font-bold text-lg`}>
                  {result?.status || "Loading"}
                </span>

              </div>


              {/* SENSOR GRID */}

              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-10 mt-14">

                <div className="bg-[#f8f9fd] rounded-[32px] p-10 min-h-[220px] flex flex-col justify-between">

                  <p className="text-gray-400 text-sm">
                    Temperature
                  </p>

                  <h3 className="text-5xl font-bold mt-5 text-red-500 break-words">
                    {supportData?.Temperature_C}°
                  </h3>

                </div>

                <div className="bg-[#f8f9fd] rounded-[32px] p-10 min-h-[220px] flex flex-col justify-between">

                  <p className="text-gray-400 text-sm">
                    Vibration
                  </p>

                  <h3 className="text-5xl font-bold mt-5 break-words">
                    {supportData?.Vibration_mms || supportData?.Vibration_mm_s || "0"}                  
                  </h3>

                </div>

                <div className="bg-[#f8f9fd] rounded-[32px] p-10 min-h-[220px] flex flex-col justify-between">

                  <p className="text-gray-400 text-sm">
                    Sound
                  </p>

                  <h3 className="text-5xl font-bold mt-5 break-words">
                    {supportData?.Sound_dB} dB
                  </h3>

                </div>

                <div className="bg-[#f8f9fd] rounded-[32px] p-10 min-h-[220px] flex flex-col justify-between">

                  <p className="text-gray-400 text-sm">
                    Power
                  </p>

                  <h3 className="text-5xl font-bold mt-5 break-words">
                    {supportData?.Power_Consumption_kW}kW
                  </h3>

                </div>

              </div>


              {/* PROBABILITY */}

              <div className="mt-14">

                <div className="flex justify-between items-center mb-5 gap-6 flex-wrap">

                  <span className="text-gray-500 text-lg">
                    Failure Probability
                  </span>

                  <span className={`font-bold text-xl ${statusColor}`}>

                    {result
                      ? `${result.failure_probability}%`
                      : "--"}

                  </span>

                </div>

                <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: result
                        ? `${result.failure_probability}%`
                        : "0%"
                    }}
                  ></div>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* INPUT */}

        <div className="px-16 pb-14 pt-6">

          <div className="bg-white rounded-[40px] border border-gray-200 min-h-[140px] px-12 py-6 flex items-center gap-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">

            <input
              type="text"
              placeholder="Message ThermaBot..."
              className="flex-1 text-[28px] outline-none"
            />

            <button className="w-[78px] h-[78px] rounded-2xl bg-blue-600 text-white text-3xl flex items-center justify-center">
              ➤
            </button>

          </div>

        </div>

      </div>

    </div>

  );
}

export default Support;