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

  const [saving, setSaving] = useState(false);

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
  };

  const handlePumpChange = (index: number, field: keyof Pump, value: string) => {
    const updated = [...pumps];
    updated[index] = { ...updated[index], [field]: value };
    setPumps(updated);
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

  // Minimal validation
  const validate = () => {
    if (!villageId) {
      alert("Please select a village.");
      return false;
    }
    if (!ohtCapacity || Number(ohtCapacity) <= 0) {
      alert("Please enter a valid OHT Capacity.");
      return false;
    }
    if (!operatorName.trim()) {
      alert("Please enter Operator Name.");
      return false;
    }
    if (!contact.trim()) {
      alert("Please enter Contact Number.");
      return false;
    }
    for (let i = 0; i < pumps.length; i++) {
      const p = pumps[i];
      if (!p.horsepower || Number(p.horsepower) <= 0) {
        alert(`Please enter a valid horsepower for Pump-${i + 1}.`);
        return false;
      }
      if (!p.powerSource) {
        alert(`Please select power source for Pump-${i + 1}.`);
        return false;
      }
    }
    return true;
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
          <label className="block text-sm font-medium mb-1">Block</label>
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
            OHT Capacity (Litres)
          </label>
          <input
            className="border rounded p-2 w-full"
            placeholder="OHT Capacity (Litres)"
            value={ohtCapacity}
            onChange={(e) => setOhtCapacity(e.target.value)}
            inputMode="numeric"
          />
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
                Horsepower (HP)
              </label>
              <input
                className="border rounded p-2 w-full"
                placeholder="Capacity (HP)"
                value={pump.horsepower}
                onChange={(e) => handlePumpChange(index, "horsepower", e.target.value)}
              />
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
            className="border rounded p-2 w-full"
            placeholder="Pump House Operator Name"
            value={operatorName}
            onChange={(e) => setOperatorName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contact Number</label>
          <input
            className="border rounded p-2 w-full"
            placeholder="Pump House Operator Contact Number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
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
          onClick={() => {
            setNumPumps(1);
            setPumps([{ horsepower: "", powerSource: "", solarOutput: "", status: "" }]);
            // keep other fields as-is
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default PumpHouseMaster;
