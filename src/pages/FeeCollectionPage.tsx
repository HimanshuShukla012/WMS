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
  const [existingBeneficiaryIds, setExistingBeneficiaryIds] = useState<number[]>([]);
  const [fullyPaidBeneficiaryIds, setFullyPaidBeneficiaryIds] = useState<number[]>([]);
  const [existingRecords, setExistingRecords] = useState<any[]>([]);

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

  const fetchBeneficiaries = async () => {
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

  // Enhanced validation function with detailed beneficiary ID filtering
  const checkExistingFeeRecords = async (villageId: number, month: string, year: string) => {
    if (!userId || !villageId || !month || !year) {
      return false;
    }

    try {
      setValidationLoading(true);
      setValidationMessage("");
      setExistingBeneficiaryIds([]);
      setFullyPaidBeneficiaryIds([]);
      setExistingRecords([]);
      
      // Create the month index (1-based for API)
      const monthIndex = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
      ].indexOf(month) + 1;
      
      // Prepare the POST request payload
      const requestBody = {
        VillageId: villageId,
        Month: monthIndex,
        Year: parseInt(year)
      };

      console.log('Validation request body:', requestBody);

      // Use POST method as per the API documentation
      const response = await fetch(
        'https://wmsapi.kdsgroup.co.in/api/Master/GetFeeCollectionDetails',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'accept': '*/*' 
          },
          body: JSON.stringify(requestBody)
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Validation API Response:', result);
      
      if (result.Status === true) {
        if (result.Data && Array.isArray(result.Data) && result.Data.length > 0) {
          // Store the existing records for reference
          setExistingRecords(result.Data);
          
          // Extract all beneficiary IDs from existing records
          const existingIds = result.Data.map((record: any) => record.BeneficiaryId);
          setExistingBeneficiaryIds(existingIds);
          
          // Extract beneficiary IDs where PaidAmount > 0 (fully paid)
          const fullyPaidIds = result.Data
            .filter((record: any) => record.PaidAmount > 0)
            .map((record: any) => record.BeneficiaryId);
          setFullyPaidBeneficiaryIds(fullyPaidIds);
          
          // Extract beneficiary IDs where PaidAmount = 0 (unpaid but record exists)
          const unpaidButExistingIds = result.Data
            .filter((record: any) => record.PaidAmount === 0)
            .map((record: any) => record.BeneficiaryId);
          
          // Get beneficiaries for current village from the main beneficiaries list
          const villageBeneficiaries = beneficiaries.filter(b => b.VillageId === villageId);
          const villageBeneficiaryIds = villageBeneficiaries.map(b => b.BeneficiaryId);
          
          // Calculate available beneficiaries (not fully paid)
          const availableBeneficiaryIds = villageBeneficiaryIds.filter(id => !fullyPaidIds.includes(id));
          
          // Check if we can proceed
          if (availableBeneficiaryIds.length === 0) {
            setCanProceed(false);
            setValidationMessage("❌ All beneficiaries have already paid for the selected month and village. Cannot proceed.");
            return false;
          } else {
            setCanProceed(true);
            const newBeneficiaries = villageBeneficiaryIds.filter(id => !existingIds.includes(id));
            const unpaidExistingCount = unpaidButExistingIds.length;
            const fullyPaidCount = fullyPaidIds.length;
            
            setValidationMessage(
              `✅ Found ${availableBeneficiaryIds.length} beneficiaries available for fee collection:\n` +
              `• ${newBeneficiaries.length} new beneficiaries\n` +
              `• ${unpaidExistingCount} unpaid existing records\n` +
              `• ${fullyPaidCount} already fully paid (excluded)`
            );
            return true;
          }
        } else {
          // Empty data array means no existing records - can proceed
          setExistingBeneficiaryIds([]);
          setFullyPaidBeneficiaryIds([]);
          setExistingRecords([]);
          setCanProceed(true);
          setValidationMessage("✅ No existing records found for the selected Month & Year. You can proceed with fee collection.");
          return true;
        }
      } else {
        // API returned false status or error
        setCanProceed(false);
        setValidationMessage(`❌ API Error: ${result.Message || 'Unknown error occurred'}`);
        return false;
      }
    } catch (error) {
      console.error('Error checking existing fee records:', error);
      setCanProceed(false);
      setValidationMessage("❌ Unable to validate existing records. Please check your connection and try again.");
      return false;
    } finally {
      setValidationLoading(false);
    }
  };

  // ---------- Effects ----------
  useEffect(() => {
    // Only fetch data when user loading is complete and userId exists
    if (!userLoading && userId) {
      fetchVillages();
      fetchBeneficiaries();
    }
  }, [userId, userLoading]);

  // Effect to trigger validation when all filters are selected
  useEffect(() => {
    if (filters.villageId && filters.month && filters.year && userId) {
      checkExistingFeeRecords(filters.villageId, filters.month, filters.year);
    } else {
      setCanProceed(false);
      setValidationMessage("");
      setExistingBeneficiaryIds([]);
      setFullyPaidBeneficiaryIds([]);
      setExistingRecords([]);
    }
  }, [filters.villageId, filters.month, filters.year, userId, beneficiaries]);

  // Updated effect to filter entries based on payment status
  useEffect(() => {
    if (filters.villageId && beneficiaries.length > 0) {
      // Filter beneficiaries for the selected village
      // Exclude only those who have fully paid (PaidAmount > 0)
      const filteredBeneficiaries = beneficiaries.filter(
        b => b.VillageId === filters.villageId && 
             !fullyPaidBeneficiaryIds.includes(b.BeneficiaryId) // Only exclude fully paid
      );
      
      const feeEntries: FeeEntry[] = filteredBeneficiaries.map((beneficiary, index) => {
        // Check if this beneficiary has an existing record with PaidAmount = 0
        const existingRecord = existingRecords.find(r => r.BeneficiaryId === beneficiary.BeneficiaryId);
        
        return {
          id: beneficiary.BeneficiaryId,
          village: beneficiary.VillageName,
          beneficiary: beneficiary.BeneficiaryName,
          beneficiary_Father: beneficiary.FatherHusbandName,
          amountPaid: existingRecord && existingRecord.PaidAmount === 0 ? 0 : 0, // Start with 0 for editing
          previousbalance: existingRecord ? existingRecord.OutstandingAmount : beneficiary.PreviousBalance,
          baseFee: beneficiary.BaseFee || 0,
          villId: beneficiary.VillageId,
          beneficiaryId: beneficiary.BeneficiaryId,
          feeCollectionId: existingRecord ? existingRecord.FeeCollectionId : beneficiary.FeeCollectionId,
          paymentMode: "Cash",
          receiptNo: existingRecord ? existingRecord.ReceiptNo || "" : ""
        };
      });
      
      setEntries(feeEntries);
    } else {
      setEntries([]);
    }
  }, [filters.villageId, beneficiaries, fullyPaidBeneficiaryIds, existingRecords]);

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
    setExistingBeneficiaryIds([]);
    setFullyPaidBeneficiaryIds([]);
    setExistingRecords([]);
  };

  const handleMonthChange = (month: string) => {
    setFilters(prev => ({ ...prev, month }));
    setEditable(false);
    setSaveMessage("");
    setCanProceed(false);
    setValidationMessage("");
    setExistingBeneficiaryIds([]);
    setFullyPaidBeneficiaryIds([]);
    setExistingRecords([]);
  };

  const handleYearChange = (year: string) => {
    setFilters(prev => ({ ...prev, year }));
    setEditable(false);
    setSaveMessage("");
    setCanProceed(false);
    setValidationMessage("");
    setExistingBeneficiaryIds([]);
    setFullyPaidBeneficiaryIds([]);
    setExistingRecords([]);
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

  const callAPI = async (payload: APIPayload) => {
    try {
      const response = await fetch('https://wmsapi.kdsgroup.co.in/api/User/InsertFeeCollectionWithLogBook', {
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
    if (!filters.village || !filters.month || !filters.year) {
      setError("Please select village, month, and year");
      return;
    }
    
    if (!canProceed) {
      setError("Cannot proceed. Please check validation message above.");
      return;
    }
    
    setEditable(true);
    setSaveMessage("");
    setError("");
  };

  const handleSave = async () => {
    if (!userId) {
      setError("User ID not found");
      return;
    }

    setSaving(true);
    setSaveMessage("");

    try {
      const currentDateTime = getCurrentDateTime();
      const filterDateTime = getFilterDate();

      const savePromises = entries.filter(e => e.amountPaid > 0).map(entry => {
        const payload: APIPayload = {
          FeeCollectionId: entry.feeCollectionId,
          FromDate: filterDateTime,
          ToDate: filterDateTime,
          UploadBy: apiConfig.uploadBy,
          FileName: `${apiConfig.fileName}_${entry.id}`,
          LoogBookRemark: apiConfig.logBookRemark,
          DeviceToken: apiConfig.deviceToken,
          IPAddress: apiConfig.ipAddress,
          FeeCollectionDate: currentDateTime,
          VillId: entry.villId,
          BeneficiaryId: entry.beneficiaryId,
          PreviousBalance: (entry.baseFee + entry.previousbalance) - entry.amountPaid,
          OutstandingAmount: (entry.baseFee + entry.previousbalance) - entry.amountPaid,
          PaidAmount: entry.amountPaid,
          PaymentMode: entry.paymentMode,
          ReceiptNo: entry.receiptNo || `REC-${entry.id}-${Date.now()}`,
          Remark: "",
          CreatedBy: apiConfig.createdBy,
          ImagePath: apiConfig.imagePath
        };
        return callAPI(payload);
      });

      const results = await Promise.all(savePromises);
      const allSuccess = results.every(r => r.Status === true);

      if (allSuccess) {
        setSaveMessage("✅ All entries saved successfully!");
        setEntries(prev => prev.map(entry => ({ ...entry, amountPaid: 0 })));
        await fetchBeneficiaries();
        // Re-run validation to update the display
        if (filters.villageId && filters.month && filters.year) {
          await checkExistingFeeRecords(filters.villageId, filters.month, filters.year);
        }
      } else {
        setSaveMessage("⚠️ Some entries failed to save. Check console for details.");
        console.log("API Results:", results);
      }
    } catch (error) {
      setSaveMessage("❌ Error saving entries. Please try again.");
      console.error(error);
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
          disabled={!filters.village || !filters.month || !filters.year || loading || validationLoading || !canProceed}
          onClick={handleProceed}
          className={`${
            (filters.village && filters.month && filters.year && !loading && !validationLoading && canProceed) 
              ? "bg-blue-600 hover:bg-blue-700" 
              : "bg-gray-400 cursor-not-allowed"
          } text-white px-4 py-2 rounded`}
        >
          {validationLoading ? "Validating..." : "Proceed"}
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
              <th className="px-4 py-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.length > 0 ? entries.map(entry => {
              const isExistingUnpaid = existingBeneficiaryIds.includes(entry.beneficiaryId) && 
                                     !fullyPaidBeneficiaryIds.includes(entry.beneficiaryId);
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
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      isExistingUnpaid 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isExistingUnpaid ? 'Existing (Unpaid)' : 'New Entry'}
                    </span>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={11} className="text-center py-4 text-gray-500">
                  {filters.village 
                    ? (fullyPaidBeneficiaryIds.length > 0 || existingBeneficiaryIds.length > 0)
                      ? `No beneficiaries available for fee collection. ${fullyPaidBeneficiaryIds.length} already fully paid, ${existingBeneficiaryIds.length - fullyPaidBeneficiaryIds.length} unpaid records exist and are displayed above.`
                      : "No beneficiaries found for selected village."
                    : "Please select a village to view beneficiaries."
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