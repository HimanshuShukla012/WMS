import React, { useState, useEffect } from "react";
import { useUserInfo } from '../utils/userInfo';

// ---------- Types ----------
type Village = {
  VillageId: number;
  VillageName: string;
};

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
  beneficiary_Father: string;
  amountPaid: number;
  previousbalance: number;
  baseFee: number;
  villId: number;
  beneficiaryId: number;
  feeCollectionId: number;
  paymentMode: string;
  receiptNo: string;
};

type APIPayload = {
  FeeCollectionId: number;
  FromDate: string;
  ToDate: string;
  UploadBy: number;
  FileName: string;
  LoogBookRemark: string;
  DeviceToken: string;
  IPAddress: string;
  FeeCollectionDate: string;
  VillId: number;
  BeneficiaryId: number;
  PreviousBalance: number;
  OutstandingAmount: number;
  PaidAmount: number;
  PaymentMode: string;
  ReceiptNo: string;
  Remark: string;
  CreatedBy: number;
  ImagePath: string;
};

// ---------- Component ----------
const FeeCollectionPage: React.FC = () => {
  const { userId, role, loading: userLoading, error: userError } = useUserInfo();

  // ---------- State ----------
  const [villages, setVillages] = useState<Village[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryData[]>([]);
  const [entries, setEntries] = useState<FeeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [filters, setFilters] = useState({ village: "", villageId: 0, month: "", year: "" });
  const [editable, setEditable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // State for validation
  const [validationLoading, setValidationLoading] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({ fromDate: "", toDate: "", pdfFile: null as File | null, remark: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const [apiConfig, setApiConfig] = useState({
    uploadBy: 0,
    createdBy: 0,
    fileName: "fee_collection_data",
    logBookRemark: "Fee collection entry",
    deviceToken: "device_token_123",
    ipAddress: "192.168.1.1",
    imagePath: ""
  });

  // Update apiConfig when userId changes
  useEffect(() => {
    if (userId) {
      setApiConfig(prev => ({
        ...prev,
        uploadBy: userId,
        createdBy: userId
      }));
    }
  }, [userId]);

  // ---------- API Functions ----------
  const fetchVillages = async () => {
    if (!userId) {
      setError("User ID not found");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://wmsapi.kdsgroup.co.in/api/Master/GetVillageListByUserId?UserId=${userId}`,
        {
          method: 'GET',
          headers: { 'accept': '*/*' }
        }
      );
      const result = await response.json();
      
      if (result.Status && result.Data) {
        setVillages(result.Data);
      } else {
        setError("Failed to fetch villages");
      }
    } catch (error) {
      console.error('Error fetching villages:', error);
      setError("Error loading villages");
    } finally {
      setLoading(false);
    }
  };

  const fetchBeneficiariesList = async () => {
    if (!userId) {
      setError("User ID not found");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://wmsapi.kdsgroup.co.in/api/Master/GetBeneficiaryDetailListByUser?UserId=${userId}`,
        {
          method: 'GET',
          headers: { 'accept': '*/*' }
        }
      );
      const result = await response.json();
      
      if (result.Status && result.Data) {
        setBeneficiaries(result.Data);
      } else {
        setError("Failed to fetch beneficiaries");
      }
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      setError("Error loading beneficiaries");
    } finally {
      setLoading(false);
    }
  };

  const fetchBeneficiaryBills = async (month: string, year: string) => {
    if (!userId || !month || !year) {
      setError("User ID, month, and year are required");
      return;
    }

    try {
      setLoading(true);
      
      // Convert month name to number (1-12)
      const monthIndex = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
      ].indexOf(month) + 1;
      
      console.log('Fetching beneficiary details:', { userId, month: monthIndex, year });
      
      const response = await fetch(
        `https://wmsapi.kdsgroup.co.in/api/Master/GetBeneficiaryDetailListByUser?UserId=${userId}&Month=${monthIndex}&Year=${year}`,
        {
          method: 'GET',
          headers: { 'accept': '*/*' }
        }
      );
      
      const result = await response.json();
      console.log('Beneficiary Details Response:', result);
      
      if (result.Status && result.Data) {
        // Data is already in the correct format from this API
        setBeneficiaries(result.Data);
        setError("");
      } else {
        setError(result.Message || "Failed to fetch beneficiary details");
        setBeneficiaries([]);
      }
    } catch (error) {
      console.error('Error fetching beneficiary details:', error);
      setError("Error loading beneficiary details");
      setBeneficiaries([]);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingFeeRecords = async (villageId: number, month: string, year: string) => {
  // This function is no longer needed as filtering is done in the useEffect
  // Kept for backward compatibility but does nothing
  return true;
};

  // ---------- Effects ----------
  useEffect(() => {
    // Only fetch data when user loading is complete and userId exists
    if (!userLoading && userId) {
      fetchVillages();
      // Don't fetch beneficiaries initially - wait for month/year selection
    }
  }, [userId, userLoading]);

  // Effect to trigger validation when all filters are selected
  // Effect to trigger validation and fetch bills when month and year are selected
  // Effect to fetch bills when month and year are selected
  useEffect(() => {
    if (filters.month && filters.year && userId) {
      // Fetch beneficiary bills for the selected month and year
      fetchBeneficiaryBills(filters.month, filters.year);
    } else {
      setBeneficiaries([]);
      setEntries([]);
    }
  }, [filters.month, filters.year, userId]);

  

  // Updated effect to filter entries based on payment status
  // Updated effect to filter entries based on village selection
  // Filter entries based on village selection and date filtering
useEffect(() => {
  if (!filters.month || !filters.year || beneficiaries.length === 0) {
    setEntries([]);
    setValidationMessage("");
    setCanProceed(true);
    return;
  }

  console.log("🔄 Filtering entries for", filters.month, filters.year);
  console.log("Total beneficiaries:", beneficiaries.length);

  const monthIndex = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ].indexOf(filters.month) + 1;

  // Filter beneficiaries by village if selected
  let filteredBeneficiaries = beneficiaries;
  if (filters.villageId) {
    filteredBeneficiaries = beneficiaries.filter(
      b => b.VillageId === filters.villageId
    );
    console.log(`Filtered to village ${filters.village}:`, filteredBeneficiaries.length);
  }

  // Filter out beneficiaries who already have a record for the selected month/year
  const availableBeneficiaries = filteredBeneficiaries.filter(beneficiary => {
    if (beneficiary.FeeCollectionId > 0 && beneficiary.Date) {
      const recordDate = new Date(beneficiary.Date);
      const recordMonth = recordDate.getMonth() + 1;
      const recordYear = recordDate.getFullYear();
      
      const hasRecordForSelectedMonth = (recordMonth === monthIndex && recordYear === parseInt(filters.year));
      
      if (hasRecordForSelectedMonth) {
        console.log(`❌ Excluding ${beneficiary.BeneficiaryName} - already has record for ${filters.month} ${filters.year}`);
        return false;
      }
    }
    
    console.log(`✅ Including ${beneficiary.BeneficiaryName} - no record for ${filters.month} ${filters.year}`);
    return true;
  });

  console.log("✅ Available for collection:", availableBeneficiaries.length);
  console.log("❌ Excluded (already have records):", filteredBeneficiaries.length - availableBeneficiaries.length);

  const feeEntries: FeeEntry[] = availableBeneficiaries.map((beneficiary) => ({
    id: beneficiary.BeneficiaryId,
    village: beneficiary.VillageName,
    beneficiary: beneficiary.BeneficiaryName,
    beneficiary_Father: beneficiary.FatherHusbandName,
    amountPaid: 0,
    previousbalance: beneficiary.PreviousBalance || 0,
    baseFee: beneficiary.BaseFee || 0,
    villId: filters.villageId || beneficiary.VillageId,
    beneficiaryId: beneficiary.BeneficiaryId,
    feeCollectionId: beneficiary.FeeCollectionId || 0,
    paymentMode: "Cash",
    receiptNo: ""
  }));

  setEntries(feeEntries);

  // Update validation message based on results
  const excludedCount = filteredBeneficiaries.length - availableBeneficiaries.length;
  if (availableBeneficiaries.length === 0) {
    setValidationMessage(`❌ All beneficiaries ${filters.villageId ? `in ${filters.village}` : ''} already have records for ${filters.month} ${filters.year}.`);
    setCanProceed(false);
  } else {
    setValidationMessage(
  `⚠️ Showing ${availableBeneficiaries.length} beneficiaries based on latest payment records.` +
  (excludedCount > 0 ? ` (${excludedCount} excluded based on visible records)` : '') +
  `\n\n💡 Important: The system shows beneficiaries based on their most recent payment date. Some may have older payment records for ${filters.month} ${filters.year} that aren't visible here. Such beneficiaries will be automatically skipped when you save.`
);
    setCanProceed(true);
  }
}, [filters.villageId, filters.village, filters.month, filters.year, beneficiaries]);

  // ---------- Handlers ----------
  const handleVillageChange = (villageId: string) => {
    const selectedVillage = villages.find(v => v.VillageId === parseInt(villageId));
    setFilters(prev => ({
      ...prev,
      village: selectedVillage?.VillageName || "",
      villageId: parseInt(villageId) || 0
    }));
    setEditable(false);
    setSaveMessage("");
    setCanProceed(false);
    setValidationMessage("");
    
  };

  const handleMonthChange = (month: string) => {
    setFilters(prev => ({ ...prev, month }));
    setEditable(false);
    setSaveMessage("");
    setCanProceed(false);
    setValidationMessage("");
  };

  const handleYearChange = (year: string) => {
    setFilters(prev => ({ ...prev, year }));
    setEditable(false);
    setSaveMessage("");
    setCanProceed(false);
    setValidationMessage("");
    
  };

  const handleChangeAmountPaid = (id: number, value: number) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        const maxAmount = entry.baseFee + entry.previousbalance;
        return { ...entry, amountPaid: Math.min(value, maxAmount) };
      }
      return entry;
    }));
  };

  const handleChangePaymentMode = (id: number, paymentMode: string) => {
    setEntries(prev => prev.map(entry => entry.id === id ? { ...entry, paymentMode } : entry));
  };

  const handleChangeReceiptNo = (id: number, receiptNo: string) => {
    setEntries(prev => prev.map(entry => entry.id === id ? { ...entry, receiptNo } : entry));
  };

  const getCurrentDateTime = () => new Date().toISOString();

  const getFilterDate = () => {
    if (filters.month && filters.year) {
      const monthIndex = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
      ].indexOf(filters.month);
      return new Date(parseInt(filters.year), monthIndex, 1).toISOString();
    }
    return getCurrentDateTime();
  };

  const callAPI = async (entry: FeeEntry, month: string, year: string) => {
    try {
      const monthIndex = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
      ].indexOf(month) + 1;

      const payload = {
        FeeCollectionDate: new Date().toISOString(),
        DeviceToken: apiConfig.deviceToken,
        IpAddress: apiConfig.ipAddress,
        VillageId: entry.villId,
        BeneficiaryId: entry.beneficiaryId,
        Month: monthIndex,
        Year: parseInt(year),
        AmountPaid: entry.amountPaid,
        PaymentMode: entry.paymentMode,
        CollectedBy: userId
      };

      const response = await fetch('https://wmsapi.kdsgroup.co.in/api/User/InsertFeeCollectionFinal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'accept': '*/*' },
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const handleProceed = () => {
  if (!filters.month || !filters.year) {
    setError("Please select month and year");
    return;
  }
  
  if (entries.length === 0) {
    setError("No beneficiaries found to edit");
    return;
  }
  
  setEditable(true);
  setSaveMessage("💡 Note: Some beneficiaries may have hidden payment records for this month that aren't visible in the list. They will be automatically skipped during save if records already exist.");
  setError("");
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

  console.log("💾 Attempting to save entries:");
  entriesToSave.forEach(entry => {
    console.log(`- ${entry.beneficiary} (ID: ${entry.beneficiaryId}): ₹${entry.amountPaid} for ${filters.month} ${filters.year}`);
  });

  setSaving(true);
  setSaveMessage("");

  try {
    const results = [];
    
    // Save one by one to see which one fails
    for (const entry of entriesToSave) {
      console.log(`Saving ${entry.beneficiary}...`);
      try {
        const result = await callAPI(entry, filters.month, filters.year);
        console.log(`Result for ${entry.beneficiary}:`, result);
        results.push({ entry, result });
      } catch (error) {
        console.error(`Failed to save ${entry.beneficiary}:`, error);
        results.push({ entry, result: { Status: false, Message: error.message } });
      }
    }
    
    const successResults = results.filter(r => r.result.Status === true);
    const partialPaymentResults = results.filter(r => 
      r.result.Status === false && r.result.Message && r.result.Message.includes("Partial payment")
    );
    const alreadyRecordedResults = results.filter(r => 
      r.result.Status === false && r.result.Message && r.result.Message.includes("already recorded")
    );
    const inactiveSupplyResults = results.filter(r => 
      r.result.Status === false && r.result.Message && r.result.Message.includes("Water supply inactive")
    );
    const otherFailedResults = results.filter(r => 
      r.result.Status === false && 
      r.result.Message &&
      !r.result.Message.includes("already recorded") && 
      !r.result.Message.includes("Water supply inactive") &&
      !r.result.Message.includes("Partial payment")
    );

    // Build detailed message
    // Build detailed message
let message = "";
if (successResults.length > 0) {
  message += `✅ ${successResults.length} entries saved successfully! `;
}
if (partialPaymentResults.length > 0) {
  message += `⚠️ ${partialPaymentResults.length} partial payments recorded. `;
}
if (alreadyRecordedResults.length > 0) {
  const names = alreadyRecordedResults.map(r => r.entry.beneficiary).join(", ");
  message += `ℹ️ ${alreadyRecordedResults.length} skipped - already have records for ${filters.month} ${filters.year} (${names}). `;
  console.log("❌ Already recorded details:", alreadyRecordedResults);
}
    if (inactiveSupplyResults.length > 0) {
      message += `❌ ${inactiveSupplyResults.length} have inactive water supply. `;
    }
    if (otherFailedResults.length > 0) {
      message += `❌ ${otherFailedResults.length} failed to save. `;
      console.log("Failed results:", otherFailedResults);
    }

    setSaveMessage(message.trim());

    if (successResults.length > 0 || partialPaymentResults.length > 0) {
      // Clear amounts for successful entries
      setEntries(prev => prev.map(entry => ({ ...entry, amountPaid: 0 })));
      
      // Refresh data
      if (filters.month && filters.year) {
        await fetchBeneficiaryBills(filters.month, filters.year);
      }
      
      
    }
  } catch (error) {
    setSaveMessage("❌ Error saving entries. Please try again.");
    console.error("Save error:", error);
  } finally {
    setSaving(false);
  }
};

  const convertFileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleUploadLogbook = async () => {
    if (!uploadData.fromDate || !uploadData.toDate || !uploadData.pdfFile) {
      setUploadMessage("❌ Please fill all required fields and select a PDF file.");
      return;
    }

    if (!userId) {
      setUploadMessage("❌ User ID not found.");
      return;
    }

    setUploading(true);
    setUploadMessage("");

    try {
      const base64File = await convertFileToBase64(uploadData.pdfFile);
      const payload: APIPayload = {
        FeeCollectionId: 0, // 0 for new logbook upload
        FromDate: uploadData.fromDate,
        ToDate: uploadData.toDate,
        UploadBy: apiConfig.uploadBy,
        FileName: uploadData.pdfFile.name,
        LoogBookRemark: uploadData.remark || "Logbook upload",
        DeviceToken: apiConfig.deviceToken,
        IPAddress: apiConfig.ipAddress,
        FeeCollectionDate: getCurrentDateTime(),
        VillId: filters.villageId,
        BeneficiaryId: 0,
        PreviousBalance: 0,
        OutstandingAmount: 0,
        PaidAmount: 0,
        PaymentMode: "Logbook",
        ReceiptNo: `LOGBOOK-${Date.now()}`,
        Remark: uploadData.remark,
        CreatedBy: apiConfig.createdBy,
        ImagePath: base64File
      };

      const result = await callAPI(payload);
      if (result.Status) {
        setUploadMessage("✅ Logbook uploaded successfully!");
        setUploadData({ fromDate:"", toDate:"", pdfFile:null, remark:"" });
        setTimeout(() => { setShowUploadModal(false); setUploadMessage(""); }, 2000);
      } else {
        setUploadMessage(`❌ Upload failed: ${result.Message}`);
      }
    } catch (error) {
      setUploadMessage("❌ Error uploading logbook. Please try again.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // ---------- Render ----------
  
  // Show loading spinner while checking user info
  if (userLoading) {
    return (
      <div className="p-6 relative z-10">
        <div className="bg-blue-100 text-blue-700 p-3 rounded">
          Loading user information...
        </div>
      </div>
    );
  }

  // Show error if user info couldn't be loaded or no userId
  if (userError || !userId) {
    return (
      <div className="p-6 relative z-10">
        <div className="bg-red-100 text-red-700 p-3 rounded">
          {userError || "User ID not found. Please login again."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 relative z-10">
      <h1 className="text-2xl font-bold mb-4">Fee Collection Page</h1>

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

      {/* Validation Loading Display */}
      {validationLoading && (
        <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-700">
          Checking existing records...
        </div>
      )}

      {/* Validation Message */}
      {validationMessage && (
        <div className={`mb-4 p-3 rounded whitespace-pre-line ${
          validationMessage.includes('✅') 
            ? 'bg-green-100 text-green-700' 
            : validationMessage.includes('⚠️')
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
        }`}>
          {validationMessage}
        </div>
      )}

      {/* User Info Debug (remove in production) */}
      <div className="mb-4 p-3 rounded bg-gray-100 text-gray-700 text-sm">
        User ID: {userId} | Role: {role}
      </div>

      {/* Info Message */}
{filters.month && filters.year && entries.length > 0 && (
  <div className="mb-4 p-3 rounded bg-blue-100 text-blue-700">
    ℹ️ Showing {entries.length} beneficiaries available for {filters.month} {filters.year}
    {filters.villageId ? ` in ${filters.village}` : ' (all villages)'}.
    {beneficiaries.length > entries.length && (
      <span> ({beneficiaries.length - entries.length} already have records for this month)</span>
    )}
  </div>
)}

{filters.month && filters.year && entries.length === 0 && !loading && beneficiaries.length > 0 && (
  <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-700">
    ⚠️ All beneficiaries already have fee records for {filters.month} {filters.year}.
  </div>
)}

{filters.month && filters.year && beneficiaries.length === 0 && !loading && (
  <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-700">
    ⚠️ No beneficiaries found for {filters.month} {filters.year}.
  </div>
)}

{/* Warning Banner */}
      {entries.length > 0 && !editable && (
        <div className="mb-4 p-3 rounded bg-yellow-50 border border-yellow-200">
          <p className="text-yellow-800 text-sm">
            ⚠️ <strong>Note:</strong> The list below is based on the most recent payment date for each beneficiary. 
            Some beneficiaries may have older payment records for {filters.month} {filters.year} that aren't shown. 
            These will be automatically skipped during save to prevent duplicate entries.
          </p>
        </div>
      )}


      {/* Filters & Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select 
          className="p-2 border rounded w-48" 
          value={filters.villageId || ""} 
          onChange={e => handleVillageChange(e.target.value)}
          disabled={loading}
        >
          <option value="">Select Village</option>
          {villages.map(village => (
            <option key={village.VillageId} value={village.VillageId}>
              {village.VillageName}
            </option>
          ))}
        </select>

        <select 
          className="p-2 border rounded w-32" 
          value={filters.month} 
          onChange={e => handleMonthChange(e.target.value)}
        >
          <option value="">Select Month</option>
          {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => 
            <option key={m} value={m}>{m}</option>
          )}
        </select>

        <select 
          className="p-2 border rounded w-24" 
          value={filters.year} 
          onChange={e => handleYearChange(e.target.value)}
        >
          <option value="">Select Year</option>
          {[2023,2024,2025,2026].map(y => 
            <option key={y} value={y.toString()}>{y}</option>
          )}
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
          {loading ? "Loading..." : "Proceed to Edit"}
        </button>

        <button 
          type="button" 
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded" 
          onClick={() => setShowUploadModal(true)}
          disabled={loading}
        >
          Upload Logbook
        </button>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`mb-4 p-3 rounded ${saveMessage.includes('✅')?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>
          {saveMessage}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 shadow-md rounded-xl overflow-hidden">
          <thead className="bg-blue-600 text-white text-center">
            <tr>
              <th className="px-4 py-2 border">Village</th>
              <th className="px-4 py-2 border">Beneficiary Name</th>
              <th className="px-4 py-2 border">Father/Husband Name</th>
              <th className="px-4 py-2 border">Base Fee (₹)</th>
              <th className="px-4 py-2 border">Previous Balance (₹)</th>
              <th className="px-4 py-2 border">Cumulative Payable Fee (₹)</th>
              <th className="px-4 py-2 border">Amount Paid (₹)</th>
              <th className="px-4 py-2 border">Payment Mode</th>
              <th className="px-4 py-2 border">Receipt Number</th>
              <th className="px-4 py-2 border">Balance Amount (₹)</th>
              <th className="px-4 py-2 border w-32">Status</th>

            </tr>
          </thead>
          <tbody>
            {entries.length > 0 ? entries.map(entry => {
              
              return (
                <tr key={entry.id} className="bg-white text-black text-center">
                  <td className="px-4 py-2 border">{entry.village}</td>
                  <td className="px-4 py-2 border">{entry.beneficiary}</td>
                  <td className="px-4 py-2 border">{entry.beneficiary_Father || "N/A"}</td>
                  <td className="px-4 py-2 border">{entry.baseFee}</td>
                  <td className="px-4 py-2 border">{entry.previousbalance}</td>
                  <td className="px-4 py-2 border">{entry.baseFee + entry.previousbalance}</td>
                  <td className="px-4 py-2 border">
                    {editable ? (
                      <input 
                        type="number" 
                        className="w-24 border rounded px-2 py-1 text-center" 
                        value={entry.amountPaid} 
                        min={0} 
                        max={entry.baseFee + entry.previousbalance} 
                        onChange={e => handleChangeAmountPaid(entry.id, Number(e.target.value))} 
                      />
                    ) : entry.amountPaid}
                  </td>
                  <td className="px-4 py-2 border">
                    {editable ? (
                      <select 
                        className="w-24 border rounded px-2 py-1 text-center" 
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
                        className="w-32 border rounded px-2 py-1 text-center" 
                        value={entry.receiptNo} 
                        onChange={e => handleChangeReceiptNo(entry.id, e.target.value)} 
                        placeholder={`REC-${entry.id}`} 
                      />
                    ) : entry.receiptNo || `REC-${entry.id}-${Date.now()}`}
                  </td>
                  <td className="px-4 py-2 border">{(entry.baseFee + entry.previousbalance) - entry.amountPaid}</td>
                  <td className="px-4 py-2 border">
  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
    Available
  </span>
</td>
                </tr>
              );
            }) : (
              <tr>
  <td
    colSpan={11}
    className="text-center py-4 text-gray-500 w-full min-w-[1200px]"
  >
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
            className={`${saving ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"} text-white px-6 py-2 rounded`}
          >
            {saving ? "Saving..." : "Save Fee Collection"}
          </button>
        </div>
      )}

      {/* Upload Logbook Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Upload Logbook</h2>
              <button 
                onClick={() => { 
                  setShowUploadModal(false); 
                  setUploadMessage(""); 
                  setUploadData({fromDate:"",toDate:"",pdfFile:null,remark:""}); 
                }} 
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {uploadMessage && (
              <div className={`mb-4 p-3 rounded ${uploadMessage.includes('✅')?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>
                {uploadMessage}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">From Date *</label>
                <input 
                  type="date" 
                  className="w-full p-2 border rounded" 
                  value={uploadData.fromDate} 
                  onChange={e=>setUploadData(prev=>({...prev,fromDate:e.target.value}))} 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">To Date *</label>
                <input 
                  type="date" 
                  className="w-full p-2 border rounded" 
                  value={uploadData.toDate} 
                  onChange={e=>setUploadData(prev=>({...prev,toDate:e.target.value}))} 
                  required 
                  min={uploadData.fromDate} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Upload PDF *</label>
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="w-full p-2 border rounded" 
                  onChange={e => {
                    const file = e.target.files?.[0] || null;
                    if(file && file.type!=='application/pdf'){
                      setUploadMessage("❌ Please select a valid PDF file."); 
                      return;
                    }
                    setUploadData(prev=>({...prev,pdfFile:file}));
                    if(uploadMessage.includes('PDF')) setUploadMessage("");
                  }} 
                  required 
                />
                {uploadData.pdfFile && (
                  <p className="text-sm text-gray-600 mt-1">{uploadData.pdfFile.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Remark</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded" 
                  value={uploadData.remark} 
                  onChange={e=>setUploadData(prev=>({...prev,remark:e.target.value}))} 
                />
              </div>

              <div className="flex justify-end gap-2">
                <button 
                  onClick={()=>{ 
                    setShowUploadModal(false); 
                    setUploadMessage(""); 
                  }} 
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUploadLogbook} 
                  disabled={uploading} 
                  className={`${uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} text-white px-4 py-2 rounded`}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeCollectionPage;