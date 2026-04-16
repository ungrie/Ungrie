import { StrictMode, useState } from "react"; // <-- Import useState
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./Login.jsx";
import LandingApp from "./app/App.tsx";
import Dashboard from "./Dashboard.jsx"; 
import { supabase } from "./supabaseClient";
import "./styles/index.css";
import "./index.css";

function AppRoutes() {
  const navigate = useNavigate();

  // 1. Create a state to hold the user. 
  // It checks localStorage first so it survives page refreshes!
  const [loggedInUser, setLoggedInUser] = useState(() => {
    const savedUser = sessionStorage.getItem("ungrie_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleUserLogin = (userData) => {    
    // 2. Save the user to our state AND to the browser memory
    setLoggedInUser(userData);
    sessionStorage.setItem("ungrie_user", JSON.stringify(userData));
    navigate("/dashboard"); 
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      sessionStorage.removeItem("ungrie_user");
      setLoggedInUser(null); // Clears the React state
      navigate("/login"); 
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Routes>
      <Route path="/" element={<LandingApp />} />
      <Route path="/login" element={<Login onLogin={handleUserLogin} />} />
      
      {/* 3. Pass the loggedInUser down into the Dashboard! */}
      {/* Note: Change 'user' to whatever prop name your Dashboard expects */}
      <Route path="/dashboard" element={<Dashboard user={loggedInUser} onLogout={handleLogout} />} />
    </Routes>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>
);