import React from "react";

export default function StoreManualCloseSection({
  manualCloseUniqueId,
  setManualCloseUniqueId,
  handleFetchManualClose,
  manualCloseLoading,
  manualCloseReason,
  setManualCloseReason,
  handleManualClose,
  manualCloseRecord,
  manualCloseError,
  manualCloseSuccess,
}) {
  return (
    <div className="mb-4 p-4 bg-white rounded-xl shadow-md border">
      <div className="font-semibold text-gray-800 mb-2">
        Manual Close (Unique ID)
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600">Unique ID</label>
          <input
            type="text"
            className="border p-2 rounded w-64"
            placeholder="Enter Unique ID (e.g., DEMO-PC1-001)"
            value={manualCloseUniqueId}
            onChange={(e) => setManualCloseUniqueId(e.target.value)}
          />
        </div>

        <button
          className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50"
          onClick={handleFetchManualClose}
          disabled={manualCloseLoading}
        >
          {manualCloseLoading ? "Fetching..." : "Fetch"}
        </button>

        <div className="flex flex-col flex-1 min-w-[240px]">
          <label className="text-xs text-gray-600">Reason (required)</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            placeholder="Reason to close (Excess received / Accepted extra / etc.)"
            value={manualCloseReason}
            onChange={(e) => setManualCloseReason(e.target.value)}
          />
        </div>

        <button
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          onClick={handleManualClose}
          disabled={manualCloseLoading || !manualCloseRecord}
          title={!manualCloseRecord ? "Fetch a Unique ID first" : ""}
        >
          {manualCloseLoading ? "Closing..." : "Manual Close"}
        </button>
      </div>

      {manualCloseError && (
        <div className="mt-2 text-sm text-red-600">{manualCloseError}</div>
      )}
      {manualCloseSuccess && (
        <div className="mt-2 text-sm text-green-700">{manualCloseSuccess}</div>
      )}

      {manualCloseRecord && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-700">
          <div>
            <span className="font-semibold">Site:</span> {manualCloseRecord.site}
          </div>
          <div>
            <span className="font-semibold">Unique ID:</span>{" "}
            {manualCloseRecord.uniqueId}
          </div>
          <div>
            <span className="font-semibold">Section:</span>{" "}
            {manualCloseRecord.section}
          </div>
          <div>
            <span className="font-semibold">Indent No:</span>{" "}
            {manualCloseRecord.indentNumber}
          </div>
          <div>
            <span className="font-semibold">Item No:</span>{" "}
            {manualCloseRecord.itemNumber}
          </div>
          <div>
            <span className="font-semibold">Vendor:</span>{" "}
            {manualCloseRecord.vendorName}
          </div>
          <div>
            <span className="font-semibold">Total Qty:</span>{" "}
            {manualCloseRecord.totalQuantity}
          </div>
          <div>
            <span className="font-semibold">Store Received Qty:</span>{" "}
            {manualCloseRecord.storeReceivedQuantity ?? 0}
          </div>
          <div>
            <span className="font-semibold">Store Status:</span>{" "}
            {manualCloseRecord.storeStatus ?? ""}
          </div>
        </div>
      )}
    </div>
  );
}
