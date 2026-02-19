import React from "react";

export default function SummaryReportSection({ summaryReport }) {
  return (
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
              <th className="px-4 py-3 border-b text-center">
                Avg Delay (days)
              </th>
              <th className="px-4 py-3 border-b text-center">
                Max Delay (days)
              </th>
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
  );
}
