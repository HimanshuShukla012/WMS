import React, { useState, useEffect } from "react";
import { useUserInfo } from '../utils/userInfo';

// ---------- Types ----------
type District = {
  DistrictId: number;
  DistrictName: string;
};

type Block = {
  BlockId: number;
  BlockName: string;
  Id: number;
  DistrictId: number;
};

type GramPanchayat = {
  Id: number;
  GramPanchayatName: string;
  BlockId: number;
};

type Village = {
  Id: number;
  GramPanchayatId: number;
  VillageName: string;
  VillageNameHindi: string;
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
  BalanceAmount: number; // This will be calculated as OutstandingAmount - PaidAmount
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
  const { userId, userRole } = useUserInfo(); // Assuming userRole is available

  // ---------- State ----------
  const [districts, setDistricts] = useState<District[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayat[]>([]);
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
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedBlock, setSelectedBlock] = useState<string>("");
  const [selectedGramPanchayat, setSelectedGramPanchayat] = useState<string>("");
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

  // ---------- Helper Functions ----------
  const calculateBalanceAmount = (outstandingAmount: number, paidAmount: number): number => {
    return outstandingAmount - paidAmount;
  };

  const processDataWithCalculatedBalance = (data: FeeCollectionData[]): FeeCollectionData[] => {
    return data.map(item => ({
      ...item,
      BalanceAmount: calculateBalanceAmount(item.OutstandingAmount, item.PaidAmount)
    }));
  };

  const isAdminOrDirector = (): boolean => {
    return userRole === 'Admin' || userRole === 'Director';
  };

  const isNotGPUser = (): boolean => {
    return userRole !== 'GP' && userRole !== 'gp' && userRole !== 'Gp';
  };

  // ---------- API Functions ----------
  const fetchDistricts = async () => {
    try {
      const response = await fetch(
        `https://wmsapi.kdsgroup.co.in/api/Master/GetDistrict?UserId=${userId}`,
        {
          method: 'POST',
          headers: { 'accept': '*/*' }
        }
      );
      const result = await response.json();
      
      if (result.Status && result.Data) {
        setDistricts(result.Data);
      } else {
        setError("Failed to fetch districts");
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
      setError("Error loading districts");
    }
  };

  const fetchBlocks = async (districtId: number) => {
    try {
      const response = await fetch(
        `https://wmsapi.kdsgroup.co.in/api/Master/GetAllBlocks?DistrictId=${districtId}`,
        {
          method: 'POST',
          headers: { 'accept': '*/*' }
        }
      );
      const result = await response.json();
      
      if (result.Status && result.Data) {
        setBlocks(result.Data);
      } else {
        setBlocks([]);
        setError("Failed to fetch blocks");
      }
    } catch (error) {
      console.error('Error fetching blocks:', error);
      setBlocks([]);
      setError("Error loading blocks");
    }
  };

  const fetchGramPanchayats = async (blockId: number) => {
    try {
      const response = await fetch(
        `https://wmsapi.kdsgroup.co.in/api/Master/GetAllGramPanchayat?BlockId=${blockId}`,
        {
          method: 'POST',
          headers: { 'accept': '*/*' }
        }
      );
      const result = await response.json();
      
      if (result.Status && result.Data) {
        setGramPanchayats(result.Data);
      } else {
        setGramPanchayats([]);
        setError("Failed to fetch gram panchayats");
      }
    } catch (error) {
      console.error('Error fetching gram panchayats:', error);
      setGramPanchayats([]);
      setError("Error loading gram panchayats");
    }
  };

  const fetchVillages = async (blockId: number, gramPanchayatId: number) => {
    try {
      const response = await fetch(
        'https://wmsapi.kdsgroup.co.in/api/Master/GetVillegeByGramPanchayat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': '*/*'
          },
          body: JSON.stringify({
            BlockId: blockId,
            GramPanchayatId: gramPanchayatId
          })
        }
      );
      const result = await response.json();
      
      if (result.Status && result.Data) {
        setVillages(result.Data);
      } else {
        setVillages([]);
        setError("Failed to fetch villages");
      }
    } catch (error) {
      console.error('Error fetching villages:', error);
      setVillages([]);
      setError("Error loading villages");
    }
  };

  // Original village fetch for non-admin/director users
  const fetchVillagesByUserId = async () => {
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
        // Convert to match the new Village type structure
        const convertedVillages = result.Data.map((village: any) => ({
          Id: village.VillageId,
          GramPanchayatId: 0, // Not available in this API
          VillageName: village.VillageName,
          VillageNameHindi: ""
        }));
        setVillages(convertedVillages);
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
            Year: year,
            p_user_id: userId
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
    if (!selectedYear) return;

    // For non-GP users, ensure proper hierarchy is selected
    if (isNotGPUser() && (!selectedVillage || !selectedMonth)) {
      setError("Please select a village and month to view fee collection data.");
      return;
    }

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

      // Remove duplicates based on FeeCollectionId
      const uniqueData = allData.filter((item, index, self) => 
        index === self.findIndex(t => t.FeeCollectionId === item.FeeCollectionId)
      );

      // Process data with calculated balance amounts
      const processedData = processDataWithCalculatedBalance(uniqueData);

      setFeeData(processedData);
      setFilteredData(processedData);
      calculateAnalytics(processedData);

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
    // Calculate total balance as sum of calculated balance amounts
    const totalBalance = data.reduce((sum, item) => sum + calculateBalanceAmount(item.OutstandingAmount, item.PaidAmount), 0);
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
      if (isNotGPUser()) {
        fetchDistricts();
      } else {
        fetchVillagesByUserId();
      }
    } 
  }, [userId, userRole]);

  // Handle district selection - reset all subsequent selections
  useEffect(() => {
    if (selectedDistrict && isNotGPUser()) {
      fetchBlocks(parseInt(selectedDistrict));
      // Clear all subsequent selections
      setSelectedBlock("");
      setSelectedGramPanchayat("");
      setSelectedVillage("");
      // Clear subsequent data
      setBlocks([]);
      setGramPanchayats([]);
      setVillages([]);
      // Clear fee data when hierarchy changes
      setFeeData([]);
      setFilteredData([]);
      setAnalytics({
        totalCollected: 0,
        totalOutstanding: 0,
        totalBalance: 0,
        totalBeneficiaries: 0,
        totalVillages: 0
      });
    }
  }, [selectedDistrict]);

  // Handle block selection - reset subsequent selections
  useEffect(() => {
    if (selectedBlock && isNotGPUser()) {
      fetchGramPanchayats(parseInt(selectedBlock));
      // Clear subsequent selections
      setSelectedGramPanchayat("");
      setSelectedVillage("");
      // Clear subsequent data
      setGramPanchayats([]);
      setVillages([]);
      // Clear fee data when hierarchy changes
      setFeeData([]);
      setFilteredData([]);
      setAnalytics({
        totalCollected: 0,
        totalOutstanding: 0,
        totalBalance: 0,
        totalBeneficiaries: 0,
        totalVillages: 0
      });
    }
  }, [selectedBlock]);

  // Handle gram panchayat selection - reset village selection
  useEffect(() => {
    if (selectedGramPanchayat && selectedBlock && isNotGPUser()) {
      fetchVillages(parseInt(selectedBlock), parseInt(selectedGramPanchayat));
      // Clear village selection
      setSelectedVillage("");
      // Clear villages data temporarily
      setVillages([]);
      // Clear fee data when hierarchy changes
      setFeeData([]);
      setFilteredData([]);
      setAnalytics({
        totalCollected: 0,
        totalOutstanding: 0,
        totalBalance: 0,
        totalBeneficiaries: 0,
        totalVillages: 0
      });
    }
  }, [selectedGramPanchayat, selectedBlock]);

  // Fetch fee data when all required selections are made
  useEffect(() => {
    if (selectedYear && selectedVillage && selectedMonth) {
      fetchAllFeeData();
    }
  }, [selectedYear, selectedVillage, selectedMonth]);

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
    if (!selectedYear) {
      setError("Please select a financial year");
      return;
    }
    
    if (isNotGPUser()) {
      if (!selectedDistrict) {
        setError("Please select a district");
        return;
      }
      if (!selectedBlock) {
        setError("Please select a block");
        return;
      }
      if (!selectedGramPanchayat) {
        setError("Please select a gram panchayat");
        return;
      }
      if (!selectedVillage) {
        setError("Please select a village");
        return;
      }
      if (!selectedMonth) {
        setError("Please select a month");
        return;
      }
    }
    
    fetchAllFeeData();
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
      "Balance Amount (Calculated)"
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
        calculateBalanceAmount(row.OutstandingAmount, row.PaidAmount)
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
    if (isNotGPUser()) {
      setSelectedDistrict("");
      setSelectedBlock("");
      setSelectedGramPanchayat("");
      setSelectedVillage("");
      setBlocks([]);
      setGramPanchayats([]);
      setVillages([]);
    } else {
      setSelectedVillage("");
    }
    setSelectedMonth("");
    setSelectedYear("");
    setSearchQuery("");
    setFeeData([]);
    setFilteredData([]);
    setAnalytics({
      totalCollected: 0,
      totalOutstanding: 0,
      totalBalance: 0,
      totalBeneficiaries: 0,
      totalVillages: 0
    });
    setError("");
  };

  // ---------- Render ----------
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

          {/* Hierarchical filters for all users except GP */}
          {isNotGPUser() && (
            <>
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">District *</label>
                <select
                  className="border border-gray-300 rounded px-3 py-2 min-w-[150px]"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select District</option>
                  {districts.map(district => (
                    <option key={district.DistrictId} value={district.DistrictId.toString()}>
                      {district.DistrictName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Block *</label>
                <select
                  className="border border-gray-300 rounded px-3 py-2 min-w-[150px]"
                  value={selectedBlock}
                  onChange={(e) => setSelectedBlock(e.target.value)}
                  disabled={loading || !selectedDistrict}
                >
                  <option value="">
                    {!selectedDistrict ? "Select District First" : "Select Block"}
                  </option>
                  {blocks.map(block => (
                    <option key={block.BlockId} value={block.BlockId.toString()}>
                      {block.BlockName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Gram Panchayat *</label>
                <select
                  className="border border-gray-300 rounded px-3 py-2 min-w-[150px]"
                  value={selectedGramPanchayat}
                  onChange={(e) => setSelectedGramPanchayat(e.target.value)}
                  disabled={loading || !selectedBlock}
                >
                  <option value="">
                    {!selectedBlock ? "Select Block First" : "Select Gram Panchayat"}
                  </option>
                  {gramPanchayats.map(gp => (
                    <option key={gp.Id} value={gp.Id.toString()}>
                      {gp.GramPanchayatName}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Village {isNotGPUser() ? "*" : ""}
            </label>
            <select
              className="border border-gray-300 rounded px-3 py-2 min-w-[150px]"
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              disabled={loading || (isNotGPUser() && !selectedGramPanchayat)}
            >
              <option value="">
                {isNotGPUser() 
                  ? (!selectedGramPanchayat ? "Select Gram Panchayat First" : "Select Village")
                  : "All Villages"
                }
              </option>
              {villages.map(village => (
                <option key={village.Id} value={village.Id.toString()}>
                  {village.VillageName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Month {isNotGPUser() ? "*" : ""}
            </label>
            <select
              className="border border-gray-300 rounded px-3 py-2 min-w-[120px]"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              disabled={isNotGPUser() && !selectedVillage}
            >
              <option value="">
                {isNotGPUser() && !selectedVillage ? "Select Village First" : "All Months"}
              </option>
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
            disabled={loading || !selectedYear || (isNotGPUser() && (!selectedDistrict || !selectedBlock || !selectedGramPanchayat || !selectedVillage || !selectedMonth))}
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

        {/* Hierarchy Status Indicator for non-GP users */}
        {isNotGPUser() && (
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h3 className="text-sm font-medium mb-2">Selection Status:</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className={`px-2 py-1 rounded ${selectedDistrict ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                District: {selectedDistrict ? districts.find(d => d.DistrictId.toString() === selectedDistrict)?.DistrictName : 'Not Selected'}
              </span>
              <span className={`px-2 py-1 rounded ${selectedBlock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                Block: {selectedBlock ? blocks.find(b => b.BlockId.toString() === selectedBlock)?.BlockName : 'Not Selected'}
              </span>
              <span className={`px-2 py-1 rounded ${selectedGramPanchayat ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                Gram Panchayat: {selectedGramPanchayat ? gramPanchayats.find(gp => gp.Id.toString() === selectedGramPanchayat)?.GramPanchayatName : 'Not Selected'}
              </span>
              <span className={`px-2 py-1 rounded ${selectedVillage ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                Village: {selectedVillage ? villages.find(v => v.Id.toString() === selectedVillage)?.VillageName : 'Not Selected'}
              </span>
            </div>
          </div>
        )}

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white border rounded shadow p-4">
            <p className="text-gray-600 text-sm">Total Outstanding</p>
            <p className="text-xl font-semibold text-orange-600">₹{analytics.totalOutstanding.toLocaleString()}</p>
          </div>
          <div className="bg-white border rounded shadow p-4">
            <p className="text-gray-600 text-sm">Total Collected</p>
            <p className="text-xl font-semibold text-green-600">₹{analytics.totalCollected.toLocaleString()}</p>
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
            {selectedVillage && ` from ${villages.find(v => v.Id.toString() === selectedVillage)?.VillageName}`}
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 shadow-md rounded-xl overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                  <th className="border px-4 py-3 text-center">S.No.</th>
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
                    <td className="border px-4 py-2 text-center">{index + 1}</td>
                    <td className="border px-4 py-2 text-center">{entry.FeeCollectionId}</td>
                    <td className="border px-4 py-2">{entry.VillageName}</td>
                    <td className="border px-4 py-2 font-medium">{entry.BeneficiaryName}</td>
                    <td className="border px-4 py-2">{entry.FatherHusbandName || "N/A"}</td>
                    <td className="border px-4 py-2 text-right">{entry.BaseFee.toLocaleString()}</td>
                    <td className="border px-4 py-2 text-right">{entry.PreviousBalance.toLocaleString()}</td>
                    <td className="border px-4 py-2 text-right text-orange-600 font-medium">{entry.OutstandingAmount.toLocaleString()}</td>
                    <td className="border px-4 py-2 text-right text-green-600 font-medium">{entry.PaidAmount.toLocaleString()}</td>
                    <td className="border px-4 py-2 text-right text-red-600 font-medium">
                      {calculateBalanceAmount(entry.OutstandingAmount, entry.PaidAmount).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-gray-500">
                    {loading ? "Loading..." : 
                     !selectedYear ? "Please select a financial year to view fee collection data." :
                     isNotGPUser() && (!selectedDistrict || !selectedBlock || !selectedGramPanchayat || !selectedVillage || !selectedMonth) 
                       ? "Please complete the hierarchy selection (District → Block → Gram Panchayat → Village) and select a month to view data." :
                     "No fee collection records found for the selected criteria."}
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
                    ? Math.round((analytics.totalCollected / (analytics.totalOutstanding)) * 100)
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