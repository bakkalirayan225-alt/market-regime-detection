// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login     from "./pages/Login";
import Register  from "./pages/Register";
import Dashboard from "./pages/Dashboard";

// Simple auth guard — replace with your real session/token check
{/*function PrivateRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem("user");
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}*/}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        {/*<Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />*/}

        {/* Protected — all sub-navigation lives inside Dashboard.jsx */}
        <Route
          path="/dashboard"
          element={
          
              <Dashboard />
           
          }
        />

        {/* Catch-all → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
