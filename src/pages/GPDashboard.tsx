
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
  Cell,
} from "recharts";
import DashboardLayout from "../components/DashboardLayout";
import DistributionRoaster from "../components/DistributionRoaster";
import FillingRoaster from "../components/FillingRoaster";
import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import LodgeComplaintForm from "../components/LodgeComplaint";
import WaterGauge from "../components/WaterDistributionProgress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faFaucetDrip,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";


const barData = [
  { name: "Zone 1", Complaints: 12 },
  { name: "Zone 2", Complaints: 5 },
  { name: "Zone 3", Complaints: 8 },
];

const pieData = [
  { name: "Resolved", value: 70 },
  { name: "Pending", value: 30 },
];

const COLORS = ["#4ade80", "#facc15"];

export default function GPDashboard() {
  const [showModal, setShowModal] = useState(false);
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 p-6 bg-transparent min-h-screen">
        <div className="relative min-h-screen overflow-hidden bg-transparent">
    
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-purple-700 bg-clip-text text-transparent tracking-tight">
  GRAM PANCHAYAT DASHBOARD
</h1>

  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
    <div className="relative w-72 md:w-96">
      <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
        </svg>
      </span>
      <input
        type="text"
        placeholder="Search..."
        className="pl-12 pr-4 py-2 w-full rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div className="text-md text-gray-500 font-medium whitespace-nowrap">
      {currentTime.toLocaleDateString()} — {currentTime.toLocaleTimeString()}
    </div>
  </div>
</div>

<div className="flex items-center justify-between mb-6">
  <h2 className="text-2xl font-semibold text-gray-800">Overview</h2>
  <div className="relative">
    <select
      className="appearance-none font-semibold text-gray-800 bg-white border border-gray-300 rounded-full py-2 pl-5 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option>Daily</option>
      <option>Weekly</option>
      <option>Monthly</option>
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
</div>


      {/* Stats Cards */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
  {[
    {
      title: "Total Beneficiaries",
      value: 320,
      icon: faUsers,
      subtext: "20 increase from last month",
      bg: "bg-[#1E3A8A]",
      iconBg: "bg-[#3B82F6]",
      textColor: "text-white",
    },
    {
      title: "Active Water Connections",
      value: 280,
      icon: faFaucetDrip,
      subtext: "15 more than previous",
      bg: "bg-[#1E40AF]",
      iconBg: "bg-[#60A5FA]",
      textColor: "text-white",
    },
    {
      title: "Pending Complaints",
      value: 12,
      icon: faExclamationTriangle,
      subtext: "5 more than last month",
      bg: "bg-[#1E429F]",
      iconBg: "bg-[#FACC15]",
      textColor: "text-white",
    },
  ].map((card, index) => (
    <div
  key={index}
  className={`rounded-2xl ${card.bg} shadow-md flex overflow-hidden h-32 transition-all duration-500 ease-in-out hover:shadow-[0_8px_20px_rgba(255,215,0,0.15)] hover:-translate-y-1`}
>

      {/* Icon Section */}
      <div className="w-32 flex items-center justify-center">
        <div className={`w-16 h-16 ${card.iconBg} rounded-full flex items-center justify-center text-2xl text-white`}>
          <FontAwesomeIcon icon={card.icon} />
        </div>
      </div>

      {/* Content Section */}
      <div className={`flex flex-col justify-center pl-4 pr-6 ${card.textColor}`}>
        <div className="text-base font-medium mb-1">{card.title}</div>
        <div className="text-3xl font-bold mb-1">{card.value}</div>
        <div className="text-sm opacity-80">{card.subtext}</div>
      </div>
    </div>
  ))}
</div>


      {showModal && (
        <Modal onClose={closeModal}>
          <LodgeComplaintForm mode="modal" onClose={closeModal} />
        </Modal>
      )}

      {/* Lodge Complaint */}
<div className="flex items-center justify-between bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 backdrop-blur-md shadow-md rounded-xl px-6 py-4 mb-10 border border-blue-200">
  <h3 className="text-lg font-semibold text-white drop-shadow-sm">FILE A COMPLAINT</h3>
  <button
    onClick={openModal}
    className="bg-white/20 hover:bg-white/30 transition-colors text-white font-semibold px-5 py-2 rounded-lg shadow-md backdrop-blur-sm"
  >
    Lodge Complaint
  </button>
</div>


      {/* Daily Roasters */}
      <h3 className="text-2xl font-bold text-gray-800 mt-6 mb-5">Daily Roasters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <DistributionRoaster />
        <FillingRoaster />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="water distribution">
  <WaterGauge totalDemand={10000} totalConsumed={8500} totalLoss={700} />

</div>


        <div className="rounded-2xl bg-gradient-to-br from-white via-blue-50 to-purple-50 shadow-lg p-6">
  <h3 className="text-lg font-semibold mb-4 text-gray-800">
    Complaint Status Distribution
  </h3>

  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={pieData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={100}
        label={({ percent }) =>
          `${(percent * 100).toFixed(0)}%`
        }
        labelLine={false}
      >
        {pieData.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </Pie>
      <Tooltip
        contentStyle={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          border: "1px solid #ccc",
          color: "#333",
        }}
        formatter={(value: number, name: string) => [`${value}`, name]}
      />
      <Legend
        verticalAlign="bottom"
        align="center"
        iconType="circle"
        wrapperStyle={{ marginTop: 20 }}
      />
    </PieChart>
  </ResponsiveContainer>

  {/* Optional: Custom Color Dot Legend */}
  <div className="mt-6 flex flex-wrap gap-6 justify-center text-sm text-gray-700 font-medium">
    {pieData.map((entry, index) => (
      <div key={entry.name} className="flex items-center gap-2">
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: COLORS[index % COLORS.length] }}
        ></span>
        <span>{entry.name}: {entry.value}</span>
      </div>
    ))}
  </div>
</div>

      </div>

      {/* Water Connections + Fee Collection */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
  {/* Water Connection Status */}
  <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 p-6 rounded-2xl shadow-lg">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Water Connection Status</h3>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={[
            { name: "Active", value: 150 },
            { name: "Disconnected", value: 30 },
            { name: "Pending", value: 20 },
          ]}
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          labelLine={false}
          dataKey="value"
        >
          <Cell fill="#22c55e" /> {/* Green */}
          <Cell fill="#f97316" /> {/* Orange */}
          <Cell fill="#ef4444" /> {/* Red */}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #ccc",
            color: "#333",
          }}
        />
      </PieChart>
    </ResponsiveContainer>

    {/* Custom Legend */}
    <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm text-gray-700 font-medium">
      {[
        { name: "Active", color: "#22c55e" },
        { name: "Disconnected", color: "#f97316" },
        { name: "Pending", color: "#ef4444" },
      ].map((item) => (
        <div key={item.name} className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
          {item.name}
        </div>
      ))}
    </div>
  </div>

  {/* Fee Collection vs Target */}
  <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 p-6 rounded-2xl shadow-lg">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Fee Collection vs Target</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={[
          { gp: "GP-101", target: 5000, collected: 4200 },
          { gp: "GP-102", target: 4000, collected: 3900 },
          { gp: "GP-103", target: 6000, collected: 5800 },
        ]}
        barGap={12}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="gp" />
        <YAxis />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #ccc",
            color: "#333",
          }}
        />
        <Legend />
        <Bar dataKey="target" fill="#f97316" radius={[8, 8, 0, 0]} />
        <Bar dataKey="collected" fill="#3b82f6" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>


      {/* Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white shadow-md p-6 overflow-auto">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Beneficiaries</h3>
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100 text-gray-800">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Connection ID</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t bg-white hover:bg-blue-50">
                <td className="px-4 py-2">Ramesh Yadav</td>
                <td className="px-4 py-2">GP12345</td>
                <td className="px-4 py-2 text-green-600">Active</td>
              </tr>
              <tr className="border-t bg-gray-50 hover:bg-blue-50">
                <td className="px-4 py-2">Sita Devi</td>
                <td className="px-4 py-2">GP12346</td>
                <td className="px-4 py-2 text-red-600">Inactive</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl bg-white shadow-md p-6 overflow-auto">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Complaint Summary</h3>
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100 text-gray-800">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Issue</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t bg-white hover:bg-blue-50">
                <td className="px-4 py-2">2025-07-18</td>
                <td className="px-4 py-2">Low pressure</td>
                <td className="px-4 py-2 text-yellow-600">Pending</td>
              </tr>
              <tr className="border-t bg-gray-50 hover:bg-blue-50">
                <td className="px-4 py-2">2025-07-17</td>
                <td className="px-4 py-2">Leakage</td>
                <td className="px-4 py-2 text-green-600">Resolved</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
     </div>
  );
}
