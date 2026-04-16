import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Customer from "./Customer";

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <Routes>
      <Route path="/customer" element={<Customer />} />
      <Route
        path="/login"
        element={
          user
            ? <Navigate to="/dashboard" replace />
            : <Login onLogin={(userData) => setUser(userData)} />
        }
      />
      <Route
        path="/dashboard"
        element={
          user
            ? <Dashboard user={user} onLogout={() => setUser(null)} />
            : <Navigate to="/login" replace />
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}