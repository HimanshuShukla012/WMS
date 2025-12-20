import { useState, useEffect } from "react";
import {
  Download,
  IndianRupee,
  MapPin,
  Banknote,
  CalendarDays,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import { useUserInfo } from "../utils/userInfo";

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
    fee: string;
    districtId: number;
    totalCollected: number;
    applyFrom: string;
  };

  type District = {
    DistrictId: number;
    DistrictName: string;
  };

  const { userId, role, isLoading: userLoading } = useUserInfo();

  const [districtFees, setDistrictFees] = useState<DistrictFee[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [mode, setMode] = useState("state");
  const [stateFee, setStateFee] = useState("");
  const [originalDistrictFees, setOriginalDistrictFees] = useState<
    DistrictFee[]
  >([]);
  const [financialYear, setFinancialYear] = useState("2025-26");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [validationErrors, setValidationErrors] = useState({});

  // Base API URL
  const API_BASE = "https://wmsapi.kdsgroup.co.in/api/Master";

  // Validation functions
  const validateFeeAmount = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      return "Fee amount cannot be negative";
    }
    return null;
  };

  const validateStateFee = (value) => {
    if (!value || value.trim() === "") {
      return "Please enter a fee amount";
    }
    return validateFeeAmount(value);
  };

  const validateDistrictFee = (value) => {
    if (!value || value.trim() === "") {
      return null;
    }
    return validateFeeAmount(value);
  };

  // Fetch all districts to get proper district IDs
  const fetchAllDistricts = async () => {
    try {
      const response = await fetch(`${API_BASE}/AllDistrict`, {
        method: "POST",
        headers: {
          accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.Status && data.Data) {
        setDistricts(data.Data);
        console.log("Districts loaded:", data.Data.length);
        return data.Data;
      } else {
        throw new Error(data.Message || "Failed to fetch districts");
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
      setMessage({
        type: "error",
        text: `Error loading districts: ${error.message}`,
      });
      return [];
    }
  };

  // Create district name to ID mapping
  const createDistrictMapping = (districts: District[]) => {
    const mapping = {};
    districts.forEach((district) => {
      mapping[district.DistrictName] = district.DistrictId;
    });
    return mapping;
  };

  // Fetch water fee data
  const fetchWaterFeeData = async (districtList: District[] = districts) => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // If districts not loaded yet, fetch them first
      let currentDistricts = districtList;
      if (currentDistricts.length === 0) {
        currentDistricts = await fetchAllDistricts();
      }

      const response = await fetch(
        `${API_BASE}/GetWaterFeeDeclaration?FinancialYear=${financialYear}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Raw API Response:", data);

      if (data.Status && data.Data && currentDistricts.length > 0) {
        // Create district name to ID mapping
        const districtMapping = createDistrictMapping(currentDistricts);
        console.log("District mapping:", districtMapping);

        // Group by district and get the latest entry for each district
        const latestFees = {};
        data.Data.forEach((item: LatestFeeItem) => {
          const district = item.DistrictName;
          if (
            !latestFees[district] ||
            new Date(item.ApplyFrom) > new Date(latestFees[district].ApplyFrom)
          ) {
            latestFees[district] = item;
          }
        });

        console.log("Latest fees after grouping:", latestFees);

        // Convert to array format with proper district IDs
        const formattedFees: DistrictFee[] = Object.values(latestFees).map(
          (item: LatestFeeItem) => {
            const actualDistrictId = districtMapping[item.DistrictName];

            if (!actualDistrictId) {
              console.warn(`No district ID found for: ${item.DistrictName}`);
            }

            console.log(
              `Processing ${item.DistrictName}: FeeId=${item.FeeId}, ActualDistrictId=${actualDistrictId}`
            );

            return {
              id: item.FeeId, // Keep FeeId as component key
              name: item.DistrictName,
              fee: item.BaseFee.toString(),
              districtId: actualDistrictId || item.FeeId, // Use actual district ID
              totalCollected: item.TotalAmountCollected || 0,
              applyFrom: item.ApplyFrom,
            };
          }
        );

        console.log("Formatted fees with correct district IDs:", formattedFees);

        setDistrictFees(formattedFees);
        setOriginalDistrictFees(JSON.parse(JSON.stringify(formattedFees)));
        setMessage({
          type: "success",
          text: `Loaded ${formattedFees.length} districts successfully`,
        });

        setValidationErrors({});
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
    const initializeData = async () => {
      const districtList = await fetchAllDistricts();
      if (districtList.length > 0) {
        await fetchWaterFeeData(districtList);
      }
    };

    initializeData();
  }, [financialYear]);

  const handleDistrictFeeChange = (id, value) => {
    setDistrictFees((prev) =>
      prev.map((d) => (d.id === id ? { ...d, fee: value } : d))
    );

    const error = validateDistrictFee(value);
    setValidationErrors((prev) => ({
      ...prev,
      [`district_${id}`]: error,
    }));

    if (message.type === "error" && message.text.includes("negative")) {
      setMessage({ type: "", text: "" });
    }
  };

  const handleStateFeeChange = (value) => {
    setStateFee(value);

    const error = validateStateFee(value);
    setValidationErrors((prev) => ({
      ...prev,
      stateFee: error,
    }));

    if (message.type === "error" && message.text.includes("negative")) {
      setMessage({ type: "", text: "" });
    }
  };

  // Save individual district fee
  const saveDistrictFee = async (district) => {
    const feeError = validateDistrictFee(district.fee);
    if (feeError) {
      setMessage({ type: "error", text: `${district.name}: ${feeError}` });
      return;
    }

    if (!district.fee || district.fee === "0") {
      setMessage({ type: "error", text: "Please enter a valid fee amount" });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const requestBody = {
        WaterFeeList: [
          {
            DistrictId: district.districtId, // Now using correct district ID
            WaterFeeAmount: parseFloat(district.fee),
            ApplyFrom: new Date().toISOString(),
            UserId: userId,
            DeviceToken: "web_app",
            IPAddress: "192.168.1.1",
          },
        ],
      };

      console.log(
        `Saving fee for ${district.name} (DistrictId: ${district.districtId}):`,
        requestBody
      );

      const response = await fetch(
        `${API_BASE}/UpdateStateAndDistrictWiseWaterFee`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response data:", data);

      if (data.Status) {
        setMessage({
          type: "success",
          text: `${data.Message} for ${district.name}`,
        });
        setTimeout(() => {
          fetchWaterFeeData();
        }, 1000);
      } else {
        throw new Error(data.Message || data.Errror || "Failed to update fee");
      }
    } catch (error) {
      console.error("Error saving district fee:", error);
      setMessage({
        type: "error",
        text: `Error saving ${district.name}: ${error.message}`,
      });
    } finally {
      setSaving(false);
    }
  };

  // Save state fee for all districts
  const handleSaveStateFee = async () => {
    const stateError = validateStateFee(stateFee);
    if (stateError) {
      setValidationErrors((prev) => ({ ...prev, stateFee: stateError }));
      setMessage({ type: "error", text: stateError });
      return;
    }

    if (!userId) {
      setMessage({
        type: "error",
        text: "User ID not available. Please refresh the page and try again.",
      });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const waterFeeList = districtFees.map((district) => ({
        DistrictId: district.districtId, // Now using correct district ID
        WaterFeeAmount: parseFloat(stateFee),
        ApplyFrom: new Date().toISOString(),
        UserId: userId,
        DeviceToken: "web_app",
        IPAddress: "192.168.1.1",
      }));

      const requestBody = {
        WaterFeeList: waterFeeList,
      };

      console.log(
        "Bulk state fee update request:",
        JSON.stringify(requestBody, null, 2)
      );

      const response = await fetch(
        `${API_BASE}/UpdateStateAndDistrictWiseWaterFee`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("Bulk update response:", data);

      if (data.Status) {
        setMessage({
          type: "success",
          text: `State-wide fee of ₹${stateFee} applied successfully: ${data.Message}`,
        });

        setTimeout(() => {
          fetchWaterFeeData();
          setStateFee("");
          setValidationErrors((prev) => ({ ...prev, stateFee: null }));
        }, 1000);
      } else {
        throw new Error(
          data.Message || data.Errror || "Failed to update state-wide fee"
        );
      }
    } catch (error) {
      console.error("Error in handleSaveStateFee:", error);
      setMessage({ type: "error", text: `Error: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  // Save all changed district fees
  const handleSaveAll = async () => {
    const changedDistricts = districtFees.filter((district, index) => {
      const original = originalDistrictFees[index];
      return original && district.fee !== original.fee && district.fee !== "";
    });

    if (changedDistricts.length === 0) {
      setMessage({ type: "error", text: "No changes to save" });
      return;
    }

    const hasValidationErrors = changedDistricts.some((district) => {
      const error = validateDistrictFee(district.fee);
      if (error) {
        setValidationErrors((prev) => ({
          ...prev,
          [`district_${district.id}`]: error,
        }));
        return true;
      }
      return false;
    });

    if (hasValidationErrors) {
      setMessage({
        type: "error",
        text: "Please fix validation errors before saving",
      });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const waterFeeList = changedDistricts.map((district) => ({
        DistrictId: district.districtId, // Now using correct district ID
        WaterFeeAmount: parseFloat(district.fee),
        ApplyFrom: new Date().toISOString(),
        UserId: userId,
        DeviceToken: "web_app",
        IPAddress: "192.168.1.1",
      }));

      const requestBody = {
        WaterFeeList: waterFeeList,
      };

      console.log("Save all request:", JSON.stringify(requestBody, null, 2));

      const response = await fetch(
        `${API_BASE}/UpdateStateAndDistrictWiseWaterFee`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Save all response:", data);

      if (data.Status) {
        setMessage({
          type: "success",
          text: `Bulk update completed: ${data.Message}`,
        });

        setTimeout(() => {
          fetchWaterFeeData();
        }, 1000);
      } else {
        throw new Error(data.Message || data.Errror || "Bulk update failed");
      }
    } catch (error) {
      console.error("Error in handleSaveAll:", error);
      setMessage({ type: "error", text: `Error: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    const csvHeaders =
      "District Name,Water Fee (₹),Total Amount Collected (₹),Apply From\n";
    const csvContent = districtFees
      .map(
        (district) =>
          `"${district.name}",${district.fee || 0},${
            district.totalCollected || 0
          },"${new Date(district.applyFrom).toLocaleDateString()}"`
      )
      .join("\n");

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
        <IndianRupee className="w-8 h-8 text-blue-600" />
        <h2 className="text-3xl font-bold text-gray-800">
          Water Fee Management
        </h2>
        <button
          onClick={() => fetchWaterFeeData()}
          disabled={loading}
          className="ml-auto flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
      <p className="text-gray-500">
        Set and manage water fee rates for the entire state or district-wise.
      </p>

      {/* Message Display */}
      {message.text && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
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
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <label className="font-medium flex items-center gap-2">
                <Banknote className="w-5 h-5 text-green-600" />
                State-wide Water Fee Amount (₹)
              </label>
              <input
                type="number"
                value={stateFee}
                onChange={(e) => handleStateFeeChange(e.target.value)}
                className={`border rounded-lg px-3 py-2 w-48 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${
                  validationErrors.stateFee
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Enter fee amount"
                min="0"
              />
              <button
                onClick={handleSaveStateFee}
                disabled={saving || loading || validationErrors.stateFee}
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

            {/* State fee validation error */}
            {validationErrors.stateFee && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{validationErrors.stateFee}</span>
              </div>
            )}
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
                        <th className="p-3 border text-left">
                          Water Fee Amount (₹)
                        </th>
                        <th className="p-3 border text-left">
                          Total Collected (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {districtFees.map((district) => (
                        <tr
                          key={district.id}
                          className="hover:bg-blue-50 transition-colors"
                        >
                          <td className="p-3 border font-medium">
                            {district.name}
                          </td>
                          <td className="p-3 border">
                            <div className="space-y-1">
                              <input
                                type="number"
                                value={district.fee}
                                onChange={(e) =>
                                  handleDistrictFeeChange(
                                    district.id,
                                    e.target.value
                                  )
                                }
                                className={`border rounded-lg px-2 py-1 w-32 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${
                                  validationErrors[`district_${district.id}`]
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300"
                                }`}
                                placeholder="Fee"
                                min="0"
                              />
                              {validationErrors[`district_${district.id}`] && (
                                <div className="text-red-600 text-xs flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>
                                    {
                                      validationErrors[
                                        `district_${district.id}`
                                      ]
                                    }
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3 border">
                            <span className="font-semibold text-green-600">
                              ₹{" "}
                              {district.totalCollected?.toLocaleString(
                                "en-IN"
                              ) || "0"}
                            </span>
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
                      districtFees.length === 0 ||
                      Object.values(validationErrors).some((error) => error)
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
                    {
                      districtFees.filter((d, i) => {
                        const original = originalDistrictFees[i];
                        return (
                          original && d.fee !== original.fee && d.fee !== ""
                        );
                      }).length
                    }{" "}
                    changes pending
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
            <option value="2025-26">2025-26</option>
            <option value="2024-25">2024-25</option>
            <option value="2023-24">2023-24</option>
            <option value="2022-23">2022-23</option>
            <option value="2021-22">2021-22</option>
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
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Fee Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {districtFees.length}
              </div>
              <div className="text-sm text-gray-600">Total Districts</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ₹
                {Math.round(
                  districtFees.reduce(
                    (sum, d) => sum + (parseFloat(d.fee) || 0),
                    0
                  ) / districtFees.length
                )}
              </div>
              <div className="text-sm text-gray-600">Average Fee</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                ₹
                {districtFees
                  .reduce((sum, d) => sum + (d.totalCollected || 0), 0)
                  .toLocaleString("en-IN")}
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
            <h3 className="text-lg font-semibold">
              Current Water Fee Structure
            </h3>
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
                  <tr
                    key={district.id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="p-3 border font-medium">{district.name}</td>
                    <td className="p-3 border">
                      <span className="font-semibold text-green-600">
                        ₹ {district.fee || "0"}
                      </span>
                    </td>
                    <td className="p-3 border">
                      <span className="font-semibold text-purple-600">
                        ₹{" "}
                        {district.totalCollected?.toLocaleString("en-IN") ||
                          "0"}
                      </span>
                    </td>
                    <td className="p-3 border text-sm text-gray-500">
                      {new Date(district.applyFrom).toLocaleDateString("en-IN")}
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
