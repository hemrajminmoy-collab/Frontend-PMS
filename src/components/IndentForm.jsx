import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaChevronDown, FaSignOutAlt } from "react-icons/fa";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

import {
  createIndentForm,
  createLocalPurchaseForm,
  getLatestUniqueId,
  getLatestLocalPurchaseUniqueId,
} from "../api/IndentForm.api";

export default function IndentCreationForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    site: "",
    section: "",
    uniqueId: "",
    indentNumber: "",
    itemNumber: "",
    itemDescription: "",
    uom: "",
    totalQuantity: "",
    submittedBy: "",

    // ✅ NEW FIELDS
    applicationArea: "",
    oldMaterialStatus: "",
    orderApprovedBy: "",
  });

  const [bulkData, setBulkData] = useState([]);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [isLocalPurchase, setIsLocalPurchase] = useState(false);

  // ===========================
  // Fetch Latest Unique ID
  // ===========================
  useEffect(() => {
    async function fetchUniqueId() {
      try {
        const res = isLocalPurchase
          ? await getLatestLocalPurchaseUniqueId()
          : await getLatestUniqueId();

        if (res?.success) {
          setFormData((prev) => ({
            ...prev,
            uniqueId: res.uniqueId.toString(),
          }));
        }
      } catch (error) {
        console.error("Error fetching unique ID:", error);
      }
    }

    fetchUniqueId();
  }, [isLocalPurchase]);

  // Agu Font Loader
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Agu+Display&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ===========================
  // Submit
  // ===========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const totalQty = Number(formData.totalQuantity);
      if (isNaN(totalQty)) throw new Error("Total Quantity must be a number");

      if (isLocalPurchase) {
        await createLocalPurchaseForm({
          ...formData,
          totalQuantity: totalQty,
          localPurchase: true,
        });
      } else {
        await createIndentForm({
          ...formData,
          totalQuantity: totalQty,
        });
      }

      alert(
        isLocalPurchase
          ? "Local Purchase Submitted Successfully!"
          : "Indent Form Submitted Successfully!"
      );

      const newId = isLocalPurchase
        ? await getLatestLocalPurchaseUniqueId()
        : await getLatestUniqueId();

      setFormData({
        site: "",
        section: "",
        uniqueId: newId?.success ? newId.uniqueId.toString() : "",
        indentNumber: "",
        itemNumber: "",
        itemDescription: "",
        uom: "",
        totalQuantity: "",
        submittedBy: "",

        applicationArea: "",
        oldMaterialStatus: "",
        orderApprovedBy: "",
      });

      setIsLocalPurchase(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form: " + error.message);
    }
  };

  const handleCancel = () => {
    setFormData((prev) => ({
      ...prev,
      site: "",
      section: "",
      indentNumber: "",
      itemNumber: "",
      itemDescription: "",
      uom: "",
      totalQuantity: "",
      submittedBy: "",
      applicationArea: "",
      oldMaterialStatus: "",
      orderApprovedBy: "",
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    navigate("/", { replace: true });
    window.location.reload();
  };

  // ================= Bulk Upload Handlers =================
  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      setBulkData(data);
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkSave = async () => {
    if (!bulkData.length) return alert("No data to save!");

    try {
      for (let i = 0; i < bulkData.length; i++) {
        const row = bulkData[i];
        const totalQty = Number(row["Total Quantity"]);
        if (isNaN(totalQty))
          return alert(`Invalid Total Quantity at row ${i + 2}`);

        const idRes = await getLatestUniqueId();
        const uniqueId = idRes.success ? idRes.uniqueId.toString() : "";

        await createIndentForm({
          uniqueId,
          site: row["Site"] || "",
          section: row["Section"] || "",
          applicationArea: row["Application Area"] || "",
          oldMaterialStatus: row["Old Material Status"] || "",
          orderApprovedBy: row["Order Approved By"] || "",
          indentNumber: row["Indent Number"] || "",
          itemNumber: row["Item Number"] || "",
          uom: row["UOM"] || "",
          itemDescription: row["Item Description"] || "",
          totalQuantity: totalQty,
          submittedBy: row.submittedBy || "User",
        });
      }

      alert("Bulk data saved successfully!");
      setBulkData([]);
      setShowBulkUpload(false);
    } catch (error) {
      console.error(error);
      alert("Failed to save bulk data.");
    }
  };

  // ================= Excel Template =================
  const handleCreateTemplate = async () => {
    const wsData = [
      [
        "Site",
        "Section",
        "Application Area",
        "Old Material Status",
        "Order Approved By",
        "Indent Number",
        "Item Number",
        "UOM",
        "Item Description",
        "Total Quantity",
      ],
      ["", "", "", "", "", "", "", "", "", ""],
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Indent_Form_Template.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
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
            <div className="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 border-l border-t"></div>

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

      {/* Buttons */}
      <div className="flex flex-row items-center justify-end p-6 mt-6 gap-6">
        <button
          onClick={handleCreateTemplate}
          className="px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Create Excel Template
        </button>

        <button
          onClick={() => setShowBulkUpload(!showBulkUpload)}
          className="px-6 py-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition"
        >
          {showBulkUpload ? "Hide Bulk Upload" : "Bulk Upload from Excel"}
        </button>
      </div>

      {/* Bulk Upload Section */}
      {showBulkUpload && (
        <div className="mx-auto bg-gray-200 p-6 rounded-xl mb-6 w-full max-w-6xl">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleBulkUpload}
            className="bg-gray-200 p-3"
          />
          {bulkData.length > 0 && (
            <div className="overflow-x-auto mt-4">
              <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-300">
                    {Object.keys(bulkData[0]).map((key) => (
                      <th
                        key={key}
                        className="border border-gray-400 px-2 py-1 text-left"
                      >
                        {key}
                      </th>
                    ))}
                    <th className="border border-gray-400 px-2 py-1 text-left">
                      submittedBy
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bulkData.map((row, idx) => (
                    <tr key={idx}>
                      {Object.keys(row).map((key) => (
                        <td key={key} className="border px-2 py-1">
                          {row[key]}
                        </td>
                      ))}
                      <td className="border px-2 py-1">
                        <select
                          value={row.submittedBy || ""}
                          onChange={(e) => {
                            const updated = [...bulkData];
                            updated[idx].submittedBy = e.target.value;
                            setBulkData(updated);
                          }}
                          className="p-2 rounded bg-gray-200"
                        >
                          <option value="">Select</option>
                          <option value="Proloy Ghosh">Proloy Ghosh</option>
                          <option value="Sayanta Chakraborty">
                            Sayanta Chakraborty
                          </option>
                          <option value="Arpita Ghosh">Arpita Ghosh</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                onClick={handleBulkSave}
                className="mt-4 px-6 py-3 rounded-full bg-green-600 text-white hover:bg-green-700 transition"
              >
                Save All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <div className="flex flex-col justify-center items-center p-10 mt-[-30px] w-full gap-6">
        <Motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-10 rounded-3xl w-full max-w-4xl bg-transparent"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          <div className="w-full rounded-xl mb-10 p-4 text-center bg-red-600 shadow-md">
            <h2 className="text-3xl font-bold text-white">
              Indent Creation Form
            </h2>
          </div>

          {/* ✅ MAIN GRID (3 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Unique ID */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Unique ID <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="uniqueId"
                value={formData.uniqueId}
                readOnly
                className="w-full p-3 bg-[#DFDDDD] rounded-xl cursor-not-allowed"
              />
            </div>

            {/* Site */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Site <span className="text-red-600">*</span>
              </label>
              <select
                name="site"
                required
                value={formData.site}
                onChange={handleChange}
                className="w-full p-3 bg-[#DFDDDD] rounded-xl"
              >
                <option value="">Select Site</option>
                <option value="HIPL">HIPL</option>
                <option value="RSIPL">RSIPL</option>
                <option value="HRM">HRM</option>
                <option value="SUNAGROW">SUNAGROW</option>
                <option value="RICE FIELD">RICE FIELD</option>
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Section <span className="text-red-600">*</span>
              </label>
              <select
                name="section"
                required
                value={formData.section}
                onChange={handleChange}
                className="w-full p-3 bg-[#DFDDDD] rounded-xl"
              >
                <option value="">Select Section</option>
                <option value="REFINERY">REFINERY</option>
                <option value="CENTRAL STORE">CENTRAL STORE</option>
                <option value="MEGA STORE">MEGA STORE</option>
                <option value="OILS STORE">OILS STORE</option>
                <option value="PP STORE">PP STORE</option>
                <option value="RSIPL">RSIPL</option>
                <option value="HRM">HRM</option>
                <option value="OILS LAB">OILS LAB</option>
                <option value="RSIPL-PROJECT-R">RSIPL-PROJECT-R</option>
                <option value="RSIPL-PROJECT-S">RSIPL-PROJECT-S</option>
                <option value="SUNAGROW">SUNAGROW</option>
                <option value="RICE FIELD">RICE FIELD</option>
              </select>
            </div>

            {/* Application Area */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Application Area
              </label>
              <input
                type="text"
                name="applicationArea"
                value={formData.applicationArea}
                onChange={handleChange}
                className="w-full p-3 bg-[#DFDDDD] rounded-xl"
                placeholder="Application Area"
              />
            </div>

            {/* Old Material Status */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Old Material Status
              </label>
              <input
                type="text"
                name="oldMaterialStatus"
                value={formData.oldMaterialStatus}
                onChange={handleChange}
                placeholder="Write status"
                className="w-full p-3 bg-[#DFDDDD] rounded-xl"
              />
            </div>

            {/* Order Approved By */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Order Approved By
              </label>
              <input
                type="text"
                name="orderApprovedBy"
                value={formData.orderApprovedBy}
                onChange={handleChange}
                className="w-full p-3 bg-[#DFDDDD] rounded-xl"
                placeholder="Order Approved By"
              />
            </div>

            {/* Indent Number */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Indent Number <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="indentNumber"
                required
                value={formData.indentNumber}
                onChange={handleChange}
                className="w-full p-3 bg-[#DFDDDD] rounded-xl"
              />
            </div>

            {/* Item Number */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Item Number <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="itemNumber"
                required
                value={formData.itemNumber}
                onChange={handleChange}
                className="w-full p-3 bg-[#DFDDDD] rounded-xl"
              />
            </div>

            {/* UOM */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                UOM <span className="text-red-600">*</span>
              </label>
              <select
                name="uom"
                required
                value={formData.uom}
                onChange={handleChange}
                className="w-full p-3 bg-[#DFDDDD] rounded-xl"
              >
                <option value="">Select UOM</option>
                <option value="DRUM">DRUM</option>
                <option value="NOS">NOS</option>
                <option value="KG">KG</option>
                <option value="PCS">PCS</option>
                <option value="JAR">JAR</option>
                <option value="MTR">MTR</option>
                <option value="BAGS">BAGS</option>
                <option value="LTR">LTR</option>
                <option value="SET">SET</option>
                <option value="BARREL">BARREL</option>
                <option value="BELT">BELT</option>
                <option value="RING">RING</option>
                <option value="GM">GM</option>
                <option value="BOX">BOX</option>
                <option value="FT">FT</option>
                <option value="ROLL">ROLL</option>
                <option value="ML">ML</option>
                <option value="SQ">SQ</option>
                <option value="CASE">CASE</option>
                <option value="TON">TON</option>
                <option value="PKT">PKT</option>
                <option value="BOTTLE">BOTTLE</option>
                <option value="PAIR">PAIR</option>
                <option value="COIL">COIL</option>
                <option value="CARTON">CARTON</option>
                <option value="STRIPS">STRIPS</option>
                <option value="CAN">CAN</option>
                <option value="PATI">PATI</option>
                <option value="BUNDLE">BUNDLE</option>
                <option value="BORA">BORA</option>
                <option value="FILE">FILE</option>
                <option value="AMPULES">AMPULES</option>
                <option value="BLOCK">BLOCK</option>
                <option value="CAPSULE">CAPSULE</option>
                <option value="REAM">REAM</option>
                <option value="CHAIN">CHAIN</option>
                <option value="PACK">PACK</option>
                <option value="SQM">SQM</option>
                <option value="M2">M2</option>
                <option value="CFT">CFT</option>
                <option value="SQ FT">SQ FT</option>
                <option value="EACH">EACH</option>
                <option value="CAR">CAR</option>
                <option value="LENGTH">LENGTH</option>
                <option value="DISTA">DISTA</option>
                <option value="PVC">PVC</option>
                <option value="DUMPER">DUMPER</option>
                <option value="UNIT">UNIT</option>
                <option value="SET EACH">SET EACH</option>
                <option value="ROLL/KG">ROLL/KG</option>
                <option value="MT">MT</option>
              </select>
            </div>

            {/* Item Description */}
            <div className="md:col-span-3">
              <label className="block font-medium text-gray-700 mb-1">
                Item Description <span className="text-red-600">*</span>
              </label>
              <textarea
                name="itemDescription"
                required
                value={formData.itemDescription}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 bg-[#DFDDDD] rounded-xl"
              />
            </div>
          </div>

          {/* Bottom 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Total Quantity <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="totalQuantity"
                required
                value={formData.totalQuantity}
                onChange={handleChange}
                className="w-full p-3 bg-[#DFDDDD] rounded-xl"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Submitted By <span className="text-red-600">*</span>
              </label>
              <select
                name="submittedBy"
                required
                value={formData.submittedBy}
                onChange={handleChange}
                className="w-full p-3 bg-[#DFDDDD] rounded-xl"
              >
                <option value="">Select Name</option>
                <option value="Praloy Ghosh">Praloy Ghosh</option>
                <option value="Sayanta chakraborty">Sayanta Chakraborty</option>
                <option value="Arpita Ghosh">Arpita Ghosh</option>
                <option value="Souritra Ghoshal">Souritra Ghoshal</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-8">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <input
                type="checkbox"
                checked={isLocalPurchase}
                onChange={(e) => setIsLocalPurchase(e.target.checked)}
                className="w-5 h-5 accent-red-600 cursor-pointer"
              />
              Local Purchase
            </label>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-green-600 text-white hover:bg-green-700 transition"
              >
                Submit
              </button>
            </div>
          </div>
        </Motion.form>
      </div>
    </div>
  );
}
