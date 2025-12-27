// src/components/LodgeComplaint.tsx
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { useUserInfo } from '../utils/userInfo';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

type LodgeComplaintProps = {
  isModal?: boolean;
  onClose?: () => void;
};

const COMPLAINT_CATEGORIES: { label: string; days: number }[] = [
  { label: "Area Drinking Water Scarcity", days: 5 },
  { label: "Area Water Contamination", days: 3 },
  { label: "Cleaning Of Overhead Tank", days: 2 },
  { label: "Contamination Of Water", days: 3 },
  { label: "Defective Water Meter", days: 7 },
  { label: "Drinking Water Scarcity", days: 5 },
  { label: "Inlet Pipe Leakage Coming From Outside The House", days: 4 },
  { label: "Masonry Work Outside The House", days: 8 },
  { label: "No Water", days: 2 },
  { label: "Overflow From OverHead Tank", days: 3 },
  { label: "Pipe Leakage/Brust Outside The House", days: 4 },
  { label: "Public Hydrant Platform Rep", days: 10 },
  { label: "Public Hydrant Repair", days: 7 },
  { label: "Raw Water Scarcity", days: 6 },
  { label: "Water Value Chamber Cover Missing", days: 5 },
  { label: "Water Valve Chamber Repair", days: 6 },
  { label: "Other", days: 7 },
];

interface District {
  DistrictId: number;
  DistrictName: string;
}

interface Block {
  BlockId: number;
  BlockName: string;
}

interface GramPanchayat {
  Id?: number;
  GramPanchayatId?: number;
  GramPanchayatName: string;
}

interface Village {
  Id?: number;
  VillageId?: number;
  VillageName: string;
}

const LodgeComplaint: React.FC<LodgeComplaintProps> = ({ isModal = false, onClose }) => {
  
  // State for dropdowns
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayat[]>([]);
  const [selectedGramPanchayatId, setSelectedGramPanchayatId] = useState<number | null>(null);
  
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  
  const [beneficiaries, setBeneficiaries] = useState<{ BeneficiaryId: number; BeneficiaryName: string; Contact: string }[]>([]);

  // Form fields
  const [form, setForm] = useState({
    beneficiaryName: "",
    beneficiaryContact: "",
    landmark: "",
    category: "",
    resolutionDays: "",
    otherCategory: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { userId, role } = useUserInfo();
  const [localRole, setLocalRole] = useState<string>("");

  // Validation function to check if all mandatory fields are filled
  const areAllMandatoryFieldsFilled = (): boolean => {
  const mandatoryFields = [
    selectedDistrictId,
    selectedBlockId,
    selectedGramPanchayatId,
    selectedVillage,
    form.beneficiaryName,
    form.beneficiaryContact,
    form.landmark,
    form.category,
  ];

  // If category is "Other", also check otherCategory field
  if (form.category === "Other") {
    mandatoryFields.push(form.otherCategory.trim());
  }

  // Check if all fields are filled
  const allFieldsFilled = mandatoryFields.every(field => field !== null && field !== "" && field !== undefined);
  
  // Also validate mobile number format
  const mobileValid = isValidMobileNumber(form.beneficiaryContact);
  
  return allFieldsFilled && mobileValid;
};

  // Validation function for mobile number
const isValidMobileNumber = (mobile: string): boolean => {
  // Check if exactly 10 digits
  if (mobile.length !== 10) return false;
  
  // Check if all characters are digits
  if (!/^\d+$/.test(mobile)) return false;
  
  // Check if first digit is 6, 7, 8, or 9
  const firstDigit = mobile.charAt(0);
  if (!['6', '7', '8', '9'].includes(firstDigit)) return false;
  
  return true;
};

  // Get role from token
useEffect(() => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    const payload = JSON.parse(atob(token.split(".")[1]));
    setLocalRole(payload?.Role || "");
  } catch (e) {
    console.error("Failed to decode token", e);
  }
}, []);

  // Fetch districts when userId is available
  // Fetch districts when userId is available
useEffect(() => {
  if (!userId) return;
  
  const loadDistricts = async () => {
    try {
      const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetDistrict?UserId=${userId}`, {
        method: "POST",
        headers: { accept: "*/*" },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.Status && data.Data.length) {
          setDistricts(data.Data);
          
          // Auto-select first district if only one
          if (data.Data.length === 1) {
            setSelectedDistrictId(data.Data[0].DistrictId);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
      toast.error("Failed to fetch districts");
    }
  };
  
  loadDistricts();
}, [userId]);

  // Fetch blocks when district changes
  // Fetch blocks when district changes
useEffect(() => {
  if (!selectedDistrictId || !userId || !role) return;
  
  const loadBlocks = async () => {
    try {
      // Normalize role for comparison
      const normalizedRole = role.toLowerCase().replace(/\s+/g, '');
      const isAdminLevelRole = ['admin', 'director', 'dpro'].includes(normalizedRole);
      
      let response;
      if (isAdminLevelRole) {
        // For Admin, Director, DPRO - use GetAllBlocks
        response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetAllBlocks?DistrictId=${selectedDistrictId}`, {
          method: 'POST',
          headers: { 'accept': '*/*' }
        });
      } else {
        // For ADO, Gram Panchayat, Call Center - use GetBlockListByDistrict with UserId
        response = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/GetBlockListByDistrict', {
          method: 'POST',
          headers: { 
            'accept': '*/*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ UserId: Number(userId) })
        });
      }

      if (response.ok) {
        const data = await response.json();
        
        // For non-admin roles, filter by districtId client-side
        if (!isAdminLevelRole && data.Status && Array.isArray(data.Data)) {
          const filteredBlocks = data.Data.filter((block: Block) => block.DistrictId === selectedDistrictId);
          setBlocks(filteredBlocks);
          
          // Auto-select first block if only one
          if (filteredBlocks.length === 1) {
            setSelectedBlockId(filteredBlocks[0].BlockId);
          } else {
            setSelectedBlockId(null);
          }
        } else {
          setBlocks(data.Status ? data.Data : []);
          
          // Auto-select first block if only one
          if (data.Status && data.Data.length === 1) {
            setSelectedBlockId(data.Data[0].BlockId);
          } else {
            setSelectedBlockId(null);
          }
        }
      } else {
        setBlocks([]);
        setSelectedBlockId(null);
      }
    } catch (error) {
      console.error('Error fetching blocks:', error);
      toast.error("Failed to fetch blocks");
      setBlocks([]);
      setSelectedBlockId(null);
    }
  };
  
  loadBlocks();
}, [selectedDistrictId, userId, role]);

  // Fetch gram panchayats when block changes
useEffect(() => {
  if (!selectedBlockId || !userId || !role) return;
  
  const loadGramPanchayats = async () => {
    try {
      // Normalize role for comparison
      const normalizedRole = role.toLowerCase().replace(/\s+/g, '');
      console.log('Loading GPs - Role:', role, 'Normalized:', normalizedRole, 'BlockId:', selectedBlockId, 'UserId:', userId);
      
      const isAdminLevelRole = ['admin', 'director', 'dpro'].includes(normalizedRole);
      const isCallCenter = normalizedRole === 'callcenter';
      
      console.log('isAdminLevelRole:', isAdminLevelRole, 'isCallCenter:', isCallCenter);
      
      let response;
      let requestBody;
      
      if (isAdminLevelRole) {
        // For Admin, Director, DPRO - use GetAllGramPanchayat with BlockId
        console.log('Using GetAllGramPanchayat API');
        response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetAllGramPanchayat?BlockId=${selectedBlockId}`, {
          method: 'POST',
          headers: { 'accept': '*/*' }
        });
      } else if (isCallCenter) {
        // For Call Center - use GetGramPanchayatByBlock with BlockId in body
        requestBody = { BlockId: Number(selectedBlockId) };
        console.log('Using GetGramPanchayatByBlock API for Call Center with body:', requestBody);
        
        response = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/GetGramPanchayatByBlock', {
          method: 'POST',
          headers: { 
            'accept': '*/*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
      } else {
        // For ADO, Gram Panchayat - use GetGramPanchayatByBlock with UserId in body
        requestBody = { UserId: Number(userId) };
        console.log('Using GetGramPanchayatByBlock API for GP/ADO with body:', requestBody);
        
        response = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/GetGramPanchayatByBlock', {
          method: 'POST',
          headers: { 
            'accept': '*/*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
      }

      if (response.ok) {
        const data = await response.json();
        console.log('GP API Response:', data);
        
        setGramPanchayats(data.Status ? data.Data : []);
        
        // Auto-select first GP if only one
        if (data.Status && data.Data && data.Data.length === 1) {
          setSelectedGramPanchayatId(data.Data[0].Id);
        } else {
          setSelectedGramPanchayatId(null);
        }
      } else {
        console.error('GP API failed with status:', response.status);
        setGramPanchayats([]);
        setSelectedGramPanchayatId(null);
      }
    } catch (error) {
      console.error('Error fetching gram panchayats:', error);
      toast.error("Failed to fetch gram panchayats");
      setGramPanchayats([]);
      setSelectedGramPanchayatId(null);
    }
  };
  
  loadGramPanchayats();
}, [selectedBlockId, userId, role]);

  // Fetch villages when gram panchayat changes
  useEffect(() => {
    if (!selectedBlockId || !selectedGramPanchayatId) return;
    fetch("https://wmsapi.kdsgroup.co.in/api/Master/GetVillegeByGramPanchayat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        BlockId: selectedBlockId,
        GramPanchayatId: selectedGramPanchayatId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Status && data.Data.length) {
          setVillages(data.Data);
          setSelectedVillage(data.Data[0]);
        } else {
          setVillages([]);
          setSelectedVillage(null);
        }
      })
      .catch(() => toast.error("Failed to fetch villages"));
  }, [selectedBlockId, selectedGramPanchayatId]);

  // Fetch beneficiaries when village changes
  useEffect(() => {
    if (!selectedVillage) {
      setBeneficiaries([]);
      setForm(prev => ({ ...prev, beneficiaryName: "", beneficiaryContact: "" }));
      return;
    }

    const fetchBeneficiaries = async () => {
      try {
        const villageId = selectedVillage.Id || selectedVillage.VillageId || 0;
        console.log("Fetching beneficiaries for VillageId:", villageId);
        const token = localStorage.getItem("authToken");
        const res = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetBeneficiaryListByVillage?VillageId=${villageId}`, {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        console.log("Beneficiary API response:", json);
        if (json.Status && Array.isArray(json.Data)) {
          setBeneficiaries(json.Data);
        } else {
          setBeneficiaries([]);
        }
      } catch (err) {
        console.error("Error fetching beneficiaries:", err);
        setBeneficiaries([]);
      }
    };

    fetchBeneficiaries();
  }, [selectedVillage]);

  // Update resolution days on category change
  useEffect(() => {
    if (form.category) {
      const selected = COMPLAINT_CATEGORIES.find(c => c.label === form.category);
      if (selected) {
        setForm(prev => ({
          ...prev,
          resolutionDays: `${Math.min(15, Math.max(1, selected.days))}`,
        }));
      }
    }
  }, [form.category]);

  // Handle form changes for basic form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  
  // For contact field, only allow numeric input
  if (name === "beneficiaryContact") {
    const numericValue = value.replace(/\D/g, ''); // Remove non-digits
    setForm(prev => ({ ...prev, [name]: numericValue }));
  } else {
    setForm(prev => ({ ...prev, [name]: value }));
  }
};

  // Handle category change with special logic for "Other"
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setForm(prev => ({ 
      ...prev, 
      category: value,
      otherCategory: value === "Other" ? prev.otherCategory : ""
    }));
  };

  const handleSubmitComplaint = async () => {
    setMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setMessage("User is not logged in.");
        setLoading(false);
        return;
      }

      if (!form.beneficiaryName) {
        toast.error("Please select a beneficiary before submitting.");
        setLoading(false);
        return;
      }

      if (!selectedVillage) {
        toast.error("Please select a village before submitting.");
        setLoading(false);
        return;
      }

      if (form.category === "Other" && !form.otherCategory.trim()) {
  toast.error("Please specify the other category details.");
  setLoading(false);
  return;
}

if (!isValidMobileNumber(form.beneficiaryContact)) {
  toast.error("Mobile number must be exactly 10 digits and start with 6, 7, 8, or 9.");
  setLoading(false);
  return;
}

      const payload = JSON.parse(atob(token.split(".")[1]));
      const createdBy = payload?.UserID || payload?.UserId || 0;

      const villageId = selectedVillage.VillageId ?? selectedVillage.Id ?? 0;

      const categoryMapping: Record<string, number> = {
        "Area Drinking Water Scarcity": 1,
        "Area Water Contamination": 2,
        "Cleaning Of Overhead Tank": 3,
        "Contamination Of Water": 4,
        "Defective Water Meter": 5,
        "Drinking Water Scarcity": 6,
        "Inlet Pipe Leakage Coming From Outside The House": 7,
        "Masonry Work Outside The House": 8,
        "No Water": 9,
        "Overflow From OverHead Tank": 10,
        "Pipe Leakage/Brust Outside The House": 11,
        "Public Hydrant Platform Rep": 12,
        "Public Hydrant Repair": 13,
        "Raw Water Scarcity": 14,
        "Water Value Chamber Cover Missing": 15,
        "Water Valve Chamber Repair": 16,
        "Other": 0,
      };
      const categoryId = categoryMapping[form.category] || 0;

      const bodyData = {
        VillageId: villageId,
        BeneficiaryId: Number(form.beneficiaryName),
        Contact: form.beneficiaryContact,
        Landmark: form.landmark,
        Categoryid: categoryId,
        Description: form.category === "Other" ? form.otherCategory : form.category,
        Status: 1,
        ResolutionTimelineDays: Number(form.resolutionDays),
        CreatedBy: createdBy,
        UpdatedBy: createdBy,
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        DeviceToken: "",
        IPAddress: "",
        OtherCategory: form.category === "Other" ? form.otherCategory : "",
        uparm: localStorage.getItem("uparm") || "",
      };

      const res = await fetch(
        "https://wmsapi.kdsgroup.co.in/api/Complain/InsertLodgeComplain",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bodyData),
        }
      );

      const data = await res.json();
      if (data?.Status) {
        toast.success(data.Message || "Complaint lodged successfully.");
        setForm({
          beneficiaryName: "",
          beneficiaryContact: "",
          landmark: "",
          category: "",
          resolutionDays: "",
          otherCategory: "",
        });
        setSelectedDistrictId(null);
        setSelectedBlockId(null);
        setSelectedGramPanchayatId(null);
        setSelectedVillage(null);
        setBlocks([]);
        setGramPanchayats([]);
        setVillages([]);
        setBeneficiaries([]);
      } else {
        toast.error(data?.Message || "Failed to lodge complaint.");
      }
    } catch (err) {
      console.error("Complaint submission error:", err);
      toast.error("Network error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className={clsx("p-6 rounded-xl bg-white shadow-lg", isModal ? "w-full max-w-2xl mx-auto" : "")}>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="mb-4">
        <h2 className="text-xl font-bold text-blue-800">Lodge Complaint</h2>
        <p className="text-sm text-gray-600 mt-1">Complaint to be raised on behalf of the beneficiary.</p>
        <p className="text-sm text-red-600 mt-1 font-medium">Complaint once registered cannot be revoked.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* District */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            District <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedDistrictId || ""}
            onChange={(e) => {
  setSelectedDistrictId(Number(e.target.value) || null);
  // Reset dependent filters
  setBlocks([]);
  setSelectedBlockId(null);
  setGramPanchayats([]);
  setSelectedGramPanchayatId(null);
  setVillages([]);
  setSelectedVillage(null);
  setBeneficiaries([]);
}}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select District</option>
            {districts.map((d) => (
              <option key={d.DistrictId} value={d.DistrictId}>
                {d.DistrictName}
              </option>
            ))}
          </select>
        </div>

        {/* Block */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Select Block <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedBlockId || ""}
            onChange={(e) => {
  setSelectedBlockId(Number(e.target.value) || null);
  // Reset dependent filters
  setGramPanchayats([]);
  setSelectedGramPanchayatId(null);
  setVillages([]);
  setSelectedVillage(null);
  setBeneficiaries([]);
}}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select Block</option>
            {blocks.map((b) => (
              <option key={b.BlockId} value={b.BlockId}>
                {b.BlockName}
              </option>
            ))}
          </select>
        </div>

        {/* Gram Panchayat */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Gram Panchayat <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedGramPanchayatId || ""}
            onChange={(e) => {
  setSelectedGramPanchayatId(Number(e.target.value) || null);
  // Reset village filter
  setVillages([]);
  setSelectedVillage(null);
  setBeneficiaries([]);
}}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select Gram Panchayat</option>
            {gramPanchayats.map((gp) => (
              <option key={gp.Id} value={gp.Id}>
                {gp.GramPanchayatName}
              </option>
            ))}
          </select>
        </div>

        {/* Village */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Village <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedVillage?.Id || ""}
            onChange={(e) => setSelectedVillage(villages.find(v => v.Id === Number(e.target.value)) || null)}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select Village</option>
            {villages.map((v) => (
              <option key={v.Id} value={v.Id}>
                {v.VillageName || "Unnamed"}
              </option>
            ))}
          </select>
        </div>

        {/* Beneficiary Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Beneficiary Name <span className="text-red-500">*</span>
          </label>
          <select
            id="beneficiaryName"
            value={form.beneficiaryName}
            onChange={(e) => setForm({ ...form, beneficiaryName: e.target.value })}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select Beneficiary</option>
            {beneficiaries.map((b) => (
              <option key={b.BeneficiaryId} value={String(b.BeneficiaryId)}>
                {b.BeneficiaryName}
              </option>
            ))}
          </select>
        </div>

        {/* Beneficiary Contact Number */}
        <div className="flex flex-col">
  <label className="text-sm font-medium mb-1 text-gray-700">
    Beneficiary Contact Number <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    name="beneficiaryContact"
    value={form.beneficiaryContact}
    onChange={handleChange}
    placeholder="Enter 10-digit mobile number"
    maxLength={10}
    className={`border px-3 py-2 rounded-md focus:outline-none focus:ring-2 ${
      form.beneficiaryContact && !isValidMobileNumber(form.beneficiaryContact)
        ? 'border-red-500 focus:ring-red-400'
        : 'border-gray-300 focus:ring-blue-400'
    }`}
    required
  />
  {form.beneficiaryContact && !isValidMobileNumber(form.beneficiaryContact) && (
    <p className="text-xs text-red-600 mt-1">
      Mobile number must be 10 digits and start with 6, 7, 8, or 9
    </p>
  )}
</div>

        {/* Landmark */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Landmark <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="landmark"
            value={form.landmark}
            onChange={handleChange}
            placeholder="Landmark"
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Complaint Category */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Complaint Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleCategoryChange}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select Complaint Category</option>
            {COMPLAINT_CATEGORIES.map((c, i) => (
              <option key={i} value={c.label}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Other Category Text Input - Only visible when "Other" is selected */}
        {form.category === "Other" && (
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-gray-700">
              Specify Other Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="otherCategory"
              value={form.otherCategory}
              onChange={handleChange}
              placeholder="Please specify the complaint category"
              className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
        )}

        {/* Resolution Timeline */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">Resolution Timeline (in days)</label>
          <input
            type="text"
            name="resolutionDays"
            value={form.resolutionDays}
            readOnly
            className="border border-gray-300 px-3 py-2 rounded-md bg-gray-100 cursor-not-allowed focus:outline-none"
          />
        </div>
      </div>

      {/* Display validation message when fields are missing */}
      {!areAllMandatoryFieldsFilled() && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <span className="font-medium">Please fill all mandatory fields</span> (marked with <span className="text-red-500">*</span>) to enable the submit button.
          </p>
        </div>
      )}

      {message && (
        <p
          className={`mt-4 text-sm ${
            message.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <div className="mt-6 flex justify-end space-x-3">
        {isModal && (
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmitComplaint}
          disabled={loading || !areAllMandatoryFieldsFilled()}
          className={clsx(
            "px-4 py-2 text-white rounded transition-all duration-200",
            areAllMandatoryFieldsFilled() && !loading
              ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed opacity-50"
          )}
        >
          {loading ? "Submitting..." : "Submit Complaint"}
        </button>
      </div>
    </div>
  );
};

export default LodgeComplaint;