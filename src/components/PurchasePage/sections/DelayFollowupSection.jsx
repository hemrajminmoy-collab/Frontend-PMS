import React from "react";
import { getDelayFollowups } from "../../../api/IndentForm.api";

export default function DelayFollowupSection({ role = "", username = "" }) {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [selectedPse, setSelectedPse] = React.useState("ALL");
  const [remarksModalOpen, setRemarksModalOpen] = React.useState(false);
  const [remarksModalData, setRemarksModalData] = React.useState({
    uniqueId: "",
    pseName: "",
    stageLabel: "",
    estimatedDate: "",
    remarksEntries: [],
  });

  const fetchFollowups = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getDelayFollowups({ role, username });
      if (!res?.success) {
        setRows([]);
        setError(res?.message || "Failed to load delay followup data.");
        return;
      }

      const data = Array.isArray(res?.data) ? res.data : [];
      data.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
      setRows(data);
    } catch (err) {
      setRows([]);
      setError(err?.message || "Failed to load delay followup data.");
    } finally {
      setLoading(false);
    }
  }, [role, username]);

  React.useEffect(() => {
    fetchFollowups();
  }, [fetchFollowups]);

  const pseOptions = React.useMemo(() => {
    const names = new Set();
    rows.forEach((row) => {
      const name = String(row?.pseName || "").trim();
      if (name) names.add(name);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  React.useEffect(() => {
    if (selectedPse !== "ALL" && !pseOptions.includes(selectedPse)) {
      setSelectedPse("ALL");
    }
  }, [selectedPse, pseOptions]);

  const filteredRows = React.useMemo(() => {
    if (selectedPse === "ALL") return rows;
    return rows.filter((row) => String(row?.pseName || "").trim() === selectedPse);
  }, [rows, selectedPse]);

  const getAllEstimatedDates = (row) => {
    const historyDates = Array.isArray(row?.estimateHistory)
      ? row.estimateHistory
          .map((h) => String(h?.estimatedCompletionDate || "").trim())
          .filter(Boolean)
      : [];
    const current = String(row?.estimatedCompletionDate || "").trim();
    const all = current ? [...historyDates, current] : historyDates;
    return Array.from(new Set(all));
  };

  const openRemarksByDate = (row, date) => {
    const selectedDate = String(date || "").trim();
    if (!selectedDate) return;

    const remarksEntries = [];
    const currentDate = String(row?.estimatedCompletionDate || "").trim();
    const currentRemarks = String(row?.remarks || "").trim();

    if (currentDate === selectedDate && currentRemarks) {
      remarksEntries.push({
        source: "Current",
        remarks: currentRemarks,
        changedAt: row?.updatedAt || row?.createdAt || "",
        changedBy: "",
      });
    }

    const historyMatches = (row?.estimateHistory || [])
      .filter(
        (entry) =>
          String(entry?.estimatedCompletionDate || "").trim() === selectedDate &&
          String(entry?.remarks || "").trim(),
      )
      .map((entry) => ({
        source: "History",
        remarks: String(entry?.remarks || "").trim(),
        changedAt: entry?.changedAt || "",
        changedBy: String(entry?.changedBy || "").trim(),
      }));

    setRemarksModalData({
      uniqueId: String(row?.uniqueId || ""),
      pseName: String(row?.pseName || ""),
      stageLabel: String(row?.stageLabel || row?.stageId || ""),
      estimatedDate: selectedDate,
      remarksEntries: [...remarksEntries, ...historyMatches],
    });
    setRemarksModalOpen(true);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border">
      <div className="text-lg font-semibold text-gray-800 mb-4">
        Delay Followup (PSE Task Tracking)
      </div>
      <div className="text-xs text-gray-600 mb-4">
        This section only shows estimated followup tracking entered from Summary Report.
      </div>
      <div className="mb-4">
        <div className="text-xs font-semibold text-gray-700">Filter by PSE</div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedPse("ALL")}
            className={`px-3 py-1 rounded-full text-xs border transition ${
              selectedPse === "ALL"
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            All PSE
          </button>
          {pseOptions.map((pseName) => (
            <button
              key={`df-pse-${pseName}`}
              type="button"
              onClick={() => setSelectedPse(pseName)}
              className={`px-3 py-1 rounded-full text-xs border transition ${
                selectedPse === pseName
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {pseName}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

      <div className="w-full overflow-x-auto">
        <table className="min-w-max w-full text-xs border">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-3 py-2 border-b text-left">Unique ID</th>
              <th className="px-3 py-2 border-b text-left">PSE Name</th>
              <th className="px-3 py-2 border-b text-left">Stage</th>
              <th className="px-3 py-2 border-b text-center">Estimated Date</th>
              <th className="px-3 py-2 border-b text-left">All Estimated Dates</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-3 py-3 text-center text-gray-500" colSpan={5}>
                  Loading...
                </td>
              </tr>
            )}

            {!loading && filteredRows.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-center text-gray-500" colSpan={5}>
                  No delay followup records found.
                </td>
              </tr>
            )}

            {!loading &&
              filteredRows.map((row) => {
                const allEstimatedDates = getAllEstimatedDates(row);
                return (
                  <tr
                    key={`${row.uniqueId || ""}-${row.stageId || ""}-${row.pseName || ""}`}
                    className="odd:bg-white even:bg-gray-50"
                  >
                    <td className="px-3 py-2 border-b font-medium">{row.uniqueId || "-"}</td>
                    <td className="px-3 py-2 border-b">{row.pseName || "-"}</td>
                    <td className="px-3 py-2 border-b">{row.stageLabel || row.stageId || "-"}</td>
                    <td className="px-3 py-2 border-b text-center">
                      {row.estimatedCompletionDate ? (
                        <button
                          type="button"
                          onClick={() => openRemarksByDate(row, row.estimatedCompletionDate)}
                          className="text-blue-700 underline decoration-dotted hover:text-blue-900"
                        >
                          {row.estimatedCompletionDate}
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-3 py-2 border-b">
                      <div className="flex flex-wrap gap-1">
                        {allEstimatedDates.length ? (
                          allEstimatedDates.map((d) => (
                            <button
                              key={`${row._id || row.uniqueId}-${d}`}
                              type="button"
                              onClick={() => openRemarksByDate(row, d)}
                              className="px-2 py-0.5 rounded bg-gray-100 border text-[11px] hover:bg-gray-200"
                            >
                              {d}
                            </button>
                          ))
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {remarksModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl border">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div className="text-base font-semibold text-gray-800">Remarks for Estimated Date</div>
              <button
                type="button"
                onClick={() => setRemarksModalOpen(false)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700">
                <div>
                  <span className="font-semibold">Unique ID:</span> {remarksModalData.uniqueId || "-"}
                </div>
                <div>
                  <span className="font-semibold">PSE:</span> {remarksModalData.pseName || "-"}
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold">Stage:</span> {remarksModalData.stageLabel || "-"}
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold">Estimated Date:</span>{" "}
                  {remarksModalData.estimatedDate || "-"}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700">
                  Remarks
                </div>
                <div className="p-4 space-y-3">
                  {remarksModalData.remarksEntries.length === 0 && (
                    <div className="text-gray-500">No remarks available for this date.</div>
                  )}
                  {remarksModalData.remarksEntries.map((entry, idx) => (
                    <div key={`df-remark-row-${idx}`} className="rounded border border-gray-200 p-3">
                      <div className="text-xs text-gray-500 mb-1">
                        {entry.source}
                        {entry.changedBy ? ` | ${entry.changedBy}` : ""}
                        {entry.changedAt ? ` | ${new Date(entry.changedAt).toLocaleString()}` : ""}
                      </div>
                      <div className="text-gray-800">{entry.remarks || "-"}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
