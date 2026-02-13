import axios from "axios";

// ✅ Use environment variable from Vite
// Backend runs on 5000
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://backend-pms-three.vercel.app"
).replace(/\/+$/, "");

export const loginUser = async ({ username, password }) => {
  try {
    console.log("📥 [Frontend] Sending login data:", { username, password });

    // ✅ Dynamic backend URL
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username,
      password,
    });

    console.log("✅ [Frontend] Login API Response:", response.data);

    // ✅ Handle backend response
    if (response.data?.success === "error") {
      return "error"; // invalid credentials or server error
    } else {
      return response.data?.success; // e.g. "Admin" or "InputUser"
    }
  } catch (error) {
    console.error("❌ [Frontend] Login API Error:", error.message);
    return "error"; // always return "error" on API failure
  }
};
