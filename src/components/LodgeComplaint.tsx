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
  { label: "Other", days: 7 }, // Added "Other" option
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
  const { userId } = useUserInfo();
  
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
    beneficiaryName: "", // we'll store BeneficiaryId as string here
    beneficiaryContact: "",
    landmark: "",
    category: "",
    resolutionDays: "",
    otherCategory: "", // Added for "Other" category text input
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [role, setRole] = useState<string>("");

  // Get role from token
  useEffect(() => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const payload = JSON.parse(atob(token.split(".")[1]));
      setRole(payload?.Role || "");
    } catch (e) {
      console.error("Failed to decode token", e);
    }
  }, []);

  // Fetch districts when userId is available
  useEffect(() => {
    if (!userId) return; // wait until we have userId
    fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetDistrict?UserId=${userId}`, {
      method: "POST",
      headers: { accept: "*/*" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Status && data.Data.length) {
          setDistricts(data.Data);
          if (role.toLowerCase() === "grampanchayat") {
            setSelectedDistrictId(data.Data[0].DistrictId); // default select first district for GP role
          }
        }
      })
      .catch(() => toast.error("Failed to fetch districts"));
  }, [userId, role]);

  // Fetch blocks when district changes
  useEffect(() => {
    if (!selectedDistrictId || !userId) return;
    fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetBlockListByDistrict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ UserId: userId, DistrictId: selectedDistrictId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Status && data.Data.length) {
          setBlocks(data.Data);
          if (role.toLowerCase() === "grampanchayat") {
            setSelectedBlockId(data.Data[0]?.BlockId || null);
          }
        } else {
          setBlocks([]);
          setSelectedBlockId(null);
        }
      })
      .catch(() => toast.error("Failed to fetch blocks"));
  }, [selectedDistrictId, userId, role]);

  // Fetch gram panchayats when block changes
  useEffect(() => {
    if (!selectedBlockId || !userId) return;
    fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetGramPanchayatByBlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ UserId: userId, BlockId: selectedBlockId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Status && data.Data.length) {
          setGramPanchayats(data.Data);
          if (role.toLowerCase() === "grampanchayat") {
            setSelectedGramPanchayatId(data.Data[0]?.Id || null);
          }
        } else {
          setGramPanchayats([]);
          setSelectedGramPanchayatId(null);
        }
      })
      .catch(() => toast.error("Failed to fetch gram panchayats"));
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
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle category change with special logic for "Other"
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setForm(prev => ({ 
      ...prev, 
      category: value,
      otherCategory: value === "Other" ? prev.otherCategory : "" // Clear otherCategory if not "Other"
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

      // Validate "Other" category
      if (form.category === "Other" && !form.otherCategory.trim()) {
        toast.error("Please specify the other category details.");
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
        "Other": 0, // Added mapping for "Other"
      };
      const categoryId = categoryMapping[form.category] || 0;

      const bodyData = {
        VillageId: villageId,
        BeneficiaryId: Number(form.beneficiaryName),
        Contact: form.beneficiaryContact,
        Landmark: form.landmark,
        Categoryid: categoryId,
        Description: form.category === "Other" ? form.otherCategory : form.category,
        Status: 1, // Changed from boolean true to integer 1
        ResolutionTimelineDays: Number(form.resolutionDays),
        CreatedBy: createdBy,
        UpdatedBy: createdBy,
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        DeviceToken: "",
        IPAddress: "",
        OtherCategory: form.category === "Other" ? form.otherCategory : "",
        uparm: localStorage.getItem("uparm") || "", // Keep original approach
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
          otherCategory: "", // Reset otherCategory
        });
        // Reset all dropdowns
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
          <label className="text-sm font-medium mb-1 text-gray-700">District</label>
          <select
            value={selectedDistrictId || ""}
            onChange={(e) => setSelectedDistrictId(Number(e.target.value))}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          <label className="text-sm font-medium mb-1 text-gray-700">Select Block</label>
          <select
            value={selectedBlockId || ""}
            onChange={(e) => setSelectedBlockId(Number(e.target.value))}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          <label className="text-sm font-medium mb-1 text-gray-700">Gram Panchayat</label>
          <select
            value={selectedGramPanchayatId || ""}
            onChange={(e) => setSelectedGramPanchayatId(Number(e.target.value))}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          <label className="text-sm font-medium mb-1 text-gray-700">Village</label>
          <select
            value={selectedVillage?.Id || ""}
            onChange={(e) => setSelectedVillage(villages.find(v => v.Id === Number(e.target.value)) || null)}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          <label className="text-sm font-medium mb-1 text-gray-700">Beneficiary Name</label>
          <select
            id="beneficiaryName"
            value={form.beneficiaryName}
            onChange={(e) => setForm({ ...form, beneficiaryName: e.target.value })}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          <label className="text-sm font-medium mb-1 text-gray-700">Beneficiary Contact Number</label>
          <input
            type="text"
            name="beneficiaryContact"
            value={form.beneficiaryContact}
            onChange={handleChange}
            placeholder="Beneficiary Contact Number"
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Landmark */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">Landmark</label>
          <input
            type="text"
            name="landmark"
            value={form.landmark}
            onChange={handleChange}
            placeholder="Landmark"
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Complaint Category */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">Complaint Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleCategoryChange}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
            <label className="text-sm font-medium mb-1 text-gray-700">Specify Other Category</label>
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
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Complaint"}
        </button>
      </div>
    </div>
  );
};

export default LodgeComplaint;