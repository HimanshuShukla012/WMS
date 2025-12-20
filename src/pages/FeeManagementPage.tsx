import React, { useState, useEffect } from "react";
import { useUserInfo } from '../utils/userInfo';

// ---------- Types ----------
type BeneficiaryData = {
  FeeCollectionId: number;
  CollectionId: number;
  BeneficiaryId: number;
  BeneficiaryName: string;
  FatherHusbandName: string;
  VillageId: number;
  VillageName: string;
  BaseFee: number;
  PreviousBalance: number;
  BalanceAmount: number;
  OutstandingAmount: number;
  PaidAmount: number;
  Date: string;
};

type AnalyticsSummary = {
  totalBaseFee: number;
  totalPreviousBalance: number;
  totalOutstanding: number;
  totalCollected: number;
  totalBalance: number;
  totalBeneficiaries: number;
  totalVillages: number;
  paidBeneficiaries: number;
  unpaidBeneficiaries: number;
};

// ---------- Component ----------
const FeeManagementPage: React.FC = () => {
  const { userId, role, loading: userLoading, error: userError } = useUserInfo();

  // ---------- State ----------
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryData[]>([]);
  const [filteredData, setFilteredData] = useState<BeneficiaryData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalBaseFee: 0,
    totalPreviousBalance: 0,
    totalOutstanding: 0,
    totalCollected: 0,
    totalBalance: 0,
    totalBeneficiaries: 0,
    totalVillages: 0,
    paidBeneficiaries: 0,
    unpaidBeneficiaries: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Filter states
  const [selectedVillage, setSelectedVillage] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all"); // all, paid, unpaid, partial

  // Get unique villages from beneficiaries
  const villages = React.useMemo(() => {
    const uniqueVillages = new Map();
    beneficiaries.forEach(b => {
      if (!uniqueVillages.has(b.VillageId)) {
        uniqueVillages.set(b.VillageId, {
          VillageId: b.VillageId,
          VillageName: b.VillageName
        });
      }
    });
    return Array.from(uniqueVillages.values());
  }, [beneficiaries]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = [2023, 2024, 2025, 2026];

  // ---------- API Functions ----------
  const fetchBeneficiaries = async (month: string, year: string) => {
    if (!userId || !month || !year) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const monthIndex = months.indexOf(month) + 1;
      
      console.log(`📡 Fetching fee data for ${month} ${year}`);
      
      const response = await fetch(
        `https://wmsapi.kdsgroup.co.in/api/Master/GetBeneficiaryDetailListByUser?UserId=${userId}&Month=${monthIndex}&Year=${year}`,
        {
          method: 'GET',
          headers: { 'accept': '*/*' }
        }
      );
      
      const result = await response.json();
      
      if (result.Status && result.Data) {
        console.log(`✅ Received ${result.Data.length} records`);
        setBeneficiaries(result.Data);
      } else {
        setError(result.Message || "No data found for selected period");
        setBeneficiaries([]);
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setError("Error loading fee data");
      setBeneficiaries([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Calculate Analytics ----------
  const calculateAnalytics = (data: BeneficiaryData[]) => {
    const totalBaseFee = data.reduce((sum, item) => sum + (item.BaseFee || 0), 0);
    const totalPreviousBalance = data.reduce((sum, item) => sum + (item.PreviousBalance || 0), 0);
    const totalOutstanding = data.reduce((sum, item) => sum + (item.OutstandingAmount || 0), 0);
    const totalCollected = data.reduce((sum, item) => sum + (item.PaidAmount || 0), 0);
    const totalBalance = data.reduce((sum, item) => sum + (item.BalanceAmount || 0), 0);
    const totalBeneficiaries = new Set(data.map(item => item.BeneficiaryId)).size;
    const totalVillages = new Set(data.map(item => item.VillageId)).size;
    
    const paidBeneficiaries = data.filter(item => item.PaidAmount > 0).length;
    const unpaidBeneficiaries = data.filter(item => item.PaidAmount === 0).length;

    setAnalytics({
      totalBaseFee,
      totalPreviousBalance,
      totalOutstanding,
      totalCollected,
      totalBalance,
      totalBeneficiaries,
      totalVillages,
      paidBeneficiaries,
      unpaidBeneficiaries
    });
  };

  // ---------- Effects ----------
  useEffect(() => {
    if (selectedMonth && selectedYear && userId) {
      fetchBeneficiaries(selectedMonth, selectedYear);
    } else {
      setBeneficiaries([]);
      setFilteredData([]);
    }
  }, [selectedMonth, selectedYear, userId]);

  // Apply filters
  useEffect(() => {
    let filtered = [...beneficiaries];

    // Village filter
    if (selectedVillage) {
      filtered = filtered.filter(b => b.VillageName === selectedVillage);
    }

    // Payment status filter
    if (paymentFilter === "paid") {
      filtered = filtered.filter(b => b.PaidAmount >= (b.BaseFee + b.PreviousBalance));
    } else if (paymentFilter === "unpaid") {
      filtered = filtered.filter(b => b.PaidAmount === 0);
    } else if (paymentFilter === "partial") {
      filtered = filtered.filter(b => b.PaidAmount > 0 && b.PaidAmount < (b.BaseFee + b.PreviousBalance));
    }

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.BeneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.VillageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.FatherHusbandName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredData(filtered);
    calculateAnalytics(filtered);
  }, [beneficiaries, selectedVillage, paymentFilter, searchQuery]);

  // ---------- Handlers ----------
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = [
      "S.No.",
      "Fee Collection ID",
      "Village",
      "Beneficiary Name",
      "Father/Husband Name",
      "Base Fee",
      "Previous Balance",
      "Total Outstanding",
      "Paid Amount",
      "Balance Amount",
      "Payment Date",
      "Status"
    ];

    const getPaymentStatus = (item: BeneficiaryData) => {
      const totalPayable = item.BaseFee + item.PreviousBalance;
      if (item.PaidAmount === 0) return "Unpaid";
      if (item.PaidAmount >= totalPayable) return "Fully Paid";
      return "Partially Paid";
    };

    const csvContent = [
      headers.join(","),
      ...filteredData.map((row, index) => [
        index + 1,
        row.FeeCollectionId,
        `"${row.VillageName}"`,
        `"${row.BeneficiaryName}"`,
        `"${row.FatherHusbandName || 'N/A'}"`,
        row.BaseFee,
        row.PreviousBalance,
        row.BaseFee + row.PreviousBalance,
        row.PaidAmount,
        row.BalanceAmount,
        row.Date ? new Date(row.Date).toLocaleDateString('en-IN') : 'N/A',
        getPaymentStatus(row)
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `fee_report_${selectedMonth}_${selectedYear}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearFilters = () => {
    setSelectedVillage("");
    setSelectedMonth("");
    setSelectedYear("");
    setSearchQuery("");
    setPaymentFilter("all");
    setBeneficiaries([]);
    setFilteredData([]);
    setError("");
  };

  const getPaymentStatus = (item: BeneficiaryData) => {
    const totalPayable = item.BaseFee + item.PreviousBalance;
    if (item.PaidAmount === 0) {
      return <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700">Unpaid</span>;
    }
    if (item.PaidAmount >= totalPayable) {
      return <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Fully Paid</span>;
    }
    return <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700">Partial</span>;
  };

  // ---------- Render ----------
  
  if (userLoading) {
    return (
      <div className="p-6">
        <div className="bg-blue-100 text-blue-700 p-3 rounded">
          Loading user information...
        </div>
      </div>
    );
  }

  if (userError || !userId) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-3 rounded">
          {userError || "User ID not found. Please login again."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Fee Management & Reports</h1>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded">
            {error}
          </div>
        )}

        {/* Loading Display */}
        {loading && (
          <div className="bg-blue-100 text-blue-700 p-3 rounded">
            Loading fee data...
          </div>
        )}

        {/* User Info */}
        <div className="bg-gray-100 text-gray-700 p-3 rounded text-sm">
          User ID: {userId} | Role: {role}
        </div>

        {/* Filters Section */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          
          <div className="flex flex-wrap gap-4 items-end">
            {/* Month & Year - Required */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Month *</label>
              <select
                className="border border-gray-300 rounded px-3 py-2 min-w-[150px]"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="">Select Month</option>
                {months.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Year *</label>
              <select
                className="border border-gray-300 rounded px-3 py-2 min-w-[120px]"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">Select Year</option>
                {years.map(y => (
                  <option key={y} value={y.toString()}>{y}</option>
                ))}
              </select>
            </div>

            {/* Village - Optional */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Village</label>
              <select
                className="border border-gray-300 rounded px-3 py-2 min-w-[150px]"
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                disabled={villages.length === 0}
              >
                <option value="">All Villages</option>
                {villages.map(village => (
                  <option key={village.VillageId} value={village.VillageName}>
                    {village.VillageName}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Status Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Payment Status</label>
              <select
                className="border border-gray-300 rounded px-3 py-2 min-w-[150px]"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="paid">Fully Paid</option>
                <option value="partial">Partially Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                placeholder="Name or Village"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 min-w-[200px]"
              />
            </div>

            {/* Action Buttons */}
            <button 
              className="bg-gray-500 text-white px-4 py-2 rounded font-medium hover:bg-gray-600"
              onClick={handleClearFilters}
              disabled={loading}
            >
              Clear All
            </button>

            <button 
              className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 disabled:bg-gray-400"
              onClick={handleExportCSV}
              disabled={loading || filteredData.length === 0}
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Info Message */}
        {selectedMonth && selectedYear && filteredData.length > 0 && (
          <div className="bg-blue-100 text-blue-700 p-3 rounded">
            ℹ️ Showing {filteredData.length} records for {selectedMonth} {selectedYear}
            {selectedVillage && ` in ${selectedVillage}`}
            {paymentFilter !== "all" && ` (${paymentFilter} only)`}.
          </div>
        )}

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div className="bg-white border rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Total Base Fee</p>
            <p className="text-xl font-semibold text-blue-600">₹{analytics.totalBaseFee.toLocaleString()}</p>
          </div>
          
          <div className="bg-white border rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Previous Balance</p>
            <p className="text-xl font-semibold text-purple-600">₹{analytics.totalPreviousBalance.toLocaleString()}</p>
          </div>

          <div className="bg-white border rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Total Outstanding</p>
            <p className="text-xl font-semibold text-orange-600">₹{analytics.totalOutstanding.toLocaleString()}</p>
          </div>

          <div className="bg-white border rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Total Collected</p>
            <p className="text-xl font-semibold text-green-600">₹{analytics.totalCollected.toLocaleString()}</p>
          </div>

          <div className="bg-white border rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Balance Amount</p>
            <p className="text-xl font-semibold text-red-600">₹{analytics.totalBalance.toLocaleString()}</p>
          </div>

          <div className="bg-white border rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Total Beneficiaries</p>
            <p className="text-xl font-semibold text-indigo-600">{analytics.totalBeneficiaries}</p>
          </div>

          <div className="bg-white border rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Villages Covered</p>
            <p className="text-xl font-semibold text-pink-600">{analytics.totalVillages}</p>
          </div>

          <div className="bg-white border rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Paid Beneficiaries</p>
            <p className="text-xl font-semibold text-green-600">{analytics.paidBeneficiaries}</p>
          </div>

          <div className="bg-white border rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Unpaid Beneficiaries</p>
            <p className="text-xl font-semibold text-red-600">{analytics.unpaidBeneficiaries}</p>
          </div>

          <div className="bg-white border rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Collection Rate</p>
            <p className="text-xl font-semibold text-teal-600">
              {analytics.totalOutstanding > 0 
                ? Math.round((analytics.totalCollected / analytics.totalOutstanding) * 100)
                : 0}%
            </p>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 border text-center">S.No.</th>
                <th className="px-4 py-3 border text-left">Village</th>
                <th className="px-4 py-3 border text-left">Beneficiary</th>
                <th className="px-4 py-3 border text-left">Father/Husband</th>
                <th className="px-4 py-3 border text-right">Base Fee (₹)</th>
                <th className="px-4 py-3 border text-right">Prev. Balance (₹)</th>
                <th className="px-4 py-3 border text-right">Total Outstanding (₹)</th>
                <th className="px-4 py-3 border text-right">Paid Amount (₹)</th>
                <th className="px-4 py-3 border text-right">Current Balance  (₹)</th>
                <th className="px-4 py-3 border text-center">Payment Date</th>
                <th className="px-4 py-3 border text-center">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={`${item.FeeCollectionId}-${item.BeneficiaryId}`} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border text-center">{index + 1}</td>
                    <td className="px-4 py-2 border">{item.VillageName}</td>
                    <td className="px-4 py-2 border font-medium">{item.BeneficiaryName}</td>
                    <td className="px-4 py-2 border">{item.FatherHusbandName || "N/A"}</td>
                    <td className="px-4 py-2 border text-right">{item.BaseFee.toLocaleString()}</td>
                    <td className="px-4 py-2 border text-right">{item.PreviousBalance.toLocaleString()}</td>
                    <td className="px-4 py-2 border text-right font-semibold">
                      {(item.BaseFee + item.PreviousBalance).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border text-right text-green-600 font-medium">
                      {item.PaidAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border text-right text-red-600 font-medium">
                      {item.BalanceAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border text-center text-sm">
                      {item.Date ? new Date(item.Date).toLocaleDateString('en-IN') : "-"}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {getPaymentStatus(item)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-gray-500">
                    {loading ? "Loading..." :
                     !selectedMonth || !selectedYear ? "Please select month and year to view fee data." :
                     "No records found for the selected criteria."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        {filteredData.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h3 className="font-semibold mb-3">Summary Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Avg Collection/Beneficiary</p>
                <p className="text-lg font-semibold">
                  ₹{analytics.totalBeneficiaries > 0 
                    ? Math.round(analytics.totalCollected / analytics.totalBeneficiaries).toLocaleString()
                    : 0}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Avg Outstanding/Beneficiary</p>
                <p className="text-lg font-semibold">
                  ₹{analytics.totalBeneficiaries > 0 
                    ? Math.round(analytics.totalBalance / analytics.totalBeneficiaries).toLocaleString()
                    : 0}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Payment Completion</p>
                <p className="text-lg font-semibold">
                  {analytics.totalBeneficiaries > 0
                    ? Math.round((analytics.paidBeneficiaries / analytics.totalBeneficiaries) * 100)
                    : 0}%
                </p>
              </div>
              <div>
                <p className="text-gray-600">Avg Fee per Village</p>
                <p className="text-lg font-semibold">
                  ₹{analytics.totalVillages > 0 
                    ? Math.round(analytics.totalCollected / analytics.totalVillages).toLocaleString()
                    : 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeManagementPage;