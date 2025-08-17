import React, { useState, useEffect } from "react";
import TimeRangePicker from "./TimeRangePicker";

interface FillingRoasterProps {
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  onChange?: (data: any) => void;      // NEW: For capturing data changes
  initialData?: any;                   // NEW: For pre-filling saved data
  readOnly?: boolean;                  // NEW: For view-only mode
}

const FillingRoaster: React.FC<FillingRoasterProps> = ({
  selectedDate,
  onDateChange,
  onChange,
  initialData,
  readOnly = false,
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

  // Initialize with initialData if provided
  const [times, setTimes] = useState({
    morningFrom: "",
    morningTo: "",
    afternoonFrom: "",
    afternoonTo: "",
    eveningFrom: "",
    eveningTo: "",
    ...initialData, // Merge initialData if provided
  });

  const [totalMinutes, setTotalMinutes] = useState(0);

  useEffect(() => {
    const toMinutes = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const calculateDuration = (from: string, to: string) => {
      if (!from || !to) return 0;
      
      const fromMinutes = toMinutes(from);
      const toMinutes_val = toMinutes(to);
      
      // If end time is less than start time, it means it crosses midnight
      if (toMinutes_val < fromMinutes) {
        // Add 24 hours (1440 minutes) to the end time
        return (toMinutes_val + 1440) - fromMinutes;
      }
      
      return toMinutes_val - fromMinutes;
    };

    const morning = calculateDuration(times.morningFrom, times.morningTo);
    const afternoon = calculateDuration(times.afternoonFrom, times.afternoonTo);
    const evening = calculateDuration(times.eveningFrom, times.eveningTo);

    const total = morning + afternoon + evening;
    setTotalMinutes(total);

    // NEW: Send data to parent component when times change
    if (onChange && !readOnly) {
      onChange({
        morningFrom: times.morningFrom,
        morningTo: times.morningTo,
        afternoonFrom: times.afternoonFrom,
        afternoonTo: times.afternoonTo,
        eveningFrom: times.eveningFrom,
        eveningTo: times.eveningTo,
        totalMinutes: total,
      });
    }
  }, [times, onChange, readOnly]);

  // Update times when initialData changes (for view mode)
  useEffect(() => {
    if (initialData) {
      setTimes(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  return (
    <div className="p-4 bg-white border rounded shadow mb-6 text-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-lg font-bold">
          Filling Roaster
          {readOnly && <span className="text-sm font-normal text-gray-500 ml-2">(View Only)</span>}
        </h2>

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
              disabled={readOnly}
              className="border border-gray-300 hover:border-blue-500 transition duration-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        )}
      </div>

      <TimeRangePicker
        label="Morning Filling"
        from={times.morningFrom}
        to={times.morningTo}
        onChange={readOnly ? undefined : (from, to) =>
          setTimes((prev) => ({ ...prev, morningFrom: from, morningTo: to }))
        }
        readOnly={readOnly}
      />
      <TimeRangePicker
        label="Afternoon Filling"
        from={times.afternoonFrom}
        to={times.afternoonTo}
        onChange={readOnly ? undefined : (from, to) =>
          setTimes((prev) => ({ ...prev, afternoonFrom: from, afternoonTo: to }))
        }
        readOnly={readOnly}
      />
      <TimeRangePicker
        label="Evening Filling"
        from={times.eveningFrom}
        to={times.eveningTo}
        onChange={readOnly ? undefined : (from, to) =>
          setTimes((prev) => ({ ...prev, eveningFrom: from, eveningTo: to }))
        }
        readOnly={readOnly}
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