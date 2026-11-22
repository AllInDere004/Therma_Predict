import { useEffect, useRef } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Cpu,
  AlertTriangle,
  MessageSquare,
  Activity,
  BellRing
} from "lucide-react";

import { NavLink } from "react-router-dom";

function SidebarContent({ onNavigate }) {

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

    <div className="h-full w-full min-h-0 flex-1 bg-gradient-to-b from-white to-[#f5f7ff] border-r border-gray-200 px-7 py-7 flex flex-col justify-between shadow-[4px_0_30px_rgba(15,23,42,0.05)] overflow-y-auto overflow-x-hidden">

      {/* TOP SECTION */}

      <div className="space-y-8">

        {/* LOGO */}

        <div className="px-2">

          <h1 className="text-[clamp(1.5rem,8vw,2.125rem)] font-black text-[#111827] tracking-tight leading-none">
            ThermaPredict
          </h1>

          <p className="text-[12px] tracking-[0.4em] text-gray-400 mt-4 uppercase font-medium">
            Enterprise ML Monitor
          </p>

        </div>


        {/* AI STATUS */}

        <div className="bg-[#eef2ff] border border-[#dbe4ff] rounded-[28px] p-5 shadow-sm">

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

        <nav aria-label="Main navigation" className="space-y-3 px-1">

          {navItems.map((item, index) => {

            const Icon = item.icon;

            return (

              <NavLink
                key={index}
                to={item.path}
                onClick={onNavigate}
                className={({ isActive }) =>

                  `group flex items-center gap-5 px-4 py-3 rounded-[28px] transition-all duration-300

                  ${isActive
                    ? "bg-blue-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)]"
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

        </nav>

      </div>


      {/* PROFILE SECTION */}

      <div className="mt-8 px-1 pb-2">

        <div className="bg-gradient-to-r from-[#2563eb] to-[#4f46e5] rounded-[36px] p-4 text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)]">

          <div className="flex items-center gap-5">

            <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/20 border border-white/20 backdrop-blur-lg flex items-center justify-center text-3xl font-bold">

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

export default function Sidebar() {
  const drawer = useRef(null);
  const menuButton = useRef(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 80rem)");
    const closeOnDesktop = () => {
      if (desktop.matches) drawer.current?.close();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <>
      <header className="flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-3 py-1 xl:hidden">
        <button
          ref={menuButton}
          type="button"
          aria-label="Open navigation"
          aria-haspopup="dialog"
          aria-controls="mobile-navigation"
          className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eef2ff] text-blue-700"
          onClick={() => drawer.current.showModal()}
        >
          <Menu aria-hidden="true" size={22} />
        </button>
        <span className="font-bold">ThermaPredict</span>
      </header>

      <aside className="hidden min-h-0 w-72 shrink-0 xl:block">
        <SidebarContent />
      </aside>

      <dialog
        ref={drawer}
        id="mobile-navigation"
        aria-label="Main navigation"
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-80 max-w-[calc(100%-1rem)] overflow-hidden bg-white backdrop:bg-slate-900/50"
        onClick={(event) => {
          if (event.target === event.currentTarget) drawer.current.close();
        }}
        onClose={() => {
          if (menuButton.current?.getClientRects().length) menuButton.current.focus();
        }}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex shrink-0 justify-end border-b border-gray-200 p-2">
            <button
              type="button"
              aria-label="Close navigation"
              className="grid size-11 place-items-center rounded-xl bg-[#eef2ff] text-blue-700"
              onClick={() => drawer.current.close()}
            >
              <X aria-hidden="true" size={22} />
            </button>
          </div>
          <SidebarContent onNavigate={() => drawer.current.close()} />
        </div>
      </dialog>
    </>
  );
}