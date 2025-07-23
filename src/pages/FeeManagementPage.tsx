import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

const dummyData = [
  {
    id: 1,
    date: "2025-07-20",
    village: "Rampur",
    beneficiary: "Rajesh Kumar",
    outstanding: 300,
    paid: 200,
    balance: 100,
  },
  {
    id: 2,
    date: "2025-07-20",
    village: "Rampur",
    beneficiary: "Sita Devi",
    outstanding: 500,
    paid: 500,
    balance: 0,
  },
];

export default function FeeManagementPage() {
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState(dummyData);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    setFilteredData(
      dummyData.filter(
        (entry) =>
          entry.beneficiary.toLowerCase().includes(val.toLowerCase()) ||
          entry.village.toLowerCase().includes(val.toLowerCase())
      )
    );
  };

  return (
    
      <div className="flex flex-col gap-6 relative z-10">
        <h1 className="text-2xl font-bold">Fee Management Page</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">From Date</label>
            <input
              type="date"
              className="border border-gray-300 rounded px-2 py-1"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">To Date</label>
            <input
              type="date"
              className="border border-gray-300 rounded px-2 py-1"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by name or village"
              value={search}
              onChange={handleSearch}
              className="border border-gray-300 rounded px-2 py-1"
            />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded font-medium">
            Apply Filters
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded font-medium">
            Export as CSV
          </button>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border rounded shadow p-4">
            <p className="text-gray-600 text-sm">Total Collected</p>
            <p className="text-xl font-semibold">₹700</p>
          </div>
          <div className="bg-white border rounded shadow p-4">
            <p className="text-gray-600 text-sm">Outstanding Balance</p>
            <p className="text-xl font-semibold">₹100</p>
          </div>
          <div className="bg-white border rounded shadow p-4">
            <p className="text-gray-600 text-sm">Total Beneficiaries</p>
            <p className="text-xl font-semibold">2</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border mt-4 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Date</th>
                <th className="border px-4 py-2 text-left">Village</th>
                <th className="border px-4 py-2 text-left">Beneficiary</th>
                <th className="border px-4 py-2 text-left">Outstanding</th>
                <th className="border px-4 py-2 text-left">Paid</th>
                <th className="border px-4 py-2 text-left">Balance</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((entry) => (
                <tr key={entry.id}>
                  <td className="border px-4 py-2">{entry.date}</td>
                  <td className="border px-4 py-2">{entry.village}</td>
                  <td className="border px-4 py-2">{entry.beneficiary}</td>
                  <td className="border px-4 py-2">₹{entry.outstanding}</td>
                  <td className="border px-4 py-2">₹{entry.paid}</td>
                  <td className="border px-4 py-2">₹{entry.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
}
