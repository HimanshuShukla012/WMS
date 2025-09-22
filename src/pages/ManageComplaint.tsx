import { useState, useEffect, useRef } from "react";
import { useUserInfo } from '../utils/userInfo';
import * as XLSX from 'xlsx';

// Toast notification system (in-memory implementation)
const useToast = () => {
  const [toasts, setToasts] = useState<Array<{id: number, message: string, type: 'success' | 'error' | 'info'}>>([]);
  
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return { toasts, success: (msg: string) => showToast(msg, 'success'), error: (msg: string) => showToast(msg, 'error'), info: (msg: string) => showToast(msg, 'info') };
};

const ToastContainer = ({ toasts }: { toasts: Array<{id: number, message: string, type: string}> }) => (
  <div className="fixed top-4 right-4 z-50 space-y-2">
    {toasts.map(toast => (
      <div key={toast.id} className={`p-3 rounded-lg shadow-lg text-white max-w-sm ${
        toast.type === 'success' ? 'bg-green-500' : 
        toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
      }`}>
        {toast.message}
      </div>
    ))}
  </div>
);

type Complaint = {
  id: number;
  beneficiaryId: number;
  district: string;
  districtId: number;
  block: string;
  blockId: number;
  gramPanchayat: string;
  gramPanchayatId: number;
  village: string;
  villageId: number;
  beneficiaryName: string;
  fatherHusbandName: string;
  beneficiaryContact: string;
  familyMemberCount: string;
  landmark: string;
  category: string;
  categoryId: number;
  otherCategory: string;
  complaintStatus: string; // "Pending", "Resolved", "Closed"
  beneficiaryStatus: number; // 0 = Active, 1 = Inactive
  createdDate: string;
  updatedDate: string;
};

// API response interfaces
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

interface ComplaintData {
  ComplaintID: number;
  District: string;
  DistrictId: number;
  Block: string;
  BlockId: number;
  GramPanchayat: string;
  GramPanchayatId: number;
  Village: string;
  VillageId: number;
  BeneficiaryName: string;
  Contact: string;
  Landmark: string;
  Category: string;
  CategoryId: number;
  OtherCategory: string;
  Status: number; // 0 = Pending, 1 = Resolved, 2 = Closed
  ComplaintDetails: string;
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

const ManageComplaint = () => {
  // Use the same user info hook as AddBeneficiary
  const { userId, role } = useUserInfo();
  
  const toast = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [editedComplaints, setEditedComplaints] = useState<Set<number>>(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  
  // Location hierarchy
  const [districts, setDistricts] = useState<DistrictApi[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [blocks, setBlocks] = useState<BlockApi[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayatApi[]>([]);
  const [selectedGramPanchayatId, setSelectedGramPanchayatId] = useState<number | null>(null);
  const [villages, setVillages] = useState<VillageApi[]>([]);
  const [selectedVillageId, setSelectedVillageId] = useState<number | null>(null);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState("");

  // Auth state for user info (replacing localStorage)
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userBlockId, setUserBlockId] = useState<number | null>(null);
  const [userGramPanchayatId, setUserGramPanchayatId] = useState<number | null>(null);

  // Initialize auth data from localStorage (one-time on mount)
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");
    const blockId = localStorage.getItem("blockId");
    const gramPanchayatId = localStorage.getItem("gramPanchayatId");
    
    setAuthToken(token);
    setUserRole(role);
    setUserBlockId(blockId ? Number(blockId) : null);
    setUserGramPanchayatId(gramPanchayatId ? Number(gramPanchayatId) : null);
  }, []);

  // Initialize data fetching when userId is available
  useEffect(() => {
    if (userId) {
      fetchDistricts();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedDistrictId && userId) {
      fetchBlocks(selectedDistrictId);
    } else {
      setBlocks([]);
      setSelectedBlockId(null);
    }
  }, [selectedDistrictId, userId]);

  useEffect(() => {
    if (selectedBlockId && userId) {
      fetchGramPanchayats(selectedBlockId);
    } else {
      setGramPanchayats([]);
      setSelectedGramPanchayatId(null);
    }
  }, [selectedBlockId, userId]);

  useEffect(() => {
    if (selectedBlockId && selectedGramPanchayatId) {
      fetchVillages(selectedBlockId, selectedGramPanchayatId);
    } else {
      setVillages([]);
      setSelectedVillageId(null);
    }
  }, [selectedBlockId, selectedGramPanchayatId]);

  useEffect(() => {
    if (authToken) {
      fetchComplaints();
    }
  }, [selectedVillageId, filterStatus, authToken]);

  // Handle modal clicks
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (showEditModal && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowEditModal(false);
        setSelectedComplaint(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showEditModal]);

  // Fetch districts (same pattern as AddBeneficiary)
  const fetchDistricts = async () => {
    if (!userId) return;
    
    try {
      const res = await fetch(
        `https://wmsapi.kdsgroup.co.in/api/Master/GetDistrict?UserId=${userId}`,
        { 
          method: "POST",
          headers: { accept: "*/*" }
        }
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

  // Fetch blocks (same pattern as AddBeneficiary)
  const fetchBlocks = async (districtId: number) => {
    if (!userId) return;
    
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

  // Fetch gram panchayats (same pattern as AddBeneficiary)
  const fetchGramPanchayats = async (blockId: number) => {
    if (!userId) return;
    
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

  // Fetch villages (same pattern as AddBeneficiary)
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
      } else {
        setVillages([]);
      }
    } catch (err) {
      console.error("Error fetching villages:", err);
      toast.error("Failed to fetch villages");
      setVillages([]);
    }
  };

  // COMPLETE CORRECTED fetchComplaints FUNCTION
// This replaces the existing fetchComplaints function in your component

const fetchComplaints = async () => {
  // Add more detailed logging
  console.log("fetchComplaints called with:", {
    authToken: !!authToken,
    userId,
    selectedVillageId,
    filterStatus,
    role,
    userBlockId,
    userGramPanchayatId
  });

  if (!authToken) {
    console.error("Missing authentication token");
    toast.error("Missing authentication token");
    return;
  }

  if (!userId) {
    console.error("User ID not found");
    toast.error("User ID not found");
    return;
  }

  setLoading(true);

  try {
    // MODIFIED: Use userId=0 for Admin role, otherwise use actual userId
    const effectiveUserId = role?.toLowerCase() === "admin" ? 0 : userId;
    
    console.log("Using effective userId:", effectiveUserId, "for role:", role);

    const requestBody = {
      UserId: effectiveUserId,
      VillageId: selectedVillageId || 0,
      Status: filterStatus === "Pending" ? 0 : 
             filterStatus === "Resolved" ? 1 : 
             filterStatus === "Closed" ? 2 : 0
    };

    console.log("API Request:", requestBody);

    const response = await fetch(
      "https://wmsapi.kdsgroup.co.in/api/Complain/GetComplaintListByUserIdVillageAndStatus",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log("API Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }

    const apiData = await response.json();
    console.log("API Response Data:", apiData);

    if (!apiData.Status) {
      console.error("API returned error:", apiData.Message || apiData.Errror);
      toast.error(apiData.Message || apiData.Errror || "Failed to fetch complaints");
      return;
    }

    // Map only the fields that actually exist in the API response
    let mappedData = (apiData?.Data || []).map((item) => ({
      id: item.ComplaintID || 0,
      beneficiaryId: 0, // Not provided in API response
      district: item.District || "",
      districtId: item.DistrictId || 0,
      block: item.Block || "",
      blockId: item.BlockId || 0,
      gramPanchayat: item.GramPanchayat || "",
      gramPanchayatId: item.GramPanchayatId || 0,
      village: item.Village || "",
      villageId: item.VillageId || 0,
      beneficiaryName: item.BeneficiaryName || "",
      fatherHusbandName: "", // Not provided in API response
      beneficiaryContact: item.Contact || "",
      familyMemberCount: "", // Not provided in API response
      landmark: item.Landmark || "",
      category: item.Category || "",
      categoryId: item.CategoryId || 0,
      otherCategory: item.OtherCategory || "",
      complaintStatus: item.Status === 0 ? "Pending" : 
                      item.Status === 1 ? "Resolved" : "Closed",
      beneficiaryStatus: 0, // Not provided in API response, defaulting to Active
      createdDate: "", // Not provided in API response
      updatedDate: "", // Not provided in API response
      complaintDetails: item.ComplaintDetails || "" // Adding this field from API
    }));

    console.log("Mapped Data:", mappedData);

    // MODIFIED: Skip role-based filtering for Admin role
    if (role?.toLowerCase() !== "admin") {
      if (role?.toLowerCase() === "block officer" && userBlockId !== null) {
        const beforeFilter = mappedData.length;
        mappedData = mappedData.filter((c) => c.blockId === userBlockId);
        console.log(`Block Officer filter: ${beforeFilter} -> ${mappedData.length} complaints`);
      } else if (role?.toLowerCase() === "gram panchayat" && userGramPanchayatId !== null) {
        const beforeFilter = mappedData.length;
        mappedData = mappedData.filter((c) => c.gramPanchayatId === userGramPanchayatId);
        console.log(`Gram Panchayat filter: ${beforeFilter} -> ${mappedData.length} complaints`);
      }
    } else {
      console.log("Admin role detected - showing all complaint data without filtering");
    }

    console.log("Final filtered data:", mappedData);
    
    setComplaints(mappedData);
    
    if (mappedData.length > 0) {
      const roleText = role?.toLowerCase() === "admin" ? " (Admin - All Data)" : "";
      toast.success(`Loaded ${mappedData.length} complaint records${roleText}`);
    } else {
      toast.info("No complaint records found for the selected criteria");
    }
    
  } catch (error) {
    console.error("Failed to fetch complaints:", error);
    toast.error(`Failed to fetch complaints: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

// ADDITIONAL FIXES FOR OTHER useEffect HOOKS:

// 1. Fix the useEffect for auth token initialization
useEffect(() => {
  // Direct access instead of storing in separate state
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("role");
  const blockId = localStorage.getItem("blockId");
  const gramPanchayatId = localStorage.getItem("gramPanchayatId");
  
  console.log("Auth data from localStorage:", {
    token: !!token,
    role,
    blockId,
    gramPanchayatId
  });
  
  if (token) {
    setAuthToken(token);
    setUserRole(role);
    setUserBlockId(blockId ? Number(blockId) : null);
    setUserGramPanchayatId(gramPanchayatId ? Number(gramPanchayatId) : null);
  } else {
    console.warn("No auth token found in localStorage");
    toast.error("Authentication required. Please login again.");
  }
}, []);

// 2. Fix the complaints fetch trigger
useEffect(() => {
  if (authToken && userId) {
    console.log("Triggering fetchComplaints due to:", {
      selectedVillageId, 
      filterStatus, 
      authToken: !!authToken, 
      userId
    });
    fetchComplaints();
  }
}, [selectedVillageId, filterStatus, authToken, userId]); // Added userId dependency

// 3. Add debugging for the useUserInfo hook
useEffect(() => {
  console.log("User info from hook:", { userId, role });
}, [userId, role]);

// DEBUGGING CHECKLIST:
// 1. Open browser DevTools > Console
// 2. Look for the console.log outputs
// 3. Check Network tab for the API call
// 4. Verify localStorage has authToken, role, blockId, gramPanchayatId
// 5. Check if API returns 200 status and data

  const handleEditComplaint = (complaint: Complaint) => {
    setSelectedComplaint({ ...complaint });
    setShowEditModal(true);
  };

  const handleSaveComplaintChanges = async () => {
    if (!selectedComplaint || !userId) return;
    
    if (!authToken) {
      toast.error("Authentication required");
      return;
    }

    setSaving(true);
    
    try {
      // Updated payload structure for the correct API
      const payload = {
        ComplaintId: selectedComplaint.id,
        VillageId: selectedComplaint.villageId,
        BeneficiaryName: selectedComplaint.beneficiaryName,
        Contact: selectedComplaint.beneficiaryContact,
        Landmark: selectedComplaint.landmark,
        CategoryId: selectedComplaint.categoryId,
        Status: selectedComplaint.complaintStatus === "Resolved", // Convert status to boolean
        OtherCategory: selectedComplaint.otherCategory
      };

      const response = await fetch(
        "https://wmsapi.kdsgroup.co.in/api/User/UpdateComplaintDetailsByComplaintId",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      
      if (result.Status) {
        toast.success("Complaint status updated successfully");
        setShowEditModal(false);
        setSelectedComplaint(null);
        fetchComplaints(); // Refresh the data
      } else {
        toast.error(result.Message || result.Errror || "Failed to update complaint details");
      }
    } catch (error) {
      console.error("Error updating complaint:", error);
      toast.error("Failed to update complaint details");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    setDownloading(true);
    
    try {
      const exportData = filteredData.map((c) => ({
        'Complaint ID': c.id,
        'District': c.district,
        'Block': c.block,
        'Gram Panchayat': c.gramPanchayat,
        'Village': c.village,
        'Beneficiary Name': c.beneficiaryName,
        'Father/Husband Name': c.fatherHusbandName,
        'Contact': c.beneficiaryContact,
        'Family Members': c.familyMemberCount,
        'Landmark': c.landmark,
        'Category': c.category,
        'Complaint Status': c.complaintStatus,
        'Beneficiary Status': c.beneficiaryStatus === 0 ? 'Active' : 'Inactive',
        'Created Date': c.createdDate,
        'Updated Date': c.updatedDate,
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(
          key.length,
          ...exportData.map(row => String(row[key as keyof typeof row]).length)
        )
      }));
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Complaint_Records');

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filename = `complaint_records_export_${dateStr}.xlsx`;

      XLSX.writeFile(wb, filename);
      toast.success("Excel file downloaded successfully");
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setDownloading(false);
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

  const filteredData = complaints.filter((c) => {
    const matchesSearch = 
      c.beneficiaryName.toLowerCase().includes(search.toLowerCase()) ||
      c.beneficiaryContact.toLowerCase().includes(search.toLowerCase()) ||
      c.district.toLowerCase().includes(search.toLowerCase()) ||
      c.block.toLowerCase().includes(search.toLowerCase()) ||
      c.gramPanchayat.toLowerCase().includes(search.toLowerCase()) ||
      c.village.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    
    return matchesSearch;
  });

  const getSelectedLocationName = () => {
    if (selectedVillageId) {
      const village = villages.find(v => v.Id === selectedVillageId);
      return village?.VillageName || `Village ID: ${selectedVillageId}`;
    }
    if (selectedGramPanchayatId) {
      const gp = gramPanchayats.find(gp => gp.Id === selectedGramPanchayatId);
      return gp?.GramPanchayatName || "Selected Gram Panchayat";
    }
    if (selectedBlockId) {
      const block = blocks.find(b => b.BlockId === selectedBlockId);
      return block?.BlockName || "Selected Block";
    }
    if (selectedDistrictId) {
      const district = districts.find(d => d.DistrictId === selectedDistrictId);
      return district?.DistrictName || "Selected District";
    }
    return "All Areas";
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "Pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "Resolved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Closed":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-800`;
    }
  };

  return (
    <div className="p-6 relative z-10 min-h-screen bg-gray-50">
      <ToastContainer toasts={toast.toasts} />
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Manage Complaints</h1>
        <p className="text-gray-600 mb-6">
          View and update complaint status. Use location filters to narrow down your search.
        </p>

        {loading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-700">Loading complaint records...</p>
          </div>
        )}

        {/* Location Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            <label className="block text-sm font-medium mb-1">Select Block</label>
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
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <input
              type="text"
              className="flex-1 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by name, contact, location, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading}
            />
            
            <select
              className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              disabled={loading}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

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
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>Location: <strong>{getSelectedLocationName()}</strong></span>
          <span>Showing <strong>{filteredData.length}</strong> of <strong>{complaints.length}</strong> complaint records</span>
          {filterStatus && <span>Status: <strong>{filterStatus}</strong></span>}
        </div>
      </div>

      {/* Quick Stats Cards */}
      {complaints.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Complaints</p>
                <p className="text-xl font-bold text-gray-800">{complaints.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-bold text-yellow-600">
                  {complaints.filter(c => c.complaintStatus === "Pending").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-xl font-bold text-green-600">
                  {complaints.filter(c => c.complaintStatus === "Resolved").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-lg">
                <span className="text-2xl">🔒</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Closed</p>
                <p className="text-xl font-bold text-gray-600">
                  {complaints.filter(c => c.complaintStatus === "Closed").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border border-gray-300 p-3 text-left font-medium">Complaint ID</th>
                <th className="border border-gray-300 p-3 text-left font-medium">District</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Block Name</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Gram Panchayat</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Village</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Beneficiary Name</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Contact</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Category</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Status</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((c, index) => (
                <tr 
                  key={c.id} 
                  className={`${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-blue-50 transition-colors`}
                >
                  <td className="border border-gray-300 p-3 font-medium text-blue-600">
                    #{c.id}
                  </td>
                  <td className="border border-gray-300 p-3">{c.district}</td>
                  <td className="border border-gray-300 p-3">{c.block}</td>
                  <td className="border border-gray-300 p-3">{c.gramPanchayat}</td>
                  <td className="border border-gray-300 p-3">{c.village}</td>
                  <td className="border border-gray-300 p-3">
                    <div>
                      <div className="font-medium">{c.beneficiaryName}</div>
                      {c.fatherHusbandName && (
                        <div className="text-xs text-gray-500">S/O: {c.fatherHusbandName}</div>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-300 p-3">
                    <div>
                      <div className="font-medium">{c.beneficiaryContact}</div>
                      {c.familyMemberCount && (
                        <div className="text-xs text-gray-500">Family: {c.familyMemberCount}</div>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-300 p-3">
                    <div>
                      <div className="font-medium">{c.category}</div>
                      {c.landmark && (
                        <div className="text-xs text-gray-500">📍 {c.landmark}</div>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-300 p-3">
                    <div className="space-y-1">
                      <span className={getStatusBadge(c.complaintStatus)}>
                        {c.complaintStatus}
                      </span>
                      <div className="text-xs text-gray-500">
                        Beneficiary: {c.beneficiaryStatus === 0 ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </td>
                  <td className="border border-gray-300 p-3">
                    <button
                      onClick={() => handleEditComplaint(c)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs"
                      disabled={loading}
                    >
                      Edit Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium mb-2">No complaint records found</h3>
            <p className="text-sm">
              {complaints.length === 0 
                ? "No complaints found for the selected criteria." 
                : "No complaints match your search criteria. Try adjusting your filters."}
            </p>
          </div>
        )}
      </div>

      {/* Edit Complaint Status Modal */}
      {showEditModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
          <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => {
                setShowEditModal(false);
                setSelectedComplaint(null);
              }} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              disabled={saving}
            >
              &times;
            </button>

            <h2 className="text-xl font-bold mb-4 text-gray-800">Update Complaint Status</h2>
            <p className="text-sm text-gray-600 mb-6">
              Update the status for Complaint #{selectedComplaint.id}
            </p>

            <div className="space-y-4 mb-6">
              {/* Complaint Information (Read-only) */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-3 text-gray-700">Complaint Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Complaint ID:</strong> #{selectedComplaint.id}</div>
                  <div><strong>Category:</strong> {selectedComplaint.category}</div>
                  <div><strong>Beneficiary:</strong> {selectedComplaint.beneficiaryName}</div>
                  <div><strong>Contact:</strong> {selectedComplaint.beneficiaryContact}</div>
                  <div><strong>Location:</strong> {selectedComplaint.village}, {selectedComplaint.gramPanchayat}</div>
                  <div><strong>Landmark:</strong> {selectedComplaint.landmark || 'Not specified'}</div>
                </div>
              </div>

              {/* Status Update - The only editable field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Complaint Status <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedComplaint.complaintStatus}
                  onChange={(e) => setSelectedComplaint(prev => prev ? {...prev, complaintStatus: e.target.value} : null)}
                  disabled={saving}
                >
                  <option value="Pending">Pending</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Note: Only complaint status can be updated through this interface
                </p>
              </div>

              {/* Current Status Display */}
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2">Current Status</h4>
                <div className="flex items-center gap-2">
                  <span className={getStatusBadge(selectedComplaint.complaintStatus)}>
                    {selectedComplaint.complaintStatus}
                  </span>
                  <span className="text-sm text-blue-600">
                    → Will be updated when you save changes
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedComplaint(null);
                }} 
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveComplaintChanges}
                className={`px-4 py-2 rounded-md text-white transition-colors ${
                  saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={saving}
              >
                {saving ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {complaints.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium mb-2 text-gray-800">No Complaints Found</h3>
          <p className="text-gray-600 mb-4">
            {selectedVillageId || selectedGramPanchayatId || selectedBlockId || selectedDistrictId
              ? "No complaints found for the selected location and filters."
              : "Use the location filters above to load complaint data for a specific area."}
          </p>
          {(selectedVillageId || selectedGramPanchayatId || selectedBlockId || selectedDistrictId) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Clear Filters & Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageComplaint;