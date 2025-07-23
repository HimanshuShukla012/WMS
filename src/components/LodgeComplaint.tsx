import React, { useState, useEffect } from "react";
import clsx from "clsx";

type LodgeComplaintProps = {
  isModal?: boolean;
  onClose?: () => void;
};

const COMPLAINT_CATEGORIES: { label: string; days: number }[] = [
  { label: "Area Drinking Water Scarcity", days: 5 },
  { label: "Area Water Contamination", days: 3 },
  { label: "Cleaning Of Overhead Tank", days: 2 },
  { label: "Contamination Of Water", days: 3 },
  { label: "Defective Water Meter", days: 7 },
  { label: "Drinking Water Scarcity", days: 5 },
  { label: "Inlet Pipe Leakage Coming From Outside The House", days: 4 },
  { label: "Masonry Work Outside The House", days: 8 },
  { label: "No Water", days: 2 },
  { label: "Overflow From OverHead Tank", days: 3 },
  { label: "Pipe Leakage/Brust Outside The House", days: 4 },
  { label: "Public Hydrant Platform Rep", days: 10 },
  { label: "Public Hydrant Repair", days: 7 },
  { label: "Raw Water Scarcity", days: 6 },
  { label: "Water Value Chamber Cover Missing", days: 5 },
  { label: "Water Valve Chamber Repair", days: 6 },
];

// Sample dropdown data
const DISTRICTS = ["District A", "District B", "District C"];
const BLOCKS = ["Block X", "Block Y", "Block Z"];
const PANCHAYATS = ["Panchayat 1", "Panchayat 2", "Panchayat 3"];
const VILLAGES = ["Village I", "Village II", "Village III"];

const LodgeComplaint: React.FC<LodgeComplaintProps> = ({ isModal = false, onClose }) => {
  const [form, setForm] = useState({
    district: "",
    block: "",
    gramPanchayat: "",
    village: "",
    beneficiaryName: "",
    beneficiaryContact: "",
    landmark: "",
    category: "",
    resolutionDays: "",
  });

  useEffect(() => {
    if (form.category) {
      const selected = COMPLAINT_CATEGORIES.find(c => c.label === form.category);
      if (selected) {
        setForm(prev => ({
          ...prev,
          resolutionDays: `${Math.min(15, Math.max(1, selected.days))}`,
        }));
      }
    }
  }, [form.category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const renderInput = (label: string, name: string, type: string = "text", readOnly = false) => (
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1 text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={(form as any)[name]}
        onChange={handleChange}
        readOnly={readOnly}
        placeholder={label}
        className={clsx(
          "border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400",
          readOnly && "bg-gray-100 cursor-not-allowed"
        )}
      />
    </div>
  );

  const renderSelect = (label: string, name: string, options: string[]) => (
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1 text-gray-700">{label}</label>
      <select
        name={name}
        value={(form as any)[name]}
        onChange={handleChange}
        className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">Select {label}</option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className={clsx("p-6 rounded-xl bg-white shadow-lg", isModal ? "w-full max-w-2xl mx-auto" : "")}>
      {/* Heading */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-blue-800">Lodge Complaint</h2>
        <p className="text-sm text-gray-600 mt-1">
          Complaint to be raised on behalf of the beneficiary.
        </p>
        <p className="text-sm text-red-600 mt-1 font-medium">
          Complaint once registered cannot be revoked.
        </p>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderSelect("District", "district", DISTRICTS)}
        {renderSelect("Block", "block", BLOCKS)}
        {renderSelect("Gram Panchayat", "gramPanchayat", PANCHAYATS)}
        {renderSelect("Village", "village", VILLAGES)}
        {renderInput("Beneficiary Name", "beneficiaryName")}
        {renderInput("Beneficiary Contact Number", "beneficiaryContact")}
        {renderInput("Landmark", "landmark")}

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">Complaint Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Complaint Category</option>
            {COMPLAINT_CATEGORIES.map((c, i) => (
              <option key={i} value={c.label}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {renderInput("Resolution Timeline (in days)", "resolutionDays", "text", true)}
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-end space-x-3">
        {isModal && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        )}
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Submit Complaint
        </button>
      </div>
    </div>
  );
};

export default LodgeComplaint;
