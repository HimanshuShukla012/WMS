// src/pages/PumpHouseRoaster.tsx
import { useState, useEffect } from "react";
import { Calendar, Save, Plus, Eye, Edit, Trash2, CheckCircle, AlertCircle } from "lucide-react";
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
}

interface TimeSlot {
  Hour: number;
  Minute: number;
}

interface ApiPayload {
  GPId: number;
  VillageId: number;
  RoasterDate: string; // Changed from object to string for DateOnly
  ActivityType: string;
  StartDate: string;
  EndDate: string;
  Remark: string;
  CreatedBy: number;
  PumpId: number;
  DistributionShift1FromTime: string; // Changed to string for TimeOnly
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
  uparm: string; // Added required field
}

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

  const saveRoaster = async () => {
  console.log('Save button clicked');
  console.log('selectedDate:', selectedDate);
  console.log('fillingData:', fillingData);
  console.log('distributionData:', distributionData);
  
  if (!selectedDate || !fillingData || !distributionData) {
    setError('Please fill in all roaster data before saving.');
    return;
  }

  setIsLoading(true);
  setError('');

  try {
    // Get user's IP address
    const ipAddress = await getUserIPAddress();
    
    // Parse the selected date
    const dateObj = new Date(selectedDate);
    
    // Prepare the API payload
    const apiPayload: ApiPayload = {
      GPId: 1, // TODO: Get from user context - this might need to be a valid ID
      VillageId: 1, // TODO: Get from user context - this might need to be a valid ID
      RoasterDate: selectedDate, // Changed to string format (YYYY-MM-DD)
      ActivityType: "Monthly Roaster", // Check if this is the expected format
      StartDate: `${selectedDate}T00:00:00.000Z`,
      EndDate: `${selectedDate}T23:59:59.999Z`,
      Remark: `Monthly roaster for ${getMonthName(selectedMonth)} ${selectedYear}`,
      CreatedBy: 1, // TODO: Get from authenticated user - this might need to be a valid user ID
      PumpId: 1, // TODO: Get from context - this might need to be a valid pump ID
      
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
      
      UpdatedBy: 1, // TODO: Get from authenticated user
      DeviceToken: "web-app-roaster", // This should be fine
      IPAddress: ipAddress,
      uparm: "monthly-roaster-save" // Added required field
    };

    // TEMPORARY: Mock API call for testing
    // Remove this once your actual API is working
    const MOCK_API = false; // Set to true to use mock
    
    let result; // Declare result variable here so it's available in the entire try block
    
    if (MOCK_API) {
      // Mock successful response
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      result = { id: Date.now(), success: true };
      console.log('Mock API response:', result);
    } else {
      // Make real API call to the correct URL
      const apiUrl = 'https://wmsapi.kdsgroup.co.in/api/Master/InsertMonthlyRoasterWithSchedule';
      
      console.log('Making API call to:', apiUrl);
      console.log('Payload:', JSON.stringify(apiPayload, null, 2));
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        // Get more detailed error information
        let errorMessage = `API Error: ${response.status} - ${response.statusText}`;
        try {
          const errorBody = await response.text();
          console.log('Error response body:', errorBody);
          if (errorBody) {
            errorMessage += `\nDetails: ${errorBody}`;
          }
        } catch (e) {
          console.log('Could not read error response body');
        }
        throw new Error(errorMessage);
      }

      result = await response.json();
      console.log('API response:', result);
    }
    
    // Save locally as backup/cache
    const newRoaster: RoasterData = {
      id: result?.id?.toString() || Date.now().toString(), // Use optional chaining and fallback
      month: selectedMonth,
      year: selectedYear,
      date: selectedDate,
      fillingData,
      distributionData,
      createdAt: new Date().toISOString(),
      status: 'saved'
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
  const deleteRoaster = (id: string) => {
    if (confirm('Are you sure you want to delete this roaster?')) {
      const updatedRoasters = savedRoasters.filter(r => r.id !== id);
      setSavedRoasters(updatedRoasters);
      localStorage.setItem('pumpHouseRoasters', JSON.stringify(updatedRoasters));
    }
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

  const filteredRoasters = savedRoasters.filter(r => 
    r.month === selectedMonth && r.year === selectedYear
  );

  const isRoasterExistForDate = (date: string) => {
    return filteredRoasters.some(r => r.date === date);
  };

  return (
    <div className="p-6 space-y-6 relative z-10">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Roaster saved successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <div>
            <div className="font-semibold">Error</div>
            <div className="text-sm">{error}</div>
          </div>
          <button
            onClick={() => setError('')}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

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
                {getMonthName(selectedMonth)} {selectedYear} Roasters
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
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewRoaster(roaster)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50"
                        title="View Roaster"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteRoaster(roaster.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                        title="Delete Roaster"
                      >
                        <Trash2 className="w-4 h-4" />
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
                    disabled={isLoading}
                    className={`px-6 py-3 rounded-lg flex items-center gap-2 font-semibold transition-colors ${
                      (!selectedDate || !fillingData || !distributionData || isLoading)
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
    </div>
  );
};

export default PumpHouseRoaster;