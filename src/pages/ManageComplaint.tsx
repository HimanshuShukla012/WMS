import React, { useState } from "react";

const ManageComplaint = () => {
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [filterVillage, setFilterVillage] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [complaints, setComplaints] = useState([
    {
      id: 1,
    district: "District A",
    block: "Block X",
    gramPanchayat: "Panchayat 1",
    village: "Village I",
    beneficiaryName: "Sita Devi",
    beneficiaryContact: "9998887777",
    landmark: "Near temple",
    category: "No Water",
    resolutionDays: "2",
      status: "Pending",
    },
    // Add more dummy complaints as needed
  ]);

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleChange = (id, field, value) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleDownload = () => {
    alert("Download functionality will be implemented.");
  };

  const filteredData = complaints.filter((c) => {
  return (
    (c.beneficiaryName || "").toLowerCase().includes(search.toLowerCase()) &&
    (filterVillage ? c.village === filterVillage : true) &&
    (filterStatus ? c.status === filterStatus : true)
  );
});


  return (
    <div className="p-6 relative z-10">
      <h1 className="text-2xl font-bold mb-2">Manage Complaints</h1>
      <p className="text-sm text-gray-900 mb-6">
        In this section you can view, edit, update, and download the complaint records.
      </p>

      <div className="flex justify-between mb-4 gap-4 flex-wrap">
        <input
          type="text"
          className="p-2 border rounded w-1/3 min-w-[200px]"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-4 flex-wrap">
          <select
            className="p-2 border rounded"
            value={filterVillage}
            onChange={(e) => setFilterVillage(e.target.value)}
          >
            <option value="">All Villages</option>
            <option value="Village 1">Village 1</option>
            <option value="Village 2">Village 2</option>
            <option value="Village 3">Village 3</option>
          </select>

          <select
            className="p-2 border rounded"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
          </select>

          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={handleDownload}
          >
            Download
          </button>
        </div>
      </div>

      {/* Global Edit Controls */}
      <div className="flex justify-end gap-2 mb-2">
        {!editMode ? (
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded"
            onClick={handleEditToggle}
          >
            Edit Complaints
          </button>
        ) : (
          <>
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded"
              onClick={handleEditToggle}
            >
              Cancel
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => {
                alert("All changes saved successfully!");
                setEditMode(false);
              }}
            >
              Save Changes
            </button>
          </>
        )}
      </div>

      <table className="w-full text-sm border-collapse border border-gray-500">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="border p-2">District</th>
            <th className="border p-2">Block</th>
            <th className="border p-2">Gram Panchayat</th>
            <th className="border p-2">Village</th>
            <th className="border p-2">Beneficiary Name</th>
            <th className="border p-2">Beneficiary Contact</th>
            <th className="border p-2">Landmark</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((c) => (
            <tr key={c.id} className="bg-white text-black">
              <td className="border p-2">{c.district}</td>
              <td className="border p-2">{c.block}</td>
              <td className="border p-2">{c.gramPanchayat}</td>
              <td className="border p-2">
                {editMode ? (
                  <select
                    className="w-full border rounded p-1"
                    value={c.Village}
                    onChange={(e) => handleChange(c.id, "Village", e.target.value)}
                  >
                    <option value="Village 1">Village 1</option>
                    <option value="Village 2">Village 2</option>
                    <option value="Village 3">Village 3</option>
                  </select>
                ) : (
                  c.Village
                )}
              </td>
              <td className="border p-2">
                {editMode ? (
                  <input
                    className="w-full border rounded p-1"
                    value={c.complaintType}
                    onChange={(e) =>
                      handleChange(c.id, "complaintType", e.target.value)
                    }
                  />
                ) : (
                  c.complaintType
                )}
              </td>
              <td className="border p-2">
                {editMode ? (
                  <textarea
                    className="w-full border rounded p-1"
                    value={c.description}
                    onChange={(e) =>
                      handleChange(c.id, "description", e.target.value)
                    }
                  />
                ) : (
                  c.description
                )}
              </td>
              <td className="border p-2">
                {editMode ? (
                  <input
                    className="w-full border rounded p-1"
                    value={c.complainantName}
                    onChange={(e) =>
                      handleChange(c.id, "complainantName", e.target.value)
                    }
                  />
                ) : (
                  c.complainantName
                )}
              </td>
              <td className="border p-2">
                {editMode ? (
                  <input
                    className="w-full border rounded p-1"
                    value={c.contact}
                    onChange={(e) => handleChange(c.id, "contact", e.target.value)}
                  />
                ) : (
                  c.contact
                )}
              </td>
              <td className="border p-2">
                {editMode ? (
                  <select
                    className="w-full border rounded p-1"
                    value={c.status}
                    onChange={(e) => handleChange(c.id, "status", e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                ) : (
                  c.status
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageComplaint;
