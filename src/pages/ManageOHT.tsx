import { useEffect, useRef, useState } from "react";
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

/* --- API response shapes --- */
interface DistrictApi {
  DistrictId: number;
  DistrictName: string;
  DistrictNameHidi?: string;
}

interface BlockApi {
  BlockId: number;
  DistrictId: number;
  BlockName: string;
  BlockNameHindi?: string;
  Code?: string;
}

interface GramPanchayatApi {
  Id: number;
  BlockId: number;
  GramPanchayatName: string;
  GramPanchayatHindi?: string;
  Code?: string;
}

interface VillageApi {
  Id: number;
  VillageName: string;
}

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
  OHTCapacity: number;
  NoOfPumps: number;
}

interface LocationMapping {
  villageName: string;
  gramPanchayatId: number;
  gramPanchayatName: string;
  blockId: number;
  blockName: string;
  districtId: number;
  districtName: string;
}

const ManageOHT = () => {
  // Mock user info - replace with actual hook
  const userId = 5; // You can replace this with useUserInfo() hook

  const [ohtList, setOhtList] = useState<OHTState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editedOHTs, setEditedOHTs] = useState<Set<number>>(new Set());

  // Location hierarchy
  const [districts, setDistricts] = useState<DistrictApi[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [blocks, setBlocks] = useState<BlockApi[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayatApi[]>([]);
  const [selectedGramPanchayatId, setSelectedGramPanchayatId] = useState<number | null>(null);
  const [villages, setVillages] = useState<VillageApi[]>([]);
  const [selectedVillageId, setSelectedVillageId] = useState<number | null>(null);

  const [locationMap, setLocationMap] = useState<Record<number, LocationMapping>>({});
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Initialize data fetching
  useEffect(() => {
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (selectedDistrictId) {
      fetchBlocks(selectedDistrictId);
    } else {
      setBlocks([]);
      setSelectedBlockId(null);
    }
  }, [selectedDistrictId]);

  useEffect(() => {
    if (selectedBlockId) {
      fetchGramPanchayats(selectedBlockId);
    } else {
      setGramPanchayats([]);
      setSelectedGramPanchayatId(null);
    }
  }, [selectedBlockId]);

  useEffect(() => {
    if (selectedBlockId && selectedGramPanchayatId) {
      fetchVillages(selectedBlockId, selectedGramPanchayatId);
    } else {
      setVillages([]);
      setSelectedVillageId(null);
    }
  }, [selectedBlockId, selectedGramPanchayatId]);

  useEffect(() => {
    if (selectedVillageId) {
      fetchOHTs(selectedVillageId);
    } else {
      setOhtList([]);
    }
  }, [selectedVillageId]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (showModal && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowModal(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showModal]);

  // Fetch districts
  const fetchDistricts = async () => {
    try {
      const res = await fetch(
        `https://wmsapi.kdsgroup.co.in/api/Master/GetDistrict?UserId=${userId}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Failed to fetch districts");
      const data = await res.json();
      if (data.Status && data.Data) {
        setDistricts(data.Data);
      }
    } catch (err) {
      console.error("Error fetching districts:", err);
      toast.error("Failed to fetch districts");
    }
  };

  // Fetch blocks
  const fetchBlocks = async (districtId: number) => {
    try {
      const res = await fetch(
        "https://wmsapi.kdsgroup.co.in/api/Master/GetBlockListByDistrict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ UserId: userId, DistrictId: districtId }),
        }
      );
      if (!res.ok) throw new Error("Failed to fetch blocks");
      const data = await res.json();
      if (data.Status && data.Data) {
        setBlocks(data.Data);
      } else {
        setBlocks([]);
      }
    } catch (err) {
      console.error("Error fetching blocks:", err);
      toast.error("Failed to fetch blocks");
      setBlocks([]);
    }
  };

  // Fetch gram panchayats
  const fetchGramPanchayats = async (blockId: number) => {
    try {
      const res = await fetch(
        "https://wmsapi.kdsgroup.co.in/api/Master/GetGramPanchayatByBlock",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ UserId: userId, BlockId: blockId }),
        }
      );
      if (!res.ok) throw new Error("Failed to fetch gram panchayats");
      const data = await res.json();
      if (data.Status && data.Data) {
        setGramPanchayats(data.Data);
      } else {
        setGramPanchayats([]);
      }
    } catch (err) {
      console.error("Error fetching gram panchayats:", err);
      toast.error("Failed to fetch gram panchayats");
      setGramPanchayats([]);
    }
  };

  // Fetch villages
  const fetchVillages = async (blockId: number, gramPanchayatId: number) => {
    try {
      const res = await fetch(
        "https://wmsapi.kdsgroup.co.in/api/Master/GetVillegeByGramPanchayat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            BlockId: blockId,
            GramPanchayatId: gramPanchayatId,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to fetch villages");
      const data = await res.json();
      if (data.Status && data.Data) {
        setVillages(data.Data);
        
        // Build location mapping for current villages
        const currentDistrict = districts.find(d => d.DistrictId === selectedDistrictId);
        const currentBlock = blocks.find(b => b.BlockId === selectedBlockId);
        const currentGP = gramPanchayats.find(gp => gp.Id === selectedGramPanchayatId);
        
        if (currentDistrict && currentBlock && currentGP) {
          const newLocationMap: Record<number, LocationMapping> = {};
          data.Data.forEach((village: VillageApi) => {
            newLocationMap[village.Id] = {
              villageName: village.VillageName,
              gramPanchayatId: currentGP.Id,
              gramPanchayatName: currentGP.GramPanchayatName,
              blockId: currentBlock.BlockId,
              blockName: currentBlock.BlockName,
              districtId: currentDistrict.DistrictId,
              districtName: currentDistrict.DistrictName,
            };
          });
          setLocationMap(prev => ({ ...prev, ...newLocationMap }));
        }
      } else {
        setVillages([]);
      }
    } catch (err) {
      console.error("Error fetching villages:", err);
      toast.error("Failed to fetch villages");
      setVillages([]);
    }
  };

  // Fetch OHT data
  const fetchOHTs = async (villageId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(
        `https://wmsapi.kdsgroup.co.in/api/Master/GetOHTListByVillage?VillageId=${villageId}`,
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
        OHTCapacity: o.OHTCapacity,
        NoOfPumps: o.NoOfPumps,
      }));

      setOhtList(mapped);
      toast.success(`Loaded ${mapped.length} OHT records`);

    } catch (e: any) {
      console.error("ManageOHT fetch error:", e);
      setError(e?.message || "Failed to load OHT data");
      toast.error("Failed to load OHT data: " + (e?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      setEditedOHTs(new Set());
    }
    setEditMode((s) => !s);
  };

  const handleChange = (id: number, field: keyof OHTState, value: string | number) => {
    setOhtList((prev) => prev.map((o) => (o.OHTId === id ? { ...o, [field]: value } : o)));
    setEditedOHTs(prev => new Set([...prev, id]));
  };

  const handleSaveChanges = async () => {
    if (editedOHTs.size === 0) {
      toast.info("No changes to save");
      return;
    }

    setSaving(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const ohtId of editedOHTs) {
        const oht = ohtList.find(o => o.OHTId === ohtId);
        if (!oht) continue;

        const payload = {
          OHTId: oht.OHTId,
          OHTCapacity: oht.OHTCapacity,
          NoOfPumps: oht.NoOfPumps,
          UpdatedBy: userId,
          IPAddress: "127.0.0.1" // You can get real IP if needed
        };

        try {
          const res = await fetch(
            "https://wmsapi.kdsgroup.co.in/api/User/UpdateOHTDetailsByOHTId",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );

          const result = await res.json();
          if (result.Status) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to update OHT ${ohtId}:`, result.Message || result.Errror);
          }
        } catch (err) {
          errorCount++;
          console.error(`Error updating OHT ${ohtId}:`, err);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully updated ${successCount} OHT records`);
        setEditedOHTs(new Set());
        setEditMode(false);
        if (selectedVillageId) {
          fetchOHTs(selectedVillageId); // Refresh data
        }
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to update ${errorCount} OHT records`);
      }

    } catch (err) {
      console.error("Save changes error:", err);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    setDownloading(true);
    
    try {
      const exportData = filteredData.map((o) => ({
        'District': o.DistrictName,
        'Block': o.BlockName,
        'Gram Panchayat': o.GramPanchayatName,
        'Village': o.VillageName,
        'OHT ID': o.OHTId,
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

      XLSX.utils.book_append_sheet(wb, ws, 'OHT_Records');

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filename = `oht_records_export_${dateStr}.xlsx`;

      XLSX.writeFile(wb, filename);
      toast.success("Excel file downloaded successfully");
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const clearFilters = () => {
    setSelectedDistrictId(null);
    setSelectedBlockId(null);
    setSelectedGramPanchayatId(null);
    setSelectedVillageId(null);
    setSearch("");
  };

  const filteredData = ohtList.filter((o) => {
    const matchesSearch = o.DistrictName.toLowerCase().includes(search.toLowerCase()) ||
                         o.BlockName.toLowerCase().includes(search.toLowerCase()) ||
                         o.GramPanchayatName.toLowerCase().includes(search.toLowerCase()) ||
                         o.VillageName.toLowerCase().includes(search.toLowerCase());
    
    return matchesSearch;
  });

  const getSelectedLocationName = () => {
    if (selectedVillageId) {
      const village = villages.find(v => v.Id === selectedVillageId);
      return village?.VillageName || `Village ID: ${selectedVillageId}`;
    }
    if (selectedGramPanchayatId) {
      const gp = gramPanchayats.find(gp => gp.Id === selectedGramPanchayatId);
      return gp?.GramPanchayatName || "Selected Gram Panchayat";
    }
    if (selectedBlockId) {
      const block = blocks.find(b => b.BlockId === selectedBlockId);
      return block?.BlockName || "Selected Block";
    }
    if (selectedDistrictId) {
      const district = districts.find(d => d.DistrictId === selectedDistrictId);
      return district?.DistrictName || "Selected District";
    }
    return "All Areas";
  };

  return (
    <div className="p-6 relative z-10 min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Manage Overhead Tanks (OHT)</h1>
        <p className="text-gray-600 mb-6">
          View, edit, and manage Overhead Tank records. Use location filters to narrow down your search.
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
              value={selectedDistrictId || ""}
              onChange={(e) => setSelectedDistrictId(Number(e.target.value) || null)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d.DistrictId} value={d.DistrictId}>
                  {d.DistrictName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Block</label>
            <select
              value={selectedBlockId || ""}
              onChange={(e) => setSelectedBlockId(Number(e.target.value) || null)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || !selectedDistrictId}
            >
              <option value="">Select Block</option>
              {blocks.map((b) => (
                <option key={b.BlockId} value={b.BlockId}>
                  {b.BlockName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Gram Panchayat</label>
            <select
              value={selectedGramPanchayatId || ""}
              onChange={(e) => setSelectedGramPanchayatId(Number(e.target.value) || null)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || !selectedBlockId}
            >
              <option value="">Select Gram Panchayat</option>
              {gramPanchayats.map((gp) => (
                <option key={gp.Id} value={gp.Id}>
                  {gp.GramPanchayatName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Village</label>
            <select
              value={selectedVillageId || ""}
              onChange={(e) => setSelectedVillageId(Number(e.target.value) || null)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || !selectedGramPanchayatId}
            >
              <option value="">Select Village</option>
              {villages.map((v) => (
                <option key={v.Id} value={v.Id}>
                  {v.VillageName}
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

          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-4 py-2 rounded-md text-white transition-colors ${
                downloading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
              }`}
              onClick={handleDownload} 
              disabled={loading || downloading || filteredData.length === 0}
            >
              {downloading ? 'Downloading...' : 'Download Excel'}
            </button>

            {!editMode ? (
              <button 
                className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors" 
                onClick={handleEditToggle} 
                disabled={loading || ohtList.length === 0}
              >
                Edit Records
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors" 
                  onClick={handleEditToggle}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-white transition-colors ${
                    saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  onClick={handleSaveChanges}
                  disabled={saving || editedOHTs.size === 0}
                >
                  {saving ? 'Saving...' : `Save Changes (${editedOHTs.size})`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>Location: <strong>{getSelectedLocationName()}</strong></span>
          <span>Showing <strong>{filteredData.length}</strong> of <strong>{ohtList.length}</strong> OHT records</span>
          {editedOHTs.size > 0 && (
            <span className="text-orange-600">
              <strong>{editedOHTs.size}</strong> records modified
            </span>
          )}
        </div>
      </div>

      {/* Selection Notice */}
      {!selectedVillageId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-medium text-yellow-800">Select a village to view OHT records</h3>
              <p className="text-sm text-yellow-600">Please use the location filters above to select a specific village.</p>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      {selectedVillageId && (
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
                  <th className="border border-gray-300 p-3 text-left font-medium">Capacity (L)</th>
                  <th className="border border-gray-300 p-3 text-left font-medium">No. of Pumps</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((o, index) => {
                  const isEdited = editedOHTs.has(o.OHTId);
                  
                  return (
                    <tr 
                      key={o.OHTId} 
                      className={`${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      } hover:bg-blue-50 transition-colors ${
                        isEdited ? 'ring-2 ring-orange-200 bg-orange-50' : ''
                      }`}
                    >
                      <td className="border border-gray-300 p-3 font-medium text-blue-600">
                        #{o.OHTId}
                      </td>
                      
                      <td className="border border-gray-300 p-3">{o.DistrictName}</td>
                      <td className="border border-gray-300 p-3">{o.BlockName}</td>
                      <td className="border border-gray-300 p-3">{o.GramPanchayatName}</td>
                      <td className="border border-gray-300 p-3">{o.VillageName}</td>

                      <td className="border border-gray-300 p-3">
                        {editMode ? (
                          <input
                            type="number"
                            className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={o.OHTCapacity}
                            onChange={(e) => handleChange(o.OHTId, "OHTCapacity", Number(e.target.value))}
                            min="0"
                          />
                        ) : (
                          <span className="font-medium">{o.OHTCapacity.toLocaleString()}</span>
                        )}
                      </td>

                      <td className="border border-gray-300 p-3">
                        {editMode ? (
                          <input
                            type="number"
                            className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={o.NoOfPumps}
                            onChange={(e) => handleChange(o.OHTId, "NoOfPumps", Number(e.target.value))}
                            min="0"
                          />
                        ) : (
                          <span className="font-medium">{o.NoOfPumps}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && !loading && selectedVillageId && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="text-lg font-medium mb-2">No OHT records found</h3>
              <p className="text-sm">No overhead tanks found for the selected location or search criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Add OHT Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
          <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold mb-4 text-gray-800">Add New OHT</h2>
            <p className="text-sm text-gray-600 mb-6">
              Create a new Overhead Tank record for the selected location.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">OHT Capacity (Liters)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter capacity in liters"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Number of Pumps</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter number of pumps"
                  min="0"
                />
              </div>

              
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  toast.success("OHT record would be added here");
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Add OHT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Cards */}
      {selectedVillageId && ohtList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <span className="text-2xl">🏗️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total OHTs</p>
                <p className="text-xl font-bold text-gray-800">{ohtList.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <span className="text-2xl">💧</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Capacity</p>
                <p className="text-xl font-bold text-blue-600">
                  {ohtList.reduce((sum, o) => sum + o.OHTCapacity, 0).toLocaleString()}L
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <span className="text-2xl">⚙️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pumps</p>
                <p className="text-xl font-bold text-purple-600">
                  {ohtList.reduce((sum, o) => sum + o.NoOfPumps, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOHT;