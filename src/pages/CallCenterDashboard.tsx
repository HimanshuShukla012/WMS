import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockData = [
  { name: "Resolved", value: 34 },
  { name: "Pending", value: 12 },
  { name: "Escalated", value: 5 },
];

const CallCenterDashboard = () => {
  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <h1 className="text-3xl font-semibold text-blue-800">Call Center Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-md p-4 text-center">
          <h2 className="text-gray-600 text-sm">Total Complaints</h2>
          <p className="text-2xl font-bold text-blue-600">51</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4 text-center">
          <h2 className="text-gray-600 text-sm">Resolved Today</h2>
          <p className="text-2xl font-bold text-green-600">18</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4 text-center">
          <h2 className="text-gray-600 text-sm">Pending</h2>
          <p className="text-2xl font-bold text-yellow-600">12</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Complaint Status Summary</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CallCenterDashboard;
