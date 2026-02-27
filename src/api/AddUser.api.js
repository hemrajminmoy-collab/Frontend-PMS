import axios from "axios";

// ✅ Use environment variable from Vite
// Backend runs on 5000
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://pms-backend-main.vercel.app"
).replace(/\/+$/, "");

export const addUser = async ({ username, password, designation }) => {
  try {
    console.log("📥 [Frontend] Sending add user data:", {
      username,
      password,
      designation,
    });

    const response = await axios.post(`${API_BASE_URL}/adduser`, {
      username,
      password,
      role: designation, // map designation → role
    });

    console.log("✅ [Frontend] Add User API Response:", response.data);

    if (response.data?.success) {
      return "success";
    } else {
      return response.data?.message || "error";
    }
  } catch (error) {
    console.error("❌ [Frontend] Add User API Error:", error.message);
    return "error";
  }
};
