import React from "react";

export default function LocalPurchaseBulkSection({
  selectAllLpRows,
  renderedTableData,
  clearLpSelection,
  lpBulkInvoiceDate,
  setLpBulkInvoiceDate,
  lpBulkInvoiceNumber,
  setLpBulkInvoiceNumber,
  lpBulkVendorName,
  setLpBulkVendorName,
  lpBulkModeOfTransport,
  setLpBulkModeOfTransport,
  lpBulkTransporterName,
  setLpBulkTransporterName,
  lpBulkRemarks,
  setLpBulkRemarks,
  handleLocalPurchaseBulkApply,
  lpBulkUploading,
  lpSelectedRowIds,
  lpBulkError,
  lpBulkSuccess,
}) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md mb-4 border">
      <div className="font-semibold text-sm mb-3 text-gray-700">
        Local Purchase Bulk Update (for selected rows)
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            className="px-3 py-2 text-xs rounded bg-gray-100 border hover:bg-gray-200"
            onClick={() => selectAllLpRows(renderedTableData)}
          >
            Select All
          </button>
          <button
            type="button"
            className="px-3 py-2 text-xs rounded bg-gray-100 border hover:bg-gray-200"
            onClick={clearLpSelection}
          >
            Clear
          </button>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Invoice Date</label>
          <input
            type="date"
            className="border p-2 rounded text-xs"
            value={lpBulkInvoiceDate}
            onChange={(e) => setLpBulkInvoiceDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Invoice Number</label>
          <input
            type="text"
            className="border p-2 rounded text-xs"
            value={lpBulkInvoiceNumber}
            onChange={(e) => setLpBulkInvoiceNumber(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Vendor Name</label>
          <input
            type="text"
            className="border p-2 rounded text-xs"
            value={lpBulkVendorName}
            onChange={(e) => setLpBulkVendorName(e.target.value)}
            placeholder="Vendor"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Mode of Transport</label>
          <select
            className="border p-2 rounded text-xs"
            value={lpBulkModeOfTransport}
            onChange={(e) => setLpBulkModeOfTransport(e.target.value)}
          >
            <option value="">--Select--</option>
            <option value="By Hand">By Hand</option>
            <option value="By Transport">By Transport</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Transporter Name</label>
          <input
            type="text"
            className="border p-2 rounded text-xs"
            value={lpBulkTransporterName}
            onChange={(e) => setLpBulkTransporterName(e.target.value)}
            placeholder="Transporter"
          />
        </div>

        <div className="flex flex-col flex-1 min-w-[200px]">
          <label className="text-xs text-gray-600 mb-1">Remarks</label>
          <input
            type="text"
            className="border p-2 rounded text-xs w-full"
            value={lpBulkRemarks}
            onChange={(e) => setLpBulkRemarks(e.target.value)}
            placeholder="Remarks"
          />
        </div>

        <button
          type="button"
          className="px-4 py-2 text-xs rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
          onClick={handleLocalPurchaseBulkApply}
          disabled={lpBulkUploading}
        >
          {lpBulkUploading ? "Applying..." : "Apply to Selected"}
        </button>
      </div>

      <div className="mt-2 text-xs">
        <div className="text-gray-600">Selected rows: {lpSelectedRowIds.length}</div>
        {lpBulkError && <div className="text-red-600 mt-1">{lpBulkError}</div>}
        {lpBulkSuccess && <div className="text-green-700 mt-1">{lpBulkSuccess}</div>}
      </div>
    </div>
  );
}
