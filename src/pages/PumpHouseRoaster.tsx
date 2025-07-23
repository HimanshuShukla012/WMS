// src/pages/PumpHouseRoaster.tsx
import { useState } from "react";
import DistributionRoaster from "../components/DistributionRoaster";
import FillingRoaster from "../components/FillingRoaster";

const PumpHouseRoaster = () => {
  const [selectedDate, setSelectedDate] = useState<string>("");

  return (
    <div className="p-6 space-y-6 relative z-10">
      {/* Heading */}
      <div className="bg-blue-100 bg-opacity-40 rounded-xl p-4 shadow-sm">
        <h2 className="text-2xl font-bold text-blue-800 mb-1">
          Over Head Tank Roaster
        </h2>
        <p className="text-sm text-gray-700">
          Use this page to manage entire Distribution and Filling Roasters for any selected date.
        </p>
        <p className="text-sm text-red-600 mt-1">
          Responses once saved cannot be edited again.
        </p>
      </div>

      {/* Date Picker */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded px-3 py-2 w-64 shadow-sm"
        />
      </div>

      {/* Roaster Sections */}
      <div className="space-y-10">
        <div>
          <h3 className="text-xl font-semibold text-blue-700 mb-2">
            Distribution Roaster
          </h3>
          <DistributionRoaster selectedDate={selectedDate} />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-blue-700 mb-2">
            Filling Roaster
          </h3>
          <FillingRoaster selectedDate={selectedDate} />
        </div>
      </div>
    </div>
  );
};

export default PumpHouseRoaster;
