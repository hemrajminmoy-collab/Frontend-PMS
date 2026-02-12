// Backend runs on 5000
const API_BASE = import.meta.env.VITE_API_URL || "https://backend-pms-three.vercel.app/";

if (import.meta.env.MODE === "development") {
  console.log("🌐 API_BASE =", API_BASE);
}

/**
 * Generic API request helper (same as your existing pattern)
 */
export async function apiRequest(
  endpoint,
  method = "GET",
  data = null,
  queryParams = ""
) {
  try {
    let url = `${API_BASE}${endpoint}`;

    if (queryParams) {
      url += queryParams.startsWith("?") ? queryParams : `?${queryParams}`;
    }

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data) {
      console.log("📤 Sending Data to Backend:", data);
      options.body = JSON.stringify(data);
    }

    console.log(`🔗 API Request → [${method}] ${url}`);

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ API Request Failed [${method}] ${endpoint}:`,
        errorText
      );
      throw new Error(`HTTP ${response.status} - ${errorText}`);
    }

    if (response.status === 204) {
      console.log("ℹ️ No content returned from API.");
      return null;
    }

    const result = await response.json();
    console.log("✅ API Response:", result);
    return result;
  } catch (error) {
    console.error(`❌ API Error [${method}] ${endpoint}:`, error);
    throw error;
  }
}

export async function createTransportRecords(data) {
  console.log("📝 Creating Transport Records:", data);
  return await apiRequest("/transport/bulk-create", "POST", { data });
}

export async function getAllTransportRecords() {
  console.log("📥 Fetching Transport Records");
  return await apiRequest("/transport", "GET");
}

export async function updateTransportRecords(data) {
  console.log("✏️ Updating Transport Records:", data);
  return await apiRequest("/transport/bulk-update", "PUT", { data });
}