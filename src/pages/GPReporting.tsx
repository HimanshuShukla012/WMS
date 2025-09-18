import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useUserInfo } from "../utils/userInfo";

// Simple Icons using Unicode symbols
const Icons = {
  Search: () => <span className="text-lg">🔍</span>,
  Download: () => <span className="text-lg">📥</span>,
  Filter: () => <span className="text-lg">🔍</span>,
  Calendar: () => <span className="text-lg">📅</span>,
  Refresh: () => <span className="text-lg">🔄</span>,
  Left: () => <span className="text-lg">←</span>,
  Right: () => <span className="text-lg">→</span>,
  Report: () => <span className="text-lg">📋</span>,
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-slate-600"></div>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
    <div className="text-red-800 font-medium mb-2">Error Loading Data</div>
    <div className="text-red-600 text-sm mb-3">{message}</div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);

// Enhanced API call function
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);
    throw error;
  }
};

// Download CSV function with data processing capability
const downloadCSV = (data, filename, processRowData = null) => {
  if (!data || data.length === 0) {
    alert("No data available to download");
    return;
  }

  try {
    // Process data if a processing function is provided
    const processedData = processRowData ? data.map(processRowData) : data;

    const headers = Object.keys(processedData[0]);
    const csvContent = [
      headers.join(","),
      ...processedData.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            const stringValue = value === null || value === undefined ? "" : String(value);
            return `"${stringValue.replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating CSV:", error);
    alert("Error generating CSV file. Please try again.");
  }
};

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems }) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      <div className="text-sm text-gray-700">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icons.Left /> Previous
        </button>
        <span className="px-3 py-2 text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next <Icons.Right />
        </button>
      </div>
    </div>
  );
};

// Table component with search and pagination
const DataTable = ({
  title,
  data,
  columns,
  isLoading,
  error,
  onRetry,
  downloadFilename,
  searchable = true,
  showDateFilter = false,
  onDateChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (!searchTerm) return data;

    return data.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleDownload = () => {
    if (!data || data.length === 0) return;
    const timestamp = new Date().toISOString().split("T")[0];

    // Special processing for fee collection data to calculate correct balance
    const processRowData = downloadFilename.includes("fee_collection")
      ? (row) => ({
          ...row,
          BalanceAmount: (row.OutstandingAmount || 0) - (row.PaidAmount || 0),
        })
      : null;

    downloadCSV(data, `${downloadFilename}_${timestamp}.csv`, processRowData);
  };

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={onRetry} />;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <div className="flex items-center gap-3">
            {showDateFilter && onDateChange && (
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <Icons.Calendar />
                <select
                  onChange={(e) => onDateChange("month", parseInt(e.target.value))}
                  className="bg-transparent border-none outline-none text-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("default", { month: "long" })}
                    </option>
                  ))}
                </select>
                <select
                  onChange={(e) => onDateChange("year", parseInt(e.target.value))}
                  className="bg-transparent border-none outline-none text-sm"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
            {searchable && (
              <div className="relative">
                <Icons.Search />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <button
              onClick={handleDownload}
              disabled={!data || data.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <Icons.Download />
              Download CSV
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(item[column.key], item) : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredData.length}
        />
      )}
    </div>
  );
};

export default function MISTabularReportingDashboard() {
  const { userId, role, isLoading: userLoading } = useUserInfo();
  const abortControllerRef = useRef(null);

  // Data States
  const [pumpHouses, setPumpHouses] = useState([]);
  const [ohtData, setOHTData] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [feeData, setFeeData] = useState([]);
  const [villages, setVillages] = useState([]);
  const [roasterData, setRoasterData] = useState([]);
  const [topDistrictsByFee, setTopDistrictsByFee] = useState([]);
  const [bottomDistrictsByFee, setBottomDistrictsByFee] = useState([]);
  const [topDistrictsByComplaint, setTopDistrictsByComplaint] = useState([]);
  const [bottomDistrictsByComplaint, setBottomDistrictsByComplaint] = useState([]);

  // Date Controls
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Loading and Error States
  const [loading, setLoading] = useState({
    pumps: true,
    ohts: true,
    complaints: true,
    fees: true,
    villages: true,
    roaster: true,
    districts: true,
  });

  const [errors, setErrors] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to determine if user is admin
  const isAdmin = useCallback(() => {
    return role?.toLowerCase() === "admin" || role?.toLowerCase() === "administrator";
  }, [role]);

  // API Functions
  const fetchPumpHouses = useCallback(async (currentUserId) => {
    setLoading((prev) => ({ ...prev, pumps: true }));
    try {
      const signal = abortControllerRef.current?.signal;
      const data = await apiCall(
        `https://wmsapi.kdsgroup.co.in/api/Master/GetPumpHouseListByUserId?UserId=${currentUserId}`,
        { signal }
      );

      if (data.Status && Array.isArray(data.Data)) {
        setPumpHouses(data.Data);
      }
      setErrors((prev) => ({ ...prev, pumps: null }));
    } catch (error) {
      console.error("Error fetching pump houses:", error);
      setErrors((prev) => ({ ...prev, pumps: error.message }));
    } finally {
      setLoading((prev) => ({ ...prev, pumps: false }));
    }
  }, []);

  const fetchComplaints = useCallback(async (currentUserId) => {
    setLoading((prev) => ({ ...prev, complaints: true }));
    try {
      const signal = abortControllerRef.current?.signal;
      const data = await apiCall(
        "https://wmsapi.kdsgroup.co.in/api/Complain/GetComplaintListByUserIdVillageAndStatus",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            UserId: isAdmin() ? 0 : currentUserId || 0,
            VillageId: 0,
            Status: null,
          }),
          signal,
        }
      );

      if (data.Status && Array.isArray(data.Data)) {
        setComplaints(data.Data);
      }
      setErrors((prev) => ({ ...prev, complaints: null }));
    } catch (error) {
      console.error("Error fetching complaints:", error);
      setErrors((prev) => ({ ...prev, complaints: error.message }));
    } finally {
      setLoading((prev) => ({ ...prev, complaints: false }));
    }
  }, [isAdmin]);

  const fetchFeeCollectionData = useCallback(async (month, year) => {
    setLoading((prev) => ({ ...prev, fees: true }));
    try {
      const signal = abortControllerRef.current?.signal;
      const data = await apiCall(
        "https://wmsapi.kdsgroup.co.in/api/Master/GetFeeCollectionDetails",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", accept: "*/*" },
          body: JSON.stringify({ VillageId: 0, Month: month, Year: year }),
          signal,
        }
      );

      if (data.Status && Array.isArray(data.Data)) {
        setFeeData(data.Data);
      }
      setErrors((prev) => ({ ...prev, fees: null }));
    } catch (error) {
      console.error("Error fetching fee data:", error);
      setErrors((prev) => ({ ...prev, fees: error.message }));
    } finally {
      setLoading((prev) => ({ ...prev, fees: false }));
    }
  }, []);

  const fetchVillages = useCallback(async () => {
  setLoading((prev) => ({ ...prev, villages: true }));
  const abortController = new AbortController();
  const signal = abortController.signal;

  try {
    // Timeout after 30 seconds for each API call
    const timeout = 30000;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out")), timeout);
    });

    // Fetch all districts
    console.log("Fetching districts...");
    const districtData = await Promise.race([
      apiCall("https://wmsapi.kdsgroup.co.in/api/Master/AllDistrict", {
        method: "POST",
        headers: { accept: "*/*", "Content-Type": "application/json" },
        body: JSON.stringify({}),
        signal,
      }),
      timeoutPromise,
    ]);

    if (!districtData?.Status || !Array.isArray(districtData?.Data)) {
      throw new Error(`Failed to fetch districts: ${JSON.stringify(districtData)}`);
    }

    const districts = districtData.Data.sort((a, b) =>
      a.DistrictName?.localeCompare(b.DistrictName) || 0
    );
    console.log(`Fetched ${districts.length} districts`);

    const villageList = [];

    // Fetch blocks for all districts in parallel
    const blockPromises = districts.map(async (district) => {
      try {
        console.log(`Fetching blocks for district ${district.DistrictName} (ID: ${district.DistrictId})...`);
        const blockData = await Promise.race([
          apiCall(
            `https://wmsapi.kdsgroup.co.in/api/Master/GetAllBlocks?DistrictId=${district.DistrictId}`,
            {
              method: "POST",
              headers: { accept: "*/*", "Content-Type": "application/json" },
              body: JSON.stringify({}),
              signal,
            }
          ),
          timeoutPromise,
        ]);

        if (!blockData?.Status || !Array.isArray(blockData?.Data)) {
          console.warn(`No valid blocks found for district ${district.DistrictName}: ${JSON.stringify(blockData)}`);
          return [];
        }

        const blocks = blockData.Data.sort((a, b) => a.BlockName?.localeCompare(b.BlockName) || 0);
        console.log(`Fetched ${blocks.length} blocks for district ${district.DistrictName}`);
        return { district, blocks };
      } catch (error) {
        console.warn(`Error fetching blocks for district ${district.DistrictName}:`, error.message);
        return [];
      }
    });

    const blockResults = await Promise.all(blockPromises);

    // Fetch gram panchayats for all blocks in parallel
    const gpPromises = blockResults.flatMap(({ district, blocks }) => {
      if (!Array.isArray(blocks)) {
        console.warn(`Blocks array is invalid for district ${district.DistrictName}`);
        return [];
      }
      return blocks.map(async (block) => {
        try {
          console.log(`Fetching gram panchayats for block ${block.BlockName} (ID: ${block.BlockId})...`);
          const gpData = await Promise.race([
            apiCall(
              `https://wmsapi.kdsgroup.co.in/api/Master/GetAllGramPanchayat?BlockId=${block.BlockId}`,
              {
                method: "POST",
                headers: { accept: "*/*", "Content-Type": "application/json" },
                body: JSON.stringify({}),
                signal,
              }
            ),
            timeoutPromise,
          ]);

          if (!gpData?.Status || !Array.isArray(gpData?.Data)) {
            console.warn(`No valid gram panchayats found for block ${block.BlockName}: ${JSON.stringify(gpData)}`);
            return [];
          }

          const gramPanchayats = gpData.Data.sort((a, b) =>
            a.GramPanchayatName?.localeCompare(b.GramPanchayatName) || 0
          );
          console.log(`Fetched ${gramPanchayats.length} gram panchayats for block ${block.BlockName}`);
          return { district, block, gramPanchayats };
        } catch (error) {
          console.warn(`Error fetching gram panchayats for block ${block.BlockName}:`, error.message);
          return [];
        }
      });
    });

    const gpResults = await Promise.all(gpPromises);

    // Fetch villages for all gram panchayats in parallel
    const villagePromises = gpResults.flatMap(({ district, block, gramPanchayats }) => {
      if (!Array.isArray(gramPanchayats)) {
        console.warn(`Gram panchayats array is invalid for block ${block.BlockName}`);
        return [];
      }
      return gramPanchayats.map(async (gp) => {
        try {
          console.log(`Fetching villages for gram panchayat ${gp.GramPanchayatName} (ID: ${gp.Id})...`);
          const villageData = await Promise.race([
            apiCall("https://wmsapi.kdsgroup.co.in/api/Master/GetVillegeByGramPanchayat", {
              method: "POST",
              headers: { accept: "*/*", "Content-Type": "application/json" },
              body: JSON.stringify({
                BlockId: block.BlockId,
                GramPanchayatId: gp.Id,
              }),
              signal,
            }),
            timeoutPromise,
          ]);

          if (!villageData?.Status || !Array.isArray(villageData?.Data)) {
            console.warn(`No valid villages found for gram panchayat ${gp.GramPanchayatName}: ${JSON.stringify(villageData)}`);
            return [];
          }

          const villages = villageData.Data.sort((a, b) =>
            a.VillageName?.localeCompare(b.VillageName) || 0
          );
          console.log(`Fetched ${villages.length} villages for gram panchayat ${gp.GramPanchayatName}`);

          return villages.map((village) => ({
            DistrictName: district.DistrictName || "Unknown",
            BlockName: block.BlockName || "Unknown",
            GramPanchayatName: gp.GramPanchayatName || "Unknown",
            VillageName: village.VillageName || "Unknown",
          }));
        } catch (error) {
          console.warn(`Error fetching villages for gram panchayat ${gp.GramPanchayatName}:`, error.message);
          return [];
        }
      });
    });

    const villageResults = await Promise.all(villagePromises);
    villageList.push(...villageResults.flat());

    console.log(`Total villages fetched: ${villageList.length}`);
    setVillages(villageList);
    setErrors((prev) => ({ ...prev, villages: villageList.length === 0 ? "No villages found" : null }));
  } catch (error) {
    console.error("Error fetching villages:", error.message);
    setErrors((prev) => ({ ...prev, villages: error.message }));
  } finally {
    setLoading((prev) => ({ ...prev, villages: false }));
    abortController.abort();
  }
}, []);

  const fetchRoasterData = useCallback(async () => {
    if (pumpHouses.length === 0) return;

    setLoading((prev) => ({ ...prev, roaster: true }));
    try {
      const signal = abortControllerRef.current?.signal;
      const uniqueGPIds = [...new Set(pumpHouses.map((p) => p.PumpId))];
      const allRoasterData = [];

      for (const gpId of uniqueGPIds) {
        try {
          const data = await apiCall(
            "https://wmsapi.kdsgroup.co.in/api/Master/GetMonthlyRoasterWithSchedule",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                GPId: gpId,
                VillgeId: 0,
                Month: selectedMonth,
                Year: selectedYear,
              }),
              signal,
            }
          );

          if (data.Status && Array.isArray(data.Data)) {
            allRoasterData.push(...data.Data);
          }
        } catch (error) {
          console.error(`Error fetching roaster data for GP ${gpId}:`, error);
        }
      }

      setRoasterData(allRoasterData);
      setErrors((prev) => ({ ...prev, roaster: null }));
    } catch (error) {
      console.error("Error fetching roaster data:", error);
      setErrors((prev) => ({ ...prev, roaster: error.message }));
    } finally {
      setLoading((prev) => ({ ...prev, roaster: false }));
    }
  }, [pumpHouses, selectedMonth, selectedYear]);

  const fetchDistrictData = useCallback(async (year) => {
    if (!isAdmin()) return;

    setLoading((prev) => ({ ...prev, districts: true }));
    try {
      const signal = abortControllerRef.current?.signal;
      const [topFeeRes, bottomFeeRes, topComplaintRes, bottomComplaintRes] = await Promise.all([
        apiCall(
          `https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTop10DistrictByFeeCollection?FinancialYear=${year}`,
          {
            method: "POST",
            headers: { accept: "*/*" },
            signal,
          }
        ),
        apiCall(
          `https://wmsapi.kdsgroup.co.in/api/Dashboard/GetBottom10DistrictByFeeCollection?FinancialYear=${year}`,
          {
            method: "POST",
            headers: { accept: "*/*" },
            signal,
          }
        ),
        apiCall(
          `https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTop10DistrictByComplaint?FinancialYear=${year}`,
          {
            method: "POST",
            headers: { accept: "*/*" },
            signal,
          }
        ),
        apiCall(
          `https://wmsapi.kdsgroup.co.in/api/Dashboard/GetBottom10DistrictByComplaint?FinancialYear=${year}`,
          {
            method: "POST",
            headers: { accept: "*/*" },
            signal,
          }
        ),
      ]);

      if (topFeeRes.Status) setTopDistrictsByFee(topFeeRes.Data || []);
      if (bottomFeeRes.Status) setBottomDistrictsByFee(bottomFeeRes.Data || []);
      if (topComplaintRes.Status) setTopDistrictsByComplaint(topComplaintRes.Data || []);
      if (bottomComplaintRes.Status) setBottomDistrictsByComplaint(bottomComplaintRes.Data || []);
      setErrors((prev) => ({ ...prev, districts: null }));
    } catch (error) {
      console.error("Error fetching district data:", error);
      setErrors((prev) => ({ ...prev, districts: error.message }));
    } finally {
      setLoading((prev) => ({ ...prev, districts: false }));
    }
  }, [isAdmin]);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      if (!userId || userLoading) return;

      abortControllerRef.current = new AbortController();

      await Promise.all([
        fetchPumpHouses(userId),
        fetchComplaints(userId),
        fetchFeeCollectionData(selectedMonth, selectedYear),
        fetchVillages(),
        fetchDistrictData(selectedYear),
      ]);
    };

    initializeData();
  }, [userId, userLoading, selectedMonth, selectedYear, fetchPumpHouses, fetchComplaints, fetchFeeCollectionData, fetchVillages, fetchDistrictData]);

  // Fetch roaster data when pump houses are loaded
  useEffect(() => {
    if (pumpHouses.length > 0) {
      fetchRoasterData();
    }
  }, [fetchRoasterData, pumpHouses.length]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleDateChange = useCallback(
    (type, value) => {
      if (type === "month") {
        setSelectedMonth(value);
      } else if (type === "year") {
        setSelectedYear(value);
      }
    },
    []
  );

  const handleRefresh = useCallback(async () => {
    if (!userId) return;

    setRefreshing(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Reset all data
    setPumpHouses([]);
    setComplaints([]);
    setFeeData([]);
    setVillages([]);
    setRoasterData([]);
    setTopDistrictsByFee([]);
    setBottomDistrictsByFee([]);
    setTopDistrictsByComplaint([]);
    setBottomDistrictsByComplaint([]);

    setErrors({});
    setLoading({
      pumps: true,
      ohts: true,
      complaints: true,
      fees: true,
      villages: true,
      roaster: true,
      districts: true,
    });

    try {
      await Promise.all([
        fetchPumpHouses(userId),
        fetchComplaints(userId),
        fetchFeeCollectionData(selectedMonth, selectedYear),
        fetchVillages(),
        fetchDistrictData(selectedYear),
      ]);
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setRefreshing(false);
    }
  }, [userId, selectedMonth, selectedYear, fetchPumpHouses, fetchComplaints, fetchFeeCollectionData, fetchVillages, fetchDistrictData]);

  // Table column definitions
  const pumpHouseColumns = [
    { key: "OhtId", header: "OHT ID" },
    { key: "OperatorName", header: "Operator Name" },
    { key: "Contact", header: "Contact" },
    { key: "PumpId", header: "Pump ID" },
    { key: "HorsePower", header: "Horse Power" },
    {
      key: "PowerSource",
      header: "Power Source",
      render: (value) => (value === "1" ? "Electric" : value === "2" ? "Solar" : "Unknown"),
    },
    { key: "SolarOutput", header: "Solar Output (kW)" },
    {
      key: "Status",
      header: "Status",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value === 1 ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const complaintColumns = [
    { key: "ComplaintID", header: "Complaint ID" },
    { key: "District", header: "District" },
    { key: "Block", header: "Block" },
    { key: "GramPanchayat", header: "Gram Panchayat" },
    { key: "Village", header: "Village" },
    { key: "BeneficiaryName", header: "Beneficiary Name" },
    { key: "Contact", header: "Contact" },
    { key: "Category", header: "Category" },
    {
      key: "Status",
      header: "Status",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {value ? "Resolved" : "Pending"}
        </span>
      ),
    },
  ];

  const feeCollectionColumns = [
    { key: "FeeCollectionId", header: "ID" },
    { key: "VillageName", header: "Village" },
    { key: "BeneficiaryName", header: "Beneficiary Name" },
    { key: "FatherHusbandName", header: "Father/Husband Name" },
    { key: "BaseFee", header: "Base Fee (₹)", render: (value) => value?.toLocaleString() },
    { key: "PreviousBalance", header: "Previous Balance (₹)", render: (value) => value?.toLocaleString() },
    { key: "OutstandingAmount", header: "Outstanding (₹)", render: (value) => value?.toLocaleString() },
    { key: "PaidAmount", header: "Paid Amount (₹)", render: (value) => value?.toLocaleString() },
    {
      key: "BalanceAmount",
      header: "Balance (₹)",
      render: (value, row) => {
        const outstanding = row.OutstandingAmount || 0;
        const paid = row.PaidAmount || 0;
        const calculatedBalance = outstanding - paid;
        return calculatedBalance.toLocaleString();
      },
    },
  ];

  const villageColumns = [
    { key: "DistrictName", header: "District" },
    { key: "BlockName", header: "Block" },
    { key: "GramPanchayatName", header: "Gram Panchayat" },
    { key: "VillageName", header: "Village" },
  ];

  const roasterColumns = [
    { key: "RoasterId", header: "Roaster ID" },
    { key: "GPId", header: "GP ID" },
    { key: "VillageId", header: "Village ID" },
    { key: "RoasterDate", header: "Roaster Date", render: (value) => new Date(value).toLocaleDateString() },
    { key: "ActivityType", header: "Activity Type" },
    { key: "StartDate", header: "Start Date", render: (value) => new Date(value).toLocaleDateString() },
    { key: "EndDate", header: "End Date", render: (value) => new Date(value).toLocaleDateString() },
    { key: "Remark", header: "Remark" },
    {
      key: "Status",
      header: "Status",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value === 1 ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const districtFeeColumns = [
    { key: "DistrictId", header: "District ID" },
    { key: "DistrictName", header: "District Name" },
    { key: "TotalAmount", header: "Total Amount (₹)", render: (value) => value?.toLocaleString() },
  ];

  const districtComplaintColumns = [
    { key: "DistrictId", header: "District ID" },
    { key: "DistrictName", header: "District Name" },
    { key: "TotalComplaint", header: "Total Complaints" },
  ];

  // Download functions for consolidated reports
  const handleConsolidatedDownload = () => {
    const timestamp = new Date().toISOString().split("T")[0];
    const allData = {
      "Pump Houses": pumpHouses,
      Complaints: complaints,
      "Fee Collection": feeData,
      Villages: villages,
      "Roaster Data": roasterData,
      ...(isAdmin() && {
        "Top Districts by Fee": topDistrictsByFee,
        "Bottom Districts by Fee": bottomDistrictsByFee,
        "Top Districts by Complaints": topDistrictsByComplaint,
        "Bottom Districts by Complaints": bottomDistrictsByComplaint,
      }),
    };

    // Create a summary report
    const summaryData = [
      {
        "Report Type": "Consolidated MIS Report",
        "Generated Date": new Date().toLocaleDateString(),
        "Report Period": `${new Date(0, selectedMonth - 1).toLocaleString("default", {
          month: "long",
        })} ${selectedYear}`,
        "User Role": role,
        "User ID": userId,
        "Total Pump Houses": pumpHouses.length,
        "Total Complaints": complaints.length,
        "Total Fee Records": feeData.length,
        "Total Villages": villages.length,
        "Total Roaster Entries": roasterData.length,
      },
    ];

    downloadCSV(summaryData, `consolidated_mis_report_${timestamp}.csv`);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isAdmin() ? "Admin MIS Reports" : "MIS Tabular Reports"}
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive tabular data reports with download capabilities
              {userId && <span className="text-gray-500"> • User ID: {userId}</span>}
              {role && <span className="text-gray-500"> • Role: {role}</span>}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Date Filter */}
            <div className="flex items-center gap-3 bg-white rounded-lg shadow-md p-3 border">
              <Icons.Calendar />
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="text-sm font-medium bg-transparent border-none outline-none cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("default", { month: "long" })}
                    </option>
                  ))}
                </select>
                <span className="text-gray-400">•</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="text-sm font-medium bg-transparent border-none outline-none cursor-pointer"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing || !userId}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md"
            >
              <Icons.Refresh />
              <span className="font-medium">{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Data Tables */}
        <div className="space-y-8">

          
          {/* Pump Houses Table */}
          <DataTable
            title="Pump House Management"
            data={pumpHouses}
            columns={pumpHouseColumns}
            isLoading={loading.pumps}
            error={errors.pumps}
            onRetry={() => fetchPumpHouses(userId)}
            downloadFilename="pump_houses"
            searchable={true}
          />

          {/* Complaints Table */}
          <DataTable
            title="Complaint Management"
            data={complaints}
            columns={complaintColumns}
            isLoading={loading.complaints}
            error={errors.complaints}
            onRetry={() => fetchComplaints(userId)}
            downloadFilename="complaints"
            searchable={true}
          />

          {/* Fee Collection Table */}
          <DataTable
            title="Fee Collection Details"
            data={feeData}
            columns={feeCollectionColumns}
            isLoading={loading.fees}
            error={errors.fees}
            onRetry={() => fetchFeeCollectionData(selectedMonth, selectedYear)}
            downloadFilename={`fee_collection_${selectedMonth}_${selectedYear}`}
            searchable={true}
            showDateFilter={true}
          />

          {/* Villages Table */}
          <DataTable
  title="Village Directory"
  data={villages}
  columns={villageColumns}
  isLoading={loading.villages}
  error={errors.villages}
  onRetry={fetchVillages}
  downloadFilename="villages"
  searchable={true}
/>

          {/* Roaster Schedule Table */}
          <DataTable
            title="Monthly Roaster Schedules"
            data={roasterData}
            columns={roasterColumns}
            isLoading={loading.roaster}
            error={errors.roaster}
            onRetry={fetchRoasterData}
            downloadFilename={`roaster_schedules_${selectedMonth}_${selectedYear}`}
            searchable={true}
            showDateFilter={true}
          />

          {/* Admin Only District Performance Tables */}
          {isAdmin() && (
            <>
              <DataTable
                title="Top Districts by Fee Collection"
                data={topDistrictsByFee}
                columns={districtFeeColumns}
                isLoading={loading.districts}
                error={errors.districts}
                onRetry={() => fetchDistrictData(selectedYear)}
                downloadFilename={`top_districts_fee_${selectedYear}`}
                searchable={true}
              />

              <DataTable
                title="Bottom Districts by Fee Collection"
                data={bottomDistrictsByFee}
                columns={districtFeeColumns}
                isLoading={loading.districts}
                error={errors.districts}
                onRetry={() => fetchDistrictData(selectedYear)}
                downloadFilename={`bottom_districts_fee_${selectedYear}`}
                searchable={true}
              />

              <DataTable
                title="Top Districts by Complaint Count"
                data={topDistrictsByComplaint}
                columns={districtComplaintColumns}
                isLoading={loading.districts}
                error={errors.districts}
                onRetry={() => fetchDistrictData(selectedYear)}
                downloadFilename={`top_districts_complaints_${selectedYear}`}
                searchable={true}
              />

              <DataTable
                title="Bottom Districts by Complaint Count"
                data={bottomDistrictsByComplaint}
                columns={districtComplaintColumns}
                isLoading={loading.districts}
                error={errors.districts}
                onRetry={() => fetchDistrictData(selectedYear)}
                downloadFilename={`bottom_districts_complaints_${selectedYear}`}
                searchable={true}
              />
            </>
          )}
        </div>

        {/* Download Reports Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6 border">
          <div className="flex items-center gap-3 mb-6">
            <Icons.Download />
            <h3 className="text-xl font-bold text-gray-900">📥 Download Reports</h3>
            <div className="ml-auto text-sm text-gray-500">
              Period: {new Date(0, selectedMonth - 1).toLocaleString("default", { month: "long" })}{" "}
              {selectedYear} • Generated: {new Date().toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Individual Report Downloads */}
            <button
              onClick={() => downloadCSV(pumpHouses, `pump_houses_${new Date().toISOString().split("T")[0]}.csv`)}
              disabled={pumpHouses.length === 0}
              className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg border border-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icons.Report />
              <div className="text-left">
                <div className="font-semibold text-blue-800">Pump Houses</div>
                <div className="text-sm text-blue-600">{pumpHouses.length} records</div>
              </div>
            </button>

            <button
              onClick={() => downloadCSV(complaints, `complaints_${new Date().toISOString().split("T")[0]}.csv`)}
              disabled={complaints.length === 0}
              className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-lg border border-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icons.Report />
              <div className="text-left">
                <div className="font-semibold text-orange-800">Complaints</div>
                <div className="text-sm text-orange-600">{complaints.length} records</div>
              </div>
            </button>

            <button
              onClick={() => {
                const processedFeeData = feeData.map((row) => ({
                  ...row,
                  BalanceAmount: (row.OutstandingAmount || 0) - (row.PaidAmount || 0),
                }));
                downloadCSV(
                  processedFeeData,
                  `fee_collection_${selectedMonth}_${selectedYear}_${new Date().toISOString().split("T")[0]}.csv`
                );
              }}
              disabled={feeData.length === 0}
              className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg border border-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icons.Report />
              <div className="text-left">
                <div className="font-semibold text-green-800">Fee Collection</div>
                <div className="text-sm text-green-600">{feeData.length} records</div>
              </div>
            </button>

            <button
              onClick={() =>
                downloadCSV(villages, `villages_${new Date().toISOString().split("T")[0]}.csv`)
              }
              disabled={villages.length === 0}
              className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg border border-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icons.Report />
              <div className="text-left">
                <div className="font-semibold text-purple-800">Villages</div>
                <div className="text-sm text-purple-600">{villages.length} records</div>
              </div>
            </button>

            <button
              onClick={() =>
                downloadCSV(
                  roasterData,
                  `roaster_schedules_${selectedMonth}_${selectedYear}_${new Date().toISOString().split("T")[0]}.csv`
                )
              }
              disabled={roasterData.length === 0}
              className="flex items-center gap-3 p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-lg border border-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icons.Report />
              <div className="text-left">
                <div className="font-semibold text-indigo-800">Roaster Schedules</div>
                <div className="text-sm text-indigo-600">{roasterData.length} records</div>
              </div>
            </button>

            {/* Admin Only Downloads */}
            {isAdmin() && (
              <>
                <button
                  onClick={() =>
                    downloadCSV(
                      topDistrictsByFee,
                      `top_districts_fee_${selectedYear}_${new Date().toISOString().split("T")[0]}.csv`
                    )
                  }
                  disabled={topDistrictsByFee.length === 0}
                  className="flex items-center gap-3 p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 rounded-lg border border-cyan-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icons.Report />
                  <div className="text-left">
                    <div className="font-semibold text-cyan-800">Top Fee Districts</div>
                    <div className="text-sm text-cyan-600">{topDistrictsByFee.length} records</div>
                  </div>
                </button>

                <button
                  onClick={() =>
                    downloadCSV(
                      topDistrictsByComplaint,
                      `top_districts_complaints_${selectedYear}_${new Date().toISOString().split("T")[0]}.csv`
                    )
                  }
                  disabled={topDistrictsByComplaint.length === 0}
                  className="flex items-center gap-3 p-4 bg-gradient-to-br from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200 rounded-lg border border-rose-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icons.Report />
                  <div className="text-left">
                    <div className="font-semibold text-rose-800">Top Complaint Districts</div>
                    <div className="text-sm text-rose-600">{topDistrictsByComplaint.length} records</div>
                  </div>
                </button>
              </>
            )}

            {/* Consolidated Download */}
            <button
              onClick={handleConsolidatedDownload}
              className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-lg border border-gray-200 transition-all col-span-full md:col-span-1"
            >
              <Icons.Download />
              <div className="text-left">
                <div className="font-semibold text-gray-800">Consolidated Report</div>
                <div className="text-sm text-gray-600">Summary of all data</div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer Status */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-4 border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${refreshing ? "bg-yellow-500 animate-pulse" : "bg-green-500"}`}
                ></div>
                <span>{refreshing ? "Loading data..." : "System operational"}</span>
              </div>
              <div>Last updated: {new Date().toLocaleTimeString()}</div>
            </div>

            <div className="flex items-center gap-6 text-xs">
              <div>
                Data Period: {new Date(0, selectedMonth - 1).toLocaleString("default", { month: "long" })}{" "}
                {selectedYear}
              </div>
              <div>
                User: {role} (ID: {userId})
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}