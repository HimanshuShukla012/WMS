import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
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
const downloadExcel = (data, filename, processRowData = null) => {
  if (!data || data.length === 0) {
    alert("No data available to download");
    return;
  }

  try {
    // Process data if a processing function is provided
    const processedData = processRowData ? data.map(processRowData) : data;

    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(processedData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.error("Error generating Excel file:", error);
    alert("Error generating Excel file. Please try again.");
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

    // Process data to convert IDs to human-readable values
    const processRowData = (row) => {
      const processedRow = { ...row };

      // Convert PowerSource IDs to readable text
      if (processedRow.PowerSource !== undefined) {
        processedRow.PowerSource = 
          processedRow.PowerSource === "1" || processedRow.PowerSource === 1
            ? "Electric"
            : processedRow.PowerSource === "2" || processedRow.PowerSource === 2
            ? "Solar"
            : "Unknown";
      }

      // Convert Status IDs to readable text
      if (processedRow.Status !== undefined) {
        processedRow.Status = 
          processedRow.Status === 1 || processedRow.Status === true
            ? "Active"
            : "Inactive";
      }

      // Calculate balance for fee collection data
      if (downloadFilename.includes("fee_collection")) {
        processedRow.BalanceAmount = (row.OutstandingAmount || 0) - (row.PaidAmount || 0);
      }

      return processedRow;
    };

    downloadExcel(data, `${downloadFilename}_${timestamp}.xlsx`, processRowData);
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
              Download Excel
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

// Enhanced Village Directory with District Filter
const VillageDirectoryWithFilter = () => {
  const [allDistricts, setAllDistricts] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedDistrictName, setSelectedDistrictName] = useState('');
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState({
    districts: false,
    villages: false
  });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch all districts for the dropdown
  const fetchDistricts = useCallback(async () => {
    setLoading(prev => ({ ...prev, districts: true }));
    try {
      const districtData = await apiCall("https://wmsapi.kdsgroup.co.in/api/Master/AllDistrict", {
        method: "POST",
        headers: { accept: "*/*", "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      if (districtData?.Status && Array.isArray(districtData?.Data)) {
        const sortedDistricts = districtData.Data.sort((a, b) =>
          a.DistrictName?.localeCompare(b.DistrictName) || 0
        );
        setAllDistricts(sortedDistricts);
        setErrors(prev => ({ ...prev, districts: null }));
      } else {
        throw new Error("Invalid districts data received");
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
      setErrors(prev => ({ ...prev, districts: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, districts: false }));
    }
  }, []);

  // Fetch villages for a specific district
  const fetchDistrictVillages = useCallback(async (districtId, districtName) => {
    if (!districtId) return;

    setLoading(prev => ({ ...prev, villages: true }));
    setVillages([]); // Clear previous data
    setErrors(prev => ({ ...prev, villages: null }));

    try {
      console.log(`Fetching villages for district: ${districtName} (ID: ${districtId})`);
      
      // Step 1: Fetch blocks for this district
      const blockData = await apiCall(
        `https://wmsapi.kdsgroup.co.in/api/Master/GetAllBlocks?DistrictId=${districtId}`,
        {
          method: "POST",
          headers: { accept: "*/*", "Content-Type": "application/json" },
          body: JSON.stringify({})
        }
      );

      if (!blockData?.Status || !Array.isArray(blockData?.Data)) {
        throw new Error(`No blocks found for district ${districtName}`);
      }

      const blocks = blockData.Data.sort((a, b) => 
        a.BlockName?.localeCompare(b.BlockName) || 0
      );
      console.log(`Found ${blocks.length} blocks in ${districtName}`);

      const allVillages = [];
      let processedBlocks = 0;

      // Process blocks sequentially to avoid overwhelming the API
      for (const block of blocks) {
        try {
          console.log(`Processing block ${block.BlockName} (${processedBlocks + 1}/${blocks.length})`);

          // Step 2: Fetch gram panchayats for this block
          const gpData = await apiCall(
            `https://wmsapi.kdsgroup.co.in/api/Master/GetAllGramPanchayat?BlockId=${block.BlockId}`,
            {
              method: "POST",
              headers: { accept: "*/*", "Content-Type": "application/json" },
              body: JSON.stringify({})
            }
          );

          if (!gpData?.Status || !Array.isArray(gpData?.Data)) {
            console.warn(`No gram panchayats found for block ${block.BlockName}`);
            processedBlocks++;
            continue;
          }

          const gramPanchayats = gpData.Data.sort((a, b) =>
            a.GramPanchayatName?.localeCompare(b.GramPanchayatName) || 0
          );

          // Step 3: Fetch villages for each gram panchayat (with controlled concurrency)
          const gpChunks = [];
          for (let i = 0; i < gramPanchayats.length; i += 2) {
            gpChunks.push(gramPanchayats.slice(i, i + 2));
          }

          for (const gpChunk of gpChunks) {
            const gpPromises = gpChunk.map(async (gp) => {
              try {
                const villageData = await apiCall(
                  "https://wmsapi.kdsgroup.co.in/api/Master/GetVillegeByGramPanchayat",
                  {
                    method: "POST",
                    headers: { accept: "*/*", "Content-Type": "application/json" },
                    body: JSON.stringify({
                      BlockId: block.BlockId,
                      GramPanchayatId: gp.Id,
                    })
                  }
                );

                if (!villageData?.Status || !Array.isArray(villageData?.Data)) {
                  console.warn(`No villages found for GP ${gp.GramPanchayatName}`);
                  return [];
                }

                const villages = villageData.Data.sort((a, b) =>
                  a.VillageName?.localeCompare(b.VillageName) || 0
                );

                return villages.map((village) => ({
                  DistrictName: districtName,
                  BlockName: block.BlockName || "Unknown",
                  GramPanchayatName: gp.GramPanchayatName || "Unknown",
                  VillageName: village.VillageName || "Unknown",
                  DistrictId: districtId,
                  BlockId: block.BlockId,
                  GramPanchayatId: gp.Id,
                  VillageId: village.VillageId || village.Id
                }));
              } catch (error) {
                console.warn(`Error fetching villages for GP ${gp.GramPanchayatName}:`, error.message);
                return [];
              }
            });

            const gpResults = await Promise.allSettled(gpPromises);
            gpResults.forEach(result => {
              if (result.status === 'fulfilled' && result.value.length > 0) {
                allVillages.push(...result.value);
              }
            });

            // Small delay to be API-friendly
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          processedBlocks++;
          console.log(`Completed block ${block.BlockName}. Total villages so far: ${allVillages.length}`);

        } catch (error) {
          console.error(`Error processing block ${block.BlockName}:`, error.message);
          processedBlocks++;
        }

        // Small delay between blocks
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log(`Fetched ${allVillages.length} villages for district ${districtName}`);
      setVillages(allVillages);

      if (allVillages.length === 0) {
        setErrors(prev => ({ ...prev, villages: `No villages found for district ${districtName}` }));
      }

    } catch (error) {
      console.error(`Error fetching villages for district ${districtName}:`, error);
      setErrors(prev => ({ ...prev, villages: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, villages: false }));
    }
  }, []);

  // Initialize districts on component mount
  useEffect(() => {
    fetchDistricts();
  }, [fetchDistricts]);

  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    const district = allDistricts.find(d => d.DistrictId.toString() === districtId);
    
    setSelectedDistrictId(districtId);
    setSelectedDistrictName(district?.DistrictName || '');
    setVillages([]); // Clear previous villages
    setErrors(prev => ({ ...prev, villages: null }));
    setSearchTerm(""); // Reset search
    setCurrentPage(1); // Reset pagination
  };

  const handleFetchDirectory = () => {
    if (selectedDistrictId && selectedDistrictName) {
      fetchDistrictVillages(selectedDistrictId, selectedDistrictName);
    }
  };

  // Filter and pagination logic for villages
  const filteredVillages = useMemo(() => {
    if (!villages || villages.length === 0) return [];
    if (!searchTerm) return villages;

    return villages.filter((village) =>
      Object.values(village).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [villages, searchTerm]);

  const paginatedVillages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVillages.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVillages, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredVillages.length / itemsPerPage);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const villageColumns = [
    { key: "DistrictName", header: "District" },
    { key: "BlockName", header: "Block" },
    { key: "GramPanchayatName", header: "Gram Panchayat" },
    { key: "VillageName", header: "Village" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Enhanced Header with District Filter */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col gap-4">
          {/* Title Row */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Village Directory</h3>
            <div className="text-sm text-gray-500">
              {villages.length > 0 && `${villages.length} villages found`}
            </div>
          </div>

          {/* Filter and Action Row */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* District Filter */}
            <div className="flex items-center gap-3 flex-1">
              <label htmlFor="district-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Select District:
              </label>
              <select
                id="district-select"
                value={selectedDistrictId}
                onChange={handleDistrictChange}
                disabled={loading.districts}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">-- Choose a District --</option>
                {allDistricts.map((district) => (
                  <option key={district.DistrictId} value={district.DistrictId}>
                    {district.DistrictName}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Box */}
            {villages.length > 0 && (
              <div className="relative">
                <Icons.Search />
                <input
                  type="text"
                  placeholder="Search villages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleFetchDirectory}
                disabled={!selectedDistrictId || loading.villages}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                {loading.villages ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Fetching...
                  </>
                ) : (
                  <>
                    <Icons.Download />
                    Fetch Directory
                  </>
                )}
              </button>

              {villages.length > 0 && (
                <button
                  onClick={() => {
                    const timestamp = new Date().toISOString().split("T")[0];
                    downloadExcel(villages, `${selectedDistrictName.toLowerCase().replace(/\s+/g, '_')}_villages_${timestamp}.xlsx`);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                >
                  <Icons.Download />
                  Download Excel
                </button>
              )}
            </div>
          </div>

          {/* Status Messages */}
          {errors.districts && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-red-800 text-sm">Error loading districts: {errors.districts}</div>
            </div>
          )}

          {selectedDistrictName && !loading.villages && villages.length === 0 && !errors.villages && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-blue-800 text-sm">
                Click "Fetch Directory" to load villages for {selectedDistrictName}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading.districts && (
        <div className="p-8">
          <LoadingSpinner />
          <p className="text-center text-gray-600 mt-2">Loading districts...</p>
        </div>
      )}

      {/* Villages Table */}
      {!loading.districts && (
        <>
          {loading.villages && (
            <div className="p-8">
              <LoadingSpinner />
              <p className="text-center text-gray-600 mt-2">
                Fetching villages for {selectedDistrictName}...
              </p>
              <p className="text-center text-gray-500 text-sm mt-1">
                This may take a few minutes depending on the district size
              </p>
            </div>
          )}

          {errors.villages && (
            <div className="p-6">
              <ErrorMessage 
                message={errors.villages} 
                onRetry={() => handleFetchDirectory()}
              />
            </div>
          )}

          {!loading.villages && villages.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {villageColumns.map((column, index) => (
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
                    {paginatedVillages.map((village, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {villageColumns.map((column, colIndex) => (
                          <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {village[column.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
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
                  totalItems={filteredVillages.length}
                />
              )}
            </>
          )}

          {!loading.villages && villages.length === 0 && !errors.villages && selectedDistrictName && (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-4">📍</div>
              <h4 className="text-lg font-medium text-gray-700 mb-2">No Data Available</h4>
              <p>No villages found for {selectedDistrictName}</p>
            </div>
          )}

          {!selectedDistrictId && !loading.villages && (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-4">🏘️</div>
              <h4 className="text-lg font-medium text-gray-700 mb-2">Select a District</h4>
              <p>Choose a district from the dropdown above to view its village directory</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default function MISTabularReportingDashboard() {
  const { userId, role, isLoading: userLoading } = useUserInfo();
  const abortControllerRef = useRef(null);

  // Data States (removed villages state as it's now handled in VillageDirectoryWithFilter)
  const [pumpHouses, setPumpHouses] = useState([]);
  const [ohtData, setOHTData] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [feeData, setFeeData] = useState([]);
  const [roasterData, setRoasterData] = useState([]);
  const [topDistrictsByFee, setTopDistrictsByFee] = useState([]);
  const [bottomDistrictsByFee, setBottomDistrictsByFee] = useState([]);
  const [topDistrictsByComplaint, setTopDistrictsByComplaint] = useState([]);
  const [bottomDistrictsByComplaint, setBottomDistrictsByComplaint] = useState([]);

  // Date Controls
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Loading and Error States (removed villages from loading state)
  const [loading, setLoading] = useState({
    pumps: true,
    ohts: true,
    complaints: true,
    fees: true,
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

  const fetchFeeCollectionData = useCallback(async (month, year, currentUserId) => {
    setLoading((prev) => ({ ...prev, fees: true }));
    try {
      const signal = abortControllerRef.current?.signal;
      const data = await apiCall(
        "https://wmsapi.kdsgroup.co.in/api/Master/GetFeeCollectionDetails",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", accept: "*/*" },
          body: JSON.stringify({ 
            VillageId: 0, 
            Month: month, 
            Year: year,
            p_user_id: isAdmin() ? 0 : currentUserId || 0
          }),
          signal,
        }
      );

      if (data.Status && Array.isArray(data.Data)) {
        console.log(`Fetched ${data.Data.length} fee collection records`);
        setFeeData(data.Data);
      } else {
        console.warn("No fee data received or invalid format:", data);
        setFeeData([]);
      }
      setErrors((prev) => ({ ...prev, fees: null }));
    } catch (error) {
      console.error("Error fetching fee data:", error);
      setErrors((prev) => ({ ...prev, fees: error.message }));
    } finally {
      setLoading((prev) => ({ ...prev, fees: false }));
    }
    }, [isAdmin]);

  

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

  // Initialize data (removed fetchVillages from the array)
  useEffect(() => {
    const initializeData = async () => {
      if (!userId || userLoading) return;

      abortControllerRef.current = new AbortController();

      await Promise.all([
        fetchPumpHouses(userId),
        fetchComplaints(userId),
        fetchFeeCollectionData(selectedMonth, selectedYear, userId),
        fetchDistrictData(selectedYear),
      ]);
    };

    initializeData();
  }, [userId, userLoading, selectedMonth, selectedYear, fetchPumpHouses, fetchComplaints, fetchFeeCollectionData, fetchDistrictData]);

  

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

    // Reset all data (removed villages from reset)
    setPumpHouses([]);
    setComplaints([]);
    setFeeData([]);
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
      roaster: true,
      districts: true,
    });

    try {
      await Promise.all([
        fetchPumpHouses(userId),
        fetchComplaints(userId),
        fetchFeeCollectionData(selectedMonth, selectedYear, userId),
        fetchDistrictData(selectedYear),
      ]);
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setRefreshing(false);
    }
  }, [userId, selectedMonth, selectedYear, fetchPumpHouses, fetchComplaints, fetchFeeCollectionData, fetchDistrictData]);

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

  // Download functions for consolidated reports (removed villages from consolidation)
  const handleConsolidatedDownload = () => {
    const timestamp = new Date().toISOString().split("T")[0];
    const allData = {
      "Pump Houses": pumpHouses,
      Complaints: complaints,
      "Fee Collection": feeData,
      "Roaster Data": roasterData,
      ...(isAdmin() && {
        "Top Districts by Fee": topDistrictsByFee,
        "Bottom Districts by Fee": bottomDistrictsByFee,
        "Top Districts by Complaints": topDistrictsByComplaint,
        "Bottom Districts by Complaints": bottomDistrictsByComplaint,
      }),
    };

    // Create a summary report (removed villages count)
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
        "Total Roaster Entries": roasterData.length,
      },
    ];

    downloadExcel(summaryData, `consolidated_mis_report_${timestamp}.xlsx`);
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

          {/* Enhanced Village Directory with District Filter */}
          <VillageDirectoryWithFilter />

          

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

        {/* Download Reports Section (removed village downloads from individual section) */}
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
              onClick={() => downloadExcel(pumpHouses, `pump_houses_${new Date().toISOString().split("T")[0]}.xlsx`)}
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
              onClick={() => downloadExcel(complaints, `complaints_${new Date().toISOString().split("T")[0]}.xlsx`)}
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
                downloadExcel(
                  processedFeeData,
                  `fee_collection_${selectedMonth}_${selectedYear}_${new Date().toISOString().split("T")[0]}.xlsx`
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
                downloadExcel(
                  roasterData,
                  `roaster_schedules_${selectedMonth}_${selectedYear}_${new Date().toISOString().split("T")[0]}.xlsx`
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
                    downloadExcel(
                      topDistrictsByFee,
                      `top_districts_fee_${selectedYear}_${new Date().toISOString().split("T")[0]}.xlsx`
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
                    downloadExcel(
                      topDistrictsByComplaint,
                      `top_districts_complaints_${selectedYear}_${new Date().toISOString().split("T")[0]}.xlsx`
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