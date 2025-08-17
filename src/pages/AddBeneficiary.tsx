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

  // Fetch districts on mount
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
        setSelectedDistrictId(data.Data[0].DistrictId); // default select first district
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
        setSelectedBlockId(data.Data[0]?.BlockId || null);
      } else {
        setBlocks([]);
        setSelectedBlockId(null);
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
        setSelectedGramPanchayatId(data.Data[0]?.Id || null);
      } else {
        setGramPanchayats([]);
        setSelectedGramPanchayatId(null);
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
        setSelectedVillage(data.Data[0]);
      } else {
        setVillages([]);
        setSelectedVillage("");
      }
    })
    .catch(() => toast.error("Failed to fetch villages"));
}, [selectedBlockId, selectedGramPanchayatId]);


  const handleSubmit = (e) => {
    e.preventDefault();

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
          // reset form or do whatever
        }
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
          <label className="block font-medium mb-1">District</label>
          <select
            value={selectedDistrictId || ""}
            onChange={(e) => setSelectedDistrictId(Number(e.target.value))}
            className="w-full border rounded-md px-3 py-2"
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
        <div>
          <label className="block font-medium mb-1">Block</label>
          <select
            value={selectedBlockId || ""}
            onChange={(e) => setSelectedBlockId(Number(e.target.value))}
            className="w-full border rounded-md px-3 py-2"
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
        <div>
          <label className="block font-medium mb-1">Gram Panchayat</label>
          <select
            value={selectedGramPanchayatId || ""}
            onChange={(e) => setSelectedGramPanchayatId(Number(e.target.value))}
            className="w-full border rounded-md px-3 py-2"
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
        <div>
          <label className="block font-medium mb-1">Village</label>
          <select
            value={selectedVillage?.Id || ""}
            onChange={(e) => setSelectedVillage(villages.find(v => v.Id === Number(e.target.value)))}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">Select Village</option>
            {villages.map((v) => (
              <option key={v.Id} value={v.Id}>
                {v.VillageName || v.GramPanchayatName || "Unnamed"}
              </option>
            ))}
          </select>
        </div>

        {/* Beneficiary Name */}
        <div>
          <label className="block font-medium mb-1">Beneficiary Name</label>
          <input
            type="text"
            placeholder="Enter Name"
            className="w-full border rounded-md px-3 py-2"
            value={beneficiaryName}
            onChange={(e) => setBeneficiaryName(e.target.value)}
          />
        </div>

        {/* Father/Husband Name */}
        <div>
          <label className="block font-medium mb-1">Father/Husband Name</label>
          <input
            type="text"
            placeholder="Enter Name"
            className="w-full border rounded-md px-3 py-2"
            value={fatherHusbandName}
            onChange={(e) => setFatherHusbandName(e.target.value)}
          />
        </div>

        {/* Aadhaar Number */}
        <div>
          <label className="block font-medium mb-1">Beneficiary Aadhaar</label>
          <input
            type="text"
            placeholder="Enter Aadhaar Number"
            className="w-full border rounded-md px-3 py-2"
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value)}
          />
        </div>

        {/* Contact Number */}
        <div>
          <label className="block font-medium mb-1">Contact Number</label>
          <input
            type="tel"
            placeholder="Enter Contact Number"
            className="w-full border rounded-md px-3 py-2"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </div>

        {/* Family Members Count */}
        <div>
          <label className="block font-medium mb-1">Family Members Count</label>
          <input
            type="number"
            placeholder="Enter Count"
            className="w-full border rounded-md px-3 py-2"
            value={familyCount}
            onChange={(e) => setFamilyCount(e.target.value)}
          />
        </div>

        {/* Water Supply Status */}
        <div>
          <label className="block font-medium mb-1">Water Supply Status</label>
          <select
            className="w-full border rounded-md px-3 py-2"
            value={waterSupplyStatus}
            onChange={(e) => setWaterSupplyStatus(e.target.value)}
          >
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="md:col-span-2 flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={() => {
              // reset all fields
              setBeneficiaryName("");
              setFatherHusbandName("");
              setAadhaar("");
              setContact("");
              setFamilyCount("");
              setWaterSupplyStatus("");
              setSelectedVillage("");
              setSelectedGramPanchayatId(null);
              setSelectedBlockId(null);
              setSelectedDistrictId(null);
            }}
            className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded-md"
          >
            Reset
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBeneficiary;
