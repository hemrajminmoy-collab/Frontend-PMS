import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = (
  import.meta.env.VITE_API_URL || "https://backend-pms-three.vercel.app"
).replace(/\/+$/, "");
const DEV_USERNAME = "Minmoy";

export default function EditPasswordPage() {
  const navigate = useNavigate();
  const [targetUsername, setTargetUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const currentUser = localStorage.getItem("username") || "";
  const isDeveloper = currentUser === DEV_USERNAME;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!targetUsername || !newPassword) {
      setStatus("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/auth/edit-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          developerUsername: currentUser,
          targetUsername,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to update password");
      }

      setStatus("Password updated successfully.");
      setTargetUsername("");
      setNewPassword("");
    } catch (err) {
      setStatus(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  if (!isDeveloper) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Access Denied</h1>
          <p className="text-gray-600 mb-6">This page is only accessible for the developer.</p>
          <button
            onClick={() => navigate("/purchase")}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Back to Purchase
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Edit Password</h1>
        <p className="text-sm text-gray-600 mb-6">Developer-only password reset</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Username
            </label>
            <input
              type="text"
              className="w-full border rounded-lg p-2"
              value={targetUsername}
              onChange={(e) => setTargetUsername(e.target.value)}
              placeholder="Username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full border rounded-lg p-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white ${
              loading ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {status && <div className="mt-4 text-sm text-gray-700">{status}</div>}
      </div>
    </div>
  );
}
