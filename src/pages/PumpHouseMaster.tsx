import React, { useState } from "react";

type Pump = {
  horsepower: string;
  powerSource: string;
  solarOutput: string;
};

const PumpHouseMaster = () => {
  const [numPumps, setNumPumps] = useState(1);
  const [pumps, setPumps] = useState<Pump[]>([{ horsepower: "", powerSource: "", solarOutput: "" }]);

  const handleNumPumpsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value);
    setNumPumps(count);
    const updatedPumps = Array.from({ length: count }, (_, i) => pumps[i] || { horsepower: "", powerSource: "", solarOutput: "" });
    setPumps(updatedPumps);
  };

  const handlePumpChange = (index: number, field: keyof Pump, value: string) => {
    const updated = [...pumps];
    updated[index][field] = value;
    setPumps(updated);
  };

  return (
    <div className="p-6 relative z-10">
      <h2 className="text-2xl font-bold mb-2">Add Over Head Tank Details</h2>
      <p className="text-sm text-gray-600 mb-6">Use this form to enter OHT and pump details under your gram panchayat.</p>

      {/* Location Details */}
      <div className="bg-blue-600/20 px-4 py-2 rounded mb-4">
        <h3 className="font-semibold text-lg text-blue-900">Location Details</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">District</label>
          <input className="border rounded p-2 w-full" placeholder="District" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Block</label>
          <input className="border rounded p-2 w-full" placeholder="Block" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Gram Panchayat</label>
          <input className="border rounded p-2 w-full" placeholder="Gram Panchayat" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Village</label>
          <select className="border rounded p-2 w-full">
            <option>Select Village</option>
            <option>Village A</option>
            <option>Village B</option>
          </select>
        </div>
      </div>

      {/* OHT Details */}
      <div className="bg-blue-600/20 px-4 py-2 rounded mb-4">
        <h3 className="font-semibold text-lg text-blue-900">OHT Details</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">OHT Capacity (Litres)</label>
          <input className="border rounded p-2 w-full" placeholder="OHT Capacity (Litres)" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Number of Pumps</label>
          <select className="border rounded p-2 w-full" value={numPumps} onChange={handleNumPumpsChange}>
            <option value={1}>1 Pump</option>
            <option value={2}>2 Pumps</option>
            <option value={3}>3 Pumps</option>
            <option value={4}>4 Pumps</option>
            <option value={5}>5 Pumps</option>
          </select>
        </div>
      </div>

      {/* Pump Details */}
      <div className="bg-blue-600/20 px-4 py-2 rounded mb-4">
        <h3 className="font-semibold text-lg text-blue-900">Pump Details</h3>
      </div>
      {pumps.map((pump, index) => (
        <div key={index} className="mb-6 border-t pt-4">
          <h4 className="font-semibold text-blue-800 mb-2">Pump-{index + 1}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Horsepower (HP)</label>
              <input
                className="border rounded p-2 w-full"
                placeholder="Horsepower (HP)"
                value={pump.horsepower}
                onChange={(e) => handlePumpChange(index, "horsepower", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Power Source</label>
              <select
                className="border rounded p-2 w-full"
                value={pump.powerSource}
                onChange={(e) => handlePumpChange(index, "powerSource", e.target.value)}
              >
                <option value="">Select Power Source</option>
                <option value="Electricity">Electricity</option>
                <option value="Solar">Solar</option>
              </select>
            </div>

            {pump.powerSource === "Solar" && (
              <div>
                <label className="block text-sm font-medium mb-1">Solar Output (kW)</label>
                <input
                  className="border rounded p-2 w-full"
                  placeholder="Solar Output (kW)"
                  value={pump.solarOutput}
                  onChange={(e) => handlePumpChange(index, "solarOutput", e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Operator Details */}
      <div className="bg-blue-600/20 px-4 py-2 rounded mb-4">
        <h3 className="font-semibold text-lg text-blue-900">Pump House Operator Details</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Operator Name</label>
          <input className="border rounded p-2 w-full" placeholder="Pump House Operator Name" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contact Number</label>
          <input className="border rounded p-2 w-full" placeholder="Pump House Operator Contact Number" />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Save</button>
        <button
          className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
          onClick={() => {
            setNumPumps(1);
            setPumps([{ horsepower: "", powerSource: "", solarOutput: "" }]);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default PumpHouseMaster;
