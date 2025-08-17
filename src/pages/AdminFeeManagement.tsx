import { useState, useEffect } from "react";
import {
  Download,
  DollarSign,
  MapPin,
  Banknote,
  CalendarDays,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const FeeManagement = () => {

  type LatestFeeItem = {
  FeeId: number;
  DistrictName: string;
  BaseFee: number;
  TotalAmountCollected: number;
  ApplyFrom: string;
};

type DistrictFee = {
  id: number;
  name: string;
  fee: string;  // as you’re editing in an <input/>
  districtId: number;
  totalCollected: number;
  applyFrom: string;
};

const [districtFees, setDistrictFees] = useState<DistrictFee[]>([]);

  const [mode, setMode] = useState("state");
  const [stateFee, setStateFee] = useState("");
  const [originalDistrictFees, setOriginalDistrictFees] = useState([]);
  const [financialYear, setFinancialYear] = useState("2024");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });


  
  // Base API URL
  const API_BASE = "https://wmsapi.kdsgroup.co.in/api/Master";

  // Fetch water fee data
  const fetchWaterFeeData = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    
    try {
      const response = await fetch(
        `${API_BASE}/GetWaterFeeDeclaration?FinancialYear=${financialYear}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.Status && data.Data) {
        // Group by district and get the latest entry for each district
        const latestFees = {};
        data.Data.forEach(item => {
          const district = item.DistrictName;
          if (!latestFees[district] || new Date(item.ApplyFrom) > new Date(latestFees[district].ApplyFrom)) {
            latestFees[district] = item;
          }
        });
        
        // Convert to array format for the component
        const formattedFees = Object.values(latestFees).map((item, index) => ({
          id: item.FeeId,
          name: item.DistrictName,
          fee: item.BaseFee.toString(),
          districtId: item.FeeId, // Using FeeId as DistrictId for API calls
          totalCollected: item.TotalAmountCollected,
          applyFrom: item.ApplyFrom
        }));
        
        setDistrictFees(formattedFees);
        setOriginalDistrictFees(JSON.parse(JSON.stringify(formattedFees)));
        setMessage({ type: "success", text: `Loaded ${formattedFees.length} districts successfully` });
      } else {
        throw new Error(data.Message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching water fee data:", error);
      setMessage({ type: "error", text: `Error: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when financial year changes
  useEffect(() => {
    fetchWaterFeeData();
  }, [financialYear]);

  const handleDistrictFeeChange = (id, value) => {
    setDistrictFees((prev) =>
      prev.map((d) => (d.id === id ? { ...d, fee: value } : d))
    );
  };

  // Save individual district fee
  const saveDistrictFee = async (district) => {
    if (!district.fee || district.fee === "0") {
      setMessage({ type: "error", text: "Please enter a valid fee amount" });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const requestBody = {
        DistrictId: district.districtId,
        WaterFeeAmount: parseFloat(district.fee),
        ApplyFrom: new Date().toISOString(),
        UserId: 1, // You may want to get this from user context
        DeviceToken: "web_app",
        IPAddress: "192.168.1.1" // You may want to get actual IP
      };

      const response = await fetch(
        `${API_BASE}/UpdateStateAndDistrictWiseWaterFee`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "accept": "*/*"
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.Status) {
        setMessage({ type: "success", text: `${data.Message} for ${district.name}` });
        // Refresh data to get updated values
        setTimeout(() => {
          fetchWaterFeeData();
        }, 1000);
      } else {
        throw new Error(data.Message || data.Errror || "Failed to update fee");
      }
    } catch (error) {
      console.error("Error saving district fee:", error);
      setMessage({ type: "error", text: `Error saving ${district.name}: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  // Save all districts with changed fees
  const handleSaveAll = async () => {
    const changedDistricts = districtFees.filter((district, index) => {
      const original = originalDistrictFees[index];
      return original && district.fee !== original.fee && district.fee !== "";
    });

    if (changedDistricts.length === 0) {
      setMessage({ type: "error", text: "No changes to save" });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      for (const district of changedDistricts) {
        await saveDistrictFee(district);
        // Small delay between requests to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setMessage({ type: "success", text: `Successfully updated ${changedDistricts.length} districts` });
    } catch (error) {
      setMessage({ type: "error", text: "Some updates may have failed. Please check and try again." });
    } finally {
      setSaving(false);
    }
  };

  // Save state-wide fee (applies to all districts)
  const handleSaveStateFee = async () => {
    if (!stateFee || stateFee === "0") {
      setMessage({ type: "error", text: "Please enter a valid state fee amount" });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // Update all districts with the same fee
      for (const district of districtFees) {
        const requestBody = {
          DistrictId: district.districtId,
          WaterFeeAmount: parseFloat(stateFee),
          ApplyFrom: new Date().toISOString(),
          UserId: 1,
          DeviceToken: "web_app",
          IPAddress: "192.168.1.1"
        };

        const response = await fetch(
          `${API_BASE}/UpdateStateAndDistrictWiseWaterFee`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "accept": "*/*"
            },
            body: JSON.stringify(requestBody)
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to update ${district.name}`);
        }

        const data = await response.json();
        if (!data.Status) {
          throw new Error(data.Message || `Failed to update ${district.name}`);
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setMessage({ type: "success", text: `State-wide fee of ₹${stateFee} applied to all districts successfully` });
      
      // Refresh data and reset state fee input
      setTimeout(() => {
        fetchWaterFeeData();
        setStateFee("");
      }, 1000);
      
    } catch (error) {
      console.error("Error saving state fee:", error);
      setMessage({ type: "error", text: `Error: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    // Create CSV content
    const csvHeaders = "District Name,Water Fee (₹),Total Amount Collected (₹),Apply From\n";
    const csvContent = districtFees.map(district => 
      `"${district.name}",${district.fee || 0},${district.totalCollected || 0},"${new Date(district.applyFrom).toLocaleDateString()}"`
    ).join("\n");
    
    const csvData = csvHeaders + csvContent;
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `water_fees_${financialYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    setMessage({ type: "success", text: "Fee data downloaded successfully" });
  };

  return (
    <div className="p-8 space-y-6 bg-gradient-to-b from-blue-50 via-white to-blue-50 min-h-screen">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <DollarSign className="w-8 h-8 text-blue-600" />
        <h2 className="text-3xl font-bold text-gray-800">
          Water Fee Management
        </h2>
        <button
          onClick={fetchWaterFeeData}
          disabled={loading}
          className="ml-auto flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      <p className="text-gray-500">
        Set and manage water fee rates for the entire state or district-wise.
      </p>

      {/* Message Display */}
      {message.text && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === "success" 
            ? "bg-green-50 text-green-700 border border-green-200" 
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Mode Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6 flex gap-6 items-center">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border transition-all ${
            mode === "state"
              ? "bg-blue-100 border-blue-400 text-blue-700"
              : "bg-gray-50 border-gray-300 text-gray-600"
          }`}
          onClick={() => setMode("state")}
        >
          <Banknote className="w-5 h-5" />
          <span className="font-medium">Statewide Water Fee</span>
        </div>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border transition-all ${
            mode === "district"
              ? "bg-blue-100 border-blue-400 text-blue-700"
              : "bg-gray-50 border-gray-300 text-gray-600"
          }`}
          onClick={() => setMode("district")}
        >
          <MapPin className="w-5 h-5" />
          <span className="font-medium">District-wise Water Fee</span>
        </div>
      </div>

      {/* Fee Input Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
        {mode === "state" ? (
          <div className="flex flex-wrap items-center gap-4">
            <label className="font-medium flex items-center gap-2">
              <Banknote className="w-5 h-5 text-green-600" />
              State-wide Water Fee Amount (₹)
            </label>
            <input
              type="number"
              value={stateFee}
              onChange={(e) => setStateFee(e.target.value)}
              className="border rounded-lg px-3 py-2 w-48 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              placeholder="Enter fee amount"
              min="0"
            />
            <button
              onClick={handleSaveStateFee}
              disabled={saving || loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving..." : "Save State Fee"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading districts...</span>
              </div>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-blue-100 text-blue-800 sticky top-0">
                      <tr>
                        <th className="p-3 border text-left">District</th>
                        <th className="p-3 border text-left">Water Fee Amount (₹)</th>
                        <th className="p-3 border text-left">Total Collected (₹)</th>
                        <th className="p-3 border text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {districtFees.map((district) => (
                        <tr
                          key={district.id}
                          className="hover:bg-blue-50 transition-colors"
                        >
                          <td className="p-3 border font-medium">{district.name}</td>
                          <td className="p-3 border">
                            <input
                              type="number"
                              value={district.fee}
                              onChange={(e) =>
                                handleDistrictFeeChange(district.id, e.target.value)
                              }
                              className="border rounded-lg px-2 py-1 w-32 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                              placeholder="Fee"
                              min="0"
                            />
                          </td>
                          <td className="p-3 border">
                            ₹ {district.totalCollected?.toLocaleString('en-IN') || '0'}
                          </td>
                          <td className="p-3 border">
                            <button
                              onClick={() => saveDistrictFee(district)}
                              disabled={saving || !district.fee}
                              className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {saving ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Save className="w-3 h-3" />
                              )}
                              Save
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleSaveAll}
                    disabled={saving || districtFees.length === 0}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? "Saving..." : "Save All Changes"}
                  </button>
                  <span className="text-sm text-gray-500 flex items-center">
                    {districtFees.filter((d, i) => {
                      const original = originalDistrictFees[i];
                      return original && d.fee !== original.fee && d.fee !== "";
                    }).length} changes pending
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Filter & Download */}
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-purple-600" />
          <label className="font-medium">Financial Year</label>
          <select
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            disabled={loading}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>
        <button
          onClick={handleDownload}
          disabled={districtFees.length === 0}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          Download CSV
        </button>
      </div>

      {/* Data Summary */}
      {districtFees.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Fee Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {districtFees.length}
              </div>
              <div className="text-sm text-gray-600">Total Districts</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ₹{Math.round(districtFees.reduce((sum, d) => sum + (parseFloat(d.fee) || 0), 0) / districtFees.length)}
              </div>
              <div className="text-sm text-gray-600">Average Fee</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                ₹{districtFees.reduce((sum, d) => sum + (d.totalCollected || 0), 0).toLocaleString('en-IN')}
              </div>
              <div className="text-sm text-gray-600">Total Collected</div>
            </div>
          </div>
        </div>
      )}

      {/* Current Data Table */}
      {districtFees.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <h3 className="text-lg font-semibold">Current Water Fee Structure</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-3 border text-left">District Name</th>
                  <th className="p-3 border text-left">Current Fee (₹)</th>
                  <th className="p-3 border text-left">Total Collected (₹)</th>
                  <th className="p-3 border text-left">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {districtFees.map((district) => (
                  <tr key={district.id} className="hover:bg-blue-50 transition-colors">
                    <td className="p-3 border font-medium">{district.name}</td>
                    <td className="p-3 border">
                      <span className="font-semibold text-green-600">
                        ₹ {district.fee || '0'}
                      </span>
                    </td>
                    <td className="p-3 border">
                      ₹ {district.totalCollected?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td className="p-3 border text-sm text-gray-500">
                      {new Date(district.applyFrom).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;