import React, { useState, useEffect, useCallback } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  createTransportRecords,
  getAllTransportRecords,
  updateTransportRecords,
} from "../api/Transport.api";
import { getAllIndentForms } from "../api/IndentForm.api";
import { FaShoppingCart, FaChevronDown, FaSignOutAlt } from "react-icons/fa";

const emptyRow = {
  uniqueId: "",
  transporterName: "",
  supplierName: "",
  freightCharges: "",
  loadingUnloadingCharge: "",
  freePeriod: "",
  perDayCharge: "",
  insurance: "",
  insuranceCoverageCarriedBy: "",
  loadingLocation: "",
  loadingState: "",
  deliveryPoint: "",
  distanceInKm: "",
  route: "",
  modeOfDelivery: "",
  startDate: "",
  transitTime: "",
  trasporterContactDetails: "",
  driverContactDetails: "",
  vehicleType: "",
  vehicleNumber: "",
  vehicleLoadingCapacity: "",
  lr_Gr_No: "",
  ewayBillInvoice: "",
  panCardFreightInvoice: "",
  trackingSystem: "",
  paymentTerms: "",
  dimension: "",
  materialWeight: "",
  specialConditions: "",
  materialReceived: "",
  invoiceNumber: "",
  receivedDate: "",
  finalPaymentUTR: "",
  finalPaymentDate: "",
  unit: "",
  remarks: "",
};

const columns = [
  { key: "uniqueId", label: "Unique ID" },
  { key: "transporterName", label: "Transporter Name" },
  { key: "supplierName", label: "Supplier Name" },
  { key: "freightCharges", label: "Freight Charges" },
  { key: "loadingUnloadingCharge", label: "Loading / Unloading Charge" },
  { key: "freePeriod", label: "Free Period (Demurrage free days)" },
  { key: "perDayCharge", label: "Per Day Charge" },
  { key: "insurance", label: "Insurance" },
  { key: "insuranceCoverageCarriedBy", label: "Insurance coverage carried by" },
  { key: "loadingLocation", label: "Loading Location" },
  { key: "loadingState", label: "Loading State" },
  { key: "deliveryPoint", label: "Delivery Point" },
  { key: "distanceInKm", label: "Distance in Km" },
  { key: "route", label: "Route" },
  { key: "modeOfDelivery", label: "Mode of Delivery" },
  { key: "startDate", label: "Start Date" },
  { key: "transitTime", label: "Transit Time (Days)" },
  { key: "trasporterContactDetails", label: "Transporter Contact Details" },
  { key: "driverContactDetails", label: "Driver Contact Details" },
  { key: "vehicleType", label: "Vehicle Type" },
  { key: "vehicleNumber", label: "Vehicle Number" },
  { key: "vehicleLoadingCapacity", label: "Vehicle Loading Capacity (Ton)" },
  { key: "lr_Gr_No", label: "Required Documents (LR / GR) No" },
  { key: "ewayBillInvoice", label: "Required Documents (E-way Bill & Invoice)" },
  { key: "panCardFreightInvoice", label: "PAN CARD (Freight Invoice)" },
  { key: "trackingSystem", label: "Tracking System" },
  { key: "paymentTerms", label: "Payment Terms" },
  { key: "dimension", label: "Dimension (Length Ft)" },
  { key: "materialWeight", label: "Material Weight (Ton)" },
  { key: "specialConditions", label: "Special Conditions" },
  { key: "materialReceived", label: "Material Received" },
  { key: "invoiceNumber", label: "Invoice Number" },
  { key: "receivedDate", label: "Received Date" },
  { key: "finalPaymentUTR", label: "FINAL PAYMENT UTR" },
  { key: "finalPaymentDate", label: "FINAL PAYMENT DATE" },
  { key: "unit", label: "UNIT" },
  { key: "remarks", label: "REMARKS" },
];

export default function Transport() {
  const navigate = useNavigate();
  const [existingRows, setExistingRows] = useState([]);
  const [newRows, setNewRows] = useState([]);
  const [uniqueIdFilter, setUniqueIdFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
    window.location.reload();
  };

  // ✅ useCallback avoids "used before declared" lint + stable reference
  const fetchTransportData = useCallback(async () => {
    try {
      const [transportRes, indentRes] = await Promise.all([
        getAllTransportRecords(),
        getAllIndentForms({
          role: localStorage.getItem("role") || "",
          username: localStorage.getItem("username") || "",
        }),
      ]);

      const transportRows = Array.isArray(transportRes?.data)
        ? transportRes.data
        : [];
      const indentRows = Array.isArray(indentRes?.data)
        ? indentRes.data
        : [];

      const transportByUniqueId = new Map(
        transportRows
          .filter((r) => r && r.uniqueId)
          .map((r) => [String(r.uniqueId), r])
      );

      const merged = indentRows.map((indent) => {
        const key = String(indent.uniqueId || "");
        const existing = transportByUniqueId.get(key);
        if (existing) return existing;

        return {
          ...emptyRow,
          uniqueId: key,
        };
      });

      // Append any transport rows that don't have a matching indent
      const indentUniqueIds = new Set(
        indentRows.map((i) => String(i.uniqueId || "")).filter(Boolean)
      );
      const orphanTransports = transportRows.filter(
        (r) => r?.uniqueId && !indentUniqueIds.has(String(r.uniqueId))
      );

      setExistingRows([...merged, ...orphanTransports]);
    } catch (err) {
      console.error("Failed to fetch transport records", err);
    }
  }, []);

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchTransportData();

  const link = document.createElement("link");
  link.href =
    "https://fonts.googleapis.com/css2?family=Agu+Display&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
}, [fetchTransportData]);

  const handleAddRow = () => {
    setNewRows((prev) => [...prev, { ...emptyRow }]);
  };

  const handleChange = (setFn, index, field, value) => {
    setFn((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const hasAnyTransportData = (row) => {
    if (!row) return false;
    return columns.some((col) => {
      if (col.key === "uniqueId") return false;
      const val = row[col.key];
      if (typeof val === "number") return Number(val) > 0;
      return String(val || "").trim() !== "";
    });
  };

  const handleSubmit = async () => {
    if (newRows.length === 0 && existingRows.length === 0) {
      alert("Nothing to submit");
      return;
    }

    try {
      const rowsToUpdate = existingRows.filter((r) => r && r._id);
      const rowsToCreate = [
        ...existingRows.filter((r) => !r?._id && hasAnyTransportData(r)),
        ...newRows.filter((r) => hasAnyTransportData(r)),
      ];

      const missingTransporter = rowsToCreate.find(
        (r) => !String(r?.transporterName || "").trim()
      );
      if (missingTransporter) {
        alert("Transporter Name is required for new transport rows.");
        return;
      }

      if (rowsToUpdate.length > 0) {
        await updateTransportRecords(rowsToUpdate);
      }

      if (rowsToCreate.length > 0) {
        await createTransportRecords(rowsToCreate);
        setNewRows([]);
      }

      alert("Transport data saved successfully");
      fetchTransportData();
    } catch (err) {
      console.error(err);
      alert("Failed to save transport data");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-poppins">
      <nav className="w-full py-6 px-10 flex justify-between items-center bg-transparent mt-4">
        <div className="flex items-center gap-4">
          <FaShoppingCart className="text-red-600 text-5xl" />
          <h1
            className="text-4xl font-bold tracking-wide text-gray-900"
            style={{ fontFamily: "'Agu Display', sans-serif" }}
          >
            PURCHASE MANAGEMENT SYSTEM
          </h1>
        </div>

        <div className="relative group">
          <div className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative w-11 h-11 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-red-500 opacity-80 blur-[1px]" />
              <div className="relative w-10 h-10 rounded-full bg-red-600 flex items-center justify-center ring-2 ring-red-300 shadow-md">
                <span className="text-white font-extrabold text-lg uppercase">
                  {localStorage.getItem("username")?.charAt(0)}
                </span>
              </div>
            </div>

            <span className="font-medium text-gray-800 whitespace-nowrap">
              {localStorage.getItem("username")}
              {localStorage.getItem("role") && (
                <span className="text-sm text-gray-500 ml-1">
                  ({localStorage.getItem("role")})
                </span>
              )}
            </span>

            <FaChevronDown className="text-gray-600 transition-transform group-hover:rotate-180" />
          </div>

          <div className="absolute right-0 mt-3 w-44 bg-white rounded-xl shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <div className="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 border-l border-t" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700
                         border border-transparent rounded-xl
                         hover:border-red-600 hover:bg-red-50 hover:text-red-600
                         transition"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="px-6 py-10">
        <Motion.div className="bg-white rounded-3xl shadow-md p-8">
              <div className="mb-6 p-4 bg-red-600 rounded-xl text-center">
                <h1 className="text-3xl font-bold text-white">Transport</h1>
              </div>

              <div className="mb-4 p-4 bg-white rounded-xl shadow-md border">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">Unique ID</label>
                    <input
                      type="text"
                      className="border p-2 rounded"
                      value={uniqueIdFilter}
                      onChange={(e) => setUniqueIdFilter(e.target.value)}
                      placeholder="Search Unique ID"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">Date From</label>
                    <input
                      type="date"
                      className="border p-2 rounded"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">Date To</label>
                    <input
                      type="date"
                      className="border p-2 rounded"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 text-xs font-semibold"
                    onClick={() => {
                      setUniqueIdFilter("");
                      setDateFrom("");
                      setDateTo("");
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="min-w-max border text-xs">
              <thead className="bg-gray-200">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3 border-b">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {existingRows
                  .filter((row) => {
                    const uid = String(row.uniqueId || "").toLowerCase();
                    const uidFilter = String(uniqueIdFilter || "").toLowerCase().trim();
                    if (uidFilter && !uid.includes(uidFilter)) return false;

                    const inRange = (val) => {
                      if (!val) return false;
                      if (dateFrom && val < dateFrom) return false;
                      if (dateTo && val > dateTo) return false;
                      return true;
                    };

                    if (!dateFrom && !dateTo) return true;

                    const start = row.startDate || "";
                    const received = row.receivedDate || "";

                    return inRange(start) || inRange(received);
                  })
                  .map((row, index) => (
                  <tr key={row._id || `existing-${index}`}>
                    {columns.map((col) => (
                      <td key={col.key} className="border-b px-2 py-1">
                        <input
                          type="text"
                          value={row[col.key] || ""}
                          readOnly={col.key === "uniqueId"}
                          onChange={(e) =>
                            handleChange(
                              setExistingRows,
                              index,
                              col.key,
                              e.target.value
                            )
                          }
                          className={`border rounded p-1 w-full ${
                            col.key === "uniqueId" ? "bg-gray-100 cursor-not-allowed" : "bg-gray-100"
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}

                {newRows.map((row, index) => (
                  <tr key={`new-${index}`} className="bg-green-50">
                    {columns.map((col) => (
                      <td key={col.key} className="border-b px-2 py-1">
                        <input
                          type="text"
                          value={row[col.key] || ""}
                          onChange={(e) =>
                            handleChange(setNewRows, index, col.key, e.target.value)
                          }
                          className="border rounded p-1 w-full"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={handleAddRow}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Row
            </button>

            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Submit
            </button>
          </div>
        </Motion.div>
      </main>
    </div>
  );
}
