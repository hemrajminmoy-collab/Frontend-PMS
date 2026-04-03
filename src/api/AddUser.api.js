import axios from "axios";

// Use environment variable from Vite
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://pms-backend-main.vercel.app"
).replace(/\/+$/, "");

export const addUser = async ({ username, password, designation }) => {
  try {
    console.log("[Frontend] Sending add user data:", {
      username,
      password,
      designation,
    });

    const authToken =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("authToken") || ""
        : "";
    const actorUsername =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("username") || ""
        : "";
    const actorRole =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("role") || ""
        : "";

    const response = await axios.post(
      `${API_BASE_URL}/adduser`,
      {
        username,
        password,
        role: designation,
      },
      {
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          ...(actorUsername ? { "X-Username": actorUsername } : {}),
          ...(actorRole ? { "X-User-Role": actorRole } : {}),
        },
      },
    );

    console.log("[Frontend] Add User API Response:", response.data);

    if (response.data?.success) {
      return "success";
    }
    return response.data?.message || "error";
  } catch (error) {
    console.error("[Frontend] Add User API Error:", error.message);
    return (
      error?.response?.data?.message ||
      error?.message ||
      "error"
    );
  }
};
