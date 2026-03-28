import React, { useMemo, useState } from "react";
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
  masterUniqueIdFilter,
  setMasterUniqueIdFilter,
  selectedSubmittedByNames,
  setSelectedSubmittedByNames,
  submittedByOptions,
  storeInFilter,
  setStoreInFilter,
  storeItemDescriptionFilter,
  setStoreItemDescriptionFilter,
  date,
  setDate,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) {
  const [submittedBySearch, setSubmittedBySearch] = useState("");

  const selectedSubmittedByList = Array.isArray(selectedSubmittedByNames)
    ? selectedSubmittedByNames
    : [];

  const filteredSubmittedByOptions = useMemo(() => {
    const q = String(submittedBySearch || "").trim().toLowerCase();
    const all = Array.isArray(submittedByOptions) ? submittedByOptions : [];
    if (!q) return all;
    return all.filter((name) => String(name || "").toLowerCase().includes(q));
  }, [submittedByOptions, submittedBySearch]);

  const toggleSubmittedByName = (name) => {
    if (!name) return;
    if (selectedSubmittedByList.includes(name)) {
      setSelectedSubmittedByNames(
        selectedSubmittedByList.filter((item) => item !== name),
      );
      return;
    }
    setSelectedSubmittedByNames([...selectedSubmittedByList, name]);
  };

  return (
    <div className="mb-3 flex flex-col gap-3 xl:flex-row xl:justify-between xl:items-center">
      <div className="flex flex-wrap gap-2">
        {selectedOption === "PC Follow Up" && (
          <>
            {["PC1", "PC2", "PC3"].map((pc, index) => (
              <button
                key={pc}
                onClick={() => setPcFollowUp(pc)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[11px] sm:text-xs font-semibold shadow-sm transition
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
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[11px] sm:text-xs font-semibold shadow-sm transition
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

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {selectedOption === "Store" && showExcessBox && (
          <button
            onClick={() => setShowExcessBox((v) => !v)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[11px] sm:text-xs font-semibold shadow-sm transition ${
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
          <FaSearch className="text-red-700 text-base sm:text-lg font-bold" />
          <label className="text-sm sm:text-base font-bold text-red-800">Find By :</label>
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
          {selectedOption === "PMS Master Sheet" && (
            <option value="UniqueId">Unique Number</option>
          )}
          {selectedOption === "PC Follow Up" && (
            <option value="SubmittedByMulti">Submitted By (Multiple)</option>
          )}
          {selectedOption === "Store" && (
            <>
              <option value="IN">I.N</option>
              <option value="ItemDescription">Item Description</option>
              <option value="ManualClosed">Manual Closed</option>
            </>
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

        {selectedOption === "PMS Master Sheet" && findBy === "UniqueId" && (
          <input
            type="text"
            className="border p-1 rounded-lg text-xs min-w-[210px]"
            value={masterUniqueIdFilter}
            onChange={(e) => setMasterUniqueIdFilter(e.target.value)}
            placeholder="Enter Unique Number"
          />
        )}

        {selectedOption === "PC Follow Up" && findBy === "SubmittedByMulti" && (
          <div className="w-full md:w-auto md:min-w-[420px] rounded-lg border bg-white shadow-sm p-2">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[11px] font-semibold text-gray-700">
                Submitted By
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">
                {selectedSubmittedByList.length} selected
              </span>
              <button
                type="button"
                className="text-[10px] px-2 py-1 rounded border bg-gray-50 hover:bg-gray-100"
                onClick={() =>
                  setSelectedSubmittedByNames(
                    Array.isArray(submittedByOptions) ? submittedByOptions : [],
                  )
                }
              >
                Select All
              </button>
              <button
                type="button"
                className="text-[10px] px-2 py-1 rounded border bg-gray-50 hover:bg-gray-100"
                onClick={() => setSelectedSubmittedByNames([])}
              >
                Clear
              </button>
            </div>

            <input
              type="text"
              className="w-full border p-1.5 rounded-lg text-xs mb-2"
              placeholder="Search submitted by name..."
              value={submittedBySearch}
              onChange={(e) => setSubmittedBySearch(e.target.value)}
            />

            <div className="max-h-[140px] overflow-y-auto border rounded-lg p-2 bg-gray-50 space-y-1">
              {filteredSubmittedByOptions.length === 0 && (
                <div className="text-[11px] text-gray-500">No names found</div>
              )}
              {filteredSubmittedByOptions.map((name) => (
                <label
                  key={name}
                  className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="accent-red-600"
                    checked={selectedSubmittedByList.includes(name)}
                    onChange={() => toggleSubmittedByName(name)}
                  />
                  <span>{name}</span>
                </label>
              ))}
            </div>

            {selectedSubmittedByList.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedSubmittedByList.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] bg-red-50 text-red-700 border border-red-200"
                  >
                    {name}
                    <button
                      type="button"
                      className="font-bold leading-none"
                      onClick={() => toggleSubmittedByName(name)}
                      aria-label={`Remove ${name}`}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedOption === "Store" && findBy === "IN" && (
          <input
            type="text"
            className="border p-1 rounded-lg text-xs min-w-[180px]"
            value={storeInFilter}
            onChange={(e) => setStoreInFilter(e.target.value)}
            placeholder="Enter I.N"
          />
        )}

        {selectedOption === "Store" && findBy === "ItemDescription" && (
          <input
            type="text"
            className="border p-1 rounded-lg text-xs min-w-[220px]"
            value={storeItemDescriptionFilter}
            onChange={(e) => setStoreItemDescriptionFilter(e.target.value)}
            placeholder="Enter Item Description"
          />
        )}
      </div>
    </div>
  );
}
