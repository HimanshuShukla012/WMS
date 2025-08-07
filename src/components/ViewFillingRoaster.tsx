// src/components/ViewFillingRoaster.tsx
import React from "react";

interface Props {
  selectedDate: string;
}

const dummyData = [
  {
    ohtName: "OHT A",
    operator: "Ramesh",
    shift: "Morning",
    time: "06:00 AM",
  },
  {
    ohtName: "OHT B",
    operator: "Suresh",
    shift: "Evening",
    time: "05:00 PM",
  },
];

const ViewFillingRoaster: React.FC<Props> = ({ selectedDate }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-blue-200 text-blue-900">
          <tr>
            <th className="px-4 py-2 text-left">OHT Name</th>
            <th className="px-4 py-2 text-left">Operator</th>
            <th className="px-4 py-2 text-left">Shift</th>
            <th className="px-4 py-2 text-left">Time</th>
          </tr>
        </thead>
        <tbody>
          {dummyData.map((entry, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{entry.ohtName}</td>
              <td className="px-4 py-2">{entry.operator}</td>
              <td className="px-4 py-2">{entry.shift}</td>
              <td className="px-4 py-2">{entry.time}</td>
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

export default ViewFillingRoaster;
