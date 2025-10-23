import { useEffect, useRef, useState } from "react";
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { useUserInfo } from "../utils/userInfo";

/* --- API response shapes --- */
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

const ManageBeneficiary = () => {
  const { userId, role, isLoading: userLoading } = useUserInfo();

  const [editMode, setEditMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Client-side filters - no longer tied to API calls
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedBlock, setSelectedBlock] = useState<string>("");
  const [selectedGramPanchayat, setSelectedGramPanchayat] = useState<string>("");
  const [selectedVillage, setSelectedVillage] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState("");

  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedBeneficiaries, setEditedBeneficiaries] = useState<Set<number>>(new Set());
  const [selectedForDeletion, setSelectedForDeletion] = useState<Set<number>>(new Set());

  const modalRef = useRef<HTMLDivElement>(null);

  // Initialize data fetching - only when userId is available
  useEffect(() => {
    if (!userLoading && userId) {
      fetchBeneficiaries();
    }
  }, [userId, userLoading]);

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

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDistrict, selectedBlock, selectedGramPanchayat, selectedVillage, filterStatus]);

  // Fetch ALL beneficiaries at once
  const fetchBeneficiaries = async () => {
    if (!userId) {
      console.error("Cannot fetch beneficiaries: userId is null");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Force userId = 0 for Admin role to get all beneficiaries
      const effectiveUserId = userId;
      console.log("Fetching all beneficiaries with userId:", effectiveUserId, "role:", role);

      const res = await fetch(
        "https://wmsapi.kdsgroup.co.in/api/Master/GetBeneficiaryListByUserIdVillageAndStatus",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: effectiveUserId,
            VillageId: 0, // Get all villages
            Status: 0, // Get all statuses (both active and inactive)
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

  // Get unique values for filter dropdowns from the fetched data
  const getUniqueDistricts = () => {
    const districts = beneficiaries
      .filter(b => b.districtName)
      .map(b => b.districtName)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return districts;
  };

  const getUniqueBlocks = () => {
    const blocks = beneficiaries
      .filter(b => b.blockName && (!selectedDistrict || b.districtName === selectedDistrict))
      .map(b => b.blockName)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return blocks;
  };

  const getUniqueGramPanchayats = () => {
    const gramPanchayats = beneficiaries
      .filter(b => b.gramPanchayatName && 
        (!selectedDistrict || b.districtName === selectedDistrict) &&
        (!selectedBlock || b.blockName === selectedBlock))
      .map(b => b.gramPanchayatName)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return gramPanchayats;
  };

  const getUniqueVillages = () => {
    const villages = beneficiaries
      .filter(b => b.village && 
        (!selectedDistrict || b.districtName === selectedDistrict) &&
        (!selectedBlock || b.blockName === selectedBlock) &&
        (!selectedGramPanchayat || b.gramPanchayatName === selectedGramPanchayat))
      .map(b => b.village)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return villages;
  };

  const handleEditToggle = () => {
    if (role !== "Dpro") {
      toast.error("Edit functionality is only available for Dpro role");
      return;
    }
    
    if (editMode) {
      setEditedBeneficiaries(new Set());
    }
    if (deleteMode) {
      setDeleteMode(false);
      setSelectedForDeletion(new Set());
    }
    setEditMode((s) => !s);
  };

  const handleDeleteToggle = () => {
    if (role !== "DPRO") {
      toast.error("Delete functionality is only available for Dpro role");
      return;
    }
    
    if (deleteMode) {
      setSelectedForDeletion(new Set());
    }
    if (editMode) {
      setEditMode(false);
      setEditedBeneficiaries(new Set());
    }
    setDeleteMode((s) => !s);
  };

  const handleChange = (id: number, field: keyof BeneficiaryState, value: string | number) => {
    setBeneficiaries((prev) => prev.map((b) => (b.BeneficiaryId === id ? { ...b, [field]: value } : b)));
    setEditedBeneficiaries(prev => new Set([...prev, id]));
  };

  const handleDeleteSelection = (id: number) => {
    setSelectedForDeletion(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAllForDeletion = () => {
    if (selectedForDeletion.size === paginatedData.length) {
      setSelectedForDeletion(new Set());
    } else {
      setSelectedForDeletion(new Set(paginatedData.map(b => b.BeneficiaryId)));
    }
  };

  const handleSaveChanges = async () => {
    if (editedBeneficiaries.size === 0) {
      toast.info("No changes to save");
      return;
    }

    if (!userId) {
      toast.error("User information not available");
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

  const handleDeleteSelected = async () => {
    if (selectedForDeletion.size === 0) {
      toast.info("No beneficiaries selected for deletion");
      return;
    }

    if (!userId) {
      toast.error("User information not available");
      return;
    }

    setDeleting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const beneficiaryId of selectedForDeletion) {
        const payload = {
          UserId: userId,
          BeneficiaryId: beneficiaryId
        };

        try {
          const res = await fetch(
            "https://wmsapi.kdsgroup.co.in/api/User/DeleteBeneficiaryDpro",
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
            console.error(`Failed to delete beneficiary ${beneficiaryId}:`, result.Message);
          }
        } catch (err) {
          errorCount++;
          console.error(`Error deleting beneficiary ${beneficiaryId}:`, err);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} beneficiary records`);
        setSelectedForDeletion(new Set());
        setDeleteMode(false);
        setShowDeleteConfirmModal(false);
        fetchBeneficiaries(); // Refresh data
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to delete ${errorCount} beneficiary records`);
      }

    } catch (err) {
      console.error("Delete operation error:", err);
      toast.error("Failed to delete beneficiaries");
    } finally {
      setDeleting(false);
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

  if (!userId) {
    toast.error("User information not available");
    return;
  }

  const formData = new FormData();
  formData.append("file", csvFile);

  setUploading(true);

try {
  console.log("Uploading CSV with userId:", userId);
  console.log("File details:", {
    name: csvFile.name,
    size: csvFile.size,
    type: csvFile.type
  });

  const res = await fetch(
    `https://wmsapi.kdsgroup.co.in/api/Master/ImportBeneficiaryCSV?userId=${userId}`,
    {
      method: "POST",
      body: formData,
    }
  );

  console.log("Response status:", res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Server error response:", errorText);
    toast.error(`Server error: ${res.status} - ${errorText}`);
    return;
  }

  const json = await res.json();
  console.log("API Response:", json);

  if (json.Status) {
    toast.success("Import successful");
    setShowModal(false);
    setCsvFile(null);
    fetchBeneficiaries(); // Refresh all data
  } else {
    const errorMsg = json.Message || json.Errror || json.Error || "Unknown error";
    console.error("Import failed:", errorMsg);
    toast.error("Import error: " + errorMsg);
  }
} catch (err) {
  console.error("Upload error:", err);
  toast.error("Upload failed: " + (err instanceof Error ? err.message : "Unknown error"));
} finally {
  setUploading(false);
}
};

  const clearFilters = () => {
    setSelectedDistrict("");
    setSelectedBlock("");
    setSelectedGramPanchayat("");
    setSelectedVillage("");
    setFilterStatus("");
    setSearch("");
  };

  const getSelectedLocationName = () => {
    if (selectedVillage) return selectedVillage;
    if (selectedGramPanchayat) return selectedGramPanchayat;
    if (selectedBlock) return selectedBlock;
    if (selectedDistrict) return selectedDistrict;
    return "All Areas";
  };

  // Client-side filtering of all beneficiaries
  const filteredData = beneficiaries.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase());
    const matchesDistrict = !selectedDistrict || b.districtName === selectedDistrict;
    const matchesBlock = !selectedBlock || b.blockName === selectedBlock;
    const matchesGramPanchayat = !selectedGramPanchayat || b.gramPanchayatName === selectedGramPanchayat;
    const matchesVillage = !selectedVillage || b.village === selectedVillage;
    const matchesStatus = !filterStatus || b.status === filterStatus;

    return matchesSearch && matchesDistrict && matchesBlock && matchesGramPanchayat && matchesVillage && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Pagination controls
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getVisiblePageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // Show loading state while user info is being fetched
  if (userLoading) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  // Show error if user info couldn't be loaded
  if (!userLoading && !userId) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the beneficiary management system.</p>
        </div>
      </div>
    );
  }

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

        {/* Location Filters - Now client-side only */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                // Reset dependent filters when district changes
                if (e.target.value !== selectedDistrict) {
                  setSelectedBlock("");
                  setSelectedGramPanchayat("");
                  setSelectedVillage("");
                }
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">All Districts</option>
              {getUniqueDistricts().map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Select Block</label>
            <select
              value={selectedBlock}
              onChange={(e) => {
                setSelectedBlock(e.target.value);
                // Reset dependent filters when block changes
                if (e.target.value !== selectedBlock) {
                  setSelectedGramPanchayat("");
                  setSelectedVillage("");
                }
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">All Block</option>
              {getUniqueBlocks().map((block) => (
                <option key={block} value={block}>
                  {block}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Gram Panchayat</label>
            <select
              value={selectedGramPanchayat}
              onChange={(e) => {
                setSelectedGramPanchayat(e.target.value);
                // Reset village filter when gram panchayat changes
                if (e.target.value !== selectedGramPanchayat) {
                  setSelectedVillage("");
                }
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">All Gram Panchayats</option>
              {getUniqueGramPanchayats().map((gp) => (
                <option key={gp} value={gp}>
                  {gp}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Village</label>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">All Villages</option>
              {getUniqueVillages().map((village) => (
                <option key={village} value={village}>
                  {village}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">FHTC Status</label>
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
    disabled={loading || !userId}
  >
    Bulk Import
  </button>

  {/* Show initial buttons when not in any mode */}
  {!editMode && !deleteMode && role === "DPRO" && (
    <>
      <button 
        className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors" 
        onClick={handleEditToggle} 
        disabled={loading || beneficiaries.length === 0}
      >
        Edit Records
      </button>
      <button 
        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors" 
        onClick={handleDeleteToggle} 
        disabled={loading || beneficiaries.length === 0}
      >
        Delete Records
      </button>
    </>
  )}

  {/* Show edit mode buttons */}
  {editMode && (
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

  {/* Show delete mode buttons */}
  {deleteMode && (
    <div className="flex gap-2">
      <button 
        className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors" 
        onClick={handleDeleteToggle}
        disabled={deleting}
      >
        Cancel
      </button>
      <button
        className={`px-4 py-2 rounded-md text-white transition-colors ${
          deleting ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
        }`}
        onClick={() => setShowDeleteConfirmModal(true)}
        disabled={deleting || selectedForDeletion.size === 0}
      >
        {deleting ? 'Deleting...' : `Delete Selected (${selectedForDeletion.size})`}
      </button>
    </div>
  )}
</div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>Location: <strong>{getSelectedLocationName()}</strong></span>
          <span>Showing <strong>{startIndex + 1}-{Math.min(endIndex, filteredData.length)}</strong> of <strong>{filteredData.length}</strong> beneficiaries</span>
          <span>Total records: <strong>{beneficiaries.length}</strong></span>
          {editedBeneficiaries.size > 0 && (
            <span className="text-orange-600">
              <strong>{editedBeneficiaries.size}</strong> records modified
            </span>
          )}
          {selectedForDeletion.size > 0 && (
            <span className="text-red-600">
              <strong>{selectedForDeletion.size}</strong> records selected for deletion
            </span>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        
        {/* Quick Stats Cards */}
        {beneficiaries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 px-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Beneficiaries</p>
                  <p className="text-xl font-bold text-gray-800">{filteredData.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-xl font-bold text-green-600">
                    {filteredData.filter(b => b.status === 'Active').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <span className="text-2xl">❌</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Inactive</p>
                  <p className="text-xl font-bold text-red-600">
                    {filteredData.filter(b => b.status === 'Inactive').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <span className="text-2xl">👨‍👩‍👧‍👦</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Family Members</p>
                  <p className="text-xl font-bold text-purple-600">
                    {filteredData.reduce((sum, b) => sum + b.familyCount, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagination Controls - Top */}
        {filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-b border-gray-200 gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Rows per page:
              </label>
              <select
                value={rowsPerPage}
                onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
              </select>
              
              {deleteMode && (
                <button
                  onClick={handleSelectAllForDeletion}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  {selectedForDeletion.size === paginatedData.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {getVisiblePageNumbers().map((page, index) => (
                  <span key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-1 text-sm text-gray-500">...</span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(page as number)}
                        className={`px-3 py-1 border rounded-md text-sm ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-600 text-white">
                {deleteMode && (
                  <th className="border border-gray-300 p-3 text-left font-medium">
                    <input
                      type="checkbox"
                      checked={selectedForDeletion.size === paginatedData.length && paginatedData.length > 0}
                      onChange={handleSelectAllForDeletion}
                      className="rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </th>
                )}
                <th className="border border-gray-300 p-3 text-center font-medium">S.No.</th>
                <th className="border border-gray-300 p-3 text-left font-medium">District</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Block Name</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Gram Panchayat</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Village</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Beneficiary Name</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Father/Husband Name</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Contact</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Family Members</th>
                <th className="border border-gray-300 p-3 text-left font-medium">FHTC Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((b, index) => {
                const isEdited = editedBeneficiaries.has(b.BeneficiaryId);
                const isSelectedForDeletion = selectedForDeletion.has(b.BeneficiaryId);
                
                return (
                  <tr 
                    key={b.BeneficiaryId} 
                    className={`${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-blue-50 transition-colors ${
                      isEdited ? 'ring-2 ring-orange-200 bg-orange-50' : ''
                    } ${
                      isSelectedForDeletion ? 'ring-2 ring-red-200 bg-red-50' : ''
                    }`}
                  >
                    {deleteMode && (
                      <td className="border border-gray-300 p-3">
                        <input
                          type="checkbox"
                          checked={isSelectedForDeletion}
                          onChange={() => handleDeleteSelection(b.BeneficiaryId)}
                          className="rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    <td className="border border-gray-300 p-3 text-center">{startIndex + index + 1}</td>
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

        {/* Pagination Controls - Bottom */}
        {filteredData.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-200 gap-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>

              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {getVisiblePageNumbers().map((page, index) => (
                  <span key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-1 text-sm text-gray-500">...</span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(page as number)}
                        className={`px-3 py-1 border rounded-md text-sm ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>

              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        )}

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
                href="/beneficiaries (1).csv" 
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
  onClick={handleUpload} 
  className={`px-4 py-2 rounded-md text-white transition-colors ${
    uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
  }`}
  disabled={!csvFile || uploading}
>
  {uploading ? 'Uploading...' : 'Upload & Import'}
</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="text-center">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Deletion</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{selectedForDeletion.size}</strong> beneficiary record(s)? 
                This action performs a soft delete and can be reversed by system administrators.
              </p>

              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md transition-colors"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteSelected}
                  className={`px-4 py-2 rounded-md text-white transition-colors ${
                    deleting ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
                  }`}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBeneficiary;