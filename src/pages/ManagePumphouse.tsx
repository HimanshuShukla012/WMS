import { useState } from "react";

const ManagePumpHouse = () => {
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState("");

  const [pumpHouses, setPumpHouses] = useState([
    {
      id: 1,
      pumps: [
        { horsepower: "5", powerSource: "Electricity", solarOutput: "", status: "Active" },
        { horsepower: "3", powerSource: "Solar", solarOutput: "1.5", status: "Inactive" },
      ],
      operatorName: "Rajesh",
      contact: "9999999999",
    },
  ]);

  const handlePumpChange = (id, pumpIndex, field, value) => {
    const updated = pumpHouses.map((house) => {
      if (house.id === id) {
        const updatedPumps = [...house.pumps];
        updatedPumps[pumpIndex][field] = value;
        return { ...house, pumps: updatedPumps };
      }
      return house;
    });
    setPumpHouses(updated);
  };

  const filteredData = pumpHouses.filter((h) =>
    h.operatorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Manage Pump House</h1>
      <p className="text-sm text-gray-900 mb-6">View and edit pump house configurations.</p>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by operator name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded"
        />
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded"
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? "Cancel" : "Edit Records"}
        </button>
        {editMode && (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => {
              alert("Changes saved.");
              setEditMode(false);
            }}
          >
            Save Changes
          </button>
        )}
      </div>

      <table className="w-full text-sm border-collapse border border-gray-500">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="border p-2">Operator Name</th>
            <th className="border p-2">Contact</th>
            <th className="border p-2">Pump #</th>
            <th className="border p-2">Horsepower</th>
            <th className="border p-2">Power Source</th>
            <th className="border p-2">Solar Output (kW)</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((house) =>
            house.pumps.map((pump, i) => (
              <tr key={`${house.id}-${i}`} className="bg-white text-black">
                <td className="border p-2">{house.operatorName}</td>
                <td className="border p-2">{house.contact}</td>
                <td className="border p-2">Pump {i + 1}</td>
                <td className="border p-2">
                  <input
                    className="w-full border rounded p-1"
                    value={pump.horsepower}
                    onChange={(e) => handlePumpChange(house.id, i, "horsepower", e.target.value)}
                    disabled={!editMode}
                  />
                </td>
                <td className="border p-2">
                  <select
                    className="w-full border rounded p-1"
                    value={pump.powerSource}
                    onChange={(e) => handlePumpChange(house.id, i, "powerSource", e.target.value)}
                    disabled={!editMode}
                  >
                    <option value="">Select Source</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Solar">Solar</option>
                  </select>
                </td>
                <td className="border p-2">
                  {pump.powerSource === "Solar" ? (
                    <input
                      className="w-full border rounded p-1"
                      value={pump.solarOutput}
                      onChange={(e) => handlePumpChange(house.id, i, "solarOutput", e.target.value)}
                      disabled={!editMode}
                    />
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
                <td className="border p-2">
                  <select
                    className="w-full border rounded p-1"
                    value={pump.status}
                    onChange={(e) => handlePumpChange(house.id, i, "status", e.target.value)}
                    disabled={!editMode}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManagePumpHouse;
