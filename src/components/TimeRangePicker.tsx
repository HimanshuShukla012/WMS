// components/TimeRangePicker.tsx
import React from "react";

interface TimeRangePickerProps {
  label: string;
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
  label,
  from,
  to,
  onChange,
}) => {
  return (
    <div className="border p-2 rounded mb-4 bg-white text-black">
      <label className="block text-sm font-semibold mb-2">{label}</label>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs mb-1">From</label>
          <input
            type="time"
            className="w-full border rounded px-2 py-1"
            value={from}
            onChange={(e) => onChange(e.target.value, to)}
          />
        </div>
        <div>
          <label className="block text-xs mb-1">To</label>
          <input
            type="time"
            className="w-full border rounded px-2 py-1"
            value={to}
            onChange={(e) => onChange(from, e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default TimeRangePicker;
