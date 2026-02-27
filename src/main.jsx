import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./index.css";
import App from "./App.jsx";

const getClientSystemName = () => {
  if (typeof navigator === "undefined") return "";
  const platform = navigator.userAgentData?.platform || navigator.platform || "Unknown";
  const userAgent = navigator.userAgent || "";
  return `${platform} | ${userAgent}`.slice(0, 250);
};

const withClientHeaders = (headers = {}) => {
  const nextHeaders = { ...headers };

  const systemName = getClientSystemName();
  if (systemName && !nextHeaders["X-System-Name"]) {
    nextHeaders["X-System-Name"] = systemName;
  }

  if (typeof window !== "undefined" && window.localStorage) {
    const username = localStorage.getItem("username") || "";
    const role = localStorage.getItem("role") || "";
    const authToken = localStorage.getItem("authToken") || "";
    if (username && !nextHeaders["X-Username"]) nextHeaders["X-Username"] = username;
    if (role && !nextHeaders["X-User-Role"]) nextHeaders["X-User-Role"] = role;
    if (authToken && !nextHeaders.Authorization) {
      nextHeaders.Authorization = `Bearer ${authToken}`;
    }
  }

  return nextHeaders;
};

axios.interceptors.request.use((config) => {
  config.headers = withClientHeaders(config.headers || {});
  return config;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
