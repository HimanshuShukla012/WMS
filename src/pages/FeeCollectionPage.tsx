import React, { useState, useEffect } from "react";

type FeeEntry = {
  id: number;
  village: string;
  beneficiary: string;
  beneficiary_Father: string;
  amountPaid: number;
  previousbalance: number;
};

const FeeCollectionPage: React.FC = () => {
  const basefee = 100;

  const [entries, setEntries] = useState<FeeEntry[]>([
    { id: 1, village: "Village A", beneficiary: "Beneficiary 1", beneficiary_Father: "Father-1", previousbalance:30, amountPaid: 0 },
    { id: 2, village: "Village A", beneficiary: "Beneficiary 2", beneficiary_Father: "Father-2", previousbalance:40, amountPaid: 0 },
    { id: 3, village: "Village B", beneficiary: "Beneficiary 3", beneficiary_Father: "Father-3", previousbalance:20, amountPaid: 0 },
  ]);

  const [filters, setFilters] = useState({
    village: "",
    month: "",
    year: "",
  });

  const [editable, setEditable] = useState(false);

  const handleChangeAmountPaid = (id: number, value: number) => {
  const updated = entries.map((entry) => {
    if (entry.id === id) {
      const totalFee = basefee + entry.previousbalance;
      return { ...entry, amountPaid: Math.min(value, totalFee) };
    }
    return entry;
  });
  setEntries(updated);
};


  const handleSave = () => {
    const toSave = entries.filter((e) => e.village === filters.village);
    console.log("Saving entries for:", filters, toSave);
    // Add backend API call here
  };

  const filteredEntries = entries.filter(
    (e) => filters.village === "" || e.village === filters.village
  );

  // Debugging useEffect (optional)
  useEffect(() => {
    console.log("Filters updated:", filters);
  }, [filters]);

  return (
    <div className="p-6 relative z-10">
      <h1 className="text-2xl font-bold mb-4">Fee Collection Page</h1>
      

      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          className="p-2 border rounded w-48"
          value={filters.village}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, village: e.target.value }))
          }
        >
          <option value="">Select Village</option>
          <option value="Village A">Village A</option>
          <option value="Village B">Village B</option>
        </select>

        <select
          className="p-2 border rounded w-32"
          value={filters.month}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, month: e.target.value }))
          }
        >
          <option value="">Select Month</option>
          {[
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ].map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>

        <select
          className="p-2 border rounded w-24"
          value={filters.year}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, year: e.target.value }))
          }
        >
          <option value="">Select Year</option>
          {[2023, 2024, 2025].map((yr) => (
            <option key={yr} value={yr.toString()}>
              {yr}
            </option>
          ))}
        </select>

        <button
          type="button" // ✅ prevent form reset
          className={`${
            filters.village && filters.month && filters.year
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          } text-white px-4 py-2 rounded`}
          onClick={() => {
            if (filters.village && filters.month && filters.year) {
              setEditable(true);
            }
          }}
          disabled={!filters.village || !filters.month || !filters.year}
        >
          Proceed
        </button>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 shadow-md rounded-xl overflow-hidden">
          <thead className="bg-blue-600 text-white px-4 py-2 rounded">
            <tr>
              <th className="px-4 py-2 border">Village</th>
              <th className="px-4 py-2 border">Beneficiary Name</th>
              <th className="px-4 py-2 border">Beneficiary Father Name</th>
              <th className="px-4 py-2 border">Base Fee (₹)</th>
              <th className="px-4 py-2 border">Previous Balance (₹)</th>
              <th className="px-4 py-2 border">Cumelative Payable Fee (₹)</th>
              <th className="px-4 py-2 border">Amount Paid (₹)</th>
              <th className="px-4 py-2 border">Balance Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <tr key={entry.id} className="bg-white text-black text-center">
                  <td className="px-4 py-2 border">{entry.village}</td>
                  <td className="px-4 py-2 border">{entry.beneficiary}</td>
                  <td className="px-4 py-2 border">{entry.beneficiary_Father}</td>
                  <td className="px-4 py-2 border">{basefee}</td>
<td className="px-4 py-2 border">{entry.previousbalance}</td>
<td className="px-4 py-2 border">{basefee + entry.previousbalance}</td>
                  <td className="px-4 py-2 border">
                    {editable ? (
                      <input
                        type="number"
                        className="w-24 border rounded px-2 py-1 text-center"
                        value={entry.amountPaid}
                        min={0}
max={basefee + entry.previousbalance}
                        onChange={(e) =>
                          handleChangeAmountPaid(
                            entry.id,
                            Number(e.target.value)
                          )
                        }
                      />
                    ) : (
                      entry.amountPaid
                    )}
                  </td>
                  <td className="px-4 py-2 border">
{(basefee + entry.previousbalance) - entry.amountPaid}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No entries available for selected village.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Save Button */}
      {editable && filteredEntries.length > 0 && (
        <div className="mt-6">
          <button
            type="button" // ✅ prevent form reset
            onClick={handleSave}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default FeeCollectionPage;
