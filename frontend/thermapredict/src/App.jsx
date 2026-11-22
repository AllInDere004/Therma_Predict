import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";

import AuthCallback from "./auth/AuthCallback";
import AuthProvider from "./auth/AuthProvider";
import { useAuth } from "./auth/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import Errors from "./pages/Errors";
import Support from "./pages/Support";

function ProtectedRoutes() {
  const { session, initializing, recovering } = useAuth();

  if (initializing) return <p role="status" className="p-6">Checking your session...</p>;
  if (!session) return <Navigate to="/" replace />;
  if (recovering) return <Navigate to="/reset-password" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login key="account" />} />
          <Route path="/forgot-password" element={<Login key="request" mode="request" />} />
          <Route path="/reset-password" element={<Login key="update" mode="update" />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/errors" element={<Errors />} />
            <Route path="/support" element={<Support />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
