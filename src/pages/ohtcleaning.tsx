import { useEffect, useRef, useState } from "react";
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

interface OHTState {
  OHTId: number;
  DistrictName: string;
  BlockName: string;
  GramPanchayatName: string;
  VillageName: string;
  VillageId: number;
  OHTCapacity: number;
  NoOfPumps: number;
}

interface CleaningRecord {
  OhtId: number;
  VillageId: number;
  OhtTankCleaningStatus: number;
  OhtSolarCleaningStatus: number;
  OhtCleaningDate: string;
  OhtElectricityBillAmnt: number;
  DepositeAmnt: number;
  DepositeAmntDate: string;
  BalanceAmnt: number;
}

const ManageOHTCleaning = () => {
  const { userId, role, isLoading: userLoading } = useUserInfo();

  const [ohtList, setOhtList] = useState<OHTState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedBlock, setSelectedBlock] = useState<string>("");
  const [selectedGramPanchayat, setSelectedGramPanchayat] = useState<string>("");
  const [selectedVillage, setSelectedVillage] = useState<string>("");

  const [selectedOHT, setSelectedOHT] = useState<OHTState | null>(null);
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Cleaning form state
  const [tankCleaningStatus, setTankCleaningStatus] = useState<number>(0);
  const [solarCleaningStatus, setSolarCleaningStatus] = useState<number>(0);
  const [cleaningDate, setCleaningDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [electricityBillAmount, setElectricityBillAmount] = useState<number>("");
  const [depositAmount, setDepositAmount] = useState<number>("");
  const [depositDate, setDepositDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const balanceAmount = (Number(electricityBillAmount) || 0) - (Number(depositAmount) || 0);

  useEffect(() => {
    if (!userLoading && userId) {
      fetchOHTs();
    }
  }, [userId, userLoading]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (showModal && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowModal(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showModal]);

  const fetchOHTs = async () => {
    if (!userId) {
      console.error("Cannot fetch OHTs: userId is null");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(
        `https://wmsapi.kdsgroup.co.in/api/Master/GetOHTListByVillage?VillageId=0&UserId=${userId}`,
        { 
          method: "GET", 
          headers: { 
            'Accept': '*/*',
            'Content-Type': 'application/json'
          } 
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      if (!json.Status) {
        throw new Error(json.Message || json.Errror || "API returned error");
      }

      const apiData: OHTApiItem[] = json.Data || [];
      
      const mapped: OHTState[] = apiData.map((o) => ({
        OHTId: o.OhtId,
        DistrictName: o.Districtname,
        BlockName: o.BlockName,
        GramPanchayatName: o.GramPanchayatName,
        VillageName: o.VillageName,
        VillageId: 0, // You may need to fetch this separately if available
        OHTCapacity: o.OHTCapacity,
        NoOfPumps: o.NoOfPumps,
      }));

      setOhtList(mapped);
      toast.success(`Loaded ${mapped.length} OHT records`);

    } catch (e: any) {
      console.error("ManageOHTCleaning fetch error:", e);
      setError(e?.message || "Failed to load OHT data");
      toast.error("Failed to load OHT data: " + (e?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const getUniqueDistricts = () => {
    const districts = ohtList
      .filter(o => o.DistrictName)
      .map(o => o.DistrictName)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return districts;
  };

  const getUniqueBlocks = () => {
    const blocks = ohtList
      .filter(o => o.BlockName && (!selectedDistrict || o.DistrictName === selectedDistrict))
      .map(o => o.BlockName)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return blocks;
  };

  const getUniqueGramPanchayats = () => {
    const gramPanchayats = ohtList
      .filter(o => o.GramPanchayatName && 
        (!selectedDistrict || o.DistrictName === selectedDistrict) &&
        (!selectedBlock || o.BlockName === selectedBlock))
      .map(o => o.GramPanchayatName)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return gramPanchayats;
  };

  const getUniqueVillages = () => {
    const villages = ohtList
      .filter(o => o.VillageName && 
        (!selectedDistrict || o.DistrictName === selectedDistrict) &&
        (!selectedBlock || o.BlockName === selectedBlock) &&
        (!selectedGramPanchayat || o.GramPanchayatName === selectedGramPanchayat))
      .map(o => o.VillageName)
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

  const filteredData = ohtList.filter((o) => {
    const matchesSearch = o.DistrictName.toLowerCase().includes(search.toLowerCase()) ||
                         o.BlockName.toLowerCase().includes(search.toLowerCase()) ||
                         o.GramPanchayatName.toLowerCase().includes(search.toLowerCase()) ||
                         o.VillageName.toLowerCase().includes(search.toLowerCase());
    
    const matchesDistrict = !selectedDistrict || o.DistrictName === selectedDistrict;
    const matchesBlock = !selectedBlock || o.BlockName === selectedBlock;
    const matchesGramPanchayat = !selectedGramPanchayat || o.GramPanchayatName === selectedGramPanchayat;
    const matchesVillage = !selectedVillage || o.VillageName === selectedVillage;

    return matchesSearch && matchesDistrict && matchesBlock && matchesGramPanchayat && matchesVillage;
  });

  const handleOpenModal = (oht: OHTState) => {
    setSelectedOHT(oht);
    // Reset form
    setTankCleaningStatus(0);
    setSolarCleaningStatus(0);
    setCleaningDate(new Date().toISOString().split('T')[0]);
    setElectricityBillAmount("");
    setDepositAmount("");
    setDepositDate(new Date().toISOString().split('T')[0]);
    setShowModal(true);
  };

  const handleSaveCleaningRecord = async () => {
    if (!selectedOHT || !userId) {
      toast.error("Missing required information");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        OhtId: selectedOHT.OHTId,
        VillageId: selectedOHT.VillageId,
        OhtTankCleaningStatus: tankCleaningStatus,
        OhtSolarCleaningStatus: solarCleaningStatus,
        OhtCleaningDate: new Date(cleaningDate).toISOString(),
        OhtElectricityBillAmnt: Number(electricityBillAmount) || 0,
        DepositeAmnt: Number(depositAmount) || 0,
        DepositeAmntDate: new Date(depositDate).toISOString(),
        BalanceAmnt: balanceAmount,
        CreatedBy: userId,
        DeviceToken: "web-application",
        IpAddress: "127.0.0.1"
      };

      console.log("Submitting cleaning record:", payload);

      const res = await fetch(
        "https://wmsapi.kdsgroup.co.in/api/OhtPump/InsertOhtCleaningAndBillingDetails",
        {
          method: "POST",
          headers: { 
            'Accept': '*/*',
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();
      
      if (result.Status) {
        toast.success("Cleaning record saved successfully!");
        setShowModal(false);
        setSelectedOHT(null);
      } else {
        toast.error(`Failed to save: ${result.Message || result.Errror || "Unknown error"}`);
      }

    } catch (err: any) {
      console.error("Save cleaning record error:", err);
      toast.error("Failed to save cleaning record: " + (err?.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    try {
      const exportData = filteredData.map((o) => ({
        'OHT ID': o.OHTId,
        'District': o.DistrictName,
        'Block': o.BlockName,
        'Gram Panchayat': o.GramPanchayatName,
        'Village': o.VillageName,
        'OHT Capacity': o.OHTCapacity,
        'Number of Pumps': o.NoOfPumps,
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(
          key.length,
          ...exportData.map(row => String(row[key as keyof typeof row]).length)
        )
      }));
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'OHT_List');

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filename = `oht_cleaning_list_${dateStr}.xlsx`;

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
          <p className="text-gray-600">Please log in to access the OHT cleaning management system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 relative z-10 min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">OHT Cleaning Management</h1>
        <p className="text-gray-600 mb-6">
          Manage OHT tank cleaning, solar panel cleaning, and billing details for Overhead Tanks.
        </p>

        {loading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-700">Loading OHT records...</p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}

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
              placeholder="Search by district, block, panchayat, or village..."
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

          <button 
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            onClick={handleDownload} 
            disabled={loading || filteredData.length === 0}
          >
            Download Excel
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>Showing <strong>{filteredData.length}</strong> of <strong>{ohtList.length}</strong> OHT records</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border border-gray-300 p-3 text-left font-medium">OHT ID</th>
                <th className="border border-gray-300 p-3 text-left font-medium">District</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Block</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Gram Panchayat</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Village</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Capacity (KL)</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((o, index) => (
                <tr 
                  key={o.OHTId} 
                  className={`${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-blue-50 transition-colors`}
                >
                  <td className="border border-gray-300 p-3 font-medium text-blue-600">
                    #{o.OHTId}
                  </td>
                  <td className="border border-gray-300 p-3">{o.DistrictName}</td>
                  <td className="border border-gray-300 p-3">{o.BlockName}</td>
                  <td className="border border-gray-300 p-3">{o.GramPanchayatName}</td>
                  <td className="border border-gray-300 p-3">{o.VillageName}</td>
                  <td className="border border-gray-300 p-3 font-medium">{o.OHTCapacity.toLocaleString()} KL</td>
                  <td className="border border-gray-300 p-3">
                    <button
                      onClick={() => handleOpenModal(o)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      Add Cleaning Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🏗️</div>
            <h3 className="text-lg font-medium mb-2">No OHT records found</h3>
            <p className="text-sm">Try adjusting your filters or search criteria.</p>
          </div>
        )}
      </div>

      {/* Modal for Adding Cleaning Record */}
      {showModal && selectedOHT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-blue-600 text-white p-6 rounded-t-lg">
              <h2 className="text-2xl font-bold">Add Cleaning Record</h2>
              <p className="text-blue-100 mt-1">
                OHT ID: #{selectedOHT.OHTId} - {selectedOHT.VillageName}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* OHT Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">OHT Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-600">District:</span> <strong>{selectedOHT.DistrictName}</strong></div>
                  <div><span className="text-gray-600">Block:</span> <strong>{selectedOHT.BlockName}</strong></div>
                  <div><span className="text-gray-600">Gram Panchayat:</span> <strong>{selectedOHT.GramPanchayatName}</strong></div>
                  <div><span className="text-gray-600">Capacity:</span> <strong>{selectedOHT.OHTCapacity} KL</strong></div>
                </div>
              </div>

              {/* Cleaning Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">OHT Tank Cleaning Status</label>
                  <select
                    value={tankCleaningStatus}
                    onChange={(e) => setTankCleaningStatus(Number(e.target.value))}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>Not Cleaned</option>
                    <option value={1}>Cleaned</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Solar Panel Cleaning Status</label>
                  <select
                    value={solarCleaningStatus}
                    onChange={(e) => setSolarCleaningStatus(Number(e.target.value))}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>Not Cleaned</option>
                    <option value={1}>Cleaned</option>
                  </select>
                </div>
              </div>

              {/* Cleaning Date */}
              <div>
                <label className="block text-sm font-medium mb-2">Cleaning Date</label>
                <input
                  type="date"
                  value={cleaningDate}
                  onChange={(e) => setCleaningDate(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Billing Details */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Billing Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Electricity Bill Amount (₹)</label>
                    <input
                      type="number"
                      value={electricityBillAmount}
                      onChange={(e) => setElectricityBillAmount(e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Deposit Amount (₹)</label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Deposit Date</label>
                    <input
                      type="date"
                      value={depositDate}
                      onChange={(e) => setDepositDate(e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
  <label className="block text-sm font-medium mb-2">Balance Amount (₹)</label>
  <div className="w-full p-2 border rounded-md bg-gray-100 font-semibold">
    <span className={balanceAmount > 0 ? 'text-red-600' : balanceAmount < 0 ? 'text-green-600' : 'text-gray-600'}>
      ₹{balanceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  </div>
  
</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCleaningRecord}
                  className={`px-6 py-2 rounded-md text-white transition-colors ${
                    saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOHTCleaning;