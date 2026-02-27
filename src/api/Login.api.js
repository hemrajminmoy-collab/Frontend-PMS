import axios from "axios";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://pms-backend-main.vercel.app"
).replace(/\/+$/, "");

export const loginUser = async ({ username, password }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username,
      password,
    });

    if (response.data?.success === "error") {
      return { success: "error" };
    }

    return {
      success: response.data?.success || "error",
      role: response.data?.role || response.data?.success || "",
      username: response.data?.username || username,
      token: response.data?.token || "",
    };
  } catch (error) {
    console.error("Login API Error:", error.message);
    return { success: "error" };
  }
};
