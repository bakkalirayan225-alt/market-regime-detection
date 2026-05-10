// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MarketProvider } from "./pages/MarketContext";
import Login        from "./pages/Login";
import Register     from "./pages/Register";
import MarketSelect from "./pages/MarketSelect";
import Dashboard    from "./pages/Dashboard";
import ProtectedRoute from "./pages/ProtectedRoute";

export default function App() {
  return (
    <MarketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/market-select"  element={
            <ProtectedRoute>
              <MarketSelect />
            </ProtectedRoute>} />
          <Route path="/dashboard"      element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>} />
          <Route path="*"               element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </MarketProvider>
  );
}
