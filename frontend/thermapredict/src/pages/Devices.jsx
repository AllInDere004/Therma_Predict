import Sidebar from "../components/Sidebar";
import { getMachines } from "../machines_client";
import { predictFailure } from "../predict_client";

import { useState, useEffect } from "react";

function Devices() {

  const [machines, setMachines] = useState([]);

  const [selectedMachine, setSelectedMachine] = useState(null);

  const [result, setResult] = useState(null);

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

        }

      } catch (err) {

        console.log(err);

      }
    }

    loadMachines();

  }, []);

  useEffect(() => {

    if (!selectedMachine) return;

    async function fetchPrediction() {

      try {

        const response = await predictFailure({
          payload: selectedMachine,
        });

        setResult(response);

      } catch (err) {

        console.log(err);

      }
    }

    fetchPrediction();

  }, [selectedMachine]);

  const statusColor =
    result?.status === "Critical"
      ? "bg-red-100 text-red-600"
      : result?.status === "Warning"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-green-100 text-green-700";

  if (!selectedMachine) {

    return (
      <div className="flex items-center justify-center h-screen text-3xl font-bold">
        Loading Devices...
      </div>
    );

  }

  return (

    <div className="flex h-screen overflow-hidden bg-[#f5f6fb]">

      <Sidebar />

      <div className="flex-1 px-10 py-8 pb-24 overflow-y-auto">

        {/* TOP BAR */}

        <div className="flex justify-between items-center mb-10">

          <div className="flex gap-10 items-center">

            <button className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-2 text-lg">
              My Devices
            </button>

            <button className="text-gray-400 pb-2 text-lg">
              Profile
            </button>

          </div>

          <div className="flex items-center gap-5">

            <input
              type="text"
              placeholder="Search devices..."
              className="w-[340px] px-6 py-4 rounded-2xl border border-gray-200 bg-white outline-none"
            />

            <div className="text-3xl">
              🔔
            </div>

          </div>

        </div>


        {/* MACHINE SELECTOR */}

        <div className="mb-10">

          <select
            className="bg-white border border-gray-200 rounded-2xl px-6 py-4 text-lg shadow-sm min-w-[280px]"
            onChange={(e) => {

              const selected = machines.find(
                (_, index) => index === Number(e.target.value)
              );

              setSelectedMachine(selected);

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


        {/* FILTERS */}

        <div className="flex justify-between items-center mb-10">

          <div className="flex items-center gap-8 flex-wrap">

            <button className="px-6 py-3 bg-white border border-gray-200 rounded-xl">
              Filters
            </button>

            <div className="text-gray-500 text-lg">
              Type:
              <span className="ml-2 font-semibold text-black">
                All Assets
              </span>
            </div>

            <div className="text-gray-500 text-lg">
              Status:
              <span className="ml-2 font-semibold text-black">
                {result?.status || "Loading"}
              </span>
            </div>

          </div>

          <p className="text-gray-400 text-lg">
            Viewing {machines.length} devices
          </p>

        </div>


        {/* DEVICE CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">

          {machines.slice(0, 4).map((machine, index) => (

            <div
              key={index}
              onClick={() => setSelectedMachine(machine)}
              className="bg-white rounded-3xl border border-gray-200 p-8 min-h-[320px] shadow-sm cursor-pointer hover:shadow-lg transition"
            >

              <div className="flex justify-between items-start mb-10">

                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">
                  ⚙️
                </div>

                <span className={`${statusColor} px-4 py-2 rounded-full text-sm font-semibold`}>

                  {result?.status || "Loading"}

                </span>

              </div>

              <h2 className="text-2xl font-bold break-words leading-tight">

                {machine.Machine_Type}

              </h2>

              <p className="text-gray-400 mt-4 text-lg">
                Installation: {machine.Installation_Year}
              </p>

              <div className="flex justify-between items-start mt-12 gap-8">

                <div>

                  <p className="text-gray-400 text-sm">
                    TEMP
                  </p>

                  <h3 className="text-4xl font-bold mt-3">

                    {machine.Temperature_C}°

                  </h3>

                </div>

                <div>

                  <p className="text-gray-400 text-sm">
                    VIBRATION
                  </p>

                  <p className="font-semibold mt-3 text-lg">

                    {machine.Vibration_mm_s}

                  </p>

                </div>

              </div>

            </div>

          ))}

        </div>


        {/* BOTTOM SECTION */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* LEFT PANEL */}

          <div className="xl:col-span-2 bg-[#f7f7fd] rounded-3xl border border-gray-200 p-10">

            <div className="flex items-start justify-between">

              <div>

                <h2 className="text-5xl font-bold text-[#111827] leading-tight">

                  Device Insight Panel

                </h2>

                <p className="text-gray-400 mt-4 text-xl">

                  Live telemetry for
                  {" "}
                  {selectedMachine.Machine_Type}

                </p>

              </div>

              <div className="text-7xl opacity-10">
                🤖
              </div>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">

              <div className="bg-white rounded-2xl p-8 min-h-[180px]">

                <p className="text-gray-400 text-sm">
                  Internal Temp
                </p>

                <h3 className="text-5xl font-bold mt-5 text-[#0f766e]">

                  {selectedMachine.Temperature_C}°

                </h3>

              </div>


              <div className="bg-white rounded-2xl p-8 min-h-[180px]">

                <p className="text-gray-400 text-sm">
                  Power Usage
                </p>

                <h3 className="text-5xl font-bold mt-5">

                  {selectedMachine.Power_Consumption_kW}kW

                </h3>

              </div>


              <div className="bg-white rounded-2xl p-8 min-h-[180px]">

                <p className="text-gray-400 text-sm">
                  Health Score
                </p>

                <h3 className="text-5xl font-bold mt-5">

                  {result
                    ? `${(100 - result.failure_probability).toFixed(1)}%`
                    : "--"}

                </h3>

              </div>

            </div>


            <button className="mt-12 bg-blue-600 hover:bg-blue-700 transition text-white px-10 py-5 rounded-2xl text-lg font-semibold">

              View Full Analytics →

            </button>

          </div>


          {/* RIGHT PANEL */}

          <div className="bg-[#f7f7fd] rounded-3xl border border-gray-200 p-10">

            <h2 className="text-4xl font-bold mb-10">
              AI Prediction
            </h2>

            <div className="space-y-8">

              <div className="bg-white rounded-2xl p-8 min-h-[160px]">

                <p className="text-gray-400 text-sm">
                  Machine Status
                </p>

                <h3 className="text-3xl font-bold mt-5 leading-tight">

                  {result?.status || "Loading"}

                </h3>

              </div>


              <div className="bg-white rounded-2xl p-8 min-h-[160px]">

                <p className="text-gray-400 text-sm">
                  Failure Probability
                </p>

                <h3 className="text-3xl font-bold mt-5 text-red-500 leading-tight">

                  {result
                    ? `${result.failure_probability}%`
                    : "--"}

                </h3>

              </div>


              <div className="bg-white rounded-2xl p-8 min-h-[160px]">

                <p className="text-gray-400 text-sm">
                  Alert Level
                </p>

                <h3 className="text-3xl font-bold mt-5 text-orange-500 leading-tight">

                  {result?.alert || "Loading"}

                </h3>

              </div>

            </div>


            <button className="w-full mt-12 border border-gray-300 py-5 rounded-2xl font-semibold hover:bg-gray-100 transition text-lg">

              Account Settings

            </button>

          </div>

        </div>

      </div>

    </div>

  );
}

export default Devices;