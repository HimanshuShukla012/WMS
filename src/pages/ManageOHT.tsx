import { useState } from "react";

const ManageOHT = () => {
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [filterVillage, setFilterVillage] = useState("");

  const [ohtList, setOhtList] = useState([
    {
      id: 1,
      district: "Lucknow",
      block: "Sarojini Nagar",
      gramPanchayat: "XYZ",
      village: "Village A",
      capacity: "20000",
      height: "2",
    },
  ]);

  const handleChange = (id, field, value) => {
    setOhtList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const filteredData = ohtList.filter((b) =>
    b.village.toLowerCase().includes(search.toLowerCase()) &&
    (filterVillage ? b.village === filterVillage : true)
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Manage Over Head Tank</h1>
      <p className="text-sm text-gray-900 mb-6">View, edit and manage Over Head Tank records.</p>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by village..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded"
        />
        <select
          className="p-2 border rounded"
          value={filterVillage}
          onChange={(e) => setFilterVillage(e.target.value)}
        >
          <option value="">All Villages</option>
          <option value="Village A">Village A</option>
          <option value="Village B">Village B</option>
        </select>
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

      <table className="w-full text-sm border border-collapse">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="border p-2">District</th>
            <th className="border p-2">Block</th>
            <th className="border p-2">Gram Panchayat</th>
            <th className="border p-2">Village</th>
            <th className="border p-2">Capacity (L)</th>
            <th className="border p-2">No. of Pumps</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => (
            <tr key={item.id} className="bg-white">
              <td className="border p-2">{item.district}</td>
              <td className="border p-2">{item.block}</td>
              <td className="border p-2">{item.gramPanchayat}</td>
              <td className="border p-2">
                {editMode ? (
                  <input
                    className="w-full border p-1"
                    value={item.village}
                    onChange={(e) => handleChange(item.id, "village", e.target.value)}
                  />
                ) : (
                  item.village
                )}
              </td>
              <td className="border p-2">
                {editMode ? (
                  <input
                    className="w-full border p-1"
                    value={item.capacity}
                    onChange={(e) => handleChange(item.id, "capacity", e.target.value)}
                  />
                ) : (
                  item.capacity
                )}
              </td>
              <td className="border p-2">
                {editMode ? (
                  <input
                    className="w-full border p-1"
                    value={item.height}
                    onChange={(e) => handleChange(item.id, "height", e.target.value)}
                  />
                ) : (
                  item.height
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageOHT;