import React from "react";

export default function PoBulkSection({
  poSelectedRowIds,
  poBulkPoNumber,
  setPoBulkPoNumber,
  poBulkPoDate,
  setPoBulkPoDate,
  poBulkVendorName,
  setPoBulkVendorName,
  poBulkLeadDays,
  setPoBulkLeadDays,
  poBulkPaymentCondition,
  setPoBulkPaymentCondition,
  poBulkAmount,
  setPoBulkAmount,
  poBulkPapwDays,
  setPoBulkPapwDays,
  poBulkFileKey,
  setPoBulkFile,
  handlePoBulkUpload,
  poBulkUploading,
  clearPoSelection,
  setPoBulkError,
  setPoBulkSuccess,
  poBulkError,
  poBulkSuccess,
}) {
  return (
    <div className="mb-4 border rounded-xl p-4 bg-white shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="font-semibold text-sm text-gray-800">
          Bulk PO (one PO PDF to many selected items) - Selected:{" "}
          {poSelectedRowIds.length}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">PO Number</label>
            <input
              className="border p-2 rounded text-xs"
              value={poBulkPoNumber}
              onChange={(e) => setPoBulkPoNumber(e.target.value)}
              placeholder="PO Number"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-600">PO Date</label>
            <input
              type="date"
              className="border p-2 rounded text-xs"
              value={poBulkPoDate}
              onChange={(e) => setPoBulkPoDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Vendor Name</label>
            <input
              className="border p-2 rounded text-xs"
              value={poBulkVendorName}
              onChange={(e) => setPoBulkVendorName(e.target.value)}
              placeholder="Vendor"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Lead Days</label>
            <input
              type="number"
              className="border p-2 rounded text-xs"
              value={poBulkLeadDays}
              onChange={(e) => setPoBulkLeadDays(e.target.value)}
              placeholder="Lead days"
              min="0"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Payment Condition</label>
            <select
              className="border p-2 rounded text-xs"
              value={poBulkPaymentCondition}
              onChange={(e) => setPoBulkPaymentCondition(e.target.value)}
            >
              <option value="">--Select--</option>
              <option value="After Received">After Received</option>
              <option value="Before Dispatch">Before Dispatch</option>
              <option value="PWP BBD">PWP BBD</option>
              <option value="PWP BBD FAR">PWP BBD FAR</option>
              <option value="PWP BBD PAPW">PWP BBD PAPW</option>
              <option value="PAPW">PAPW</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Amount</label>
            <input
              type="number"
              className="border p-2 rounded text-xs"
              value={poBulkAmount}
              onChange={(e) => setPoBulkAmount(e.target.value)}
              placeholder="Amount"
              min="0"
            />
          </div>

          {String(poBulkPaymentCondition || "")
            .toUpperCase()
            .includes("PAPW") && (
            <div className="flex flex-col">
              <label className="text-xs text-gray-600">PAPW Days</label>
              <input
                type="number"
                className="border p-2 rounded text-xs"
                value={poBulkPapwDays}
                onChange={(e) => setPoBulkPapwDays(e.target.value)}
                placeholder="PAPW Days"
                min="0"
              />
            </div>
          )}

          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Upload PO PDF</label>
            <input
              key={poBulkFileKey}
              type="file"
              accept="application/pdf"
              className="text-xs"
              onChange={(e) => setPoBulkFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex gap-2">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs disabled:opacity-50"
              onClick={handlePoBulkUpload}
              disabled={poBulkUploading}
            >
              {poBulkUploading ? "Uploading..." : "Upload & Apply"}
            </button>

            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-xs"
              onClick={() => {
                clearPoSelection();
                setPoBulkError("");
                setPoBulkSuccess("");
              }}
              type="button"
            >
              Clear Selection
            </button>
          </div>
        </div>

        {poBulkError && <div className="text-sm text-red-600">{poBulkError}</div>}
        {poBulkSuccess && (
          <div className="text-sm text-green-700">{poBulkSuccess}</div>
        )}
      </div>
    </div>
  );
}
