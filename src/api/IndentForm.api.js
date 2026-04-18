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
const LIST_CACHE_PREFIX = "indent-list-cache::";
const LIST_CACHE_TTL_MS = 60 * 1000;
const memoryListCache = new Map();
const inflightListRequests = new Map();

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
const isBrowserStorageAvailable = () =>
  typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";

const buildListCacheKey = (scope, payload = {}) => {
  const keyPayload = {
    role: String(payload.role || "").trim(),
    username: String(payload.username || "").trim(),
    limit: Number(payload.limit || 0),
    skip: Number(payload.skip || 0),
  };

  return `${LIST_CACHE_PREFIX}${scope}::${JSON.stringify(keyPayload)}`;
};

const readListCache = (cacheKey) => {
  const now = Date.now();
  const memoryEntry = memoryListCache.get(cacheKey);
  if (memoryEntry && memoryEntry.expiresAt > now) {
    return memoryEntry.value;
  }
  if (memoryEntry) {
    memoryListCache.delete(cacheKey);
  }

  if (!isBrowserStorageAvailable()) return null;

  try {
    const raw = window.sessionStorage.getItem(cacheKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.expiresAt || parsed.expiresAt <= now) {
      window.sessionStorage.removeItem(cacheKey);
      return null;
    }

    memoryListCache.set(cacheKey, parsed);
    return parsed.value;
  } catch (error) {
    console.warn("List cache read failed:", error);
    return null;
  }
};

const writeListCache = (cacheKey, value) => {
  const entry = {
    value,
    expiresAt: Date.now() + LIST_CACHE_TTL_MS,
  };

  memoryListCache.set(cacheKey, entry);

  if (!isBrowserStorageAvailable()) return;

  try {
    window.sessionStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.warn("List cache write failed:", error);
  }
};

export const invalidateIndentListCache = () => {
  memoryListCache.clear();
  inflightListRequests.clear();

  if (!isBrowserStorageAvailable()) return;

  try {
    const keysToDelete = [];
    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index);
      if (key && key.startsWith(LIST_CACHE_PREFIX)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => window.sessionStorage.removeItem(key));
  } catch (error) {
    console.warn("List cache invalidation failed:", error);
  }
};

const getCachedListResponse = async (
  scope,
  endpoint,
  payload,
  { forceFresh = false } = {},
) => {
  const cacheKey = buildListCacheKey(scope, payload);

  if (!forceFresh) {
    const cached = readListCache(cacheKey);
    if (cached) return cached;

    const inflight = inflightListRequests.get(cacheKey);
    if (inflight) return inflight;
  }

  const requestPromise = apiRequest(endpoint, "POST", payload)
    .then((result) => {
      writeListCache(cacheKey, result);
      return result;
    })
    .finally(() => {
      inflightListRequests.delete(cacheKey);
    });

  inflightListRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

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
    invalidateIndentListCache();
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
    invalidateIndentListCache();
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
  const response = await apiRequest("/", "POST", data);
  invalidateIndentListCache();
  return response;
}

export async function createLocalPurchaseForm(data) {
  console.log("📝 Creating Local Purchase Form:", data);
  const response = await apiRequest("/localpurchase", "POST", data);
  invalidateIndentListCache();
  return response;
}

// ==============================
// ✅ Fetch All
// Backend expects POST body: { role, username }
// ==============================

export async function getAllIndentForms({
  role,
  username,
  limit,
  skip,
  forceFresh = false,
} = {}) {
  console.log("📥 Fetching All Indent Forms With Role & Username");
  return await getCachedListResponse(
    "purchase",
    "/all",
    { role, username, limit, skip },
    { forceFresh },
  );
}

export async function getAllLocalPurchaseForms({
  role,
  username,
  limit,
  skip,
  forceFresh = false,
} = {}) {
  console.log("Fetching All Local Purchase Forms With Role & Username");
  return await getCachedListResponse(
    "localpurchase",
    "/localpurchase/all",
    { role, username, limit, skip },
    { forceFresh },
  );
}

export async function getVendorMasterList(query = "") {
  const endpoint = query ? `/vendor-master?query=${encodeURIComponent(query)}` : "/vendor-master";
  return await apiRequest(endpoint, "GET");
}

export async function getDelayFollowups({ role, username } = {}) {
  return await apiRequest("/delay-followup", "POST", { role, username });
}

export async function upsertDelayFollowup(payload) {
  return await apiRequest("/delay-followup", "PUT", payload || {});
}

export async function getAuditLogs() {
  return await apiRequest("/audit-logs", "GET");
}

export async function logUserInputChange(payload) {
  return await apiRequest("/audit-logs/input", "POST", payload || {});
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
  const response = await apiRequest(`/${indentId}`, "PUT", data);
  invalidateIndentListCache();
  return response;
}

export async function deleteIndentForm(indentId) {
  console.log(`🗑️ Deleting Indent Form → ID: ${indentId}`);
  const response = await apiRequest(`/${indentId}`, "DELETE");
  invalidateIndentListCache();
  return response;
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
  const response = await apiRequest(`/store/manual-close`, "POST", payload || {});
  invalidateIndentListCache();
  return response;
}

/** Bulk add ids to Local Purchase */
export async function addToLocalPurchase(payload) {
  const response = await apiRequest(`/add-to-localPurchase`, "POST", payload || {});
  invalidateIndentListCache();
  return response;
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

  invalidateIndentListCache();
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

  invalidateIndentListCache();
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

  invalidateIndentListCache();
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

  invalidateIndentListCache();
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
  if (
    !payload ||
    !Array.isArray(payload.rowIds) ||
    payload.rowIds.length === 0
  ) {
    throw new Error("payload.rowIds (array) is required");
  }

  const fd = new FormData();
  if (file) fd.append("file", file);

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

  invalidateIndentListCache();
  return res.data;
};

// ==============================
// ✅ Local Purchase: Bulk update selected rows
// ==============================

export const bulkUpdateLocalPurchaseSelected = async (payload) => {
  const response = await apiRequest(`/localpurchase/bulk-update`, "PUT", payload || {});
  invalidateIndentListCache();
  return response;
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

  invalidateIndentListCache();
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

  invalidateIndentListCache();
  return res.data;
};

export const getGetQuotationPdfByRowId = async (rowId) => {
  if (!rowId) throw new Error("rowId is required");
  return await apiRequest(`/getquotation/pdf/${encodeURIComponent(rowId)}`, "GET");
};



