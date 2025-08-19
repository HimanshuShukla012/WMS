import React, { useState, useEffect } from 'react';
import { Calendar, Download, RefreshCw, BarChart3, FileText, Users, MapPin, Zap, Droplets, AlertCircle, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useUserInfo } from "../utils/userInfo";


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

const MISReportingPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
const { userId, role, isLoading: userLoading } = useUserInfo();
  
  // Data states
  const [pumpHouses, setPumpHouses] = useState<PumpHouseData[]>([]);
  const [roasterData, setRoasterData] = useState<MonthlyRoasterData[]>([]);
  const [ohtData, setOHTData] = useState<OHTData[]>([]);
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
    totalBeneficiaries: 0
  });

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    setError("");
    
    try {
      await Promise.all([
        fetchPumpHouses(),
        fetchVillages(),
        fetchComplaints(),
      ]);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchPumpHouses = async () => {
    try {
      const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetPumpHouseListByUserId?UserId=${userId}`);
      const data: ApiResponse<PumpHouseData[]> = await response.json();
      
      if (data.Status && Array.isArray(data.Data)) {
        setPumpHouses(data.Data);
      }
    } catch (error) {
      console.error('Error fetching pump houses:', error);
    }
  };

  const fetchVillages = async () => {
    try {
      const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetVillageListByUserId?UserId=${userId}`);
      const data: ApiResponse<Village[]> = await response.json();
      
      if (data.Status && Array.isArray(data.Data)) {
        setVillages(data.Data);
        // Fetch OHT and Fee data for each village
        for (const village of data.Data) {
          await fetchOHTData(village.VillageId);
          await fetchFeeData(village.VillageId);
        }
      }
    } catch (error) {
      console.error('Error fetching villages:', error);
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
    try {
      const token = localStorage.getItem("authToken") || "";
      const response = await fetch('https://wmsapi.kdsgroup.co.in/api/Complain/GetComplaintListByUserIdVillageAndStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const fetchRoasterData = async (pumpId: number) => {
    try {
      const response = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/GetMonthlyRoasterWithSchedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          GPId: pumpId,
          VillgeId: 0,
          Month: selectedMonth,
          Year: selectedYear
        })
      });
      
      const data: ApiResponse<MonthlyRoasterData[]> = await response.json();
      
      if (data.Status && Array.isArray(data.Data)) {
        setRoasterData(prev => [...prev, ...data.Data]);
      }
    } catch (error) {
      console.error(`Error fetching roaster data for pump ${pumpId}:`, error);
    }
  };

  // Calculate summary statistics
  useEffect(() => {
    const totalPumps = pumpHouses.length;
    const activePumps = pumpHouses.filter(p => p.Status === 1).length;
    const totalOHTs = ohtData.length;
    const totalCapacity = ohtData.reduce((sum, oht) => sum + oht.OHTCapacity, 0);
    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter(c => c.Status === true).length;
    const totalCollection = feeData.reduce((sum, fee) => sum + fee.PaidAmount, 0);
    const totalOutstanding = feeData.reduce((sum, fee) => sum + fee.OutstandingAmount, 0);
    const totalBeneficiaries = new Set(feeData.map(f => f.BeneficiaryId)).size;

    setSummary({
      totalPumps,
      activePumps,
      totalOHTs,
      totalCapacity,
      totalComplaints,
      resolvedComplaints,
      totalCollection,
      totalOutstanding,
      totalBeneficiaries
    });
  }, [pumpHouses, ohtData, complaints, feeData]);

  // Initialize data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch roaster data when pump houses are loaded
  useEffect(() => {
    if (pumpHouses.length > 0) {
      setRoasterData([]); // Clear previous data
      const uniquePumpIds = [...new Set(pumpHouses.map(p => p.PumpId))];
      uniquePumpIds.forEach(pumpId => {
        fetchRoasterData(pumpId);
      });
    }
  }, [pumpHouses, selectedMonth, selectedYear]);

  const handleRefresh = () => {
    setOHTData([]);
    setFeeData([]);
    setRoasterData([]);
    fetchAllData();
  };

  const handleDownloadReport = (reportType: string) => {
    let exportData: any[] = [];
    let filename = "";

    switch (reportType) {
      case 'pump-house':
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
        filename = `pump_house_report_${selectedYear}_${selectedMonth}.xlsx`;
        break;

      case 'oht':
        exportData = ohtData.map(oht => ({
          'OHT ID': oht.OhtId,
          'District': oht.Districtname,
          'Block': oht.BlockName,
          'Gram Panchayat': oht.GramPanchayatName,
          'Village': oht.VillageName,
          'Capacity (L)': oht.OHTCapacity,
          'Number of Pumps': oht.NoOfPumps
        }));
        filename = `oht_report_${selectedYear}_${selectedMonth}.xlsx`;
        break;

      case 'complaints':
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
        filename = `complaints_report_${selectedYear}_${selectedMonth}.xlsx`;
        break;

      case 'fee-collection':
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
        filename = `fee_collection_report_${selectedYear}_${selectedMonth}.xlsx`;
        break;

      case 'roaster':
        exportData = roasterData.map(roaster => ({
          'Roaster ID': roaster.RoasterId,
          'GP ID': roaster.GPId,
          'Village ID': roaster.VillageId,
          'Roaster Date': roaster.RoasterDate,
          'Activity Type': roaster.ActivityType,
          'Start Date': roaster.StartDate,
          'End Date': roaster.EndDate,
          'Status': roaster.Status === 1 ? 'Active' : 'Inactive'
        }));
        filename = `roaster_report_${selectedYear}_${selectedMonth}.xlsx`;
        break;

      case 'consolidated':
        exportData = [{
          'Report Type': 'Summary',
          'Total Pumps': summary.totalPumps,
          'Active Pumps': summary.activePumps,
          'Total OHTs': summary.totalOHTs,
          'Total Capacity (L)': summary.totalCapacity,
          'Total Complaints': summary.totalComplaints,
          'Resolved Complaints': summary.resolvedComplaints,
          'Total Collection (₹)': summary.totalCollection,
          'Total Outstanding (₹)': summary.totalOutstanding,
          'Total Beneficiaries': summary.totalBeneficiaries,
          'Collection Efficiency (%)': summary.totalCollection + summary.totalOutstanding > 0 
            ? Math.round((summary.totalCollection / (summary.totalCollection + summary.totalOutstanding)) * 100) 
            : 0
        }];
        filename = `consolidated_report_${selectedYear}_${selectedMonth}.xlsx`;
        break;

      default:
        return;
    }

    if (exportData.length === 0) {
      alert('No data available to download');
      return;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, reportType.replace('-', '_').toUpperCase());
    XLSX.writeFile(wb, filename);
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
      active: pumpHouses.filter(p => p.Status === 1).length,
      downloadKey: 'pump-house',
      color: 'blue'
    },
    {
      title: "OHT Infrastructure Report",
      description: "Overhead tank capacity and distribution",
      icon: <Droplets className="w-6 h-6" />,
      count: ohtData.length,
      active: Math.round(summary.totalCapacity / 1000),
      downloadKey: 'oht',
      color: 'green'
    },
    {
      title: "Complaints Report",
      description: "Complaint status and resolution tracking",
      icon: <AlertCircle className="w-6 h-6" />,
      count: complaints.length,
      active: summary.resolvedComplaints,
      downloadKey: 'complaints',
      color: 'orange'
    },
    {
      title: "Fee Collection Report",
      description: "Revenue collection and outstanding dues",
      icon: <TrendingUp className="w-6 h-6" />,
      count: summary.totalBeneficiaries,
      active: Math.round(summary.totalCollection / 1000),
      downloadKey: 'fee-collection',
      color: 'purple'
    },
    {
      title: "Roaster Schedule Report",
      description: "Monthly operation schedules and activities",
      icon: <Calendar className="w-6 h-6" />,
      count: roasterData.length,
      active: roasterData.filter(r => r.Status === 1).length,
      downloadKey: 'roaster',
      color: 'indigo'
    }
  ];

  return (
    <div className="w-full bg-gray-50 min-h-screen relative z-10">
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 shadow-lg text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">MIS & Reporting Dashboard</h1>
              <p className="text-blue-100">
                Comprehensive reporting and analytics for Gram Panchayat water management
              </p>
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
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
                <div className="text-2xl font-bold text-blue-600">{summary.activePumps}/{summary.totalPumps}</div>
                <div className="text-sm font-medium text-gray-700">Active Pumps</div>
              </div>
              <Zap className="w-8 h-8 text-blue-600 opacity-60" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{(summary.totalCapacity / 1000).toFixed(0)} KL</div>
                <div className="text-sm font-medium text-gray-700">Total OHT Capacity</div>
              </div>
              <Droplets className="w-8 h-8 text-green-600 opacity-60" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{summary.resolvedComplaints}/{summary.totalComplaints}</div>
                <div className="text-sm font-medium text-gray-700">Resolved Complaints</div>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600 opacity-60" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">₹{(summary.totalCollection / 1000).toFixed(0)} K</div>
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
                    {card.icon}
                    <h3 className="font-semibold text-lg">{card.title}</h3>
                  </div>
                  <FileText className="w-5 h-5 opacity-75" />
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4">{card.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{card.count}</div>
                    <div className="text-sm text-gray-500">Total Records</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-green-600">{card.active}</div>
                    <div className="text-sm text-gray-500">
                      {card.downloadKey === 'pump-house' ? 'Active' :
                       card.downloadKey === 'oht' ? 'K Liters' :
                       card.downloadKey === 'complaints' ? 'Resolved' :
                       card.downloadKey === 'fee-collection' ? 'K Collection' :
                       'Active'}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDownloadReport(card.downloadKey)}
                  disabled={card.count === 0}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-${card.color}-600 text-white rounded-lg hover:bg-${card.color}-700 disabled:bg-gray-400 transition-colors`}
                >
                  <Download className="w-4 h-4" />
                  Download Report
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
                <span className="font-semibold">{villages.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Pump House Coverage</span>
                <span className="font-semibold">{summary.totalPumps} units</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">OHT Infrastructure</span>
                <span className="font-semibold">{summary.totalOHTs} tanks</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Solar Pumps</span>
                <span className="font-semibold">{pumpHouses.filter(p => p.PowerSource === '2').length}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Operational Efficiency</span>
                <span className="font-semibold text-green-600">
                  {summary.totalPumps > 0 ? Math.round((summary.activePumps / summary.totalPumps) * 100) : 0}%
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
                <span className="font-semibold text-green-600">₹{summary.totalCollection.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Outstanding Amount</span>
                <span className="font-semibold text-red-600">₹{summary.totalOutstanding.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Active Beneficiaries</span>
                <span className="font-semibold">{summary.totalBeneficiaries}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Collection Efficiency</span>
                <span className="font-semibold text-blue-600">
                  {summary.totalCollection + summary.totalOutstanding > 0 
                    ? Math.round((summary.totalCollection / (summary.totalCollection + summary.totalOutstanding)) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Avg Collection/Beneficiary</span>
                <span className="font-semibold">
                  ₹{summary.totalBeneficiaries > 0 ? Math.round(summary.totalCollection / summary.totalBeneficiaries) : 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-4 text-white">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Quick Export Options
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleDownloadReport('consolidated')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                Executive Summary
              </button>
              <button
                onClick={() => {
                  const wb = XLSX.utils.book_new();
                  
                  // Add all reports to workbook
                  reportCards.forEach(card => {
                    let data: any[] = [];
                    switch(card.downloadKey) {
                      case 'pump-house':
                        data = pumpHouses.map(p => ({
                          'OHT ID': p.OhtId,
                          'Operator': p.OperatorName,
                          'Pump ID': p.PumpId,
                          'HP': p.HorsePower,
                          'Power Source': p.PowerSource === '1' ? 'Electric' : 'Solar',
                          'Status': p.Status === 1 ? 'Active' : 'Inactive'
                        }));
                        break;
                      case 'oht':
                        data = ohtData.map(o => ({
                          'OHT ID': o.OhtId,
                          'Village': o.VillageName,
                          'Capacity': o.OHTCapacity,
                          'Pumps': o.NoOfPumps
                        }));
                        break;
                      case 'complaints':
                        data = complaints.map(c => ({
                          'ID': c.ComplaintID,
                          'Village': c.Village,
                          'Beneficiary': c.BeneficiaryName,
                          'Category': c.Category,
                          'Status': c.Status ? 'Resolved' : 'Pending'
                        }));
                        break;
                      case 'fee-collection':
                        data = feeData.map(f => ({
                          'Village': f.VillageName,
                          'Beneficiary': f.BeneficiaryName,
                          'Paid': f.PaidAmount,
                          'Outstanding': f.OutstandingAmount,
                          'Balance': f.BalanceAmount
                        }));
                        break;
                      case 'roaster':
                        data = roasterData.map(r => ({
                          'GP ID': r.GPId,
                          'Date': r.RoasterDate,
                          'Activity': r.ActivityType,
                          'Status': r.Status === 1 ? 'Active' : 'Inactive'
                        }));
                        break;
                    }
                    
                    if (data.length > 0) {
                      const ws = XLSX.utils.json_to_sheet(data);
                      XLSX.utils.book_append_sheet(wb, ws, card.title.replace(' Report', ''));
                    }
                  });
                  
                  XLSX.writeFile(wb, `complete_mis_report_${selectedYear}_${selectedMonth}.xlsx`);
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Complete Workbook
              </button>
              <button
                onClick={() => {
                  const summaryData = [{
                    'Metric': 'Infrastructure',
                    'Total Pumps': summary.totalPumps,
                    'Active Pumps': summary.activePumps,
                    'Total OHTs': summary.totalOHTs,
                    'OHT Capacity (L)': summary.totalCapacity
                  }, {
                    'Metric': 'Operations',
                    'Total Complaints': summary.totalComplaints,
                    'Resolved Complaints': summary.resolvedComplaints,
                    'Roaster Schedules': roasterData.length,
                    'Active Schedules': roasterData.filter(r => r.Status === 1).length
                  }, {
                    'Metric': 'Financial',
                    'Total Collection': summary.totalCollection,
                    'Outstanding Amount': summary.totalOutstanding,
                    'Total Beneficiaries': summary.totalBeneficiaries,
                    'Collection Efficiency': Math.round((summary.totalCollection / (summary.totalCollection + summary.totalOutstanding || 1)) * 100)
                  }];
                  
                  const wb = XLSX.utils.book_new();
                  const ws = XLSX.utils.json_to_sheet(summaryData);
                  XLSX.utils.book_append_sheet(wb, ws, 'Dashboard_Summary');
                  XLSX.writeFile(wb, `dashboard_summary_${selectedYear}_${selectedMonth}.xlsx`);
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard Summary
              </button>
            </div>
          </div>
        </div>

        {/* Village-wise Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Village-wise Infrastructure Summary
            </h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-3 font-semibold text-gray-700">Village</th>
                    <th className="text-left p-3 font-semibold text-gray-700">OHTs</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Capacity (L)</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Pumps</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Complaints</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Collection (₹)</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Outstanding (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {villages.map((village, index) => {
                    const villageOHTs = ohtData.filter(o => o.VillageName === village.VillageName);
                    const villageCapacity = villageOHTs.reduce((sum, o) => sum + o.OHTCapacity, 0);
                    const villagePumps = villageOHTs.reduce((sum, o) => sum + o.NoOfPumps, 0);
                    const villageComplaints = complaints.filter(c => c.Village === village.VillageName);
                    const villageFees = feeData.filter(f => f.VillageId === village.VillageId);
                    const villageCollection = villageFees.reduce((sum, f) => sum + f.PaidAmount, 0);
                    const villageOutstanding = villageFees.reduce((sum, f) => sum + f.OutstandingAmount, 0);

                    return (
                      <tr key={village.VillageId} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-3 font-medium text-gray-900">{village.VillageName}</td>
                        <td className="p-3 text-gray-700">{villageOHTs.length}</td>
                        <td className="p-3 text-gray-700">{villageCapacity.toLocaleString()}</td>
                        <td className="p-3 text-gray-700">{villagePumps}</td>
                        <td className="p-3 text-gray-700">{villageComplaints.length}</td>
                        <td className="p-3 text-green-600 font-medium">₹{villageCollection.toLocaleString()}</td>
                        <td className="p-3 text-red-600 font-medium">₹{villageOutstanding.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Activity Summary
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">{roasterData.filter(r => r.Status === 1).length}</div>
                <div className="text-sm text-gray-600">Active Schedules</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {roasterData.filter(r => r.ActivityType.toLowerCase().includes('maintenance')).length}
                </div>
                <div className="text-sm text-gray-600">Maintenance Activities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {complaints.filter(c => !c.Status).length}
                </div>
                <div className="text-sm text-gray-600">Pending Complaints</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {feeData.filter(f => f.BalanceAmount > 0).length}
                </div>
                <div className="text-sm text-gray-600">Pending Payments</div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 text-white">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Key Performance Indicators
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-lg font-semibold text-blue-800 mb-1">
                  {summary.totalPumps > 0 ? Math.round((summary.activePumps / summary.totalPumps) * 100) : 0}%
                </div>
                <div className="text-sm text-blue-600">Pump Operational Rate</div>
                <div className="text-xs text-blue-500 mt-1">
                  {summary.activePumps} of {summary.totalPumps} pumps active
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-lg font-semibold text-green-800 mb-1">
                  {summary.totalComplaints > 0 ? Math.round((summary.resolvedComplaints / summary.totalComplaints) * 100) : 0}%
                </div>
                <div className="text-sm text-green-600">Complaint Resolution Rate</div>
                <div className="text-xs text-green-500 mt-1">
                  {summary.resolvedComplaints} of {summary.totalComplaints} resolved
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-lg font-semibold text-purple-800 mb-1">
                  {summary.totalCollection + summary.totalOutstanding > 0 
                    ? Math.round((summary.totalCollection / (summary.totalCollection + summary.totalOutstanding)) * 100) 
                    : 0}%
                </div>
                <div className="text-sm text-purple-600">Fee Collection Efficiency</div>
                <div className="text-xs text-purple-500 mt-1">
                  ₹{summary.totalCollection.toLocaleString()} collected
                </div>
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
                  <div>Pump Houses: {pumpHouses.length} records</div>
                  <div>OHT Tanks: {ohtData.length} records</div>
                  <div>Villages: {villages.length} locations</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded border">
                <div className="font-medium text-gray-800 mb-2">Operational Data</div>
                <div className="space-y-1 text-gray-600">
                  <div>Roaster Schedules: {roasterData.length} entries</div>
                  <div>Complaints: {complaints.length} cases</div>
                  <div>Last Updated: {new Date().toLocaleDateString()}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded border">
                <div className="font-medium text-gray-800 mb-2">Financial Data</div>
                <div className="space-y-1 text-gray-600">
                  <div>Fee Records: {feeData.length} entries</div>
                  <div>Beneficiaries: {summary.totalBeneficiaries} active</div>
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
                    Format: Excel (.xlsx)
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs">
                    Updated: Real-time
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-6 border">
          <div className="text-center">
            <p className="text-gray-700 font-medium mb-2">
              Water Management System - MIS Dashboard
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