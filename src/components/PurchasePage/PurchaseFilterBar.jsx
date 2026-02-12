import React from "react";
import { FaSearch } from "react-icons/fa";

export default function PurchaseFilterBar({
  selectedOption,
  pcFollowUp,
  setPcFollowUp,
  paymentFollowUp,
  setPaymentFollowUp,
  showExcessBox,
  setShowExcessBox,
  findBy,
  handleFindByChange,
  selectedSite,
  setSelectedSite,
  selectedName,
  setSelectedName,
  date,
  setDate,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) {
  return (
    <div className="flex justify-between items-center mb-3">
      <div className="flex gap-2">
        {selectedOption === "PC Follow Up" && (
          <>
            {["PC1", "PC2", "PC3"].map((pc, index) => (
              <button
                key={pc}
                onClick={() => setPcFollowUp(pc)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition
                  ${
                    pcFollowUp === pc
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-red-100"
                  }`}
              >
                PC-Follow UP {index + 1}
              </button>
            ))}
          </>
        )}

        {selectedOption === "Payment Follow Up" && (
          <>
            {[
              { key: "PWP", label: "Payment Along with PO" },
              { key: "BBD", label: "Balance Before Dispatch" },
              { key: "FAR", label: "After Receive Material / FAR" },
              { key: "PAPW", label: "Payment After Performance Warranty / PAPW" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setPaymentFollowUp(item.key)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition
                  ${
                    paymentFollowUp === item.key
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-red-100"
                  }`}
              >
                {item.label}
              </button>
            ))}
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {selectedOption === "Store" && showExcessBox && (
          <button
            onClick={() => setShowExcessBox((v) => !v)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition ${
              showExcessBox
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-red-100"
            }`}
            title="Show/Hide Excess Quantity manual close panel"
          >
            Excess Quantity
          </button>
        )}

        <div className="flex items-center gap-2 bg-red-100 px-3 py-2 rounded-lg shadow-sm">
          <FaSearch className="text-red-700 text-xl font-bold" />
          <label className="text-lg font-bold text-red-800">Find By :</label>
        </div>

        <select
          className="border p-1 rounded-lg text-xs"
          value={findBy}
          onChange={(e) => handleFindByChange(e.target.value)}
        >
          <option value="">Select</option>
          <option value="Site">Site</option>
          <option value="Date">Date</option>
          <option value="DateRange">Date Range</option>
          <option value="Name">Name</option>
          {selectedOption === "Store" && (
            <option value="ManualClosed">Manual Closed</option>
          )}
        </select>

        {findBy === "Site" && (
          <select
            className="border p-1 rounded-lg text-xs"
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
          >
            <option value="">Select Site</option>
            <option value="HIPL">HIPL</option>
            <option value="RSIPL">RSIPL</option>
            <option value="HRM">HRM</option>
            <option value="SUNAGROW">SUNAGROW</option>
            <option value="RICE FIELD">RICE FIELD</option>
          </select>
        )}

        {findBy === "Date" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="border p-1 rounded-lg text-xs"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        )}

        {findBy === "DateRange" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="border p-1 rounded-lg text-xs"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="font-medium text-xs">to</span>
            <input
              type="date"
              className="border p-1 rounded-lg text-xs"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        )}

        {findBy === "Name" && (
          <select
            className="border p-1 rounded-lg text-xs"
            value={selectedName}
            onChange={(e) => setSelectedName(e.target.value)}
          >
            <option value="">Select Name</option>
            <option value="Local 1">Local Purchase 1</option>
            <option value="Local 2">Local Purchase 2</option>
            <option value="Local 3">Local Purchase 3</option>
          </select>
        )}
      </div>
    </div>
  );
}
