import { useEffect, useRef, useState } from "react";
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

/* --- API response shapes --- */
interface DistrictApi {
  DistrictId: number;
  DistrictName: string;
  DistrictNameHidi?: string;
}

interface BlockApi {
  BlockId: number;
  DistrictId: number;
  BlockName: string;
  BlockNameHindi?: string;
  Code?: string;
}

interface GramPanchayatApi {
  Id: number;
  BlockId: number;
  GramPanchayatName: string;
  GramPanchayatHindi?: string;
  Code?: string;
}

interface VillageApi {
  Id: number;
  VillageName: string;
}

interface BeneficiaryApi {
  BeneficiaryId: number;
  BeneficiaryName: string;
  VillageId: number;
  VillageName: string;
  BaseFee?: number;
  PreviousBalance?: number;
  BalanceAmount?: number;
  OutstandingAmount?: number;
  PaidAmount?: number;
  Date?: string;
  FatherOrHusbandName?: string;
  FatherHusbandName?: string;
  ContactNo?: string;
  Contact?: string;
  FamilyCount?: number;
  familyCount?: number;
  FamilyMembers?: string;
  Status?: string | number;
  status?: string | number;
  AadharNo?: string;
  // New fields from updated API
  DistrictId?: number;
  DistrictName?: string;
  BlockId?: number;
  BlockName?: string;
  GrampanchayatId?: number;
  GrampanchayatName?: string;
}

interface BeneficiaryState {
  BeneficiaryId: number;
  BeneficiaryName: string;
  VillageId: number;
  VillageName: string;
  BaseFee: number;
  PreviousBalance: number;
  BalanceAmount: number;
  OutstandingAmount: number;
  PaidAmount: number;
  Date: string;
  name: string;
  village: string;
  fatherOrHusbandName: string;
  contact: string;
  familyCount: number;
  status: string;
  // Add location fields directly to state
  districtId: number;
  districtName: string;
  blockId: number;
  blockName: string;
  gramPanchayatId: number;
  gramPanchayatName: string;
}

interface LocationMapping {
  villageName: string;
  gramPanchayatId: number;
  gramPanchayatName: string;
  blockId: number;
  blockName: string;
  districtId: number;
  districtName: string;
}

const ManageBeneficiary = () => {
  // Mock user info - replace with actual hook
  const userId = 5; // You can replace this with useUserInfo() hook

  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Location filters
  const [districts, setDistricts] = useState<DistrictApi[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [blocks, setBlocks] = useState<BlockApi[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayatApi[]>([]);
  const [selectedGramPanchayatId, setSelectedGramPanchayatId] = useState<number | null>(null);
  const [villages, setVillages] = useState<VillageApi[]>([]);
  const [selectedVillageId, setSelectedVillageId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState("");

  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryState[]>([]);
  const [locationMap, setLocationMap] = useState<Record<number, LocationMapping>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedBeneficiaries, setEditedBeneficiaries] = useState<Set<number>>(new Set());

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (selectedDistrictId) {
      fetchBlocks(selectedDistrictId);
    } else {
      setBlocks([]);
      setSelectedBlockId(null);
    }
  }, [selectedDistrictId]);

  useEffect(() => {
    if (selectedBlockId) {
      fetchGramPanchayats(selectedBlockId);
    } else {
      setGramPanchayats([]);
      setSelectedGramPanchayatId(null);
    }
  }, [selectedBlockId]);

  useEffect(() => {
    if (selectedBlockId && selectedGramPanchayatId) {
      fetchVillages(selectedBlockId, selectedGramPanchayatId);
    } else {
      setVillages([]);
      setSelectedVillageId(null);
    }
  }, [selectedBlockId, selectedGramPanchayatId]);

  useEffect(() => {
    fetchBeneficiaries();
  }, [selectedVillageId, filterStatus]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (showModal && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowModal(false);
        setCsvFile(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showModal]);

  // Fetch districts
  const fetchDistricts = async () => {
    try {
      const res = await fetch(
        `https://wmsapi.kdsgroup.co.in/api/Master/GetDistrict?UserId=${userId}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Failed to fetch districts");
      const data = await res.json();
      if (data.Status && data.Data) {
        setDistricts(data.Data);
      }
    } catch (err) {
      console.error("Error fetching districts:", err);
      toast.error("Failed to fetch districts");
    }
  };

  // Fetch blocks
  const fetchBlocks = async (districtId: number) => {
    try {
      const res = await fetch(
        "https://wmsapi.kdsgroup.co.in/api/Master/GetBlockListByDistrict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ UserId: userId, DistrictId: districtId }),
        }
      );
      if (!res.ok) throw new Error("Failed to fetch blocks");
      const data = await res.json();
      if (data.Status && data.Data) {
        setBlocks(data.Data);
      } else {
        setBlocks([]);
      }
    } catch (err) {
      console.error("Error fetching blocks:", err);
      toast.error("Failed to fetch blocks");
      setBlocks([]);
    }
  };

  // Fetch gram panchayats
  const fetchGramPanchayats = async (blockId: number) => {
    try {
      const res = await fetch(
        "https://wmsapi.kdsgroup.co.in/api/Master/GetGramPanchayatByBlock",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ UserId: userId, BlockId: blockId }),
        }
      );
      if (!res.ok) throw new Error("Failed to fetch gram panchayats");
      const data = await res.json();
      if (data.Status && data.Data) {
        setGramPanchayats(data.Data);
      } else {
        setGramPanchayats([]);
      }
    } catch (err) {
      console.error("Error fetching gram panchayats:", err);
      toast.error("Failed to fetch gram panchayats");
      setGramPanchayats([]);
    }
  };

  // Fetch villages
  const fetchVillages = async (blockId: number, gramPanchayatId: number) => {
    try {
      const res = await fetch(
        "https://wmsapi.kdsgroup.co.in/api/Master/GetVillegeByGramPanchayat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            BlockId: blockId,
            GramPanchayatId: gramPanchayatId,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to fetch villages");
      const data = await res.json();
      if (data.Status && data.Data) {
        setVillages(data.Data);
        
        // Build location mapping for current villages
        const currentDistrict = districts.find(d => d.DistrictId === selectedDistrictId);
        const currentBlock = blocks.find(b => b.BlockId === selectedBlockId);
        const currentGP = gramPanchayats.find(gp => gp.Id === selectedGramPanchayatId);
        
        if (currentDistrict && currentBlock && currentGP) {
          const newLocationMap: Record<number, LocationMapping> = {};
          data.Data.forEach((village: VillageApi) => {
            newLocationMap[village.Id] = {
              villageName: village.VillageName,
              gramPanchayatId: currentGP.Id,
              gramPanchayatName: currentGP.GramPanchayatName,
              blockId: currentBlock.BlockId,
              blockName: currentBlock.BlockName,
              districtId: currentDistrict.DistrictId,
              districtName: currentDistrict.DistrictName,
            };
          });
          setLocationMap(prev => ({ ...prev, ...newLocationMap }));
        }
      } else {
        setVillages([]);
      }
    } catch (err) {
      console.error("Error fetching villages:", err);
      toast.error("Failed to fetch villages");
      setVillages([]);
    }
  };

  // Fetch beneficiaries
  const fetchBeneficiaries = async () => {
    setLoading(true);
    setError(null);

    try {
      const statusValue = filterStatus === "Active" ? 1 : filterStatus === "Inactive" ? 0 : 0;
      
      const res = await fetch(
        "https://wmsapi.kdsgroup.co.in/api/Master/GetBeneficiaryListByUserIdVillageAndStatus",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            UserId: userId,
            VillageId: selectedVillageId || 0,
            Status: statusValue
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to fetch beneficiaries");
      const data = await res.json();
      const benApiList = data.Data || [];

      const mapped = benApiList.map<BeneficiaryState>((b: BeneficiaryApi) => {
        const father = b.FatherOrHusbandName ?? b.FatherHusbandName ?? "";
        const contact = b.ContactNo ?? b.Contact ?? "";
        const famCount = b.FamilyCount ?? b.familyCount ?? (b.FamilyMembers ? Number(b.FamilyMembers) : 0);
        const stat =
          b.Status === 1 || b.status === 1 || b.Status === "Active" || b.status === "Active"
            ? "Active"
            : "Inactive";

        return {
          BeneficiaryId: b.BeneficiaryId,
          BeneficiaryName: b.BeneficiaryName,
          VillageId: b.VillageId,
          VillageName: b.VillageName,
          BaseFee: b.BaseFee ?? 0,
          PreviousBalance: b.PreviousBalance ?? 0,
          BalanceAmount: b.BalanceAmount ?? 0,
          OutstandingAmount: b.OutstandingAmount ?? 0,
          PaidAmount: b.PaidAmount ?? 0,
          Date: b.Date ?? "",
          name: b.BeneficiaryName,
          village: b.VillageName ?? "",
          fatherOrHusbandName: father,
          contact: contact,
          familyCount: famCount,
          status: stat,
          // Add location data directly from API response
          districtId: b.DistrictId ?? 0,
          districtName: b.DistrictName ?? "",
          blockId: b.BlockId ?? 0,
          blockName: b.BlockName ?? "",
          gramPanchayatId: b.GrampanchayatId ?? 0,
          gramPanchayatName: b.GrampanchayatName ?? "",
        };
      });

      setBeneficiaries(mapped);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("ManageBeneficiary fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      setEditedBeneficiaries(new Set());
    }
    setEditMode((s) => !s);
  };

  const handleChange = (id: number, field: keyof BeneficiaryState, value: string | number) => {
    setBeneficiaries((prev) => prev.map((b) => (b.BeneficiaryId === id ? { ...b, [field]: value } : b)));
    setEditedBeneficiaries(prev => new Set([...prev, id]));
  };

  const handleSaveChanges = async () => {
    if (editedBeneficiaries.size === 0) {
      toast.info("No changes to save");
      return;
    }

    setSaving(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const beneficiaryId of editedBeneficiaries) {
        const beneficiary = beneficiaries.find(b => b.BeneficiaryId === beneficiaryId);
        if (!beneficiary) continue;

        const payload = {
          BeneficiaryId: beneficiary.BeneficiaryId,
          VillageID: beneficiary.VillageId,
          BeneficiaryName: beneficiary.name,
          FatherHusbandName: beneficiary.fatherOrHusbandName,
          Contact: beneficiary.contact,
          FamilyMemberCount: String(beneficiary.familyCount),
          Status: beneficiary.status === "Active" ? 1 : 0,
          UpdatedBy: userId,
          UpdatedDate: new Date().toISOString()
        };

        try {
          const res = await fetch(
            "https://wmsapi.kdsgroup.co.in/api/User/UpdateBeneficiaryDetailsByBeneficiaryId",
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
            console.error(`Failed to update beneficiary ${beneficiaryId}:`, result.Message);
          }
        } catch (err) {
          errorCount++;
          console.error(`Error updating beneficiary ${beneficiaryId}:`, err);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully updated ${successCount} beneficiary records`);
        setEditedBeneficiaries(new Set());
        setEditMode(false);
        fetchBeneficiaries(); // Refresh data
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to update ${errorCount} beneficiary records`);
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
      const exportData = filteredData.map((b) => {
        return {
          'District': b.districtName,
          'Block': b.blockName,
          'Gram Panchayat': b.gramPanchayatName,
          'Village': b.village,
          'Beneficiary Name': b.name,
          'Father/Husband Name': b.fatherOrHusbandName || '-',
          'Contact': b.contact || '-',
          'Family Members': b.familyCount,
          'Status': b.status,
          'Beneficiary ID': b.BeneficiaryId,
          'Base Fee': b.BaseFee,
          'Previous Balance': b.PreviousBalance,
          'Balance Amount': b.BalanceAmount,
          'Outstanding Amount': b.OutstandingAmount,
          'Paid Amount': b.PaidAmount,
          'Date': b.Date
        };
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

      XLSX.utils.book_append_sheet(wb, ws, 'Beneficiaries');

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filename = `beneficiaries_export_${dateStr}.xlsx`;

      XLSX.writeFile(wb, filename);
      toast.success("Excel file downloaded successfully");
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = async () => {
    if (!csvFile) {
      toast.error("Please select a CSV file.");
      return;
    }
    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const res = await fetch("https://wmsapi.kdsgroup.co.in/api/Master/ImportBeneficiaryCSV", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.Status) {
        toast.success("Import successful");
        setShowModal(false);
        setCsvFile(null);
        fetchBeneficiaries();
      } else {
        toast.error("Import error: " + (json.Message ?? "Unknown"));
      }
    } catch (err) {
      console.error("Upload error", err);
      toast.error("Upload failed. Please check console.");
    }
  };

  const clearFilters = () => {
    setSelectedDistrictId(null);
    setSelectedBlockId(null);
    setSelectedGramPanchayatId(null);
    setSelectedVillageId(null);
    setFilterStatus("");
    setSearch("");
  };

  /* --- derived/filter data --- */
  const filteredData = beneficiaries.filter((b) => {
    return (
      b.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterStatus ? b.status === filterStatus : true)
    );
  });

  const getLocation = (beneficiary: BeneficiaryState) => {
    // Use location data directly from the beneficiary object
    return {
      district: beneficiary.districtName || "-",
      block: beneficiary.blockName || "-",
      gp: beneficiary.gramPanchayatName || "-",
    };
  };

  return (
    <div className="p-6 relative z-10 min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Manage Beneficiaries</h1>
        <p className="text-gray-600 mb-6">
          View, edit, and bulk-import beneficiaries. Use filters to narrow down your search.
        </p>

        {loading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-700">Loading beneficiaries...</p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}

        {/* Location Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">District</label>
            <select
              value={selectedDistrictId || ""}
              onChange={(e) => setSelectedDistrictId(Number(e.target.value) || null)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">All Districts</option>
              {districts.map((d) => (
                <option key={d.DistrictId} value={d.DistrictId}>
                  {d.DistrictName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Block</label>
            <select
              value={selectedBlockId || ""}
              onChange={(e) => setSelectedBlockId(Number(e.target.value) || null)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || !selectedDistrictId}
            >
              <option value="">All Blocks</option>
              {blocks.map((b) => (
                <option key={b.BlockId} value={b.BlockId}>
                  {b.BlockName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Gram Panchayat</label>
            <select
              value={selectedGramPanchayatId || ""}
              onChange={(e) => setSelectedGramPanchayatId(Number(e.target.value) || null)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || !selectedBlockId}
            >
              <option value="">All Gram Panchayats</option>
              {gramPanchayats.map((gp) => (
                <option key={gp.Id} value={gp.Id}>
                  {gp.GramPanchayatName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Village</label>
            <select
              value={selectedVillageId || ""}
              onChange={(e) => setSelectedVillageId(Number(e.target.value) || null)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || !selectedGramPanchayatId}
            >
              <option value="">All Villages</option>
              {villages.map((v) => (
                <option key={v.Id} value={v.Id}>
                  {v.VillageName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <input
              type="text"
              className="flex-1 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by beneficiary name..."
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

            <button 
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors" 
              onClick={() => setShowModal(true)} 
              disabled={loading}
            >
              Bulk Import
            </button>

            {!editMode ? (
              <button 
                className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors" 
                onClick={handleEditToggle} 
                disabled={loading || beneficiaries.length === 0}
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
                  disabled={saving || editedBeneficiaries.size === 0}
                >
                  {saving ? 'Saving...' : `Save Changes (${editedBeneficiaries.size})`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>Showing <strong>{filteredData.length}</strong> of <strong>{beneficiaries.length}</strong> beneficiaries</span>
          {editedBeneficiaries.size > 0 && (
            <span className="text-orange-600">
              <strong>{editedBeneficiaries.size}</strong> records modified
            </span>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border border-gray-300 p-3 text-left font-medium">District</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Block</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Gram Panchayat</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Village</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Beneficiary Name</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Father/Husband Name</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Contact</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Family Members</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((b, index) => {
                const isEdited = editedBeneficiaries.has(b.BeneficiaryId);
                
                return (
                  <tr 
                    key={b.BeneficiaryId} 
                    className={`${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-blue-50 transition-colors ${
                      isEdited ? 'ring-2 ring-orange-200 bg-orange-50' : ''
                    }`}
                  >
                    <td className="border border-gray-300 p-3">{b.districtName}</td>
                    <td className="border border-gray-300 p-3">{b.blockName}</td>
                    <td className="border border-gray-300 p-3">{b.gramPanchayatName}</td>
                    <td className="border border-gray-300 p-3">{b.village}</td>

                    <td className="border border-gray-300 p-3">
                      {editMode ? (
                        <input 
                          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                          value={b.name || ""} 
                          onChange={(e) => handleChange(b.BeneficiaryId, "name", e.target.value)}
                        />
                      ) : (
                        b.name
                      )}
                    </td>

                    <td className="border border-gray-300 p-3">
                      {editMode ? (
                        <input 
                          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                          value={b.fatherOrHusbandName} 
                          onChange={(e) => handleChange(b.BeneficiaryId, "fatherOrHusbandName", e.target.value)}
                        />
                      ) : (
                        b.fatherOrHusbandName || "-"
                      )}
                    </td>

                    <td className="border border-gray-300 p-3">
                      {editMode ? (
                        <input 
                          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                          value={b.contact} 
                          onChange={(e) => handleChange(b.BeneficiaryId, "contact", e.target.value)}
                        />
                      ) : (
                        b.contact || "-"
                      )}
                    </td>

                    <td className="border border-gray-300 p-3">
                      {editMode ? (
                        <input 
                          type="number" 
                          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                          value={b.familyCount} 
                          onChange={(e) => handleChange(b.BeneficiaryId, "familyCount", Number(e.target.value))}
                        />
                      ) : (
                        b.familyCount
                      )}
                    </td>

                    <td className="border border-gray-300 p-3">
                      {editMode ? (
                        <select 
                          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                          value={b.status} 
                          onChange={(e) => handleChange(b.BeneficiaryId, "status", e.target.value)}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          b.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {b.status}
                        </span>
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
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium mb-2">No beneficiaries found</h3>
            <p className="text-sm">Try adjusting your filters or search criteria.</p>
          </div>
        )}
      </div>

      {/* Bulk Import Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
          <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button 
              onClick={() => { setShowModal(false); setCsvFile(null); }} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold mb-4 text-gray-800">Bulk Import Beneficiaries</h2>
            <p className="text-sm text-gray-600 mb-4">
              Upload beneficiary records in CSV format. Make sure your file follows the required format.
            </p>

            <div className="mb-4">
              <a 
                href="/sample-beneficiary-format.csv" 
                download 
                className="inline-block text-blue-600 hover:text-blue-800 underline text-sm font-medium"
              >
                📄 Download Sample Format
              </a>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select CSV File</label>
              <input 
                type="file" 
                accept=".csv" 
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)} 
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {csvFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ File selected: {csvFile.name}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setShowModal(false); setCsvFile(null); }} 
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                disabled={!csvFile}
              >
                Upload & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBeneficiary;