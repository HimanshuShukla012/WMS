import { useState, useRef, useEffect } from "react";

const ManageBeneficiary = () => {
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [filterVillage, setFilterVillage] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  const [beneficiaries, setBeneficiaries] = useState([
    {
      id: 1,
      district: "Lucknow",
      block: "Sarojini Nagar",
      gramPanchayat: "XYZ",
      village: "Village A",
      name: "Ramesh Kumar",
      fatherOrHusbandName: "Suresh Kumar",
      contact: "9876543210",
      familyCount: 5,
      status: "Active",
    },
  ]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        showModal &&
        modalRef.current &&
        !modalRef.current.contains(e.target as Node)
      ) {
        setShowModal(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showModal]);

  const handleEditToggle = () => setEditMode(!editMode);

  const handleChange = (id, field, value) => {
    setBeneficiaries((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const handleDownload = () => {
    alert("Download functionality will be implemented.");
  };

  const handleUpload = () => {
    if (!csvFile) {
      alert("Please select a CSV file to upload.");
      return;
    }
    console.log("Uploading", csvFile);
    setCsvFile(null);
    setShowModal(false);
  };

  const filteredData = beneficiaries.filter((b) => {
    return (
      b.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterVillage ? b.village === filterVillage : true) &&
      (filterStatus ? b.status === filterStatus : true)
    );
  });

  return (
    <div className="p-6 relative z-10">
      <h1 className="text-2xl font-bold mb-2">Manage Beneficiary</h1>
      <p className="text-sm text-gray-900 mb-6">
        In this section you can view, edit, update, and download the beneficiary list.
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
            <option value="Village A">Village A</option>
            <option value="Village B">Village B</option>
          </select>

          <select
            className="p-2 border rounded"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={handleDownload}
          >
            Download
          </button>
        </div>
      </div>

      <div className="flex justify-between gap-2 mb-4 flex-wrap">
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded"
          onClick={() => setShowModal(true)}
        >
          Bulk Import Beneficiary Records
        </button>

        <div className="flex gap-2">
          {!editMode ? (
            <button
              className="bg-yellow-500 text-white px-4 py-2 rounded"
              onClick={handleEditToggle}
            >
              Edit Beneficiary Records
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
      </div>

      <table className="w-full text-sm border-collapse border border-gray-500">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="border p-2">District</th>
            <th className="border p-2">Block</th>
            <th className="border p-2">Gram Panchayat</th>
            <th className="border p-2">Village</th>
            <th className="border p-2">Beneficiary Name</th>
            <th className="border p-2">Father/Husband Name</th>
            <th className="border p-2">Contact</th>
            <th className="border p-2">Family Members</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((b) => (
            <tr key={b.id} className="bg-white text-black">
              <td className="border p-2">{b.district}</td>
              <td className="border p-2">{b.block}</td>
              <td className="border p-2">{b.gramPanchayat}</td>
              <td className="border p-2">
                {editMode ? (
                  <input
                    className="w-full border rounded p-1"
                    value={b.village}
                    onChange={(e) => handleChange(b.id, "village", e.target.value)}
                  />
                ) : (
                  b.village
                )}
              </td>
              <td className="border p-2">
                {editMode ? (
                  <input
                    className="w-full border rounded p-1"
                    value={b.name}
                    onChange={(e) => handleChange(b.id, "name", e.target.value)}
                  />
                ) : (
                  b.name
                )}
              </td>
              <td className="border p-2">
                {editMode ? (
                  <input
                    className="w-full border rounded p-1"
                    value={b.fatherOrHusbandName}
                    onChange={(e) =>
                      handleChange(b.id, "fatherOrHusbandName", e.target.value)
                    }
                  />
                ) : (
                  b.fatherOrHusbandName
                )}
              </td>
              <td className="border p-2">
                {editMode ? (
                  <input
                    className="w-full border rounded p-1"
                    value={b.contact}
                    onChange={(e) => handleChange(b.id, "contact", e.target.value)}
                  />
                ) : (
                  b.contact
                )}
              </td>
              <td className="border p-2">
                {editMode ? (
                  <input
                    type="number"
                    className="w-full border rounded p-1"
                    value={b.familyCount}
                    onChange={(e) =>
                      handleChange(b.id, "familyCount", e.target.value)
                    }
                  />
                ) : (
                  b.familyCount
                )}
              </td>
              <td className="border p-2">
                {editMode ? (
                  <select
                    className="w-full border rounded p-1"
                    value={b.status}
                    onChange={(e) => handleChange(b.id, "status", e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                ) : (
                  b.status
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative"
            ref={modalRef}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
            >
              &times;
            </button>

            <h2 className="text-lg font-bold mb-2">Bulk Import</h2>
            <p className="text-sm mb-4">
              Upload Beneficiary records in the desired format.
              <br />
              Please find the format below.
            </p>

            <a
              href="/sample-beneficiary-format.csv"
              download
              className="text-blue-600 underline text-sm mb-4 inline-block"
            >
              Download Format
            </a>

            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="w-full mb-4 border rounded p-2"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded"
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

export default ManageBeneficiary;
