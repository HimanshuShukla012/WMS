// src/components/ViewDistributionRoaster.tsx
import React from "react";

interface Props {
  selectedDate: string;
}

const dummyData = [
  {
    ohtName: "OHT A",
    areaCovered: "Sector 1",
    startTime: "07:00 AM",
    endTime: "08:30 AM",
  },
  {
    ohtName: "OHT B",
    areaCovered: "Sector 2",
    startTime: "06:00 PM",
    endTime: "07:30 PM",
  },
];

const ViewDistributionRoaster: React.FC<Props> = ({ selectedDate }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-blue-200 text-blue-900">
          <tr>
            <th className="px-4 py-2 text-left">OHT Name</th>
            <th className="px-4 py-2 text-left">Area Covered</th>
            <th className="px-4 py-2 text-left">Start Time</th>
            <th className="px-4 py-2 text-left">End Time</th>
          </tr>
        </thead>
        <tbody>
          {dummyData.map((entry, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{entry.ohtName}</td>
              <td className="px-4 py-2">{entry.areaCovered}</td>
              <td className="px-4 py-2">{entry.startTime}</td>
              <td className="px-4 py-2">{entry.endTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedDate && (
        <p className="text-sm text-gray-500 mt-2">
          Showing records for: <strong>{selectedDate}</strong>
        </p>
      )}
    </div>
  );
};

export default ViewDistributionRoaster;
