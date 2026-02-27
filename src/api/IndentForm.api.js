// ==============================
// 🌐 API Base URL Setup
// ==============================

import axios from "axios";

// ✅ IMPORTANT
// Backend runs on 5000 and all purchase/indent routes are mounted at `/indent`
// in BackEnd/server.js (app.use('/indent', purchaseRoutes)).
//
// If you set VITE_API_URL, set it to the backend ORIGIN only, e.g.:
//   VITE_API_URL=https://pms-backend-main.vercel.app
const API_ORIGIN = (
  import.meta.env.VITE_API_URL || "https://pms-backend-main.vercel.app"
).replace(/\/+$/, "");
const API_BASE = `${API_ORIGIN}/indent`;

const getClientSystemName = () => {
  if (typeof navigator === "undefined") return "";
  const platform = navigator.userAgentData?.platform || navigator.platform || "Unknown";
  const userAgent = navigator.userAgent || "";
  return `${platform} | ${userAgent}`.slice(0, 250);
};

const withClientHeaders = (headers = {}) => {
  const nextHeaders = { ...headers };
  const systemName = getClientSystemName();
  if (systemName) nextHeaders["X-System-Name"] = systemName;

  if (typeof localStorage !== "undefined") {
    const username = localStorage.getItem("username") || "";
    const role = localStorage.getItem("role") || "";
    const authToken = localStorage.getItem("authToken") || "";
    if (username) nextHeaders["X-Username"] = username;
    if (role) nextHeaders["X-User-Role"] = role;
    if (authToken) nextHeaders.Authorization = `Bearer ${authToken}`;
  }

  return nextHeaders;
};

if (import.meta.env.MODE === "development") {
  console.log("🌐 API_BASE =", API_BASE);
}

/**
 * Generic API request helper
 * - supports JSON and FormData
 * - supports query params
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
      headers: withClientHeaders({}),
    };

    const isFormData =
      typeof FormData !== "undefined" && data instanceof FormData;

    if (!isFormData) {
      options.headers["Content-Type"] = "application/json";
    }

    if (data) {
      console.log("📤 Sending Data to Backend:", data);
      options.body = isFormData ? data : JSON.stringify(data);
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

// ==============================
// ✅ Unique ID helpers
// ==============================

export async function getLatestUniqueId() {
  const response = await apiRequest("/latest/unique-id", "GET");
  console.log("Latest Unique ID from backend:", response);
  return response;
}

export async function getLatestLocalPurchaseUniqueId() {
  const response = await apiRequest("/latest/localpurchase/unique-id", "GET");
  console.log("Latest Local Purchase Unique ID from backend:", response);
  return response;
}

// ==============================
// ✅ Update Rows
// ==============================

export const updatePurchaseRow = async (id, updatedData) => {
  try {
    const response = await apiRequest(
      `/purchase/update/${id}`,
      "PUT",
      updatedData
    );
    console.log("✅ Backend Response:", response);
    console.log("===============================================");
    return response;
  } catch (error) {
    console.error("❌ Error updating purchase row:", error);
    throw error;
  }
};

export const updateLocalPurchaseRow = async (id, updatedData) => {
  try {
    const response = await apiRequest(
      `/localpurchase/update/${id}`,
      "PUT",
      updatedData
    );
    console.log("✅ Backend Response:", response);
    console.log("===============================================");
    return response;
  } catch (error) {
    console.error("❌ Error updating local purchase row:", error);
    throw error;
  }
};

// ==============================
// 📌 Create Forms
// ==============================

export async function createIndentForm(data) {
  console.log("📝 Creating Indent Form:", data);
  return await apiRequest("/", "POST", data);
}

export async function createLocalPurchaseForm(data) {
  console.log("📝 Creating Local Purchase Form:", data);
  return await apiRequest("/localpurchase", "POST", data);
}

// ==============================
// ✅ Fetch All
// Backend expects POST body: { role, username }
// ==============================

export async function getAllIndentForms({ role, username } = {}) {
  console.log("📥 Fetching All Indent Forms With Role & Username");
  return await apiRequest("/all", "POST", { role, username });
}

export async function getAllLocalPurchaseForms({ role, username } = {}) {
  console.log("📥 Fetching All Local Purchase Forms With Role & Username");
  return await apiRequest("/localpurchase/all", "POST", { role, username });
}

export async function getAuditLogs() {
  return await apiRequest("/audit-logs", "GET");
}

// ==============================
// ✅ By Mongo ID
// ==============================

export async function getIndentFormById(indentId) {
  console.log(`🔍 Fetching Indent Form → ID: ${indentId}`);
  return await apiRequest(`/${indentId}`, "GET");
}

export async function updateIndentForm(indentId, data) {
  console.log(`✏️ Updating Indent Form → ID: ${indentId}`, data);
  return await apiRequest(`/${indentId}`, "PUT", data);
}

export async function deleteIndentForm(indentId) {
  console.log(`🗑️ Deleting Indent Form → ID: ${indentId}`);
  return await apiRequest(`/${indentId}`, "DELETE");
}

// ==============================
// ✅ Manual Close + PDF Upload helpers
// ==============================

/** Fetch a purchase/indent row by Unique ID */
export async function getPurchaseByUniqueId(uniqueId) {
  if (!uniqueId) throw new Error("uniqueId is required");
  return await apiRequest(`/unique/${encodeURIComponent(uniqueId)}`, "GET");
}

/** Manually close store for a given Unique ID */
export async function manualCloseStoreUniqueId(payload) {
  return await apiRequest(`/store/manual-close`, "POST", payload || {});
}

/** Bulk add ids to Local Purchase */
export async function addToLocalPurchase(payload) {
  return await apiRequest(`/add-to-localPurchase`, "POST", payload || {});
}

/**
 * ✅ Upload Comparison PDF
 */
export async function uploadComparisonPDF(rowId, file) {
  if (!file) throw new Error("file is required");

  const formData = new FormData();
  formData.append("file", file);
  if (rowId) formData.append("rowId", rowId);

  const url = `${API_BASE}/upload/comparison-pdf`;

  const res = await axios.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

/**
 * ✅ Fetch Comparison PDF info by rowId
 */
export async function getComparisonPdfByRowId(rowId) {
  if (!rowId) throw new Error("rowId is required");
  return await apiRequest(`/comparison/pdf/${encodeURIComponent(rowId)}`, "GET");
}

// ==============================
// ✅ Store Invoice PDF (legacy single-row upload)
// ==============================

export const uploadInvoicePDF = async (rowId, file, { username = "" } = {}) => {
  if (!rowId) throw new Error("rowId is required");
  if (!file) throw new Error("file is required");

  const fd = new FormData();
  fd.append("file", file);
  if (username) fd.append("username", username);

  const url = `${API_BASE}/invoice/pdf/${encodeURIComponent(rowId)}`;

  const res = await axios.post(url, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const getInvoicePdfByRowId = async (rowId) => {
  if (!rowId) throw new Error("rowId is required");
  return await apiRequest(`/invoice/pdf/${encodeURIComponent(rowId)}`, "GET");
};

// ==============================
// ✅ NEW: Invoice Master (one invoice -> many items)
// ==============================

export const createStoreInvoiceAndLinkItems = async (payload, file) => {
  if (!file) throw new Error("file is required");
  if (
    !payload ||
    !Array.isArray(payload.rowIds) ||
    payload.rowIds.length === 0
  ) {
    throw new Error("payload.rowIds (array) is required");
  }

  const fd = new FormData();
  fd.append("file", file);

  Object.keys(payload).forEach((k) => {
    const v = payload[k];
    if (v === undefined || v === null) return;

    if (k === "rowIds") {
      fd.append("rowIds", JSON.stringify(v));
    } else {
      fd.append(k, String(v));
    }
  });

  const url = `${API_BASE}/store/invoice/bulk`;

  const res = await axios.post(url, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const getStoreInvoiceById = async (invoiceId) => {
  if (!invoiceId) throw new Error("invoiceId is required");
  return await apiRequest(
    `/store/invoice/${encodeURIComponent(invoiceId)}`,
    "GET"
  );
};

// ==============================
// ✅ PO PDF helpers
// ==============================

export const uploadPoPDF = async (
  rowId,
  file,
  { role = "", username = "" } = {}
) => {
  if (!rowId) throw new Error("rowId is required");
  if (!file) throw new Error("file is required");

  const fd = new FormData();
  fd.append("file", file);
  if (role) fd.append("role", role);
  if (username) fd.append("username", username);

  const url = `${API_BASE}/po/pdf/${encodeURIComponent(rowId)}`;

  const res = await axios.post(url, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const getPoPdfByRowId = async (rowId) => {
  if (!rowId) throw new Error("rowId is required");
  return await apiRequest(`/po/pdf/${encodeURIComponent(rowId)}`, "GET");
};

// ==============================
// ✅ NEW: BULK PO (one PO -> many items)
// ==============================

export const createPoAndLinkItems = async (payload, file) => {
  if (!file) throw new Error("PO PDF file is required");
  if (
    !payload ||
    !Array.isArray(payload.rowIds) ||
    payload.rowIds.length === 0
  ) {
    throw new Error("payload.rowIds (array) is required");
  }

  const fd = new FormData();
  fd.append("file", file);

  Object.keys(payload).forEach((k) => {
    const v = payload[k];
    if (v === undefined || v === null) return;

    if (k === "rowIds") {
      fd.append("rowIds", JSON.stringify(v));
    } else {
      fd.append(k, String(v));
    }
  });

  const url = `${API_BASE}/po/bulk`;

  const res = await axios.post(url, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

// ==============================
// ✅ Local Purchase: Bulk update selected rows
// ==============================

export const bulkUpdateLocalPurchaseSelected = async (payload) => {
  return await apiRequest(`/localpurchase/bulk-update`, "PUT", payload || {});
};

// ==============================
// ✅ INDENT VERIFICATION PDF (BULK upload + show)
// Backend routes (mounted at /indent):
//   POST /indent/indent-verification/pdf/bulk
//   GET  /indent/indent-verification/pdf/:rowId
// ==============================

/**
 * Upload ONE PDF and apply it to MANY uniqueIds (checkbox bulk selection)
 * @param {string[]} uniqueIds - array of uniqueId strings
 * @param {File} file - PDF file
 * @param {{username?: string, role?: string}} meta
 */
export const uploadIndentVerificationPdfBulk = async (
  uniqueIds,
  file,
  { username = "", role = "" } = {}
) => {
  if (!file) throw new Error("file is required");
  if (!Array.isArray(uniqueIds) || uniqueIds.length === 0) {
    throw new Error("uniqueIds array is required");
  }

  const fd = new FormData();
  fd.append("file", file);
  fd.append("uniqueIds", JSON.stringify(uniqueIds));
  if (username) fd.append("username", username);
  if (role) fd.append("role", role);

  const url = `${API_BASE}/indent-verification/pdf/bulk`;

  const res = await axios.post(url, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

/**
 * Fetch indent verification PDF info by rowId (optional helper)
 */
export const getIndentVerificationPdfByRowId = async (rowId) => {
  if (!rowId) throw new Error("rowId is required");
  return await apiRequest(
    `/indent-verification/pdf/${encodeURIComponent(rowId)}`,
    "GET"
  );
};
// ==============================
// ✅ GET QUOTATION PDF (single-row upload + show)
// Backend routes (mounted at /indent):
//   POST /indent/getquotation/pdf/:rowId
//   GET  /indent/getquotation/pdf/:rowId
// ==============================

export const uploadGetQuotationPDF = async (
  rowId,
  file,
  { role = "", username = "" } = {}
) => {
  if (!rowId) throw new Error("rowId is required");
  if (!file) throw new Error("file is required");

  const fd = new FormData();
  fd.append("file", file);
  if (role) fd.append("role", role);
  if (username) fd.append("username", username);

  const url = `${API_BASE}/getquotation/pdf/${encodeURIComponent(rowId)}`;

  const res = await axios.post(url, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const getGetQuotationPdfByRowId = async (rowId) => {
  if (!rowId) throw new Error("rowId is required");
  return await apiRequest(`/getquotation/pdf/${encodeURIComponent(rowId)}`, "GET");
};


