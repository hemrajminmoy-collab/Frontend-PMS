import React, { useState, useEffect, useRef, useCallback } from "react";
// import  {motion }  from "framer-motion";
import { motion as Motion } from "framer-motion";

import {
  FaFileAlt,
  FaBalanceScale,
  FaCheckCircle,
  FaHandshake,
  FaFileSignature,
  FaTruck,
  FaMoneyCheckAlt,
  FaShoppingCart,
  FaShip,
  FaFileUpload,
  FaClipboardCheck,
  FaRegMoneyBillAlt,
  FaPhoneAlt,
  FaStore,
  FaClipboardList,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PurchaseTopNav from "./PurchaseTopNav";
import PurchaseSidebar from "./PurchaseSidebar";
import PurchaseFilterBar from "./PurchaseFilterBar";
import SummaryReportSection from "./sections/SummaryReportSection";
import StoreManualCloseSection from "./sections/StoreManualCloseSection";
import StoreBulkInvoiceSection from "./sections/StoreBulkInvoiceSection";
import PoBulkSection from "./sections/PoBulkSection";
import LocalPurchaseBulkSection from "./sections/LocalPurchaseBulkSection";
import SystemLogsSection from "./sections/SystemLogsSection";
import {
  getAllIndentForms,
  getAllLocalPurchaseForms,
  updatePurchaseRow,
  updateLocalPurchaseRow,
  getPurchaseByUniqueId,
  manualCloseStoreUniqueId,
  uploadComparisonPDF,
  //getComparisonPdfByRowId,
  //uploadGetQuotationPDF
} from "../../api/IndentForm.api";

// ---------------------- ROLE FIRST ----------------------
const getNavLinksByRole = (role, username) => {
  const normalizedUsername = String(username || "").trim();
  const normalizedLowerUsername = normalizedUsername.toLowerCase();
  const normalizedRole = String(role || "")
    .trim()
    .toUpperCase();
  const isLogViewerUser =
    normalizedLowerUsername === "minmoy" ||
    normalizedLowerUsername === "mrinmoy" ||
    normalizedRole === "ADMIN";

  console.log(
    "Generating nav links for role:",
    role,
    "username:",
    normalizedUsername,
  );

  let menu = {
    "Executive FMS Section": [
      { name: "Indent Verification", icon: <FaClipboardCheck /> },
      { name: "Get Quotation", icon: <FaFileAlt /> },
      { name: "Comparison Statement", icon: <FaBalanceScale /> },
      { name: "Technical Approval", icon: <FaCheckCircle /> },
      { name: "Commercial Negotiation", icon: <FaHandshake /> },
      { name: "Local Purchase", icon: <FaStore /> },
      { name: "PO Generation", icon: <FaFileSignature /> },
      { name: "PC and Payment", icon: <FaMoneyCheckAlt /> },
      { name: "Transport", icon: <FaShip /> },
      { name: "Material Received", icon: <FaTruck /> },
      { name: "Summary Rep  ort", icon: <FaClipboardList /> },
    ],
  };

  if (role === "PSE") {
    menu = {
      "Executive FMS Section": [
        { name: "Indent Verification", icon: <FaClipboardCheck /> },
        { name: "Comparison Statement", icon: <FaBalanceScale /> },
        { name: "Technical Approval", icon: <FaCheckCircle /> },
        { name: "Commercial Negotiation", icon: <FaHandshake /> },
        { name: "Material Received", icon: <FaTruck /> },
        { name: "Local Purchase", icon: <FaStore /> },
        { name: "Summary Report", icon: <FaClipboardList /> },
      ],
    };
  } else if (role === "PC" && normalizedUsername === "Anindita Chakraborty") {
    menu = {
      "Executive FMS Section": [
        { name: "PC Follow Up", icon: <FaPhoneAlt /> },
        { name: "Payment Follow Up", icon: <FaRegMoneyBillAlt /> },
      ],
    };
  } else if (role === "PA") {
    menu = {
      "Executive FMS Section": [
        { name: "Get Quotation", icon: <FaFileAlt /> },
        { name: "Comparison Statement", icon: <FaBalanceScale /> },
        { name: "PO Generation", icon: <FaFileSignature /> },
        { name: "Summary Report", icon: <FaClipboardList /> },
      ],
    };
  } else if (role === "PAC") {
    menu = {
      "Executive FMS Section": [
        { name: "Payment Follow Up", icon: <FaMoneyCheckAlt /> },
        { name: "Summary Report", icon: <FaClipboardList /> },
      ],
    };
  } else if (role === "PC") {
    menu = {
      "Executive FMS Section": [
        { name: "PC Follow Up", icon: <FaPhoneAlt /> },
        { name: "Payment Follow Up", icon: <FaRegMoneyBillAlt /> },
        { name: "Transport", icon: <FaShip /> },
        { name: "Summary Report", icon: <FaClipboardList /> },
      ],
    };
  } else if (role === "ADMIN") {
    menu = {
      "Executive FMS Section": [
        { name: "PMS Master Sheet", icon: <FaClipboardList /> },
        { name: "PC Follow Up", icon: <FaPhoneAlt /> },
        { name: "Payment Follow Up", icon: <FaRegMoneyBillAlt /> },
        { name: "Local Purchase", icon: <FaStore /> },
        { name: "Transport", icon: <FaShip /> },
        { name: "Store", icon: <FaTruck /> },
        { name: "Material Received", icon: <FaTruck /> },
        { name: "Summary Report", icon: <FaClipboardList /> },
      ],
    };
  } else if (role === "Store") {
    menu = {
      "Executive FMS Section": [
        { name: "Store", icon: <FaTruck /> },
        { name: "Material Received", icon: <FaTruck /> },
        { name: "Local Purchase", icon: <FaStore /> },
        { name: "Summary Report", icon: <FaClipboardList /> },
      ],
    };
  }

  if (isLogViewerUser) {
    const sectionKey = "Executive FMS Section";
    const links = menu[sectionKey] || [];
    if (!links.some((link) => link.name === "System Logs")) {
      menu = {
        ...menu,
        [sectionKey]: [
          ...links,
          { name: "System Logs", icon: <FaClipboardList /> },
        ],
      };
    }
  }

  return menu;
};

export default function PurchasePage() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "";
  const username = localStorage.getItem("username") || "";

  // --- Generate navLinks AFTER role is known ---
  const navLinks = getNavLinksByRole(role, username);
  const getDefaultOption = (role) => {
    if (role === "ADMIN") return "PMS Master Sheet";
    if (role === "PA") return "Get Quotation";
    if (role === "PSE") return "Indent Verification";
    if (role === "PC") return "PC Follow Up";
    if (role === "PAC") return "Payment Follow Up";
    if (role === "Store") return "Store";
    return "";
  };

  const [selectedOption, setSelectedOption] = useState(getDefaultOption(role));
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // used for Find By filters + Store Manual Closed
  const [changedRows, setChangedRows] = useState({});
  const latestDataRef = useRef([]); // <- always keep freshest data here

  const [saving, setSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [pdfPreview, setPdfPreview] = useState({});
  const [pcFollowUp, setPcFollowUp] = useState("PC1"); // "", "PC1", "PC2", "PC3"
  const [paymentFollowUp, setPaymentFollowUp] = useState("PWP");

  // ------------------ Date formatting helpers ------------------
  // DB may store dates as ISO strings (YYYY-MM-DD) or full ISO timestamps.
  // We want stable display as DD-MM-YYYY (same as your previous logic).
  const formatDDMMYYYY = useCallback((value) => {
    if (!value) return "";

    const s = String(value);

    // If it's ISO date or ISO datetime, slice to date part.
    const iso = s.length >= 10 ? s.slice(0, 10) : s;
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [yyyy, mm, dd] = iso.split("-");
      return `${dd}-${mm}-${yyyy}`;
    }

    // Fallback: try Date parsing
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-GB").replace(/\//g, "-");
    }

    return s;
  }, []);

  const getRowTimestamp = useCallback((row) => {
    if (!row) return 0;

    const created = row.createdAt ? new Date(row.createdAt).getTime() : 0;
    if (!Number.isNaN(created) && created > 0) return created;

    const updated = row.updatedAt ? new Date(row.updatedAt).getTime() : 0;
    if (!Number.isNaN(updated) && updated > 0) return updated;

    const rawDate = row.date ? new Date(row.date).getTime() : 0;
    if (!Number.isNaN(rawDate) && rawDate > 0) return rawDate;

    return 0;
  }, []);

  // ---------------------- Store Manual Close (Unique ID) ----------------------
  const [manualCloseUniqueId, setManualCloseUniqueId] = useState("");
  const [manualCloseRecord, setManualCloseRecord] = useState(null);
  const [manualCloseReason, setManualCloseReason] = useState("");
  const [manualCloseError, setManualCloseError] = useState("");
  const [manualCloseSuccess, setManualCloseSuccess] = useState("");
  const [showExcessBox, setShowExcessBox] = useState(false);
  const [manualCloseLoading, setManualCloseLoading] = useState(false);

  const [findBy, setFindBy] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [storeInFilter, setStoreInFilter] = useState("");
  const [storeItemDescriptionFilter, setStoreItemDescriptionFilter] =
    useState("");
  const [date, setDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  //const pcIndex = pcFollowUp?.replace("PC", ""); // "1" | "2" | "3"
  const pcIndex =
    selectedOption === "PC Follow Up" ? pcFollowUp.replace("PC", "") : null;
  const paymentKey =
    selectedOption === "Payment Follow Up" ? paymentFollowUp : null;

  const matchesPaymentFollowUpKey = (paymentCondition, key) => {
    const c = String(paymentCondition || "").toUpperCase();
    if (!c) return false;

    // Direct single-condition mappings
    if (c === "AFTER RECEIVED") return key === "FAR";
    if (c === "BEFORE DISPATCH") return key === "BBD";
    if (c === "PAPW") return key === "PAPW";

    // Combined conditions: show in all relevant tabs
    if (key === "PWP") return c.includes("PWP");
    if (key === "BBD")
      return c.includes("BBD") || c.includes("BEFORE DISPATCH");
    if (key === "FAR") return c.includes("FAR") || c.includes("AFTER RECEIVED");
    if (key === "PAPW") return c.includes("PAPW");
    return true;
  };

  const visibleTableData = React.useMemo(() => {
    if (selectedOption === "Payment Follow Up" && paymentKey) {
      return (tableData || []).filter((row) =>
        matchesPaymentFollowUpKey(row.paymentCondition, paymentKey),
      );
    }
    return tableData || [];
  }, [tableData, selectedOption, paymentKey]);

  // ------------------ Material Received helpers ------------------
  const dateOnly = useCallback((s) => (s ? String(s).slice(0, 10) : ""), []);
  const isMaterialMismatch = useCallback(
    (row) => {
      const a = dateOnly(row.materialReceivedDate);
      const b = dateOnly(row.storeReceivedDate);
      return !!(a && b && a !== b);
    },
    [dateOnly],
  );

  const renderedTableData = React.useMemo(() => {
    if (selectedOption !== "Material Received") return visibleTableData;
    const arr = [...(visibleTableData || [])];
    // Mismatch rows first, keep stable ordering otherwise
    arr.sort((r1, r2) => {
      const m1 = isMaterialMismatch(r1) ? 1 : 0;
      const m2 = isMaterialMismatch(r2) ? 1 : 0;
      if (m1 !== m2) return m2 - m1;
      return 0;
    });
    return arr;
  }, [visibleTableData, selectedOption, isMaterialMismatch]);

  const delayFields = React.useMemo(
    () => [
      { key: "timeDelayGetQuotation", label: "Get Quotation" },
      { key: "timeDelayTechApproval", label: "Technical Approval" },
      {
        key: "timeDelayCommercialNegotiation",
        label: "Commercial Negotiation",
      },
      { key: "timeDelayPoGeneration", label: "PO Generation" },
      { key: "timeDelayMaterialReceived", label: "Material Received" },
      { key: "timeDelayPCFollowUp1", label: "PC Follow Up 1" },
      { key: "timeDelayPCFollowUp2", label: "PC Follow Up 2" },
      { key: "timeDelayPCFollowUp3", label: "PC Follow Up 3" },
      { key: "timeDelayPaymentPWP", label: "Payment PWP" },
      { key: "timeDelayPaymentBBD", label: "Payment BBD" },
      { key: "timeDelayPaymentFAR", label: "Payment FAR" },
      { key: "timeDelayPaymentPAPW", label: "Payment PAPW" },
    ],
    [],
  );

  const parseDelayDays = (value) => {
    if (!value) return 0;
    if (typeof value === "number") return value;
    const s = String(value).toLowerCase();
    const m = s.match(/(\d+)/);
    if (!m) return 0;
    return Number(m[1]) || 0;
  };

  const summaryReport = React.useMemo(() => {
    const rows = Array.isArray(tableData) ? tableData : [];
    return delayFields.map((f) => {
      const items = rows
        .map((r) => ({
          uniqueId: r.uniqueId || "",
          days: parseDelayDays(r[f.key]),
        }))
        .filter((x) => x.days > 0);

      const count = items.length;
      const total = items.reduce((acc, x) => acc + x.days, 0);
      const avg = count ? Math.round((total / count) * 10) / 10 : 0;
      const max = count ? Math.max(...items.map((x) => x.days)) : 0;
      const top = items
        .sort((a, b) => b.days - a.days)
        .slice(0, 5)
        .map((x) => `${x.uniqueId} (${x.days}d)`);

      return {
        label: f.label,
        count,
        avg,
        max,
        top,
      };
    });
  }, [tableData, delayFields]);

  const finalTableData = React.useMemo(() => {
    if (selectedOption !== "Comparison Statement") return renderedTableData;
    const arr = [...(renderedTableData || [])];
    arr.sort((a, b) => {
      const r1 = a?.comparisonStatementStatus === "Reopen" ? 1 : 0;
      const r2 = b?.comparisonStatementStatus === "Reopen" ? 1 : 0;
      if (r1 !== r2) return r2 - r1;
      return 0;
    });
    return arr;
  }, [renderedTableData, selectedOption]);

  // keep ref in-sync whenever state changes
  useEffect(() => {
    latestDataRef.current = tableData;
  }, [tableData]);

  useEffect(() => {
    if (pcFollowUp) {
      // fetchData({ pcFollowUp });
      console.log("Selected PC Follow Up:", pcFollowUp);
    }
  }, [pcFollowUp]);

  // useEffect(() => {
  //   fetchIndentForms();
  // }, [findBy, selectedSite, date, startDate, endDate]);

  // Wrapped in useCallback so react-hooks/exhaustive-deps is satisfied
  // ------------------ API base URL ------------------
  const API_BASE_URL = (
    import.meta?.env?.VITE_API_URL || "https://pms-backend-main.vercel.app"
  ).replace(/\/+$/, "");
  const getClientSystemName = () => {
    if (typeof navigator === "undefined") return "";
    const platform =
      navigator.userAgentData?.platform || navigator.platform || "Unknown";
    const userAgent = navigator.userAgent || "";
    return `${platform} | ${userAgent}`.slice(0, 250);
  };

  const getClientHeaders = () => {
    const headers = { "Content-Type": "application/json" };
    const localUsername = localStorage.getItem("username") || "";
    const localRole = localStorage.getItem("role") || "";
    const authToken = localStorage.getItem("authToken") || "";
    const systemName = getClientSystemName();

    if (localUsername) headers["X-Username"] = localUsername;
    if (localRole) headers["X-User-Role"] = localRole;
    if (systemName) headers["X-System-Name"] = systemName;
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    return headers;
  };

  const [uploadingInvoiceRowId, setUploadingInvoiceRowId] = useState(null);
  const [uploadingPoRowId, setUploadingPoRowId] = useState(null);

  // ------------------ Store: same invoice for multiple items ------------------
  const [storeSelectedRowIds, setStoreSelectedRowIds] = useState([]);
  //const [storeBulkVendorName, setStoreBulkVendorName] = useState("");
  const [storeBulkInvoiceNumber, setStoreBulkInvoiceNumber] = useState("");
  const [storeBulkInvoiceDate, setStoreBulkInvoiceDate] = useState("");
  const [storeBulkReceivedDate, setStoreBulkReceivedDate] = useState("");
  const [storeBulkFile, setStoreBulkFile] = useState(null);
  const [storeBulkFileKey, setStoreBulkFileKey] = useState(0);
  const [storeBulkUploading, setStoreBulkUploading] = useState(false);
  const [storeBulkError, setStoreBulkError] = useState("");
  const [storeBulkSuccess, setStoreBulkSuccess] = useState("");
  // ------------------ PO Generation: same PO for multiple items (bulk) ------------------
  const [poSelectedRowIds, setPoSelectedRowIds] = useState([]);
  const [poBulkPoNumber, setPoBulkPoNumber] = useState("");
  const [poBulkPoDate, setPoBulkPoDate] = useState("");
  const [poBulkVendorName, setPoBulkVendorName] = useState("");
  const [poBulkLeadDays, setPoBulkLeadDays] = useState("");
  const [poBulkPaymentCondition, setPoBulkPaymentCondition] = useState("");
  const [poBulkPapwDays, setPoBulkPapwDays] = useState("");
  const [poBulkAmount, setPoBulkAmount] = useState("");
  const [poBulkFile, setPoBulkFile] = useState(null);
  const [poBulkFileKey, setPoBulkFileKey] = useState(0);
  const [poBulkUploading, setPoBulkUploading] = useState(false);
  const [poBulkError, setPoBulkError] = useState("");
  const [poBulkSuccess, setPoBulkSuccess] = useState("");

  // ------------------ PO Generation: bulk selection helpers ------------------
  const isPoRowSelected = (rowId) => poSelectedRowIds.includes(rowId);

  const togglePoRowSelected = (rowId) => {
    if (!rowId) return;
    setPoSelectedRowIds((prev) =>
      prev.includes(rowId) ? prev.filter((x) => x !== rowId) : [...prev, rowId],
    );
  };

  const clearPoSelection = () => {
    setPoSelectedRowIds([]);
  };

  // ------------------ Local Purchase: bulk selection + bulk fields ------------------
  const [lpSelectedRowIds, setLpSelectedRowIds] = useState([]);
  const [lpBulkInvoiceDate, setLpBulkInvoiceDate] = useState("");
  const [lpBulkInvoiceNumber, setLpBulkInvoiceNumber] = useState("");
  const [lpBulkModeOfTransport, setLpBulkModeOfTransport] = useState("");
  const [lpBulkTransporterName, setLpBulkTransporterName] = useState("");
  const [lpBulkVendorName, setLpBulkVendorName] = useState("");
  const [lpBulkRemarks, setLpBulkRemarks] = useState("");
  const [lpBulkUploading, setLpBulkUploading] = useState(false);
  const [lpBulkError, setLpBulkError] = useState("");
  const [lpBulkSuccess, setLpBulkSuccess] = useState("");

  const isLpRowSelected = (rowId) => lpSelectedRowIds.includes(rowId);

  const toggleLpRowSelected = (rowId) => {
    if (!rowId) return;
    setLpSelectedRowIds((prev) =>
      prev.includes(rowId) ? prev.filter((x) => x !== rowId) : [...prev, rowId],
    );
  };

  const clearLpSelection = () => {
    setLpSelectedRowIds([]);
  };

  const selectAllLpRows = (rows) => {
    const ids = (rows || []).map((r) => r?._id).filter(Boolean);
    setLpSelectedRowIds(ids);
  };

  // Bulk update selected Local Purchase rows
  const bulkUpdateLocalPurchaseSelected = async ({
    rowIds,
    invoiceDate,
    invoiceNumber,
    vendorName,
    modeOfTransport,
    transporterName,
    remarks,
  }) => {
    const { data } = await axios.put(
      `${API_BASE_URL}/indent/localpurchase/bulk-update`,
      {
        rowIds,
        invoiceDate,
        invoiceNumber,
        vendorName,
        modeOfTransport,
        transporterName,
        remarks,
        username: localStorage.getItem("username") || "",
        role: localStorage.getItem("role") || "",
        systemName: getClientSystemName(),
      },
    );
    return data;
  };

  const handleLocalPurchaseBulkApply = async () => {
    setLpBulkError("");
    setLpBulkSuccess("");

    if (!lpSelectedRowIds.length) {
      setLpBulkError("Please select at least 1 row.");
      return;
    }

    try {
      setLpBulkUploading(true);

      const resp = await bulkUpdateLocalPurchaseSelected({
        rowIds: lpSelectedRowIds,
        invoiceDate: lpBulkInvoiceDate,
        invoiceNumber: lpBulkInvoiceNumber,
        vendorName: lpBulkVendorName,
        modeOfTransport: lpBulkModeOfTransport,
        transporterName: lpBulkTransporterName,
        remarks: lpBulkRemarks,
      });

      // Optimistically update local table state so user sees changes immediately
      setTableData((prev) =>
        (prev || []).map((r) => {
          if (!lpSelectedRowIds.includes(r._id)) return r;
          return {
            ...r,
            invoiceDate:
              lpBulkInvoiceDate !== "" ? lpBulkInvoiceDate : r.invoiceDate,
            vendorName:
              lpBulkVendorName !== "" ? lpBulkVendorName : r.vendorName,
            remarks: lpBulkRemarks !== "" ? lpBulkRemarks : r.remarks,
          };
        }),
      );

      setLpBulkSuccess(
        resp?.message || "Local Purchase bulk update completed.",
      );
      clearLpSelection();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Bulk update failed";
      setLpBulkError(msg);
    } finally {
      setLpBulkUploading(false);
    }
  };

  const parseOptionalNumber = (value) => {
    const str = String(value ?? "").trim();
    if (!str) return "";
    const n = Number(str);
    return Number.isFinite(n) ? n : "";
  };

  const createPoAndLinkItems = async ({
    rowIds,
    poNumber,
    poDate,
    vendorName,
    leadDays,
    amount,
    paymentCondition,
    papwDays,
    file,
  }) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("rowIds", JSON.stringify(rowIds || []));
    fd.append("poNumber", poNumber || "");
    fd.append("poDate", poDate || "");
    fd.append("vendorName", vendorName || "");
    fd.append("leadDays", String(leadDays ?? ""));
    fd.append("amount", String(amount ?? ""));
    fd.append("paymentCondition", paymentCondition || "");
    fd.append("papwDays", String(papwDays ?? ""));
    fd.append("username", localStorage.getItem("username") || "");
    fd.append("role", localStorage.getItem("role") || "");

    const { data } = await axios.post(`${API_BASE_URL}/indent/po/bulk`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  };

  const handlePoBulkUpload = async () => {
    try {
      setPoBulkError("");
      setPoBulkSuccess("");

      if (!poBulkFile) {
        setPoBulkError("Please choose a PO PDF file.");
        return;
      }

      if (!poSelectedRowIds.length) {
        setPoBulkError("Please select at least 1 item row to link this PO.");
        return;
      }

      if (!String(poBulkPoNumber || "").trim()) {
        setPoBulkError("PO Number is required.");
        return;
      }

      if (!String(poBulkPoDate || "").trim()) {
        setPoBulkError("PO Date is required.");
        return;
      }

      // If PAPW selected, papwDays required
      if (
        String(poBulkPaymentCondition || "")
          .toUpperCase()
          .includes("PAPW")
      ) {
        const d = Number(poBulkPapwDays);
        if (!Number.isFinite(d) || d <= 0) {
          setPoBulkError(
            "PAPW Days is required when Payment Condition is PAPW.",
          );
          return;
        }
      }

      setPoBulkUploading(true);

      const res = await createPoAndLinkItems({
        rowIds: poSelectedRowIds,
        poNumber: poBulkPoNumber,
        poDate: poBulkPoDate,
        vendorName: poBulkVendorName,
        leadDays: poBulkLeadDays,
        amount: poBulkAmount,
        paymentCondition: poBulkPaymentCondition,
        papwDays: poBulkPapwDays,
        file: poBulkFile,
      });

      if (!res?.success) {
        setPoBulkError(res?.message || "Bulk PO upload failed");
        return;
      }

      const webViewLink = res?.data?.webViewLink || res?.webViewLink || "";
      const driveFileId = res?.data?.driveFileId || res?.driveFileId || "";

      // patch selected rows so Show PO reflects immediately
      for (const rid of poSelectedRowIds) {
        patchRowInTables(rid, {
          poNumber: poBulkPoNumber,
          poDate: poBulkPoDate,
          vendorName: poBulkVendorName,
          leadDays: parseOptionalNumber(poBulkLeadDays),
          amount: parseOptionalNumber(poBulkAmount),
          paymentCondition: poBulkPaymentCondition,
          papwDays: parseOptionalNumber(poBulkPapwDays),
          poPdfWebViewLink: webViewLink,
          poPdfDriveFileId: driveFileId,
        });
      }

      setPoBulkSuccess(
        res?.message || `PO applied to ${poSelectedRowIds.length} item(s)`,
      );
      clearPoSelection();
      setPoBulkFile(null);
      setPoBulkFileKey((k) => k + 1); // reset file input
    } catch (e) {
      setPoBulkError(
        e?.response?.data?.message || e.message || "Bulk PO upload failed",
      );
    } finally {
      setPoBulkUploading(false);
    }
  };

  // ✅ Helper: update both tableData + filteredData so UI reflects latest PDF links
  const patchRowInTables = (rowId, patch) => {
    setTableData((prev) =>
      Array.isArray(prev)
        ? prev.map((r) => (r?._id === rowId ? { ...r, ...patch } : r))
        : prev,
    );

    setFilteredData((prev) =>
      Array.isArray(prev)
        ? prev.map((r) => (r?._id === rowId ? { ...r, ...patch } : r))
        : prev,
    );
  };

  const uploadInvoicePDF = async (rowId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    // backend reads rowId from params; keep body too (safe)
    formData.append("rowId", rowId);

    const { data } = await axios.post(
      `${API_BASE_URL}/indent/invoice/pdf/${rowId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return data;
  };

  const uploadPoPDF = async (rowId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("rowId", rowId);

    // ✅ pass role/username for backend permission + audit
    formData.append("role", localStorage.getItem("role") || "");
    formData.append("username", localStorage.getItem("username") || "");

    const { data } = await axios.post(
      `${API_BASE_URL}/indent/po/pdf/${rowId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return data;
  };

  const handleInvoiceUpload = async (rowId, file) => {
    try {
      setUploadingInvoiceRowId(rowId);
      const res = await uploadInvoicePDF(rowId, file);
      if (res?.success) {
        patchRowInTables(rowId, {
          invoicePdfWebViewLink: res.webViewLink,
          invoicePdfDriveFileId: res.driveFileId,
        });
      } else {
        alert(res?.message || "Invoice upload failed");
      }
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Invoice upload failed");
    } finally {
      setUploadingInvoiceRowId(null);
    }
  };

  const handlePoUpload = async (rowId, file) => {
    try {
      setUploadingPoRowId(rowId);
      const res = await uploadPoPDF(rowId, file);
      if (res?.success) {
        patchRowInTables(rowId, {
          poPdfWebViewLink: res.webViewLink,
          poPdfDriveFileId: res.driveFileId,
        });
      } else {
        alert(res?.message || "PO upload failed");
      }
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "PO upload failed");
    } finally {
      setUploadingPoRowId(null);
    }
  };

  // ------------------ Store: bulk invoice upload + link items ------------------
  const isStoreRowSelected = (rowId) => storeSelectedRowIds.includes(rowId);

  const toggleStoreRowSelected = (rowId) => {
    if (!rowId) return;
    setStoreSelectedRowIds((prev) =>
      prev.includes(rowId) ? prev.filter((x) => x !== rowId) : [...prev, rowId],
    );
  };

  const clearStoreSelection = () => setStoreSelectedRowIds([]);

  const createStoreInvoiceAndLinkItems = async ({
    rowIds,
    vendorName,
    invoiceNumber,
    invoiceDate,
    receivedDate,
    file,
  }) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("rowIds", JSON.stringify(rowIds || []));
    fd.append("vendorName", vendorName || "");
    fd.append("invoiceNumber", invoiceNumber || "");
    fd.append("invoiceDate", invoiceDate || "");
    fd.append("receivedDate", receivedDate || "");
    fd.append("username", localStorage.getItem("username") || "");
    fd.append("role", localStorage.getItem("role") || "");

    const { data } = await axios.post(
      `${API_BASE_URL}/indent/store/invoice/bulk`,
      fd,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return data;
  };

  const handleStoreBulkInvoiceUpload = async () => {
    try {
      setStoreBulkError("");
      setStoreBulkSuccess("");

      if (!storeBulkFile) {
        setStoreBulkError("Please choose an invoice PDF file.");
        return;
      }

      if (!storeSelectedRowIds.length) {
        setStoreBulkError(
          "Please select at least 1 item row to link this invoice.",
        );
        return;
      }

      if (!String(storeBulkInvoiceNumber || "").trim()) {
        setStoreBulkError("Invoice Number is required.");
        return;
      }

      setStoreBulkUploading(true);

      const res = await createStoreInvoiceAndLinkItems({
        rowIds: storeSelectedRowIds,
        //vendorName: storeBulkVendorName,
        invoiceNumber: storeBulkInvoiceNumber,
        invoiceDate: storeBulkInvoiceDate,
        receivedDate: storeBulkReceivedDate,
        file: storeBulkFile,
      });

      if (!res?.success) {
        setStoreBulkError(res?.message || "Bulk invoice upload failed");
        return;
      }

      const webViewLink = res?.data?.webViewLink || res?.webViewLink || "";
      const driveFileId = res?.data?.driveFileId || res?.driveFileId || "";
      const invoiceId = res?.data?.invoiceId || res?.invoiceId || "";

      // Patch all selected rows with same invoice details so UI updates immediately
      storeSelectedRowIds.forEach((rowId) => {
        patchRowInTables(rowId, {
          storeInvoiceId: invoiceId,
          storeInvoiceNumber: storeBulkInvoiceNumber,
          storeInvoiceDate: storeBulkInvoiceDate,
          storeReceivedDate: storeBulkReceivedDate,
          //vendorName: storeBulkVendorName,
          invoicePdfWebViewLink: webViewLink,
          invoicePdfDriveFileId: driveFileId,
        });
      });

      setStoreBulkSuccess(
        `Invoice uploaded & linked to ${storeSelectedRowIds.length} item(s).`,
      );
      // Allow new invoice upload again: keep old data in DB, reset the form
      setStoreBulkFile(null);
      setStoreBulkFileKey((k) => k + 1);
      setStoreBulkInvoiceNumber("");
      setStoreBulkInvoiceDate("");
      setStoreBulkReceivedDate("");
      //setStoreBulkVendorName("");
      clearStoreSelection();
    } catch (err) {
      setStoreBulkError(
        err?.response?.data?.message ||
          err?.message ||
          "Bulk invoice upload failed",
      );
    } finally {
      setStoreBulkUploading(false);
    }
  };

  // ------------------ Fetch + filter data for table ------------------
  const fetchIndentForms = useCallback(async () => {
    try {
      const storedRole = localStorage.getItem("role") || "";
      const username = localStorage.getItem("username") || "";
      if (selectedOption === "System Logs") {
        setFilteredData([]);
        return;
      }

      // ✅ Special: Manual-Closed items (Store only)
      if (selectedOption === "Store" && findBy === "ManualClosed") {
        const res = await axios.get(
          `${API_BASE_URL}/indent/store/manual-closed`,
        );
        const rows = res.data?.data || [];
        setFilteredData(Array.isArray(rows) ? rows : []);
        return;
      }

      // ✅ Normal fetch: Indent / Local Purchase
      let response;
      if (selectedOption === "Local Purchase") {
        response = await getAllLocalPurchaseForms({
          role: storedRole,
          username,
        });
      } else {
        response = await getAllIndentForms({ role: storedRole, username });
      }

      // Support both helper shapes:
      // 1) { success:true, data:[...] }
      // 2) axios response { data:{ success:true, data:[...] } }
      const payload =
        response?.data?.success !== undefined ? response.data : response;
      const ok = payload?.success === true;
      let rows = ok && Array.isArray(payload?.data) ? payload.data : [];

      // -------- FILTER BY SITE --------
      if (findBy === "Site" && selectedSite) {
        rows = rows.filter((item) => item.site === selectedSite);
      }

      // -------- FILTER BY NAME --------
      if (findBy === "Name" && selectedName) {
        rows = rows.filter((item) => (item.doerName || "") === selectedName);
      }

      // -------- FILTER BY DATE --------
      if (findBy === "Date" && date) {
        rows = rows.filter((item) => item.date === date);
      }

      // -------- FILTER BY DATE RANGE --------
      if (findBy === "DateRange" && startDate && endDate) {
        rows = rows.filter(
          (item) => item.date >= startDate && item.date <= endDate,
        );
      }

      // -------- STORE FILTER BY I.N --------
      if (selectedOption === "Store" && findBy === "IN") {
        const q = String(storeInFilter || "").trim().toLowerCase();
        if (q) {
          rows = rows.filter((item) =>
            String(item.indentNumber || "")
              .toLowerCase()
              .includes(q),
          );
        }
      }

      // -------- STORE FILTER BY ITEM DESCRIPTION --------
      if (selectedOption === "Store" && findBy === "ItemDescription") {
        const q = String(storeItemDescriptionFilter || "")
          .trim()
          .toLowerCase();
        if (q) {
          rows = rows.filter((item) =>
            String(item.itemDescription || "")
              .toLowerCase()
              .includes(q),
          );
        }
      }

      setFilteredData(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.error("❌ Error fetching Purchase data:", error);
      setFilteredData([]);
    }
  }, [
    selectedOption,
    findBy,
    selectedSite,
    selectedName,
    storeInFilter,
    storeItemDescriptionFilter,
    date,
    startDate,
    endDate,
    API_BASE_URL,
  ]);

  // ✅ FindBy dropdown handler
  const handleFindByChange = (value) => {
    setFindBy(value);

    // reset filters when switching mode
    setSelectedSite("");
    setSelectedName("");
    setStoreInFilter("");
    setStoreItemDescriptionFilter("");
    setDate("");
    setStartDate("");
    setEndDate("");
  };

  // Map filteredData into tableData and snapshot DB fields
  useEffect(() => {
    const sortedRows = [...(filteredData || [])].sort((a, b) => {
      const t1 = getRowTimestamp(a);
      const t2 = getRowTimestamp(b);
      if (t1 !== t2) return t2 - t1;

      const u1 = String(a?.uniqueId || "");
      const u2 = String(b?.uniqueId || "");
      return u2.localeCompare(u1, undefined, { numeric: true });
    });

    const formattedData = sortedRows.map((r) => ({
      ...r,
      dbDoerName: r.doerName ?? "",
      dbDoerStatus: r.doerStatus ?? "",
      dbComparisonStatementStatus: r.comparisonStatementStatus ?? "",
      dbTechnicalApprovalStatus: r.technicalApprovalStatus ?? "",
      dbFinalizeTermsStatus: r.finalizeTermsStatus ?? "",
      dbGetApproval: r.getApproval ?? "",
      dbPoGenerationStatus: r.poGenerationStatus ?? "",
      dbApproverName: r.approverName ?? "",
      dbApproverName2: r.approverName2 ?? "",
      dbRemarksTechApproval: r.remarksTechApproval ?? "",
      dbRemarksCommercialNegotiation: r.remarksCommercialNegotiation ?? "",
    }));

    setTableData(formattedData);
    latestDataRef.current = formattedData;
  }, [filteredData, getRowTimestamp]);

  // Refetch when filters/option change
  useEffect(() => {
    fetchIndentForms();
  }, [fetchIndentForms]);

  // Load custom font once
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Agu+Display&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("authToken");
    navigate("/", { replace: true });
    window.location.reload();
  };

  const handleFieldChange = (id, field, value) => {
    const today = new Date().toISOString().split("T")[0];

    const isGetQuotationDone = field === "doerStatus" && value === "Done";
    const isGetQuotationNotDone = field === "doerStatus" && value !== "Done";

    const isTechApprovalDone =
      field === "technicalApprovalStatus" && value === "Done";
    const isTechApprovalNotDone =
      field === "technicalApprovalStatus" && value !== "Done";

    const isCommercialDone =
      field === "finalizeTermsStatus" && value === "Done";
    const isCommercialNotDone =
      field === "finalizeTermsStatus" && value !== "Done";

    const isPoDone = field === "poGenerationStatus" && value === "Done";
    const isPoNotDone = field === "poGenerationStatus" && value !== "Done";

    setTableData((prev) =>
      prev.map((r) => {
        if (r._id !== id) return r;

        return {
          ...r,
          [field]: value,

          // Get Quotation
          ...(isGetQuotationDone && { actualGetQuotation: today }),
          ...(isGetQuotationNotDone && { actualGetQuotation: "" }),

          // Technical Approval
          ...(isTechApprovalDone && { actualTechApproval: today }),
          ...(isTechApprovalNotDone && { actualTechApproval: "" }),

          // Commercial Negotiation
          ...(isCommercialDone && { actualCommercialNegotiation: today }),
          ...(isCommercialNotDone && { actualCommercialNegotiation: "" }),

          // PO Generation
          ...(isPoDone && { actualPoGeneration: today }),
          ...(isPoNotDone && { actualPoGeneration: "" }),
        };
      }),
    );

    setChangedRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,

        // Get Quotation
        ...(isGetQuotationDone && { actualGetQuotation: today }),
        ...(isGetQuotationNotDone && { actualGetQuotation: "" }),

        // Technical Approval
        ...(isTechApprovalDone && { actualTechApproval: today }),
        ...(isTechApprovalNotDone && { actualTechApproval: "" }),

        // Commercial Negotiation
        ...(isCommercialDone && { actualCommercialNegotiation: today }),
        ...(isCommercialNotDone && { actualCommercialNegotiation: "" }),

        // PO Generation
        ...(isPoDone && { actualPoGeneration: today }),
        ...(isPoNotDone && { actualPoGeneration: "" }),
      },
    }));
  };

  // ---------------------- Store Manual Close handlers ----------------------
  const handleFetchManualClose = async () => {
    setManualCloseError("");
    setManualCloseSuccess("");
    setManualCloseRecord(null);

    const uid = (manualCloseUniqueId || "").trim();
    if (!uid) {
      setManualCloseError("Please enter a Unique ID.");
      return;
    }

    try {
      setManualCloseLoading(true);
      const res = await getPurchaseByUniqueId(uid);
      // apiRequest returns {success,data} from backend
      if (res?.success) {
        setManualCloseRecord(res.data);
      } else {
        setManualCloseError(res?.message || "Unique ID not found.");
      }
    } catch (e) {
      setManualCloseError(
        e?.response?.data?.message || e.message || "Failed to fetch Unique ID.",
      );
    } finally {
      setManualCloseLoading(false);
    }
  };

  const handleManualClose = async () => {
    setManualCloseError("");
    setManualCloseSuccess("");

    const uid = (manualCloseUniqueId || "").trim();
    if (!uid) {
      setManualCloseError("Please enter a Unique ID.");
      return;
    }
    if (!manualCloseReason.trim()) {
      setManualCloseError("Please enter a reason for manual closure.");
      return;
    }

    try {
      setManualCloseLoading(true);
      const closedBy = localStorage.getItem("username") || role || "";
      const res = await manualCloseStoreUniqueId({
        uniqueId: uid,
        closedBy,
        role: localStorage.getItem("role") || "",
        systemName: getClientSystemName(),
        reason: manualCloseReason.trim(),
      });

      if (res?.success) {
        setManualCloseSuccess("Manual close completed successfully.");
        setManualCloseReason("");
        setManualCloseRecord(res.data);

        // Refresh table so it reflects closed state
        try {
          const refreshed = await getAllIndentForms({
            role: localStorage.getItem("role"),
            username: localStorage.getItem("username") || "",
          });
          if (refreshed?.success) setTableData(refreshed.data || []);
        } catch (e) {
          console.warn("⚠️ Refresh after manual close failed:", e);
        }
      } else {
        setManualCloseError(res?.message || "Manual close failed.");
      }
    } catch (e) {
      setManualCloseError(
        e?.response?.data?.message || e.message || "Manual close failed.",
      );
    } finally {
      setManualCloseLoading(false);
    }
  };

  // (Removed unused toInputDateFormat helper to satisfy eslint)

  // (Removed duplicate fetchIndentForms implementation; the active one is declared above with useCallback)

  // Submit uses latestDataRef.current (always freshest snapshot) to build payloads
  // const handleSubmitUpdates = async () => {
  //   if (saving) return;

  //   if (Object.keys(changedRows).length === 0) {
  //     alert("No changes to save.");
  //     return;
  //   }

  //   setSaving(true);

  //   try {
  //     console.log("📤 Sending Changed Rows:", changedRows);

  //     //setChangedRowsForLogging(changedRows);
  //     for (const [id, changes] of Object.entries(changedRows)) {
  //       await updatePurchaseRow(id, changes);
  //       console.log("Updated ID:", id, "Data Sent:", changes);
  //     }

  //     alert("✅ Updates Saved Successfully!");

  //     // Refresh data from backend
  //     await fetchIndentForms();

  //     // Reset changedRows after successful update
  //     setChangedRows({});
  //   } catch (err) {
  //     console.error("❌ Save Error:", err);
  //     alert("Error saving changes.");
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  // ------------------ PDF Upload (Comparison Statement) ------------------
  // ------------------ PDF Upload (Comparison Statement) ------------------
  const handlePdfUpload = async (rowId, file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Only PDF files can be uploaded.");
      return;
    }

    // ✅ Debug: confirm this function is being called
    console.log(
      "📤 Uploading rowId:",
      rowId,
      "file:",
      file?.name,
      "type:",
      file?.type,
    );

    try {
      const res = await uploadComparisonPDF(rowId, file);

      // ✅ Debug: see exact backend response
      console.log("✅ PDF upload response:", res);

      // ✅ backend returns webViewLink (new) OR fileUrl (old)
      const link = res?.webViewLink || res?.fileUrl || "";

      if (!link) {
        console.error(
          "❌ Upload succeeded but no link returned. Response:",
          res,
        );
        alert("Upload failed: no PDF link returned.");
        return;
      }

      alert("✅ PDF uploaded successfully!");

      // ✅ Update UI instantly even before refresh
      setPdfPreview((prev) => ({ ...prev, [rowId]: link }));
      setUploadedFiles((prev) => ({ ...prev, [rowId]: file.name }));

      // ✅ Refresh to get updated row fields from DB
      await fetchIndentForms();
    } catch (err) {
      // ✅ Show actual backend error text (very important)
      const backendMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to upload PDF.";

      console.error("❌ PDF Upload Error:", err?.response?.data || err);
      alert(`Failed to upload PDF: ${backendMsg}`);
    }
  };

  const addToLocalPurchase = async (payload) => {
    if (!Array.isArray(payload.indentIds) || payload.indentIds.length === 0) {
      throw new Error("indentIds array is required");
    }

    const requestPayload = {
      ...payload,
      username: localStorage.getItem("username") || "",
      role: localStorage.getItem("role") || "",
      systemName: getClientSystemName(),
    };

    const res = await fetch(`${API_BASE_URL}/indent/add-to-localPurchase`, {
      method: "POST",
      headers: getClientHeaders(),
      body: JSON.stringify(requestPayload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed");
    }

    return data;
  };

  const handleSubmitUpdates = async () => {
    if (saving) return;

    if (Object.keys(changedRows).length === 0) {
      alert("No changes to save.");
      return;
    }
    // ✅ If user is in Local Purchase section and selected rows for BULK update,
    // apply invoiceDate/vendorName/remarks in one shot.
    if (selectedOption === "Local Purchase" && lpSelectedRowIds.length > 0) {
      try {
        setSaving(true);
        setLpBulkError("");
        setLpBulkSuccess("");

        const resp = await bulkUpdateLocalPurchaseSelected({
          rowIds: lpSelectedRowIds,
          invoiceDate: lpBulkInvoiceDate,
          //invoiceNumber: lpBulkInvoiceNumber,
          //modeOfTransport: lpBulkModeOfTransport,
          //transporterName: lpBulkTransporterName,
          invoiceNumber: lpBulkInvoiceNumber,
          vendorName: lpBulkVendorName,
          modeOfTransport: lpBulkModeOfTransport,
          transporterName: lpBulkTransporterName,
          remarks: lpBulkRemarks,
        });

        // Update UI locally
        setTableData((prev) =>
          (prev || []).map((r) => {
            if (!lpSelectedRowIds.includes(r._id)) return r;
            return {
              ...r,
              invoiceDate:
                lpBulkInvoiceDate !== "" ? lpBulkInvoiceDate : r.invoiceDate,
              vendorName:
                lpBulkVendorName !== "" ? lpBulkVendorName : r.vendorName,
              remarks: lpBulkRemarks !== "" ? lpBulkRemarks : r.remarks,
            };
          }),
        );

        setLpBulkSuccess(
          resp?.message || "Local Purchase bulk update completed.",
        );
        clearLpSelection();
        setChangedRows({});
        await fetchIndentForms();
        return;
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Bulk update failed";
        setLpBulkError(msg);
        return;
      } finally {
        setSaving(false);
      }
    }

    setSaving(true);

    try {
      console.log("📤 Sending Changed Rows:", changedRows);

      const localPurchaseBuckets = {
        "Local 1": [],
        "Local 2": [],
        "Local 3": [],
      };

      for (const [id, changes] of Object.entries(changedRows)) {
        // 🔁 CONDITIONAL UPDATE
        if (selectedOption === "Local Purchase") {
          await updateLocalPurchaseRow(id, changes);
          console.log("🟢 Local Purchase Updated:", id);
        } else {
          await updatePurchaseRow(id, changes);
          console.log("🔵 Purchase Updated:", id);

          // 🧾 Collect IDs for bulk Local Purchase
          if (localPurchaseBuckets[changes.doerName]) {
            localPurchaseBuckets[changes.doerName].push(id);
          }
        }
      }

      console.log("🧾 Local Purchase Buckets:", localPurchaseBuckets);

      // 🚀 BULK API CALL (per Local Purchase bucket)
      for (const [doerName, indentIds] of Object.entries(
        localPurchaseBuckets,
      )) {
        if (!Array.isArray(indentIds) || indentIds.length === 0) continue;

        const response = await addToLocalPurchase({
          indentIds,
          doerName, // "Local 1" | "Local 2" | "Local 3"
        });

        console.log(`🚀 Bulk Local Purchase Response (${doerName}):`, response);
      }

      alert("✅ Updates Saved Successfully!");

      // 🔄 Refresh data
      await fetchIndentForms();

      // ♻ Reset changes
      setChangedRows({});
    } catch (err) {
      console.error("❌ Save Error:", err);
      alert(err.message || "Error saving changes.");
    } finally {
      setSaving(false);
    }
  };
  const isDefaultEditable =
    selectedOption === "Indent Verification" ||
    selectedOption === "Local Purchase" ||
    selectedOption === "PMS Master Sheet";
  const mobileNavOptions = React.useMemo(
    () => [
      ...new Set(
        Object.values(navLinks)
          .flat()
          .map((link) => link.name),
      ),
    ],
    [navLinks],
  );

  return (
    <div className="purchase-shell min-h-screen font-poppins">
      <style>{`
        .purchase-shell {
          --bg-1: #f7f1e8;
          --bg-2: #fbe7d5;
          --ink: #1f2937;
          --accent: #c0392b;
          --accent-2: #ffb347;
          --panel: #ffffff;
          --panel-edge: #f0e5d8;
          background:
            radial-gradient(1200px 600px at 85% -10%, rgba(255,179,71,0.25), transparent 60%),
            radial-gradient(900px 500px at -10% 10%, rgba(192,57,43,0.15), transparent 55%),
            linear-gradient(135deg, var(--bg-1), var(--bg-2));
          color: var(--ink);
          font-family: "Sora", "Agu Display", sans-serif;
        }

        .purchase-shell .purchase-topnav {
          position: sticky;
          top: 0;
          z-index: 20;
          backdrop-filter: blur(8px);
          background: rgba(247, 241, 232, 0.65);
          border-bottom: 1px solid rgba(31, 41, 55, 0.08);
        }

        .purchase-shell .purchase-sidebar {
          background: rgba(255, 255, 255, 0.7);
          border-right: 1px solid rgba(31, 41, 55, 0.08);
          backdrop-filter: blur(6px);
        }

        .purchase-shell .purchase-card {
          background: var(--panel);
          border: 1px solid var(--panel-edge);
          box-shadow: 0 20px 60px rgba(17, 24, 39, 0.12);
        }

        .purchase-shell .sticky-item-description {
          position: sticky;
          left: 0;
          z-index: 6;
          background: #ffffff;
          background-clip: padding-box;
          box-shadow: 2px 0 0 rgba(17, 24, 39, 0.08);
          width: 260px;
          min-width: 260px;
          max-width: 260px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .purchase-shell .sticky-item-description-head {
          z-index: 30;
          background: #e5e7eb;
        }

        @media (max-width: 1023px) {
          .purchase-shell .sticky-item-description,
          .purchase-shell .sticky-item-description-head {
            position: static;
            left: auto;
            width: auto;
            min-width: 0;
            max-width: none;
            z-index: auto;
            box-shadow: none;
            overflow: visible;
            text-overflow: clip;
          }
        }
      `}</style>
      <PurchaseTopNav onLogout={handleLogout} />
      <PurchaseSidebar
        navLinks={navLinks}
        selectedOption={selectedOption}
        role={role}
        onSelectLink={(name) => {
          if (name === "Transport") {
            navigate("/transport");
          } else {
            setSelectedOption(name);
          }
        }}
        onAddUser={() => navigate("/add-user")}
        onEditPassword={() => navigate("/edit-password")}
        currentUsername={localStorage.getItem("username") || ""}
      />

      <div className="lg:hidden px-4 sm:px-6">
        <div className="purchase-card rounded-2xl p-3 sm:p-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Section
          </label>
          <select
            className="w-full border rounded-lg p-2 text-sm"
            value={selectedOption}
            onChange={(e) => {
              const name = e.target.value;
              if (name === "Transport") {
                navigate("/transport");
              } else {
                setSelectedOption(name);
              }
            }}
          >
            {mobileNavOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ------------------ MAIN CONTENT ------------------ */}
      <main className="px-4 pb-6 sm:px-6 lg:ml-64 lg:px-8">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="purchase-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8"
        >
          {selectedOption !== "System Logs" && (
            <PurchaseFilterBar
              selectedOption={selectedOption}
              pcFollowUp={pcFollowUp}
              setPcFollowUp={setPcFollowUp}
              paymentFollowUp={paymentFollowUp}
              setPaymentFollowUp={setPaymentFollowUp}
              showExcessBox={showExcessBox}
              setShowExcessBox={setShowExcessBox}
              findBy={findBy}
              handleFindByChange={handleFindByChange}
              selectedSite={selectedSite}
              setSelectedSite={setSelectedSite}
              selectedName={selectedName}
              setSelectedName={setSelectedName}
              storeInFilter={storeInFilter}
              setStoreInFilter={setStoreInFilter}
              storeItemDescriptionFilter={storeItemDescriptionFilter}
              setStoreItemDescriptionFilter={setStoreItemDescriptionFilter}
              date={date}
              setDate={setDate}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
          )}

          <div className="mb-8 p-4 bg-red-600 rounded-xl shadow-md text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Purchase
            </h1>
          </div>

          {selectedOption === "Summary Report" && (
            <SummaryReportSection summaryReport={summaryReport} />
          )}

          {selectedOption === "System Logs" && (
            <SystemLogsSection username={username} />
          )}

          {selectedOption !== "Summary Report" &&
            selectedOption !== "System Logs" && (
              <div className="w-full max-h-[65vh] sm:max-h-[70vh] overflow-auto rounded-xl border border-gray-200">
                {selectedOption === "Store" && (
                  <StoreManualCloseSection
                    manualCloseUniqueId={manualCloseUniqueId}
                    setManualCloseUniqueId={setManualCloseUniqueId}
                    handleFetchManualClose={handleFetchManualClose}
                    manualCloseLoading={manualCloseLoading}
                    manualCloseReason={manualCloseReason}
                    setManualCloseReason={setManualCloseReason}
                    handleManualClose={handleManualClose}
                    manualCloseRecord={manualCloseRecord}
                    manualCloseError={manualCloseError}
                    manualCloseSuccess={manualCloseSuccess}
                  />
                )}

                {selectedOption === "Store" && (
                  <StoreBulkInvoiceSection
                    renderedTableData={renderedTableData}
                    setStoreSelectedRowIds={setStoreSelectedRowIds}
                    clearStoreSelection={clearStoreSelection}
                    storeSelectedRowIds={storeSelectedRowIds}
                    storeBulkInvoiceNumber={storeBulkInvoiceNumber}
                    setStoreBulkInvoiceNumber={setStoreBulkInvoiceNumber}
                    storeBulkInvoiceDate={storeBulkInvoiceDate}
                    setStoreBulkInvoiceDate={setStoreBulkInvoiceDate}
                    storeBulkReceivedDate={storeBulkReceivedDate}
                    setStoreBulkReceivedDate={setStoreBulkReceivedDate}
                    storeBulkFileKey={storeBulkFileKey}
                    setStoreBulkFile={setStoreBulkFile}
                    handleStoreBulkInvoiceUpload={handleStoreBulkInvoiceUpload}
                    storeBulkUploading={storeBulkUploading}
                    storeBulkError={storeBulkError}
                    storeBulkSuccess={storeBulkSuccess}
                  />
                )}

                {selectedOption === "PO Generation" && (
                  <PoBulkSection
                    poSelectedRowIds={poSelectedRowIds}
                    poBulkPoNumber={poBulkPoNumber}
                    setPoBulkPoNumber={setPoBulkPoNumber}
                    poBulkPoDate={poBulkPoDate}
                    setPoBulkPoDate={setPoBulkPoDate}
                    poBulkVendorName={poBulkVendorName}
                    setPoBulkVendorName={setPoBulkVendorName}
                    poBulkLeadDays={poBulkLeadDays}
                    setPoBulkLeadDays={setPoBulkLeadDays}
                    poBulkPaymentCondition={poBulkPaymentCondition}
                    setPoBulkPaymentCondition={setPoBulkPaymentCondition}
                    poBulkAmount={poBulkAmount}
                    setPoBulkAmount={setPoBulkAmount}
                    poBulkPapwDays={poBulkPapwDays}
                    setPoBulkPapwDays={setPoBulkPapwDays}
                    poBulkFileKey={poBulkFileKey}
                    setPoBulkFile={setPoBulkFile}
                    handlePoBulkUpload={handlePoBulkUpload}
                    poBulkUploading={poBulkUploading}
                    clearPoSelection={clearPoSelection}
                    setPoBulkError={setPoBulkError}
                    setPoBulkSuccess={setPoBulkSuccess}
                    poBulkError={poBulkError}
                    poBulkSuccess={poBulkSuccess}
                  />
                )}

                {/* ------------------ Local Purchase Bulk Update (Invoice Date / Vendor / Remarks) ------------------ */}
                {selectedOption === "Local Purchase" && (
                  <LocalPurchaseBulkSection
                    selectAllLpRows={selectAllLpRows}
                    renderedTableData={renderedTableData}
                    clearLpSelection={clearLpSelection}
                    lpBulkInvoiceDate={lpBulkInvoiceDate}
                    setLpBulkInvoiceDate={setLpBulkInvoiceDate}
                    lpBulkInvoiceNumber={lpBulkInvoiceNumber}
                    setLpBulkInvoiceNumber={setLpBulkInvoiceNumber}
                    lpBulkVendorName={lpBulkVendorName}
                    setLpBulkVendorName={setLpBulkVendorName}
                    lpBulkModeOfTransport={lpBulkModeOfTransport}
                    setLpBulkModeOfTransport={setLpBulkModeOfTransport}
                    lpBulkTransporterName={lpBulkTransporterName}
                    setLpBulkTransporterName={setLpBulkTransporterName}
                    lpBulkRemarks={lpBulkRemarks}
                    setLpBulkRemarks={setLpBulkRemarks}
                    handleLocalPurchaseBulkApply={handleLocalPurchaseBulkApply}
                    lpBulkUploading={lpBulkUploading}
                    lpSelectedRowIds={lpSelectedRowIds}
                    lpBulkError={lpBulkError}
                    lpBulkSuccess={lpBulkSuccess}
                  />
                )}

                <table className="min-w-max border border-gray-200 rounded-xl whitespace-nowrap text-xs">
                  <thead className="bg-gray-200 rounded-t-xl sticky top-0 z-20">
                    <tr className="text-sm">
                      {/* ------------------------- COMPARISON STATEMENT ------------------------- */}
                      {selectedOption === "Comparison Statement" ? (
                        <>
                          <th className="px-4 py-3 border-b w-[130px] text-left">
                            Date
                          </th>

                          <th className="px-4 py-3 border-b w-[140px] text-left">
                            Unique ID
                          </th>

                          <th className="px-4 py-3 border-b w-[160px] text-center text-red-700">
                            Upload PDF
                          </th>

                          <th className="px-4 py-3 border-b w-[130px] text-center text-red-700">
                            Show PDF
                          </th>

                          {/* PA sees Upload Status */}
                          {role === "PA" && (
                            <th className="px-4 py-3 border-b w-[150px] text-center text-red-700">
                              Upload Status
                            </th>
                          )}

                          {/* PSE sees Review Status */}
                          {role === "PSE" && (
                            <th className="px-4 py-3 border-b w-[150px] text-center text-red-700">
                              Review Status
                            </th>
                          )}
                        </>
                      ) : selectedOption === "Store" ? (
                        <>
                          {/* ✅ SELECT COLUMN */}
                          <th className="px-4 py-3 border-b text-center w-[50px]">
                            Select
                          </th>
                          {/* ------------------------- STORE COLUMNS ------------------------- */}
                          <th className="px-4 py-3 border-b">Date</th>
                          <th className="px-4 py-3 border-b">Site</th>
                          <th className="px-4 py-3 border-b">Unique Id</th>
                          <th className="px-4 py-3 border-b">I.N</th>
                          <th className="px-4 py-3 border-b">Item No</th>
                          <th className="px-4 py-3 border-b sticky-item-description sticky-item-description-head">
                            Item Description
                          </th>
                          <th className="px-4 py-3 border-b">UOM</th>
                          <th className="px-4 py-3 border-b">Total QTY</th>
                          <th className="px-4 py-3 border-b">Submitted By</th>
                          <th className="px-4 py-3 border-b">SECTION</th>
                          <th className="px-4 py-3 border-b">VENDOR NAME</th>

                          {/* Store fields */}
                          <th className="px-4 py-3 border-b text-red-700">
                            Status
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Received Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Received Quantity
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Balance Quantity
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Invoice Number
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Invoice Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700 whitespace-nowrap">
                            Upload Invoice
                          </th>
                          <th className="px-4 py-3 border-b text-red-700 whitespace-nowrap">
                            Show Invoice
                          </th>
                          <th className="px-4 py-3 border-b text-red-700 whitespace-nowrap">
                            Price
                          </th>

                          {/* Show dispatch + nigeria fields only for SUNAGROW / RICE FIELD selection */}
                          {(() => {
                            const siteKey = (selectedSite || "").toUpperCase();
                            const showAll =
                              siteKey === "SUNAGROW" ||
                              siteKey === "RICE FIELD" ||
                              siteKey === "";
                            return showAll;
                          })() && (
                            <>
                              <th className="px-4 py-3 border-b text-red-700 whitespace-nowrap">
                                Store Box Number
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Mode Of Dispatch
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Dispatch Document Number
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Dispatch Box Number
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Dispatch Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Received Date In Nigeria
                              </th>
                            </>
                          )}

                          <th className="px-4 py-3 border-b text-red-700">
                            Remarks (Store)
                          </th>

                          {(() => {
                            const siteKey = (selectedSite || "").toUpperCase();
                            const showAll =
                              siteKey === "SUNAGROW" ||
                              siteKey === "RICE FIELD" ||
                              siteKey === "";
                            return showAll;
                          })() && (
                            <th className="px-4 py-3 border-b text-red-700">
                              Remarks (Nigeria)
                            </th>
                          )}
                        </>
                      ) : (
                        <>
                          {/* ------------------------- DEFAULT COLUMNS ------------------------- */}
                          {selectedOption === "Store" && (
                            <th className="px-4 py-3 border-b text-red-700">
                              Select
                            </th>
                          )}
                          <th className="px-4 py-3 border-b">Date</th>
                          <th className="px-4 py-3 border-b">Site</th>
                          <th className="px-4 py-3 border-b">
                            {selectedOption === "Local Purchase"
                              ? "Unique ID (Same as Indent)"
                              : "Unique ID"}
                          </th>
                          <th className="px-4 py-3 border-b">Indent Number</th>
                          <th className="px-4 py-3 border-b">Item Number</th>
                          <th className="px-4 py-3 border-b sticky-item-description sticky-item-description-head">
                            Item Description
                          </th>
                          <th className="px-4 py-3 border-b">UOM</th>
                          <th className="px-4 py-3 border-b">Total Quantity</th>
                          <th className="px-4 py-3 border-b">Submitted By</th>
                          <th className="px-4 py-3 border-b">Section</th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Doer Name
                          </th>

                          {/* ------------------------- CONDITIONAL HEADERS ------------------------- */}
                          {selectedOption === "PMS Master Sheet" && (
                            <>
                              <th className="px-4 py-3 border-b text-red-700">
                                Planned Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Actual Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Send for Get Quotation
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Doer Status
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Time Delay
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Remarks
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Planned Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Actual Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Technical Approval Status
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Time Delay
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Approver Name
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Remarks
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Planned Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Actual Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Finalize Terms Status
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Time Delay
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Get Approval
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Approver Name
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Remarks
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Planned Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Actual Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                PO Generation Status
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Time Delay
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                PO Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                PO Number
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Upload PO
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Show PO
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Vendor Name
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Lead Days
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Amount
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Application Area
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Old Material Status
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Order Approved By
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Payment Condition
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Remarks
                              </th>
                            </>
                          )}

                          {selectedOption === "Indent Verification" && (
                            <>
                              <th className="px-4 py-3 border-b text-red-700">
                                Remarks
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Application Area
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Old Material Status
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Order Approved By
                              </th>
                            </>
                          )}

                          {selectedOption === "Get Quotation" && (
                            <>
                              <th className="px-4 py-3 border-b text-red-700">
                                Planned Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Actual Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Send for Get Quotation
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Doer Status
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Time Delay
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Remarks
                              </th>
                              <th className="px-4 py-2 border-b">Upload PDF</th>
                              <th className="px-4 py-2 border-b">Show PDF</th>
                            </>
                          )}

                          {selectedOption === "Technical Approval" && (
                            <>
                              <th className="px-4 py-3 border-b text-red-700">
                                Planned Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Actual Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Technical Approval Status
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Time Delay
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Approver Name
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Remarks
                              </th>
                            </>
                          )}

                          {selectedOption === "Commercial Negotiation" && (
                            <>
                              <th className="px-4 py-3 border-b text-red-700">
                                Planned Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Actual Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Finalize Terms Status
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Time Delay
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Get Approval
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Approver Name
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Remarks
                              </th>
                            </>
                          )}

                          {selectedOption === "PO Generation" && (
                            <>
                              <th className="px-4 py-3 border-b text-red-700">
                                Select
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Planned Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Actual Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                PO Generation Status
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Time Delay
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                PO Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                PO Number
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Upload PO
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Show PO
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Vendor Name
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Lead Days
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Amount
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Payment Condition
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Remarks
                              </th>
                            </>
                          )}

                          {selectedOption === "Local Purchase" && (
                            <>
                              <th className="px-4 py-3 border-b text-red-700">
                                Select
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Invoice Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Invoice Number
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Vendor Name
                              </th>
                              {/*<th className="px-4 py-3 border-b text-red-700">Application Area</th>
                          <th className="px-4 py-3 border-b text-red-700">Old Material Status</th>
                          <th className="px-4 py-3 border-b text-red-700">Order Approved By</th>
                          <th className="px-4 py-3 border-b text-red-700">Local Purchase Image</th>*/}
                              <th className="px-4 py-3 border-b text-red-700">
                                Mode of Transport
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Transporter Name
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Remarks
                              </th>
                            </>
                          )}

                          {(selectedOption === "PC Follow Up" ||
                            selectedOption === "Payment Follow Up") && (
                            <>
                              <th className="px-4 py-3 border-b text-red-700">
                                PO Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                PO Number
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Upload PO
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Show PO
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Vendor Name
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Lead Days
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Payment Condition
                              </th>

                              {/* Extra column only for Payment Follow Up */}
                              {selectedOption === "Payment Follow Up" && (
                                <th className="px-4 py-3 border-b text-red-700">
                                  Transaction Number
                                </th>
                              )}

                              <th className="px-4 py-3 border-b text-red-700">
                                Planned Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Actual Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Follow Up Status
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Time Delay
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Remarks
                              </th>
                            </>
                          )}

                          {selectedOption === "Material Received" && (
                            <>
                              <th className="px-4 py-3 border-b text-red-700">
                                Planned Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Actual Date
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Time Delay
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Material Received Date (PSE)
                              </th>
                              <th className="px-4 py-3 border-b text-red-700">
                                Store Received Date
                              </th>
                            </>
                          )}
                        </>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {finalTableData.map((row, index) => (
                      <React.Fragment key={row._id || index}>
                        {selectedOption === "Comparison Statement" ? (
                          /* ------------- ONLY FOR COMPARISON STATEMENT ------------- */
                          <tr
                            key={row._id || index}
                            className={`
      h-4 transition
      ${
        row.comparisonStatementStatus === "Reopen"
          ? "bg-yellow-200 hover:bg-yellow-300"
          : index % 2 === 0
          ? "bg-gray-50 hover:bg-red-50"
          : "bg-white hover:bg-red-50"
      }
    `}
                          >
                            {/* Date */}
                            <td className="px-4 py-0 border-b w-[130px] text-left">
                              {row.date}
                            </td>

                            {/* Unique ID */}
                            <td className="px-4 py-0 border-b w-[140px] text-left">
                              {row.uniqueId}
                            </td>

                            {/* Upload PDF */}
                            <td className="px-4 py-1 border-b w-[160px]">
                              {(() => {
                                const isPA =
                                  localStorage.getItem("role") === "PA";
                                const isDone =
                                  row.comparisonStatementStatus === "Done";
                                const isReadOnly = isPA && isDone;

                                // ✅ SINGLE SOURCE OF TRUTH (from Mongo)
                                const savedDriveLink =
                                  row.comparisonStatementPdf || "";

                                const localPreviewLink =
                                  pdfPreview[row._id] || "";

                                return (
                                  <div className="flex items-center justify-center gap-2">
                                    {/* Hidden File Input */}
                                    <input
                                      id={`pdfInput_${row._id}`}
                                      type="file"
                                      accept="application/pdf"
                                      className="hidden"
                                      disabled={isReadOnly}
                                      onChange={(e) => {
                                        if (isReadOnly) return;

                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        const previewUrl =
                                          URL.createObjectURL(file);

                                        setPdfPreview((prev) => ({
                                          ...prev,
                                          [row._id]: previewUrl,
                                        }));

                                        setUploadedFiles((prev) => ({
                                          ...prev,
                                          [row._id]: file.name,
                                        }));

                                        handlePdfUpload(row._id, file);
                                      }}
                                    />
                                    {/* Upload Button */}
                                    <button
                                      type="button"
                                      disabled={isReadOnly}
                                      onClick={() =>
                                        !isReadOnly &&
                                        document
                                          .getElementById(`pdfInput_${row._id}`)
                                          ?.click()
                                      }
                                      className={`flex items-center gap-2 px-3 py-0.5 rounded transition ${
                                        isReadOnly
                                          ? "bg-gray-400 cursor-not-allowed text-white"
                                          : "bg-blue-600 hover:bg-blue-700 text-white"
                                      }`}
                                    >
                                      <FaFileUpload /> Upload
                                    </button>
                                    {/* Local uploaded file (same session) */}
                                    {uploadedFiles[row._id] &&
                                      localPreviewLink && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            window.open(
                                              localPreviewLink,
                                              "_blank",
                                            )
                                          }
                                          className="px-2 py-0.5 rounded font-medium transition"
                                          style={{
                                            backgroundColor: "#F5D038",
                                            color: "#000",
                                          }}
                                          title="Open uploaded file"
                                        >
                                          {uploadedFiles[row._id]}
                                        </button>
                                      )}

                                    {/* Already uploaded (from DB) */}
                                    {savedDriveLink && (
                                      <span className="text-xs text-green-700 font-semibold">
                                        Uploaded
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
                            </td>

                            {/* Show PDF */}
                            <td className="px-4 py-1 border-b w-[130px] text-center">
                              {(() => {
                                const savedDriveLink =
                                  row.comparisonStatementPdf || "";
                                const localPreviewLink =
                                  pdfPreview[row._id] || "";

                                const showPdfLink =
                                  localPreviewLink || savedDriveLink;

                                return (
                                  <button
                                    type="button"
                                    disabled={!showPdfLink}
                                    onClick={() =>
                                      showPdfLink &&
                                      window.open(showPdfLink, "_blank")
                                    }
                                    className={`px-3 py-0.5 rounded font-medium transition ${
                                      showPdfLink
                                        ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                                    }`}
                                  >
                                    Show PDF
                                  </button>
                                );
                              })()}
                            </td>

                            {/* Status column: PA -> Upload Status, PSE -> Review Status */}
                            {role === "PA" && (
                              <td className="px-4 py-1 border-b w-[150px] text-center">
                                <select
                                  className="border p-1 rounded w-[120px]"
                                  value={row.comparisonStatementStatus ?? ""}
                                  disabled={
                                    localStorage.getItem("role") === "PA" &&
                                    row.comparisonStatementStatus === "Done"
                                  }
                                  onChange={(e) =>
                                    handleFieldChange(
                                      row._id,
                                      "comparisonStatementStatus",
                                      e.target.value,
                                    )
                                  }
                                >
                                  <option value="">--Select--</option>
                                  <option value="Hold">Hold</option>
                                  <option value="Cancelled">Cancelled</option>
                                  <option value="Done">Done</option>
                                  <option value="Reopen">Reopen</option>
                                </select>
                              </td>
                            )}

                            {role === "PSE" && (
                              <td className="px-4 py-1 border-b w-[150px] text-center">
                                <select
                                  className="border p-1 rounded w-[120px]"
                                  value={row.comparisonStatementStatus ?? ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      row._id,
                                      "comparisonStatementStatus",
                                      e.target.value,
                                    )
                                  }
                                >
                                  <option value="">--Select--</option>
                                  <option value="Hold">Hold</option>
                                  <option value="Cancelled">Cancelled</option>
                                  <option value="Done">Done</option>
                                  <option value="Reopen">Reopen</option>
                                </select>
                              </td>
                            )}
                          </tr>
                        ) : selectedOption === "Store" ? (
                          /* ------------- STORE SECTION ------------- */
                          <tr
                            key={row._id || index}
                            className={
                              selectedOption === "Store" &&
                              row.storeManualClosed
                                ? "bg-blue-100 border-l-4 border-blue-600 hover:bg-blue-200 transition"
                                : selectedOption === "Material Received" &&
                                  isMaterialMismatch(row)
                                ? "bg-red-200 hover:bg-red-300 transition"
                                : `${
                                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                  } hover:bg-red-50 transition`
                            }
                          >
                            {(() => {
                              const currentRole =
                                localStorage.getItem("role") || "";
                              const currentUser =
                                localStorage.getItem("username") || "";
                              const isAdmin = currentRole === "ADMIN";
                              const isStore = currentRole === "Store";

                              const isNigeriaStoreUser =
                                isStore &&
                                currentUser === "Store Person Nigeria";
                              const isHiplStoreUser =
                                isStore && currentUser === "Store Person HIPL";

                              const siteKey = (
                                selectedSite || ""
                              ).toUpperCase();
                              const showAll =
                                siteKey === "SUNAGROW" ||
                                siteKey === "RICE FIELD" ||
                                siteKey === "";

                              // Balance is auto-calculated:
                              // Balance Qty = Total Qty - Received Qty
                              const totalQty = Number(row.totalQuantity ?? 0);
                              const receivedQty = Math.max(
                                0,
                                Number(row.storeReceivedQuantity ?? 0),
                              );
                              const computedBalanceQty = receivedQty - totalQty;

                              // If a row is manually closed, lock received/invoice edits to avoid accidental changes.
                              const isStoreManuallyClosed = Boolean(
                                row.storeManualClosed,
                              );

                              // Permissions:
                              // - Admin: edit all store fields
                              // - Store Person HIPL: can edit all Store (HIPL) fields (Status..Remarks)
                              //   but can change Received Qty/Date + Invoice No/Date only while balance > 0.
                              // - Store Person Nigeria: edit only Nigeria fields
                              const canEditNigeriaFields =
                                isAdmin || isNigeriaStoreUser;
                              const canEditStoreFields =
                                isAdmin || isHiplStoreUser;
                              // ✅ Allow editing received qty/date even when balance is 0 (including excess receipt).
                              // Only block edits after manual close.
                              const canEditReceivedAndInvoice =
                                (isAdmin || isHiplStoreUser) &&
                                !isStoreManuallyClosed;

                              return (
                                <>
                                  {/* Base fields (from DB) */}
                                  <td className="px-4 py-2 border-b text-center">
                                    <input
                                      type="checkbox"
                                      checked={isStoreRowSelected(row._id)}
                                      onChange={() =>
                                        toggleStoreRowSelected(row._id)
                                      }
                                      disabled={
                                        !row._id || isStoreManuallyClosed
                                      }
                                    />
                                  </td>
                                  <td className="px-4 py-2 border-b">
                                    {row.date}
                                  </td>
                                  <td className="px-4 py-2 border-b">
                                    {row.site}
                                  </td>
                                  <td className="px-4 py-2 border-b">
                                    {row.uniqueId}
                                  </td>
                                  <td className="px-4 py-2 border-b">
                                    {row.indentNumber}
                                  </td>
                                  <td className="px-4 py-2 border-b">
                                    {row.itemNumber}
                                  </td>
                                  <td className="px-4 py-2 border-b sticky-item-description">
                                    {row.itemDescription}
                                  </td>
                                  <td className="px-4 py-2 border-b">
                                    {row.uom}
                                  </td>
                                  <td className="px-4 py-2 border-b">
                                    {row.totalQuantity}
                                  </td>
                                  <td className="px-4 py-2 border-b">
                                    {row.submittedBy}
                                  </td>
                                  <td className="px-4 py-2 border-b">
                                    {row.section}
                                  </td>
                                  <td className="px-4 py-2 border-b">
                                    {row.vendorName}
                                  </td>

                                  {/* Store fields */}
                                  <td className="px-4 py-2 border-b">
                                    <select
                                      className="border p-1 rounded"
                                      value={row.storeStatus ?? ""}
                                      disabled={!canEditStoreFields}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          row._id,
                                          "storeStatus",
                                          e.target.value,
                                        )
                                      }
                                    >
                                      <option value="">--Select--</option>
                                      <option value="Received">Received</option>
                                    </select>
                                  </td>

                                  <td className="px-4 py-2 border-b">
                                    <input
                                      type="date"
                                      className="border p-1 rounded"
                                      value={row.storeReceivedDate ?? ""}
                                      disabled={!canEditReceivedAndInvoice}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          row._id,
                                          "storeReceivedDate",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </td>

                                  <td className="px-4 py-2 border-b">
                                    <input
                                      type="number"
                                      className="border p-1 rounded"
                                      value={row.storeReceivedQuantity ?? ""}
                                      disabled={!canEditReceivedAndInvoice}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          row._id,
                                          "storeReceivedQuantity",
                                          parseOptionalNumber(e.target.value),
                                        )
                                      }
                                    />
                                  </td>

                                  <td className="px-4 py-2 border-b">
                                    <div className="border p-1 rounded bg-gray-100">
                                      {computedBalanceQty > 0 ? (
                                        <>
                                          <span className="text-green-600 font-semibold">
                                            +
                                          </span>
                                          <span>{computedBalanceQty}</span>
                                        </>
                                      ) : (
                                        <span>
                                          {Math.abs(computedBalanceQty)}
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  <td className="px-4 py-2 border-b">
                                    <textarea
                                      rows={2}
                                      className="border p-1 rounded w-full min-w-[180px]"
                                      value={row.storeInvoiceNumber ?? ""}
                                      disabled={!canEditReceivedAndInvoice}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          row._id,
                                          "storeInvoiceNumber",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </td>

                                  <td className="px-4 py-2 border-b">
                                    <input
                                      type="date"
                                      className="border p-1 rounded"
                                      value={row.storeInvoiceDate ?? ""}
                                      disabled={!canEditReceivedAndInvoice}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          row._id,
                                          "storeInvoiceDate",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </td>

                                  <td className="px-4 py-2 border-b">
                                    <input
                                      type="file"
                                      accept="application/pdf"
                                      disabled={
                                        uploadingInvoiceRowId === row._id
                                      }
                                      onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (!f) return;
                                        handleInvoiceUpload(row._id, f);
                                        e.target.value = "";
                                      }}
                                    />
                                  </td>

                                  <td className="px-4 py-2 border-b">
                                    {row.invoicePdfWebViewLink ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          window.open(
                                            row.invoicePdfWebViewLink,
                                            "_blank",
                                          )
                                        }
                                        disabled={
                                          uploadingInvoiceRowId === row._id
                                        }
                                        className="btn btn-sm btn-primary"
                                      >
                                        Show Invoice
                                      </button>
                                    ) : (
                                      <span style={{ color: "#888" }}>
                                        No Invoice
                                      </span>
                                    )}
                                  </td>

                                  <td className="px-4 py-2 border-b">
                                    <input
                                      type="number"
                                      className="border p-1 rounded"
                                      value={row.storePrice ?? ""}
                                      disabled={!canEditStoreFields}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          row._id,
                                          "storePrice",
                                          parseOptionalNumber(e.target.value),
                                        )
                                      }
                                    />
                                  </td>

                                  {showAll && (
                                    <>
                                      <td className="px-4 py-2 border-b">
                                        <input
                                          type="number"
                                          className="border p-1 rounded"
                                          value={row.storeBoxNumber ?? ""}
                                          disabled={!canEditStoreFields}
                                          onChange={(e) =>
                                            handleFieldChange(
                                              row._id,
                                              "storeBoxNumber",
                                              parseOptionalNumber(
                                                e.target.value,
                                              ),
                                            )
                                          }
                                        />
                                      </td>

                                      <td className="px-4 py-2 border-b">
                                        <textarea
                                          rows={2}
                                          className="border p-1 rounded w-full min-w-[180px]"
                                          value={row.storeModeOfDispatch ?? ""}
                                          disabled={!canEditStoreFields}
                                          onChange={(e) =>
                                            handleFieldChange(
                                              row._id,
                                              "storeModeOfDispatch",
                                              e.target.value,
                                            )
                                          }
                                        />
                                      </td>

                                      <td className="px-4 py-2 border-b">
                                        <textarea
                                          rows={2}
                                          className="border p-1 rounded w-full min-w-[180px]"
                                          value={
                                            row.storeDispatchDocumentNumber ??
                                            ""
                                          }
                                          disabled={!canEditStoreFields}
                                          onChange={(e) =>
                                            handleFieldChange(
                                              row._id,
                                              "storeDispatchDocumentNumber",
                                              e.target.value,
                                            )
                                          }
                                        />
                                      </td>

                                      <td className="px-4 py-2 border-b">
                                        <input
                                          type="number"
                                          className="border p-1 rounded"
                                          value={
                                            row.storeDispatchBoxNumber ?? ""
                                          }
                                          disabled={!canEditStoreFields}
                                          onChange={(e) =>
                                            handleFieldChange(
                                              row._id,
                                              "storeDispatchBoxNumber",
                                              parseOptionalNumber(
                                                e.target.value,
                                              ),
                                            )
                                          }
                                        />
                                      </td>

                                      <td className="px-4 py-2 border-b">
                                        <input
                                          type="date"
                                          className="border p-1 rounded"
                                          value={row.storeDispatchDate ?? ""}
                                          disabled={!canEditStoreFields}
                                          onChange={(e) =>
                                            handleFieldChange(
                                              row._id,
                                              "storeDispatchDate",
                                              e.target.value,
                                            )
                                          }
                                        />
                                      </td>

                                      <td className="px-4 py-2 border-b">
                                        <input
                                          type="date"
                                          className="border p-1 rounded"
                                          value={
                                            row.storeReceivedDateNigeria ?? ""
                                          }
                                          disabled={!canEditNigeriaFields}
                                          onChange={(e) =>
                                            handleFieldChange(
                                              row._id,
                                              "storeReceivedDateNigeria",
                                              e.target.value,
                                            )
                                          }
                                        />
                                      </td>
                                    </>
                                  )}

                                  <td className="px-4 py-2 border-b">
                                    <textarea
                                      rows={2}
                                      className="border p-1 rounded w-full min-w-[180px]"
                                      value={row.storeRemarks ?? ""}
                                      disabled={!canEditStoreFields}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          row._id,
                                          "storeRemarks",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </td>

                                  {showAll && (
                                    <td className="px-4 py-2 border-b">
                                      <textarea
                                        rows={2}
                                        className="border p-1 rounded w-full min-w-[180px]"
                                        value={row.storeNigeriaRemarks ?? ""}
                                        disabled={!canEditNigeriaFields}
                                        onChange={(e) =>
                                          handleFieldChange(
                                            row._id,
                                            "storeNigeriaRemarks",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </td>
                                  )}
                                </>
                              );
                            })()}
                          </tr>
                        ) : (
                          /* ------------- ALL OTHER SECTIONS (DEFAULT TABLE) ------------- */
                          <tr
                            key={row._id || index}
                            className={
                              selectedOption === "Material Received" &&
                              isMaterialMismatch(row)
                                ? "bg-red-200 hover:bg-red-300 transition"
                                : `${
                                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                  } hover:bg-red-50 transition`
                            }
                          >
                            {/* DATE */}
                            <td className="px-4 py-2 border-b">
                              {isDefaultEditable ? (
                                <input
                                  type="date"
                                  className="border p-1 rounded w-full"
                                  value={row.date ?? ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      row._id,
                                      "date",
                                      e.target.value,
                                    )
                                  }
                                />
                              ) : row.date ? (
                                new Date(row.date)
                                  .toLocaleDateString("en-GB")
                                  .replace(/\//g, "-")
                              ) : (
                                ""
                              )}
                            </td>

                            {/* SITE */}
                            <td className="px-4 py-2 border-b">
                              {isDefaultEditable ? (
                                <select
                                  className="border p-1 rounded w-full"
                                  value={row.site ?? ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      row._id,
                                      "site",
                                      e.target.value,
                                    )
                                  }
                                >
                                  <option value="">Select Site</option>
                                  <option value="HIPL">HIPL</option>
                                  <option value="RSIPL">RSIPL</option>
                                  <option value="HRM">HRM</option>
                                  <option value="SUNAGROW">SUNAGROW</option>
                                  <option value="RICE FIELD">RICE FIELD</option>
                                </select>
                              ) : (
                                row.site
                              )}
                            </td>

                            {/* UNIQUE ID (ALWAYS READ ONLY) */}
                            <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                              {row.uniqueId}
                            </td>

                            {/* INDENT NUMBER */}
                            <td className="px-4 py-2 border-b">
                              {isDefaultEditable ? (
                                <input
                                  type="text"
                                  className="border p-1 rounded w-full"
                                  value={row.indentNumber ?? ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      row._id,
                                      "indentNumber",
                                      e.target.value,
                                    )
                                  }
                                />
                              ) : (
                                row.indentNumber
                              )}
                            </td>

                            {/* ITEM NUMBER */}
                            <td className="px-4 py-2 border-b">
                              {isDefaultEditable ? (
                                <input
                                  type="text"
                                  className="border p-1 rounded w-full"
                                  value={row.itemNumber ?? ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      row._id,
                                      "itemNumber",
                                      e.target.value,
                                    )
                                  }
                                />
                              ) : (
                                row.itemNumber
                              )}
                            </td>

                            {/* ITEM DESCRIPTION */}
                            <td className="px-4 py-2 border-b sticky-item-description">
                              {isDefaultEditable ? (
                                <input
                                  type="text"
                                  className="border p-1 rounded w-full"
                                  value={row.itemDescription ?? ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      row._id,
                                      "itemDescription",
                                      e.target.value,
                                    )
                                  }
                                />
                              ) : (
                                row.itemDescription
                              )}
                            </td>

                            {/* UOM */}
                            <td className="px-4 py-2 border-b">
                              {isDefaultEditable ? (
                                <input
                                  type="text"
                                  className="border p-1 rounded w-full"
                                  value={row.uom ?? ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      row._id,
                                      "uom",
                                      e.target.value,
                                    )
                                  }
                                />
                              ) : (
                                row.uom
                              )}
                            </td>

                            {/* TOTAL QUANTITY */}
                            <td className="px-4 py-2 border-b">
                              {isDefaultEditable ? (
                                <input
                                  type="number"
                                  className="border p-1 rounded w-full"
                                  value={row.totalQuantity ?? ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      row._id,
                                      "totalQuantity",
                                      e.target.value,
                                    )
                                  }
                                />
                              ) : (
                                row.totalQuantity
                              )}
                            </td>

                            {/* SUBMITTED BY (ALWAYS READ ONLY) */}
                            <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                              {row.submittedBy}
                            </td>

                            {/* SECTION */}
                            <td className="px-4 py-2 border-b">
                              {isDefaultEditable ? (
                                <select
                                  className="border p-1 rounded w-full"
                                  value={row.section ?? ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      row._id,
                                      "section",
                                      e.target.value,
                                    )
                                  }
                                >
                                  <option value="">Select Section</option>
                                  <option value="REFINERY">REFINERY</option>
                                  <option value="CENTRAL STORE">
                                    CENTRAL STORE
                                  </option>
                                  <option value="MEGA STORE">MEGA STORE</option>
                                  <option value="OILS STORE">OILS STORE</option>
                                  <option value="PP STORE">PP STORE</option>
                                  <option value="RSIPL">RSIPL</option>
                                  <option value="HRM">HRM</option>
                                  <option value="OILS LAB">OILS LAB</option>
                                  <option value="RSIPL-PROJECT-R">
                                    RSIPL-PROJECT-R
                                  </option>
                                  <option value="RSIPL-PROJECT-S">
                                    RSIPL-PROJECT-S
                                  </option>
                                </select>
                              ) : (
                                row.section
                              )}
                            </td>

                            {/* DOER NAME */}
                            <td className="px-4 py-2 border-b">
                              {selectedOption === "Indent Verification" ? (
                                <select
                                  className="border p-1 rounded w-full"
                                  value={row.doerName ?? ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      row._id,
                                      "doerName",
                                      e.target.value,
                                    )
                                  }
                                >
                                  <option value="">Select Doer Name</option>
                                  <option value="Executive 1">
                                    Executive 1
                                  </option>
                                  <option value="Executive 2">
                                    Executive 2
                                  </option>
                                  <option value="Executive 3">
                                    Executive 3
                                  </option>
                                  <option value="Executive 4">
                                    Executive 4
                                  </option>
                                  {/* ✅ Local Purchase buckets */}
                                  <option value="Local 1">
                                    Local Purchase 1
                                  </option>
                                  <option value="Local 2">
                                    Local Purchase 2
                                  </option>
                                  <option value="Local 3">
                                    Local Purchase 3
                                  </option>
                                </select>
                              ) : (
                                row.doerName
                              )}
                            </td>

                            {/* ------------ OTHER CONDITION BLOCKS REMAIN SAME ------------ */}

                            {/* PMS Master Sheet */}
                            {/* Indent Verification */}
                            {selectedOption === "Indent Verification" && (
                              <>
                                {/* Remarks */}
                                <td className="px-4 py-2 border-b">
                                  <textarea
                                    rows={2}
                                    className="border p-1 rounded w-full min-w-[180px]"
                                    value={row.remarksIndentVerification ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "remarksIndentVerification",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                {/* Application Area */}
                                <td className="px-4 py-2 border-b">
                                  <input
                                    type="text"
                                    className="border p-1 rounded w-full"
                                    value={row.applicationArea ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "applicationArea",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                {/* Old Material Status */}
                                <td className="px-4 py-2 border-b">
                                  <input
                                    type="text"
                                    className="border p-1 rounded w-full"
                                    value={row.oldMaterialStatus ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "oldMaterialStatus",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Old material status"
                                  />
                                </td>

                                {/* Order Approved By */}
                                <td className="px-4 py-2 border-b">
                                  <input
                                    type="text"
                                    className="border p-1 rounded w-full"
                                    value={row.orderApprovedBy ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "orderApprovedBy",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>
                              </>
                            )}

                            {/* PMS Master Sheet */}
                            {selectedOption === "PMS Master Sheet" && (
                              <>
                                <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                  {row.plannedGetQuotation
                                    ? new Date(row.plannedGetQuotation)
                                        .toLocaleDateString("en-GB")
                                        .replace(/\//g, "-")
                                    : ""}
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <input
                                    type="date"
                                    className="border p-1 rounded"
                                    value={row.actualGetQuotation ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "actualGetQuotation",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <select
                                    className="border p-1 rounded"
                                    value={row.quotationStatus ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "quotationStatus",
                                        e.target.value,
                                      )
                                    }
                                  >
                                    <option value="">--Select--</option>
                                    <option value="Inquiry Send">
                                      Inquiry Send
                                    </option>
                                    <option value="Hold">Hold</option>
                                  </select>
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <select
                                    className="border p-1 rounded"
                                    value={row.doerStatus ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "doerStatus",
                                        e.target.value,
                                      )
                                    }
                                  >
                                    <option value="">--Select--</option>
                                    <option value="Done">Done</option>
                                  </select>
                                </td>

                                <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                  {row.timeDelayGetQuotation}
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <textarea
                                    rows={2}
                                    className="border p-1 rounded w-full min-w-[180px]"
                                    value={row.remarksGetQuotation ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "remarksGetQuotation",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                  {row.plannedTechApproval
                                    ? new Date(row.plannedTechApproval)
                                        .toLocaleDateString("en-GB")
                                        .replace(/\//g, "-")
                                    : ""}
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <input
                                    type="date"
                                    className="border p-1 rounded"
                                    value={row.actualTechApproval ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "actualTechApproval",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <select
                                    className="border p-1 rounded"
                                    value={row.technicalApprovalStatus ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "technicalApprovalStatus",
                                        e.target.value,
                                      )
                                    }
                                  >
                                    <option value="">--Select--</option>
                                    <option value="Hold">Hold</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Done">Done</option>
                                    <option value="Reopen">Reopen</option>
                                  </select>
                                </td>

                                <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                  {row.timeDelayTechApproval}
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <input
                                    type="text"
                                    className="border p-1 rounded"
                                    value={row.approverName ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "approverName",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <textarea
                                    rows={2}
                                    className="border p-1 rounded w-full min-w-[180px]"
                                    value={row.remarksTechApproval ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "remarksTechApproval",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                  {row.plannedCommercialNegotiation
                                    ? new Date(row.plannedCommercialNegotiation)
                                        .toLocaleDateString("en-GB")
                                        .replace(/\//g, "-")
                                    : ""}
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <input
                                    type="date"
                                    className="border p-1 rounded"
                                    value={
                                      row.actualCommercialNegotiation ?? ""
                                    }
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "actualCommercialNegotiation",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <select
                                    className="border p-1 rounded"
                                    value={row.finalizeTermsStatus ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "finalizeTermsStatus",
                                        e.target.value,
                                      )
                                    }
                                  >
                                    <option value="">--Select--</option>
                                    <option value="Hold">Hold</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Done">Done</option>
                                  </select>
                                </td>

                                <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                  {row.timeDelayCommercialNegotiation}
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <select
                                    className="border p-1 rounded"
                                    value={row.getApproval ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "getApproval",
                                        e.target.value,
                                      )
                                    }
                                  >
                                    <option value="">--Select--</option>
                                    <option value="Hold">Hold</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Done">Done</option>
                                  </select>
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <select
                                    className="border p-1 rounded"
                                    value={row.approverName2 ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "approverName2",
                                        e.target.value,
                                      )
                                    }
                                  >
                                    <option value="">--Select--</option>
                                    <option value="Tapan Agarwala">
                                      Tapan Agarwala
                                    </option>
                                    <option value="Rohit Agarwala">
                                      Rohit Agarwala
                                    </option>
                                    <option value="Hiru Ghosh">
                                      Hiru Ghosh
                                    </option>
                                    <option value="Arindam Saha">
                                      Arindam Saha
                                    </option>
                                  </select>
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <textarea
                                    rows={2}
                                    className="border p-1 rounded w-full min-w-[180px]"
                                    value={
                                      row.remarksCommercialNegotiation ?? ""
                                    }
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "remarksCommercialNegotiation",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                  {row.plannedPoGeneration
                                    ? new Date(row.plannedPoGeneration)
                                        .toLocaleDateString("en-GB")
                                        .replace(/\//g, "-")
                                    : ""}
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <input
                                    type="date"
                                    className="border p-1 rounded"
                                    value={row.actualPoGeneration ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "actualPoGeneration",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <select
                                    className="border p-1 rounded"
                                    value={row.poGenerationStatus ?? ""}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      handleFieldChange(
                                        row._id,
                                        "poGenerationStatus",
                                        value,
                                      );

                                      if (value === "Done") {
                                        const today = new Date();
                                        const formattedDate = `${String(
                                          today.getDate(),
                                        ).padStart(2, "0")}-${String(
                                          today.getMonth() + 1,
                                        ).padStart(
                                          2,
                                          "0",
                                        )}-${today.getFullYear()}`;

                                        handleFieldChange(
                                          row._id,
                                          "poDate",
                                          formattedDate,
                                        );
                                      } else {
                                        handleFieldChange(
                                          row._id,
                                          "poDate",
                                          "",
                                        );
                                      }
                                    }}
                                  >
                                    <option value="">--Select--</option>
                                    <option value="Hold">Hold</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Done">Done</option>
                                  </select>
                                </td>

                                <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                  {row.timeDelayPoGeneration}
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <input
                                    type="date"
                                    className="border p-1 rounded"
                                    value={row.poDate ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "poDate",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <input
                                    type="text"
                                    className="border p-1 rounded"
                                    value={row.poNumber ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "poNumber",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                <td className="px-4 py-2 border-b">
                                  {(() => {
                                    const hasUploadRole =
                                      role === "ADMIN" ||
                                      role === "PSE" ||
                                      role === "PA";
                                    const alreadyUploaded = Boolean(
                                      row.poPdfWebViewLink,
                                    );
                                    const canReupload =
                                      role === "ADMIN" || role === "PSE";
                                    const canUpload =
                                      hasUploadRole &&
                                      (canReupload || !alreadyUploaded);
                                    return (
                                      <div className="flex flex-col gap-1">
                                        <input
                                          type="file"
                                          accept="application/pdf"
                                          disabled={
                                            !canUpload ||
                                            uploadingPoRowId === row._id
                                          }
                                          onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (!f) return;
                                            handlePoUpload(row._id, f);
                                            e.target.value = "";
                                          }}
                                        />
                                        {alreadyUploaded && (
                                          <span className="text-xs text-green-700 font-semibold">
                                            Uploaded
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </td>

                                <td className="px-4 py-2 border-b">
                                  {row.poPdfWebViewLink ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        window.open(
                                          row.poPdfWebViewLink,
                                          "_blank",
                                        )
                                      }
                                      disabled={uploadingPoRowId === row._id}
                                      className="btn btn-sm btn-warning ring-2 ring-yellow-400 font-semibold"
                                    >
                                      Show PO
                                    </button>
                                  ) : (
                                    <span style={{ color: "#888" }}>No PO</span>
                                  )}
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <input
                                    type="text"
                                    className="border p-1 rounded"
                                    value={row.vendorName ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "vendorName",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <input
                                    type="number"
                                    className="border p-1 rounded"
                                    value={row.leadDays ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "leadDays",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <input
                                    type="number"
                                    className="border p-1 rounded"
                                    value={row.amount ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "amount",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <input
                                    type="text"
                                    className="border p-1 rounded w-full"
                                    value={row.applicationArea ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "applicationArea",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <select
                                    className="border p-1 rounded w-full"
                                    value={row.oldMaterialStatus ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "oldMaterialStatus",
                                        e.target.value,
                                      )
                                    }
                                  >
                                    <option value="">Select</option>
                                    <option value="YES">YES</option>
                                    <option value="NO">NO</option>
                                  </select>
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <input
                                    type="text"
                                    className="border p-1 rounded w-full"
                                    value={row.orderApprovedBy ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "orderApprovedBy",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <select
                                    className="border p-1 rounded"
                                    value={row.paymentCondition ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "paymentCondition",
                                        e.target.value,
                                      )
                                    }
                                  >
                                    <option value="">--Select--</option>
                                    <option value="After Received">
                                      After Received
                                    </option>
                                    <option value="Before Dispatch">
                                      Before Dispatch
                                    </option>
                                    <option value="PWP BBD">PWP BBD</option>
                                    <option value="PWP BBD FAR">
                                      PWP BBD FAR
                                    </option>
                                    <option value="PWP BBD PAPW">
                                      PWP BBD PAPW
                                    </option>
                                    <option value="PAPW">PAPW</option>
                                  </select>

                                  {String(row.paymentCondition || "")
                                    .toUpperCase()
                                    .includes("PAPW") && (
                                    <div className="mt-1">
                                      <select
                                        className="border p-1 rounded w-full"
                                        value={row.papwDays ?? ""}
                                        onChange={(e) =>
                                          handleFieldChange(
                                            row._id,
                                            "papwDays",
                                            parseOptionalNumber(e.target.value),
                                          )
                                        }
                                      >
                                        <option value="">--PAPW Days--</option>
                                        <option value={15}>15</option>
                                        <option value={30}>30</option>
                                        <option value={45}>45</option>
                                        <option value={60}>60</option>
                                        <option value={75}>75</option>
                                        <option value={90}>90</option>
                                      </select>
                                    </div>
                                  )}
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <textarea
                                    rows={2}
                                    className="border p-1 rounded w-full min-w-[180px]"
                                    value={row.remarksPoGeneration ?? ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "remarksPoGeneration",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>
                              </>
                            )}
                            {selectedOption === "Get Quotation" &&
                              row.doerName !== "" &&
                              ((row.dbDoerStatus ?? "") !== "Done" ||
                                (row.dbComparisonStatementStatus ?? "") !==
                                  "Done") && (
                                <>
                                  {/* Planned Date (read-only) */}
                                  <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                    {formatDDMMYYYY(row.plannedGetQuotation)}
                                  </td>

                                  {/* Actual Date */}
                                  <td className="px-4 py-2 border-b">
                                    <input
                                      type="date"
                                      className="border p-1 rounded"
                                      value={row.actualGetQuotation ?? ""}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          row._id,
                                          "actualGetQuotation",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </td>

                                  {/* Send for Get Quotation */}
                                  <td className="px-4 py-2 border-b">
                                    <select
                                      className="border p-1 rounded"
                                      value={row.quotationStatus ?? ""}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          row._id,
                                          "quotationStatus",
                                          e.target.value,
                                        )
                                      }
                                    >
                                      <option value="">--Select--</option>
                                      <option value="Inquiry Send">
                                        Inquiry Send
                                      </option>
                                      <option value="Hold">Hold</option>
                                      <option value="Cancelled">
                                        Cancelled
                                      </option>
                                    </select>
                                  </td>

                                  {/* Doer Status */}
                                  <td className="px-4 py-2 border-b">
                                    <select
                                      className="border p-1 rounded"
                                      value={row.doerStatus ?? ""}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          row._id,
                                          "doerStatus",
                                          e.target.value,
                                        )
                                      }
                                    >
                                      <option value="">--Select--</option>
                                      <option value="Done">Done</option>
                                    </select>
                                  </td>

                                  {/* Time Delay (read-only) */}
                                  <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                    {row.timeDelayGetQuotation ?? ""}
                                  </td>

                                  {/* Remarks */}
                                  <td className="px-4 py-2 border-b">
                                    <textarea
                                      rows={2}
                                      className="border p-1 rounded w-full min-w-[180px]"
                                      value={row.remarksGetQuotation ?? ""}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          row._id,
                                          "remarksGetQuotation",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </td>

                                  {/* 📤 UPLOAD GET QUOTATION PDF */}
                                  <td className="px-4 py-2 border-b">
                                    <input
                                      type="file"
                                      accept="application/pdf"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handlePdfUpload(row._id, file); // ✅ SAME function
                                        }
                                      }}
                                    />
                                  </td>

                                  {/* 🔗 SHOW GET QUOTATION PDF */}
                                  <td className="px-4 py-2 border-b text-center">
                                    {row.getQuotationPdfWebViewLink ||
                                    pdfPreview[row._id] ? (
                                      <a
                                        href={
                                          row.getQuotationPdfWebViewLink ||
                                          pdfPreview[row._id]
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline"
                                      >
                                        View PDF
                                      </a>
                                    ) : (
                                      <span className="text-gray-400">
                                        No PDF
                                      </span>
                                    )}
                                  </td>
                                </>
                              )}
                            {selectedOption === "Technical Approval" && (
                              <>
                                {(() => {
                                  // ✅ Status currently (prefer live edited value, fallback to DB snapshot)
                                  // Status currently (prefer live edited value, fallback to DB snapshot)
                                  const dbTechStatus =
                                    row.dbTechnicalApprovalStatus ?? "";
                                  const isTechAlreadyDone =
                                    dbTechStatus === "Done"; // lock only if already saved as Done in DB

                                  // Editable only for PSE / ADMIN and only if not already Done
                                  const canEditTechnical =
                                    (role === "PSE" || role === "ADMIN") &&
                                    !isTechAlreadyDone;

                                  const statusValue = (
                                    row.technicalApprovalStatus ??
                                    row.dbTechnicalApprovalStatus ??
                                    ""
                                  ).toString();
                                  const approverValue = (
                                    row.approverName ??
                                    row.dbApproverName ??
                                    ""
                                  ).toString();
                                  const remarksValue = (
                                    row.remarksTechApproval ??
                                    row.dbRemarksTechApproval ??
                                    ""
                                  ).toString();

                                  return (
                                    <>
                                      <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                        {row.plannedTechApproval
                                          ? new Date(row.plannedTechApproval)
                                              .toLocaleDateString("en-GB")
                                              .replace(/\//g, "-")
                                          : ""}
                                      </td>

                                      <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                        {row.actualTechApproval
                                          ? new Date(row.actualTechApproval)
                                              .toLocaleDateString("en-GB")
                                              .replace(/\//g, "-")
                                          : ""}
                                      </td>

                                      <td className="px-4 py-2 border-b">
                                        <select
                                          className="border p-1 rounded"
                                          value={statusValue}
                                          disabled={!canEditTechnical}
                                          onChange={(e) =>
                                            handleFieldChange(
                                              row._id,
                                              "technicalApprovalStatus",
                                              e.target.value,
                                            )
                                          }
                                        >
                                          <option value="">--Select--</option>
                                          <option value="Hold">Hold</option>
                                          <option value="Cancelled">
                                            Cancelled
                                          </option>
                                          <option value="Done">Done</option>
                                          <option value="Reopen">Reopen</option>
                                        </select>
                                      </td>

                                      <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                        {row.timeDelayTechApproval ?? ""}
                                      </td>

                                      <td className="px-4 py-2 border-b">
                                        <textarea
                                          rows={2}
                                          className="border p-1 rounded w-full min-w-[180px]"
                                          value={approverValue}
                                          disabled={!canEditTechnical}
                                          onChange={(e) =>
                                            handleFieldChange(
                                              row._id,
                                              "approverName",
                                              e.target.value,
                                            )
                                          }
                                        />
                                      </td>

                                      <td className="px-4 py-2 border-b">
                                        <textarea
                                          rows={2}
                                          className="border p-1 rounded w-full min-w-[180px]"
                                          value={remarksValue}
                                          disabled={!canEditTechnical}
                                          onChange={(e) =>
                                            handleFieldChange(
                                              row._id,
                                              "remarksTechApproval",
                                              e.target.value,
                                            )
                                          }
                                        />
                                      </td>
                                    </>
                                  );
                                })()}
                              </>
                            )}
                            {selectedOption === "Commercial Negotiation" && (
                              <>
                                {(() => {
                                  const isPseOrAdmin =
                                    role === "PSE" || role === "ADMIN";

                                  const dbFinalize =
                                    row.dbFinalizeTermsStatus ?? "";
                                  const dbApproval = row.dbGetApproval ?? "";

                                  // Row is considered "closed" only if BOTH are Done in DB
                                  const isClosed =
                                    dbFinalize === "Done" &&
                                    dbApproval === "Done";

                                  // Values (prefer current edited value, else DB)
                                  const finalizeValue =
                                    row.finalizeTermsStatus ??
                                    row.dbFinalizeTermsStatus ??
                                    "";
                                  const approvalValue =
                                    row.getApproval ?? row.dbGetApproval ?? "";
                                  const approverValue =
                                    row.approverName2 ??
                                    row.dbApproverName2 ??
                                    "";
                                  const remarksValue =
                                    row.remarksCommercialNegotiation ??
                                    row.dbRemarksCommercialNegotiation ??
                                    "";

                                  // ✅ Status dropdowns should remain enabled for PSE/ADMIN even when closed
                                  const canEditStatus = isPseOrAdmin;

                                  // ✅ Other fields editable only if NOT closed, OR if user already reopened in UI
                                  const isReopenedNow =
                                    finalizeValue === "Reopen" ||
                                    approvalValue === "Reopen";
                                  const canEditOtherFields =
                                    isPseOrAdmin &&
                                    (!isClosed || isReopenedNow);

                                  return (
                                    <>
                                      <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                        {row.plannedCommercialNegotiation
                                          ? new Date(
                                              row.plannedCommercialNegotiation,
                                            )
                                              .toLocaleDateString("en-GB")
                                              .replace(/\//g, "-")
                                          : ""}
                                      </td>

                                      <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                        {row.actualCommercialNegotiation
                                          ? new Date(
                                              row.actualCommercialNegotiation,
                                            )
                                              .toLocaleDateString("en-GB")
                                              .replace(/\//g, "-")
                                          : ""}
                                      </td>

                                      {/* Finalize Terms Status */}
                                      <td className="px-4 py-2 border-b">
                                        <select
                                          className="border p-1 rounded"
                                          value={finalizeValue}
                                          disabled={!canEditStatus} // ✅ stays enabled for PSE/ADMIN always
                                          onChange={(e) =>
                                            handleFieldChange(
                                              row._id,
                                              "finalizeTermsStatus",
                                              e.target.value,
                                            )
                                          }
                                        >
                                          <option value="">--Select--</option>
                                          <option value="Hold">Hold</option>
                                          <option value="Cancelled">
                                            Cancelled
                                          </option>
                                          <option value="Done">Done</option>
                                          <option value="Reopen">Reopen</option>
                                        </select>
                                      </td>

                                      <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                        {row.timeDelayCommercialNegotiation}
                                      </td>

                                      {/* Get Approval */}
                                      <td className="px-4 py-2 border-b">
                                        <select
                                          className="border p-1 rounded"
                                          value={approvalValue}
                                          disabled={!canEditStatus} // ✅ stays enabled for PSE/ADMIN always
                                          onChange={(e) =>
                                            handleFieldChange(
                                              row._id,
                                              "getApproval",
                                              e.target.value,
                                            )
                                          }
                                        >
                                          <option value="">--Select--</option>
                                          <option value="Hold">Hold</option>
                                          <option value="Cancelled">
                                            Cancelled
                                          </option>
                                          <option value="Done">Done</option>
                                          <option value="Reopen">Reopen</option>
                                        </select>
                                      </td>

                                      {/* Approver Name */}
                                      <td className="px-4 py-2 border-b">
                                        <select
                                          className="border p-1 rounded"
                                          value={approverValue}
                                          disabled={!canEditOtherFields} // ✅ locked when closed unless reopened
                                          onChange={(e) =>
                                            handleFieldChange(
                                              row._id,
                                              "approverName2",
                                              e.target.value,
                                            )
                                          }
                                        >
                                          <option value="">--Select--</option>
                                          <option value="Tapan Agarwala">
                                            Tapan Agarwala
                                          </option>
                                          <option value="Rohit Agarwala">
                                            Rohit Agarwala
                                          </option>
                                          <option value="Hiru Ghosh">
                                            Hiru Ghosh
                                          </option>
                                          <option value="Arindam Saha">
                                            Arindam Saha
                                          </option>
                                        </select>
                                      </td>

                                      {/* Remarks */}
                                      <td className="px-4 py-2 border-b">
                                        <textarea
                                          rows={2}
                                          className="border p-1 rounded w-full min-w-[180px]"
                                          value={remarksValue}
                                          disabled={!canEditOtherFields} // ✅ locked when closed unless reopened
                                          onChange={(e) =>
                                            handleFieldChange(
                                              row._id,
                                              "remarksCommercialNegotiation",
                                              e.target.value,
                                            )
                                          }
                                        />
                                      </td>
                                    </>
                                  );
                                })()}
                              </>
                            )}

                            {/* LOCAL PURCHASE */}
                            {selectedOption === "Local Purchase" && (
                              <>
                                <td className="px-4 py-2 border-b text-center">
                                  <input
                                    type="checkbox"
                                    checked={isLpRowSelected(row._id)}
                                    onChange={() =>
                                      toggleLpRowSelected(row._id)
                                    }
                                  />
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <input
                                    type="date"
                                    className="w-full border px-2 py-1 rounded"
                                    value={row.invoiceDate || ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "invoiceDate",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <input
                                    type="text"
                                    className="w-full border px-2 py-1 rounded"
                                    placeholder="Invoice No"
                                    value={row.invoiceNumber || ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "invoiceNumber",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <input
                                    type="text"
                                    className="w-full border px-2 py-1 rounded"
                                    value={row.vendorName || ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "vendorName",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <select
                                    className="w-full border px-2 py-1 rounded"
                                    value={row.modeOfTransport || ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "modeOfTransport",
                                        e.target.value,
                                      )
                                    }
                                  >
                                    <option value="">--Select--</option>
                                    <option value="By Hand">By Hand</option>
                                    <option value="By Transport">
                                      By Transport
                                    </option>
                                  </select>
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <input
                                    type="text"
                                    className="w-full border px-2 py-1 rounded"
                                    placeholder="Transporter"
                                    value={row.transporterName || ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "transporterName",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                <td className="px-4 py-2 border-b">
                                  <textarea
                                    rows={2}
                                    className="w-full border px-2 py-1 rounded min-w-[180px]"
                                    value={row.remarks || ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "remarks",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>
                              </>
                            )}
                            {selectedOption === "PO Generation" &&
                              (() => {
                                // ✅ prereqs (use UI first, fallback to DB)
                                const finalizeStatus = (
                                  row.finalizeTermsStatus ??
                                  row.dbFinalizeTermsStatus ??
                                  ""
                                ).toString();
                                const approvalStatus = (
                                  row.getApproval ??
                                  row.dbGetApproval ??
                                  ""
                                ).toString();

                                const finalizeDone = finalizeStatus === "Done";
                                const approvalDone = approvalStatus === "Done";

                                // ✅ current db status (use UI first, fallback to DB)
                                const dbPoStatus = (
                                  row.dbPoGenerationStatus ?? ""
                                ).toString();
                                const isPoAlreadyDone = dbPoStatus === "Done";

                                // ✅ allow PA + ADMIN only
                                const hasRole =
                                  role === "PA" || role === "ADMIN";

                                // ✅ final edit flag
                                const canEdit =
                                  hasRole &&
                                  finalizeDone &&
                                  approvalDone &&
                                  !isPoAlreadyDone;

                                const poStatusValue = dbPoStatus;

                                return (
                                  <>
                                    <td className="px-4 py-2 border-b">
                                      <input
                                        type="checkbox"
                                        checked={isPoRowSelected(row._id)}
                                        disabled={!canEdit}
                                        onChange={() =>
                                          togglePoRowSelected(row._id)
                                        }
                                      />
                                    </td>
                                    <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                      {row.plannedPoGeneration
                                        ? new Date(row.plannedPoGeneration)
                                            .toLocaleDateString("en-GB")
                                            .replace(/\//g, "-")
                                        : ""}
                                    </td>

                                    <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                      {row.actualPoGeneration
                                        ? new Date(row.actualPoGeneration)
                                            .toLocaleDateString("en-GB")
                                            .replace(/\//g, "-")
                                        : ""}
                                    </td>

                                    <td className="px-4 py-2 border-b">
                                      <select
                                        className="border p-1 rounded"
                                        value={poStatusValue}
                                        disabled={!canEdit}
                                        onChange={(e) =>
                                          handleFieldChange(
                                            row._id,
                                            "poGenerationStatus",
                                            e.target.value,
                                          )
                                        }
                                      >
                                        <option value="">--Select--</option>
                                        <option value="Hold">Hold</option>
                                        <option value="Cancelled">
                                          Cancelled
                                        </option>
                                        <option value="Done">Done</option>
                                      </select>
                                    </td>

                                    <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                      {row.timeDelayPoGeneration ?? ""}
                                    </td>

                                    <td className="px-4 py-2 border-b">
                                      <input
                                        type="date"
                                        className="border p-1 rounded"
                                        value={row.poDate ?? ""}
                                        disabled={!canEdit}
                                        onChange={(e) =>
                                          handleFieldChange(
                                            row._id,
                                            "poDate",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </td>

                                    <td className="px-4 py-2 border-b">
                                      <input
                                        type="text"
                                        className="border p-1 rounded"
                                        value={row.poNumber ?? ""}
                                        disabled={!canEdit}
                                        onChange={(e) =>
                                          handleFieldChange(
                                            row._id,
                                            "poNumber",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </td>

                                    <td className="px-4 py-2 border-b">
                                      {(() => {
                                        const hasUploadRole =
                                          role === "ADMIN" ||
                                          role === "PSE" ||
                                          role === "PA";
                                        const alreadyUploaded = Boolean(
                                          row.poPdfWebViewLink,
                                        );
                                        const canReupload =
                                          role === "ADMIN" || role === "PSE";
                                        const canUpload =
                                          hasUploadRole &&
                                          (canReupload || !alreadyUploaded);
                                        return (
                                          <input
                                            type="file"
                                            accept="application/pdf"
                                            disabled={
                                              !canUpload ||
                                              uploadingPoRowId === row._id
                                            }
                                            onChange={(e) => {
                                              const f = e.target.files?.[0];
                                              if (!f) return;
                                              handlePoUpload(row._id, f);
                                              e.target.value = "";
                                            }}
                                          />
                                        );
                                      })()}
                                    </td>

                                    <td className="px-4 py-2 border-b">
                                      {row.poPdfWebViewLink ? (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            window.open(
                                              row.poPdfWebViewLink,
                                              "_blank",
                                            )
                                          }
                                          disabled={
                                            uploadingPoRowId === row._id
                                          }
                                          className="btn btn-sm btn-warning"
                                        >
                                          Show PO
                                        </button>
                                      ) : (
                                        <span style={{ color: "#888" }}>
                                          No PO
                                        </span>
                                      )}
                                    </td>

                                    <td className="px-4 py-2 border-b">
                                      <input
                                        type="text"
                                        className="border p-1 rounded"
                                        value={row.vendorName ?? ""}
                                        disabled={!canEdit}
                                        onChange={(e) =>
                                          handleFieldChange(
                                            row._id,
                                            "vendorName",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </td>

                                    <td className="px-4 py-2 border-b">
                                      <input
                                        type="number"
                                        className="border p-1 rounded"
                                        value={row.leadDays ?? ""}
                                        disabled={!canEdit}
                                        onChange={(e) =>
                                          handleFieldChange(
                                            row._id,
                                            "leadDays",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </td>

                                    <td className="px-4 py-2 border-b">
                                      <input
                                        type="number"
                                        className="border p-1 rounded"
                                        value={row.amount ?? ""}
                                        disabled={!canEdit}
                                        onChange={(e) =>
                                          handleFieldChange(
                                            row._id,
                                            "amount",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </td>

                                    <td className="px-4 py-2 border-b">
                                      <select
                                        className="border p-1 rounded"
                                        value={row.paymentCondition ?? ""}
                                        disabled={!canEdit}
                                        onChange={(e) =>
                                          handleFieldChange(
                                            row._id,
                                            "paymentCondition",
                                            e.target.value,
                                          )
                                        }
                                      >
                                        <option value="">--Select--</option>
                                        <option value="After Received">
                                          After Received
                                        </option>
                                        <option value="Before Dispatch">
                                          Before Dispatch
                                        </option>
                                        <option value="PWP BBD">PWP BBD</option>
                                        <option value="PWP BBD FAR">
                                          PWP BBD FAR
                                        </option>
                                        <option value="PWP BBD PAPW">
                                          PWP BBD PAPW
                                        </option>
                                        <option value="PAPW">PAPW</option>
                                      </select>

                                      {String(row.paymentCondition || "")
                                        .toUpperCase()
                                        .includes("PAPW") && (
                                        <div className="mt-1">
                                          <select
                                            className="border p-1 rounded w-full"
                                            value={row.papwDays ?? ""}
                                            disabled={!canEdit}
                                            onChange={(e) =>
                                              handleFieldChange(
                                                row._id,
                                                "papwDays",
                                                parseOptionalNumber(
                                                  e.target.value,
                                                ),
                                              )
                                            }
                                          >
                                            <option value="">
                                              --PAPW Days--
                                            </option>
                                            <option value={15}>15</option>
                                            <option value={30}>30</option>
                                            <option value={45}>45</option>
                                            <option value={60}>60</option>
                                            <option value={75}>75</option>
                                            <option value={90}>90</option>
                                          </select>
                                        </div>
                                      )}
                                    </td>

                                    <td className="px-4 py-2 border-b">
                                      <textarea
                                        rows={2}
                                        className="border p-1 rounded w-full min-w-[180px]"
                                        value={row.remarksPoGeneration ?? ""}
                                        disabled={!canEdit}
                                        onChange={(e) =>
                                          handleFieldChange(
                                            row._id,
                                            "remarksPoGeneration",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </td>
                                  </>
                                );
                              })()}

                            {/* PC Follow Up */}
                            {((selectedOption === "PC Follow Up" && pcIndex) ||
                              (selectedOption === "Payment Follow Up" &&
                                paymentKey)) && (
                              <>
                                {/* Common fields */}
                                <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                  {row.poDate
                                    ? new Date(row.poDate)
                                        .toLocaleDateString("en-GB")
                                        .replace(/\//g, "-")
                                    : ""}
                                </td>
                                <td className="px-4 py-2 border-b">
                                  {row.poNumber}
                                </td>
                                <td className="px-4 py-2 border-b">
                                  {(() => {
                                    const hasUploadRole =
                                      role === "ADMIN" ||
                                      role === "PSE" ||
                                      role === "PA";
                                    const alreadyUploaded = Boolean(
                                      row.poPdfWebViewLink,
                                    );
                                    const canReupload =
                                      role === "ADMIN" || role === "PSE";
                                    const canUpload =
                                      hasUploadRole &&
                                      (canReupload || !alreadyUploaded);
                                    return (
                                      <input
                                        type="file"
                                        accept="application/pdf"
                                        disabled={
                                          !canUpload ||
                                          uploadingPoRowId === row._id
                                        }
                                        onChange={(e) => {
                                          const f = e.target.files?.[0];
                                          if (!f) return;
                                          handlePoUpload(row._id, f);
                                          e.target.value = "";
                                        }}
                                      />
                                    );
                                  })()}
                                </td>
                                <td className="px-4 py-2 border-b">
                                  {row.poPdfWebViewLink ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        window.open(
                                          row.poPdfWebViewLink,
                                          "_blank",
                                        )
                                      }
                                      disabled={uploadingPoRowId === row._id}
                                      className="btn btn-sm btn-warning"
                                    >
                                      Show PO
                                    </button>
                                  ) : (
                                    <span style={{ color: "#888" }}>No PO</span>
                                  )}
                                </td>
                                <td className="px-4 py-2 border-b">
                                  {row.vendorName}
                                </td>
                                <td className="px-4 py-2 border-b">
                                  {row.leadDays}
                                </td>
                                <td className="px-4 py-2 border-b">
                                  {row.paymentCondition}
                                </td>

                                {/* Transaction Number (Payment Follow Up only) */}
                                {selectedOption === "Payment Follow Up" && (
                                  <td className="px-4 py-2 border-b">
                                    <input
                                      type="text"
                                      className="border p-1 rounded"
                                      value={
                                        row[
                                          `transactionNoPayment${paymentKey}`
                                        ] ?? ""
                                      }
                                      onChange={(e) =>
                                        handleFieldChange(
                                          row._id,
                                          `transactionNoPayment${paymentKey}`,
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </td>
                                )}

                                {/* Planned */}
                                <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                  {(
                                    selectedOption === "PC Follow Up"
                                      ? row[`plannedPCFollowUp${pcIndex}`]
                                      : row[`plannedPayment${paymentKey}`]
                                  )
                                    ? new Date(
                                        selectedOption === "PC Follow Up"
                                          ? row[`plannedPCFollowUp${pcIndex}`]
                                          : row[`plannedPayment${paymentKey}`],
                                      )
                                        .toLocaleDateString("en-GB")
                                        .replace(/\//g, "-")
                                    : ""}
                                </td>

                                {/* Actual */}
                                <td className="px-4 py-2 border-b">
                                  <input
                                    type="date"
                                    className="border p-1 rounded"
                                    value={
                                      selectedOption === "PC Follow Up"
                                        ? row[`actualPCFollowUp${pcIndex}`] ??
                                          ""
                                        : row[`actualPayment${paymentKey}`] ??
                                          ""
                                    }
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        selectedOption === "PC Follow Up"
                                          ? `actualPCFollowUp${pcIndex}`
                                          : `actualPayment${paymentKey}`,
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                {/* Status */}
                                <td className="px-4 py-2 border-b">
                                  <select
                                    className="border p-1 rounded"
                                    value={
                                      selectedOption === "PC Follow Up"
                                        ? row[`statusPCFollowUp${pcIndex}`] ??
                                          ""
                                        : row[`statusPayment${paymentKey}`] ??
                                          ""
                                    }
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        selectedOption === "PC Follow Up"
                                          ? `statusPCFollowUp${pcIndex}`
                                          : `statusPayment${paymentKey}`,
                                        e.target.value,
                                      )
                                    }
                                  >
                                    <option value="">--Select--</option>
                                    <option value="Hold">Hold</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Done">Done</option>
                                    <option value="Pending">Pending</option>
                                  </select>
                                </td>

                                {/* Time Delay */}
                                <td className="px-4 py-2 border-b">
                                  {selectedOption === "PC Follow Up"
                                    ? row[`timeDelayPCFollowUp${pcIndex}`]
                                    : row[`timeDelayPayment${paymentKey}`]}
                                </td>

                                {/* Remarks */}
                                <td className="px-4 py-2 border-b">
                                  <textarea
                                    rows={2}
                                    className="border p-1 rounded w-full min-w-[180px]"
                                    value={
                                      selectedOption === "PC Follow Up"
                                        ? row[`remarksPCFollowUp${pcIndex}`] ??
                                          ""
                                        : row[`remarksPayment${paymentKey}`] ??
                                          ""
                                    }
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        selectedOption === "PC Follow Up"
                                          ? `remarksPCFollowUp${pcIndex}`
                                          : `remarksPayment${paymentKey}`,
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>
                              </>
                            )}

                            {/* MATERIAL RECEIVED */}
                            {selectedOption === "Material Received" && (
                              <>
                                {/* Planned Date (PO Date + Lead Days) */}
                                <td className="px-4 py-2 border-b">
                                  {row.plannedMaterialReceived
                                    ? new Date(row.plannedMaterialReceived)
                                        .toLocaleDateString("en-GB")
                                        .replace(/\//g, "-")
                                    : ""}
                                </td>

                                {/* Actual Date (Store Received preferred, else PSE Material Received) */}
                                <td className="px-4 py-2 border-b">
                                  {row.actualMaterialReceived
                                    ? new Date(row.actualMaterialReceived)
                                        .toLocaleDateString("en-GB")
                                        .replace(/\//g, "-")
                                    : row.storeReceivedDate ||
                                      row.materialReceivedDate
                                    ? new Date(
                                        row.storeReceivedDate ||
                                          row.materialReceivedDate,
                                      )
                                        .toLocaleDateString("en-GB")
                                        .replace(/\//g, "-")
                                    : ""}
                                </td>

                                {/* Time Delay */}
                                <td className="px-4 py-2 border-b">
                                  {row.timeDelayMaterialReceived ?? ""}
                                </td>

                                {/* Material Received Date (PSE) */}
                                <td className="px-4 py-2 border-b">
                                  <input
                                    type="date"
                                    className="border p-1 rounded"
                                    value={row.materialReceivedDate ?? ""}
                                    disabled={
                                      !(role === "PSE" || role === "ADMIN")
                                    }
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "materialReceivedDate",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>

                                {/* Store Received Date (same field used in Store section) */}
                                <td className="px-4 py-2 border-b">
                                  <input
                                    type="date"
                                    className="border p-1 rounded"
                                    value={row.storeReceivedDate ?? ""}
                                    disabled={
                                      !(role === "Store" || role === "ADMIN")
                                    }
                                    onChange={(e) =>
                                      handleFieldChange(
                                        row._id,
                                        "storeReceivedDate",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>
                              </>
                            )}
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </Motion.div>
        {/* ------- RIGHT ALIGNED SUBMIT BUTTON ------- */}
        {selectedOption !== "Summary Report" &&
          selectedOption !== "System Logs" && (
            <div className="flex justify-end">
              <button
                onClick={handleSubmitUpdates}
                disabled={saving}
                className={`mt-6 w-full sm:w-auto px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-lg rounded-xl shadow-md transition ${
                  saving
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </span>
                ) : (
                  "SUBMIT UPDATES"
                )}
              </button>
            </div>
          )}
      </main>
    </div>
  );
}
