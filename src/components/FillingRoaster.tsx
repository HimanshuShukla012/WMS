import React, { useState, useEffect } from "react";
import TimeRangePicker from "./TimeRangePicker";

interface FillingRoasterProps {
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}

const FillingRoaster: React.FC<FillingRoasterProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const [localDate, setLocalDate] = useState(
    selectedDate || new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (selectedDate) setLocalDate(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setLocalDate(newDate);
    onDateChange?.(newDate);
  };

  const [times, setTimes] = useState({
    morningFrom: "",
    morningTo: "",
    eveningFrom: "",
    eveningTo: "",
    afternoonFrom:"",
    afternoonTo:"",
  });

  const [totalMinutes, setTotalMinutes] = useState(0);

  useEffect(() => {
    const toMinutes = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const morning =
      times.morningFrom && times.morningTo
        ? toMinutes(times.morningTo) - toMinutes(times.morningFrom)
        : 0;

const afternoon =
      times.afternoonFrom && times.afternoonTo
        ? toMinutes(times.afternoonTo) - toMinutes(times.afternoonFrom)
        : 0;

    const evening =
      times.eveningFrom && times.eveningTo
        ? toMinutes(times.eveningTo) - toMinutes(times.eveningFrom)
        : 0;

    setTotalMinutes(morning + evening + afternoon);
  }, [times]);

  return (
    <div className="p-4 bg-white border rounded shadow mb-6 text-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-lg font-bold">Filling Roaster</h2>

        {/* Only show if no date prop is passed */}
        {selectedDate === undefined && (
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <label htmlFor="filling-date" className="text-sm font-medium">
              Date:
            </label>
            <input
              type="date"
              id="filling-date"
              value={localDate}
              onChange={handleDateChange}
              className="border border-gray-300 hover:border-blue-500 transition duration-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        )}
      </div>

      <TimeRangePicker
        label="Morning Filling"
        from={times.morningFrom}
        to={times.morningTo}
        onChange={(from, to) =>
          setTimes((prev) => ({ ...prev, morningFrom: from, morningTo: to }))
        }
      />
      <TimeRangePicker
        label="Afternoon Filling"
        from={times.afternoonFrom}
        to={times.afternoonTo}
        onChange={(from, to) =>
          setTimes((prev) => ({ ...prev, afternoonFrom: from, afternoonTo: to }))
        }
      />
      <TimeRangePicker
        label="Evening Filling"
        from={times.eveningFrom}
        to={times.eveningTo}
        onChange={(from, to) =>
          setTimes((prev) => ({ ...prev, eveningFrom: from, eveningTo: to }))
        }
      />
      <div className="mt-2 text-sm font-medium">
        Total Filling Time:{" "}
        <span className="font-semibold">
          {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
        </span>
      </div>
    </div>
  );
};

export default FillingRoaster;
