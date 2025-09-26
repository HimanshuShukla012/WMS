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
  type GPFeeItem = {
    GP_Id: number;
    GPName: string;
    DistrictId: number;
    DistrictName: string;
    BaseFee: number;
    TotalAmountCollected: number;
    ApplyFrom: string;
  };

  type GPFee = {
    id: number;
    gpId: number;
    name: string;
    districtName: string;
    fee: string;
    districtId: number;
    totalCollected: number;
    applyFrom: string;
  };

  const { userId, role, isLoading: userLoading } = useUserInfo();

  const [gpFees, setGPFees] = useState<GPFee[]>([]);
  const [mode, setMode] = useState("gp");
  const [bulkFee, setBulkFee] = useState("");
  const [originalGPFees, setOriginalGPFees] = useState<GPFee[]>([]);
  const [financialYear, setFinancialYear] = useState("2025-26");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [validationErrors, setValidationErrors] = useState({});

  // Base API URL
  const API_BASE = "https://wmsapi.kdsgroup.co.in/api/User";

  // Static GP data for demonstration (replace with actual API call later)
  const staticGPData: GPFee[] = [
    {
      id: 1,
      gpId: 3753,
      name: "Adarsh Gram Panchayat",
      districtName: "Lucknow",
      fee: "50",
      districtId: 6,
      totalCollected: 25000,
      applyFrom: "2025-01-01T00:00:00Z"
    },
    {
      id: 2,
      gpId: 3754,
      name: "Bharatpur Gram Panchayat",
      districtName: "Lucknow",
      fee: "45",
      districtId: 6,
      totalCollected: 18000,
      applyFrom: "2025-01-01T00:00:00Z"
    },
    {
      id: 3,
      gpId: 3755,
      name: "Chandpur Gram Panchayat",
      districtName: "Lucknow",
      fee: "55",
      districtId: 6,
      totalCollected: 32000,
      applyFrom: "2025-01-01T00:00:00Z"
    },
    {
      id: 4,
      gpId: 3756,
      name: "Devgaon Gram Panchayat",
      districtName: "Lucknow",
      fee: "40",
      districtId: 6,
      totalCollected: 15000,
      applyFrom: "2025-01-01T00:00:00Z"
    },
    {
      id: 5,
      gpId: 3757,
      name: "Ekta Gram Panchayat",
      districtName: "Lucknow",
      fee: "60",
      districtId: 6,
      totalCollected: 28000,
      applyFrom: "2025-01-01T00:00:00Z"
    },
    {
      id: 6,
      gpId: 3758,
      name: "Fatehpur Gram Panchayat",
      districtName: "Lucknow",
      fee: "48",
      districtId: 6,
      totalCollected: 22000,
      applyFrom: "2025-01-01T00:00:00Z"
    },
    {
      id: 7,
      gpId: 3759,
      name: "Gangapur Gram Panchayat",
      districtName: "Lucknow",
      fee: "52",
      districtId: 6,
      totalCollected: 30000,
      applyFrom: "2025-01-01T00:00:00Z"
    },
    {
      id: 8,
      gpId: 3760,
      name: "Haripur Gram Panchayat",
      districtName: "Lucknow",
      fee: "42",
      districtId: 6,
      totalCollected: 19000,
      applyFrom: "2025-01-01T00:00:00Z"
    }
  ];

  // Validation functions
  const validateFeeAmount = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      return "Fee amount cannot be negative";
    }
    return null;
  };

  const validateBulkFee = (value) => {
    if (!value || value.trim() === "") {
      return "Please enter a fee amount";
    }
    return validateFeeAmount(value);
  };

  const validateGPFee = (value) => {
    if (!value || value.trim() === "") {
      return null;
    }
    return validateFeeAmount(value);
  };

  // Load GP data (currently using static data)
  const loadGPData = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use static data for now
      setGPFees([...staticGPData]);
      setOriginalGPFees(JSON.parse(JSON.stringify(staticGPData)));
      setMessage({ type: "success", text: `Loaded ${staticGPData.length} Gram Panchayats successfully` });
      
      // Clear validation errors when new data is loaded
      setValidationErrors({});
      
    } catch (error) {
      console.error("Error loading GP data:", error);
      setMessage({ type: "error", text: `Error: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when financial year changes
  useEffect(() => {
    loadGPData();
  }, [financialYear]);

  const handleGPFeeChange = (id, value) => {
    // Update the fee value
    setGPFees((prev) =>
      prev.map((gp) => (gp.id === id ? { ...gp, fee: value } : gp))
    );

    // Validate the fee
    const error = validateGPFee(value);
    setValidationErrors(prev => ({
      ...prev,
      [`gp_${id}`]: error
    }));

    // Clear general message when user starts typing
    if (message.type === "error" && message.text.includes("negative")) {
      setMessage({ type: "", text: "" });
    }
  };

  const handleBulkFeeChange = (value) => {
    setBulkFee(value);
    
    // Validate bulk fee
    const error = validateBulkFee(value);
    setValidationErrors(prev => ({
      ...prev,
      bulkFee: error
    }));

    // Clear general message when user starts typing
    if (message.type === "error" && message.text.includes("negative")) {
      setMessage({ type: "", text: "" });
    }
  };

  // Save individual GP fee
  const saveGPFee = async (gp) => {
    // Validate before saving
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
            DistrictId: gp.districtId,
            GP_Id: gp.gpId,
            WaterFeeAmount: parseFloat(gp.fee),
            ApplyFrom: new Date().toISOString(),
            UserId: userId,
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
        // Refresh data to get updated values
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

  // Handle bulk fee update for all GPs
  const handleSaveBulkFee = async () => {
    // Validate bulk fee first
    const bulkError = validateBulkFee(bulkFee);
    if (bulkError) {
      setValidationErrors(prev => ({ ...prev, bulkFee: bulkError }));
      setMessage({ type: "error", text: bulkError });
      return;
    }

    // Validate userId is available
    if (!userId) {
      setMessage({ type: "error", text: "User ID not available. Please refresh the page and try again." });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // Create a bulk request with all GPs
      const waterFeeList = gpFees.map(gp => ({
        DistrictId: gp.districtId,
        GP_Id: gp.gpId,
        WaterFeeAmount: parseFloat(bulkFee),
        ApplyFrom: new Date().toISOString(),
        UserId: userId,
        DeviceToken: "web_app",
        IPAddress: "192.168.1.1"
      }));

      const requestBody = {
        WaterFeeListMew: waterFeeList
      };

      console.log('Bulk GP update request:', JSON.stringify(requestBody, null, 2));

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
        const errorText = await response.text();
        console.error(`HTTP ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Bulk GP update response:', data);
      
      if (data.Status) {
        setMessage({ 
          type: "success", 
          text: `Bulk fee of ₹${bulkFee} applied to all GPs successfully: ${data.Message}` 
        });
        
        // Refresh data and reset bulk fee input
        setTimeout(() => {
          loadGPData();
          setBulkFee("");
          setValidationErrors(prev => ({ ...prev, bulkFee: null }));
        }, 1000);
        
      } else {
        throw new Error(data.Message || data.Error || 'Failed to update bulk GP fee');
      }
      
    } catch (error) {
      console.error("Error in handleSaveBulkFee:", error);
      setMessage({ type: "error", text: `Error: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  // Save all changed GPs
  const handleSaveAll = async () => {
    // First validate all changed GPs
    const changedGPs = gpFees.filter((gp, index) => {
      const original = originalGPFees[index];
      return original && gp.fee !== original.fee && gp.fee !== "";
    });

    if (changedGPs.length === 0) {
      setMessage({ type: "error", text: "No changes to save" });
      return;
    }

    // Check for validation errors in changed GPs
    const hasValidationErrors = changedGPs.some(gp => {
      const error = validateGPFee(gp.fee);
      if (error) {
        setValidationErrors(prev => ({
          ...prev,
          [`gp_${gp.id}`]: error
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
      // Send all changed GPs in a single bulk request
      const waterFeeList = changedGPs.map(gp => ({
        DistrictId: gp.districtId,
        GP_Id: gp.gpId,
        WaterFeeAmount: parseFloat(gp.fee),
        ApplyFrom: new Date().toISOString(),
        UserId: userId,
        DeviceToken: "web_app",
        IPAddress: "192.168.1.1"
      }));

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
        
        // Refresh data
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
    // Create CSV content
    const csvHeaders = "GP Name,District,Water Fee (₹),Total Amount Collected (₹),Apply From\n";
    const csvContent = gpFees.map(gp => 
      `"${gp.name}","${gp.districtName}",${gp.fee || 0},${gp.totalCollected || 0},"${new Date(gp.applyFrom).toLocaleDateString()}"`
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
          disabled={loading}
          className="ml-auto flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      <p className="text-gray-500">
        Set and manage water fee rates for individual Gram Panchayats or apply bulk rates.
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
            mode === "bulk"
              ? "bg-blue-100 border-blue-400 text-blue-700"
              : "bg-gray-50 border-gray-300 text-gray-600"
          }`}
          onClick={() => setMode("bulk")}
        >
          <Banknote className="w-5 h-5" />
          <span className="font-medium">Bulk GP Water Fee</span>
        </div>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border transition-all ${
            mode === "gp"
              ? "bg-blue-100 border-blue-400 text-blue-700"
              : "bg-gray-50 border-gray-300 text-gray-600"
          }`}
          onClick={() => setMode("gp")}
        >
          <Building2 className="w-5 h-5" />
          <span className="font-medium">Individual GP Water Fee</span>
        </div>
      </div>

      {/* Fee Input Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
        {mode === "bulk" ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <label className="font-medium flex items-center gap-2">
                <Banknote className="w-5 h-5 text-green-600" />
                Bulk GP Water Fee Amount (₹)
              </label>
              <input
                type="number"
                value={bulkFee}
                onChange={(e) => handleBulkFeeChange(e.target.value)}
                className={`border rounded-lg px-3 py-2 w-48 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${
                  validationErrors.bulkFee ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter fee amount"
                min="0"
              />
              <button
                onClick={handleSaveBulkFee}
                disabled={saving || loading || validationErrors.bulkFee}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving..." : "Apply to All GPs"}
              </button>
            </div>
            
            {/* Bulk fee validation error */}
            {validationErrors.bulkFee && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{validationErrors.bulkFee}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading Gram Panchayats...</span>
              </div>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-blue-100 text-blue-800 sticky top-0">
                      <tr>
                        <th className="p-3 border text-left">GP Name</th>
                  <th className="p-3 border text-left">District</th>
                  <th className="p-3 border text-left">Current Fee (₹)</th>
                  <th className="p-3 border text-left">Total Collected (₹)</th>
                  <th className="p-3 border text-left">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {gpFees.map((gp) => (
                  <tr key={gp.id} className="hover:bg-blue-50 transition-colors">
                    <td className="p-3 border font-medium">{gp.name}</td>
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