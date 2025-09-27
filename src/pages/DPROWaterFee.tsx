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
  Building2,
} from "lucide-react";

import { useUserInfo } from "../utils/userInfo";

const DPROWaterFee = () => {
  type GPFeeApiResponse = {
    FeeId: number;
    GPId: number;
    BlockName: string;
    GPName: string;
    DistrictName: string;
    BaseFee: number;
    ApplyFrom: string;
    TotalAmountCollected: number;
  };

  type GPFee = {
    feeId: number;
    gpId: number;
    name: string;
    blockName: string;
    districtName: string;
    fee: string;
    totalCollected: number;
    applyFrom: string;
  };

  const { userId, role, isLoading: userLoading } = useUserInfo();

  const [gpFees, setGPFees] = useState<GPFee[]>([]);
  const [originalGPFees, setOriginalGPFees] = useState<GPFee[]>([]);
  const [financialYear, setFinancialYear] = useState("2025-26");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string | null}>({});

  // Base API URL
  const API_BASE = "https://wmsapi.kdsgroup.co.in/api/User";
  const API_BASE1 = "https://wmsapi.kdsgroup.co.in/api/Master";

  // Validation functions
  const validateFeeAmount = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      return "Fee amount cannot be negative";
    }
    return null;
  };

  const validateGPFee = (value) => {
    if (!value || value.trim() === "") {
      return null;
    }
    return validateFeeAmount(value);
  };

  const fetchAllDistricts = async () => {
  try {
    const response = await fetch(
      `${API_BASE1}/AllDistrict`,
      {
        method: "POST",
        headers: {
          "accept": "*/*"
        },
        body: ""
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.Status && result.Data) {
      setDistricts(result.Data);
    } else {
      throw new Error("Failed to fetch districts");
    }
  } catch (error) {
    console.error("Error fetching districts:", error);
  }
};

  // Load GP data from API
  const loadGPData = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    
    try {
      if (!userId) {
        throw new Error("User ID not available. Please refresh the page and try again.");
      }

      const financialYearParam = financialYear.split('-')[0]; // Send just the starting year (e.g., "2025")
      
      console.log('Loading GP data request:', JSON.stringify({
        FinancialYear: financialYearParam,
        UserId: userId
      }, null, 2));

      const response = await fetch(
        `${API_BASE1}/GetWaterFeeDeclarationByGP?FinancialYear=${financialYearParam}&UserId=${userId}`,
        {
          method: "GET",
          headers: {
            "accept": "*/*"
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('GP data response:', result);
      
      if (result.Status && result.Data) {
        const gpData: GPFee[] = result.Data.map((item: GPFeeApiResponse) => ({
          feeId: item.FeeId,
          gpId: item.GPId,
          name: item.GPName,
          blockName: item.BlockName,
          districtName: item.DistrictName,
          fee: item.BaseFee.toString(),
          totalCollected: item.TotalAmountCollected,
          applyFrom: item.ApplyFrom
        }));

        setGPFees(gpData);
        setOriginalGPFees(JSON.parse(JSON.stringify(gpData)));
        setMessage({ type: "success", text: `Loaded ${gpData.length} Gram Panchayats successfully` });
        setValidationErrors({});
      } else {
        throw new Error(result.Message || result.Error || "Failed to load GP data");
      }
    } catch (error) {
      console.error("Error loading GP data:", error);
      setMessage({ type: "error", text: `Error: ${error.message}` });
      // Fall back to empty array on error
      setGPFees([]);
      setOriginalGPFees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (userId) {
    fetchAllDistricts();
    loadGPData();
  }
}, [financialYear, userId]);

  const handleGPFeeChange = (gpId, value) => {
    setGPFees((prev) =>
      prev.map((gp) => (gp.gpId === gpId ? { ...gp, fee: value } : gp))
    );

    const error = validateGPFee(value);
    setValidationErrors(prev => ({
      ...prev,
      [`gp_${gpId}`]: error
    }));

    if (message.type === "error" && message.text.includes("negative")) {
      setMessage({ type: "", text: "" });
    }
  };

  const saveGPFee = async (gp) => {

    const district = districts.find(d => d.DistrictName === gp.districtName);
    const districtId = district ? district.DistrictId : 0;

    const feeError = validateGPFee(gp.fee);
    if (feeError) {
      setMessage({ type: "error", text: `${gp.name}: ${feeError}` });
      return;
    }

    if (!gp.fee || gp.fee === "0") {
      setMessage({ type: "error", text: "Please enter a valid fee amount" });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const requestBody = {
        WaterFeeListMew: [
          {
            GP_Id: gp.gpId,
            WaterFeeAmount: parseFloat(gp.fee),
            ApplyFrom: new Date().toISOString(),
            UserId: userId,
            DistrictId: districtId,
            DeviceToken: "web_app",
            IPAddress: "192.168.1.1"
          }
        ]
      };

      console.log('GP Fee Update Request:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(
        `${API_BASE}/UpdateGPWideWaterFee`,
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
      console.log('Response data:', data);
      
      if (data.Status) {
        setMessage({ type: "success", text: `${data.Message} for ${gp.name}` });
        setTimeout(() => {
          loadGPData();
        }, 1000);
      } else {
        throw new Error(data.Message || data.Error || "Failed to update fee");
      }
    } catch (error) {
      console.error("Error saving GP fee:", error);
      setMessage({ type: "error", text: `Error saving ${gp.name}: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
  const changedGPs = gpFees.filter((gp, index) => {
    const original = originalGPFees[index];
    return original && gp.fee !== original.fee && gp.fee !== "";
  });

  if (changedGPs.length === 0) {
    setMessage({ type: "error", text: "No changes to save" });
    return;
  }

  const hasValidationErrors = changedGPs.some(gp => {
    const error = validateGPFee(gp.fee);
    if (error) {
      setValidationErrors(prev => ({
        ...prev,
        [`gp_${gp.gpId}`]: error
      }));
      return true;
    }
    return false;
  });

  if (hasValidationErrors) {
    setMessage({ type: "error", text: "Please fix validation errors before saving" });
    return;
  }

  setSaving(true);
  setMessage({ type: "", text: "" });

  try {
    const waterFeeList = changedGPs.map(gp => {
      const district = districts.find(d => d.DistrictName === gp.districtName);
      const districtId = district ? district.DistrictId : 0;

      return {
        GP_Id: gp.gpId,
        DistrictId: districtId,
        WaterFeeAmount: parseFloat(gp.fee),
        ApplyFrom: new Date().toISOString(),
        UserId: userId,
        DeviceToken: "web_app",
        IPAddress: "192.168.1.1"
      };
    });

    const requestBody = {
      WaterFeeListMew: waterFeeList
    };

    console.log('Save all GPs request:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(
      `${API_BASE}/UpdateGPWideWaterFee`,
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
    console.log('Save all GPs response:', data);
    
    if (data.Status) {
      setMessage({ 
        type: "success", 
        text: `Bulk update completed for ${changedGPs.length} GPs: ${data.Message}` 
      });
      
      setTimeout(() => {
        loadGPData();
      }, 1000);
    } else {
      throw new Error(data.Message || data.Error || 'Bulk update failed');
    }
    
  } catch (error) {
    console.error("Error in handleSaveAll:", error);
    setMessage({ type: "error", text: `Error: ${error.message}` });
  } finally {
    setSaving(false);
  }
};

  const handleDownload = () => {
    const csvHeaders = "GP Name,Block,District,Water Fee (₹),Total Amount Collected (₹),Apply From\n";
    const csvContent = gpFees.map(gp => 
      `"${gp.name}","${gp.blockName}","${gp.districtName}",${gp.fee || 0},${gp.totalCollected || 0},"${new Date(gp.applyFrom).toLocaleDateString()}"`
    ).join("\n");
    
    const csvData = csvHeaders + csvContent;
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gp_water_fees_${financialYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    setMessage({ type: "success", text: "GP fee data downloaded successfully" });
  };

  return (
    <div className="p-8 space-y-6 bg-gradient-to-b from-blue-50 via-white to-blue-50 min-h-screen">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <Building2 className="w-8 h-8 text-blue-600" />
        <h2 className="text-3xl font-bold text-gray-800">
          GP Water Fee Management
        </h2>
        <button
          onClick={loadGPData}
          disabled={loading || !userId}
          className="ml-auto flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      <p className="text-gray-500">
        Set and manage water fee rates for individual Gram Panchayats.
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

      {/* Fee Input Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading Gram Panchayats...</span>
            </div>
          ) : gpFees.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No Gram Panchayats found for the selected financial year.</p>
                <p className="text-sm text-gray-500 mt-1">Try selecting a different financial year or refresh the data.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <table className="w-full">
                  <thead className="bg-blue-100 text-blue-800 sticky top-0">
                    <tr>
                      <th className="p-3 border text-left">GP Name</th>
                      <th className="p-3 border text-left">Block</th>
                      <th className="p-3 border text-left">District</th>
                      <th className="p-3 border text-left">Water Fee Amount (₹)</th>
                      <th className="p-3 border text-left">Total Collected (₹)</th>
                      <th className="p-3 border text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gpFees.map((gp) => (
                      <tr key={gp.gpId} className="hover:bg-blue-50 transition-colors">
                        <td className="p-3 border font-medium">{gp.name}</td>
                        <td className="p-3 border text-gray-600">{gp.blockName}</td>
                        <td className="p-3 border text-gray-600">{gp.districtName}</td>
                        <td className="p-3 border">
                          <div className="space-y-1">
                            <input
                              type="number"
                              value={gp.fee}
                              onChange={(e) => handleGPFeeChange(gp.gpId, e.target.value)}
                              className={`border rounded-lg px-2 py-1 w-32 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${
                                validationErrors[`gp_${gp.gpId}`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="Fee"
                              min="0"
                            />
                            {validationErrors[`gp_${gp.gpId}`] && (
                              <div className="text-red-600 text-xs flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>{validationErrors[`gp_${gp.gpId}`]}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3 border">
                          <span className="font-semibold text-green-600">
                            ₹ {gp.totalCollected?.toLocaleString('en-IN') || '0'}
                          </span>
                        </td>
                        <td className="p-3 border">
                          <button
                            onClick={() => saveGPFee(gp)}
                            disabled={saving || !gp.fee || gp.fee === "0" || validationErrors[`gp_${gp.gpId}`]}
                            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Save className="w-3 h-3" />
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
                  disabled={
                    saving || 
                    gpFees.length === 0 || 
                    Object.values(validationErrors).some(error => error)
                  }
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
                  {gpFees.filter((gp, i) => {
                    const original = originalGPFees[i];
                    return original && gp.fee !== original.fee && gp.fee !== "";
                  }).length} changes pending
                </span>
              </div>
            </>
          )}
        </div>
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
            <option value="2025-26">2025-26</option>
            <option value="2024-25">2024-25</option>
            <option value="2023-24">2023-24</option>
            <option value="2022-23">2022-23</option>
            <option value="2021-22">2021-22</option>
          </select>
        </div>
        <button
          onClick={handleDownload}
          disabled={gpFees.length === 0}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          Download CSV
        </button>
      </div>

      {/* Data Summary */}
      {gpFees.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">GP Fee Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {gpFees.length}
              </div>
              <div className="text-sm text-gray-600">Total Gram Panchayats</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ₹{Math.round(gpFees.reduce((sum, gp) => sum + (parseFloat(gp.fee) || 0), 0) / gpFees.length)}
              </div>
              <div className="text-sm text-gray-600">Average Fee</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                ₹{gpFees.reduce((sum, gp) => sum + (gp.totalCollected || 0), 0).toLocaleString('en-IN')}
              </div>
              <div className="text-sm text-gray-600">Total Collected</div>
            </div>
          </div>
        </div>
      )}

      {/* Current Data Table */}
      {gpFees.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <h3 className="text-lg font-semibold">Current GP Water Fee Structure</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-3 border text-left">GP Name</th>
                  <th className="p-3 border text-left">Block</th>
                  <th className="p-3 border text-left">District</th>
                  <th className="p-3 border text-left">Current Fee (₹)</th>
                  <th className="p-3 border text-left">Total Collected (₹)</th>
                  <th className="p-3 border text-left">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {gpFees.map((gp) => (
                  <tr key={gp.gpId} className="hover:bg-blue-50 transition-colors">
                    <td className="p-3 border font-medium">{gp.name}</td>
                    <td className="p-3 border text-gray-600">{gp.blockName}</td>
                    <td className="p-3 border text-gray-600">{gp.districtName}</td>
                    <td className="p-3 border">
                      <span className="font-semibold text-green-600">
                        ₹ {gp.fee || '0'}
                      </span>
                    </td>
                    <td className="p-3 border">
                      <span className="font-semibold text-purple-600">
                        ₹ {gp.totalCollected?.toLocaleString('en-IN') || '0'}
                      </span>
                    </td>
                    <td className="p-3 border text-sm text-gray-500">
                      {new Date(gp.applyFrom).toLocaleDateString('en-IN')}
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

export default DPROWaterFee;