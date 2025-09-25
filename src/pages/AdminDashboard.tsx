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
  Schedule: () => <span className="text-2xl">📅</span>,
  Calendar: () => <span className="text-xl">📅</span>,
  Filter: () => <span className="text-xl">🔍</span>
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

interface OHTCountData {
  TotalOHTCount: number;
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

// NEW: District-based API Types
interface DistrictFeeData {
  DistrictId: number;
  DistrictName: string;
  TotalAmount: number;
}

interface DistrictComplaintData {
  DistrictId: number;
  DistrictName: string;
  TotalComplaint: number;
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
  const [ohtCount, setOHTCount] = useState<number>(0);
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  const [feeData, setFeeData] = useState<FeeCollectionData[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  
  // NEW: District Data States
  const [topDistrictsByFee, setTopDistrictsByFee] = useState<DistrictFeeData[]>([]);
  const [bottomDistrictsByFee, setBottomDistrictsByFee] = useState<DistrictFeeData[]>([]);
  const [topDistrictsByComplaint, setTopDistrictsByComplaint] = useState<DistrictComplaintData[]>([]);
  const [bottomDistrictsByComplaint, setBottomDistrictsByComplaint] = useState<DistrictComplaintData[]>([]);
  
  // Original Dashboard APIs
  const [totalBeneficiaries, setTotalBeneficiaries] = useState(0);
  const [totalActiveConnections, setTotalActiveConnections] = useState(0);
  const [totalPendingComplaints, setTotalPendingComplaints] = useState(0);
  const [totalVillageCount, setTotalVillageCount] = useState(0);
  const [complaintStatusData, setComplaintStatusData] = useState([]);
  const [waterConnectionData, setWaterConnectionData] = useState([]);
  const [villageFeeData, setVillageFeeData] = useState([]);
  
  // NEW: Date Controls State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
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
    villageFee: true,
    districtApis: true,
    villageCount: true
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Time update effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // NEW: District APIs Functions
  const fetchDistrictAPIs = async (year: number) => {
    setIsLoading(prev => ({ ...prev, districtApis: true }));
    try {
      const [topFeeRes, bottomFeeRes, topComplaintRes, bottomComplaintRes] = await Promise.all([
        fetch(`https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTop10DistrictByFeeCollection?FinancialYear=${year}`, {
          method: 'POST',
          headers: { 'accept': '*/*' }
        }),
        fetch(`https://wmsapi.kdsgroup.co.in/api/Dashboard/GetBottom10DistrictByFeeCollection?FinancialYear=${year}`, {
          method: 'POST',
          headers: { 'accept': '*/*' }
        }),
        fetch(`https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTop10DistrictByComplaint?FinancialYear=${year}`, {
          method: 'POST',
          headers: { 'accept': '*/*' }
        }),
        fetch(`https://wmsapi.kdsgroup.co.in/api/Dashboard/GetBottom10DistrictByComplaint?FinancialYear=${year}`, {
          method: 'POST',
          headers: { 'accept': '*/*' }
        })
      ]);

      const [topFeeData, bottomFeeData, topComplaintData, bottomComplaintData] = await Promise.all([
        topFeeRes.json(),
        bottomFeeRes.json(),
        topComplaintRes.json(),
        bottomComplaintRes.json()
      ]);

      if (topFeeData.Status && Array.isArray(topFeeData.Data)) {
        setTopDistrictsByFee(topFeeData.Data);
      }
      if (bottomFeeData.Status && Array.isArray(bottomFeeData.Data)) {
        setBottomDistrictsByFee(bottomFeeData.Data);
      }
      if (topComplaintData.Status && Array.isArray(topComplaintData.Data)) {
        setTopDistrictsByComplaint(topComplaintData.Data);
      }
      if (bottomComplaintData.Status && Array.isArray(bottomComplaintData.Data)) {
        setBottomDistrictsByComplaint(bottomComplaintData.Data);
      }
    } catch (error) {
      console.error('Error fetching district APIs:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, districtApis: false }));
    }
  };

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

  // FIXED: Fee Collection API with proper parameters
  const fetchFeeCollectionData = async (month: number, year: number) => {
    setIsLoading(prev => ({ ...prev, fees: true }));
    try {
      console.log('Fetching fee collection with params:', { month, year });
      
      const response = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/GetFeeCollectionDetails', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify({
          VillageId: 0, // 0 for all villages as per your requirement
          Month: month,
          Year: year
        })
      });
      
      const data: ApiResponse<FeeCollectionData[]> = await response.json();
      console.log('Fee collection response:', data);
      
      if (data.Status && Array.isArray(data.Data)) {
        setFeeData(data.Data);
        console.log(`Loaded ${data.Data.length} fee collection records`);
      } else {
        setFeeData([]);
        console.warn('No fee data available or API error:', data.Message);
      }
    } catch (error) {
      console.error('Error fetching fee data:', error);
      setFeeData([]);
    } finally {
      setIsLoading(prev => ({ ...prev, fees: false }));
    }
  };

  const fetchOHTCount = async (currentUserId: number) => {
    setIsLoading(prev => ({ ...prev, ohts: true }));
    try {
      const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetOHTCountByVillage?VillageId=0&UserId=${currentUserId}`);
      const data: ApiResponse<OHTCountData> = await response.json();
      
      if (data.Status && data.Data?.TotalOHTCount !== undefined) {
        setOHTCount(data.Data.TotalOHTCount);
      } else {
        setOHTCount(0);
      }
    } catch (error) {
      console.error('Error fetching OHT count:', error);
      setOHTCount(0);
    } finally {
      setIsLoading(prev => ({ ...prev, ohts: false }));
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

  const fetchTotalBeneficiaries = async () => {
    setIsLoading(prev => ({ ...prev, beneficiaries: true }));
    try {
      const res = await fetch("https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTotalBeneficiaryCountforAdmin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify({ InputType: "string" })
      });

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

  const fetchActiveConnections = async () => {
    setIsLoading(prev => ({ ...prev, connections: true }));
    try {
      const res = await fetch("https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTotalActiveWaterConnectionCountforAdmin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify({ InputType: "string" })
      });

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

  const fetchTotalVillageCount = async (currentUserId: number) => {
    setIsLoading(prev => ({ ...prev, villageCount: true }));
    try {
      const res = await fetch(`https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTotalVillageCountforAdmin?UserId=${currentUserId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: ""
      });

      const data = await res.json();
      if (data?.Status && data?.Data?.TotalVillageCount !== undefined) {
        setTotalVillageCount(data.Data.TotalVillageCount);
      } else {
        setTotalVillageCount(0);
      }
    } catch (error) {
      console.error("Error fetching village count:", error);
      setTotalVillageCount(0);
    } finally {
      setIsLoading(prev => ({ ...prev, villageCount: false }));
    }
  };

  const fetchPendingComplaints = async () => {
    setIsLoading(prev => ({ ...prev, complaints: true }));
    try {
      const res = await fetch("https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTotalPendingComplaintCountforAdmin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify({ InputType: "string" })
      });

      const data = await res.json();
      if (data?.Status && data?.Data?.TotalPendingComplaintCount !== undefined) {
        setTotalPendingComplaints(data.Data.TotalPendingComplaintCount);
      } else {
        setTotalPendingComplaints(0);
      }
    } catch (error) {
      console.error("Error fetching pending complaints:", error);
      setTotalPendingComplaints(0);
    } finally {
      setIsLoading(prev => ({ ...prev, complaints: false }));
    }
  };

  const fetchComplaintStatusDistribution = async () => {
    setIsLoading(prev => ({ ...prev, complaintStatus: true }));
    try {
      const res = await fetch(`https://wmsapi.kdsgroup.co.in/api/Dashboard/GetComplaintStatusDistributionforAdmin`, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          InputType: "string"
        })
      });
      
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

  const fetchWaterConnectionStatus = async (currentUserId: number) => {
    setIsLoading(prev => ({ ...prev, waterConnection: true }));
    try {
      const res = await fetch(`https://wmsapi.kdsgroup.co.in/api/Dashboard/GetWaterConnectionStatus?UserId=${currentUserId}`);
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

  const fetchVillageFeeCollectionData = async (currentUserId: number) => {
    setIsLoading(prev => ({ ...prev, villageFee: true }));
    try {
      const res = await fetch(`https://wmsapi.kdsgroup.co.in/api/Dashboard/GetVillageFeeCollectionVSTargetStatus?UserId=${currentUserId}`);
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
    }
  };

  // Modified initialization effect that waits for userId
  useEffect(() => {
    const initializeDashboard = async () => {
      if (!userId || userLoading) return;
      
      console.log('Initializing dashboard with userId:', userId, 'Month:', selectedMonth, 'Year:', selectedYear);

      await Promise.all([
        fetchTotalBeneficiaries(),
        fetchActiveConnections(),
        fetchPendingComplaints(),
        fetchTotalVillageCount(userId),
        fetchComplaintStatusDistribution(),
        fetchWaterConnectionStatus(userId),
        fetchVillageFeeCollectionData(userId),
        fetchPumpHouses(userId),
        fetchVillages(userId),
        fetchComplaints(),
        fetchOHTCount(userId),
        fetchFeeCollectionData(selectedMonth, selectedYear), // FIXED: Now uses selected month/year
        fetchDistrictAPIs(selectedYear) // NEW: Fetch district data
      ]);
    };

    initializeDashboard();
  }, [userId, userLoading, role, selectedMonth, selectedYear]); // Added selectedMonth and selectedYear as dependencies

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
      villageFee: true,
      districtApis: true,
      villageCount: true
    });

    // Clear existing data
    setPumpHouses([]);
    setOHTData([]);
    setFeeData([]);
    setOHTCount(0);
    setTotalVillageCount(0);
    setTopDistrictsByFee([]);
    setBottomDistrictsByFee([]);
    setTopDistrictsByComplaint([]);
    setBottomDistrictsByComplaint([]);

    await Promise.all([
      fetchTotalBeneficiaries(),
      fetchActiveConnections(),
      fetchPendingComplaints(),
      fetchTotalVillageCount(userId),
      fetchComplaintStatusDistribution(),
      fetchWaterConnectionStatus(userId),
      fetchVillageFeeCollectionData(userId),
      fetchPumpHouses(userId),
      fetchVillages(userId),
      fetchComplaints(),
      fetchOHTCount(userId),
      fetchFeeCollectionData(selectedMonth, selectedYear),
      fetchDistrictAPIs(selectedYear)
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
  const totalOHTs = ohtCount;
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

  // Transform pump data for charts
  const pumpTypeData = totalPumps > 0 ? [
    { name: 'Electric Pumps', value: electricPumps, fill: '#1e293b' },
    { name: 'Solar Pumps', value: solarPumps, fill: '#059669' }
  ].filter(item => item.value > 0) : [];

  const pumpStatusData = totalPumps > 0 ? [
    { name: 'Active', value: activePumps, fill: '#059669' },
    { name: 'Inactive', value: totalPumps - activePumps, fill: '#dc2626' }
  ].filter(item => item.value > 0) : [];

  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const monthOptions = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <div className="container mx-auto p-6">
        
        {/* Header with Date Controls */}
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
            {/* NEW: Date Filter Controls */}
            <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-3 border border-white/20">
              <Icons.Calendar />
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="text-sm font-medium bg-transparent border-none outline-none cursor-pointer text-slate-700"
                >
                  {monthOptions.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
                <span className="text-slate-400">•</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="text-sm font-medium bg-transparent border-none outline-none cursor-pointer text-slate-700"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing || !userId}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              <Icons.Refresh />
              <span className="font-medium">{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
            
            
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
            subtitle={`${totalVillageCount} villages managed`}
            icon={Icons.Water}
            gradient="bg-gradient-to-br from-teal-800 via-teal-700 to-teal-600"
            isLoading={isLoading.connections}
          />
          
          <StatCard
            title="Total Pumphouses"
            value={totalPumps}
            subtitle={totalPumps > 0 ? `${activePumps} active, ${solarPumps} solar` : "No pump data"}
            icon={Icons.Pump}
            gradient="bg-gradient-to-br from-amber-800 via-amber-700 to-amber-600"
            isLoading={isLoading.pumps}
          />
          
          <StatCard
  title="Collection Rate"
  value={
    totalCollection + totalOutstanding > 0
      ? `${Math.round((totalCollection / (totalOutstanding)) * 100)}%`
      : "0%"
  }
  subtitle={
    totalCollection > 0
      ? `₹${totalCollection.toLocaleString()} collected`
      : "No collection data"
  }
  icon={Icons.Money}
  gradient="bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-600"
  isLoading={isLoading.fees}
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
            title="Total Overhead Tanks"
            value={totalOHTs}
            subtitle={totalCapacity > 0 ? `${(totalCapacity / 1000).toFixed(0)}K L capacity` : `${totalOHTs} overhead tanks`}
            icon={Icons.Tank}
            gradient="bg-gradient-to-br from-cyan-800 via-cyan-700 to-cyan-600"
            isLoading={isLoading.ohts}
          />
          
          <StatCard
            title="Fee Collection"
            value={totalCollection > 0 ? `₹${totalCollection.toLocaleString()}` : '₹0'}
            subtitle={
  totalOutstanding - totalCollection > 0
    ? `₹${(totalOutstanding - totalCollection).toLocaleString()} outstanding`
    : "No outstanding"
}

            icon={Icons.Money}
            gradient="bg-gradient-to-br from-green-800 via-green-700 to-green-600"
            isLoading={isLoading.fees}
          />
          
          <StatCard
            title="Revenue Villages"
            value={totalVillageCount}
            subtitle="Under management"
            icon={Icons.Users}
            gradient="bg-gradient-to-br from-indigo-800 via-indigo-700 to-indigo-600"
            isLoading={isLoading.villageCount}
          />
        </div>

        {/* NEW: District Performance Tables - 4 Tables as requested */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Districts by Fee Collection */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Top Districts - Fee Collection</h3>
              <div className="text-sm text-slate-500 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg font-medium">FY {selectedYear}</div>
            </div>
            
            {isLoading.districtApis ? (
              <LoadingSpinner />
            ) : topDistrictsByFee.length > 0 ? (
              <div className="space-y-3">
                {topDistrictsByFee.map((district, index) => (
                  <div key={district.DistrictId} className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-lg border border-emerald-200/50 hover:from-emerald-100 hover:to-emerald-200/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-emerald-600 text-white rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{district.DistrictName}</div>
                        <div className="text-sm text-slate-600">District ID: {district.DistrictId}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-emerald-700">₹{district.TotalAmount.toLocaleString()}</div>
                      <div className="text-xs text-emerald-600 font-medium">Total Collection</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500">
                <Icons.Money />
                <p className="mt-2 font-medium">No fee collection data</p>
                <p className="text-sm">Check API connection for FY {selectedYear}</p>
              </div>
            )}
          </div>

          {/* Bottom Districts by Fee Collection */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Bottom Districts - Fee Collection</h3>
              <div className="text-sm text-slate-500 bg-amber-100 text-amber-800 px-3 py-1 rounded-lg font-medium">FY {selectedYear}</div>
            </div>
            
            {isLoading.districtApis ? (
              <LoadingSpinner />
            ) : bottomDistrictsByFee.length > 0 ? (
              <div className="space-y-3">
                {bottomDistrictsByFee.map((district, index) => (
                  <div key={district.DistrictId} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-lg border border-amber-200/50 hover:from-amber-100 hover:to-amber-200/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-amber-600 text-white rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{district.DistrictName}</div>
                        <div className="text-sm text-slate-600">District ID: {district.DistrictId}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-amber-700">₹{district.TotalAmount.toLocaleString()}</div>
                      <div className="text-xs text-amber-600 font-medium">Total Collection</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500">
                <Icons.Money />
                <p className="mt-2 font-medium">No fee collection data</p>
                <p className="text-sm">Check API connection for FY {selectedYear}</p>
              </div>
            )}
          </div>

          {/* Top Districts by Complaint */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Top Districts - Complaints</h3>
              <div className="text-sm text-slate-500 bg-rose-100 text-rose-800 px-3 py-1 rounded-lg font-medium">FY {selectedYear}</div>
            </div>
            
            {isLoading.districtApis ? (
              <LoadingSpinner />
            ) : topDistrictsByComplaint.length > 0 ? (
              <div className="space-y-3">
                {topDistrictsByComplaint.map((district, index) => (
                  <div key={district.DistrictId} className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-rose-100/50 rounded-lg border border-rose-200/50 hover:from-rose-100 hover:to-rose-200/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-rose-600 text-white rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{district.DistrictName}</div>
                        <div className="text-sm text-slate-600">District ID: {district.DistrictId}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-rose-700">{district.TotalComplaint}</div>
                      <div className="text-xs text-rose-600 font-medium">Total Complaints</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500">
                <Icons.Warning />
                <p className="mt-2 font-medium">No complaint data</p>
                <p className="text-sm">Check API connection for FY {selectedYear}</p>
              </div>
            )}
          </div>

          {/* Bottom Districts by Complaint */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Bottom Districts - Complaints</h3>
              <div className="text-sm text-slate-500 bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-medium">FY {selectedYear}</div>
            </div>
            
            {isLoading.districtApis ? (
              <LoadingSpinner />
            ) : bottomDistrictsByComplaint.length > 0 ? (
              <div className="space-y-3">
                {bottomDistrictsByComplaint.map((district, index) => (
                  <div key={district.DistrictId} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg border border-blue-200/50 hover:from-blue-100 hover:to-blue-200/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{district.DistrictName}</div>
                        <div className="text-sm text-slate-600">District ID: {district.DistrictId}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-700">{district.TotalComplaint}</div>
                      <div className="text-xs text-blue-600 font-medium">Total Complaints</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500">
                <Icons.Warning />
                <p className="mt-2 font-medium">No complaint data</p>
                <p className="text-sm">Check API connection for FY {selectedYear}</p>
              </div>
            )}
          </div>
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
                    dataKey="Village_Name" 
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

        {/* FIXED Fee Collection Details - Now shows API data properly */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Fee Collection Summary</h3>
            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                {monthOptions.find(m => m.value === selectedMonth)?.label} {selectedYear} Data
              </div>
              {isLoading.fees && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent"></div>
              )}
            </div>
          </div>
          
          {isLoading.fees ? (
            <LoadingSpinner />
          ) : feeData.length > 0 ? (
            <>
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
                      ? Math.round((totalCollection / (totalOutstanding)) * 100)
                      : 0}%
                  </div>
                  <div className="text-xs opacity-75 mt-1">Payment efficiency</div>
                </div>
              </div>

              {/* Fee Collection Details Table */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/50">
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Recent Transactions ({feeData.length} records)</h4>
                <div className="max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {feeData.slice(0, 10).map((fee) => (
                      <div key={fee.FeeCollectionId} className="bg-white p-4 rounded-lg border border-slate-200/50 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-slate-800">{fee.BeneficiaryName}</div>
                            <div className="text-sm text-slate-600">{fee.FatherHusbandName}</div>
                            <div className="text-xs text-slate-500">{fee.VillageName}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-mono text-slate-500">ID: {fee.FeeCollectionId}</div>
                            {fee.BalanceAmount > 0 && (
                              <div className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                                Balance Due
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-slate-500">Base Fee:</span>
                            <span className="font-semibold ml-1">₹{fee.BaseFee}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Paid:</span>
                            <span className="font-semibold ml-1 text-emerald-600">₹{fee.PaidAmount}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Outstanding:</span>
                            <span className="font-semibold ml-1 text-rose-600">₹{fee.OutstandingAmount}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Balance:</span>
                            <span className={`font-semibold ml-1 ${fee.BalanceAmount === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                              ₹{fee.BalanceAmount}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {feeData.length > 10 && (
                    <div className="text-center mt-4 text-sm text-slate-500">
                      Showing 10 of {feeData.length} records • 
                      <span className="font-medium"> {feeData.length - 10} more available</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-500">
              <Icons.Money />
              <p className="mt-2 font-medium">No fee collection data available</p>
              <p className="text-sm">Try selecting a different month/year or check API connection</p>
              <div className="mt-4 text-xs bg-slate-100 rounded-lg p-3 text-left max-w-md mx-auto">
                <p><strong>Current Parameters:</strong></p>
                <p>Month: {selectedMonth} ({monthOptions.find(m => m.value === selectedMonth)?.label})</p>
                <p>Year: {selectedYear}</p>
                <p>VillageId: 0 (All villages)</p>
              </div>
            </div>
          )}
        </div>

        {/* System Status Footer */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-xl p-6 border border-slate-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
                <span className="text-sm font-semibold">System Online</span>
              </div>
              <div className="text-sm opacity-75">
                • Data for {monthOptions.find(m => m.value === selectedMonth)?.label} {selectedYear}
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
                <span className="font-medium">{totalVillageCount} Villages</span>
              </div>
              <div className="flex items-center gap-2 opacity-90">
                <Icons.Money />
                <span className="font-medium">₹{totalCollection.toLocaleString()} Collected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}