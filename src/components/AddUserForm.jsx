import React, { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import { FaUser, FaLock, FaShoppingCart, FaIdBadge, FaChevronDown, FaSignOutAlt } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import loginImg from "../assets/AddUserImg.png";
import { useNavigate } from "react-router-dom";

import { addUser } from "../api/AddUser.api";

export default function AddUser() {
    const navigate = useNavigate();
  // ================= STATES =================
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [designation, setDesignation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inject Google Agu Font
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Agu+Display&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role !== "ADMIN") {
      navigate("/"); // route where <PurchasePage /> is rendered
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("authToken");
    navigate("/", { replace: true });
    window.location.reload();
  };


// ================= HANDLE SUBMIT =================
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const payload = {
//       username,
//       password,
//       designation,
//     };

//     console.log("Add User Payload:", payload);
//     // 👉 Call your API here (e.g., addUser(payload))
//   };



const handleSubmit = async (e) => {
  e.preventDefault();
  if (isSubmitting) return;
  setIsSubmitting(true);
  try {

  const payload = {
    username,
    password,
    designation,
  };

  const result = await addUser(payload);

  if (result === "success") {
    alert("User added successfully"); // waits for OK click

    setUsername("");
    setPassword("");
    setDesignation("");

    // 🔁 Redirect ADMIN back to Purchase Page
    navigate("/purchase"); // change if your route differs
  } else {
    alert(result || "Failed to add user");
  }
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="w-full px-4 py-4 sm:px-8 sm:py-6 lg:px-10 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center bg-transparent">
              {/* Left Section */}
              <div className="flex items-center gap-4">
                <FaShoppingCart className="text-red-600 text-4xl sm:text-5xl shrink-0" />
                <h1
                  className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-wide text-gray-900 leading-tight"
                  style={{ fontFamily: "'Agu Display', sans-serif" }}
                >
                  PURCHASE MANAGEMENT SYSTEM
                </h1>
              </div>
      
              {/* Right User Profile */}
              <button
                onClick={handleLogout}
                className="sm:hidden px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 transition self-end"
              >
                Logout
              </button>
              <div className="relative group hidden sm:block">
                {/* Profile Button */}
                <div className="flex items-center gap-3 cursor-pointer select-none">
                  
                  {/* Flower-style Avatar */}
                  <div className="relative w-11 h-11 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-red-500 opacity-80 blur-[1px]"></div>
                    <div className="relative w-10 h-10 rounded-full bg-red-600 flex items-center justify-center ring-2 ring-red-300 shadow-md">
                      <span className="text-white font-extrabold text-lg uppercase">
                        {localStorage.getItem("username")?.charAt(0)}
                      </span>
                    </div>
                  </div>
      
                  {/* Username (role) */}
                  <span className="font-medium text-gray-800 whitespace-nowrap">
                    {localStorage.getItem("username")}
                    {localStorage.getItem("role") && (
                      <span className="text-sm text-gray-500 ml-1">
                        ({localStorage.getItem("role")})
                      </span>
                    )}
                  </span>
      
                  {/* Triangle */}
                  <FaChevronDown className="text-gray-600 transition-transform group-hover:rotate-180" />
                </div>
      
                {/* Hover Chat Box */}
                <div className="absolute right-0 mt-3 w-44 bg-white rounded-xl shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  
                  {/* Triangle Pointer */}
                  <div className="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 border-l border-t"></div>
      
                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700
                              border border-transparent rounded-xl
                              hover:border-red-600 hover:bg-red-50 hover:text-red-600
                              transition"
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </div>
              </div>
            </nav>

      {/* MAIN CONTENT */}
      <div className="flex items-center justify-center px-4 pb-8 pt-2 sm:p-8 lg:p-10">
        <div className="flex w-full max-w-[1400px] flex-col gap-8 lg:flex-row lg:gap-10">

          {/* LEFT FORM CARD */}
          <div
            className="w-full max-w-xl p-4 sm:p-8 lg:p-10 mx-auto lg:mx-0 flex flex-col justify-center text-center bg-transparent shadow-none"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            <h2 className="text-4xl font-semibold mb-2 text-gray-800">
              Add New User
            </h2>

            <p className="text-md text-gray-600 mb-8">
              Create a new system user
            </p>

            <form onSubmit={handleSubmit}>
              {/* USER NAME */}
              <label className="text-left font-medium text-gray-700 flex items-center gap-2 pl-1 mb-2">
                <FaUser className="text-gray-600" /> User Name
              </label>

              <div className="flex items-center bg-gray-200 rounded-full px-4 py-3 mb-5">
                <input
                  type="text"
                  placeholder="Enter user name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[16px]"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* PASSWORD */}
              <label className="text-left font-medium text-gray-700 flex items-center gap-2 pl-1 mb-2">
                <FaLock className="text-gray-600" /> Password
              </label>

              <div className="flex items-center bg-gray-200 rounded-full px-4 py-3 mb-5">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[16px]"
                  disabled={isSubmitting}
                  required
                />

                <span
                  onClick={() => !isSubmitting && setShowPassword(!showPassword)}
                  className="ml-2 text-gray-600 hover:text-gray-800 cursor-pointer select-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>

              {/* DESIGNATION */}
              <label className="text-left font-medium text-gray-700 flex items-center gap-2 pl-1 mb-2">
                <FaIdBadge className="text-gray-600" /> Designation
              </label>

              <div className="flex items-center bg-gray-200 rounded-full px-4 py-3 mb-6">
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[16px]"
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Select Designation</option>
                  <option value="ADMIN">Admin</option>
                  <option value="DEO">Data Entry Operator (DEO)</option>
                  <option value="PA">Purchase Assistant (PA)</option>
                  <option value="PC">Process Co-Ordinator (PC)</option>
                  <option value="PSE">Purchase Senior Executive(PSE)</option>
                  <option value="PAC">PAC</option>
                  <option value="Store">Store</option>
                </select>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
className="w-full text-white font-medium text-sm sm:text-base py-2 sm:py-3 rounded-full 
           bg-gradient-to-r from-red-500 to-red-700 
           hover:opacity-90 transition disabled:opacity-70 disabled:cursor-not-allowed
           mb-2"

              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ADDING USER...
                  </span>
                ) : (
                  "ADD USER"
                )}
              </button>
            </form>
          </div>

          {/* RIGHT IMAGE */}
          <div className="w-full max-w-[900px] h-[260px] sm:h-[420px] lg:h-[600px] mx-auto flex items-center justify-center">
            <Motion.img
              src={loginImg}
              alt="Add User Illustration"
              className="w-full h-full object-contain rounded-xl"
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
