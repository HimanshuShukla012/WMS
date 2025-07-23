import React from "react";
import DashboardLayout from "../components/DashboardLayout"; // adjust path as needed

const AddBeneficiary = () => {
  return (
   
      <div className="p-6 w-full min-h-screen text-black relative z-10">
    <h1 className="text-2xl font-semibold mb-2">Add Beneficiary</h1>
    <p className="text-gray-600 mb-6">
      This page is only for adding new beneficiary details. To update any existing beneficiary records, please visit the{" "}
      <a href="/gp/manage-beneficiary" className="text-blue-600 underline hover:text-blue-800">
        Manage Beneficiary
      </a>{" "}
      page.
    </p>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white shadow-md p-6 rounded-xl">
          {/* District (Non-editable) */}
          <div>
            <label className="block font-medium mb-1">District</label>
            <input
              type="text"
              value="Your District"
              disabled
              className="w-full border rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Block */}
          <div>
            <label className="block font-medium mb-1">Block</label>
            <input
              type="text"
              placeholder="Enter Block"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          {/* Gram Panchayat */}
          <div>
            <label className="block font-medium mb-1">Gram Panchayat</label>
            <input
              type="text"
              placeholder="Enter Gram Panchayat"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          {/* Village */}
          <div>
            <label className="block font-medium mb-1">Village</label>
            <select className="w-full border rounded-md px-3 py-2">
              <option value="">Select Village</option>
              <option value="Village 1">Village 1</option>
              <option value="Village 2">Village 2</option>
            </select>
          </div>

          {/* Beneficiary Name */}
          <div>
            <label className="block font-medium mb-1">Beneficiary Name</label>
            <input
              type="text"
              placeholder="Enter Name"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          {/* Father/Husband Name */}
          <div>
            <label className="block font-medium mb-1">Father/Husband Name</label>
            <input
              type="text"
              placeholder="Enter Name"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="block font-medium mb-1">Contact Number</label>
            <input
              type="tel"
              placeholder="Enter Contact Number"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          {/* Count of Family Members */}
          <div>
            <label className="block font-medium mb-1">Family Members Count</label>
            <input
              type="number"
              placeholder="Enter Count"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          {/* Water Supply Status */}
          <div>
            <label className="block font-medium mb-1">Water Supply Status</label>
            <select className="w-full border rounded-md px-3 py-2">
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-4 mt-4">
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded-md"
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

export default AddBeneficiary;
