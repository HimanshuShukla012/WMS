import { useState, useEffect } from "react";
import * as XLSX from 'xlsx';

interface Pump {
  pumpId: number;
  horsepower: number | string;
  powerSource: string;
  solarOutput: string;
  status: string;
}

interface PumpHouse {
  id: number;
  operatorName: string;
  contact: string;
  pumps: Pump[];
}

// Simple toast notification function
const toast = {
  success: (message: string) => {
    console.log(`✅ ${message}`);
    showToast(message, 'success');
  },
  error: (message: string) => {
    console.error(`❌ ${message}`);
    showToast(message, 'error');
  },
  info: (message: string) => {
    console.log(`ℹ️ ${message}`);
    showToast(message, 'info');
  }
};

const showToast = (message: string, type: 'success' | 'error' | 'info') => {
  const toastArea = document.getElementById('toast-area');
  if (toastArea) {
    const toastElement = document.createElement('div');
    toastElement.className = `p-3 rounded-md mb-2 transition-all duration-300 ${
      type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
      type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
      'bg-blue-100 text-blue-800 border border-blue-200'
    }`;
    toastElement.textContent = message;
    toastArea.appendChild(toastElement);
    
    setTimeout(() => {
      toastElement.remove();
    }, 3000);
  }
};

const ManagePumpHouse = () => {
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [pumpHouses, setPumpHouses] = useState<PumpHouse[]>([]);
  const [originalPumpHouses, setOriginalPumpHouses] = useState<PumpHouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [editedPumps, setEditedPumps] = useState<Set<number>>(new Set());

  useEffect(() => {
    console.log("Pump Houses state updated:", pumpHouses);
  }, [pumpHouses]);

  useEffect(() => {
    const fetchPumpHouses = async (userId: string) => {
      try {
        setLoading(true);
        setError(null);

        if (!userId || userId === "0" || userId.trim() === "") {
          console.warn("User ID not found or invalid. Cannot fetch pump houses.");
          setPumpHouses([]);
          setLoading(false);
          return;
        }

        const res = await fetch(
          `https://wmsapi.kdsgroup.co.in/api/Master/GetPumpHouseListByUserId?UserId=${userId}`,
          { method: "GET" }
        );
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();

        if (data?.Status && Array.isArray(data.Data)) {
          const dataArray = data.Data;

          const grouped: PumpHouse[] = dataArray.reduce(
            (acc: PumpHouse[], item: any) => {
              const ohtId = item.OhtId ?? 0;
              if (ohtId === 0) return acc;

              const pumpData: Pump = {
                pumpId: item.PumpId ?? 0,
                horsepower: item.HorsePower ?? "",
                powerSource: item.PowerSource === 1 ? "Electricity" : "Solar",
                solarOutput: item.SolarOutput?.toString() || "",
                status: item.Status === 1 ? "Active" : "Inactive",
              };

              let existing = acc.find((h) => h.id === ohtId);
              if (existing) {
                existing.pumps.push(pumpData);
              } else {
                acc.push({
                  id: ohtId,
                  operatorName: item.OperatorName || "Unknown Operator",
                  contact: item.Contact || "No Contact",
                  pumps: [pumpData],
                });
              }
              return acc;
            },
            []
          );

          setPumpHouses(grouped);
          setOriginalPumpHouses(grouped);
          toast.success(`Loaded ${grouped.length} pump house records`);
        } else {
          console.warn("API response missing Status or Data is not array");
          setPumpHouses([]);
          setError("No pump house data found");
        }
      } catch (err: any) {
        console.error("Error fetching pump houses:", err);
        setError(err?.message || "Failed to load pump house data");
        toast.error("Failed to load pump house data: " + (err?.message || "Unknown error"));
        setPumpHouses([]);
      } finally {
        setLoading(false);
      }
    };

    // Get userID from localStorage (matching original implementation)
    const userIdFromStorage = localStorage?.getItem("userID");
    if (userIdFromStorage) {
      fetchPumpHouses(userIdFromStorage);
    } else {
      console.warn("UserID missing in localStorage, cannot fetch pump houses");
      setPumpHouses([]);
      setLoading(false);
      setError("User ID not found in localStorage");
    }
  }, []);

  const handlePumpChange = (
    id: number,
    pumpIndex: number,
    field: keyof Pump,
    value: any
  ) => {
    setPumpHouses((prev) =>
      prev.map((house) => {
        if (house.id === id) {
          const updatedPumps = [...house.pumps];
          const pump = updatedPumps[pumpIndex];
          updatedPumps[pumpIndex] = {
            ...pump,
            [field]: value,
          };
          
          // Track edited pumps
          setEditedPumps(prevEdited => new Set([...prevEdited, pump.pumpId]));
          
          return { ...house, pumps: updatedPumps };
        }
        return house;
      })
    );
  };

  const handleEditToggle = () => {
    if (editMode) {
      setEditedPumps(new Set());
    }
    setEditMode((prev) => !prev);
  };
  const handleCancel = () => {
  setPumpHouses(originalPumpHouses);  // reset UI to original
  setEditedPumps(new Set());
  setEditMode(false);
};

  const handleSaveChanges = async () => {
    if (editedPumps.size === 0) {
      toast.info("No changes to save");
      return;
    }

    setSaving(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Get all edited pumps from all pump houses
      const pumpsToUpdate: Pump[] = [];
      pumpHouses.forEach(house => {
        house.pumps.forEach(pump => {
          if (editedPumps.has(pump.pumpId)) {
            pumpsToUpdate.push(pump);
          }
        });
      });

      for (const pump of pumpsToUpdate) {
        const payload = {
          PumpId: pump.pumpId,
          HorsePower: typeof pump.horsepower === 'string' ? parseFloat(pump.horsepower) || 0 : pump.horsepower,
          PowerSource: pump.powerSource === "Electricity" ? 1 : 2,
          SolarOutput: parseFloat(pump.solarOutput) || 0,
          Status: pump.status === "Active" ? 1 : 0,
          UpdatedBy: parseInt(localStorage?.getItem("userID") || "5")
        };

        try {
          const res = await fetch(
            "https://wmsapi.kdsgroup.co.in/api/User/UpdatePumpHouseDetailsByPumpId",
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
            console.error(`Failed to update Pump ${pump.pumpId}:`, result.Message || result.Errror);
          }
        } catch (err) {
          errorCount++;
          console.error(`Error updating Pump ${pump.pumpId}:`, err);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully updated ${successCount} pump records`);
        setEditedPumps(new Set());
        setEditMode(false);
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to update ${errorCount} pump records`);
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
      const exportData: any[] = [];
      
      filteredData.forEach(house => {
        house.pumps.forEach(pump => {
          exportData.push({
            'Operator Name': house.operatorName,
            'Contact': house.contact,
            'Pump ID': pump.pumpId,
            'Horsepower': pump.horsepower,
            'Power Source': pump.powerSource,
            'Solar Output (kW)': pump.solarOutput,
            'Status': pump.status,
          });
        });
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(
          key.length,
          ...exportData.map(row => String(row[key as keyof typeof row]).length)
        )
      }));
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'PumpHouse_Records');

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filename = `pump_house_records_export_${dateStr}.xlsx`;

      XLSX.writeFile(wb, filename);
      toast.success("Excel file downloaded successfully");
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Filter data by operatorName, case insensitive
  const filteredData = pumpHouses.filter((h) =>
    h.operatorName?.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate totals for stats
  const totalPumps = filteredData.reduce((sum, house) => sum + house.pumps.length, 0);
  const activePumps = filteredData.reduce((sum, house) => 
    sum + house.pumps.filter(pump => pump.status === "Active").length, 0);
  const totalHorsepower = filteredData.reduce((sum, house) => 
    sum + house.pumps.reduce((pumpSum, pump) => 
      pumpSum + (typeof pump.horsepower === 'number' ? pump.horsepower : parseFloat(pump.horsepower as string) || 0), 0), 0);
  const solarPumps = filteredData.reduce((sum, house) => 
    sum + house.pumps.filter(pump => pump.powerSource === "Solar").length, 0);

  if (loading) {
    return (
      <div className="p-6 relative z-10 min-h-screen bg-gray-50">
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700">Loading pump house data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 relative z-10 min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 relative z-10 min-h-screen bg-gray-50">
      {/* Simple toast notification area */}
      <div id="toast-area" className="fixed top-4 right-4 z-50 space-y-2"></div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Manage Pump House</h1>
        <p className="text-gray-600 mb-6">
          View, edit, and manage pump house configurations. Monitor pump performance and power sources.
        </p>

        {/* Search and Actions */}
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <input
              type="text"
              className="flex-1 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by operator name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading}
            />
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
                disabled={loading || pumpHouses.length === 0}
              >
                Edit Records
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
  className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors" 
  onClick={handleCancel}
  disabled={saving}
>
  Cancel
</button>

                <button
                  className={`px-4 py-2 rounded-md text-white transition-colors ${
                    saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  onClick={handleSaveChanges}
                  disabled={saving || editedPumps.size === 0}
                >
                  {saving ? 'Saving...' : `Save Changes (${editedPumps.size})`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>Showing <strong>{filteredData.length}</strong> of <strong>{pumpHouses.length}</strong> pump houses</span>
          <span>Total Pumps: <strong>{totalPumps}</strong></span>
          {editedPumps.size > 0 && (
            <span className="text-orange-600">
              <strong>{editedPumps.size}</strong> pumps modified
            </span>
          )}
        </div>
      </div>

      {/* Quick Stats Cards */}
      {pumpHouses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <span className="text-2xl">⚙️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pumps</p>
                <p className="text-xl font-bold text-gray-800">{totalPumps}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Pumps</p>
                <p className="text-xl font-bold text-green-600">{activePumps}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <span className="text-2xl">🔋</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total HP</p>
                <p className="text-xl font-bold text-yellow-600">{totalHorsepower.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <span className="text-2xl">☀️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Solar Pumps</p>
                <p className="text-xl font-bold text-orange-600">{solarPumps}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {pumpHouses.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-4xl mb-4">🏭</div>
          <h3 className="text-lg font-medium mb-2 text-gray-800">No pump house data found</h3>
          <p className="text-sm text-gray-500">
            No pump house records are available for your account.
          </p>
        </div>
      )}

      {/* Data Table */}
      {pumpHouses.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="border border-gray-300 p-3 text-left font-medium">Operator Name</th>
                  <th className="border border-gray-300 p-3 text-left font-medium">Contact</th>
                  <th className="border border-gray-300 p-3 text-left font-medium">Pump #</th>
                  <th className="border border-gray-300 p-3 text-left font-medium">Capacity (H.P.)</th>
                  <th className="border border-gray-300 p-3 text-left font-medium">Power Source</th>
                  <th className="border border-gray-300 p-3 text-left font-medium">Solar Output (kW)</th>
                  <th className="border border-gray-300 p-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((house, houseIndex) =>
                  house.pumps.map((pump, pumpIndex) => {
                    const isEdited = editedPumps.has(pump.pumpId);
                    const rowIndex = filteredData.slice(0, houseIndex).reduce((sum, h) => sum + h.pumps.length, 0) + pumpIndex;
                    
                    return (
                      <tr 
                        key={`${house.id}-${pumpIndex}`} 
                        className={`${
                          rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        } hover:bg-blue-50 transition-colors ${
                          isEdited ? 'ring-2 ring-orange-200 bg-orange-50' : ''
                        }`}
                      >
                        <td className="border border-gray-300 p-3 font-medium">{house.operatorName}</td>
                        <td className="border border-gray-300 p-3">{house.contact}</td>
                        <td className="border border-gray-300 p-3 font-medium text-blue-600">
                          Pump #{pump.pumpId}
                        </td>
                        <td className="border border-gray-300 p-3">
                          <input
                            className={`w-full border rounded p-2 transition-colors ${
                              editMode 
                                ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                                : 'bg-gray-50'
                            }`}
                            value={pump.horsepower}
                            onChange={(e) =>
                              handlePumpChange(
                                house.id,
                                pumpIndex,
                                "horsepower",
                                e.target.value
                              )
                            }
                            disabled={!editMode}
                            type="number"
                            min="0"
                            step="0.1"
                          />
                        </td>
                        <td className="border border-gray-300 p-3">
                          <select
                            className={`w-full border rounded p-2 transition-colors ${
                              editMode 
                                ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                                : 'bg-gray-50'
                            }`}
                            value={pump.powerSource}
                            onChange={(e) =>
                              handlePumpChange(
                                house.id,
                                pumpIndex,
                                "powerSource",
                                e.target.value
                              )
                            }
                            disabled={!editMode}
                          >
                            <option value="Electricity">Electricity</option>
                            <option value="Solar">Solar</option>
                          </select>
                        </td>
                        <td className="border border-gray-300 p-3">
                          {pump.powerSource === "Solar" ? (
                            <input
                              className={`w-full border rounded p-2 transition-colors ${
                                editMode 
                                  ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                                  : 'bg-gray-50'
                              }`}
                              value={pump.solarOutput}
                              onChange={(e) =>
                                handlePumpChange(
                                  house.id,
                                  pumpIndex,
                                  "solarOutput",
                                  e.target.value
                                )
                              }
                              disabled={!editMode}
                              type="number"
                              min="0"
                              step="0.1"
                            />
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="border border-gray-300 p-3">
                          <select
                            className={`w-full border rounded p-2 transition-colors ${
                              editMode 
                                ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                                : 'bg-gray-50'
                            }`}
                            value={pump.status}
                            onChange={(e) =>
                              handlePumpChange(house.id, pumpIndex, "status", e.target.value)
                            }
                            disabled={!editMode}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium mb-2">No pump houses found</h3>
              <p className="text-sm">No pump houses match your current search criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManagePumpHouse;