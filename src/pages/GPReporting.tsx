import React, { useState, useEffect } from 'react';
import { Calendar, Download, RefreshCw, BarChart3, FileText, Users, MapPin, Zap, Droplets, AlertCircle, TrendingUp } from 'lucide-react';

// Mock userInfo hook for demo
const useUserInfo = () => ({
  userId: 1,
  role: 'Admin',
  isLoading: false
});

// Interfaces
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

interface ApiResponse<T> {
  Data: T;
  Error?: string | null;
  Errror?: string | null;
  Message: string;
  Status: boolean;
}

const MISReportingPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const { userId, role, isLoading: userLoading } = useUserInfo();
  
  // Data states
  const [pumpHouses, setPumpHouses] = useState<PumpHouseData[]>([]);
  const [roasterData, setRoasterData] = useState<MonthlyRoasterData[]>([]);
  const [ohtCount, setOHTCount] = useState<number>(0);
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  const [feeData, setFeeData] = useState<FeeCollectionData[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  // Summary states
  const [summary, setSummary] = useState({
    totalPumps: 0,
    activePumps: 0,
    totalOHTs: 0,
    totalCapacity: 0,
    totalComplaints: 0,
    resolvedComplaints: 0,
    totalCollection: 0,
    totalOutstanding: 0,
    totalBeneficiaries: 0,
    activeConnections: 0,
    pendingComplaints: 0,
    totalVillages: 0
  });

  const [loadingStates, setLoadingStates] = useState({
    pumpHouses: false,
    complaints: false,
    ohtData: false,
    feeData: false,
    villages: false,
    dashboardStats: false
  });

  // Helper function to determine if user is admin
  const isAdmin = () => {
    return role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'administrator';
  };

  // Fetch dashboard statistics (Admin vs GP)
  const fetchDashboardStats = async () => {
    if (!userId) return;
    
    setLoadingStates(prev => ({ ...prev, dashboardStats: true }));
    
    try {
      const baseBody = { InputType: "string" };
      
      if (isAdmin()) {
        // Use Admin APIs
        const [beneficiariesRes, connectionsRes, complaintsRes, ohtCountRes, pumpCountRes, villageCountRes] = await Promise.all([
          fetch("https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTotalBeneficiaryCountforAdmin", {
            method: "POST",
            headers: { "Content-Type": "application/json", accept: "*/*" },
            body: JSON.stringify(baseBody)
          }),
          fetch("https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTotalActiveWaterConnectionCountforAdmin", {
            method: "POST",
            headers: { "Content-Type": "application/json", accept: "*/*" },
            body: JSON.stringify(baseBody)
          }),
          fetch("https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTotalPendingComplaintCountforAdmin", {
            method: "POST",
            headers: { "Content-Type": "application/json", accept: "*/*" },
            body: JSON.stringify(baseBody)
          }),
          fetch("https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTotalOverHeadTankCountforAdmin", {
            method: "POST",
            headers: { "Content-Type": "application/json", accept: "*/*" },
            body: JSON.stringify(baseBody)
          }),
          fetch("https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTotalActivePumphouseCountforAdmin", {
            method: "POST",
            headers: { "Content-Type": "application/json", accept: "*/*" },
            body: JSON.stringify(baseBody)
          }),
          fetch("https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTotalVillageCountforAdmin", {
            method: "POST",
            headers: { "Content-Type": "application/json", accept: "*/*" },
            body: JSON.stringify(baseBody)
          })
        ]);

        const [beneficiariesData, connectionsData, complaintsData, ohtCountData, pumpCountData, villageCountData] = await Promise.all([
          beneficiariesRes.json(),
          connectionsRes.json(),
          complaintsRes.json(),
          ohtCountRes.json(),
          pumpCountRes.json(),
          villageCountRes.json()
        ]);

        setSummary(prev => ({
          ...prev,
          totalBeneficiaries: beneficiariesData?.Status && beneficiariesData?.Data?.TotalBeneficiaryCount ? beneficiariesData.Data.TotalBeneficiaryCount : 0,
          activeConnections: connectionsData?.Status && connectionsData?.Data?.TotalActiveWaterConnectionCount ? connectionsData.Data.TotalActiveWaterConnectionCount : 0,
          pendingComplaints: complaintsData?.Status && complaintsData?.Data?.TotalPendingComplaintCount ? complaintsData.Data.TotalPendingComplaintCount : 0,
          totalOHTs: ohtCountData?.Status && ohtCountData?.Data?.TotalOverHeadTankCount ? ohtCountData.Data.TotalOverHeadTankCount : 0,
          activePumps: pumpCountData?.Status && pumpCountData?.Data?.TotalActivePumphouseCount ? pumpCountData.Data.TotalActivePumphouseCount : 0,
          totalVillages: villageCountData?.Status && villageCountData?.Data?.TotalVillageCount ? villageCountData.Data.TotalVillageCount : 0
        }));

      } else {
        // Use existing GP APIs
        const [beneficiariesRes, connectionsRes, complaintsRes] = await Promise.all([
          fetch("https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTotalBeneficiaryCountforAdmin", {
            method: "POST",
            headers: { "Content-Type": "application/json", accept: "*/*" },
            body: JSON.stringify(baseBody)
          }),
          fetch("https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTotalActiveWaterConnectionCountforAdmin", {
            method: "POST",
            headers: { "Content-Type": "application/json", accept: "*/*" },
            body: JSON.stringify(baseBody)
          }),
          fetch("https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTotalPendingComplaintCountforAdmin", {
            method: "POST",
            headers: { "Content-Type": "application/json", accept: "*/*" },
            body: JSON.stringify(baseBody)
          })
        ]);

        const [beneficiariesData, connectionsData, complaintsData] = await Promise.all([
          beneficiariesRes.json(),
          connectionsRes.json(),
          complaintsRes.json()
        ]);

        setSummary(prev => ({
          ...prev,
          totalBeneficiaries: beneficiariesData?.Status && beneficiariesData?.Data?.TotalBeneficiaryCount ? beneficiariesData.Data.TotalBeneficiaryCount : 0,
          activeConnections: connectionsData?.Status && connectionsData?.Data?.TotalActiveWaterConnectionCount ? connectionsData.Data.TotalActiveWaterConnectionCount : 0,
          pendingComplaints: complaintsData?.Status && complaintsData?.Data?.TotalPendingComplaintCount ? complaintsData.Data.TotalPendingComplaintCount : 0
        }));
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoadingStates(prev => ({ ...prev, dashboardStats: false }));
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    if (!userId) {
      console.warn('UserId not available yet');
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchPumpHouses(),
        fetchComplaints(),
        fetchVillages()
      ]);
    } catch (err) {
      console.error('Error in fetchAllData:', err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchPumpHouses = async () => {
    if (!userId) return;
    
    setLoadingStates(prev => ({ ...prev, pumpHouses: true }));
    
    try {
      const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetPumpHouseListByUserId?UserId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Pump Houses Data:', data);
      
      if (data.Status && Array.isArray(data.Data)) {
        setPumpHouses(data.Data);
      } else {
        console.warn('Invalid pump houses response:', data);
        setPumpHouses([]);
      }
    } catch (error) {
      console.error('Error fetching pump houses:', error);
      setPumpHouses([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, pumpHouses: false }));
    }
  };

  const fetchVillages = async () => {
    if (!userId) return;
    
    setLoadingStates(prev => ({ ...prev, villages: true }));
    
    try {
      const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetVillageListByUserId?UserId=${userId}`);
      const data: ApiResponse<Village[]> = await response.json();
      
      if (data.Status && Array.isArray(data.Data)) {
        setVillages(data.Data);
        
        // Fetch OHT count and Fee data for all villages
        await fetchOHTCountForUser();
        await fetchFeeDataForAllVillages(data.Data);
      }
    } catch (error) {
      console.error('Error fetching villages:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, villages: false }));
    }
  };

  const fetchOHTCountForUser = async () => {
    if (!userId) return;
    
    setLoadingStates(prev => ({ ...prev, ohtData: true }));
    
    try {
      // Fetch OHT count for all villages (VillageId=0 means all villages for the user)
      const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetOHTCountByVillage?VillageId=0&UserId=${userId}`);
      const data: ApiResponse<OHTCountData> = await response.json();
      
      if (data.Status && data.Data && typeof data.Data.TotalOHTCount === 'number') {
        setOHTCount(data.Data.TotalOHTCount);
        setSummary(prev => ({ ...prev, totalOHTs: data.Data.TotalOHTCount }));
      } else {
        console.warn('Invalid OHT count response:', data);
        setOHTCount(0);
      }
    } catch (error) {
      console.error('Error fetching OHT count:', error);
      setOHTCount(0);
    } finally {
      setLoadingStates(prev => ({ ...prev, ohtData: false }));
    }
  };

  const fetchFeeDataForAllVillages = async (villageList: Village[]) => {
    setLoadingStates(prev => ({ ...prev, feeData: true }));
    
    try {
      const allFeeData: FeeCollectionData[] = [];
      
      // Fetch fee data for each village
      for (const village of villageList) {
        try {
          const response = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/GetFeeCollectionDetails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              VillageId: village.VillageId,
              Month: selectedMonth,
              Year: selectedYear
            })
          });
          
          const data: ApiResponse<FeeCollectionData[]> = await response.json();
          
          if (data.Status && Array.isArray(data.Data)) {
            allFeeData.push(...data.Data);
          }
        } catch (error) {
          console.error(`Error fetching fee data for village ${village.VillageId}:`, error);
        }
      }
      
      setFeeData(allFeeData);
    } catch (error) {
      console.error('Error fetching fee data for all villages:', error);
      setFeeData([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, feeData: false }));
    }
  };

  const fetchComplaints = async () => {
    setLoadingStates(prev => ({ ...prev, complaints: true }));
    
    try {
      const response = await fetch('https://wmsapi.kdsgroup.co.in/api/Complain/GetComplaintListByUserIdVillageAndStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          UserId: isAdmin() ? 0 : userId, // Admin gets all complaints, GP gets filtered
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
      setLoadingStates(prev => ({ ...prev, complaints: false }));
    }
  };

  const fetchRoasterData = async () => {
    if (pumpHouses.length === 0) return;
    
    try {
      const uniqueGPIds = [...new Set(pumpHouses.map(p => p.PumpId))];
      const allRoasterData: MonthlyRoasterData[] = [];
      
      for (const gpId of uniqueGPIds) {
        try {
          const response = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/GetMonthlyRoasterWithSchedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              GPId: gpId,
              VillgeId: 0, // 0 for all villages under the GP
              Month: selectedMonth,
              Year: selectedYear
            })
          });
          
          const data: ApiResponse<MonthlyRoasterData[]> = await response.json();
          
          if (data.Status && Array.isArray(data.Data)) {
            allRoasterData.push(...data.Data);
          }
        } catch (error) {
          console.error(`Error fetching roaster data for GP ${gpId}:`, error);
        }
      }
      
      setRoasterData(allRoasterData);
    } catch (error) {
      console.error('Error fetching roaster data:', error);
      setRoasterData([]);
    }
  };

  // Calculate summary statistics from local data
  useEffect(() => {
    if (pumpHouses.length === 0 && ohtCount === 0 && complaints.length === 0 && feeData.length === 0) {
      return;
    }

    const totalPumps = pumpHouses.length;
    const localActivePumps = pumpHouses.filter(p => p.Status === 1).length;
    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter(c => c.Status === true).length;
    const totalCollection = feeData.reduce((sum, fee) => sum + fee.PaidAmount, 0);
    const totalOutstanding = feeData.reduce((sum, fee) => sum + fee.OutstandingAmount, 0);
    const localBeneficiaries = new Set(feeData.map(f => f.BeneficiaryId)).size;

    setSummary(prev => ({
      ...prev,
      totalPumps,
      activePumps: isAdmin() ? prev.activePumps : localActivePumps,
      totalComplaints,
      resolvedComplaints,
      totalCollection,
      totalOutstanding,
      totalBeneficiaries: isAdmin() ? prev.totalBeneficiaries : localBeneficiaries
    }));
  }, [pumpHouses, ohtCount, complaints, feeData, role]);

  // Initialize data on component mount
  useEffect(() => {
    if (userId && role) {
      fetchAllData();
    }
  }, [userId, role]);

  // Fetch roaster data when pump houses are loaded or month/year changes
  useEffect(() => {
    fetchRoasterData();
  }, [pumpHouses, selectedMonth, selectedYear]);

  // Re-fetch fee data when month/year changes
  useEffect(() => {
    if (villages.length > 0) {
      fetchFeeDataForAllVillages(villages);
    }
  }, [selectedMonth, selectedYear]);

  const handleRefresh = async () => {
    // Clear all data states
    setPumpHouses([]);
    setOHTCount(0);
    setFeeData([]);
    setRoasterData([]);
    setComplaints([]);
    setVillages([]);
    
    // Reset summary to initial state
    setSummary({
      totalPumps: 0,
      activePumps: 0,
      totalOHTs: 0,
      totalCapacity: 0,
      totalComplaints: 0,
      resolvedComplaints: 0,
      totalCollection: 0,
      totalOutstanding: 0,
      totalBeneficiaries: 0,
      activeConnections: 0,
      pendingComplaints: 0,
      totalVillages: 0
    });
    
    // Add small delay to ensure state updates
    await new Promise(resolve => setTimeout(resolve, 100));
    
    fetchAllData();
  };

  const handleDownloadReport = (reportType: string) => {
    let exportData: any[] = [];
    let filename = "";

    switch (reportType) {
      case 'pump-house':
        if (pumpHouses.length === 0) {
          alert('No pump house data available to download');
          return;
        }
        exportData = pumpHouses.map(pump => ({
          'OHT ID': pump.OhtId,
          'Operator Name': pump.OperatorName,
          'Contact': pump.Contact,
          'Pump ID': pump.PumpId,
          'Horse Power': pump.HorsePower,
          'Power Source': pump.PowerSource === '1' ? 'Electric' : 'Solar',
          'Solar Output (kW)': pump.SolarOutput,
          'Status': pump.Status === 1 ? 'Active' : 'Inactive'
        }));
        filename = `pump_house_report_${selectedYear}_${selectedMonth}.csv`;
        break;

      case 'oht':
        exportData = [{
          'Total OHT Count': ohtCount,
          'Report Period': `${getMonthName(selectedMonth)} ${selectedYear}`,
          'Generated On': new Date().toLocaleDateString()
        }];
        filename = `oht_count_report_${selectedYear}_${selectedMonth}.csv`;
        break;

      case 'complaints':
        if (complaints.length === 0) {
          alert('No complaints data available to download');
          return;
        }
        exportData = complaints.map(complaint => ({
          'Complaint ID': complaint.ComplaintID,
          'District': complaint.District,
          'Block': complaint.Block,
          'Gram Panchayat': complaint.GramPanchayat,
          'Village': complaint.Village,
          'Beneficiary Name': complaint.BeneficiaryName,
          'Contact': complaint.Contact,
          'Landmark': complaint.Landmark,
          'Category': complaint.Category,
          'Status': complaint.Status ? 'Resolved' : 'Pending'
        }));
        filename = `complaints_report_${selectedYear}_${selectedMonth}.csv`;
        break;

      case 'fee-collection':
        if (feeData.length === 0) {
          alert('No fee collection data available to download');
          return;
        }
        exportData = feeData.map(fee => ({
          'Fee Collection ID': fee.FeeCollectionId,
          'Village': fee.VillageName,
          'Beneficiary Name': fee.BeneficiaryName,
          'Father/Husband Name': fee.FatherHusbandName,
          'Base Fee': fee.BaseFee,
          'Previous Balance': fee.PreviousBalance,
          'Outstanding Amount': fee.OutstandingAmount,
          'Paid Amount': fee.PaidAmount,
          'Balance Amount': fee.BalanceAmount
        }));
        filename = `fee_collection_report_${selectedYear}_${selectedMonth}.csv`;
        break;

      case 'roaster':
        if (roasterData.length === 0) {
          alert('No roaster data available to download');
          return;
        }
        exportData = roasterData.map(roaster => ({
          'Roaster ID': roaster.RoasterId,
          'GP ID': roaster.GPId,
          'Village ID': roaster.VillageId,
          'Roaster Date': roaster.RoasterDate,
          'Activity Type': roaster.ActivityType,
          'Start Date': roaster.StartDate,
          'End Date': roaster.EndDate,
          'Remark': roaster.Remark,
          'Status': roaster.Status === 1 ? 'Active' : 'Inactive'
        }));
        filename = `roaster_report_${selectedYear}_${selectedMonth}.csv`;
        break;

      case 'consolidated':
        exportData = [{
          'Report Type': 'Summary',
          'Total Pumps': summary.totalPumps,
          'Active Pumps': summary.activePumps,
          'Total OHTs': summary.totalOHTs,
          'Total Complaints': summary.totalComplaints,
          'Resolved Complaints': summary.resolvedComplaints,
          'Total Collection (₹)': summary.totalCollection,
          'Total Outstanding (₹)': summary.totalOutstanding,
          'Total Beneficiaries': summary.totalBeneficiaries,
          'Active Connections': summary.activeConnections,
          'Pending Complaints': summary.pendingComplaints,
          'Collection Efficiency (%)': summary.totalCollection + summary.totalOutstanding > 0 
            ? Math.round((summary.totalCollection / (summary.totalCollection + summary.totalOutstanding)) * 100) 
            : 0
        }];
        filename = `consolidated_report_${selectedYear}_${selectedMonth}.csv`;
        break;

      default:
        alert('Invalid report type');
        return;
    }

    if (exportData.length === 0) {
      alert('No data available to download');
      return;
    }

    try {
      // Simple CSV export
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => headers.map(header => `"${row[header]}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating CSV file:', error);
      alert('Error generating CSV file. Please try again.');
    }
  };

  const getMonthName = (month: number): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
  };

  const reportCards = [
    {
      title: "Pump House Report",
      description: "Complete pump house inventory and status",
      icon: <Zap className="w-6 h-6" />,
      count: pumpHouses.length,
      active: summary.activePumps,
      downloadKey: 'pump-house',
      color: 'blue',
      loading: loadingStates.pumpHouses
    },
    {
      title: "OHT Count Report",
      description: "Overhead tank count and status",
      icon: <Droplets className="w-6 h-6" />,
      count: ohtCount,
      active: ohtCount,
      downloadKey: 'oht',
      color: 'green',
      loading: loadingStates.ohtData
    },
    {
      title: "Complaints Report",
      description: "Complaint status and resolution tracking",
      icon: <AlertCircle className="w-6 h-6" />,
      count: complaints.length,
      active: summary.resolvedComplaints,
      downloadKey: 'complaints',
      color: 'orange',
      loading: loadingStates.complaints
    },
    {
      title: "Fee Collection Report",
      description: "Revenue collection and outstanding dues",
      icon: <TrendingUp className="w-6 h-6" />,
      count: feeData.length,
      active: Math.round(summary.totalCollection / 1000),
      downloadKey: 'fee-collection',
      color: 'purple',
      loading: loadingStates.feeData
    },
    {
      title: "Roaster Schedule Report",
      description: "Monthly operation schedules and activities",
      icon: <Calendar className="w-6 h-6" />,
      count: roasterData.length,
      active: roasterData.filter(r => r.Status === 1).length,
      downloadKey: 'roaster',
      color: 'indigo',
      loading: false
    }
  ];

  if (userLoading) {
    return (
      <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen relative z-10">
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 shadow-lg text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">MIS & Reporting Dashboard</h1>
              <p className="text-blue-100">
                Comprehensive reporting and analytics for {isAdmin() ? 'Administrative' : 'Gram Panchayat'} water management
              </p>
              <div className="text-sm text-blue-200 mt-2">
                Role: {role} | User ID: {userId}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-200">Report Period</div>
              <div className="text-lg font-semibold">
                {getMonthName(selectedMonth)} {selectedYear}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {getMonthName(i + 1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
            
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
              <button
                onClick={() => handleDownloadReport('consolidated')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download All
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <div className="font-semibold">Error</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading dashboard data...</span>
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {loadingStates.dashboardStats ? (
                    <div className="animate-pulse bg-gray-300 h-6 w-16 rounded"></div>
                  ) : (
                    `${summary.activePumps}/${summary.totalPumps}`
                  )}
                </div>
                <div className="text-sm font-medium text-gray-700">Active Pumps</div>
              </div>
              <Zap className="w-8 h-8 text-blue-600 opacity-60" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {loadingStates.ohtData ? (
                    <div className="animate-pulse bg-gray-300 h-6 w-16 rounded"></div>
                  ) : (
                    `${summary.totalOHTs}`
                  )}
                </div>
                <div className="text-sm font-medium text-gray-700">Total OHTs</div>
              </div>
              <Droplets className="w-8 h-8 text-green-600 opacity-60" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {loadingStates.dashboardStats ? (
                    <div className="animate-pulse bg-gray-300 h-6 w-16 rounded"></div>
                  ) : (
                    `${summary.pendingComplaints}`
                  )}
                </div>
                <div className="text-sm font-medium text-gray-700">Pending Complaints</div>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600 opacity-60" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {loadingStates.feeData ? (
                    <div className="animate-pulse bg-gray-300 h-6 w-16 rounded"></div>
                  ) : (
                    `₹${(summary.totalCollection / 1000).toFixed(0)} K`
                  )}
                </div>
                <div className="text-sm font-medium text-gray-700">Fee Collection</div>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600 opacity-60" />
            </div>
          </div>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {reportCards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className={`bg-gradient-to-r from-${card.color}-500 to-${card.color}-600 p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {card.loading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    ) : (
                      card.icon
                    )}
                    <h3 className="font-semibold text-lg">{card.title}</h3>
                  </div>
                  <FileText className="w-5 h-5 opacity-75" />
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4">{card.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-2xl font-bold text-gray-800">
                      {card.loading ? (
                        <div className="animate-pulse bg-gray-300 h-6 w-12 rounded"></div>
                      ) : (
                        card.count
                      )}
                    </div>
                    <div className="text-sm text-gray-500">Total Records</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-green-600">
                      {card.loading ? (
                        <div className="animate-pulse bg-gray-300 h-5 w-10 rounded"></div>
                      ) : (
                        card.active
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {card.downloadKey === 'pump-house' ? 'Active' :
                       card.downloadKey === 'oht' ? 'Available' :
                       card.downloadKey === 'complaints' ? 'Resolved' :
                       card.downloadKey === 'fee-collection' ? 'K Collection' :
                       'Active'}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDownloadReport(card.downloadKey)}
                  disabled={card.count === 0 || card.loading || loading}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-${card.color}-600 text-white rounded-lg hover:bg-${card.color}-700 disabled:bg-gray-400 transition-colors`}
                >
                  <Download className="w-4 h-4" />
                  {card.loading ? 'Loading...' : 'Download Report'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Infrastructure Overview */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Infrastructure Overview
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Total Villages Covered</span>
                <span className="font-semibold">
                  {loadingStates.villages ? (
                    <div className="animate-pulse bg-gray-300 h-4 w-8 rounded"></div>
                  ) : (
                    isAdmin() ? summary.totalVillages : villages.length
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Pump House Coverage</span>
                <span className="font-semibold">
                  {loadingStates.pumpHouses ? (
                    <div className="animate-pulse bg-gray-300 h-4 w-12 rounded"></div>
                  ) : (
                    `${summary.totalPumps} units`
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">OHT Infrastructure</span>
                <span className="font-semibold">
                  {loadingStates.ohtData ? (
                    <div className="animate-pulse bg-gray-300 h-4 w-12 rounded"></div>
                  ) : (
                    `${summary.totalOHTs} tanks`
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Solar Pumps</span>
                <span className="font-semibold">
                  {loadingStates.pumpHouses ? (
                    <div className="animate-pulse bg-gray-300 h-4 w-8 rounded"></div>
                  ) : (
                    pumpHouses.filter(p => p.PowerSource === '2').length
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Operational Efficiency</span>
                <span className="font-semibold text-green-600">
                  {loadingStates.pumpHouses || loadingStates.dashboardStats ? (
                    <div className="animate-pulse bg-gray-300 h-4 w-10 rounded"></div>
                  ) : (
                    `${summary.totalPumps > 0 ? Math.round((summary.activePumps / summary.totalPumps) * 100) : 0}%`
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Financial Summary
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Total Collection</span>
                <span className="font-semibold text-green-600">
                  {loadingStates.feeData ? (
                    <div className="animate-pulse bg-gray-300 h-4 w-16 rounded"></div>
                  ) : (
                    `₹${summary.totalCollection.toLocaleString()}`
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Outstanding Amount</span>
                <span className="font-semibold text-red-600">
                  {loadingStates.feeData ? (
                    <div className="animate-pulse bg-gray-300 h-4 w-16 rounded"></div>
                  ) : (
                    `₹${summary.totalOutstanding.toLocaleString()}`
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Active Beneficiaries</span>
                <span className="font-semibold">
                  {loadingStates.dashboardStats || loadingStates.feeData ? (
                    <div className="animate-pulse bg-gray-300 h-4 w-12 rounded"></div>
                  ) : (
                    summary.totalBeneficiaries
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Active Connections</span>
                <span className="font-semibold">
                  {loadingStates.dashboardStats ? (
                    <div className="animate-pulse bg-gray-300 h-4 w-12 rounded"></div>
                  ) : (
                    summary.activeConnections
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Collection Efficiency</span>
                <span className="font-semibold text-blue-600">
                  {loadingStates.feeData ? (
                    <div className="animate-pulse bg-gray-300 h-4 w-10 rounded"></div>
                  ) : (
                    `${summary.totalCollection + summary.totalOutstanding > 0 
                      ? Math.round((summary.totalCollection / (summary.totalCollection + summary.totalOutstanding)) * 100) 
                      : 0}%`
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Avg Collection/Beneficiary</span>
                <span className="font-semibold">
                  {loadingStates.feeData || loadingStates.dashboardStats ? (
                    <div className="animate-pulse bg-gray-300 h-4 w-12 rounded"></div>
                  ) : (
                    `₹${summary.totalBeneficiaries > 0 ? Math.round(summary.totalCollection / summary.totalBeneficiaries) : 0}`
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Status Overview */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-4 text-white">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Data Overview & Export Status
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 p-4 rounded border">
                <div className="font-medium text-gray-800 mb-2">Infrastructure Data</div>
                <div className="space-y-1 text-gray-600">
                  <div>Pump Houses: {loadingStates.pumpHouses ? 'Loading...' : `${pumpHouses.length} records`}</div>
                  <div>OHT Count: {loadingStates.ohtData ? 'Loading...' : `${ohtCount} tanks`}</div>
                  <div>Villages: {loadingStates.villages ? 'Loading...' : `${villages.length} locations`}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded border">
                <div className="font-medium text-gray-800 mb-2">Operational Data</div>
                <div className="space-y-1 text-gray-600">
                  <div>Roaster Schedules: {roasterData.length} entries</div>
                  <div>Complaints: {loadingStates.complaints ? 'Loading...' : `${complaints.length} cases`}</div>
                  <div>Last Updated: {new Date().toLocaleDateString()}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded border">
                <div className="font-medium text-gray-800 mb-2">Financial Data</div>
                <div className="space-y-1 text-gray-600">
                  <div>Fee Records: {loadingStates.feeData ? 'Loading...' : `${feeData.length} entries`}</div>
                  <div>Beneficiaries: {loadingStates.dashboardStats || loadingStates.feeData ? 'Loading...' : `${summary.totalBeneficiaries} active`}</div>
                  <div>Period: {getMonthName(selectedMonth)} {selectedYear}</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  All reports are generated from live data. Export options are available for each module.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">
                    Data Source: Live API
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
                    Format: CSV
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs">
                    Updated: Real-time
                  </span>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs">
                    Role: {isAdmin() ? 'Administrator' : 'Gram Panchayat'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Status Overview */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 text-white">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              API Integration Status
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="font-medium text-gray-800">API Endpoints Used:</div>
                <div className="space-y-1 text-gray-600 ml-2">
                  <div>✓ GetPumpHouseListByUserId</div>
                  <div>✓ GetVillageListByUserId</div>
                  <div>✓ GetOHTCountByVillage</div>
                  <div>✓ GetFeeCollectionDetails</div>
                  <div>✓ GetMonthlyRoasterWithSchedule</div>
                  <div>✓ GetComplaintListByUserIdVillageAndStatus</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium text-gray-800">Data Processing:</div>
                <div className="space-y-1 text-gray-600 ml-2">
                  <div>• Real-time API calls</div>
                  <div>• Dynamic month/year filtering</div>
                  <div>• Automatic data aggregation</div>
                  <div>• Cross-village data compilation</div>
                  <div>• Role-based data access</div>
                  <div>• CSV export functionality</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <strong>Note:</strong> OHT data shows count only as per API specification. 
                Fee collection data is fetched per village for the selected month/year period.
                All exports are in CSV format for maximum compatibility.
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-6 border">
          <div className="text-center">
            <p className="text-gray-700 font-medium mb-2">
              Water Management System - MIS Dashboard ({isAdmin() ? 'Administrator View' : 'Gram Panchayat View'})
            </p>
            <p className="text-sm text-gray-600">
              Report generated on {new Date().toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })} for {getMonthName(selectedMonth)} {selectedYear}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MISReportingPage;