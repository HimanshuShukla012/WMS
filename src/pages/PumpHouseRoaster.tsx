// src/pages/PumpHouseRoaster.tsx
import { useState, useEffect } from "react";
import { Calendar, Save, Plus, Eye, Edit, Trash2, CheckCircle, AlertCircle, Zap, User, MapPin } from "lucide-react";
import { useUserInfo } from '../utils/userInfo';
import DistributionRoaster from "../components/DistributionRoaster";
import FillingRoaster from "../components/FillingRoaster";

interface RoasterData {
  id: string;
  month: string;
  year: string;
  date: string;
  fillingData: any;
  distributionData: any;
  createdAt: string;
  status: 'draft' | 'saved';
  pumpId: number;
  villageId: number;
}

interface TimeSlot {
  Hour: number;
  Minute: number;
}

// Interface for pump house data (from ViewRoaster component)
interface PumpHouseData {
  OhtId: number;
  OperatorName: string;
  Contact: string;
  PumpId: number;
  HorsePower: string;
  PowerSource: string;
  SolarOutput: number;
  Status: number;
}

// Location hierarchy interfaces
interface District {
  DistrictId: number;
  DistrictName: string;
}

interface Block {
  BlockId: number;
  BlockName: string;
  Id: number;
  DistrictId: number;
}

interface GramPanchayat {
  Id: number;
  GramPanchayatName: string;
  BlockId: number;
}

interface Village {
  Id: number;
  GramPanchayatId: number;
  VillageName: string;
  VillageNameHindi: string;
}

// API Response interface
interface ApiResponse<T> {
  Data: T;
  Error?: string | null;
  Errror?: string | null;
  Message: string;
  Status: boolean;
}

interface ApiPayload {
  GPId: number;
  VillageId: number;
  RoasterDate: string;
  ActivityType: string;
  StartDate: string;
  EndDate: string;
  Remark: string;
  CreatedBy: number;
  PumpId: number;
  DistributionShift1FromTime: string;
  DistributionShift1ToTime: string;
  DistributionShift2FromTime: string;
  DistributionShift2ToTime: string;
  DistributionShift3FromTime: string;
  DistributionShift3ToTime: string;
  FillingShift1FromTime: string;
  FillingShift1ToTime: string;
  FillingShift2FromTime: string;
  FillingShift2ToTime: string;
  FillingShift3FromTime: string;
  FillingShift3ToTime: string;
  UpdatedBy: number;
  DeviceToken: string;
  IPAddress: string;
  uparm: string;
}

// Location API functions
const fetchDistricts = async (userId: number): Promise<ApiResponse<District[]>> => {
  try {
    const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetDistrict?UserId=${userId}`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching districts:', error);
    throw error;
  }
};

const fetchBlocks = async (userId: number): Promise<ApiResponse<Block[]>> => {
  try {
    const response = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/GetBlockListByDistrict', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        UserId: userId
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching blocks:', error);
    throw error;
  }
};

const fetchGramPanchayats = async (userId: number): Promise<ApiResponse<GramPanchayat[]>> => {
  try {
    const response = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/GetGramPanchayatByBlock', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        UserId: userId
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching gram panchayats:', error);
    throw error;
  }
};

const fetchVillages = async (blockId: number, gramPanchayatId: number): Promise<ApiResponse<Village[]>> => {
  try {
    const response = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/GetVillegeByGramPanchayat', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BlockId: blockId,
        GramPanchayatId: gramPanchayatId
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching villages:', error);
    throw error;
  }
};

// Fetch pump houses for the current user
const fetchPumpHouses = async (userId: number): Promise<ApiResponse<PumpHouseData[]>> => {
  try {
    const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetPumpHouseListByUserId?UserId=${userId}`, {
      method: 'GET',
      headers: {
        'accept': '*/*',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching pump houses:', error);
    throw error;
  }
};

// Fetch OHT details by VillageId
const fetchOhtDetails = async (villageId: number) => {
  try {
    const response = await fetch(
      `https://wmsapi.kdsgroup.co.in/api/Master/GetOHTByVillageId?VillageId=${villageId}`,
      { method: 'GET', headers: { 'accept': '*/*' } }
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.Status) {
        return data.Data;
      } else {
        return null;
      }
    } else {
      console.error('Failed to fetch OHT details');
      return null;
    }
  } catch (err) {
    console.error('Error fetching OHT details:', err);
    return null;
  }
};

const PumpHouseRoaster = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentMode, setCurrentMode] = useState<'create' | 'view'>('view');
  const [savedRoasters, setSavedRoasters] = useState<RoasterData[]>([]);
  const [currentRoaster, setCurrentRoaster] = useState<RoasterData | null>(null);
  const [fillingData, setFillingData] = useState<any>(null);
  const [distributionData, setDistributionData] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Pump house selection states
  const [pumpHouses, setPumpHouses] = useState<PumpHouseData[]>([]);
  const [uniquePumpHouses, setUniquePumpHouses] = useState<PumpHouseData[]>([]);
  const [selectedPumpId, setSelectedPumpId] = useState<number | null>(null);
  const [pumpHouseLoading, setPumpHouseLoading] = useState<boolean>(false);

  // Location hierarchy states
  const [districts, setDistricts] = useState<District[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayat[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [selectedGramPanchayatId, setSelectedGramPanchayatId] = useState<number | null>(null);
  const [selectedVillageId, setSelectedVillageId] = useState<number | null>(null);

  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [ohtData, setOhtData] = useState<any>(null);
  const [ohtLoading, setOhtLoading] = useState<boolean>(false);

  // Use the userInfo hook
  const { userId } = useUserInfo();

  // Initialize with current month/year
  useEffect(() => {
    const now = new Date();
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = now.getFullYear().toString();
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
    
    // Load saved roasters from storage
    loadSavedRoasters();
  }, []);

  // Fetch pump houses and location data when userId is available
  useEffect(() => {
    if (!userId) return;
    
    const loadInitialData = async () => {
      setPumpHouseLoading(true);
      setLocationLoading(true);
      
      try {
        // Load pump houses and location hierarchy in parallel
        const [pumpResponse, districtResponse, blockResponse, gpResponse] = await Promise.all([
          fetchPumpHouses(userId),
          fetchDistricts(userId),
          fetchBlocks(userId),
          fetchGramPanchayats(userId)
        ]);
        
        // Handle pump houses
        if (pumpResponse && pumpResponse.Status && Array.isArray(pumpResponse.Data)) {
          setPumpHouses(pumpResponse.Data);
          
          // Create unique pump houses based on PumpId
          const uniqueMap = new Map<number, PumpHouseData>();
          pumpResponse.Data.forEach(pump => {
            if (!uniqueMap.has(pump.PumpId)) {
              uniqueMap.set(pump.PumpId, pump);
            }
          });
          const uniquePumps = Array.from(uniqueMap.values());
          setUniquePumpHouses(uniquePumps);
          
          // Auto-select first active pump or first pump
          const activePumps = uniquePumps.filter(pump => pump.Status === 1);
          if (activePumps.length > 0) {
            setSelectedPumpId(activePumps[0].PumpId);
          } else if (uniquePumps.length > 0) {
            setSelectedPumpId(uniquePumps[0].PumpId);
          }
        }

        // Handle location hierarchy
        if (districtResponse && districtResponse.Status) {
          setDistricts(districtResponse.Data);
          // Auto-select first district if only one
          if (districtResponse.Data.length === 1) {
            setSelectedDistrictId(districtResponse.Data[0].DistrictId);
          }
        }

        if (blockResponse && blockResponse.Status) {
          setBlocks(blockResponse.Data);
          // Auto-select first block if only one
          if (blockResponse.Data.length === 1) {
            setSelectedBlockId(blockResponse.Data[0].BlockId);
          }
        }

        if (gpResponse && gpResponse.Status) {
          setGramPanchayats(gpResponse.Data);
          // Auto-select first GP if only one
          if (gpResponse.Data.length === 1) {
            setSelectedGramPanchayatId(gpResponse.Data[0].Id);
          }
        }

      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load data. Please refresh and try again.');
      } finally {
        setPumpHouseLoading(false);
        setLocationLoading(false);
      }
    };

    loadInitialData();
  }, [userId]);

  // Fetch villages when block and gram panchayat are selected
  useEffect(() => {
    if (selectedBlockId && selectedGramPanchayatId) {
      const loadVillages = async () => {
        try {
          const response = await fetchVillages(selectedBlockId, selectedGramPanchayatId);
          if (response && response.Status) {
            setVillages(response.Data);
            // Auto-select first village if only one
            if (response.Data.length === 1) {
              setSelectedVillageId(response.Data[0].Id);
            }
          }
        } catch (err) {
          console.error('Error fetching villages:', err);
        }
      };
      loadVillages();
    }
  }, [selectedBlockId, selectedGramPanchayatId]);

  // Fetch OHT details when village is selected
  useEffect(() => {
    if (selectedVillageId) {
      const loadOhtData = async () => {
        setOhtLoading(true);
        try {
          const data = await fetchOhtDetails(selectedVillageId);
          setOhtData(data);
        } catch (err) {
          console.error('Error fetching OHT data:', err);
          setOhtData(null);
        } finally {
          setOhtLoading(false);
        }
      };
      loadOhtData();
    }
  }, [selectedVillageId]);

  const loadSavedRoasters = () => {
    // In a real app, this would be an API call
    const saved = JSON.parse(localStorage.getItem('pumpHouseRoasters') || '[]');
    setSavedRoasters(saved);
  };

  // Helper function to convert time string to TimeOnly format (HH:MM:SS)
  const timeStringToTimeOnly = (timeString: string): string => {
    if (!timeString) return "00:00:00";
    // Add seconds if not present (HH:MM -> HH:MM:SS)
    return timeString.includes(':') && timeString.split(':').length === 2 
      ? `${timeString}:00` 
      : timeString;
  };

  // Helper function to get user's IP address
  const getUserIPAddress = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Failed to get IP address:', error);
      return '0.0.0.0';
    }
  };


  // Helper function to check if at least one shift is completely filled
  const isAtLeastOneShiftComplete = (data: any): boolean => {
    if (!data) return false;
    
    const shifts = [
      { from: data.morningFrom, to: data.morningTo },
      { from: data.afternoonFrom, to: data.afternoonTo },
      { from: data.eveningFrom, to: data.eveningTo }
    ];
    
    return shifts.some(shift => shift.from && shift.to && shift.from.trim() !== '' && shift.to.trim() !== '');
  };

  const saveRoaster = async () => {
    if (!selectedDate || !fillingData || !distributionData) {
      setError('Please fill in all roaster data before saving.');
      return;
    }

    if (!isAtLeastOneShiftComplete(fillingData)) {
      setError('Please complete at least one filling shift (both from and to times) before saving.');
      return;
    }

    if (!isAtLeastOneShiftComplete(distributionData)) {
      setError('Please complete at least one distribution shift (both from and to times) before saving.');
      return;
    }

    if (!selectedPumpId || !userId || !selectedVillageId) {
      setError('Please select a pump house and village before saving.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Get user's IP address
      const ipAddress = await getUserIPAddress();
      
      // Prepare the API payload with real data
      const apiPayload: ApiPayload = {
        GPId: selectedGramPanchayatId || 0,
        VillageId: selectedVillageId,
        RoasterDate: selectedDate,
        ActivityType: "Monthly Roaster",
        StartDate: `${selectedDate}T00:00:00.000Z`,
        EndDate: `${selectedDate}T23:59:59.999Z`,
        Remark: `Monthly roaster for ${getMonthName(selectedMonth)} ${selectedYear}`,
        CreatedBy: userId,
        PumpId: selectedPumpId,
        
        // Distribution shifts (Morning, Afternoon, Evening) - using TimeOnly format
        DistributionShift1FromTime: timeStringToTimeOnly(distributionData.morningFrom),
        DistributionShift1ToTime: timeStringToTimeOnly(distributionData.morningTo),
        DistributionShift2FromTime: timeStringToTimeOnly(distributionData.afternoonFrom),
        DistributionShift2ToTime: timeStringToTimeOnly(distributionData.afternoonTo),
        DistributionShift3FromTime: timeStringToTimeOnly(distributionData.eveningFrom),
        DistributionShift3ToTime: timeStringToTimeOnly(distributionData.eveningTo),
        
        // Filling shifts (Morning, Afternoon, Evening) - using TimeOnly format
        FillingShift1FromTime: timeStringToTimeOnly(fillingData.morningFrom),
        FillingShift1ToTime: timeStringToTimeOnly(fillingData.morningTo),
        FillingShift2FromTime: timeStringToTimeOnly(fillingData.afternoonFrom),
        FillingShift2ToTime: timeStringToTimeOnly(fillingData.afternoonTo),
        FillingShift3FromTime: timeStringToTimeOnly(fillingData.eveningFrom),
        FillingShift3ToTime: timeStringToTimeOnly(fillingData.eveningTo),
        
        UpdatedBy: userId,
        DeviceToken: "web-app-roaster",
        IPAddress: ipAddress,
        uparm: "monthly-roaster-save"
      };

      // Make real API call
      const apiUrl = 'https://wmsapi.kdsgroup.co.in/api/Master/InsertMonthlyRoasterWithSchedule';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload)
      });

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status} - ${response.statusText}`;
        try {
          const errorBody = await response.text();
          if (errorBody) {
            errorMessage += `\nDetails: ${errorBody}`;
          }
        } catch (e) {
          console.log('Could not read error response body');
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Save locally as backup/cache with real data
      const newRoaster: RoasterData = {
        id: result?.id?.toString() || Date.now().toString(),
        month: selectedMonth,
        year: selectedYear,
        date: selectedDate,
        fillingData,
        distributionData,
        createdAt: new Date().toISOString(),
        status: 'saved',
        pumpId: selectedPumpId,
        villageId: selectedVillageId
      };

      const updatedRoasters = [...savedRoasters, newRoaster];
      setSavedRoasters(updatedRoasters);
      localStorage.setItem('pumpHouseRoasters', JSON.stringify(updatedRoasters));
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Reset form
      setSelectedDate("");
      setFillingData(null);
      setDistributionData(null);
      
    } catch (error) {
      console.error('Error saving roaster:', error);
      setError(error instanceof Error ? error.message : 'Failed to save roaster. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  

  const viewRoaster = (roaster: RoasterData) => {
    setCurrentMode('view');
    setCurrentRoaster(roaster);
    setSelectedDate(roaster.date);
  };

  const startNewRoaster = () => {
    setCurrentMode('create');
    setCurrentRoaster(null);
    setSelectedDate("");
    setFillingData(null);
    setDistributionData(null);
  };

  const getMonthName = (month: string) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[parseInt(month) - 1] || '';
  };

  const getPowerSourceText = (powerSource: string): string => {
    switch (powerSource) {
      case '1': return 'Electric';
      case '2': return 'Solar';
      default: return 'Unknown';
    }
  };

  const getStatusText = (status: number): string => {
    return status === 1 ? 'Active' : 'Inactive';
  };

  const getStatusBadgeClass = (status: number): string => {
    return status === 1 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const filteredRoasters = savedRoasters.filter(r => 
    r.month === selectedMonth && r.year === selectedYear && 
    (!selectedPumpId || r.pumpId === selectedPumpId)
  );

  const isRoasterExistForDate = (date: string) => {
    return filteredRoasters.some(r => r.date === date);
  };

  const selectedPumpDetails = uniquePumpHouses.find(p => p.PumpId === selectedPumpId);

  // Show loading state while userId is being fetched
  if (!userId) {
    return (
      <div className="p-6 space-y-6 relative z-10">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading user information...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 relative z-10">
      {/* Success Message - CENTERED */}
{showSuccess && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div className="bg-green-100 border-2 border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 max-w-md">
      <CheckCircle className="w-6 h-6 flex-shrink-0" />
      <span className="font-semibold text-lg">Roaster saved successfully!</span>
    </div>
  </div>
)}

{/* Error Message - CENTERED */}
{error && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-xl max-w-md">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold text-lg mb-1">Error</div>
          <div className="text-sm">{error}</div>
        </div>
        <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 text-2xl font-bold leading-none ml-2">×</button>
      </div>
    </div>
  </div>
)}
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 shadow-lg text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Create Pump House Roaster</h1>
            <p className="text-blue-100">
              Create and manage monthly water distribution and filling schedules
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-200">User ID</div>
            <div className="text-lg font-semibold">{userId}</div>
          </div>
        </div>
      </div>

      {/* Location Selection */}
      {!locationLoading && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">Select Location</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* District Selection */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">District</label>
              <select
                value={selectedDistrictId || ''}
                onChange={(e) => setSelectedDistrictId(Number(e.target.value) || null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select District</option>
                {districts.map((district) => (
                  <option key={district.DistrictId} value={district.DistrictId}>
                    {district.DistrictName}
                  </option>
                ))}
              </select>
            </div>

            {/* Block Selection */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">Block</label>
              <select
                value={selectedBlockId || ''}
                onChange={(e) => setSelectedBlockId(Number(e.target.value) || null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!selectedDistrictId}
              >
                <option value="">Select Block</option>
                {blocks.map((block) => (
                  <option key={block.BlockId} value={block.BlockId}>
                    {block.BlockName}
                  </option>
                ))}
              </select>
            </div>

            {/* Gram Panchayat Selection */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">Gram Panchayat</label>
              <select
                value={selectedGramPanchayatId || ''}
                onChange={(e) => setSelectedGramPanchayatId(Number(e.target.value) || null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!selectedBlockId}
              >
                <option value="">Select Gram Panchayat</option>
                {gramPanchayats.map((gp) => (
                  <option key={gp.Id} value={gp.Id}>
                    {gp.GramPanchayatName}
                  </option>
                ))}
              </select>
            </div>

            {/* Village Selection */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">Village</label>
              <select
                value={selectedVillageId || ''}
                onChange={(e) => setSelectedVillageId(Number(e.target.value) || null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!selectedGramPanchayatId}
              >
                <option value="">Select Village</option>
                {villages.map((village) => (
                  <option key={village.Id} value={village.Id}>
                    {village.VillageName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Location Summary */}
          {selectedVillageId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="font-medium text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Selected Location
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">District:</span>
                  <div className="text-gray-900 font-semibold">
                    {districts.find(d => d.DistrictId === selectedDistrictId)?.DistrictName}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Block:</span>
                  <div className="text-gray-900 font-semibold">
                    {blocks.find(b => b.BlockId === selectedBlockId)?.BlockName}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Gram Panchayat:</span>
                  <div className="text-gray-900 font-semibold">
                    {gramPanchayats.find(gp => gp.Id === selectedGramPanchayatId)?.GramPanchayatName}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Village:</span>
                  <div className="text-gray-900 font-semibold">
                    {villages.find(v => v.Id === selectedVillageId)?.VillageName}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      
      {/* Pump House Loading State */}
      {pumpHouseLoading && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading your pump houses...</span>
          </div>
        </div>
      )}

      {/* Pump House Selection */}
      {!pumpHouseLoading && uniquePumpHouses.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Select Pump House</h2>
            </div>
            <div className="text-sm text-gray-500">
              {uniquePumpHouses.length} pump house(s) available
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {uniquePumpHouses.map((pump) => (
              <div
                key={pump.PumpId}
                onClick={() => setSelectedPumpId(pump.PumpId)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md text-left w-full ${
                  selectedPumpId === pump.PumpId
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="font-semibold text-lg text-gray-800">Pump #{pump.PumpId}</div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeClass(pump.Status)}`}>
                    {getStatusText(pump.Status)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{pump.OperatorName && pump.OperatorName !== '0' ? pump.OperatorName : 'No operator assigned'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>{pump.HorsePower} HP ({getPowerSourceText(pump.PowerSource)})</span>
                  </div>
                  {pump.SolarOutput > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                      <span>Solar: {pump.SolarOutput} kW</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Pump Details */}
          {selectedPumpDetails && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Selected Pump House Details
              </div>
              
              {/* Pump House Information */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Pump ID:</span>
                  <div className="text-gray-900 font-semibold">{selectedPumpDetails.PumpId}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">OHT ID:</span>
                  <div className="text-gray-900 font-semibold">{selectedPumpDetails.OhtId}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Horse Power:</span>
                  <div className="text-gray-900 font-semibold">{selectedPumpDetails.HorsePower} HP</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Contact:</span>
                  <div className="text-gray-900 font-semibold">{selectedPumpDetails.Contact || 'N/A'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Pump Houses Available */}
      {!pumpHouseLoading && uniquePumpHouses.length === 0 && !error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3 text-yellow-800">
            <AlertCircle className="w-6 h-6" />
            <div>
              <div className="font-semibold text-lg">No Pump Houses Assigned</div>
              <div className="text-sm text-yellow-700">No pump houses are currently assigned to your user account. Please contact your administrator.</div>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the component - only show if pump and village are selected */}
      {selectedPumpId && selectedVillageId && (
        <>
          {/* Month/Year Selection */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Select Month & Year
            </h3>
            <div className="flex gap-4 items-center">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="border rounded px-3 py-2 w-48 shadow-sm"
                >
                  <option value="">Select Month</option>
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                      {getMonthName((i + 1).toString().padStart(2, '0'))}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="border rounded px-3 py-2 w-32 shadow-sm"
                >
                  <option value="">Select Year</option>
                  {Array.from({length: 5}, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {selectedMonth && selectedYear && (
            <>
              {/* Mode Toggle */}
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    {getMonthName(selectedMonth)} {selectedYear} Roasters - Pump #{selectedPumpId}
                  </h3>
                  <button
                    onClick={startNewRoaster}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Roaster
                  </button>
                </div>
              </div>

              {/* Saved Roasters List */}
              {filteredRoasters.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <h4 className="font-semibold mb-3">Saved Roasters for {getMonthName(selectedMonth)} {selectedYear}</h4>
                  <div className="space-y-2">
                    {filteredRoasters.map((roaster) => (
                      <div key={roaster.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                        <div>
                          <span className="font-medium">{roaster.date}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            Saved on {new Date(roaster.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-blue-600 ml-2">
                            Pump #{roaster.pumpId}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewRoaster(roaster)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50"
                            title="View Roaster"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Selection for New Roaster */}
              {currentMode === 'create' && (
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <h4 className="font-semibold mb-3">Create New Roaster</h4>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Select Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        if (isRoasterExistForDate(newDate)) {
                          alert('A roaster already exists for this date!');
                          return;
                        }
                        setSelectedDate(newDate);
                      }}
                      min={`${selectedYear}-${selectedMonth}-01`}
                      max={`${selectedYear}-${selectedMonth}-31`}
                      className="border rounded px-3 py-2 w-64 shadow-sm"
                    />
                    {selectedDate && isRoasterExistForDate(selectedDate) && (
                      <div className="flex items-center gap-2 mt-2 text-amber-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">A roaster already exists for this date</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Roaster Forms */}
              {((currentMode === 'create' && selectedDate && !isRoasterExistForDate(selectedDate)) || 
                (currentMode === 'view' && currentRoaster)) && (
                <div className="space-y-6">
                  {/* OHT Filling Roaster */}
                  <div>
                    <h3 className="text-xl font-semibold text-blue-700 mb-2">
                      OHT Filling Roaster
                    </h3>
                    <FillingRoaster 
                      selectedDate={selectedDate} 
                      initialData={currentMode === 'view' ? currentRoaster?.fillingData : undefined}
                      onChange={currentMode === 'create' ? setFillingData : undefined}
                      readOnly={currentMode === 'view'}
                    />
                  </div>

                  {/* Distribution Roaster */}
                  <div>
                    <h3 className="text-xl font-semibold text-blue-700 mb-2">
                      Distribution Roaster
                    </h3>
                    <DistributionRoaster 
                      selectedDate={selectedDate}
                      initialData={currentMode === 'view' ? currentRoaster?.distributionData : undefined}
                      onChange={currentMode === 'create' ? setDistributionData : undefined}
                      readOnly={currentMode === 'view'}
                    />
                  </div>

                  {/* Save Button */}
                  {currentMode === 'create' && (
                    <div className="flex flex-col items-center gap-4">
                      <button
                        onClick={saveRoaster}
                        disabled={isLoading || !selectedPumpId || !selectedVillageId}
                        className={`px-6 py-3 rounded-lg flex items-center gap-2 font-semibold transition-colors ${
                          (!selectedDate || !fillingData || !distributionData || isLoading || !selectedPumpId || !selectedVillageId)
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Save Roaster
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PumpHouseRoaster;