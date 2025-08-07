import React, { useState } from 'react';
import Select from 'react-select';

const villageOptions = [
  { value: 'Village A', label: 'Village A' },
  { value: 'Village B', label: 'Village B' },
  { value: 'Village C', label: 'Village C' },
  { value: 'Village D', label: 'Village D' }
];

const WaterQuality = () => {
  const [samplesCollected, setSamplesCollected] = useState(0);
  const [contaminatedSamples, setContaminatedSamples] = useState(0);
  const [villagesTested, setVillagesTested] = useState([]);
  const [villagesContaminated, setVillagesContaminated] = useState([]);
  const [actionTaken, setActionTaken] = useState('');

  const handleReset = () => {
    setSamplesCollected(0);
    setContaminatedSamples(0);
    setVillagesTested([]);
    setVillagesContaminated([]);
    setActionTaken('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      samplesCollected,
      contaminatedSamples,
      villagesTested: villagesTested.map((v: any) => v.value),
      villagesContaminated: villagesContaminated.map((v: any) => v.value),
      actionTaken
    };
    console.log('Water Quality Data Submitted:', data);
  };

  return (
    <div className="p-6 w-full min-h-screen text-black relative z-10">
      <h1 className="text-2xl font-semibold mb-2">Water Quality Form</h1>
      <p className="text-gray-600 mb-6">
        Fill in the details of water quality testing for your area. Fields marked with * are mandatory.
      </p>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white shadow-md p-6 rounded-xl"
      >
        {/* No. of Samples Collected */}
        <div>
          <label className="block font-medium mb-1">No. of Samples Collected</label>
          <input
            type="number"
            className="w-full border rounded-md px-3 py-2"
            value={samplesCollected}
            onChange={(e) => setSamplesCollected(Number(e.target.value))}
          />
        </div>

        {/* Villages Tested */}
        <div>
          <label className="block font-medium mb-1">Villages Tested</label>
          <Select
            isMulti
            options={villageOptions}
            value={villagesTested}
            onChange={setVillagesTested}
            className="text-black"
          />
        </div>

        {/* No. of Contaminated Samples */}
        <div>
          <label className="block font-medium mb-1">No. of Contaminated Samples</label>
          <input
            type="number"
            className="w-full border rounded-md px-3 py-2"
            value={contaminatedSamples}
            onChange={(e) => setContaminatedSamples(Number(e.target.value))}
          />
        </div>

        {/* Villages with Contamination Issues */}
        <div>
          <label className="block font-medium mb-1">Villages with Contamination Issues</label>
          <Select
            isMulti
            options={villageOptions}
            value={villagesContaminated}
            onChange={setVillagesContaminated}
            className="text-black"
          />
        </div>

        {/* Action Taken */}
        <div className="md:col-span-2">
          <label className="block font-medium mb-1">Action Taken</label>
          <textarea
            rows={4}
            className="w-full border rounded-md px-3 py-2"
            value={actionTaken}
            onChange={(e) => setActionTaken(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="md:col-span-2 flex justify-end gap-4 mt-4">
          <button
            type="button"
            className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded-md"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default WaterQuality;
