import React, { useState } from "react";

type FeeEntry = {
  date: string;
  village: string;
  beneficiary: string;
  outstandingAmount: number;
  amountPaid: number;
  balanceAmount: number;
};

const FeeCollectionPage: React.FC = () => {
  const [entries, setEntries] = useState<FeeEntry[]>([
    {
      date: "",
      village: "",
      beneficiary: "",
      outstandingAmount: 0,
      amountPaid: 0,
      balanceAmount: 0,
    },
  ]);
    const [showUploadModal, setShowUploadModal] = useState(false); // ← Move here

  const handleChange = (index: number, field: keyof FeeEntry, value: any) => {
    const updated = [...entries];
    if (field === "amountPaid") {
      const amountPaid = Number(value);
      const outstanding = updated[index].outstandingAmount;
      updated[index][field] = amountPaid;
      updated[index].balanceAmount = Math.max(outstanding - amountPaid, 0);
    } else {
updated[index] = {
  ...updated[index],
  [field]: value as FeeEntry[typeof field],
};
    }
    setEntries(updated);
  };

  const addEntry = () => {
    setEntries([
      ...entries,
      {
        date: "",
        village: "",
        beneficiary: "",
        outstandingAmount: 0,
        amountPaid: 0,
        balanceAmount: 0,
      },
    ]);
  };

  const saveEntries = () => {
    console.log("Saving entries", entries);
    // Add backend API call here
  };

  return (
    <div className="p-6 relative z-10">
      <div className="flex items-center justify-between mb-6">
  <h1 className="text-2xl font-bold">Fee Collection Page</h1>
  <button
    onClick={() => setShowUploadModal(true)}
    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
  >
    Upload Logbook
  </button>
</div>

      {entries.map((entry, index) => (
        <div
          key={index}
          className="bg-white shadow-md rounded-xl p-4 mb-6 border border-gray-200"
        >
          <h2 className="text-lg font-semibold mb-4">Log Entry {index + 1}</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Date</label>
              <input
                type="date"
                value={entry.date}
                onChange={(e) => handleChange(index, "date", e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block font-medium">Village</label>
              <select
                value={entry.village}
                onChange={(e) => handleChange(index, "village", e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Village</option>
                <option value="Village A">Village A</option>
                <option value="Village B">Village B</option>
              </select>
            </div>

            <div>
              <label className="block font-medium">Beneficiary</label>
              <select
                value={entry.beneficiary}
                onChange={(e) =>
                  handleChange(index, "beneficiary", e.target.value)
                }
                className="w-full p-2 border rounded"
              >
                <option value="">Select Beneficiary</option>
                <option value="Beneficiary 1">Beneficiary 1</option>
                <option value="Beneficiary 2">Beneficiary 2</option>
              </select>
            </div>

            <div>
              <label className="block font-medium">Outstanding Amount</label>
              <input
                type="number"
                value={entry.outstandingAmount}
                onChange={(e) =>
                  handleChange(index, "outstandingAmount", Number(e.target.value))
                }
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block font-medium">Amount Paid</label>
              <input
                type="number"
                value={entry.amountPaid}
                max={entry.outstandingAmount}
                onChange={(e) => {
                  const paid = Number(e.target.value);
                  if (paid <= entry.outstandingAmount) {
                    handleChange(index, "amountPaid", paid);
                  }
                }}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block font-medium">Balance Amount</label>
              <input
                type="number"
                value={entry.balanceAmount}
                readOnly
                className="w-full p-2 border rounded bg-gray-100"
              />
            </div>
          </div>
        </div>
      ))}

      <div className="flex gap-4 flex-wrap">
  <button
    onClick={addEntry}
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
  >
    + Add Entry
  </button>

  <button
    onClick={saveEntries}
    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
  >
    Save All
  </button>

  
</div>

{showUploadModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
      <button
        onClick={() => setShowUploadModal(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      <h3 className="text-xl font-semibold mb-4">Upload Logbook</h3>

      <div className="space-y-4">
        <div>
          <label className="block font-medium">From Date</label>
          <input
            type="date"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium">To Date</label>
          <input
            type="date"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Log Book (PDF Only)</label>
          <input
            type="file"
            accept="application/pdf"
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          onClick={() => {
            // Add upload logic here
            setShowUploadModal(false);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          Upload
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default FeeCollectionPage;
