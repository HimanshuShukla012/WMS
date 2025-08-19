import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useUserInfo } from '../utils/userInfo'; // Import the hook

// Professional Icons (using Unicode symbols)
const Icons = {
  Users: () => <span className="text-2xl">👥</span>,
  Water: () => <span className="text-2xl">💧</span>,
  Warning: () => <span className="text-2xl">⚠️</span>,
  Money: () => <span className="text-2xl">💰</span>,
  Refresh: () => <span className="text-xl">🔄</span>,
  Search: () => <span className="text-lg">🔍</span>,
  Chart: () => <span className="text-xl">📊</span>,
  Settings: () => <span className="text-xl">⚙️</span>,
  Pump: () => <span className="text-2xl">⚡</span>,
  Tank: () => <span className="text-2xl">🏛️</span>,
  Schedule: () => <span className="text-2xl">📅</span>
};

const StatCard = ({ title, value, icon: Icon, change, changeType, gradient, trend, isLoading, subtitle }) => (
  <div className={`relative overflow-hidden rounded-xl ${gradient} shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/10`}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
    <div className="relative p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/10 rounded-lg backdrop-blur-md border border-white/20">
          <Icon />
        </div>
        {trend && (
          <div className={`text-xs px-3 py-1 rounded-full backdrop-blur-md border ${
            changeType === 'increase' 
              ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30' 
              : 'bg-rose-500/20 text-rose-100 border-rose-400/30'
          }`}>
            {changeType === 'increase' ? '↗' : '↘'} {change}
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium opacity-90 mb-2 tracking-wide uppercase">{title}</h3>
      <div className="text-3xl font-bold mb-2 tracking-tight">
        {isLoading ? (
          <div className="animate-pulse bg-white/20 h-9 w-20 rounded"></div>
        ) : (
          typeof value === 'string' ? value : value?.toLocaleString() || '0'
        )}
      </div>
      {subtitle && <div className="text-sm opacity-75">{subtitle}</div>}
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-12">
    <div className="relative">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-600"></div>
      <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-4 border-slate-400 opacity-20"></div>
    </div>
  </div>
);

// API Response Types
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

interface OHTData {
  OhtId: number;
  Districtname: string;
  BlockName: string;
  GramPanchayatName: string;
  VillageName: string;
  OHTCapacity: number;
  NoOfPumps: number;
}

interface ComplaintData {
  ComplaintID: number;
  District: string;
  Block: string;
  GramPanchayat: string;
  Village: string;
  BeneficiaryName: string;
  Contact: string;
  Landmark: string;
  Category: string;
  Status: boolean;
}

interface FeeCollectionData {
  FeeCollectionId: number;
  BeneficiaryId: number;
  BeneficiaryName: string;
  FatherHusbandName: string;
  VillageId: number;
  VillageName: string;
  BaseFee: number;
  PreviousBalance: number;
  OutstandingAmount: number;
  PaidAmount: number;
  BalanceAmount: number;
}

interface Village {
  VillageId: number;
  VillageName: string;
}

interface ApiResponse<T> {
  Data: T;
  Error?: string | null;
  Errror?: string | null;
  Message: string;
  Status: boolean;
}

export default function EnhancedGPDashboard() {
  // Get userId from the authentication hook
  const { userId, role, isLoading: userLoading } = useUserInfo();
  
  // Real API Data States
  const [pumpHouses, setPumpHouses] = useState<PumpHouseData[]>([]);
  const [ohtData, setOHTData] = useState<OHTData[]>([]);
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  const [feeData, setFeeData] = useState<FeeCollectionData[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  
  // Original Dashboard APIs
  const [totalBeneficiaries, setTotalBeneficiaries] = useState(0);
  const [totalActiveConnections, setTotalActiveConnections] = useState(0);
  const [totalPendingComplaints, setTotalPendingComplaints] = useState(0);
  const [complaintStatusData, setComplaintStatusData] = useState([]);
  const [waterConnectionData, setWaterConnectionData] = useState([]);
  const [villageFeeData, setVillageFeeData] = useState([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState({
    pumps: true,
    ohts: true,
    complaints: true,
    fees: true,
    villages: true,
    beneficiaries: true,
    connections: true,
    complaintStatus: true,
    waterConnection: true,
    villageFee: true
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear] = useState(new Date().getFullYear());

  // Time update effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real API Functions
  const fetchPumpHouses = async (currentUserId: number) => {
    setIsLoading(prev => ({ ...prev, pumps: true }));
    try {
      const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetPumpHouseListByUserId?UserId=${currentUserId}`);
      const data: ApiResponse<PumpHouseData[]> = await response.json();
      
      if (data.Status && Array.isArray(data.Data)) {
        setPumpHouses(data.Data);
      } else {
        setPumpHouses([]);
      }
    } catch (error) {
      console.error('Error fetching pump houses:', error);
      setPumpHouses([]);
    } finally {
      setIsLoading(prev => ({ ...prev, pumps: false }));
    }
  };

  const fetchVillages = async (currentUserId: number) => {
    setIsLoading(prev => ({ ...prev, villages: true }));
    try {
      const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetVillageListByUserId?UserId=${currentUserId}`);
      const data: ApiResponse<Village[]> = await response.json();
      
      if (data.Status && Array.isArray(data.Data)) {
        setVillages(data.Data);
        // Fetch dependent data
        await Promise.all(data.Data.slice(0, 5).map(async (village) => {
          await fetchOHTData(village.VillageId);
          await fetchFeeData(village.VillageId);
        }));
      } else {
        setVillages([]);
      }
    } catch (error) {
      console.error('Error fetching villages:', error);
      setVillages([]);
    } finally {
      setIsLoading(prev => ({ ...prev, villages: false }));
    }
  };

  const fetchOHTData = async (villageId: number) => {
    try {
      const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetOHTListByVillage?VillageId=${villageId}`);
      const data: ApiResponse<OHTData[]> = await response.json();
      
      if (data.Status && Array.isArray(data.Data)) {
        setOHTData(prev => [...prev, ...data.Data]);
      }
    } catch (error) {
      console.error(`Error fetching OHT data for village ${villageId}:`, error);
    }
  };

  const fetchFeeData = async (villageId: number) => {
    try {
      const response = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/GetFeeCollectionDetails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          VillageId: villageId,
          Month: selectedMonth,
          Year: selectedYear
        })
      });
      
      const data: ApiResponse<FeeCollectionData[]> = await response.json();
      
      if (data.Status && Array.isArray(data.Data)) {
        setFeeData(prev => [...prev, ...data.Data]);
      }
    } catch (error) {
      console.error(`Error fetching fee data for village ${villageId}:`, error);
    }
  };

  const fetchComplaints = async () => {
    setIsLoading(prev => ({ ...prev, complaints: true }));
    try {
      const response = await fetch('https://wmsapi.kdsgroup.co.in/api/Complain/GetComplaintListByUserIdVillageAndStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          UserId: userId,
          VillageId: 0,
          Status: null
        })
      });
      
      const data: ApiResponse<ComplaintData[]> = await response.json();
      
      if (data.Status && Array.isArray(data.Data)) {
        setComplaints(data.Data);
      } else {
        setComplaints([]);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]);
    } finally {
      setIsLoading(prev => ({ ...prev, complaints: false }));
    }
  };

  const fetchTotalBeneficiaries = async (currentUserId: number) => {
    setIsLoading(prev => ({ ...prev, beneficiaries: true }));
    try {
      const res = await fetch(`https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTotalBeneficiaryCount?UserId=${currentUserId}`);
      const data = await res.json();
      if (data?.Status && data?.Data?.TotalBeneficiaryCount !== undefined) {
        setTotalBeneficiaries(data.Data.TotalBeneficiaryCount);
      } else {
        setTotalBeneficiaries(0);
      }
    } catch (error) {
      console.error("Error fetching beneficiaries:", error);
      setTotalBeneficiaries(0);
    } finally {
      setIsLoading(prev => ({ ...prev, beneficiaries: false }));
    }
  };

  const fetchActiveConnections = async (currentUserId: number) => {
    setIsLoading(prev => ({ ...prev, connections: true }));
    try {
      const res = await fetch(`https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTotalActiveWaterConnectionCount?UserId=${currentUserId}`);
      const data = await res.json();
      if (data?.Status && data?.Data?.TotalActiveWaterConnectionCount !== undefined) {
        setTotalActiveConnections(data.Data.TotalActiveWaterConnectionCount);
      } else {
        setTotalActiveConnections(0);
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
      setTotalActiveConnections(0);
    } finally {
      setIsLoading(prev => ({ ...prev, connections: false }));
    }
  };

  const fetchPendingComplaints = async (currentUserId: number) => {
    try {
      const res = await fetch(`https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTotalPendingComplaintCount?UserId=${currentUserId}`);
      const data = await res.json();
      if (data?.Status && data?.Data?.TotalPendingComplaintCount !== undefined) {
        setTotalPendingComplaints(data.Data.TotalPendingComplaintCount);
      } else {
        setTotalPendingComplaints(0);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
      setTotalPendingComplaints(0);
    }
  };

  const fetchComplaintStatusDistribution = async (currentUserId: number) => {
    setIsLoading(prev => ({ ...prev, complaintStatus: true }));
    try {
      const res = await fetch(`https://wmsapi.kdsgroup.co.in/api/Dashboard/GetComplaintStatusDistribution?UserId=${currentUserId}`);
      const data = await res.json();
      if (data?.Status && data?.Data) {
        const transformedData = data.Data.map(item => ({
          name: item.ComplaintStatus === 0 ? "Pending" : "Resolved",
          value: item.TotalCount,
          status: item.ComplaintStatus
        }));
        setComplaintStatusData(transformedData);
      } else {
        setComplaintStatusData([]);
      }
    } catch (error) {
      console.error("Error fetching complaint status:", error);
      setComplaintStatusData([]);
    } finally {
      setIsLoading(prev => ({ ...prev, complaintStatus: false }));
    }
  };

  const fetchWaterConnectionStatus = async () => {
    setIsLoading(prev => ({ ...prev, waterConnection: true }));
    try {
      const res = await fetch("https://wmsapi.kdsgroup.co.in/api/Dashboard/GetWaterConnectionStatus");
      const data = await res.json();
      if (data?.Status && data?.Data) {
        const statusMap = {};
        data.Data.forEach(item => {
          const status = item.WaterConnectionStatus === 1 ? "Active" : "Inactive";
          statusMap[status] = (statusMap[status] || 0) + item.TotalCount;
        });
        
        const transformedData = Object.entries(statusMap).map(([status, count]) => ({
          name: status,
          value: count
        }));
        setWaterConnectionData(transformedData);
      } else {
        setWaterConnectionData([]);
      }
    } catch (error) {
      console.error("Error fetching water connection status:", error);
      setWaterConnectionData([]);
    } finally {
      setIsLoading(prev => ({ ...prev, waterConnection: false }));
    }
  };

  const fetchVillageFeeCollectionData = async () => {
    setIsLoading(prev => ({ ...prev, villageFee: true }));
    try {
      const res = await fetch("https://wmsapi.kdsgroup.co.in/api/Dashboard/GetVillageFeeCollectionVSTargetStatus");
      const data = await res.json();
      if (data?.Status && data?.Data) {
        setVillageFeeData(data.Data);
      } else {
        setVillageFeeData([]);
      }
    } catch (error) {
      console.error("Error fetching village fee collection:", error);
      setVillageFeeData([]);
    } finally {
      setIsLoading(prev => ({ ...prev, villageFee: false }));
      setIsLoading(prev => ({ ...prev, fees: false, ohts: false }));
    }
  };

  // Modified initialization effect that waits for userId
  useEffect(() => {
    const initializeDashboard = async () => {
      if (!userId || userLoading) return; // Wait for userId to be available
      
      console.log('Initializing dashboard with userId:', userId, 'role:', role);

      await Promise.all([
        fetchTotalBeneficiaries(userId),
        fetchActiveConnections(userId),
        fetchPendingComplaints(userId),
        fetchComplaintStatusDistribution(userId),
        fetchWaterConnectionStatus(),
        fetchVillageFeeCollectionData(),
        fetchPumpHouses(userId),
        fetchVillages(userId),
        fetchComplaints()
      ]);
    };

    initializeDashboard();
  }, [userId, userLoading, role]); // Dependencies include userId and userLoading

  // Modified refresh function
  const handleRefresh = async () => {
    if (!userId) {
      console.warn('Cannot refresh: userId not available');
      return;
    }

    setRefreshing(true);
    setIsLoading({
      pumps: true,
      ohts: true,
      complaints: true,
      fees: true,
      villages: true,
      beneficiaries: true,
      connections: true,
      complaintStatus: true,
      waterConnection: true,
      villageFee: true
    });

    // Clear existing data
    setPumpHouses([]);
    setOHTData([]);
    setFeeData([]);

    await Promise.all([
      fetchTotalBeneficiaries(userId),
      fetchActiveConnections(userId),
      fetchPendingComplaints(userId),
      fetchComplaintStatusDistribution(userId),
      fetchWaterConnectionStatus(),
      fetchVillageFeeCollectionData(),
      fetchPumpHouses(userId),
      fetchVillages(userId),
      fetchComplaints()
    ]);

    setRefreshing(false);
  };

  // Show loading state while user info is being fetched
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-slate-600 font-medium">Loading user information...</p>
        </div>
      </div>
    );
  }

  // Show error if no userId is available
  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-8 border border-white/20">
          <Icons.Warning />
          <h2 className="text-xl font-bold text-slate-800 mt-4">Authentication Required</h2>
          <p className="text-slate-600 mt-2">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  // Calculate real-time metrics from API data
  const activePumps = pumpHouses.filter(p => p.Status === 1).length;
  const totalPumps = pumpHouses.length;
  const totalOHTs = ohtData.length;
  const totalCapacity = ohtData.reduce((sum, oht) => sum + (oht.OHTCapacity || 0), 0);
  const totalComplaintsFromData = complaints.length;
  const resolvedComplaints = complaints.filter(c => c.Status === true).length;
  const totalCollection = feeData.reduce((sum, fee) => sum + (fee.PaidAmount || 0), 0);
  const totalOutstanding = feeData.reduce((sum, fee) => sum + (fee.OutstandingAmount || 0), 0);
  const uniqueBeneficiaries = new Set(feeData.map(f => f.BeneficiaryId)).size;
  const solarPumps = pumpHouses.filter(p => p.PowerSource === '2').length;
  const electricPumps = pumpHouses.filter(p => p.PowerSource === '1').length;

  // Collection efficiency from API data
  const totalCollectedVillage = villageFeeData.reduce((sum, item) => sum + (item.TotalCollectedAmount || 0), 0);
  const totalTargetVillage = villageFeeData.reduce((sum, item) => sum + (item.TotalTargetedAmount || 0), 0);
  const collectionEfficiency = totalTargetVillage > 0 ? ((totalCollectedVillage / totalTargetVillage) * 100).toFixed(1) : '0.0';

  // Professional color schemes
  const COLORS = {
    primary: ["#1e293b", "#334155", "#475569"],
    secondary: ["#0f172a", "#1e293b", "#334155"],
    success: ["#065f46", "#047857", "#059669"],
    warning: ["#92400e", "#b45309", "#d97706"],
    danger: ["#991b1b", "#dc2626", "#ef4444"],
    chart: ["#1e293b", "#059669", "#d97706", "#dc2626", "#7c3aed", "#0891b2"]
  };

  // Transform pump data for charts (only from API data)
  const pumpTypeData = totalPumps > 0 ? [
    { name: 'Electric Pumps', value: electricPumps, fill: '#1e293b' },
    { name: 'Solar Pumps', value: solarPumps, fill: '#059669' }
  ].filter(item => item.value > 0) : [];

  const pumpStatusData = totalPumps > 0 ? [
    { name: 'Active', value: activePumps, fill: '#059669' },
    { name: 'Inactive', value: totalPumps - activePumps, fill: '#dc2626' }
  ].filter(item => item.value > 0) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <div className="container mx-auto p-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                Water Management Dashboard
              </h1>
              <p className="text-slate-600 mt-1 font-medium">
                Real-time System Overview & Analytics 
                {userId && <span className="text-slate-500"> • User ID: {userId}</span>}
                {role && <span className="text-slate-500"> • Role: {role}</span>}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing || !userId}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              <Icons.Refresh />
              <span className="font-medium">{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
            
            <div className="text-sm text-slate-600 font-medium bg-white/80 backdrop-blur-md px-4 py-3 rounded-xl shadow-md border border-white/20">
              <div className="font-semibold">{currentTime.toLocaleDateString('en-IN')}</div>
              <div className="font-mono text-slate-500">{currentTime.toLocaleTimeString('en-IN')}</div>
            </div>
          </div>
        </div>

        {/* Main Stats Cards - Only API Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Beneficiaries"
            value={totalBeneficiaries}
            subtitle={uniqueBeneficiaries > 0 ? `${uniqueBeneficiaries} with fee records` : "No fee data available"}
            icon={Icons.Users}
            gradient="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600"
            isLoading={isLoading.beneficiaries}
          />
          
          <StatCard
            title="Active Connections"
            value={totalActiveConnections}
            subtitle={`${villages.length} villages managed`}
            icon={Icons.Water}
            gradient="bg-gradient-to-br from-teal-800 via-teal-700 to-teal-600"
            isLoading={isLoading.connections}
          />
          
          <StatCard
            title="Pump Infrastructure"
            value={totalPumps}
            subtitle={totalPumps > 0 ? `${activePumps} active, ${solarPumps} solar` : "No pump data"}
            icon={Icons.Pump}
            gradient="bg-gradient-to-br from-amber-800 via-amber-700 to-amber-600"
            isLoading={isLoading.pumps}
          />
          
          <StatCard
            title="Collection Rate"
            value={`${collectionEfficiency}%`}
            subtitle={totalCollectedVillage > 0 ? `₹${totalCollectedVillage.toLocaleString()} collected` : "No collection data"}
            icon={Icons.Money}
            gradient="bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-600"
            isLoading={isLoading.villageFee}
          />
        </div>

        {/* Secondary Stats Cards - Only API Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Pending Complaints"
            value={totalPendingComplaints || (totalComplaintsFromData - resolvedComplaints)}
            subtitle={totalComplaintsFromData > 0 ? `${resolvedComplaints}/${totalComplaintsFromData} resolved` : "No complaint data"}
            icon={Icons.Warning}
            gradient="bg-gradient-to-br from-rose-800 via-rose-700 to-rose-600"
            isLoading={isLoading.complaints}
          />
          
          <StatCard
            title="OHT Infrastructure"
            value={totalOHTs}
            subtitle={totalCapacity > 0 ? `${(totalCapacity / 1000).toFixed(0)}K L capacity` : "No OHT data"}
            icon={Icons.Tank}
            gradient="bg-gradient-to-br from-cyan-800 via-cyan-700 to-cyan-600"
            isLoading={isLoading.ohts}
          />
          
          <StatCard
            title="Fee Collection"
            value={totalCollection > 0 ? `₹${totalCollection.toLocaleString()}` : '₹0'}
            subtitle={totalOutstanding > 0 ? `₹${totalOutstanding.toLocaleString()} outstanding` : "No outstanding"}
            icon={Icons.Money}
            gradient="bg-gradient-to-br from-green-800 via-green-700 to-green-600"
            isLoading={isLoading.fees}
          />
          
          <StatCard
            title="Villages"
            value={villages.length}
            subtitle="Under management"
            icon={Icons.Users}
            gradient="bg-gradient-to-br from-indigo-800 via-indigo-700 to-indigo-600"
            isLoading={isLoading.villages}
          />
        </div>

        {/* Charts Section - Only API Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Pump Distribution */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Pump Distribution</h3>
              <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">Live Data</div>
            </div>
            
            {isLoading.pumps ? (
              <LoadingSpinner />
            ) : pumpTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pumpTypeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="40%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={5}
                    label={({ value, name }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {pumpTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)"
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="rect"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-16 text-slate-500">
                <Icons.Pump />
                <p className="mt-2 font-medium">No pump data available</p>
                <p className="text-sm">Check API connection</p>
              </div>
            )}
          </div>

          {/* Complaint Status */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Complaint Status</h3>
              <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">Real-time</div>
            </div>
            
            {isLoading.complaintStatus ? (
              <LoadingSpinner />
            ) : complaintStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={complaintStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="40%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={5}
                    label={({ value, name }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {complaintStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)"
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="rect"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-16 text-slate-500">
                <Icons.Warning />
                <p className="mt-2 font-medium">No complaint data available</p>
                <p className="text-sm">Check API connection</p>
              </div>
            )}
          </div>
        </div>

        {/* Water Connection & Village Fee Collection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Water Connection Status */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Connection Status</h3>
              <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">API Data</div>
            </div>
            
            {isLoading.waterConnection ? (
              <LoadingSpinner />
            ) : waterConnectionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={waterConnectionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="40%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={5}
                    label={({ value, name }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {waterConnectionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)"
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="rect"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-16 text-slate-500">
                <Icons.Water />
                <p className="mt-2 font-medium">No connection data available</p>
                <p className="text-sm">Check API connection</p>
              </div>
            )}
          </div>

          {/* Pump Operational Status */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Pump Status</h3>
              <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">Live Status</div>
            </div>
            
            {isLoading.pumps ? (
              <LoadingSpinner />
            ) : pumpStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pumpStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="40%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={5}
                    label={({ value, name }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {pumpStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)"
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="rect"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-16 text-slate-500">
                <Icons.Pump />
                <p className="mt-2 font-medium">No pump status data</p>
                <p className="text-sm">Check API connection</p>
              </div>
            )}
          </div>
        </div>

        {/* Village Fee Collection Performance - Only API Data */}
        {villageFeeData.length > 0 && (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/20 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Village Fee Collection vs Target</h3>
              <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">API Performance Data</div>
            </div>
            
            {isLoading.villageFee ? (
              <LoadingSpinner />
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                  data={villageFeeData} 
                  margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                  barGap={10}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="VillageName" 
                    stroke="#64748b"
                    fontSize={11}
                    fontWeight="500"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={12}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)"
                    }}
                    formatter={(value, name) => [`₹${value.toLocaleString()}`, name]}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="rect"
                  />
                  <Bar 
                    dataKey="TotalTargetedAmount" 
                    name="Target Amount"
                    fill="#94a3b8" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                  <Bar 
                    dataKey="TotalCollectedAmount" 
                    name="Collected Amount"
                    fill="#1e293b" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Real-time Data Tables - Only API Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Recent Complaints */}
          {complaints.length > 0 ? (
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Recent Complaints</h3>
                <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">Live API Data</div>
              </div>
              
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {complaints.slice(0, 5).map((complaint) => (
                  <div key={complaint.ComplaintID} className="flex items-center justify-between p-4 bg-slate-50/80 rounded-lg border border-slate-200/50 hover:bg-slate-100/80 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-800">{complaint.BeneficiaryName}</span>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          complaint.Status 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {complaint.Status ? 'Resolved' : 'Pending'}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 mt-1 font-medium">{complaint.Village} • {complaint.Category}</div>
                      <div className="text-xs text-slate-500">{complaint.Landmark}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-mono">ID: {complaint.ComplaintID}</div>
                      <div className="text-xs text-slate-400">{complaint.Contact}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Recent Complaints</h3>
              <div className="text-center py-16 text-slate-500">
                <Icons.Warning />
                <p className="mt-2 font-medium">No complaints data available</p>
                <p className="text-sm">Check API connection</p>
              </div>
            </div>
          )}

          {/* Active Pump Houses */}
          {pumpHouses.length > 0 ? (
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Pump House Status</h3>
                <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">Real-time API</div>
              </div>
              
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {pumpHouses.map((pump) => (
                  <div key={pump.PumpId} className="flex items-center justify-between p-4 bg-slate-50/80 rounded-lg border border-slate-200/50 hover:bg-slate-100/80 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full shadow-md ${
                        pump.Status === 1 ? 'bg-emerald-500 shadow-emerald-200' : 'bg-rose-500 shadow-rose-200'
                      }`}></div>
                      <div>
                        <div className="font-semibold text-slate-800">{pump.OperatorName}</div>
                        <div className="text-sm text-slate-600 font-medium">
                          Pump {pump.PumpId} • {pump.HorsePower} HP
                        </div>
                        <div className="text-xs text-slate-500">
                          {pump.PowerSource === '2' ? `Solar (${pump.SolarOutput}W)` : 'Electric Power'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        pump.Status === 1 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {pump.Status === 1 ? 'Active' : 'Inactive'}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">{pump.Contact}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Pump House Status</h3>
              <div className="text-center py-16 text-slate-500">
                <Icons.Pump />
                <p className="mt-2 font-medium">No pump house data available</p>
                <p className="text-sm">Check API connection</p>
              </div>
            </div>
          )}
        </div>

        {/* Fee Collection Details - Only API Data */}
        {feeData.length > 0 ? (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/20 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Fee Collection Summary</h3>
              <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">Current Month API Data</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl text-white shadow-lg">
                <div className="text-sm opacity-90 font-medium uppercase tracking-wider">Total Collection</div>
                <div className="text-3xl font-bold mt-2">₹{totalCollection.toLocaleString()}</div>
                <div className="text-xs opacity-75 mt-1">From {uniqueBeneficiaries} beneficiaries</div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-800 to-amber-900 p-6 rounded-xl text-white shadow-lg">
                <div className="text-sm opacity-90 font-medium uppercase tracking-wider">Outstanding Amount</div>
                <div className="text-3xl font-bold mt-2">₹{totalOutstanding.toLocaleString()}</div>
                <div className="text-xs opacity-75 mt-1">Pending collection</div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 p-6 rounded-xl text-white shadow-lg">
                <div className="text-sm opacity-90 font-medium uppercase tracking-wider">Collection Rate</div>
                <div className="text-3xl font-bold mt-2">
                  {totalCollection + totalOutstanding > 0 
                    ? Math.round((totalCollection / (totalCollection + totalOutstanding)) * 100)
                    : 0}%
                </div>
                <div className="text-xs opacity-75 mt-1">Payment efficiency</div>
              </div>
            </div>

            {/* Fee Collection Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left p-4 font-semibold text-slate-700 uppercase tracking-wide">Beneficiary</th>
                    <th className="text-left p-4 font-semibold text-slate-700 uppercase tracking-wide">Village</th>
                    <th className="text-right p-4 font-semibold text-slate-700 uppercase tracking-wide">Paid Amount</th>
                    <th className="text-right p-4 font-semibold text-slate-700 uppercase tracking-wide">Outstanding</th>
                    <th className="text-right p-4 font-semibold text-slate-700 uppercase tracking-wide">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {feeData.slice(0, 8).map((fee) => (
                    <tr key={fee.FeeCollectionId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{fee.BeneficiaryName}</div>
                        <div className="text-xs text-slate-500 mt-1">{fee.FatherHusbandName}</div>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{fee.VillageName}</td>
                      <td className="p-4 text-right font-semibold text-emerald-600">
                        ₹{fee.PaidAmount.toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-semibold text-amber-600">
                        ₹{fee.OutstandingAmount.toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-semibold text-rose-600">
                        ₹{fee.BalanceAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/20 mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Fee Collection Summary</h3>
            <div className="text-center py-16 text-slate-500">
              <Icons.Money />
              <p className="mt-2 font-medium">No fee collection data available</p>
              <p className="text-sm">Check API connection or month/year parameters</p>
            </div>
          </div>
        )}

        {/* System Status Footer */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-xl p-6 border border-slate-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
                <span className="text-sm font-semibold">System Online</span>
              </div>
              <div className="text-sm opacity-75">
                Last updated: {currentTime.toLocaleTimeString('en-IN')}
              </div>
            </div>
            
            <div className="flex items-center gap-8 text-sm">
              <div className="flex items-center gap-2 opacity-90">
                <Icons.Users />
                <span className="font-medium">{totalBeneficiaries} Beneficiaries</span>
              </div>
              <div className="flex items-center gap-2 opacity-90">
                <Icons.Pump />
                <span className="font-medium">{activePumps}/{totalPumps} Pumps Active</span>
              </div>
              <div className="flex items-center gap-2 opacity-90">
                <Icons.Tank />
                <span className="font-medium">{totalOHTs} OHTs</span>
              </div>
              <div className="flex items-center gap-2 opacity-90">
                <Icons.Water />
                <span className="font-medium">{villages.length} Villages</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}