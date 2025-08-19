import React, { useState, useEffect } from "react";
import { useUserInfo } from '../utils/userInfo';

// ---------- Types ----------
type Village = {
  VillageId: number;
  VillageName: string;
};

type FeeCollectionData = {
  FeeCollectionId: number;
  BeneficiaryId: number;
  BeneficiaryName: string;
  FatherHusbandName: string;
  VillageId: number;
  VillageName: string;
  BaseFee: number;
  PreviousBalance: number;
  OutstandingAmount: number;
  PaidAmount: number;
  BalanceAmount: number;
};

type AnalyticsSummary = {
  totalCollected: number;
  totalOutstanding: number;
  totalBalance: number;
  totalBeneficiaries: number;
  totalVillages: number;
};

// ---------- Component ----------
const FeeManagementPage: React.FC = () => {
  const { userId } = useUserInfo();

  // ---------- State ----------
  const [villages, setVillages] = useState<Village[]>([]);
  const [feeData, setFeeData] = useState<FeeCollectionData[]>([]);
  const [filteredData, setFilteredData] = useState<FeeCollectionData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalCollected: 0,
    totalOutstanding: 0,
    totalBalance: 0,
    totalBeneficiaries: 0,
    totalVillages: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Filter states
  const [selectedVillage, setSelectedVillage] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Financial year options
  const [financialYears] = useState(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 1; i++) {
      years.push({
        value: i.toString(),
        label: `FY ${i}-${(i + 1).toString().slice(-2)}`
      });
    }
    return years;
  });

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];

  // ---------- API Functions ----------
  const fetchVillages = async () => {
    if (!userId) {
      setError("User ID not found");
      return;
    }

    try {
      const response = await fetch(
        `https://wmsapi.kdsgroup.co.in/api/Master/GetVillageListByUserId?UserId=${userId}`,
        {
          method: 'GET',
          headers: { 'accept': '*/*' }
        }
      );
      const result = await response.json();
      
      if (result.Status && result.Data) {
        setVillages(result.Data);
      } else {
        setError("Failed to fetch villages");
      }
    } catch (error) {
      console.error('Error fetching villages:', error);
      setError("Error loading villages");
    }
  };

  const fetchFeeCollectionData = async (villageId: number, month: number, year: number) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        'https://wmsapi.kdsgroup.co.in/api/Master/GetFeeCollectionDetails',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': '*/*'
          },
          body: JSON.stringify({
            VillageId: villageId,
            Month: month,
            Year: year
          })
        }
      );

      const result = await response.json();
      
      if (result.Status && result.Data) {
        return result.Data;
      } else {
        console.warn(`No data found for Village: ${villageId}, Month: ${month}, Year: ${year}`);
        return [];
      }
    } catch (error) {
      console.error('Error fetching fee collection data:', error);
      throw error;
    }
  };

  const fetchAllFeeData = async () => {
    if (!selectedYear || villages.length === 0) return;

    setLoading(true);
    setError("");
    
    try {
      let allData: FeeCollectionData[] = [];
      
      // If specific village and month selected
      if (selectedVillage && selectedMonth) {
        const villageId = parseInt(selectedVillage);
        const month = parseInt(selectedMonth);
        const year = parseInt(selectedYear);
        
        const data = await fetchFeeCollectionData(villageId, month, year);
        allData = data;
      }
      // If only village selected, fetch all months
      else if (selectedVillage) {
        const villageId = parseInt(selectedVillage);
        const year = parseInt(selectedYear);
        
        for (let month = 1; month <= 12; month++) {
          try {
            const data = await fetchFeeCollectionData(villageId, month, year);
            allData = [...allData, ...data];
          } catch (error) {
            console.warn(`Failed to fetch data for month ${month}`);
          }
        }
      }
      // If no specific village selected, fetch for all villages and all months
      else {
        const year = parseInt(selectedYear);
        
        for (const village of villages) {
          for (let month = 1; month <= 12; month++) {
            try {
              const data = await fetchFeeCollectionData(village.VillageId, month, year);
              allData = [...allData, ...data];
            } catch (error) {
              console.warn(`Failed to fetch data for village ${village.VillageId}, month ${month}`);
            }
          }
        }
      }

      // Remove duplicates based on FeeCollectionId
      const uniqueData = allData.filter((item, index, self) => 
        index === self.findIndex(t => t.FeeCollectionId === item.FeeCollectionId)
      );

      setFeeData(uniqueData);
      setFilteredData(uniqueData);
      calculateAnalytics(uniqueData);

    } catch (error) {
      setError("Error loading fee collection data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (data: FeeCollectionData[]) => {
    const totalCollected = data.reduce((sum, item) => sum + item.PaidAmount, 0);
    const totalOutstanding = data.reduce((sum, item) => sum + item.OutstandingAmount, 0);
    const totalBalance = data.reduce((sum, item) => sum + item.BalanceAmount, 0);
    const totalBeneficiaries = new Set(data.map(item => item.BeneficiaryId)).size;
    const totalVillages = new Set(data.map(item => item.VillageId)).size;

    setAnalytics({
      totalCollected,
      totalOutstanding,
      totalBalance,
      totalBeneficiaries,
      totalVillages
    });
  };

  // ---------- Effects ----------
  useEffect(() => {
    if (userId) {
      fetchVillages();
    } else {
      setError("User ID not found");
    }
  }, [userId]);

  useEffect(() => {
    if (selectedYear) {
      fetchAllFeeData();
    }
  }, [selectedYear, selectedVillage, selectedMonth, villages]);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredData(feeData);
      calculateAnalytics(feeData);
    } else {
      const filtered = feeData.filter(item =>
        item.BeneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.VillageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.FatherHusbandName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
      calculateAnalytics(filtered);
    }
  }, [searchQuery, feeData]);

  // ---------- Handlers ----------
  const handleApplyFilters = () => {
    if (selectedYear) {
      fetchAllFeeData();
    } else {
      setError("Please select a financial year");
    }
  };

  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = [
      "Fee Collection ID",
      "Village",
      "Beneficiary Name",
      "Father/Husband Name",
      "Base Fee",
      "Previous Balance",
      "Outstanding Amount",
      "Paid Amount",
      "Balance Amount"
    ];

    const csvContent = [
      headers.join(","),
      ...filteredData.map(row => [
        row.FeeCollectionId,
        `"${row.VillageName}"`,
        `"${row.BeneficiaryName}"`,
        `"${row.FatherHusbandName || 'N/A'}"`,
        row.BaseFee,
        row.PreviousBalance,
        row.OutstandingAmount,
        row.PaidAmount,
        row.BalanceAmount
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `fee_collection_report_${selectedYear || 'all'}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearFilters = () => {
    setSelectedVillage("");
    setSelectedMonth("");
    setSearchQuery("");
    setFilteredData(feeData);
    calculateAnalytics(feeData);
  };

  // ---------- Render ----------
  if (!userId) {
    return (
      <div className="p-6 relative z-10">
        <div className="bg-red-100 text-red-700 p-3 rounded">
          User ID not found. Please login again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 relative z-10">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Fee Management Page</h1>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded">
            {error}
          </div>
        )}

        {/* Loading Display */}
        {loading && (
          <div className="bg-blue-100 text-blue-700 p-3 rounded">
            Loading fee collection data...
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Financial Year *</label>
            <select
              className="border border-gray-300 rounded px-3 py-2 min-w-[150px]"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">Select Financial Year</option>
              {financialYears.map(fy => (
                <option key={fy.value} value={fy.value}>
                  {fy.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Village</label>
            <select
              className="border border-gray-300 rounded px-3 py-2 min-w-[150px]"
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              disabled={loading}
            >
              <option value="">All Villages</option>
              {villages.map(village => (
                <option key={village.VillageId} value={village.VillageId.toString()}>
                  {village.VillageName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Month</label>
            <select
              className="border border-gray-300 rounded px-3 py-2 min-w-[120px]"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">All Months</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by name or village"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 min-w-[200px]"
            />
          </div>

          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400"
            onClick={handleApplyFilters}
            disabled={loading || !selectedYear}
          >
            Apply Filters
          </button>

          <button 
            className="bg-gray-500 text-white px-4 py-2 rounded font-medium hover:bg-gray-600"
            onClick={handleClearFilters}
            disabled={loading}
          >
            Clear Filters
          </button>

          <button 
            className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 disabled:bg-gray-400"
            onClick={handleExportCSV}
            disabled={loading || filteredData.length === 0}
          >
            Export as CSV
          </button>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white border rounded shadow p-4">
            <p className="text-gray-600 text-sm">Total Collected</p>
            <p className="text-xl font-semibold text-green-600">₹{analytics.totalCollected.toLocaleString()}</p>
          </div>
          <div className="bg-white border rounded shadow p-4">
            <p className="text-gray-600 text-sm">Total Outstanding</p>
            <p className="text-xl font-semibold text-orange-600">₹{analytics.totalOutstanding.toLocaleString()}</p>
          </div>
          <div className="bg-white border rounded shadow p-4">
            <p className="text-gray-600 text-sm">Balance Amount</p>
            <p className="text-xl font-semibold text-red-600">₹{analytics.totalBalance.toLocaleString()}</p>
          </div>
          <div className="bg-white border rounded shadow p-4">
            <p className="text-gray-600 text-sm">Total Beneficiaries</p>
            <p className="text-xl font-semibold text-blue-600">{analytics.totalBeneficiaries}</p>
          </div>
          <div className="bg-white border rounded shadow p-4">
            <p className="text-gray-600 text-sm">Villages Covered</p>
            <p className="text-xl font-semibold text-purple-600">{analytics.totalVillages}</p>
          </div>
        </div>

        {/* Data Info */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredData.length} records
            {selectedYear && ` for FY ${selectedYear}-${(parseInt(selectedYear) + 1).toString().slice(-2)}`}
            {selectedVillage && ` from ${villages.find(v => v.VillageId.toString() === selectedVillage)?.VillageName}`}
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 shadow-md rounded-xl overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="border px-4 py-3 text-left">Fee Collection ID</th>
                <th className="border px-4 py-3 text-left">Village</th>
                <th className="border px-4 py-3 text-left">Beneficiary Name</th>
                <th className="border px-4 py-3 text-left">Father/Husband Name</th>
                <th className="border px-4 py-3 text-right">Base Fee (₹)</th>
                <th className="border px-4 py-3 text-right">Previous Balance (₹)</th>
                <th className="border px-4 py-3 text-right">Cumulative Payable Amount (₹)</th>
                <th className="border px-4 py-3 text-right">Cumulative Paid Amount (₹)</th>
                <th className="border px-4 py-3 text-right">Cumulative Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredData.length > 0 ? (
                filteredData.map((entry, index) => (
                  <tr key={`${entry.FeeCollectionId}-${entry.BeneficiaryId}`} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="border px-4 py-2 text-center">{entry.FeeCollectionId}</td>
                    <td className="border px-4 py-2">{entry.VillageName}</td>
                    <td className="border px-4 py-2 font-medium">{entry.BeneficiaryName}</td>
                    <td className="border px-4 py-2">{entry.FatherHusbandName || "N/A"}</td>
                    <td className="border px-4 py-2 text-right">{entry.BaseFee.toLocaleString()}</td>
                    <td className="border px-4 py-2 text-right">{entry.PreviousBalance.toLocaleString()}</td>
                    <td className="border px-4 py-2 text-right text-orange-600 font-medium">{entry.OutstandingAmount.toLocaleString()}</td>
                    <td className="border px-4 py-2 text-right text-green-600 font-medium">{entry.PaidAmount.toLocaleString()}</td>
                    <td className="border px-4 py-2 text-right text-red-600 font-medium">{entry.BalanceAmount.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">
                    {loading ? "Loading..." : 
                     selectedYear ? "No fee collection records found for the selected criteria." : 
                     "Please select a financial year to view fee collection data."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        {filteredData.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Collection Efficiency</p>
                <p className="text-lg font-semibold">
                  {analytics.totalOutstanding + analytics.totalCollected > 0 
                    ? Math.round((analytics.totalCollected / (analytics.totalOutstanding + analytics.totalCollected)) * 100)
                    : 0}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Collection per Beneficiary</p>
                <p className="text-lg font-semibold">
                  ₹{analytics.totalBeneficiaries > 0 
                    ? Math.round(analytics.totalCollected / analytics.totalBeneficiaries).toLocaleString()
                    : 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Outstanding per Beneficiary</p>
                <p className="text-lg font-semibold">
                  ₹{analytics.totalBeneficiaries > 0 
                    ? Math.round(analytics.totalBalance / analytics.totalBeneficiaries).toLocaleString()
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