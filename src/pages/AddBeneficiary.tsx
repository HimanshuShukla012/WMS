import { useEffect, useState } from "react";
import { useUserInfo } from '../utils/userInfo';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const AddBeneficiary = () => {

  type District = { DistrictId: number; DistrictName: string };
  type Block = { BlockId: number; BlockName: string };
  type GramPanchayat = { Id: number; GramPanchayatName: string };
  type Village = { Id: number; VillageName?: string; GramPanchayatName?: string };

  // state typings
  const [districts, setDistricts] = useState<District[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayat[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [selectedGramPanchayatId, setSelectedGramPanchayatId] = useState<number | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);

  const { userId } = useUserInfo();

  // Beneficiary form fields
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [fatherHusbandName, setFatherHusbandName] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [contact, setContact] = useState("");
  const [familyCount, setFamilyCount] = useState("");
  const [waterSupplyStatus, setWaterSupplyStatus] = useState("");

  // Validation error states
  const [errors, setErrors] = useState({
    beneficiaryName: "",
    fatherHusbandName: "",
    aadhaar: "",
    contact: "",
    familyCount: "",
    district: "",
    block: "",
    gramPanchayat: "",
    village: "",
    waterSupplyStatus: ""
  });

  // Check if all mandatory fields are filled
  const isMandatoryFieldsFilled = () => {
    return (
      selectedDistrictId !== null &&
      selectedBlockId !== null &&
      selectedGramPanchayatId !== null &&
      selectedVillage !== null &&
      beneficiaryName.trim() !== "" &&
      fatherHusbandName.trim() !== "" &&
      familyCount.trim() !== "" &&
      waterSupplyStatus !== ""
    );
  };

  // Updated validation functions to support Hindi (Devanagari)
  const validateName = (name: string) => {
    // Allow English letters, Hindi Devanagari characters (excluding digits), dots, and spaces
    // \u0905-\u0939: Devanagari vowels and consonants
    // \u093C-\u094F: Devanagari signs and vowel marks
    // \u0951-\u0957: Additional Devanagari signs
    const nameRegex = /^[a-zA-Z\u0905-\u0939\u093C-\u094F\u0951-\u0957.\s]+$/;
    return nameRegex.test(name);
  };

  const validateAadhaar = (aadhaar: string) => {
    const aadhaarRegex = /^\d{12}$/;
    return aadhaarRegex.test(aadhaar);
  };

  const validateContact = (contact: string) => {
    const contactRegex = /^[6-9]\d{9}$/;
    return contactRegex.test(contact);
  };

  const validateFamilyCount = (count: string) => {
    const num = Number(count);
    return num >= 1 && num <= 50;
  };

  // Updated input handlers with Hindi support
  const handleBeneficiaryNameChange = (e) => {
    const value = e.target.value;
    // Allow English letters, Hindi Devanagari characters (excluding digits), dots, and spaces
    const filteredValue = value.replace(/[^a-zA-Z\u0905-\u0939\u093C-\u094F\u0951-\u0957.\s]/g, '');
    setBeneficiaryName(filteredValue);
    setErrors(prev => ({ ...prev, beneficiaryName: "" }));
  };

  const handleFatherHusbandNameChange = (e) => {
    const value = e.target.value;
    // Allow English letters, Hindi Devanagari characters (excluding digits), dots, and spaces
    const filteredValue = value.replace(/[^a-zA-Z\u0905-\u0939\u093C-\u094F\u0951-\u0957.\s]/g, '');
    setFatherHusbandName(filteredValue);
    setErrors(prev => ({ ...prev, fatherHusbandName: "" }));
  };

  const handleAadhaarChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 12) {
      setAadhaar(value);
      
      if (value && value.length !== 12) {
        setErrors(prev => ({ ...prev, aadhaar: "Aadhaar must be exactly 12 digits" }));
      } else {
        setErrors(prev => ({ ...prev, aadhaar: "" }));
      }
    }
  };

  // Handle family count change with validation
  const handleFamilyCountChange = (e) => {
    const value = e.target.value;
    setFamilyCount(value);
    
    if (value && !validateFamilyCount(value)) {
      const num = Number(value);
      if (num < 1) {
        setErrors(prev => ({ ...prev, familyCount: "Family count must be at least 1" }));
      } else if (num > 50) {
        setErrors(prev => ({ ...prev, familyCount: "Family count cannot exceed 50" }));
      }
    } else {
      setErrors(prev => ({ ...prev, familyCount: "" }));
    }
  };

  const handleContactChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 10) {
      setContact(value);
      
      if (value && !validateContact(value)) {
        if (value.length !== 10) {
          setErrors(prev => ({ ...prev, contact: "Contact number must be exactly 10 digits" }));
        } else if (!/^[6-9]/.test(value)) {
          setErrors(prev => ({ ...prev, contact: "Contact number must start with 6, 7, 8, or 9" }));
        }
      } else {
        setErrors(prev => ({ ...prev, contact: "" }));
      }
    }
  };

  // Updated keypress handler to allow Hindi characters
  const handleNameKeyPress = (e) => {
    const char = String.fromCharCode(e.which);
    // Allow English letters, Hindi Devanagari characters (excluding digits), dots, and spaces
    if (!/[a-zA-Z\u0905-\u0939\u093C-\u094F\u0951-\u0957.\s]/.test(char)) {
      e.preventDefault();
    }
  };

  // Prevent invalid key presses for number fields
  const handleNumberKeyPress = (e) => {
    const char = String.fromCharCode(e.which);
    if (!/[0-9]/.test(char)) {
      e.preventDefault();
    }
  };

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
          // Don't auto-select first district - let user choose
        }
      })
      .catch(() => toast.error("Failed to fetch districts"));
  }, [userId]);

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
          // Reset dependent fields when district changes
          setSelectedBlockId(null);
          setSelectedGramPanchayatId(null);
          setSelectedVillage(null);
        } else {
          setBlocks([]);
          setSelectedBlockId(null);
          setSelectedGramPanchayatId(null);
          setSelectedVillage(null);
        }
      })
      .catch(() => toast.error("Failed to fetch blocks"));
  }, [selectedDistrictId, userId]);

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
          // Reset dependent fields when block changes
          setSelectedGramPanchayatId(null);
          setSelectedVillage(null);
        } else {
          setGramPanchayats([]);
          setSelectedGramPanchayatId(null);
          setSelectedVillage(null);
        }
      })
      .catch(() => toast.error("Failed to fetch gram panchayats"));
  }, [selectedBlockId, userId]);

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
          // Reset village selection when gram panchayat changes
          setSelectedVillage(null);
        } else {
          setVillages([]);
          setSelectedVillage(null);
        }
      })
      .catch(() => toast.error("Failed to fetch villages"));
  }, [selectedBlockId, selectedGramPanchayatId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check mandatory fields
    const mandatoryErrors = {
      district: !selectedDistrictId ? "District is required" : "",
      block: !selectedBlockId ? "Block is required" : "",
      gramPanchayat: !selectedGramPanchayatId ? "Gram Panchayat is required" : "",
      village: !selectedVillage ? "Village is required" : "",
      beneficiaryName: !beneficiaryName.trim() ? "Beneficiary name is required" : "",
      fatherHusbandName: !fatherHusbandName.trim() ? "Father/Husband name is required" : "",
      familyCount: !familyCount.trim() ? "Family count is required" : "",
      waterSupplyStatus: !waterSupplyStatus ? "Water supply status is required" : "",
      aadhaar: "",
      contact: ""
    };

    // Final validation for filled fields
    const finalErrors = {
      ...mandatoryErrors,
      beneficiaryName: mandatoryErrors.beneficiaryName || 
        (beneficiaryName && !validateName(beneficiaryName) ? "Invalid name format" : ""),
      fatherHusbandName: mandatoryErrors.fatherHusbandName || 
        (fatherHusbandName && !validateName(fatherHusbandName) ? "Invalid name format" : ""),
      aadhaar: aadhaar && !validateAadhaar(aadhaar) ? "Invalid Aadhaar format" : "",
      contact: contact && !validateContact(contact) ? "Invalid contact number" : "",
      familyCount: mandatoryErrors.familyCount || 
        (familyCount && !validateFamilyCount(familyCount) ? "Family count must be between 1 and 50" : "")
    };

    setErrors(finalErrors);

    // Check if there are any errors
    const hasErrors = Object.values(finalErrors).some(error => error !== "");
    if (hasErrors) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    // Prepare payload according to API
    const payload = {
      BeneficiaryId: 0, // new beneficiary
      VillId: selectedVillage?.Id || 0,
      BeneficiaryName: beneficiaryName,
      FatherHusbandName: fatherHusbandName,
      Contact: contact,
      FamilyMemberCount: Number(familyCount),
      WaterSupplyStatus: waterSupplyStatus === "Active",
      CreatedBy: userId, // set if available
      DeviceToken: "",
      IPAddress: "",
      AadharNo: aadhaar,
    };

    fetch("https://wmsapi.kdsgroup.co.in/api/User/InsertBeneficiaryDetails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        toast.success(data.Message || "Beneficiary saved successfully");
        if (data.Status) {
          // reset form on successful save
          resetForm();
        }
      })
      .catch(() => toast.error("Failed to save beneficiary"));
  };

  const resetForm = () => {
    setBeneficiaryName("");
    setFatherHusbandName("");
    setAadhaar("");
    setContact("");
    setFamilyCount("");
    setWaterSupplyStatus("");
    setSelectedVillage(null);
    setSelectedGramPanchayatId(null);
    setSelectedBlockId(null);
    setSelectedDistrictId(null);
    setErrors({
      beneficiaryName: "",
      fatherHusbandName: "",
      aadhaar: "",
      contact: "",
      familyCount: "",
      district: "",
      block: "",
      gramPanchayat: "",
      village: "",
      waterSupplyStatus: ""
    });
  };

  return (
    <div className="p-6 w-full min-h-screen text-black relative z-10">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-2xl font-semibold mb-2">Add Beneficiary</h1>
      <p className="text-gray-600 mb-6">
        This page is only for adding new beneficiary details. To update any existing beneficiary records, please visit the{" "}
        <a href="/gp/manage-beneficiary" className="text-blue-600 underline hover:text-blue-800">
          Manage Beneficiary
        </a>{" "}
        page.
      </p>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white shadow-md p-6 rounded-xl"
      >
        {/* District */}
        <div>
          <label className="block font-medium mb-1">
            District <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedDistrictId || ""}
            onChange={(e) => setSelectedDistrictId(Number(e.target.value))}
            className={`w-full border rounded-md px-3 py-2 ${errors.district ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select District</option>
            {districts.map((d) => (
              <option key={d.DistrictId} value={d.DistrictId}>
                {d.DistrictName}
              </option>
            ))}
          </select>
          {errors.district && (
            <p className="text-red-500 text-sm mt-1">{errors.district}</p>
          )}
        </div>

        {/* Block */}
        <div>
          <label className="block font-medium mb-1">
            Select Block <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedBlockId || ""}
            onChange={(e) => setSelectedBlockId(Number(e.target.value))}
            className={`w-full border rounded-md px-3 py-2 ${errors.block ? 'border-red-500' : 'border-gray-300'}`}
            disabled={!selectedDistrictId}
          >
            <option value="">Select Block Name</option>
            {blocks.map((b) => (
              <option key={b.BlockId} value={b.BlockId}>
                {b.BlockName}
              </option>
            ))}
          </select>
          {errors.block && (
            <p className="text-red-500 text-sm mt-1">{errors.block}</p>
          )}
        </div>

        {/* Gram Panchayat */}
        <div>
          <label className="block font-medium mb-1">
            Gram Panchayat <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedGramPanchayatId || ""}
            onChange={(e) => setSelectedGramPanchayatId(Number(e.target.value))}
            className={`w-full border rounded-md px-3 py-2 ${errors.gramPanchayat ? 'border-red-500' : 'border-gray-300'}`}
            disabled={!selectedBlockId}
          >
            <option value="">Select Gram Panchayat</option>
            {gramPanchayats.map((gp) => (
              <option key={gp.Id} value={gp.Id}>
                {gp.GramPanchayatName}
              </option>
            ))}
          </select>
          {errors.gramPanchayat && (
            <p className="text-red-500 text-sm mt-1">{errors.gramPanchayat}</p>
          )}
        </div>

        {/* Village */}
        <div>
          <label className="block font-medium mb-1">
            Village <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedVillage?.Id || ""}
            onChange={(e) => setSelectedVillage(villages.find(v => v.Id === Number(e.target.value)))}
            className={`w-full border rounded-md px-3 py-2 ${errors.village ? 'border-red-500' : 'border-gray-300'}`}
            disabled={!selectedGramPanchayatId}
          >
            <option value="">Select Village</option>
            {villages.map((v) => (
              <option key={v.Id} value={v.Id}>
                {v.VillageName || v.GramPanchayatName || "Unnamed"}
              </option>
            ))}
          </select>
          {errors.village && (
            <p className="text-red-500 text-sm mt-1">{errors.village}</p>
          )}
        </div>

        {/* Beneficiary Name */}
        <div>
          <label className="block font-medium mb-1">
            Beneficiary Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter Name (English or Hindi)"
            className={`w-full border rounded-md px-3 py-2 ${errors.beneficiaryName ? 'border-red-500' : 'border-gray-300'}`}
            value={beneficiaryName}
            onChange={handleBeneficiaryNameChange}
            onKeyPress={handleNameKeyPress}
          />
          {errors.beneficiaryName && (
            <p className="text-red-500 text-sm mt-1">{errors.beneficiaryName}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">Letters, dots, and spaces allowed (English/Hindi)</p>
        </div>

        {/* Father/Husband Name */}
        <div>
          <label className="block font-medium mb-1">
            Father/Husband Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter Name (English or Hindi)"
            className={`w-full border rounded-md px-3 py-2 ${errors.fatherHusbandName ? 'border-red-500' : 'border-gray-300'}`}
            value={fatherHusbandName}
            onChange={handleFatherHusbandNameChange}
            onKeyPress={handleNameKeyPress}
          />
          {errors.fatherHusbandName && (
            <p className="text-red-500 text-sm mt-1">{errors.fatherHusbandName}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">Letters, dots, and spaces allowed (English/Hindi)</p>
        </div>

        {/* Aadhaar Number */}
        <div>
          <label className="block font-medium mb-1">Beneficiary Aadhaar</label>
          <input
            type="text"
            placeholder="Enter 12-digit Aadhaar Number (Optional)"
            className={`w-full border rounded-md px-3 py-2 ${errors.aadhaar ? 'border-red-500' : 'border-gray-300'}`}
            value={aadhaar}
            onChange={handleAadhaarChange}
            onKeyPress={handleNumberKeyPress}
            maxLength={12}
          />
          {errors.aadhaar && (
            <p className="text-red-500 text-sm mt-1">{errors.aadhaar}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">Optional - Only numbers, exactly 12 digits</p>
        </div>

        {/* Contact Number */}
        <div>
          <label className="block font-medium mb-1">Contact Number</label>
          <input
            type="tel"
            placeholder="Enter 10-digit Contact Number (Optional)"
            className={`w-full border rounded-md px-3 py-2 ${errors.contact ? 'border-red-500' : 'border-gray-300'}`}
            value={contact}
            onChange={handleContactChange}
            onKeyPress={handleNumberKeyPress}
            maxLength={10}
          />
          {errors.contact && (
            <p className="text-red-500 text-sm mt-1">{errors.contact}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">Optional - 10 digits, starting with 6, 7, 8, or 9</p>
        </div>

        {/* Family Members Count */}
        <div>
          <label className="block font-medium mb-1">
            Family Members Count <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            placeholder="Enter Count (1-50)"
            className={`w-full border rounded-md px-3 py-2 ${errors.familyCount ? 'border-red-500' : 'border-gray-300'}`}
            value={familyCount}
            onChange={handleFamilyCountChange}
            min="1"
            max="50"
          />
          {errors.familyCount && (
            <p className="text-red-500 text-sm mt-1">{errors.familyCount}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">Must be between 1 and 50</p>
        </div>

        {/* Water Supply Status */}
        <div>
          <label className="block font-medium mb-1">
            Water Supply Status <span className="text-red-500">*</span>
          </label>
          <select
            className={`w-full border rounded-md px-3 py-2 ${errors.waterSupplyStatus ? 'border-red-500' : 'border-gray-300'}`}
            value={waterSupplyStatus}
            onChange={(e) => setWaterSupplyStatus(e.target.value)}
          >
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          {errors.waterSupplyStatus && (
            <p className="text-red-500 text-sm mt-1">{errors.waterSupplyStatus}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="md:col-span-2 flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded-md"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={!isMandatoryFieldsFilled()}
            className={`px-6 py-2 rounded-md ${
              isMandatoryFieldsFilled() 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
          >
            Add Beneficiary
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBeneficiary;