import React from "react";

export default function StoreBulkInvoiceSection({
  renderedTableData,
  setStoreSelectedRowIds,
  clearStoreSelection,
  storeSelectedRowIds,
  storeBulkInvoiceNumber,
  setStoreBulkInvoiceNumber,
  storeBulkInvoiceDate,
  setStoreBulkInvoiceDate,
  storeBulkReceivedDate,
  setStoreBulkReceivedDate,
  storeBulkFileKey,
  setStoreBulkFile,
  handleStoreBulkInvoiceUpload,
  storeBulkUploading,
  storeBulkError,
  storeBulkSuccess,
}) {
  return (
    <div className="mb-4 p-4 bg-white rounded-xl shadow-md border">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="font-semibold text-gray-800">
            Same Invoice for Multiple Items
            <span className="ml-2 text-xs text-gray-500">
              (select rows below, then upload one invoice PDF)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-1.5 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 text-xs font-semibold"
              onClick={() => {
                const ids = (renderedTableData || [])
                  .map((r) => r?._id)
                  .filter(Boolean);
                setStoreSelectedRowIds(ids);
              }}
            >
              Select All Visible
            </button>

            <button
              type="button"
              className="px-3 py-1.5 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 text-xs font-semibold"
              onClick={clearStoreSelection}
            >
              Clear
            </button>

            <div className="text-xs text-gray-600">
              Selected:{" "}
              <span className="font-semibold">{storeSelectedRowIds.length}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Invoice Number *</label>
            <input
              type="text"
              className="border p-2 rounded"
              value={storeBulkInvoiceNumber}
              onChange={(e) => setStoreBulkInvoiceNumber(e.target.value)}
              placeholder="Invoice no"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Invoice Date</label>
            <input
              type="date"
              className="border p-2 rounded"
              value={storeBulkInvoiceDate}
              onChange={(e) => setStoreBulkInvoiceDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Received Date</label>
            <input
              type="date"
              className="border p-2 rounded"
              value={storeBulkReceivedDate}
              onChange={(e) => setStoreBulkReceivedDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Upload Invoice PDF *</label>
            <input
              key={storeBulkFileKey}
              type="file"
              accept="application/pdf"
              className="border p-2 rounded"
              onChange={(e) => setStoreBulkFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleStoreBulkInvoiceUpload}
            disabled={storeBulkUploading}
            className={`px-4 py-2 rounded text-white text-sm font-semibold shadow-sm transition ${
              storeBulkUploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {storeBulkUploading ? "Uploading..." : "Upload & Apply to Selected"}
          </button>

          {storeBulkError && <div className="text-sm text-red-600">{storeBulkError}</div>}
          {storeBulkSuccess && (
            <div className="text-sm text-green-700">{storeBulkSuccess}</div>
          )}
        </div>
      </div>
    </div>
  );
}
