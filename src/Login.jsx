import { useState } from "react";
import { supabase } from "./supabaseClient";
import { MessageSquare, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) return;

    setLoading(true);
    setError(false);

    try {
      // Check Owner table first
      const { data: ownerData, error: ownerError } = await supabase
        .from("Owner")
        .select("id, username, password, name, main_rest")
        .eq("username", username.trim())
        .single();

      if (!ownerError && ownerData && ownerData.password === password) {
        onLogin({
          role: "owner",
          id: ownerData.id,
          name: ownerData.name,
          main_rest: ownerData.main_rest,
        });
        setLoading(false);
        return;
      }

      // Check Staff table
      const { data: staffData, error: staffError } = await supabase
        .from("Staff")
        .select("id, username, password, name, rest_id")
        .eq("username", username.trim())
        .single();

      if (!staffError && staffData && staffData.password === password) {
        onLogin({
          role: "staff",
          id: staffData.id,
          name: staffData.name,
          rest_id: staffData.rest_id,
        });
        setLoading(false);
        return;
      }

      // Neither matched
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } catch (err) {
      console.error("Login error:", err);
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    // 1. UPDATED BACKGROUND: Added a soft sweeping gradient (orange-50 -> white -> stone-100) behind the dots
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-stone-100 flex items-center justify-center px-4 md:px-6 relative overflow-hidden font-sans">
      
      {/* 2. SUBTLE OVERLAY: Keeps the SaaS dot pattern but blends it beautifully with the new gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(#fed7aa_1px,transparent_1px)] [background-size:20px_20px] mix-blend-multiply opacity-60 pointer-events-none" />
      
      {/* Background Ambient Orbs */}
      <div className="absolute top-0 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-orange-400/20 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-red-500/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Login Card */}
      <div
        className={`relative z-10 w-full max-w-[420px] bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] shadow-[0_0_50px_rgba(249,115,22,0.15)] px-8 py-10 sm:px-10 sm:py-12 transition-all duration-300 ${
          shake ? "animate-shake" : ""
        }`}
      >
        {/* Brand Header */}
        <div className="mb-10 text-center flex flex-col items-center">
          {/* 3. UPDATED ICON: Vibrant linear gradient matching the hero text */}
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-orange-500/30">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight mb-2">
            Welcome back
          </h1>
          <p className="text-stone-500 font-medium">
            Sign in to your Ungrie dashboard
          </p>
        </div>

        {/* Username */}
        <div className="mb-5">
          <label className="block text-sm font-bold text-stone-900 mb-2">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(false);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ungrie"
            className="w-full bg-stone-50/50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 text-base outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-stone-400 font-medium"
          />
        </div>

        {/* Password */}
        <div className="mb-6 relative">
          <label className="block text-sm font-bold text-stone-900 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              onKeyDown={handleKeyDown}
              placeholder="••••••••"
              className="w-full bg-stone-50/50 border border-stone-200 text-stone-900 rounded-xl pl-4 pr-12 py-3.5 text-base outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-stone-400 font-medium"
            />
            <button
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-600 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-900">Login Failed</p>
              <p className="text-sm text-red-700 mt-0.5">
                Double-check your credentials and try again.
              </p>
            </div>
          </div>
        )}

        {/* 4. UPDATED BUTTON: Sweeping horizontal gradient for maximum conversion focus */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 active:scale-[0.98] text-white font-bold rounded-xl py-4 transition-all hover:shadow-lg hover:shadow-orange-500/30 flex items-center justify-center gap-2 text-base disabled:opacity-70 disabled:pointer-events-none group"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <p className="text-center text-stone-400 text-sm mt-8 font-medium">
          © {new Date().getFullYear()} Ungrie. All rights reserved.
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-4px); }
          90% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>
    </div>
  );
}