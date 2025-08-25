import React, { useEffect, useState } from "react";
import { useUserInfo } from "../utils/userInfo";

type Pump = {
  horsepower: string;
  powerSource: string; // keep name ("Solar"/"Electricity") so existing checks work
  solarOutput: string;
  status?: string;
};

const API_BASE_URL = "https://wmsapi.kdsgroup.co.in";

// API response shapes (minimal)
interface District {
  DistrictId: number;
  DistrictName: string;
  DistrictNameHidi?: string;
}
interface Block {
  BlockId: number;
  DistrictId: number;
  BlockName: string;
  BlockNameHindi?: string;
  Code?: string;
}
interface GramPanchayat {
  Id: number;
  BlockId: number;
  GramPanchayatName: string;
  GramPanchayatHindi?: string;
  Code?: string;
}
interface Village {
  Id: number;
  GramPanchayatId: number;
  VillageName: string;
  VillageNameHindi?: string;
}
interface PowerSource {
  PowerSourceId: number;
  PowerSourceName: string;
  Status: boolean;
}

const PumpHouseMaster: React.FC = () => {
  const { userId } = useUserInfo();

  // Location selections (match your JSX fields)
  const [district, setDistrict] = useState<string>("");
  const [block, setBlock] = useState<string>("");
  const [gramPanchayat, setGramPanchayat] = useState<string>("");
  const [villageId, setVillageId] = useState<string>("");

  // Lists
  const [districtList, setDistrictList] = useState<District[]>([]);
  const [blockList, setBlockList] = useState<Block[]>([]);
  const [gpList, setGpList] = useState<GramPanchayat[]>([]);
  const [villageList, setVillageList] = useState<Village[]>([]);
  const [powerSourceList, setPowerSourceList] = useState<PowerSource[]>([]);

  // OHT / Pump form
  const [ohtCapacity, setOhtCapacity] = useState<string>("");
  const [numPumps, setNumPumps] = useState<number>(1);
  const [operatorName, setOperatorName] = useState<string>("");
  const [contact, setContact] = useState<string>("");

  // Pumps array
  const [pumps, setPumps] = useState<Pump[]>([
    { horsepower: "", powerSource: "", solarOutput: "", status: "" },
  ]);

  // Validation error states
  const [errors, setErrors] = useState({
    ohtCapacity: "",
    operatorName: "",
    contact: "",
    pumps: Array(1).fill({ horsepower: "" }) // Array of pump errors
  });

  const [saving, setSaving] = useState(false);

  // Validation functions
  const validateOHTCapacity = (capacity: string) => {
    const num = Number(capacity);
    return num >= 10 && num <= 600;
  };

  const validateHorsepower = (hp: string) => {
    const num = Number(hp);
    return num > 0 && num <= 50;
  };

  const validateName = (name: string) => {
    const nameRegex = /^[a-zA-Z.\s]+$/;
    return nameRegex.test(name);
  };

  const validateContact = (contact: string) => {
    const contactRegex = /^[6-9]\d{9}$/;
    return contactRegex.test(contact);
  };

  // Input handlers with validation
  const handleOHTCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setOhtCapacity(value);
    
    if (value && !validateOHTCapacity(value)) {
      const num = Number(value);
      if (num < 10) {
        setErrors(prev => ({ ...prev, ohtCapacity: "OHT Capacity must be at least 10 K L D" }));
      } else if (num > 600) {
        setErrors(prev => ({ ...prev, ohtCapacity: "OHT Capacity must not exceed 600 K L D" }));
      }
    } else {
      setErrors(prev => ({ ...prev, ohtCapacity: "" }));
    }
  };

  const handleOperatorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow letters, dots, and spaces
    const filteredValue = value.replace(/[^a-zA-Z.\s]/g, '');
    setOperatorName(filteredValue);
    setErrors(prev => ({ ...prev, operatorName: "" }));
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleHorsepowerChange = (index: number, value: string) => {
    const filteredValue = value.replace(/\D/g, ''); // Remove non-digits
    const updated = [...pumps];
    updated[index] = { ...updated[index], horsepower: filteredValue };
    setPumps(updated);

    // Update errors for this pump
    const newPumpErrors = [...errors.pumps];
    if (filteredValue && !validateHorsepower(filteredValue)) {
      const num = Number(filteredValue);
      if (num <= 0) {
        newPumpErrors[index] = { ...newPumpErrors[index], horsepower: "Horsepower must be greater than 0" };
      } else if (num > 50) {
        newPumpErrors[index] = { ...newPumpErrors[index], horsepower: "Horsepower must not exceed 50 HP" };
      }
    } else {
      newPumpErrors[index] = { ...newPumpErrors[index], horsepower: "" };
    }
    setErrors(prev => ({ ...prev, pumps: newPumpErrors }));
  };

  // Prevent invalid key presses
  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    const char = String.fromCharCode(e.which);
    if (!/[a-zA-Z.\s]/.test(char)) {
      e.preventDefault();
    }
  };

  const handleNumberKeyPress = (e: React.KeyboardEvent) => {
    const char = String.fromCharCode(e.which);
    if (!/[0-9]/.test(char)) {
      e.preventDefault();
    }
  };

  // --- INIT: fetch Districts + Power Sources (same as AddBeneficiary pattern) ---
  useEffect(() => {
    if (!userId) return;
    const ac = new AbortController();

    (async () => {
      try {
        // Districts (POST with query param UserId)
        const dRes = await fetch(
          `${API_BASE_URL}/api/Master/GetDistrict?UserId=${userId}`,
          { method: "POST", signal: ac.signal, headers: { accept: "*/*" } }
        );
        const dJson = await dRes.json();
        const dData: District[] = dJson?.Data ?? [];
        setDistrictList(dData);

        // Auto-select first district (same behavior as your AddBeneficiary)
        if (dData.length) {
          setDistrict(String(dData[0].DistrictId));
        }

        // Power sources (GET)
        const pRes = await fetch(`${API_BASE_URL}/api/Master/GetPowerSourceList`, {
          method: "GET",
          signal: ac.signal,
          headers: { accept: "*/*" },
        });
        const pJson = await pRes.json();
        setPowerSourceList(pJson?.Data ?? []);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Init fetch error:", err);
        }
      }
    })();

    return () => ac.abort();
  }, [userId]);

  // --- When district changes, fetch blocks (exact same API seq as AddBeneficiary) ---
  useEffect(() => {
    if (!userId) return;

    if (!district) {
      setBlockList([]);
      setBlock("");
      setGpList([]);
      setGramPanchayat("");
      setVillageList([]);
      setVillageId("");
      return;
    }

    const ac = new AbortController();

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/Master/GetBlockListByDistrict`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: ac.signal,
            body: JSON.stringify({
              UserId: userId,
              DistrictId: Number(district),
            }),
          }
        );
        const json = await res.json();
        const data: Block[] = json?.Data ?? [];
        setBlockList(data);

        // reset downstream
        if (data.length) {
          setBlock(String(data[0].BlockId)); // auto-select first block
        } else {
          setBlock("");
        }
        setGpList([]);
        setGramPanchayat("");
        setVillageList([]);
        setVillageId("");
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("GetBlockListByDistrict error:", err);
        }
      }
    })();

    return () => ac.abort();
  }, [district, userId]);

  // --- When block changes, fetch gram panchayats (same as AddBeneficiary) ---
  useEffect(() => {
    if (!userId) return;

    if (!block) {
      setGpList([]);
      setGramPanchayat("");
      setVillageList([]);
      setVillageId("");
      return;
    }

    const ac = new AbortController();

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/Master/GetGramPanchayatByBlock`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: ac.signal,
            body: JSON.stringify({
              UserId: userId,
              BlockId: Number(block),
            }),
          }
        );
        const json = await res.json();
        const data: GramPanchayat[] = json?.Data ?? [];
        setGpList(data);

        // reset downstream
        if (data.length) {
          setGramPanchayat(String(data[0].Id)); // auto-select first GP
        } else {
          setGramPanchayat("");
        }
        setVillageList([]);
        setVillageId("");
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("GetGramPanchayatByBlock error:", err);
        }
      }
    })();

    return () => ac.abort();
  }, [block, userId]);

  // --- When gram panchayat changes, fetch villages (same as AddBeneficiary) ---
  useEffect(() => {
    if (!gramPanchayat || !block) {
      setVillageList([]);
      setVillageId("");
      return;
    }

    const ac = new AbortController();

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/Master/GetVillegeByGramPanchayat`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: ac.signal,
            body: JSON.stringify({
              BlockId: Number(block),
              GramPanchayatId: Number(gramPanchayat),
            }),
          }
        );
        const json = await res.json();
        const data: Village[] = json?.Data ?? [];
        setVillageList(data);
        setVillageId(data.length ? String(data[0].Id) : "");
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("GetVillegeByGramPanchayat error:", err);
        }
      }
    })();

    return () => ac.abort();
  }, [gramPanchayat, block]);

  // --- Pump helpers ---
  const handleNumPumpsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value, 10) || 1;
    setNumPumps(count);
    const updatedPumps = Array.from({ length: count }, (_, i) =>
      pumps[i] ?? { horsepower: "", powerSource: "", solarOutput: "", status: "" }
    );
    setPumps(updatedPumps);
    
    // Update errors array to match pump count
    const updatedErrors = Array.from({ length: count }, (_, i) =>
      errors.pumps[i] ?? { horsepower: "" }
    );
    setErrors(prev => ({ ...prev, pumps: updatedErrors }));
  };

  const handlePumpChange = (index: number, field: keyof Pump, value: string) => {
    if (field === "horsepower") {
      handleHorsepowerChange(index, value);
    } else {
      const updated = [...pumps];
      updated[index] = { ...updated[index], [field]: value };
      setPumps(updated);
    }
  };

  // Map power source name -> numeric code (uses API if available)
  const mapPowerSourceToCode = (psName: string) => {
    const found = powerSourceList.find(
      (p) => p.PowerSourceName?.toLowerCase?.() === psName?.toLowerCase?.()
    );
    if (found) return found.PowerSourceId;
    if (!psName) return 0;
    if (psName.toLowerCase() === "solar") return 1;
    if (psName.toLowerCase() === "electricity") return 2;
    return 0;
  };

  // Enhanced validation
  const validate = () => {
    let isValid = true;
    
    if (!villageId) {
      alert("Please select a village.");
      return false;
    }
    
    if (!ohtCapacity || !validateOHTCapacity(ohtCapacity)) {
      alert("Please enter a valid OHT Capacity between 10 and 600 K L D.");
      return false;
    }
    
    if (!operatorName.trim()) {
      alert("Please enter Operator Name.");
      return false;
    }
    
    if (operatorName && !validateName(operatorName)) {
      alert("Operator Name should contain only letters, dots, and spaces.");
      return false;
    }
    
    if (!contact.trim()) {
      alert("Please enter Contact Number.");
      return false;
    }
    
    if (contact && !validateContact(contact)) {
      alert("Please enter a valid 10-digit contact number starting with 6, 7, 8, or 9.");
      return false;
    }
    
    for (let i = 0; i < pumps.length; i++) {
      const p = pumps[i];
      if (!p.horsepower || !validateHorsepower(p.horsepower)) {
        alert(`Please enter a valid horsepower (1-50 HP) for Pump-${i + 1}.`);
        return false;
      }
      if (!p.powerSource) {
        alert(`Please select power source for Pump-${i + 1}.`);
        return false;
      }
    }
    return isValid;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    const createdBy = 1;
    const updatedBy = 1;

    const common = {
      VillageId: Number(villageId),
      OHTCapacity: Number(ohtCapacity),
      OperatorName: operatorName,
      Contact: contact,
      CreatedBy: createdBy,
      UpdatedBy: updatedBy,
      DeviceToken: navigator.userAgent || "web",
      IPAddress: window.location.hostname || "",
    };

    try {
      for (let i = 0; i < pumps.length; i++) {
        const pump = pumps[i];

        const payload: any = {
          ...common,
          NoOfPumps: 1, // saving each pump as a separate row
          Horspower: Number(pump.horsepower),
          PowerSource: mapPowerSourceToCode(pump.powerSource),
          Status: pump.status === "Active" ? 1 : 0,
        };

        if (
          pump.powerSource &&
          pump.powerSource.toLowerCase() === "solar" &&
          pump.solarOutput
        ) {
          payload.SolarOutput = pump.solarOutput;
        }

        const res = await fetch(
          `${API_BASE_URL}/api/User/InsertOverHeadTankDetails`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) {
          let errText = `${res.status} ${res.statusText}`;
          try {
            const errJson = await res.json();
            if (errJson && errJson.message) errText = errJson.message;
          } catch {}
          throw new Error(`Failed to save Pump-${i + 1}: ${errText}`);
        }
      }

      setSaving(false);
      alert("All pumps saved successfully!");
    } catch (err: any) {
      console.error(err);
      setSaving(false);
      alert("Error saving pump details: " + (err?.message || "unknown error"));
    }
  };

  const resetForm = () => {
    setNumPumps(1);
    setPumps([{ horsepower: "", powerSource: "", solarOutput: "", status: "" }]);
    setOhtCapacity("");
    setOperatorName("");
    setContact("");
    setErrors({
      ohtCapacity: "",
      operatorName: "",
      contact: "",
      pumps: [{ horsepower: "" }]
    });
  };

  return (
    <div className="p-6 relative z-10">
      <h2 className="text-2xl font-bold mb-2">Add Over Head Tank Details</h2>
      <p className="text-sm text-gray-600 mb-6">
        Use this form to enter OHT and pump details under your gram panchayat.
      </p>

      {/* Location Details */}
      <div className="bg-blue-600/20 px-4 py-2 rounded mb-4">
        <h3 className="font-semibold text-lg text-blue-900">Location Details</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">District</label>
          <select
            className="border rounded p-2 w-full"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            <option value="">Select District</option>
            {districtList.map((d) => (
              <option key={d.DistrictId} value={`${d.DistrictId}`}>
                {d.DistrictName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Select Block</label>
          <select
            className="border rounded p-2 w-full"
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            disabled={!district}
          >
            <option value="">Select Block</option>
            {blockList.map((b) => (
              <option key={b.BlockId} value={`${b.BlockId}`}>
                {b.BlockName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Gram Panchayat</label>
          <select
            className="border rounded p-2 w-full"
            value={gramPanchayat}
            onChange={(e) => setGramPanchayat(e.target.value)}
            disabled={!block}
          >
            <option value="">Select Gram Panchayat</option>
            {gpList.map((gp) => (
              <option key={gp.Id} value={`${gp.Id}`}>
                {gp.GramPanchayatName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Village</label>
          <select
            className="border rounded p-2 w-full"
            value={villageId}
            onChange={(e) => setVillageId(e.target.value)}
            disabled={!gramPanchayat}
          >
            <option value="">Select Village</option>
            {villageList.map((v) => (
              <option key={v.Id} value={`${v.Id}`}>
                {v.VillageName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* OHT Details */}
      <div className="bg-blue-600/20 px-4 py-2 rounded mb-4">
        <h3 className="font-semibold text-lg text-blue-900">OHT Details</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            OHT Capacity (K L D )
          </label>
          <input
            className={`border rounded p-2 w-full ${errors.ohtCapacity ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="OHT Capacity (10 - 600 K L D)"
            value={ohtCapacity}
            onChange={handleOHTCapacityChange}
            onKeyPress={handleNumberKeyPress}
            inputMode="numeric"
          />
          {errors.ohtCapacity && (
            <p className="text-red-500 text-sm mt-1">{errors.ohtCapacity}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">Range: 10 - 600 K L D</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Number of Pumps</label>
          <select
            className="border rounded p-2 w-full"
            value={numPumps}
            onChange={handleNumPumpsChange}
          >
            <option value={1}>1 Pump</option>
            <option value={2}>2 Pumps</option>
            <option value={3}>3 Pumps</option>
            <option value={4}>4 Pumps</option>
            <option value={5}>5 Pumps</option>
          </select>
        </div>
      </div>

      {/* Pump Details */}
      <div className="bg-blue-600/20 px-4 py-2 rounded mb-4">
        <h3 className="font-semibold text-lg text-blue-900">Pump Details</h3>
      </div>
      {pumps.map((pump, index) => (
        <div key={index} className="mb-6 border-t pt-4">
          <h4 className="font-semibold text-blue-800 mb-2">Pump-{index + 1}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Capacity (HP)
              </label>
              <input
                className={`border rounded p-2 w-full ${errors.pumps[index]?.horsepower ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Capacity (1-50 HP)"
                value={pump.horsepower}
                onChange={(e) => handlePumpChange(index, "horsepower", e.target.value)}
                onKeyPress={handleNumberKeyPress}
              />
              {errors.pumps[index]?.horsepower && (
                <p className="text-red-500 text-sm mt-1">{errors.pumps[index].horsepower}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">Maximum: 50 HP</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Power Source</label>
              <select
                className="border rounded p-2 w-full"
                value={pump.powerSource}
                onChange={(e) => handlePumpChange(index, "powerSource", e.target.value)}
              >
                <option value="">Select Power Source</option>
                {powerSourceList.length > 0 ? (
                  powerSourceList.map((ps) => (
                    <option key={ps.PowerSourceId} value={ps.PowerSourceName}>
                      {ps.PowerSourceName}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Electricity">Electricity</option>
                    <option value="Solar">Solar</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Pump Status</label>
              <select
                className="border rounded p-2 w-full"
                value={pump.status}
                onChange={(e) => handlePumpChange(index, "status", e.target.value)}
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {pump.powerSource && pump.powerSource.toLowerCase() === "solar" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Solar Output (kW)
                </label>
                <input
                  className="border rounded p-2 w-full"
                  placeholder="Solar Output (kW)"
                  value={pump.solarOutput}
                  onChange={(e) => handlePumpChange(index, "solarOutput", e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Operator Details */}
      <div className="bg-blue-600/20 px-4 py-2 rounded mb-4">
        <h3 className="font-semibold text-lg text-blue-900">
          Pump House Operator Details
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Operator Name</label>
          <input
            className={`border rounded p-2 w-full ${errors.operatorName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Pump House Operator Name (letters, dots, spaces only)"
            value={operatorName}
            onChange={handleOperatorNameChange}
            onKeyPress={handleNameKeyPress}
          />
          {errors.operatorName && (
            <p className="text-red-500 text-sm mt-1">{errors.operatorName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contact Number</label>
          <input
            className={`border rounded p-2 w-full ${errors.contact ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="10-digit Contact Number"
            value={contact}
            onChange={handleContactChange}
            onKeyPress={handleNumberKeyPress}
            maxLength={10}
          />
          {errors.contact && (
            <p className="text-red-500 text-sm mt-1">{errors.contact}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">10 digits, starting with 6, 7, 8, or 9</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
          onClick={resetForm}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default PumpHouseMaster;