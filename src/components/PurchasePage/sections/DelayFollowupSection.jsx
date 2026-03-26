import React from "react";
import { getDelayFollowups } from "../../../api/IndentForm.api";

export default function DelayFollowupSection({ role = "", username = "" }) {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [selectedPse, setSelectedPse] = React.useState("ALL");

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
              filteredRows.map((row) => (
                <tr
                  key={`${row.uniqueId || ""}-${row.stageId || ""}-${row.pseName || ""}`}
                  className="odd:bg-white even:bg-gray-50"
                >
                  <td className="px-3 py-2 border-b font-medium">{row.uniqueId || "-"}</td>
                  <td className="px-3 py-2 border-b">{row.pseName || "-"}</td>
                  <td className="px-3 py-2 border-b">{row.stageLabel || row.stageId || "-"}</td>
                  <td className="px-3 py-2 border-b text-center">
                    {row.estimatedCompletionDate || "-"}
                  </td>
                  <td className="px-3 py-2 border-b">
                    <div className="flex flex-wrap gap-1">
                      {getAllEstimatedDates(row).length ? (
                        getAllEstimatedDates(row).map((d) => (
                          <span
                            key={`${row._id || row.uniqueId}-${d}`}
                            className="px-2 py-0.5 rounded bg-gray-100 border text-[11px]"
                          >
                            {d}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
