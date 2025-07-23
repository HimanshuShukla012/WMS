import React, { useState } from "react";
import TimeRangePicker from "./TimeRangePicker";

interface DistributionRoasterProps {
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}

const DistributionRoaster: React.FC<DistributionRoasterProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const [times, setTimes] = useState({
    morningFrom: "",
    morningTo: "",
    eveningFrom: "",
    eveningTo: "",
  });

  const [totalMinutes, setTotalMinutes] = useState(0);

  const effectiveDate =
    selectedDate || new Date().toISOString().split("T")[0];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange?.(e.target.value);
  };

  const calculateTotalMinutes = () => {
    const toMinutes = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const morning =
      times.morningFrom && times.morningTo
        ? toMinutes(times.morningTo) - toMinutes(times.morningFrom)
        : 0;
    const evening =
      times.eveningFrom && times.eveningTo
        ? toMinutes(times.eveningTo) - toMinutes(times.eveningFrom)
        : 0;

    setTotalMinutes(morning + evening);
  };

  React.useEffect(() => {
    calculateTotalMinutes();
  }, [times]);

  return (
    <div className="p-4 bg-white border rounded shadow mb-6 text-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-lg font-bold">Distribution Roaster</h2>
        {selectedDate === undefined && (
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <label htmlFor="distribution-date" className="text-sm font-medium">
              Date:
            </label>
            <input
              type="date"
              id="distribution-date"
              value={effectiveDate}
              onChange={handleDateChange}
              className="border border-gray-300 hover:border-blue-500 transition duration-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        )}
      </div>

      <TimeRangePicker
        label="Morning Distribution"
        from={times.morningFrom}
        to={times.morningTo}
        onChange={(from, to) =>
          setTimes((prev) => ({ ...prev, morningFrom: from, morningTo: to }))
        }
      />
      <TimeRangePicker
        label="Evening Distribution"
        from={times.eveningFrom}
        to={times.eveningTo}
        onChange={(from, to) =>
          setTimes((prev) => ({ ...prev, eveningFrom: from, eveningTo: to }))
        }
      />

      <div className="mt-4 text-sm font-medium">
        Total Distribution Time:{" "}
        <span className="font-semibold">
          {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
        </span>
      </div>
    </div>
  );
};

export default DistributionRoaster;
