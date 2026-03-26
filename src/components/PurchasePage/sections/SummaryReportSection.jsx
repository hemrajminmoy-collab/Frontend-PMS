import React from "react";
import { getDelayFollowups, upsertDelayFollowup } from "../../../api/IndentForm.api";

const makeFollowupKey = (uniqueId, stageId, pseName) =>
  `${String(uniqueId || "").trim()}__${String(stageId || "").trim()}__${String(
    pseName || "",
  ).trim()}`;

export default function SummaryReportSection({
  summaryReport = [],
  trackedDelayFields = [],
  trackedStageDelayReport = [],
  pseStageDelaySummary = [],
  role = "",
  username = "",
}) {
  const isAdmin = String(role || "")
    .trim()
    .toUpperCase() === "ADMIN";
  const [selectedPse, setSelectedPse] = React.useState("ALL");

  const [followupRows, setFollowupRows] = React.useState([]);
  const [followupError, setFollowupError] = React.useState("");
  const [followupLoading, setFollowupLoading] = React.useState(false);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalSaving, setModalSaving] = React.useState(false);
  const [modalError, setModalError] = React.useState("");
  const [modalSuccess, setModalSuccess] = React.useState("");
  const [modalForm, setModalForm] = React.useState({
    uniqueId: "",
    stageId: "",
    stageLabel: "",
    pseName: "",
    remarks: "",
    estimatedCompletionDate: "",
    isCompleted: false,
  });

  const fetchFollowups = React.useCallback(async () => {
    try {
      setFollowupLoading(true);
      setFollowupError("");
      const res = await getDelayFollowups({ role, username });
      if (!res?.success) {
        setFollowupRows([]);
        setFollowupError(res?.message || "Failed to load delay followups.");
        return;
      }
      setFollowupRows(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      setFollowupRows([]);
      setFollowupError(err?.message || "Failed to load delay followups.");
    } finally {
      setFollowupLoading(false);
    }
  }, [role, username]);

  React.useEffect(() => {
    fetchFollowups();
  }, [fetchFollowups]);

  const followupByKey = React.useMemo(() => {
    const map = new Map();
    followupRows.forEach((row) => {
      map.set(makeFollowupKey(row.uniqueId, row.stageId, row.pseName), row);
    });
    return map;
  }, [followupRows]);

  const pseOptions = React.useMemo(() => {
    const names = new Set();

    trackedStageDelayReport.forEach((stage) => {
      (stage.uniqueItems || []).forEach((item) => {
        const name = String(item.pse || "").trim();
        if (name) names.add(name);
      });
    });

    if (names.size === 0) {
      pseStageDelaySummary.forEach((row) => {
        const name = String(row?.pse || "").trim();
        if (name) names.add(name);
      });
    }

    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [trackedStageDelayReport, pseStageDelaySummary]);

  React.useEffect(() => {
    if (selectedPse !== "ALL" && !pseOptions.includes(selectedPse)) {
      setSelectedPse("ALL");
    }
  }, [pseOptions, selectedPse]);

  const filteredStageDelayReport = React.useMemo(
    () =>
      trackedStageDelayReport.map((stage) => {
        const filteredUniqueItems =
          selectedPse === "ALL"
            ? stage.uniqueItems || []
            : (stage.uniqueItems || []).filter((item) => item.pse === selectedPse);

        const delayedItems = filteredUniqueItems.reduce(
          (acc, item) => acc + (Number(item.delayedItemCount) || 0),
          0,
        );

        return {
          ...stage,
          uniqueItems: filteredUniqueItems,
          delayedUniqueIds: filteredUniqueItems.length,
          delayedItems,
        };
      }),
    [trackedStageDelayReport, selectedPse],
  );

  const filteredPseStageDelaySummary = React.useMemo(() => {
    if (selectedPse === "ALL") return pseStageDelaySummary;
    return pseStageDelaySummary.filter((row) => row.pse === selectedPse);
  }, [pseStageDelaySummary, selectedPse]);

  const openFollowupModal = (stage, item) => {
    const key = makeFollowupKey(item.uniqueId, stage.id, item.pse);
    const existing = followupByKey.get(key);

    setModalForm({
      uniqueId: item.uniqueId,
      stageId: stage.id,
      stageLabel: stage.label,
      pseName: item.pse,
      remarks: existing?.remarks || "",
      estimatedCompletionDate: existing?.estimatedCompletionDate || "",
      isCompleted: Boolean(existing?.isCompleted),
    });
    setModalError("");
    setModalSuccess("");
    setModalOpen(true);
  };

  const handleModalSave = async (e) => {
    e.preventDefault();
    setModalError("");
    setModalSuccess("");

    if (!modalForm.estimatedCompletionDate) {
      setModalError("Estimated completed date is required.");
      return;
    }

    try {
      setModalSaving(true);
      const res = await upsertDelayFollowup({
        ...modalForm,
        role,
        username,
      });

      if (!res?.success) {
        setModalError(res?.message || "Failed to save followup.");
        return;
      }

      setModalSuccess(res?.message || "Delay followup saved.");
      await fetchFollowups();
      setTimeout(() => {
        setModalOpen(false);
      }, 400);
    } catch (err) {
      setModalError(err?.message || "Failed to save followup.");
    } finally {
      setModalSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-md border">
        <div className="text-lg font-semibold text-gray-800 mb-4">
          Time Delay Summary (All Sections)
        </div>
        <div className="w-full overflow-x-auto">
          <table className="min-w-max border text-xs">
            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 border-b text-left">Section</th>
                <th className="px-4 py-3 border-b text-center">Delayed Items</th>
                <th className="px-4 py-3 border-b text-center">Avg Delay (days)</th>
                <th className="px-4 py-3 border-b text-center">Max Delay (days)</th>
                <th className="px-4 py-3 border-b text-left">Top Unique IDs</th>
              </tr>
            </thead>
            <tbody>
              {summaryReport.map((row) => (
                <tr key={row.label} className="odd:bg-white even:bg-gray-50">
                  <td className="px-4 py-2 border-b font-medium">{row.label}</td>
                  <td className="px-4 py-2 border-b text-center">{row.count}</td>
                  <td className="px-4 py-2 border-b text-center">{row.avg}</td>
                  <td className="px-4 py-2 border-b text-center">{row.max}</td>
                  <td className="px-4 py-2 border-b">
                    {row.top.length ? row.top.join(", ") : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md border">
        <div className="text-lg font-semibold text-gray-800 mb-4">
          Delay Tracker (Custom Workflow Sections)
        </div>
        <div className="mb-4 text-xs text-gray-600">
          Fill-up action is available here. Saved estimated dates will appear in Delay Followup.
        </div>
        {followupError && (
          <div className="mb-4 text-xs text-red-600">{followupError}</div>
        )}
        {followupLoading && (
          <div className="mb-4 text-xs text-gray-600">Loading followup records...</div>
        )}

        <div className="mb-5">
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
                key={`pse-btn-${pseName}`}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          {filteredStageDelayReport.map((stage) => (
            <div key={stage.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-sm font-semibold text-gray-800">{stage.label}</div>
              <div className="mt-2 text-xs text-gray-700">
                Delayed Items: <span className="font-semibold">{stage.delayedItems}</span>
              </div>
              <div className="mt-1 text-xs text-gray-700">
                Delayed Unique IDs:{" "}
                <span className="font-semibold">{stage.delayedUniqueIds}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {filteredStageDelayReport.map((stage) => (
            <div key={stage.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-gray-100 text-sm font-semibold text-gray-800">
                {stage.label} Delayed Unique IDs ({stage.delayedUniqueIds})
              </div>
              <div className="w-full overflow-x-auto">
                <table className="min-w-max w-full text-xs">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-3 py-2 border-b text-left">Unique ID</th>
                      <th className="px-3 py-2 border-b text-center">Time Delay (days)</th>
                      <th className="px-3 py-2 border-b text-center">Delayed Item Rows</th>
                      <th className="px-3 py-2 border-b text-left">PSE</th>
                      <th className="px-3 py-2 border-b text-left">Site</th>
                      <th className="px-3 py-2 border-b text-left">Section</th>
                      <th className="px-3 py-2 border-b text-center">Estimated Date</th>
                      <th className="px-3 py-2 border-b text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stage.uniqueItems.length === 0 && (
                      <tr>
                        <td className="px-3 py-3 text-center text-gray-500" colSpan={8}>
                          No delayed items.
                        </td>
                      </tr>
                    )}
                    {stage.uniqueItems.map((item) => {
                      const followup = followupByKey.get(
                        makeFollowupKey(item.uniqueId, stage.id, item.pse),
                      );

                      return (
                        <tr key={`${stage.id}-${item.uniqueId}`} className="odd:bg-white even:bg-gray-50">
                          <td className="px-3 py-2 border-b font-medium">{item.uniqueId}</td>
                          <td className="px-3 py-2 border-b text-center">{item.maxDelayDays}</td>
                          <td className="px-3 py-2 border-b text-center">{item.delayedItemCount}</td>
                          <td className="px-3 py-2 border-b">{item.pse}</td>
                          <td className="px-3 py-2 border-b">{item.site}</td>
                          <td className="px-3 py-2 border-b">{item.section}</td>
                          <td className="px-3 py-2 border-b text-center">
                            {followup?.estimatedCompletionDate || "-"}
                          </td>
                          <td className="px-3 py-2 border-b text-center">
                            <button
                              type="button"
                              onClick={() => openFollowupModal(stage, item)}
                              className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                            >
                              {followup ? "Update" : "Fill Up"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className="bg-white p-6 rounded-2xl shadow-md border">
          <div className="text-lg font-semibold text-gray-800 mb-4">
            Admin View: All PSE Delayed Items
          </div>
          <div className="w-full overflow-x-auto">
            <table className="min-w-max border text-xs">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-3 py-2 border-b text-left">PSE</th>
                  {trackedDelayFields.map((stage) => (
                    <th key={`admin-head-${stage.id}`} className="px-3 py-2 border-b text-center">
                      {stage.label} (UID/Items)
                    </th>
                  ))}
                  <th className="px-3 py-2 border-b text-center">Total Unique IDs</th>
                  <th className="px-3 py-2 border-b text-center">Total Items</th>
                </tr>
              </thead>
              <tbody>
                {filteredPseStageDelaySummary.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-3 text-center text-gray-500"
                      colSpan={trackedDelayFields.length + 3}
                    >
                      No delayed items for selected PSE.
                    </td>
                  </tr>
                )}
                {filteredPseStageDelaySummary.map((row) => (
                  <tr key={row.pse} className="odd:bg-white even:bg-gray-50">
                    <td className="px-3 py-2 border-b font-medium">{row.pse}</td>
                    {trackedDelayFields.map((stage) => {
                      const stageSummary = row.sectionDelaySummary?.[stage.id] || {
                        uniqueIds: 0,
                        items: 0,
                      };

                      return (
                        <td key={`admin-row-${row.pse}-${stage.id}`} className="px-3 py-2 border-b text-center">
                          {stageSummary.uniqueIds}/{stageSummary.items}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 border-b text-center font-semibold">
                      {row.totalUniqueIds}
                    </td>
                    <td className="px-3 py-2 border-b text-center font-semibold">
                      {row.totalItems}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div className="text-base font-semibold text-gray-800">Delay Followup Fill Up</div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleModalSave} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Unique ID</label>
                  <input
                    type="text"
                    value={modalForm.uniqueId}
                    readOnly
                    className="w-full border rounded px-3 py-2 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">PSE Name</label>
                  <input
                    type="text"
                    value={modalForm.pseName}
                    readOnly
                    className="w-full border rounded px-3 py-2 bg-gray-100"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Stage</label>
                  <input
                    type="text"
                    value={modalForm.stageLabel}
                    readOnly
                    className="w-full border rounded px-3 py-2 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Estimated Completed Date
                  </label>
                  <input
                    type="date"
                    value={modalForm.estimatedCompletionDate}
                    onChange={(e) =>
                      setModalForm((prev) => ({
                        ...prev,
                        estimatedCompletionDate: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={modalForm.isCompleted}
                      onChange={(e) =>
                        setModalForm((prev) => ({
                          ...prev,
                          isCompleted: e.target.checked,
                        }))
                      }
                    />
                    Mark as Completed
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Remarks</label>
                  <textarea
                    rows={3}
                    value={modalForm.remarks}
                    onChange={(e) =>
                      setModalForm((prev) => ({
                        ...prev,
                        remarks: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter followup remarks..."
                  />
                </div>
              </div>

              {modalError && <div className="text-sm text-red-600">{modalError}</div>}
              {modalSuccess && <div className="text-sm text-green-700">{modalSuccess}</div>}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className={`px-4 py-2 rounded text-white ${
                    modalSaving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {modalSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
