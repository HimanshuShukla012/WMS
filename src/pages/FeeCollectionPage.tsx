import React, { useState, useEffect } from "react";
import { useUserInfo } from '../utils/userInfo';

// ---------- Types ----------
type BeneficiaryData = {
  FeeCollectionId: number;
  CollectionId: number;
  BeneficiaryId: number;
  BeneficiaryName: string;
  FatherHusbandName: string;
  VillageId: number;
  VillageName: string;
  BaseFee: number;
  PreviousBalance: number;
  BalanceAmount: number;
  OutstandingAmount: number;
  PaidAmount: number;
  Date: string;
};

type FeeEntry = {
  id: number;
  village: string;
  beneficiary: string;
  beneficiaryFather: string;
  amountPaid: number;
  previousBalance: number;
  baseFee: number;
  villageId: number;
  beneficiaryId: number;
  paymentMode: string;
  receiptNo: string;
  lastPaymentDate: string;
};

// ---------- Component ----------
const FeeCollectionPage: React.FC = () => {
  const { userId, role, loading: userLoading, error: userError } = useUserInfo();

  // ---------- State ----------
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryData[]>([]);
  const [entries, setEntries] = useState<FeeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [filters, setFilters] = useState({ 
    village: "", 
    month: "", 
    year: "" 
  });
  
  const [editable, setEditable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Get unique villages from beneficiaries
  const villages = React.useMemo(() => {
    const uniqueVillages = new Map();
    beneficiaries.forEach(b => {
      if (!uniqueVillages.has(b.VillageId)) {
        uniqueVillages.set(b.VillageId, {
          VillageId: b.VillageId,
          VillageName: b.VillageName
        });
      }
    });
    return Array.from(uniqueVillages.values());
  }, [beneficiaries]);

  // ---------- API Functions ----------
  const fetchBeneficiaries = async (month: string, year: string) => {
    if (!userId || !month || !year) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const monthIndex = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
      ].indexOf(month) + 1;
      
      console.log(`📡 Fetching beneficiaries for ${month} ${year} (Month: ${monthIndex}, UserId: ${userId})`);
      
      const response = await fetch(
        `https://wmsapi.kdsgroup.co.in/api/Master/GetBeneficiaryDetailListByUser?UserId=${userId}&Month=${monthIndex}&Year=${year}`,
        {
          method: 'GET',
          headers: { 'accept': '*/*' }
        }
      );
      
      const result = await response.json();
      console.log(`📊 API Response:`, result);
      
      if (result.Status && result.Data) {
        console.log(`✅ Received ${result.Data.length} beneficiaries from API`);
        setBeneficiaries(result.Data);
      } else {
        setError(result.Message || "Failed to fetch beneficiary data");
        setBeneficiaries([]);
      }
    } catch (error) {
      console.error('❌ Error fetching beneficiaries:', error);
      setError("Error loading beneficiary data");
      setBeneficiaries([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Effects ----------
  // Fetch beneficiaries when month/year changes
  useEffect(() => {
    if (filters.month && filters.year && userId) {
      fetchBeneficiaries(filters.month, filters.year);
    } else {
      setBeneficiaries([]);
      setEntries([]);
    }
  }, [filters.month, filters.year, userId]);

  // Create entries from beneficiaries - NO FILTERING, show everything from API
  useEffect(() => {
    console.log(`🔄 Creating entries from ${beneficiaries.length} beneficiaries`);
    
    if (beneficiaries.length === 0) {
      setEntries([]);
      return;
    }

    // Apply village filter if selected (optional)
    const filtered = filters.village 
      ? beneficiaries.filter(b => b.VillageName === filters.village)
      : beneficiaries;

    console.log(`📝 After village filter: ${filtered.length} beneficiaries`);

    // Convert all beneficiaries to fee entries - NO DATE FILTERING
    const feeEntries: FeeEntry[] = filtered.map((beneficiary) => {
      console.log(`  - ${beneficiary.BeneficiaryName}: Last payment ${beneficiary.Date || 'Never'}`);
      
      return {
        id: beneficiary.BeneficiaryId,
        village: beneficiary.VillageName,
        beneficiary: beneficiary.BeneficiaryName,
        beneficiaryFather: beneficiary.FatherHusbandName,
        amountPaid: 0,
        previousBalance: beneficiary.PreviousBalance || 0,
        baseFee: beneficiary.BaseFee || 0,
        villageId: beneficiary.VillageId,
        beneficiaryId: beneficiary.BeneficiaryId,
        paymentMode: "Cash",
        receiptNo: "",
        lastPaymentDate: beneficiary.Date || "No previous payment"
      };
    });

    console.log(`✅ Created ${feeEntries.length} fee entries`);
    setEntries(feeEntries);
  }, [beneficiaries, filters.village]);

  // ---------- Handlers ----------
  const handleVillageChange = (villageName: string) => {
    setFilters(prev => ({ ...prev, village: villageName }));
    setEditable(false);
    setSaveMessage("");
  };

  const handleMonthChange = (month: string) => {
    setFilters(prev => ({ ...prev, month }));
    setEditable(false);
    setSaveMessage("");
    setError("");
  };

  const handleYearChange = (year: string) => {
    setFilters(prev => ({ ...prev, year }));
    setEditable(false);
    setSaveMessage("");
    setError("");
  };

  const handleChangeAmountPaid = (id: number, value: number) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        const maxAmount = entry.baseFee + entry.previousBalance;
        return { ...entry, amountPaid: Math.max(0, Math.min(value, maxAmount)) };
      }
      return entry;
    }));
  };

  const handleChangePaymentMode = (id: number, paymentMode: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, paymentMode } : entry
    ));
  };

  const handleChangeReceiptNo = (id: number, receiptNo: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, receiptNo } : entry
    ));
  };

  const handleProceed = () => {
    if (!filters.month || !filters.year) {
      setError("Please select month and year");
      return;
    }
    
    if (entries.length === 0) {
      setError("No beneficiaries found");
      return;
    }
    
    setEditable(true);
    setSaveMessage("");
    setError("");
  };

  const callAPI = async (entry: FeeEntry, month: string, year: string) => {
    try {
      const monthIndex = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
      ].indexOf(month) + 1;

      const payload = {
        FeeCollectionDate: new Date().toISOString(),
        DeviceToken: "device_token_123",
        IpAddress: "192.168.1.1",
        VillageId: entry.villageId,
        BeneficiaryId: entry.beneficiaryId,
        Month: monthIndex,
        Year: parseInt(year),
        AmountPaid: entry.amountPaid,
        PaymentMode: entry.paymentMode,
        CollectedBy: userId
      };

      console.log(`💾 Saving payment for ${entry.beneficiary}:`, payload);

      const response = await fetch('https://wmsapi.kdsgroup.co.in/api/User/InsertFeeCollectionFinal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'accept': '*/*' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      console.log(`📥 Save result for ${entry.beneficiary}:`, result);
      
      return result;
    } catch (error) {
      console.error('❌ API call failed:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!userId) {
      setError("User ID not found");
      return;
    }

    if (!filters.month || !filters.year) {
      setError("Month and year are required");
      return;
    }

    const entriesToSave = entries.filter(e => e.amountPaid > 0);
    
    if (entriesToSave.length === 0) {
      setSaveMessage("⚠️ No amounts entered. Please enter amounts to save.");
      return;
    }

    console.log(`💰 Attempting to save ${entriesToSave.length} entries`);
    setSaving(true);
    setSaveMessage("");

    try {
      const results = [];
      
      for (const entry of entriesToSave) {
        try {
          const result = await callAPI(entry, filters.month, filters.year);
          results.push({ entry, result });
        } catch (error) {
          results.push({ 
            entry, 
            result: { Status: false, Message: error.message } 
          });
        }
      }
      
      const successCount = results.filter(r => r.result.Status === true).length;
      const partialCount = results.filter(r => 
        r.result.Status === false && 
        r.result.Message?.includes("Partial payment")
      ).length;
      const duplicateCount = results.filter(r => 
        r.result.Status === false && 
        r.result.Message?.includes("already recorded")
      ).length;
      const inactiveCount = results.filter(r => 
        r.result.Status === false && 
        r.result.Message?.includes("Water supply inactive")
      ).length;
      const failedCount = results.filter(r => 
        r.result.Status === false && 
        !r.result.Message?.includes("already recorded") && 
        !r.result.Message?.includes("Water supply inactive") &&
        !r.result.Message?.includes("Partial payment")
      ).length;

      let message = "";
      if (successCount > 0) {
        message += `✅ ${successCount} entries saved successfully! `;
      }
      if (partialCount > 0) {
        message += `⚠️ ${partialCount} partial payments recorded. `;
      }
      if (duplicateCount > 0) {
        message += `ℹ️ ${duplicateCount} skipped (already recorded for this month). `;
      }
      if (inactiveCount > 0) {
        message += `❌ ${inactiveCount} have inactive water supply. `;
      }
      if (failedCount > 0) {
        message += `❌ ${failedCount} failed to save. `;
      }

      console.log(`📊 Save Summary: Success=${successCount}, Partial=${partialCount}, Duplicate=${duplicateCount}, Inactive=${inactiveCount}, Failed=${failedCount}`);
      setSaveMessage(message.trim());

      if (successCount > 0 || partialCount > 0) {
        // Clear amounts for successful entries
        setEntries(prev => prev.map(entry => ({ ...entry, amountPaid: 0 })));
        
        // Refresh data
        await fetchBeneficiaries(filters.month, filters.year);
      }
    } catch (error) {
      setSaveMessage("❌ Error saving entries. Please try again.");
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  // ---------- Render ----------
  
  if (userLoading) {
    return (
      <div className="p-6">
        <div className="bg-blue-100 text-blue-700 p-3 rounded">
          Loading user information...
        </div>
      </div>
    );
  }

  if (userError || !userId) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-3 rounded">
          {userError || "User ID not found. Please login again."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Fee Collection</h1>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-700">
          {error}
        </div>
      )}

      {/* Loading Display */}
      {loading && (
        <div className="mb-4 p-3 rounded bg-blue-100 text-blue-700">
          Loading data...
        </div>
      )}

      {/* User Info */}
      <div className="mb-4 p-3 rounded bg-gray-100 text-gray-700 text-sm">
        User ID: {userId} | Role: {role}
      </div>

      {/* Info Message */}
      {filters.month && filters.year && entries.length > 0 && (
        <div className="mb-4 p-3 rounded bg-blue-100 text-blue-700">
          ℹ️ Showing {entries.length} beneficiaries for {filters.month} {filters.year}
          {filters.village && ` in ${filters.village}`}.
          <br />
          <small className="text-blue-600">
            💡 The API returns beneficiaries based on their payment history. 
            Duplicate entries for the same month will be prevented by the backend.
          </small>
        </div>
      )}

      {filters.month && filters.year && entries.length === 0 && !loading && beneficiaries.length > 0 && (
        <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-700">
          ⚠️ No beneficiaries found for the selected village filter.
        </div>
      )}

      {filters.month && filters.year && beneficiaries.length === 0 && !loading && (
        <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-700">
          ℹ️ No data available for {filters.month} {filters.year}. This could mean all payments are up to date.
        </div>
      )}

      {/* Filters & Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select 
          className="p-2 border rounded w-48" 
          value={filters.month} 
          onChange={e => handleMonthChange(e.target.value)}
        >
          <option value="">Select Month *</option>
          {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => 
            <option key={m} value={m}>{m}</option>
          )}
        </select>

        <select 
          className="p-2 border rounded w-32" 
          value={filters.year} 
          onChange={e => handleYearChange(e.target.value)}
        >
          <option value="">Select Year *</option>
          {[2023,2024,2025,2026].map(y => 
            <option key={y} value={y.toString()}>{y}</option>
          )}
        </select>

        <select 
          className="p-2 border rounded w-48" 
          value={filters.village} 
          onChange={e => handleVillageChange(e.target.value)}
          disabled={villages.length === 0}
        >
          <option value="">All Villages</option>
          {villages.map(village => (
            <option key={village.VillageId} value={village.VillageName}>
              {village.VillageName}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={!filters.month || !filters.year || loading || entries.length === 0}
          onClick={handleProceed}
          className={`${
            (filters.month && filters.year && !loading && entries.length > 0) 
              ? "bg-blue-600 hover:bg-blue-700" 
              : "bg-gray-400 cursor-not-allowed"
          } text-white px-4 py-2 rounded`}
        >
          {loading ? "Loading..." : "Edit Entries"}
        </button>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`mb-4 p-3 rounded ${
          saveMessage.includes('✅') 
            ? 'bg-green-100 text-green-700' 
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 shadow-md rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-2 border text-left">Village</th>
              <th className="px-4 py-2 border text-left">Beneficiary</th>
              <th className="px-4 py-2 border text-left">Father/Husband</th>
              <th className="px-4 py-2 border text-left">Last Payment</th>
              <th className="px-4 py-2 border text-right">Base Fee (₹)</th>
              <th className="px-4 py-2 border text-right">Previous Balance (₹)</th>
              <th className="px-4 py-2 border text-right">Total Payable (₹)</th>
              <th className="px-4 py-2 border text-right">Amount Paid (₹)</th>
              <th className="px-4 py-2 border">Payment Mode</th>
              <th className="px-4 py-2 border">Receipt No</th>
              <th className="px-4 py-2 border text-right">Balance (₹)</th>
            </tr>
          </thead>
          <tbody>
            {entries.length > 0 ? entries.map(entry => (
              <tr key={entry.id} className="bg-white hover:bg-gray-50">
                <td className="px-4 py-2 border">{entry.village}</td>
                <td className="px-4 py-2 border">{entry.beneficiary}</td>
                <td className="px-4 py-2 border">{entry.beneficiaryFather || "N/A"}</td>
                <td className="px-4 py-2 border text-sm text-gray-600">
                  {entry.lastPaymentDate !== "No previous payment" 
                    ? new Date(entry.lastPaymentDate).toLocaleDateString('en-IN')
                    : "Never"}
                </td>
                <td className="px-4 py-2 border text-right">{entry.baseFee}</td>
                <td className="px-4 py-2 border text-right">{entry.previousBalance}</td>
                <td className="px-4 py-2 border text-right font-semibold">
                  {entry.baseFee + entry.previousBalance}
                </td>
                <td className="px-4 py-2 border text-right">
                  {editable ? (
                    <input 
                      type="number" 
                      className="w-24 border rounded px-2 py-1 text-right" 
                      value={entry.amountPaid} 
                      min={0} 
                      max={entry.baseFee + entry.previousBalance} 
                      onChange={e => handleChangeAmountPaid(entry.id, Number(e.target.value))} 
                    />
                  ) : entry.amountPaid}
                </td>
                <td className="px-4 py-2 border">
                  {editable ? (
                    <select 
                      className="w-full border rounded px-2 py-1" 
                      value={entry.paymentMode} 
                      onChange={e => handleChangePaymentMode(entry.id, e.target.value)}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Online">Online</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Card">Card</option>
                    </select>
                  ) : entry.paymentMode}
                </td>
                <td className="px-4 py-2 border">
                  {editable ? (
                    <input 
                      type="text" 
                      className="w-32 border rounded px-2 py-1" 
                      value={entry.receiptNo} 
                      onChange={e => handleChangeReceiptNo(entry.id, e.target.value)} 
                      placeholder="Optional" 
                    />
                  ) : entry.receiptNo || "-"}
                </td>
                <td className="px-4 py-2 border text-right font-semibold">
                  {(entry.baseFee + entry.previousBalance) - entry.amountPaid}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={11} className="text-center py-8 text-gray-500">
                  {filters.month && filters.year
                    ? "No beneficiaries available for the selected criteria."
                    : "Please select month and year to view beneficiaries."
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Save Button */}
      {editable && entries.length > 0 && (
        <div className="mt-6">
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className={`${
              saving 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-green-600 hover:bg-green-700"
            } text-white px-6 py-2 rounded font-semibold`}
          >
            {saving ? "Saving..." : "Save Fee Collection"}
          </button>
        </div>
      )}
    </div>
  );
};

export default FeeCollectionPage;