import { useEffect, useState } from "react";
import { useUserInfo } from '../utils/userInfo';
import { Calendar, AlertCircle, Zap, User, RefreshCw, Eye, Clock, Droplets, MapPin, CheckCircle } from "lucide-react";

// Define interfaces for pump house data
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

// Define interfaces for the monthly roaster data based on your API
interface MonthlyRoasterData {
  RoasterId: number;
  GPId: number;
  VillageId: number;
  RoasterDate: string;
  ActivityType: string;
  StartDate: string;
  EndDate: string;
  Remark: string;
  PumpId: number;
  Shift1DistributionFrom: string | null;
  Shift1DistributionTo: string | null;
  Shift2DistributionFrom: string | null;
  Shift2DistributionTo: string | null;
  Shift3DistributionFrom: string | null;
  Shift3DistributionTo: string | null;
  Shift1FillingFrom: string | null;
  Shift1FillingTo: string | null;
  Shift2FillingFrom: string | null;
  Shift2FillingTo: string | null;
  Shift3FillingFrom: string | null;
  Shift3FillingTo: string | null;
  DeviceToken: string;
  IPAddress: string;
  Status: number;
  UpdatedDate: string;
}

// API Response interface
interface ApiResponse<T> {
  Data: T;
  Error?: string | null;
  Errror?: string | null;
  Message: string;
  Status: boolean;
}

// Request interface for the monthly API
interface MonthlyRoasterRequest {
  GPId: number;
  VillgeId: number;
  Month: number;
  Year: number;
}

// Statistics interface for dashboard cards
interface RoasterStats {
  totalSchedules: number;
  activeSchedules: number;
  maintenanceSchedules: number;
  avgDistributionHours: number;
}

// Location API functions
// Location API functions
const fetchDistricts = async (userId: number) => {
  try {
    const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetDistrict?UserId=${userId}`, {
      method: 'POST',
      headers: { 'accept': '*/*' },
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.Status ? data.Data : [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
};

const fetchBlocks = async (districtId: number, userRole: string, userId?: number) => {
  try {
    // For Admin, Director, DPRO - use GetAllBlocks
    const isAdminLevelRole = ['admin', 'director', 'dpro'].includes(userRole.toLowerCase());
    
    console.log('Fetching blocks for role:', userRole, 'isAdminLevel:', isAdminLevelRole, 'districtId:', districtId);
    
    let response;
    if (isAdminLevelRole) {
      response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetAllBlocks?DistrictId=${districtId}`, {
        method: 'POST',
        headers: { 'accept': '*/*' }
      });
    } else {
      // For ADO and Gram Panchayat - use GetBlockListByDistrict
      response = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/GetBlockListByDistrict', {
        method: 'POST',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          DistrictId: districtId
        })
      });
    }

    if (response.ok) {
      const data = await response.json();
      console.log('Blocks API response:', data);
      return data.Status ? data.Data : [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return [];
  }
};

const fetchGramPanchayats = async (blockId: number, userRole: string, userId?: number) => {
  try {
    // For Admin, Director, DPRO - use GetAllGramPanchayat
    const isAdminLevelRole = ['admin', 'director', 'dpro'].includes(userRole.toLowerCase());
    
    let response;
    if (isAdminLevelRole) {
      response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetAllGramPanchayat?BlockId=${blockId}`, {
        method: 'POST',
        headers: { 'accept': '*/*' }
      });
    } else {
      // For ADO and Gram Panchayat - use GetGramPanchayatByBlock
      response = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/GetGramPanchayatByBlock', {
        method: 'POST',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          UserId: userId
        })
      });
    }

    if (response.ok) {
      const data = await response.json();
      return data.Status ? data.Data : [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching gram panchayats:', error);
    return [];
  }
};

const fetchVillages = async (blockId: number, gramPanchayatId: number) => {
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
      return data.Status ? data.Data : [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching villages:', error);
    return [];
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

// Fetch monthly roaster data from the correct API
const fetchMonthlyRoasterData = async (requestBody: MonthlyRoasterRequest): Promise<ApiResponse<MonthlyRoasterData[]>> => {
  try {
    const response = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/GetMonthlyRoasterWithSchedule', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching monthly roaster data:', error);
    throw error;
  }
};

// Calculate statistics from roaster data
const calculateStats = (data: MonthlyRoasterData[]): RoasterStats => {
  const totalSchedules = data.length;
  const activeSchedules = data.filter(item => item.Status === 1).length;
  const maintenanceSchedules = data.filter(item => 
    item.ActivityType.toLowerCase().includes('maintenance') || 
    item.ActivityType.toLowerCase().includes('monthly')
  ).length;
  
  const totalDistributionHours = data.reduce((acc, item) => {
    if (item.Status === 1) {
      const shift1Hours = calculateShiftDuration(item.Shift1DistributionFrom, item.Shift1DistributionTo);
      const shift2Hours = calculateShiftDuration(item.Shift2DistributionFrom, item.Shift2DistributionTo);
      const shift3Hours = calculateShiftDuration(item.Shift3DistributionFrom, item.Shift3DistributionTo);
      return acc + shift1Hours + shift2Hours + shift3Hours;
    }
    return acc;
  }, 0);
  
  const avgDistributionHours = activeSchedules > 0 ? totalDistributionHours / activeSchedules : 0;
  
  return {
    totalSchedules,
    activeSchedules,
    maintenanceSchedules,
    avgDistributionHours
  };
};

// Helper function to calculate shift duration
const calculateShiftDuration = (fromTime: string | null, toTime: string | null): number => {
  if (!fromTime || !toTime || fromTime === "00:00:00" || toTime === "00:00:00" || fromTime === "00:00:01") {
    return 0;
  }
  
  const from = new Date(`2000-01-01T${fromTime}`);
  const to = new Date(`2000-01-01T${toTime}`);
  
  if (to <= from) return 0;
  
  return (to.getTime() - from.getTime()) / (1000 * 60 * 60);
};

const ViewRoaster: React.FC = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(() => currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(() => currentDate.getFullYear());
  const [selectedPumpId, setSelectedPumpId] = useState<number | null>(null);
  
  // Location hierarchy states
  const [districts, setDistricts] = useState<District[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayat[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [selectedGramPanchayatId, setSelectedGramPanchayatId] = useState<number | null>(null);
  const [selectedVillageId, setSelectedVillageId] = useState<number | null>(null);
  
  // Data states
  const [pumpHouses, setPumpHouses] = useState<PumpHouseData[]>([]);
  const [uniquePumpHouses, setUniquePumpHouses] = useState<PumpHouseData[]>([]);
  const [monthlyRoasterData, setMonthlyRoasterData] = useState<MonthlyRoasterData[]>([]);
  const [roasterStats, setRoasterStats] = useState<RoasterStats>({
    totalSchedules: 0,
    activeSchedules: 0,
    maintenanceSchedules: 0,
    avgDistributionHours: 0
  });
  const [ohtData, setOhtData] = useState<any>(null);
  
  // UI states
  const [loading, setLoading] = useState<boolean>(false);
  const [pumpHouseLoading, setPumpHouseLoading] = useState<boolean>(false);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [ohtLoading, setOhtLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [filterActivity, setFilterActivity] = useState<string>('all');

  // Use the userInfo hook instead of hardcoded userId
  const { userId, role } = useUserInfo();


  // Fetch districts on component mount - wait for userId
useEffect(() => {
  if (!userId) return;
  
  const loadDistricts = async () => {
    setLocationLoading(true);
    try {
      const districtData = await fetchDistricts(userId);
      setDistricts(districtData || []);
      
      // Auto-select first district if only one
      if (districtData && districtData.length === 1) {
        setSelectedDistrictId(districtData[0].DistrictId);
      }
    } catch (err) {
      console.error('Error loading districts:', err);
      setError('Failed to load districts. Please refresh and try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  loadDistricts();
}, [userId]);

  // Fetch pump houses when userId is available
  useEffect(() => {
    if (!userId) return;
    
    const loadPumpHouses = async () => {
      setPumpHouseLoading(true);
      
      try {
        const pumpResponse = await fetchPumpHouses(userId);
        
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

      } catch (err) {
        console.error('Error loading pump houses:', err);
        setError('Failed to load pump houses. Please refresh and try again.');
      } finally {
        setPumpHouseLoading(false);
      }
    };

    loadPumpHouses();
  }, [userId]);

  // Fetch blocks when userId is available (no longer dependent on district selection)
// Fetch blocks when userId, role, and district are available
  useEffect(() => {
    if (!userId || !role || !selectedDistrictId) return;
    
    console.log('Loading blocks - userId:', userId, 'role:', role, 'districtId:', selectedDistrictId);
    
    const loadBlocks = async () => {
      try {
        const blockData = await fetchBlocks(selectedDistrictId, role, userId);
        console.log('Block data received:', blockData);
        setBlocks(blockData || []);
        
        // Reset dependent selections
        setSelectedBlockId(null);
        setSelectedGramPanchayatId(null);
        setSelectedVillageId(null);
        
        // Auto-select first block if only one
        if (blockData && blockData.length === 1) {
          setSelectedBlockId(blockData[0].BlockId);
        }
      } catch (err) {
        console.error('Error fetching blocks:', err);
      }
    };
    
    loadBlocks();
  }, [userId, role, selectedDistrictId]);

  // Fetch gram panchayats when userId is available (no longer dependent on block selection)
// Fetch gram panchayats when userId, role, and block are available
  useEffect(() => {
    if (!userId || !role || !selectedBlockId) return;
    
    const loadGramPanchayats = async () => {
      try {
        const gpData = await fetchGramPanchayats(selectedBlockId, role, userId);
        
        // For non-admin roles, filter by selected block since API returns all GPs for user
        const isAdminLevelRole = ['admin', 'director', 'dpro'].includes(role.toLowerCase());
        const filteredGpData = isAdminLevelRole 
          ? gpData 
          : (gpData || []).filter(gp => gp.BlockId === selectedBlockId);
        
        setGramPanchayats(filteredGpData || []);
        
        // Reset dependent selections
        setSelectedGramPanchayatId(null);
        setSelectedVillageId(null);
        
        // Auto-select first GP if only one
        if (filteredGpData && filteredGpData.length === 1) {
          setSelectedGramPanchayatId(filteredGpData[0].Id);
        }
      } catch (err) {
        console.error('Error fetching gram panchayats:', err);
      }
    };
    
    loadGramPanchayats();
  }, [userId, role, selectedBlockId]);

  // Fetch villages when block and gram panchayat are selected
  useEffect(() => {
    if (selectedBlockId && selectedGramPanchayatId) {
      const loadVillages = async () => {
        try {
          const villageData = await fetchVillages(selectedBlockId, selectedGramPanchayatId);
          setVillages(villageData || []);
          
          // Reset village selection
          setSelectedVillageId(null);
          
          // Auto-select first village if only one
          if (villageData && villageData.length === 1) {
            setSelectedVillageId(villageData[0].Id);
          }
        } catch (err) {
          console.error('Error fetching villages:', err);
        }
      };
      loadVillages();
    } else {
      setVillages([]);
      setSelectedVillageId(null);
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

  // Fetch monthly roaster data
  const loadMonthlyRoasterData = async (): Promise<void> => {
    if (!selectedMonth || !selectedYear || !selectedPumpId || !selectedVillageId || !selectedGramPanchayatId) return;

    setLoading(true);
    setError('');

    try {
      const requestBody: MonthlyRoasterRequest = {
        GPId: selectedGramPanchayatId,
        VillgeId: selectedVillageId,
        Month: selectedMonth,
        Year: selectedYear
      };

      console.log('Fetching monthly roaster data with payload:', requestBody);

      const response = await fetchMonthlyRoasterData(requestBody);
      
      console.log('Monthly roaster API response:', response);
      
      if (response && response.Status && Array.isArray(response.Data)) {
        setMonthlyRoasterData(response.Data);
        setRoasterStats(calculateStats(response.Data));
      } else {
        setMonthlyRoasterData([]);
        setRoasterStats({ totalSchedules: 0, activeSchedules: 0, maintenanceSchedules: 0, avgDistributionHours: 0 });
        if (response && !response.Status) {
          setError(response.Message || 'Failed to fetch data');
        }
      }

    } catch (err: unknown) {
      console.error("Error fetching monthly roaster data:", err);
      if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError('Failed to fetch monthly roaster data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Effect for monthly data - only load when all required data is selected
  useEffect(() => {
    if (selectedPumpId && selectedVillageId && selectedGramPanchayatId) {
      loadMonthlyRoasterData();
    }
  }, [selectedMonth, selectedYear, selectedPumpId, selectedVillageId, selectedGramPanchayatId]);

  const getMonthName = (month: number): string => {
    const months: string[] = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || '';
  };

  const formatTime = (timeString: string | null): string => {
    if (!timeString || timeString === '00:00:00' || timeString === '00:00:01') return 'Not Set';
    return timeString.substring(0, 5);
  };

  const formatDate = (dateString: string): string => {
    try {
      // Handle DD-MM-YYYY format from API
      if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
        const [day, month, year] = dateString.split('-');
        const date = new Date(`${year}-${month}-${day}`);
        return date.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        });
      }
      // Handle ISO format
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
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

  const getActivityBadgeClass = (activityType: string): string => {
    if (activityType.toLowerCase().includes('maintenance')) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    if (activityType.toLowerCase().includes('monthly')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  // Filter monthly data based on activity type
  const filteredMonthlyData = monthlyRoasterData.filter(item => {
    if (filterActivity === 'all') return true;
    if (filterActivity === 'monthly') return item.ActivityType.toLowerCase().includes('monthly');
    if (filterActivity === 'maintenance') return item.ActivityType.toLowerCase().includes('maintenance');
    return item.ActivityType.toLowerCase().includes(filterActivity.toLowerCase());
  });

  const selectedPumpDetails = uniquePumpHouses.find(p => p.PumpId === selectedPumpId);

  // Event handlers
  const refreshData = () => {
    console.log('Refresh button clicked!');
    setError('');
    loadMonthlyRoasterData();
  };

  const handlePumpSelect = (pumpId: number) => {
    console.log('Pump card clicked! Pump ID:', pumpId);
    setSelectedPumpId(pumpId);
    setError('');
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = Number(e.target.value);
    console.log('Month changed to:', newMonth);
    setSelectedMonth(newMonth);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = Number(e.target.value);
    console.log('Year changed to:', newYear);
    setSelectedYear(newYear);
  };

  const handleActivityFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilter = e.target.value;
    console.log('Activity filter changed to:', newFilter);
    setFilterActivity(newFilter);
  };

  // Show loading state while userId is being fetched
  if (!userId) {
    return (
      <div className="w-full bg-gray-50 relative z-10">
        <div className="p-4 md:p-6 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading user information...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 relative z-10">
        <div className="p-4 md:p-6 space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 md:p-6 shadow-lg text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Water Management System</h1>
                <p className="text-blue-100">
                  View and monitor pump house roaster schedules and operations
                </p>
              </div>
              <div className="text-left md:text-right">
                <div className="text-sm text-blue-200">Current Date</div>
                <div className="text-lg font-semibold">
                  {new Date().toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 shadow-sm">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold">Error</div>
                <div className="text-sm">{error}</div>
              </div>
              <button
                onClick={() => setError('')}
                className="text-red-500 hover:text-red-700 text-xl font-bold transition-colors"
              >
                ×
              </button>
            </div>
          )}

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
                    onChange={(e) => {
  setSelectedDistrictId(Number(e.target.value) || null);
  // Reset dependent filters when district changes
  setBlocks([]);
  setSelectedBlockId(null);
  setGramPanchayats([]);
  setSelectedGramPanchayatId(null);
  setVillages([]);
  setSelectedVillageId(null);
}}
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
                    onChange={(e) => {
  setSelectedBlockId(Number(e.target.value) || null);
  // Reset dependent filters when block changes
  setGramPanchayats([]);
  setSelectedGramPanchayatId(null);
  setVillages([]);
  setSelectedVillageId(null);
}}
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
                    onChange={(e) => {
  setSelectedGramPanchayatId(Number(e.target.value) || null);
  // Reset village filter when gram panchayat changes
  setVillages([]);
  setSelectedVillageId(null);
}}
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

          {/* Filters and Controls - Only show if pump and village are selected */}
          {selectedPumpId && selectedVillageId && (
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Title */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <span className="text-xl font-semibold text-gray-800">Monthly Roaster Schedule</span>
                  </div>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={refreshData}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Data
                </button>
              </div>

              {/* Filters */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-medium text-gray-700 mb-2">Month</label>
                    <select
                      value={selectedMonth}
                      onChange={handleMonthChange}
                      className="border border-gray-300 rounded-lg px-3 py-2 w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Array.from({length: 12}, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {getMonthName(i + 1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-2">Year</label>
                    <select
                      value={selectedYear}
                      onChange={handleYearChange}
                      className="border border-gray-300 rounded-lg px-3 py-2 w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Array.from({length: 5}, (_, i) => {
                        const year = new Date().getFullYear() + i - 2;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  
                </div>
              </div>

              {/* Requirements Info */}
              {(!selectedPumpId || !selectedVillageId) && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                  <div className="font-medium text-blue-800 mb-1">Selection Requirements:</div>
                  <div className="text-blue-700 space-y-1">
                    <div className={`flex items-center gap-2 ${selectedVillageId ? 'text-green-700' : 'text-red-700'}`}>
                      {selectedVillageId ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      Village must be selected
                    </div>
                    <div className={`flex items-center gap-2 ${selectedPumpId ? 'text-green-700' : 'text-red-700'}`}>
                      {selectedPumpId ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      Pump house must be selected
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Statistics Cards */}
          {selectedPumpId && selectedVillageId && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{roasterStats.totalSchedules}</div>
                    <div className="text-sm font-medium text-gray-700">Total Roasters</div>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600 opacity-60" />
                </div>
              </div>
              
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{roasterStats.activeSchedules}</div>
                    <div className="text-sm font-medium text-gray-700">Active Roasters</div>
                  </div>
                  <Droplets className="w-8 h-8 text-green-600 opacity-60" />
                </div>
              </div>
              
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{roasterStats.maintenanceSchedules}</div>
                    <div className="text-sm font-medium text-gray-700">Monthly Schedules</div>
                  </div>
                  <Zap className="w-8 h-8 text-orange-600 opacity-60" />
                </div>
              </div>
              
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{roasterStats.avgDistributionHours.toFixed(1)}</div>
                    <div className="text-sm font-medium text-gray-700">Avg Hours/Day</div>
                  </div>
                  <Clock className="w-8 h-8 text-purple-600 opacity-60" />
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white p-8 rounded-lg shadow-sm border">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 text-lg">Loading roaster data...</span>
              </div>
            </div>
          )}

          {/* Monthly Roaster Data */}
          {!loading && selectedPumpId && selectedVillageId && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-6 h-6" />
                      <h2 className="text-xl font-semibold">
                        Monthly Roaster Schedule - {getMonthName(selectedMonth)} {selectedYear}
                      </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4">
                      <span className="bg-blue-500 bg-opacity-50 text-blue-100 px-3 py-1 rounded-full text-sm">
                        Pump #{selectedPumpId}
                      </span>
                      <span className="bg-blue-500 bg-opacity-50 text-blue-100 px-3 py-1 rounded-full text-sm">
                        Village #{selectedVillageId}
                      </span>
                      <span className="bg-blue-500 bg-opacity-50 text-blue-100 px-3 py-1 rounded-full text-sm">
                        {filteredMonthlyData.length} records
                      </span>
                    </div>
                  </div>
                </div>
                
                {filteredMonthlyData.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No roaster data found</p>
                    <p className="text-sm">No monthly roaster data found for the selected criteria.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left p-3 md:p-4 font-semibold text-gray-700">Roaster Date</th>
                          <th className="text-left p-3 md:p-4 font-semibold text-gray-700">Duration</th>
                          <th className="text-left p-3 md:p-4 font-semibold text-gray-700">Filling Shifts</th>
                          <th className="text-left p-3 md:p-4 font-semibold text-gray-700">Distribution Shifts</th>
                          <th className="text-left p-3 md:p-4 font-semibold text-gray-700">Remark</th>
                          <th className="text-left p-3 md:p-4 font-semibold text-gray-700">Status</th>
                          <th className="text-left p-3 md:p-4 font-semibold text-gray-700">Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMonthlyData.map((item, index) => (
                          <tr key={item.RoasterId || index} className="bg-white hover:bg-gray-50 border-b border-gray-100 transition-colors">
                            <td className="p-3 md:p-4 font-medium text-gray-900">
                              {formatDate(item.RoasterDate)}
                            </td>
                            
                            <td className="p-3 md:p-4 text-gray-700">
                              <div className="text-xs">
                                <div><strong>From:</strong> {formatDate(item.StartDate)}</div>
                                <div><strong>To:</strong> {formatDate(item.EndDate)}</div>
                              </div>
                            </td>
                            <td className="p-3 md:p-4">
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="w-16 font-medium text-gray-600">Shift 1:</span>
                                  <span className="text-gray-900">{formatTime(item.Shift1FillingFrom)} - {formatTime(item.Shift1FillingTo)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-16 font-medium text-gray-600">Shift 2:</span>
                                  <span className="text-gray-900">{formatTime(item.Shift2FillingFrom)} - {formatTime(item.Shift2FillingTo)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-16 font-medium text-gray-600">Shift 3:</span>
                                  <span className="text-gray-900">{formatTime(item.Shift3FillingFrom)} - {formatTime(item.Shift3FillingTo)}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 md:p-4">
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="w-16 font-medium text-gray-600">Shift 1:</span>
                                  <span className="text-gray-900">{formatTime(item.Shift1DistributionFrom)} - {formatTime(item.Shift1DistributionTo)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-16 font-medium text-gray-600">Shift 2:</span>
                                  <span className="text-gray-900">{formatTime(item.Shift2DistributionFrom)} - {formatTime(item.Shift2DistributionTo)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-16 font-medium text-gray-600">Shift 3:</span>
                                  <span className="text-gray-900">{formatTime(item.Shift3DistributionFrom)} - {formatTime(item.Shift3DistributionTo)}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 md:p-4 text-gray-700 max-w-xs">
                              <div className="truncate" title={item.Remark}>
                                {item.Remark || 'N/A'}
                              </div>
                            </td>
                            <td className="p-3 md:p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(item.Status)}`}>
                                {getStatusText(item.Status)}
                              </span>
                            </td>
                            <td className="p-3 md:p-4 text-gray-600 text-xs">
                              {formatDate(item.UpdatedDate)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default ViewRoaster;