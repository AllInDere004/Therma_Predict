import {
  LayoutDashboard,
  Cpu,
  AlertTriangle,
  MessageSquare,
  Activity,
  BellRing
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Devices",
      path: "/devices",
      icon: Cpu,
    },
    {
      name: "Errors",
      path: "/errors",
      icon: AlertTriangle,
    },
    {
      name: "Support",
      path: "/support",
      icon: MessageSquare,
    },
  ];

  return (

    <div className="w-[340px] h-screen bg-gradient-to-b from-white to-[#f5f7ff] border-r border-gray-200 px-7 py-7 flex flex-col justify-between shadow-[4px_0_30px_rgba(15,23,42,0.05)] overflow-y-auto overflow-x-hidden">

      {/* TOP SECTION */}

      <div className="space-y-8">

        {/* LOGO */}

        <div className="px-2">

          <h1 className="text-[40px] font-black text-[#111827] tracking-tight leading-none">
            ThermaPredict
          </h1>

          <p className="text-[12px] tracking-[0.4em] text-gray-400 mt-4 uppercase font-medium">
            Enterprise ML Monitor
          </p>

        </div>


        {/* AI STATUS */}

        <div className="mt-12 bg-[#eef2ff] border border-[#dbe4ff] rounded-[28px] p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                System Status
              </p>

              <h3 className="text-[18px] font-bold text-[#111827] mt-2">
                AI Monitoring Active
              </h3>

            </div>

            <div className="relative">

              <div className="w-4 h-4 rounded-full bg-green-500"></div>

              <div className="absolute inset-0 rounded-full bg-green-400 animate-ping"></div>

            </div>

          </div>


          <div className="mt-5 flex items-center justify-between">

            <div className="flex items-center gap-2 text-[#2563eb]">

              <Activity size={18} />

              <span className="font-semibold text-sm">
                Real-time Analytics
              </span>

            </div>

            <div className="flex items-center gap-2 text-orange-500">

              <BellRing size={16} />

              <span className="text-sm font-medium">
                Live
              </span>

            </div>

          </div>

        </div>


        {/* NAVIGATION */}

        <div className="mt-10 space-y-5 px-1">

          {navItems.map((item, index) => {

            const Icon = item.icon;

            return (

              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>

                  `group flex items-center gap-5 px-5 py-5 rounded-[28px] transition-all duration-300

                  ${isActive
                    ? "bg-blue-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)] scale-[1.02]"
                    : "text-[#64748b] hover:bg-white hover:shadow-md hover:text-[#111827]"
                  }`

                }
              >

                {({ isActive }) => (

                  <>

                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all

                      ${isActive
                        ? "bg-white/20 text-white"
                        : "bg-[#eef2ff] text-[#2563eb] group-hover:bg-blue-100"
                      }`}
                    >

                      <Icon size={24} />

                    </div>


                    <div>

                      <h3 className="font-semibold text-[19px]">
                        {item.name}
                      </h3>

                      <p
                        className={`text-sm mt-1

                        ${isActive
                          ? "text-blue-100"
                          : "text-gray-400"
                        }`}
                      >

                        AI monitoring panel

                      </p>

                    </div>

                  </>

                )}

              </NavLink>

            );

          })}

        </div>

      </div>


      {/* PROFILE SECTION */}

      <div className="mt-12 px-1 pb-2">

        <div className="bg-gradient-to-r from-[#2563eb] to-[#4f46e5] rounded-[36px] p-7 text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)]">

          <div className="flex items-center gap-5">

            <div className="w-20 h-20 rounded-[28px] bg-white/20 border border-white/20 backdrop-blur-lg flex items-center justify-center text-3xl font-bold">

              A

            </div>

            <div>

              <h2 className="text-[24px] font-bold leading-tight">
                Alex Chen
              </h2>

              <p className="text-blue-100 mt-1">
                Systems Administrator
              </p>

            </div>

          </div>


          {/* FOOTER */}

          <div className="mt-6 pt-5 border-t border-white/20 flex items-center justify-between">

            <div>

              <p className="text-blue-100 text-sm">
                Monitoring Nodes
              </p>

              <h3 className="font-bold text-xl mt-1">
                24 Active
              </h3>

            </div>

            <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">
              LIVE
            </div>

          </div>

        </div>

      </div>

    </div>

  );
}

export default Sidebar;