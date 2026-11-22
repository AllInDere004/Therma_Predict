import PageShell from "../components/PageShell";

import { useState, useEffect } from "react";

import { predictFailure } from "../predict_client";
import { getMachines } from "../machines_client";

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { name: "Mon", value: 12 },
  { name: "Tue", value: 18 },
  { name: "Wed", value: 9 },
  { name: "Thu", value: 22 },
  { name: "Fri", value: 15 },
];

function Errors() {

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  const [machines, setMachines] = useState([]);

  const [errorData, setErrorData] = useState(null);

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

          setErrorData(cleanedRows[0]);

        }

      } catch (err) {

        console.log(err);

      }
    }

    loadMachines();

  }, []);

  useEffect(() => {

    if (!errorData) return;

    async function fetchPrediction() {

      try {

        setLoading(true);

        const response = await predictFailure({
          payload: errorData,
        });

        setResult(response);

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);

      }
    }

    fetchPrediction();

  }, [errorData]);

  const statusColor =
    result?.status === "Critical"
      ? "text-red-600"
      : result?.status === "Warning"
      ? "text-yellow-500"
      : "text-green-600";

  if (loading && !result) {

    return (
      <div className="flex items-center justify-center min-h-dvh px-4 text-center text-2xl font-bold">
        Loading Errors...
      </div>
    );

  }

  return (

    <PageShell>
      <div className="min-w-0 px-4 py-5 sm:px-6 sm:py-8 2xl:px-10">

        {/* TOP */}

        <div className="flex flex-col xl:flex-row justify-between xl:items-start gap-4 sm:gap-6 mb-12">

          <div>

            <h1 className="text-3xl sm:text-5xl font-bold text-[#111827] leading-tight">

              System Health & Error Impact

            </h1>

            <p className="text-gray-400 text-lg mt-4">
              Real-time AI-based anomaly monitoring
            </p>

          </div>


          {/* MACHINE SELECTOR */}

          <div className="flex items-center gap-5 flex-wrap mt-4">

            <select
              className="bg-white border border-gray-200 rounded-2xl px-6 py-4 text-lg shadow-sm w-full max-w-sm min-h-12"
              onChange={(e) => {

                const selected = machines.find(
                  (_, index) => index === Number(e.target.value)
                );

                setErrorData(selected);

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

        </div>


        {/* FILTER */}

        <div className="bg-white rounded-[32px] border border-gray-200 px-4 sm:px-6 py-7 mb-12 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">

          <div className="flex flex-wrap items-center gap-2 sm:gap-4">

            <button className="bg-[#edf4ff] text-[#2563eb] px-8 py-4 rounded-2xl font-semibold">
              All
            </button>

            <button className="text-red-500 px-5 py-3 text-lg">
              Critical
            </button>

            <button className="text-yellow-500 px-5 py-3 text-lg">
              Warning
            </button>

            <button className="text-green-500 px-5 py-3 text-lg">
              Stable
            </button>

          </div>

        </div>


        {/* MAIN CARD */}

        <div className="bg-[#f7f7fd] rounded-[36px] border border-gray-200 overflow-hidden mb-12 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">

          {/* HEADER */}

          <div className="bg-white px-4 sm:px-6 py-10 flex flex-col xl:flex-row justify-between xl:items-start gap-4 sm:gap-6 border-b border-gray-200">

            <div className="flex min-w-0 items-center gap-3 sm:gap-6">

              <div className="size-10 shrink-0 sm:size-16 rounded-3xl bg-red-100 flex items-center justify-center text-3xl sm:text-4xl">
                ❗
              </div>

              <div>

                <p className={`font-semibold text-xl ${statusColor}`}>
                  {result?.status || "Loading"} Alert
                </p>

                <h2 className="min-w-0 wrap-anywhere text-xl sm:text-3xl font-bold mt-3 leading-tight">
                  ERR_DYNAMIC_AI_01
                </h2>

                <p className="text-gray-500 mt-4 text-xl">
                  {errorData?.Machine_Type}
                </p>

              </div>

            </div>


            <div className="flex flex-wrap items-start gap-4 sm:gap-8">

              <div>

                <p className="text-gray-400 text-sm uppercase tracking-wide">
                  Failure Probability
                </p>

                <p className="font-bold text-4xl mt-4">

                  {result
                    ? `${result.failure_probability}%`
                    : "--"}

                </p>

              </div>


              <div>

                <p className="text-gray-400 text-sm uppercase tracking-wide">
                  Predicted Impact
                </p>

                <div className="flex items-center gap-5 mt-5">

                  <div className="w-24 sm:w-40 h-5 bg-red-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-red-600 rounded-full"
                      style={{
                        width: result
                          ? `${result.failure_probability}%`
                          : "0%"
                      }}
                    ></div>

                  </div>

                  <span className={`font-bold text-xl ${statusColor}`}>
                    {result?.status || "Loading"}
                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* CONTENT */}

          <div className="grid grid-cols-1 2xl:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">

            {/* SENSOR */}

            <div>

              <h3 className="text-3xl font-bold mb-7">
                SENSOR TRIGGER
              </h3>

              <div className="bg-white rounded-[32px] p-4 sm:p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] min-h-[200px]">

                <p className="text-red-500 text-4xl sm:text-5xl font-bold">
                  {errorData?.Temperature_C}°C
                </p>

                <p className="text-gray-500 mt-5 text-xl">
                  Threshold: 85°C
                </p>

                <div className="mt-12">

                  <p className="text-sm text-gray-400 mb-4">
                    ML Confidence Score
                  </p>

                  <div className="w-full h-5 bg-green-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-[#0f766e] rounded-full"
                      style={{
                        width: result
                          ? `${result.failure_probability}%`
                          : "0%"
                      }}
                    ></div>

                  </div>

                  <p className="text-[#0f766e] font-bold text-3xl mt-5">

                    {result
                      ? `${result.failure_probability}%`
                      : "--"}

                  </p>

                </div>

              </div>

            </div>


            {/* TIMELINE */}

            <div>

              <h3 className="text-3xl font-bold mb-7">
                IMPACT TIMELINE
              </h3>

              <div className="space-y-7">

                <div className="flex items-center gap-6 bg-white rounded-3xl p-4 sm:p-5 min-h-[100px]">

                  <div className="w-6 h-6 rounded-full bg-orange-700"></div>

                  <p className="font-medium text-xl">
                    +15m: Efficiency drop 20%
                  </p>

                </div>

                <div className="flex items-center gap-6 bg-white rounded-3xl p-4 sm:p-5 min-h-[100px]">

                  <div className="w-6 h-6 rounded-full bg-orange-400"></div>

                  <p className="font-medium text-xl">
                    +2h: Bearing failure
                  </p>

                </div>

                <div className="flex items-center gap-6 bg-white rounded-3xl p-4 sm:p-5 min-h-[100px]">

                  <div className="w-6 h-6 rounded-full bg-red-600"></div>

                  <p className="text-red-600 font-semibold text-xl">
                    +6h: Complete system shutdown
                  </p>

                </div>

              </div>

            </div>


            {/* ACTIONS */}

            <div>

              <h3 className="text-3xl font-bold mb-7">
                SUGGESTED ACTIONS
              </h3>

              <div className="space-y-7">

                <div className="bg-white rounded-[32px] p-4 sm:p-5 min-h-[140px]">

                  <h4 className="font-semibold text-2xl">
                    Initiate Emergency Coolant
                  </h4>

                  <p className="text-gray-400 mt-4 text-lg">
                    Immediate impact reduction
                  </p>

                </div>

                <div className="bg-white rounded-[32px] p-4 sm:p-5 min-h-[140px]">

                  <h4 className="font-semibold text-2xl">
                    Dispatch On-site Tech
                  </h4>

                  <p className="text-gray-400 mt-4 text-lg">
                    Estimated arrival: 45m
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* GRAPH */}

        <div className="bg-white rounded-[36px] border border-gray-200 p-4 sm:p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">

          <h2 className="text-3xl sm:text-4xl font-bold">
            Maintenance Foresight
          </h2>

          <p className="text-gray-400 text-xl mt-4">
            Weekly predictive maintenance analytics
          </p>

          <div className="h-[260px] sm:h-[340px] mt-12 rounded-3xl bg-[#f8f9fd] p-4 sm:p-6">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart data={data}>

                <XAxis dataKey="name" tick={{ fontSize: 12 }} minTickGap={12} />

                <Tooltip />

                <Bar
                  dataKey="value"
                  fill="#2563eb"
                  radius={[14,14,0,0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

    </PageShell>

  );
}

export default Errors;