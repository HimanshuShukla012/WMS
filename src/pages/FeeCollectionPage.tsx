import React, { useState, useEffect } from "react";
import { useUserInfo } from '../utils/userInfo';

// ---------- Types ----------
type Village = {
  VillageId: number;
  VillageName: string;
};

type BeneficiaryData = {
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
  paymentMode: string;
  receiptNo: string;
};

type APIPayload = {
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
  const { userId } = useUserInfo();

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

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({ fromDate: "", toDate: "", pdfFile: null as File | null, remark: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const [apiConfig] = useState({
    uploadBy: userId ? parseInt(userId) : 0,
    createdBy: userId ? parseInt(userId) : 0,
    fileName: "fee_collection_data",
    logBookRemark: "Fee collection entry",
    deviceToken: "device_token_123",
    ipAddress: "192.168.1.1",
    imagePath: ""
  });

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

  // ---------- Effects ----------
  useEffect(() => {
    if (userId) {
      fetchVillages();
      fetchBeneficiaries();
    } else {
      setError("User ID not found");
    }
  }, [userId]);

  useEffect(() => {
    if (filters.villageId && beneficiaries.length > 0) {
      const filteredBeneficiaries = beneficiaries.filter(
        b => b.VillageId === filters.villageId
      );
      
      const feeEntries: FeeEntry[] = filteredBeneficiaries.map((beneficiary, index) => ({
        id: beneficiary.BeneficiaryId,
        village: beneficiary.VillageName,
        beneficiary: beneficiary.BeneficiaryName,
        beneficiary_Father: beneficiary.FatherHusbandName,
        amountPaid: 0,
        previousbalance: beneficiary.PreviousBalance,
        baseFee: beneficiary.BaseFee || 0, // Use API data or fallback to 100
        villId: beneficiary.VillageId,
        beneficiaryId: beneficiary.BeneficiaryId,
        paymentMode: "Cash",
        receiptNo: ""
      }));
      
      setEntries(feeEntries);
    } else {
      setEntries([]);
    }
  }, [filters.villageId, beneficiaries]);

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
          PreviousBalance: entry.previousbalance,
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
        // Reset amount paid to 0 after successful save
        setEntries(prev => prev.map(entry => ({ ...entry, amountPaid: 0 })));
        // Refresh beneficiary data to get updated balances
        await fetchBeneficiaries();
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
  if (!userId) {
    return (
      <div className="p-6 relative z-10">
        <div className="bg-red-100 text-red-700 p-3 rounded">
          User ID not found. Please login again.
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
          onChange={e => setFilters(prev => ({ ...prev, month: e.target.value }))}
        >
          <option value="">Select Month</option>
          {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => 
            <option key={m} value={m}>{m}</option>
          )}
        </select>

        <select 
          className="p-2 border rounded w-24" 
          value={filters.year} 
          onChange={e => setFilters(prev => ({ ...prev, year: e.target.value }))}
        >
          <option value="">Select Year</option>
          {[2023,2024,2025,2026].map(y => 
            <option key={y} value={y.toString()}>{y}</option>
          )}
        </select>

        <button
          type="button"
          disabled={!filters.village || !filters.month || !filters.year || loading}
          onClick={handleProceed}
          className={`${(filters.village && filters.month && filters.year && !loading) ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"} text-white px-4 py-2 rounded`}
        >
          Proceed
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
            </tr>
          </thead>
          <tbody>
            {entries.length > 0 ? entries.map(entry => (
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
              </tr>
            )) : (
              <tr>
                <td colSpan={10} className="text-center py-4 text-gray-500">
                  {filters.village ? "No beneficiaries found for selected village." : "Please select a village to view beneficiaries."}
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