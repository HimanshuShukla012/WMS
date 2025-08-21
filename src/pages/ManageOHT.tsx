import { useEffect, useRef, useState } from "react";
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { useUserInfo } from "../utils/userInfo";

/* --- API response shapes --- */
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

const ManageOHT = () => {
  const { userId, role, isLoading: userLoading } = useUserInfo();

  const [ohtList, setOhtList] = useState<OHTState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editedOHTs, setEditedOHTs] = useState<Set<number>>(new Set());

  // Client-side filters - no longer tied to API calls
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedBlock, setSelectedBlock] = useState<string>("");
  const [selectedGramPanchayat, setSelectedGramPanchayat] = useState<string>("");
  const [selectedVillage, setSelectedVillage] = useState<string>("");

  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Initialize data fetching - only when userId is available
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

  // Fetch ALL OHT data at once with VillageId = 0
  const fetchOHTs = async () => {
    if (!userId) {
      console.error("Cannot fetch OHTs: userId is null");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching all OHT records with userId:", userId, "role:", role);
      
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

  // Get unique values for filter dropdowns from the fetched data
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

    if (!userId) {
      toast.error("User information not available");
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
          IPAddress: "127.0.0.1"
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
        fetchOHTs(); // Refresh all data
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
    setSelectedDistrict("");
    setSelectedBlock("");
    setSelectedGramPanchayat("");
    setSelectedVillage("");
    setSearch("");
  };

  // Client-side filtering of all OHT records
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

  const getSelectedLocationName = () => {
    if (selectedVillage) return selectedVillage;
    if (selectedGramPanchayat) return selectedGramPanchayat;
    if (selectedBlock) return selectedBlock;
    if (selectedDistrict) return selectedDistrict;
    return "All Areas";
  };

  // Show loading state while user info is being fetched
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

  // Show error if user info couldn't be loaded
  if (!userLoading && !userId) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the OHT management system.</p>
        </div>
      </div>
    );
  }

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

        {/* Location Filters - Now client-side only */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                // Reset dependent filters when district changes
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
            <label className="block text-sm font-medium mb-1">Select Block</label>
            <select
              value={selectedBlock}
              onChange={(e) => {
                setSelectedBlock(e.target.value);
                // Reset dependent filters when block changes
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
                // Reset village filter when gram panchayat changes
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

      {/* Quick Stats Cards */}
      {ohtList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <span className="text-2xl">🏗️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total OHTs</p>
                <p className="text-xl font-bold text-gray-800">{filteredData.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Capacity</p>
                <p className="text-xl font-bold text-green-600">
                  {filteredData.length > 0 ? 
                    Math.round(filteredData.reduce((sum, o) => sum + o.OHTCapacity, 0) / filteredData.length).toLocaleString() : 0
                  }L
                </p>
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
                  {filteredData.reduce((sum, o) => sum + o.OHTCapacity, 0).toLocaleString()}L
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
                  {filteredData.reduce((sum, o) => sum + o.NoOfPumps, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border border-gray-300 p-3 text-left font-medium">OHT ID</th>
                <th className="border border-gray-300 p-3 text-left font-medium">District</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Block Name</th>
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
                        <span className="font-medium">{o.OHTCapacity.toLocaleString()}L</span>
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

        {filteredData.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🏗️</div>
            <h3 className="text-lg font-medium mb-2">No OHT records found</h3>
            <p className="text-sm">Try adjusting your filters or search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOHT;