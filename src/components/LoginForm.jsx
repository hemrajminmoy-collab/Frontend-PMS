import React, { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import { FaUser, FaLock, FaShoppingCart } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
//import { useNavigate } from "react-router-dom";
import loginImg from "../assets/LoginBgImg.png";

import PurchasePage from "../pages/PurchasePage";
import IndentFormPage from "../pages/IndentFormPage";
import { loginUser } from "../api/Login.api";

export default function LoginForm() {
  //const navigate = useNavigate();

  // ✅ Lazy init from localStorage (removes setState-in-effect warning)
  const [role, setRole] = useState(() => localStorage.getItem("role") || "");
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("role"));

  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inject Google Agu Font
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Agu+Display&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);

    try {
      const normalizedUsername = String(username || "").trim();
      const success = await loginUser({ username: normalizedUsername, password });

      const allowedRoles = ["ADMIN", "InputUser", "DEO", "PSE", "PA", "PC", "Store", "PAC"];

      if (allowedRoles.includes(success)) {
        setRole(success);
        setIsLoggedIn(true);

        localStorage.setItem("role", success);
        localStorage.setItem("username", normalizedUsername);
      } else {
        setError("error");
      }
    } catch (err) {
      setError("error");
      console.error("Login failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= PAGE REDIRECT =================
  if (isLoggedIn && role === "DEO") return <IndentFormPage />;
  if (isLoggedIn && ["PSE", "PA", "PC", "Store", "ADMIN" , "PAC"].includes(role)) return <PurchasePage />;

  // ================= LOGIN PAGE =================
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="w-full px-4 py-4 sm:px-8 sm:py-6 lg:px-12 lg:py-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5 bg-transparent">
        <FaShoppingCart className="text-red-600 text-4xl sm:text-5xl lg:text-6xl shrink-0" />
        <h1
          className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-wide text-gray-900 leading-tight"
          style={{ fontFamily: "'Agu Display', sans-serif" }}
        >
          PURCHASE MANAGEMENT SYSTEM
        </h1>
      </nav>

      <div className="flex items-center justify-center px-4 pb-8 pt-2 sm:p-8 lg:p-10">
        <div className="flex w-full max-w-[1400px] flex-col gap-8 lg:flex-row lg:gap-10">
          <div
            className="w-full max-w-xl p-4 sm:p-8 lg:p-10 mx-auto lg:mx-0 flex flex-col justify-center text-center bg-transparent shadow-none"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            <h2 className="text-4xl font-semibold mb-2 text-gray-800">Welcome Back</h2>
            <p className="text-md text-gray-600 mb-8">Sign in to your account</p>

            <form onSubmit={handleSubmit}>
              <label className="text-left font-medium text-gray-700 flex items-center gap-2 pl-1 mb-2">
                <FaUser className="text-gray-600" /> Username
              </label>

              <div className="flex items-center bg-gray-200 rounded-full px-4 py-3 mb-5">
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[16px]"
                  disabled={isSubmitting}
                />
              </div>

              <label className="text-left font-medium text-gray-700 flex items-center gap-2 pl-1 mb-2">
                <FaLock className="text-gray-600" /> Password
              </label>

              <div className="flex items-center bg-gray-200 rounded-full px-4 py-3 mb-5">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[16px]"
                  disabled={isSubmitting}
                />
                <span
                  onClick={() => !isSubmitting && setShowPassword((p) => !p)}
                  className="ml-2 text-gray-600 hover:text-gray-800 cursor-pointer select-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>

              {error && (
                <p className="text-red-600 text-sm mb-4 text-left pl-1">
                  * Incorrect Username or Password
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white font-medium text-sm sm:text-base py-2 sm:py-3 rounded-full 
                          bg-gradient-to-r from-red-500 to-red-700 
                          hover:opacity-90 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    LOGGING IN...
                  </span>
                ) : (
                  "LOGIN"
                )}
              </button>
            </form>

            <p className="text-sm text-gray-500 mt-3 cursor-pointer hover:text-gray-700">
              Forgot Username / Password?
            </p>
          </div>

          <div className="w-full max-w-[900px] h-[260px] sm:h-[420px] lg:h-[600px] mx-auto flex items-center justify-center">
            <Motion.img
              src={loginImg}
              alt="Login Illustration"
              className="w-full h-full object-cover rounded-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
