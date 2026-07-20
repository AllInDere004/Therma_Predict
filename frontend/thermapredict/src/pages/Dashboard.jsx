import Sidebar from "../components/Sidebar";
import { predictFailure } from "../predict_client";
import { getMachines } from "../machines_client";

import { useState, useEffect } from "react";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


function Dashboard() {

  const [machines, setMachines] = useState([]);

  const [form, setForm] = useState(null);

  const [result, setResult] = useState(null);

  const powerData = form
    ? [
      {
        day: "Mon",
        value: +(form.Power_Consumption_kW * 0.72).toFixed(1),
      },
      {
        day: "Tue",
        value: +(form.Power_Consumption_kW * 0.68).toFixed(1),
      },
      {
        day: "Wed",
        value: +(form.Power_Consumption_kW * 0.83).toFixed(1),
      },
      {
        day: "Thu",
        value: +(form.Power_Consumption_kW * 0.77).toFixed(1),
      },
      {
        day: "Fri",
        value: +(form.Power_Consumption_kW * 0.91).toFixed(1),
      },
    ]
    : [];


  const data = form
    ? [
      {
        time: "00:00",
        zoneA: +(form.Temperature_C * 0.65).toFixed(1),
        zoneB: +(form.Temperature_C * 0.55).toFixed(1),
      },
      {
        time: "06:00",
        zoneA: +(form.Temperature_C * 0.60).toFixed(1),
        zoneB: +(form.Temperature_C * 0.50).toFixed(1),
      },
      {
        time: "12:00",
        zoneA: +(form.Temperature_C * 0.72).toFixed(1),
        zoneB: +(form.Temperature_C * 0.58).toFixed(1),
      },
      {
        time: "18:00",
        zoneA: +(form.Temperature_C * 1.0).toFixed(1),
        zoneB: +(form.Temperature_C * 0.82).toFixed(1),
      },
      {
        time: "23:59",
        zoneA: +(form.Temperature_C * 0.78).toFixed(1),
        zoneB: +(form.Temperature_C * 0.64).toFixed(1),
      },
    ]
    : [];


  const usageData = form
    ? [
      {
        day: "M",
        usage: Math.round(form.Operational_Hours * 0.45),
      },
      {
        day: "T",
        usage: Math.round(form.Operational_Hours * 0.72),
      },
      {
        day: "W",
        usage: Math.round(form.Operational_Hours * 0.58),
      },
      {
        day: "T",
        usage: Math.round(form.Operational_Hours * 0.84),
      },
      {
        day: "F",
        usage: Math.round(form.Operational_Hours * 0.66),
      },
      {
        day: "S",
        usage: Math.round(form.Operational_Hours * 0.39),
      },
      {
        day: "S",
        usage: Math.round(form.Operational_Hours * 0.28),
      },
    ]
    : [];


  useEffect(() => {

    async function loadMachines() {

      try {

        const rows = await getMachines();

        setMachines(rows);

        if (rows.length > 0) {

          setForm(rows[0]);

        }

      } catch (err) {

        console.log(err);

      }
    }

    loadMachines();

  }, []);


  useEffect(() => {

    if (!form) return;

    async function autoPredict() {

      try {

        const response = await predictFailure({
          payload: form,
        });

        setResult(response);

      } catch (err) {

        console.log(err);

      }
    }

    autoPredict();

  }, [form]);


  const statusColor =
    result?.status === "Critical"
      ? "text-red-600"
      : result?.status === "Warning"
        ? "text-yellow-500"
        : "text-green-600";


  if (!form) {

    return (
      <div className="flex items-center justify-center h-screen text-3xl font-bold">
        Loading Dashboard...
      </div>
    );

  }


  return (

    <div className="flex h-screen overflow-hidden bg-[#f5f6fb]">

      <Sidebar />

      <div className="flex-1 px-10 py-8 overflow-y-auto">

        {/* TOP BAR */}

        <div className="flex justify-between items-center mb-10">

          <div className="flex items-center gap-10">

            <h1 className="text-5xl font-bold text-[#111827]">
              ThermaPredict
            </h1>

            <input
              type="text"
              placeholder="Search devices..."
              className="w-[340px] px-6 py-4 rounded-2xl border border-[#dfe3f0] bg-[#f2f4fb] outline-none"
            />

          </div>

          <div className="text-2xl">
            🔔
          </div>

        </div>


        {/* MACHINE SELECTOR */}

        <div className="mb-8">

          <select
            className="bg-white border border-gray-200 rounded-2xl px-6 py-4 text-lg shadow-sm"
            onChange={(e) => {

              const selected = machines.find(
                (_, index) => index === Number(e.target.value)
              );

              setForm(selected);

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


        {/* TOP CARDS */}

        <div className="grid grid-cols-4 gap-8 mb-10">

          {/* FAILURE */}

          <div className="bg-white rounded-[28px] border border-gray-200 p-10 min-h-[210px]">

            <p className="text-gray-400 tracking-widest text-sm">
              FAILURE PROBABILITY
            </p>

            <h2 className="text-4xl font-bold mt-6 break-words">

              {result
                ? `${result.failure_probability}%`
                : "--"}

            </h2>

            <p className="text-green-500 mt-6">
              Real-time ML prediction
            </p>

          </div>


          {/* ALERTS */}

          <div className="bg-white rounded-[28px] border border-gray-200 p-10 min-h-[210px]">

            <p className="text-gray-400 tracking-widest text-sm">
              ACTIVE ALERTS
            </p>

            <h2 className="text-3xl font-bold mt-6 text-red-500 break-words">

              {result?.alert || "No Alerts"}

            </h2>

            <p className="text-red-500 mt-6">
              AI maintenance monitoring
            </p>

          </div>


          {/* HEALTH */}

          <div className="bg-white rounded-[28px] border border-gray-200 p-10 min-h-[210px]">

            <p className="text-gray-400 tracking-widest text-sm">
              HEALTH SCORE
            </p>

            <h2 className="text-4xl font-bold mt-6 break-words">

              {result
                ? `${(100 - result.failure_probability).toFixed(1)}%`
                : "--"}

            </h2>

            <div className="w-full h-3 bg-gray-100 rounded-full mt-8">

              <div
                className="bg-green-600 h-3 rounded-full"
                style={{
                  width: result
                    ? `${100 - result.failure_probability}%`
                    : "0%"
                }}
              ></div>

            </div>

          </div>


          {/* STATUS */}

          <div className="bg-white rounded-[28px] border border-gray-200 p-10 min-h-[210px]">

            <p className="text-gray-400 tracking-widest text-sm">
              MACHINE STATUS
            </p>

            <h2 className={`text-3xl font-bold mt-6 break-words ${statusColor}`}>

              {result?.status || "Waiting"}

            </h2>

          </div>

        </div>


        {/* RESULT SECTION */}

        {result && (

          <div className="bg-white rounded-3xl p-10 border border-gray-200 mb-10">

            <h2 className="text-3xl font-bold mb-8">
              Prediction Result
            </h2>

            <div className="grid grid-cols-3 gap-8">

              <div className="bg-blue-50 p-8 rounded-2xl">

                <p className="text-gray-500">
                  Failure Probability
                </p>

                <h3 className="text-4xl font-bold mt-4 text-blue-600">

                  {result.failure_probability}%

                </h3>

              </div>


              <div className="bg-yellow-50 p-8 rounded-2xl">

                <p className="text-gray-500">
                  Machine Status
                </p>

                <h3 className={`text-4xl font-bold mt-4 ${statusColor}`}>

                  {result.status}

                </h3>

              </div>


              <div className="bg-red-50 p-8 rounded-2xl">

                <p className="text-gray-500">
                  Alert Level
                </p>

                <h3 className="text-4xl font-bold mt-4 text-red-600">

                  {result.alert}

                </h3>

              </div>

            </div>

          </div>

        )}


        {/* GRAPH SECTION */}

        <div className="grid grid-cols-3 gap-8 mb-10">

          {/* POWER */}

          <div className="col-span-2 bg-white rounded-[28px] p-10 border border-gray-200">

            <div className="flex justify-between items-center mb-8">

              <div>

                <p className="text-gray-400 uppercase tracking-widest text-sm">
                  Weekly Analytics
                </p>

                <h2 className="text-4xl font-bold mt-2">
                  Power Consumption
                </h2>

              </div>

              <div className="text-right">

                <h3 className="text-3xl font-bold mt-2">
                  {form?.Power_Consumption_kW} kW
                </h3>

              </div>

            </div>

            <ResponsiveContainer width="100%" height={320}>

              <AreaChart data={powerData}>

                <defs>

                  <linearGradient
                    id="colorPower"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="5%"
                      stopColor="#2563eb"
                      stopOpacity={0.8}
                    />

                    <stop
                      offset="95%"
                      stopColor="#2563eb"
                      stopOpacity={0}
                    />

                  </linearGradient>

                </defs>

                <XAxis dataKey="day" />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  fillOpacity={1}
                  fill="url(#colorPower)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>


          {/* TEMPERATURE */}

          <div className="bg-white rounded-[28px] p-10 border border-gray-200">

            <div className="flex justify-between items-center mb-8">

              <div>

                <p className="text-gray-400 uppercase tracking-widest text-sm">
                  LIVE SENSOR
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  Temperature
                </h2>

              </div>

              <h3 className="text-4xl font-bold text-red-500">

                {form?.Temperature_C}°

              </h3>

            </div>

            <ResponsiveContainer width="100%" height={320}>

              <LineChart data={data}>

                <XAxis dataKey="time" />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="zoneA"
                  stroke="#ef4444"
                  strokeWidth={4}
                />

                <Line
                  type="monotone"
                  dataKey="zoneB"
                  stroke="#3b82f6"
                  strokeWidth={4}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* SECOND ROW */}

        <div className="grid grid-cols-2 gap-8 mb-10">

          {/* OPERATIONAL */}

          <div className="bg-white rounded-[28px] p-10 border border-gray-200">

            <div className="flex justify-between items-center mb-8">

              <div>

                <p className="text-gray-400 uppercase tracking-widest text-sm">
                  Machine Usage
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  Operational Hours
                </h2>

              </div>

              <h3 className="text-4xl font-bold">

                {form?.Operational_Hours}

              </h3>

            </div>

            <ResponsiveContainer width="100%" height={320}>

              <BarChart data={usageData}>

                <XAxis dataKey="day" />

                <Tooltip />

                <Bar
                  dataKey="usage"
                  fill="#10b981"
                  radius={[10, 10, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>


          {/* DETAILS */}

          <div className="bg-white rounded-[28px] p-10 border border-gray-200">

            <p className="text-gray-400 uppercase tracking-widest text-sm mb-8">
              Machine Details
            </p>

            <div className="space-y-7">

              <div className="flex justify-between">
                <span>Machine Type</span>
                <span>{form?.Machine_Type}</span>
              </div>

              <div className="flex justify-between">
                <span>Installation Year</span>
                <span>{form?.Installation_Year}</span>
              </div>

              <div className="flex justify-between">
                <span>Vibration</span>
                <span>{form?.Vibration_mms || form?.Vibration_mm_s}</span>
              </div>

              <div className="flex justify-between">
                <span>Sound</span>
                <span>{form?.Sound_dB} dB</span>
              </div>

              <div className="flex justify-between">
                <span>Oil Level</span>
                <span>{form?.Oil_Level_pct}%</span>
              </div>

              <div className="flex justify-between">
                <span>Coolant</span>
                <span>{form?.Coolant_Level_pct}%</span>
              </div>

            </div>

          </div>

        </div>


        {/* ML CONFIDENCE */}

        <div className="bg-blue-700 text-white rounded-[28px] p-10 mb-10">

          <p className="uppercase tracking-widest text-sm">
            ML Prediction Confidence
          </p>

          <h2 className="text-6xl font-bold mt-8">

            {result
              ? `${result.failure_probability}%`
              : "--"}

          </h2>

          <div className="w-full h-3 bg-blue-500 rounded-full mt-10">

            <div
              className="bg-white h-3 rounded-full"
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
  );
}

export default Dashboard;