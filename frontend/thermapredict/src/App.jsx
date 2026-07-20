import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Devices from "./pages/Devices"
import Errors from "./pages/Errors"
import Support from "./pages/Support"

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/devices" element={<Devices />} />

        <Route path="/errors" element={<Errors />} />

        <Route path="/support" element={<Support />} />

      </Routes>

    </BrowserRouter>
  )
}

export default App