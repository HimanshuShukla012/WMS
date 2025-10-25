import { useEffect, useState } from "react";
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { useUserInfo } from "../utils/userInfo";

interface OHTApiItem {
  OhtId: number;
  Districtname: string;
  BlockName: string;
  GramPanchayatName: string;
  VillageName: string;
  OHTCapacity: number;
  NoOfPumps: number;
}

interface OHTDetails {
  OHTId: number;
  DistrictName: string;
  BlockName: string;
  GramPanchayatName: string;
  VillageName: string;
  OHTCapacity: number;
  NoOfPumps: number;
}

interface CleaningStatusItem {
  OhtId: number;
  VillageId: number;
  OhtCapacity: number | null;
  NoOfPumps: number | null;
  OhtTankCleaningStatus: number;
  OhtSolarCleaningStatus: number;
  OhtCleaningDate: string;
  Status: number;
}

interface BillingStatusItem {
  OhtId: number;
  VillageId: number;
  OhtCapacity: number | null;
  NoOfPumps: number | null;
  OhtElectricityBillAmount: number;
  DepositAmount: number;
  DepositAmountDate: string;
  BalanceAmount: number;
  Status: number;
}

interface CombinedRecord {
  OhtId: number;
  DistrictName: string;
  BlockName: string;
  GramPanchayatName: string;
  VillageName: string;
  OHTCapacity: number;
  NoOfPumps: number;
  OhtTankCleaningStatus: number | null;
  OhtSolarCleaningStatus: number | null;
  OhtCleaningDate: string | null;
  OhtElectricityBillAmount: number | null;
  DepositAmount: number | null;
  DepositAmountDate: string | null;
  BalanceAmount: number | null;
}

const ViewOHTCleaningDetails = () => {
  const { userId, role, isLoading: userLoading } = useUserInfo();

  const [ohtDetailsMap, setOhtDetailsMap] = useState<Map<number, OHTDetails>>(new Map());
  const [combinedRecords, setCombinedRecords] = useState<CombinedRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedBlock, setSelectedBlock] = useState<string>("");
  const [selectedGramPanchayat, setSelectedGramPanchayat] = useState<string>("");
  const [selectedVillage, setSelectedVillage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"cleaning" | "billing" | "combined">("combined");
  const [selectedOht, setSelectedOht] = useState<OHTDetails | null>(null);
const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!userLoading && userId) {
      fetchAllData();
    }
  }, [userId, userLoading]);

  const fetchAllData = async () => {
    if (!userId) {
      console.error("Cannot fetch data: userId is null");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch OHT details first
      const ohtRes = await fetch(
        `https://wmsapi.kdsgroup.co.in/api/Master/GetOHTListByVillage?VillageId=0&UserId=${userId}`,
        {
          method: "GET",
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json'
          }
        }
      );

      if (!ohtRes.ok) {
        throw new Error(`HTTP error! status: ${ohtRes.status}`);
      }

      const ohtJson = await ohtRes.json();

      if (!ohtJson.Status) {
        throw new Error(ohtJson.Message || ohtJson.Errror || "Failed to fetch OHT details");
      }

      const ohtData: OHTApiItem[] = ohtJson.Data || [];
      const detailsMap = new Map<number, OHTDetails>();
      
      ohtData.forEach((o) => {
        detailsMap.set(o.OhtId, {
          OHTId: o.OhtId,
          DistrictName: o.Districtname,
          BlockName: o.BlockName,
          GramPanchayatName: o.GramPanchayatName,
          VillageName: o.VillageName,
          OHTCapacity: o.OHTCapacity,
          NoOfPumps: o.NoOfPumps,
        });
      });

      setOhtDetailsMap(detailsMap);

      // Fetch cleaning status
      const cleaningRes = await fetch(
        `https://wmsapi.kdsgroup.co.in/api/OhtPump/GetOhtCleaningStatus?UserId=${userId}`,
        {
          method: "GET",
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json'
          }
        }
      );

      const cleaningJson = await cleaningRes.json();
      const cleaningData: CleaningStatusItem[] = cleaningJson.Status ? (cleaningJson.Data || []) : [];

      // Fetch billing status
      const billingRes = await fetch(
        `https://wmsapi.kdsgroup.co.in/api/OhtPump/GetOhtElectricityBillStatus?UserId=${userId}`,
        {
          method: "GET",
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json'
          }
        }
      );

      const billingJson = await billingRes.json();
      const billingData: BillingStatusItem[] = billingJson.Status ? (billingJson.Data || []) : [];

      // Combine the data
      const combined = combineData(detailsMap, cleaningData, billingData);
      setCombinedRecords(combined);

      toast.success(`Loaded ${combined.length} records`);

    } catch (e: any) {
      console.error("Fetch error:", e);
      setError(e?.message || "Failed to load data");
      toast.error("Failed to load data: " + (e?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const combineData = (
    detailsMap: Map<number, OHTDetails>,
    cleaningData: CleaningStatusItem[],
    billingData: BillingStatusItem[]
  ): CombinedRecord[] => {
    const recordsMap = new Map<string, CombinedRecord>();

    // Process cleaning data
    cleaningData.forEach((cleaning) => {
      const details = detailsMap.get(cleaning.OhtId);
      if (!details) return;

      const key = `${cleaning.OhtId}-${cleaning.OhtCleaningDate}`;
      
      if (!recordsMap.has(key)) {
        recordsMap.set(key, {
          OhtId: cleaning.OhtId,
          DistrictName: details.DistrictName,
          BlockName: details.BlockName,
          GramPanchayatName: details.GramPanchayatName,
          VillageName: details.VillageName,
          OHTCapacity: details.OHTCapacity,
          NoOfPumps: details.NoOfPumps,
          OhtTankCleaningStatus: cleaning.OhtTankCleaningStatus,
          OhtSolarCleaningStatus: cleaning.OhtSolarCleaningStatus,
          OhtCleaningDate: cleaning.OhtCleaningDate,
          OhtElectricityBillAmount: null,
          DepositAmount: null,
          DepositAmountDate: null,
          BalanceAmount: null,
        });
      } else {
        const existing = recordsMap.get(key)!;
        existing.OhtTankCleaningStatus = cleaning.OhtTankCleaningStatus;
        existing.OhtSolarCleaningStatus = cleaning.OhtSolarCleaningStatus;
        existing.OhtCleaningDate = cleaning.OhtCleaningDate;
      }
    });

    // Process billing data
    billingData.forEach((billing) => {
      const details = detailsMap.get(billing.OhtId);
      if (!details) return;

      const key = `${billing.OhtId}-${billing.DepositAmountDate}`;
      
      if (!recordsMap.has(key)) {
        recordsMap.set(key, {
          OhtId: billing.OhtId,
          DistrictName: details.DistrictName,
          BlockName: details.BlockName,
          GramPanchayatName: details.GramPanchayatName,
          VillageName: details.VillageName,
          OHTCapacity: details.OHTCapacity,
          NoOfPumps: details.NoOfPumps,
          OhtTankCleaningStatus: null,
          OhtSolarCleaningStatus: null,
          OhtCleaningDate: null,
          OhtElectricityBillAmount: billing.OhtElectricityBillAmount,
          DepositAmount: billing.DepositAmount,
          DepositAmountDate: billing.DepositAmountDate,
          BalanceAmount: billing.BalanceAmount,
        });
      } else {
        const existing = recordsMap.get(key)!;
        existing.OhtElectricityBillAmount = billing.OhtElectricityBillAmount;
        existing.DepositAmount = billing.DepositAmount;
        existing.DepositAmountDate = billing.DepositAmountDate;
        existing.BalanceAmount = billing.BalanceAmount;
      }
    });

    return Array.from(recordsMap.values()).sort((a, b) => b.OhtId - a.OhtId);
  };

  const getUniqueDistricts = () => {
    const districts = combinedRecords
      .filter(r => r.DistrictName)
      .map(r => r.DistrictName)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return districts;
  };

  const getUniqueBlocks = () => {
    const blocks = combinedRecords
      .filter(r => r.BlockName && (!selectedDistrict || r.DistrictName === selectedDistrict))
      .map(r => r.BlockName)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return blocks;
  };

  const getUniqueGramPanchayats = () => {
    const gramPanchayats = combinedRecords
      .filter(r => r.GramPanchayatName && 
        (!selectedDistrict || r.DistrictName === selectedDistrict) &&
        (!selectedBlock || r.BlockName === selectedBlock))
      .map(r => r.GramPanchayatName)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return gramPanchayats;
  };

  const getUniqueVillages = () => {
    const villages = combinedRecords
      .filter(r => r.VillageName && 
        (!selectedDistrict || r.DistrictName === selectedDistrict) &&
        (!selectedBlock || r.BlockName === selectedBlock) &&
        (!selectedGramPanchayat || r.GramPanchayatName === selectedGramPanchayat))
      .map(r => r.VillageName)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return villages;
  };

  const clearFilters = () => {
    setSelectedDistrict("");
    setSelectedBlock("");
    setSelectedGramPanchayat("");
    setSelectedVillage("");
    setSearch("");
  };

  const handleOhtClick = (ohtId: number) => {
  const details = ohtDetailsMap.get(ohtId);
  if (details) {
    setSelectedOht(details);
    setShowModal(true);
  }
};

const closeModal = () => {
  setShowModal(false);
  setSelectedOht(null);
};

  const filteredData = combinedRecords.filter((r) => {
    const matchesSearch = r.DistrictName.toLowerCase().includes(search.toLowerCase()) ||
                         r.BlockName.toLowerCase().includes(search.toLowerCase()) ||
                         r.GramPanchayatName.toLowerCase().includes(search.toLowerCase()) ||
                         r.VillageName.toLowerCase().includes(search.toLowerCase()) ||
                         r.OhtId.toString().includes(search);
    
    const matchesDistrict = !selectedDistrict || r.DistrictName === selectedDistrict;
    const matchesBlock = !selectedBlock || r.BlockName === selectedBlock;
    const matchesGramPanchayat = !selectedGramPanchayat || r.GramPanchayatName === selectedGramPanchayat;
    const matchesVillage = !selectedVillage || r.VillageName === selectedVillage;
    

    // Tab filtering
    if (activeTab === "cleaning") {
      return matchesSearch && matchesDistrict && matchesBlock && matchesGramPanchayat && matchesVillage && 
             (r.OhtTankCleaningStatus !== null || r.OhtSolarCleaningStatus !== null);
    } else if (activeTab === "billing") {
      return matchesSearch && matchesDistrict && matchesBlock && matchesGramPanchayat && matchesVillage && 
             r.OhtElectricityBillAmount !== null;
    }

    return matchesSearch && matchesDistrict && matchesBlock && matchesGramPanchayat && matchesVillage;
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status: number | null) => {
    if (status === null) return <span className="text-gray-400">-</span>;
    if (status === 1) return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Cleaned</span>;
    return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Not Cleaned</span>;
  };

  const handleDownload = () => {
    try {
      const exportData = filteredData.map((r) => ({
        'OHT ID': r.OhtId,
        'District': r.DistrictName,
        'Block': r.BlockName,
        'Gram Panchayat': r.GramPanchayatName,
        'Village': r.VillageName,
        'Capacity (KL)': r.OHTCapacity,
        'No. of Pumps': r.NoOfPumps,
        'Tank Cleaning': r.OhtTankCleaningStatus === 1 ? 'Cleaned' : r.OhtTankCleaningStatus === 0 ? 'Not Cleaned' : 'N/A',
        'Solar Cleaning': r.OhtSolarCleaningStatus === 1 ? 'Cleaned' : r.OhtSolarCleaningStatus === 0 ? 'Not Cleaned' : 'N/A',
        'Cleaning Date': formatDate(r.OhtCleaningDate),
        'Electricity Bill (₹)': r.OhtElectricityBillAmount || 'N/A',
        'Deposit Amount (₹)': r.DepositAmount || 'N/A',
        'Deposit Date': formatDate(r.DepositAmountDate),
        'Balance Amount (₹)': r.BalanceAmount || 'N/A',
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(
          key.length,
          ...exportData.map(row => String(row[key as keyof typeof row]).length)
        ) + 2
      }));
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'OHT_Cleaning_Billing');

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filename = `oht_cleaning_billing_${dateStr}.xlsx`;

      XLSX.writeFile(wb, filename);
      toast.success("Excel file downloaded successfully");
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data. Please try again.');
    }
  };

  if (userLoading) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  if (!userLoading && !userId) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access OHT cleaning and billing details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 relative z-10 min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">OHT Cleaning & Billing Details</h1>
        <p className="text-gray-600 mb-6">
          View comprehensive records of OHT tank cleaning, solar panel cleaning, and billing information.
        </p>

        {loading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-700">Loading records...</p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab("combined")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "combined"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            All Records
          </button>
          <button
            onClick={() => setActiveTab("cleaning")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "cleaning"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Cleaning Status
          </button>
          <button
            onClick={() => setActiveTab("billing")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "billing"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Billing Details
          </button>
        </div>

        {/* Location Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                if (e.target.value !== selectedDistrict) {
                  setSelectedBlock("");
                  setSelectedGramPanchayat("");
                  setSelectedVillage("");
                }
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">All Districts</option>
              {getUniqueDistricts().map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Block</label>
            <select
              value={selectedBlock}
              onChange={(e) => {
                setSelectedBlock(e.target.value);
                if (e.target.value !== selectedBlock) {
                  setSelectedGramPanchayat("");
                  setSelectedVillage("");
                }
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">All Blocks</option>
              {getUniqueBlocks().map((block) => (
                <option key={block} value={block}>
                  {block}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Gram Panchayat</label>
            <select
              value={selectedGramPanchayat}
              onChange={(e) => {
                setSelectedGramPanchayat(e.target.value);
                if (e.target.value !== selectedGramPanchayat) {
                  setSelectedVillage("");
                }
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">All Gram Panchayats</option>
              {getUniqueGramPanchayats().map((gp) => (
                <option key={gp} value={gp}>
                  {gp}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Village</label>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">All Villages</option>
              {getUniqueVillages().map((village) => (
                <option key={village} value={village}>
                  {village}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <input
              type="text"
              className="flex-1 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by OHT ID, district, block, panchayat, or village..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading}
            />
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              disabled={loading}
            >
              Clear Filters
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={fetchAllData} 
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              onClick={handleDownload} 
              disabled={loading || filteredData.length === 0}
            >
              Download Excel
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>Showing <strong>{filteredData.length}</strong> of <strong>{combinedRecords.length}</strong> records</span>
          <span className="text-gray-400">|</span>
          <span>Tab: <strong>{activeTab === "combined" ? "All Records" : activeTab === "cleaning" ? "Cleaning Status" : "Billing Details"}</strong></span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border border-gray-300 p-3 text-left font-medium">S.No.</th>
                <th className="border border-gray-300 p-3 text-left font-medium">OHT ID</th>
                <th className="border border-gray-300 p-3 text-left font-medium">District</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Block</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Gram Panchayat</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Village</th>
                {(activeTab === "combined" || activeTab === "cleaning") && (
                  <>
                    <th className="border border-gray-300 p-3 text-left font-medium">Tank Cleaning</th>
                    <th className="border border-gray-300 p-3 text-left font-medium">Solar Cleaning</th>
                    <th className="border border-gray-300 p-3 text-left font-medium">Cleaning Date</th>
                  </>
                )}
                {(activeTab === "combined" || activeTab === "billing") && (
                  <>
                    <th className="border border-gray-300 p-3 text-left font-medium">Electricity Bill (₹)</th>
                    <th className="border border-gray-300 p-3 text-left font-medium">Deposit (₹)</th>
                    <th className="border border-gray-300 p-3 text-left font-medium">Deposit Date</th>
                    <th className="border border-gray-300 p-3 text-left font-medium">Balance (₹)</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((r, index) => (
                <tr 
                  key={`${r.OhtId}-${index}`} 
                  className={`${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-blue-50 transition-colors`}
                >
                    <td className="border border-gray-300 p-3 text-center">
  {index + 1}
</td>
                  <td className="border border-gray-300 p-3 font-medium text-blue-600">
  <button
    onClick={() => handleOhtClick(r.OhtId)}
    className="hover:underline hover:text-blue-800 transition-colors cursor-pointer"
  >
    #{r.OhtId}
  </button>
</td>
                  <td className="border border-gray-300 p-3">{r.DistrictName}</td>
                  <td className="border border-gray-300 p-3">{r.BlockName}</td>
                  <td className="border border-gray-300 p-3">{r.GramPanchayatName}</td>
                  <td className="border border-gray-300 p-3">{r.VillageName}</td>
                  
                  {(activeTab === "combined" || activeTab === "cleaning") && (
                    <>
                      <td className="border border-gray-300 p-3">
                        {getStatusBadge(r.OhtTankCleaningStatus)}
                      </td>
                      <td className="border border-gray-300 p-3">
                        {getStatusBadge(r.OhtSolarCleaningStatus)}
                      </td>
                      <td className="border border-gray-300 p-3">
                        {formatDate(r.OhtCleaningDate)}
                      </td>
                    </>
                  )}
                  
                  {(activeTab === "combined" || activeTab === "billing") && (
  <>
    <td className="border border-gray-300 p-3 text-right">
      {r.OhtElectricityBillAmount !== null ? 
        `₹${r.OhtElectricityBillAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
        : <span className="text-gray-400">-</span>
      }
    </td>
    <td className="border border-gray-300 p-3 text-right">
      {r.DepositAmount !== null ? 
        `₹${r.DepositAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
        : <span className="text-gray-400">-</span>
      }
    </td>
    <td className="border border-gray-300 p-3">
      {formatDate(r.DepositAmountDate)}
    </td>
    <td className="border border-gray-300 p-3 text-right">
      {r.BalanceAmount !== null ? 
        <span className={r.BalanceAmount > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
          ₹{r.BalanceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        : <span className="text-gray-400">-</span>
      }
    </td>
  </>
)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium mb-2">No records found</h3>
            <p className="text-sm">Try adjusting your filters or search criteria.</p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {filteredData.length > 0 && activeTab === "billing" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <span className="text-2xl">💡</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Electricity Bills</p>
                <p className="text-xl font-bold text-blue-600">
                  ₹{filteredData
                    .filter(r => r.OhtElectricityBillAmount !== null)
                    .reduce((sum, r) => sum + (r.OhtElectricityBillAmount || 0), 0)
                    .toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Deposits</p>
                <p className="text-xl font-bold text-green-600">
                  ₹{filteredData
                    .filter(r => r.DepositAmount !== null)
                    .reduce((sum, r) => sum + (r.DepositAmount || 0), 0)
                    .toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Balance Due</p>
                <p className="text-xl font-bold text-red-600">
                  ₹{filteredData
                    .filter(r => r.BalanceAmount !== null)
                    .reduce((sum, r) => sum + (r.BalanceAmount || 0), 0)
                    .toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
{/* OHT Details Modal */}
{showModal && selectedOht && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h2 className="text-xl font-bold">OHT Details - #{selectedOht.OHTId}</h2>
        <button
          onClick={closeModal}
          className="text-white hover:text-gray-200 text-2xl font-bold"
        >
          ×
        </button>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-b pb-3">
            <p className="text-sm text-gray-600 mb-1">OHT ID</p>
            <p className="text-lg font-semibold text-blue-600">#{selectedOht.OHTId}</p>
          </div>
          
          <div className="border-b pb-3">
            <p className="text-sm text-gray-600 mb-1">District</p>
            <p className="text-lg font-semibold">{selectedOht.DistrictName}</p>
          </div>
          
          <div className="border-b pb-3">
            <p className="text-sm text-gray-600 mb-1">Block</p>
            <p className="text-lg font-semibold">{selectedOht.BlockName}</p>
          </div>
          
          <div className="border-b pb-3">
            <p className="text-sm text-gray-600 mb-1">Gram Panchayat</p>
            <p className="text-lg font-semibold">{selectedOht.GramPanchayatName}</p>
          </div>
          
          <div className="border-b pb-3">
            <p className="text-sm text-gray-600 mb-1">Village</p>
            <p className="text-lg font-semibold">{selectedOht.VillageName}</p>
          </div>
          
          <div className="border-b pb-3">
            <p className="text-sm text-gray-600 mb-1">OHT Capacity</p>
            <p className="text-lg font-semibold">{selectedOht.OHTCapacity} KL</p>
          </div>
          
          <div className="border-b pb-3">
            <p className="text-sm text-gray-600 mb-1">Number of Pumps</p>
            <p className="text-lg font-semibold">{selectedOht.NoOfPumps}</p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={closeModal}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      {/* Cleaning Summary Cards */}
      {filteredData.length > 0 && activeTab === "cleaning" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <span className="text-2xl">🏗️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tank Cleaned</p>
                <p className="text-xl font-bold text-green-600">
                  {filteredData.filter(r => r.OhtTankCleaningStatus === 1).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <span className="text-2xl">☀️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Solar Cleaned</p>
                <p className="text-xl font-bold text-yellow-600">
                  {filteredData.filter(r => r.OhtSolarCleaningStatus === 1).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <span className="text-2xl">❌</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Cleaning</p>
                <p className="text-xl font-bold text-red-600">
                  {filteredData.filter(r => r.OhtTankCleaningStatus === 0 || r.OhtSolarCleaningStatus === 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default ViewOHTCleaningDetails;