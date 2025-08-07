import React, { useState } from "react";
import { Download } from "lucide-react";
import { format } from "date-fns";

interface WaterQualityEntry {
  date: string;
  samplesCollected: number;
  villagesTested: string[];
  contaminatedSamples: number;
  contaminatedVillages: string[];
  actionTaken: string;
}

// Dummy data
const sampleData: WaterQualityEntry[] = [
  {
    date: "2025-08-07",
    samplesCollected: 12,
    villagesTested: ["Rampur", "Sitapur"],
    contaminatedSamples: 3,
    contaminatedVillages: ["Sitapur"],
    actionTaken: "Notified health department and initiated chlorination",
  },
  {
    date: "2025-08-05",
    samplesCollected: 9,
    villagesTested: ["Lucknow", "Barabanki"],
    contaminatedSamples: 1,
    contaminatedVillages: ["Lucknow"],
    actionTaken: "Immediate alert sent to JE",
  },
];

const ViewWaterQuality = () => {
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterVillage, setFilterVillage] = useState("");

  const filteredData = sampleData.filter((entry) => {
    const entryDate = new Date(entry.date);
    const from = filterDateFrom ? new Date(filterDateFrom) : null;
    const to = filterDateTo ? new Date(filterDateTo) : null;
    const matchesVillage =
      !filterVillage ||
      entry.villagesTested.includes(filterVillage) ||
      entry.contaminatedVillages.includes(filterVillage);

    return (
      (!from || entryDate >= from) &&
      (!to || entryDate <= to) &&
      matchesVillage
    );
  });

  const downloadCSV = () => {
    const csv = [
      [
        "Date",
        "Samples Collected",
        "Villages Tested",
        "Contaminated Samples",
        "Contaminated Villages",
        "Action Taken",
      ].join(","),
      ...filteredData.map((entry) =>
        [
          entry.date,
          entry.samplesCollected,
          entry.villagesTested.join(" | "),
          entry.contaminatedSamples,
          entry.contaminatedVillages.join(" | "),
          entry.actionTaken.replace(/,/g, " "),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "WaterQualityReport.csv";
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">Water Quality Report</h2>

        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm">From</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm">To</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Village</label>
            <input
              type="text"
              placeholder="e.g. Sitapur"
              value={filterVillage}
              onChange={(e) => setFilterVillage(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>

          <button
            onClick={downloadCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
          >
            <Download className="w-4 h-4 mr-2" /> Download CSV
          </button>
        </div>
      </div>

      {filteredData.length > 0 ? (
        <div className="overflow-auto">
          <table className="min-w-full bg-white border rounded shadow text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4 border">Date</th>
                <th className="py-2 px-4 border">Samples Collected</th>
                <th className="py-2 px-4 border">Villages Tested</th>
                <th className="py-2 px-4 border">Contaminated Samples</th>
                <th className="py-2 px-4 border">Contaminated Villages</th>
                <th className="py-2 px-4 border">Action Taken</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((entry, idx) => (
                <tr key={idx} className="border-t">
                  <td className="py-2 px-4 border">
                    {format(new Date(entry.date), "dd-MM-yyyy")}
                  </td>
                  <td className="py-2 px-4 border">{entry.samplesCollected}</td>
                  <td className="py-2 px-4 border">
                    {entry.villagesTested.join(", ")}
                  </td>
                  <td className="py-2 px-4 border">{entry.contaminatedSamples}</td>
                  <td className="py-2 px-4 border">
                    {entry.contaminatedVillages.join(", ")}
                  </td>
                  <td className="py-2 px-4 border">{entry.actionTaken}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No data found.</p>
      )}
    </div>
  );
};

export default ViewWaterQuality;