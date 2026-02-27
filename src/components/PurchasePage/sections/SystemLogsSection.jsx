import React, { useEffect, useMemo, useState } from "react";
import { getAuditLogs } from "../../../api/IndentForm.api";

const formatDateTime = (value) => {
  if (!value) return "";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return String(value);
  return dt.toLocaleString("en-GB");
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

const formatChanges = (changes = []) => {
  if (!Array.isArray(changes) || changes.length === 0) return "No field diff";
  return changes
    .slice(0, 4)
    .map((c) => `${c.field}: ${formatValue(c.before)} -> ${formatValue(c.after)}`)
    .join(" | ");
};

export default function SystemLogsSection({ username }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!username) return;
      setLoading(true);
      setError("");
      try {
        const response = await getAuditLogs();
        if (response?.success) {
          setLogs(Array.isArray(response.data) ? response.data : []);
        } else {
          setError(response?.message || "Failed to load logs");
        }
      } catch (err) {
        setError(err?.message || "Failed to load logs");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [username]);

  const rows = useMemo(() => logs || [], [logs]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="px-4 py-3 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">System Logs (Last 7 Days)</h2>
        <p className="text-xs text-gray-500">Older logs are auto-deleted after 7 days.</p>
      </div>

      {loading && <div className="p-4 text-sm text-gray-600">Loading logs...</div>}
      {error && !loading && <div className="p-4 text-sm text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="max-h-[68vh] overflow-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead className="sticky top-0 bg-gray-100">
              <tr>
                <th className="px-3 py-2 border-b text-left">Time</th>
                <th className="px-3 py-2 border-b text-left">User</th>
                <th className="px-3 py-2 border-b text-left">Role</th>
                <th className="px-3 py-2 border-b text-left">Action</th>
                <th className="px-3 py-2 border-b text-left">Target</th>
                <th className="px-3 py-2 border-b text-left">Changes</th>
                <th className="px-3 py-2 border-b text-left">IP</th>
                <th className="px-3 py-2 border-b text-left">System</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((log) => (
                <tr key={log._id}>
                  <td className="px-3 py-2 border-b align-top">{formatDateTime(log.createdAt)}</td>
                  <td className="px-3 py-2 border-b align-top">{log.actorUsername || "-"}</td>
                  <td className="px-3 py-2 border-b align-top">{log.actorRole || "-"}</td>
                  <td className="px-3 py-2 border-b align-top">{log.action || "-"}</td>
                  <td className="px-3 py-2 border-b align-top">
                    {[log.targetModel, log.uniqueId || log.targetId].filter(Boolean).join(" / ")}
                  </td>
                  <td className="px-3 py-2 border-b align-top break-words min-w-[280px]">
                    {formatChanges(log.changedFields)}
                  </td>
                  <td className="px-3 py-2 border-b align-top">{log.ipAddress || "-"}</td>
                  <td className="px-3 py-2 border-b align-top break-words min-w-[220px]">
                    {log.systemName || log.userAgent || "-"}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                    No logs available for the last 7 days.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
