import Sidebar from "./Sidebar";

export default function PageShell({ children }) {
  return (
    <div className="flex h-screen h-dvh min-h-0 min-w-0 flex-col bg-[#f5f6fb] xl:flex-row">
      <Sidebar />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
