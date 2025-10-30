import { useEffect, useState } from "react";
import * as XLSX from 'xlsx';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calendar, DollarSign, Droplets, TrendingUp, AlertCircle, CheckCircle, Clock, FileText, Download, Filter, Search, X } from 'lucide-react';
import { useUserInfo } from "../utils/userInfo";

interface OHTApiItem {
  OhtId: number;
  Districtname: string;
  BlockName: string;
  GramPanchayatName: string;
  VillageName: string;
  OHTCapacity: number;
  NoOfPumps: number;
}

interface OHTDetails {
  OHTId: number;
  DistrictName: string;
  BlockName: string;
  GramPanchayatName: string;
  VillageName: string;
  OHTCapacity: number;
  NoOfPumps: number;
}

interface CleaningStatusItem {
  OhtId: number;
  VillageId: number;
  OhtCapacity: number | null;
  NoOfPumps: number | null;
  OhtTankCleaningStatus: number;
  OhtSolarCleaningStatus: number;
  OhtCleaningDate: string;
  OhtTankCleaningDueDate: string | null;
  OhtSolarCleaningDate: string | null;
  OhtSolarCleaningDueDate: string | null;
  Status: number;
}

interface BillingStatusItem {
  OhtId: number;
  VillageId: number;
  OhtCapacity: number | null;
  NoOfPumps: number | null;
  OhtElectricityBillAmount: number;
  DepositAmount: number;
  DepositAmountDate: string;
  BalanceAmount: number;
  FromDate: string | null;
  ToDate: string | null;
  PdfBillFilePath: string;
  Status: number;
}

interface CombinedRecord {
  OhtId: number;
  DistrictName: string;
  BlockName: string;
  GramPanchayatName: string;
  VillageName: string;
  OHTCapacity: number;
  NoOfPumps: number;
  OhtTankCleaningStatus: number | null;
  OhtSolarCleaningStatus: number | null;
  OhtCleaningDate: string | null;
  OhtTankCleaningDueDate: string | null;
  OhtSolarCleaningDate: string | null;
  OhtSolarCleaningDueDate: string | null;
  OhtElectricityBillAmount: number | null;
  DepositAmount: number | null;
  DepositAmountDate: string | null;
  BalanceAmount: number | null;
  BillFromDate: string | null;
  BillToDate: string | null;
  PdfBillFilePath: string | null;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const ViewOHTCleaningDetails = () => {
  
  const [ohtDetailsMap, setOhtDetailsMap] = useState<Map<number, OHTDetails>>(new Map());
  const [combinedRecords, setCombinedRecords] = useState<CombinedRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedBlock, setSelectedBlock] = useState<string>("");
  const [selectedGramPanchayat, setSelectedGramPanchayat] = useState<string>("");
  const [selectedVillage, setSelectedVillage] = useState<string>("");
  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState<"overview" | "cleaning" | "billing" | "timeline">("overview");
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string>("");
  const [selectedOht, setSelectedOht] = useState<OHTDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { userId } = useUserInfo();

  useEffect(() => {
  if (userId) {
    fetchAllData();
  }
}, [userId]);

  

  const fetchAllData = async () => {
    if (!userId) {
      console.error("Cannot fetch data: userId is null");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch OHT details first
      const ohtRes = await fetch(
        `https://wmsapi.kdsgroup.co.in/api/Master/GetOHTListByVillage?VillageId=0&UserId=${userId}`,
        {
          method: "GET",
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json'
          }
        }
      );

      if (!ohtRes.ok) {
        throw new Error(`HTTP error! status: ${ohtRes.status}`);
      }

      const ohtJson = await ohtRes.json();

      if (!ohtJson.Status) {
        throw new Error(ohtJson.Message || ohtJson.Errror || "Failed to fetch OHT details");
      }

      const ohtData: OHTApiItem[] = ohtJson.Data || [];
      const detailsMap = new Map<number, OHTDetails>();
      
      ohtData.forEach((o) => {
        detailsMap.set(o.OhtId, {
          OHTId: o.OhtId,
          DistrictName: o.Districtname,
          BlockName: o.BlockName,
          GramPanchayatName: o.GramPanchayatName,
          VillageName: o.VillageName,
          OHTCapacity: o.OHTCapacity,
          NoOfPumps: o.NoOfPumps,
        });
      });

      setOhtDetailsMap(detailsMap);

      // Fetch cleaning status
      const cleaningRes = await fetch(
        `https://wmsapi.kdsgroup.co.in/api/OhtPump/GetOhtCleaningStatus?UserId=${userId}`,
        {
          method: "GET",
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json'
          }
        }
      );

      const cleaningJson = await cleaningRes.json();
      const cleaningData: CleaningStatusItem[] = cleaningJson.Status ? (cleaningJson.Data || []) : [];

      // Fetch billing status
      const billingRes = await fetch(
        `https://wmsapi.kdsgroup.co.in/api/OhtPump/GetOhtElectricityBillStatus?UserId=${userId}`,
        {
          method: "GET",
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json'
          }
        }
      );

      const billingJson = await billingRes.json();
      const billingData: BillingStatusItem[] = billingJson.Status ? (billingJson.Data || []) : [];

      // Combine the data
      const combined = combineData(detailsMap, cleaningData, billingData);
      setCombinedRecords(combined);

    } catch (e: any) {
      console.error("Fetch error:", e);
      setError(e?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const combineData = (
    detailsMap: Map<number, OHTDetails>,
    cleaningData: CleaningStatusItem[],
    billingData: BillingStatusItem[]
  ): CombinedRecord[] => {
    const recordsMap = new Map<string, CombinedRecord>();

    cleaningData.forEach((cleaning) => {
      const details = detailsMap.get(cleaning.OhtId);
      if (!details) return;

      const key = `${cleaning.OhtId}-${cleaning.OhtCleaningDate}`;
      
      if (!recordsMap.has(key)) {
        recordsMap.set(key, {
          OhtId: cleaning.OhtId,
          DistrictName: details.DistrictName,
          BlockName: details.BlockName,
          GramPanchayatName: details.GramPanchayatName,
          VillageName: details.VillageName,
          OHTCapacity: details.OHTCapacity,
          NoOfPumps: details.NoOfPumps,
          OhtTankCleaningStatus: cleaning.OhtTankCleaningStatus,
          OhtSolarCleaningStatus: cleaning.OhtSolarCleaningStatus,
          OhtCleaningDate: cleaning.OhtCleaningDate,
          OhtTankCleaningDueDate: cleaning.OhtTankCleaningDueDate,
          OhtSolarCleaningDate: cleaning.OhtSolarCleaningDate,
          OhtSolarCleaningDueDate: cleaning.OhtSolarCleaningDueDate,
          OhtElectricityBillAmount: null,
          DepositAmount: null,
          DepositAmountDate: null,
          BalanceAmount: null,
          BillFromDate: null,
          BillToDate: null,
          PdfBillFilePath: null,
        });
      }
    });

    billingData.forEach((billing) => {
      const details = detailsMap.get(billing.OhtId);
      if (!details) return;

      const key = `${billing.OhtId}-${billing.DepositAmountDate}`;
      
      if (!recordsMap.has(key)) {
        recordsMap.set(key, {
          OhtId: billing.OhtId,
          DistrictName: details.DistrictName,
          BlockName: details.BlockName,
          GramPanchayatName: details.GramPanchayatName,
          VillageName: details.VillageName,
          OHTCapacity: details.OHTCapacity,
          NoOfPumps: details.NoOfPumps,
          OhtTankCleaningStatus: null,
          OhtSolarCleaningStatus: null,
          OhtCleaningDate: null,
          OhtTankCleaningDueDate: null,
          OhtSolarCleaningDate: null,
          OhtSolarCleaningDueDate: null,
          OhtElectricityBillAmount: billing.OhtElectricityBillAmount,
          DepositAmount: billing.DepositAmount,
          DepositAmountDate: billing.DepositAmountDate,
          BalanceAmount: billing.BalanceAmount,
          BillFromDate: billing.FromDate,
          BillToDate: billing.ToDate,
          PdfBillFilePath: billing.PdfBillFilePath,
        });
      } else {
        const existing = recordsMap.get(key)!;
        existing.OhtElectricityBillAmount = billing.OhtElectricityBillAmount;
        existing.DepositAmount = billing.DepositAmount;
        existing.DepositAmountDate = billing.DepositAmountDate;
        existing.BalanceAmount = billing.BalanceAmount;
        existing.BillFromDate = billing.FromDate;
        existing.BillToDate = billing.ToDate;
        existing.PdfBillFilePath = billing.PdfBillFilePath;
      }
    });

    return Array.from(recordsMap.values()).sort((a, b) => b.OhtId - a.OhtId);
  };

  const filteredData = combinedRecords.filter((r) => {
    const matchesSearch = r.DistrictName.toLowerCase().includes(search.toLowerCase()) ||
                         r.BlockName.toLowerCase().includes(search.toLowerCase()) ||
                         r.GramPanchayatName.toLowerCase().includes(search.toLowerCase()) ||
                         r.VillageName.toLowerCase().includes(search.toLowerCase()) ||
                         r.OhtId.toString().includes(search);
    
    const matchesDistrict = !selectedDistrict || r.DistrictName === selectedDistrict;
    const matchesBlock = !selectedBlock || r.BlockName === selectedBlock;
    const matchesGramPanchayat = !selectedGramPanchayat || r.GramPanchayatName === selectedGramPanchayat;
    const matchesVillage = !selectedVillage || r.VillageName === selectedVillage;

    return matchesSearch && matchesDistrict && matchesBlock && matchesGramPanchayat && matchesVillage;
  });

  const getUniqueDistricts = () => {
    return [...new Set(combinedRecords.map(r => r.DistrictName))].sort();
  };

  const getUniqueBlocks = () => {
    return [...new Set(combinedRecords
      .filter(r => !selectedDistrict || r.DistrictName === selectedDistrict)
      .map(r => r.BlockName))].sort();
  };

  const getUniqueGramPanchayats = () => {
    return [...new Set(combinedRecords
      .filter(r => (!selectedDistrict || r.DistrictName === selectedDistrict) &&
                   (!selectedBlock || r.BlockName === selectedBlock))
      .map(r => r.GramPanchayatName))].sort();
  };

  const getUniqueVillages = () => {
    return [...new Set(combinedRecords
      .filter(r => (!selectedDistrict || r.DistrictName === selectedDistrict) &&
                   (!selectedBlock || r.BlockName === selectedBlock) &&
                   (!selectedGramPanchayat || r.GramPanchayatName === selectedGramPanchayat))
      .map(r => r.VillageName))].sort();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleViewPdf = (pdfPath: string) => {
    if (!pdfPath || pdfPath.trim() === "") return;
    const fullUrl = pdfPath.startsWith('http') ? pdfPath : `https://wmsapi.kdsgroup.co.in/${pdfPath}`;
    setCurrentPdfUrl(fullUrl);
    setShowPdfModal(true);
  };

  const handleOhtClick = (ohtId: number) => {
    const details = ohtDetailsMap.get(ohtId);
    if (details) {
      setSelectedOht(details);
      setShowModal(true);
    }
  };

  const clearFilters = () => {
    setSelectedDistrict("");
    setSelectedBlock("");
    setSelectedGramPanchayat("");
    setSelectedVillage("");
    setSearch("");
  };

  // Analytics Calculations
  const totalBillAmount = filteredData.reduce((sum, r) => sum + (r.OhtElectricityBillAmount || 0), 0);
  const totalDeposits = filteredData.reduce((sum, r) => sum + (r.DepositAmount || 0), 0);
  const totalBalance = filteredData.reduce((sum, r) => sum + (r.BalanceAmount || 0), 0);
  const tankCleaned = filteredData.filter(r => r.OhtTankCleaningStatus === 1).length;
  const solarCleaned = filteredData.filter(r => r.OhtSolarCleaningStatus === 1).length;
  const pendingCleaning = filteredData.filter(r => r.OhtTankCleaningStatus === 0 || r.OhtSolarCleaningStatus === 0).length;

  // District-wise billing data
  const districtBillingData = Object.values(
    filteredData.reduce((acc, r) => {
      if (!acc[r.DistrictName]) {
        acc[r.DistrictName] = { name: r.DistrictName, amount: 0, balance: 0 };
      }
      acc[r.DistrictName].amount += r.OhtElectricityBillAmount || 0;
      acc[r.DistrictName].balance += r.BalanceAmount || 0;
      return acc;
    }, {} as Record<string, any>)
  );

  // Cleaning status pie data
  const cleaningPieData = [
    { name: 'Tank Cleaned', value: tankCleaned, color: '#10B981' },
    { name: 'Solar Cleaned', value: solarCleaned, color: '#F59E0B' },
    { name: 'Pending', value: pendingCleaning, color: '#EF4444' }
  ];

  // Timeline data for billing
  const billingTimeline = filteredData
    .filter(r => r.BillFromDate && r.BillToDate)
    .sort((a, b) => new Date(a.BillFromDate!).getTime() - new Date(b.BillFromDate!).getTime())
    .slice(0, 20);

  // Timeline data for cleaning
  const cleaningTimeline = filteredData
    .filter(r => r.OhtCleaningDate)
    .sort((a, b) => new Date(a.OhtCleaningDate!).getTime() - new Date(b.OhtCleaningDate!).getTime())
    .slice(0, 20);

  const handleDownload = () => {
    try {
      const exportData = filteredData.map((r) => ({
        'OHT ID': r.OhtId,
        'District': r.DistrictName,
        'Block': r.BlockName,
        'Gram Panchayat': r.GramPanchayatName,
        'Village': r.VillageName,
        'Capacity (KL)': r.OHTCapacity,
        'No. of Pumps': r.NoOfPumps,
        'Tank Cleaning': r.OhtTankCleaningStatus === 1 ? 'Cleaned' : r.OhtTankCleaningStatus === 0 ? 'Not Cleaned' : 'N/A',
        'Solar Cleaning': r.OhtSolarCleaningStatus === 1 ? 'Cleaned' : r.OhtSolarCleaningStatus === 0 ? 'Not Cleaned' : 'N/A',
        'Cleaning Date': formatDate(r.OhtCleaningDate),
        'Bill From Date': formatDate(r.BillFromDate),
        'Bill To Date': formatDate(r.BillToDate),
        'Electricity Bill (₹)': r.OhtElectricityBillAmount || 'N/A',
        'Deposit Amount (₹)': r.DepositAmount || 'N/A',
        'Balance Amount (₹)': r.BalanceAmount || 'N/A',
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'OHT_Analytics');
      const filename = `oht_analytics_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

if (userId === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

if (userId === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the OHT analytics dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">OHT Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive analysis of cleaning operations and billing data</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Droplets className="w-10 h-10 opacity-80" />
            <span className="text-3xl font-bold">{filteredData.length}</span>
          </div>
          <h3 className="text-lg font-medium opacity-90">Total OHTs</h3>
          <p className="text-sm opacity-75">Active records</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-10 h-10 opacity-80" />
            <span className="text-3xl font-bold">{tankCleaned}</span>
          </div>
          <h3 className="text-lg font-medium opacity-90">Tanks Cleaned</h3>
          <p className="text-sm opacity-75">Current status</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-10 h-10 opacity-80" />
            <span className="text-2xl font-bold">₹{(totalBillAmount / 100000).toFixed(1)}L</span>
          </div>
          <h3 className="text-lg font-medium opacity-90">Total Bills</h3>
          <p className="text-sm opacity-75">Electricity charges</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="w-10 h-10 opacity-80" />
            <span className="text-2xl font-bold">₹{(totalBalance / 100000).toFixed(1)}L</span>
          </div>
          <h3 className="text-lg font-medium opacity-90">Balance Due</h3>
          <p className="text-sm opacity-75">Pending payments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setSelectedBlock("");
              setSelectedGramPanchayat("");
              setSelectedVillage("");
            }}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Districts</option>
            {getUniqueDistricts().map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={selectedBlock}
            onChange={(e) => {
              setSelectedBlock(e.target.value);
              setSelectedGramPanchayat("");
              setSelectedVillage("");
            }}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Blocks</option>
            {getUniqueBlocks().map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select
            value={selectedGramPanchayat}
            onChange={(e) => {
              setSelectedGramPanchayat(e.target.value);
              setSelectedVillage("");
            }}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Gram Panchayats</option>
            {getUniqueGramPanchayats().map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Villages</option>
            {getUniqueVillages().map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search OHT..."
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
          <button
            onClick={fetchAllData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="flex border-b overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'cleaning', label: 'Cleaning Analytics', icon: Droplets },
            { id: 'billing', label: 'Billing Analytics', icon: DollarSign },
            { id: 'timeline', label: 'Timeline View', icon: Clock }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id as any)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeView === id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview View */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* District-wise Billing */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">District-wise Billing Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={districtBillingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="amount" fill="#3B82F6" name="Bill Amount" />
                  <Bar dataKey="balance" fill="#EF4444" name="Balance Due" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Cleaning Status Pie */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Cleaning Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={cleaningPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {cleaningPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Capacity and Pumps Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">OHT Capacity Distribution</h3>
              <div className="space-y-3">
                {Object.entries(
                  filteredData.reduce((acc, r) => {
                    const range = r.OHTCapacity < 60 ? '<60 KL' : r.OHTCapacity < 80 ? '60-80 KL' : '80+ KL';
                    acc[range] = (acc[range] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([range, count]) => (
                  <div key={range} className="flex items-center gap-4">
                    <div className="w-32 font-medium text-gray-700">{range}</div>
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full flex items-center justify-end pr-3 text-white text-sm font-medium"
                          style={{ width: `${(count / filteredData.length) * 100}%` }}
                        >
                          {count}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Payment Status Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {filteredData.filter(r => r.BalanceAmount === 0).length}
                  </div>
                  <div className="text-sm text-green-700 font-medium">Fully Paid</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
                  <div className="text-3xl font-bold text-yellow-600 mb-1">
                    {filteredData.filter(r => r.BalanceAmount && r.BalanceAmount > 0 && r.BalanceAmount < (r.OhtElectricityBillAmount || 0)).length}
                  </div>
                  <div className="text-sm text-yellow-700 font-medium">Partial Payment</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                  <div className="text-3xl font-bold text-red-600 mb-1">
                    {filteredData.filter(r => r.BalanceAmount && r.BalanceAmount > 0).length}
                  </div>
                  <div className="text-sm text-red-700 font-medium">Pending Balance</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {filteredData.filter(r => r.OhtElectricityBillAmount !== null).length}
                  </div>
                  <div className="text-sm text-blue-700 font-medium">Total Bills</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Recent Records Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-200">
                    <th className="p-3 text-left font-semibold text-gray-700">OHT ID</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Location</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Capacity</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Tank Status</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Solar Status</th>
                    <th className="p-3 text-right font-semibold text-gray-700">Bill Amount</th>
                    <th className="p-3 text-right font-semibold text-gray-700">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 10).map((r, idx) => (
                    <tr key={idx} className="border-b hover:bg-blue-50 transition-colors">
                      <td className="p-3">
                        <button
                          onClick={() => handleOhtClick(r.OhtId)}
                          className="text-blue-600 font-semibold hover:underline"
                        >
                          #{r.OhtId}
                        </button>
                      </td>
                      <td className="p-3 text-gray-700">
                        <div className="font-medium">{r.VillageName}</div>
                        <div className="text-sm text-gray-500">{r.DistrictName}</div>
                      </td>
                      <td className="p-3 text-gray-700">{r.OHTCapacity} KL</td>
                      <td className="p-3">
                        {r.OhtTankCleaningStatus === 1 ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Cleaned
                          </span>
                        ) : r.OhtTankCleaningStatus === 0 ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Pending
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        {r.OhtSolarCleaningStatus === 1 ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Cleaned
                          </span>
                        ) : r.OhtSolarCleaningStatus === 0 ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Pending
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-medium text-gray-700">
                        {r.OhtElectricityBillAmount ? `₹${r.OhtElectricityBillAmount.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-3 text-right">
                        {r.BalanceAmount !== null ? (
                          <span className={r.BalanceAmount > 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                            ₹{r.BalanceAmount.toLocaleString()}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Cleaning Analytics View */}
      {activeView === 'cleaning' && (
        <div className="space-y-6">
          {/* Cleaning Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <CheckCircle className="w-12 h-12 mb-3 opacity-80" />
              <div className="text-3xl font-bold mb-1">{tankCleaned}</div>
              <div className="text-sm opacity-90">Tanks Cleaned</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
              <CheckCircle className="w-12 h-12 mb-3 opacity-80" />
              <div className="text-3xl font-bold mb-1">{solarCleaned}</div>
              <div className="text-sm opacity-90">Solar Panels Cleaned</div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
              <AlertCircle className="w-12 h-12 mb-3 opacity-80" />
              <div className="text-3xl font-bold mb-1">{pendingCleaning}</div>
              <div className="text-sm opacity-90">Pending Cleaning</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <Clock className="w-12 h-12 mb-3 opacity-80" />
              <div className="text-3xl font-bold mb-1">
                {filteredData.filter(r => r.OhtTankCleaningDueDate || r.OhtSolarCleaningDueDate).length}
              </div>
              <div className="text-sm opacity-90">Upcoming Due Dates</div>
            </div>
          </div>

          {/* Cleaning Timeline */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Cleaning Activity Timeline</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {cleaningTimeline.map((r, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="flex-shrink-0 w-16 text-center">
                    <div className="text-2xl font-bold text-blue-600">{new Date(r.OhtCleaningDate!).getDate()}</div>
                    <div className="text-xs text-gray-600">
                      {new Date(r.OhtCleaningDate!).toLocaleDateString('en-IN', { month: 'short' })}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => handleOhtClick(r.OhtId)}
                        className="text-lg font-semibold text-blue-600 hover:underline"
                      >
                        OHT #{r.OhtId}
                      </button>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{r.VillageName}, {r.DistrictName}</span>
                    </div>
                    <div className="flex gap-2 mb-2">
                      {r.OhtTankCleaningStatus === 1 && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Tank Cleaned
                        </span>
                      )}
                      {r.OhtSolarCleaningStatus === 1 && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                          Solar Cleaned
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {r.OhtTankCleaningDueDate && (
                        <div>Tank Due: {formatDate(r.OhtTankCleaningDueDate)}</div>
                      )}
                      {r.OhtSolarCleaningDueDate && (
                        <div>Solar Due: {formatDate(r.OhtSolarCleaningDueDate)}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700">{r.OHTCapacity} KL</div>
                    <div className="text-xs text-gray-500">{r.NoOfPumps} Pumps</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Cleaning Table */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Detailed Cleaning Records</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-200">
                    <th className="p-3 text-left font-semibold text-gray-700">OHT ID</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Location</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Cleaning Date</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Tank Status</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Tank Due</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Solar Status</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Solar Due</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.filter(r => r.OhtCleaningDate).map((r, idx) => (
                    <tr key={idx} className="border-b hover:bg-blue-50 transition-colors">
                      <td className="p-3">
                        <button
                          onClick={() => handleOhtClick(r.OhtId)}
                          className="text-blue-600 font-semibold hover:underline"
                        >
                          #{r.OhtId}
                        </button>
                      </td>
                      <td className="p-3 text-gray-700">
                        <div className="font-medium">{r.VillageName}</div>
                        <div className="text-sm text-gray-500">{r.BlockName}, {r.DistrictName}</div>
                      </td>
                      <td className="p-3 text-gray-700">{formatDate(r.OhtCleaningDate)}</td>
                      <td className="p-3">
                        {r.OhtTankCleaningStatus === 1 ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Cleaned
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {r.OhtTankCleaningDueDate ? (
                          <span className="text-orange-600 font-medium">{formatDate(r.OhtTankCleaningDueDate)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        {r.OhtSolarCleaningStatus === 1 ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Cleaned
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {r.OhtSolarCleaningDueDate ? (
                          <span className="text-orange-600 font-medium">{formatDate(r.OhtSolarCleaningDueDate)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Billing Analytics View */}
      {activeView === 'billing' && (
        <div className="space-y-6">
          {/* Billing Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <FileText className="w-12 h-12 mb-3 opacity-80" />
              <div className="text-3xl font-bold mb-1">₹{(totalBillAmount / 100000).toFixed(2)}L</div>
              <div className="text-sm opacity-90">Total Electricity Bills</div>
              <div className="text-xs opacity-75 mt-2">{filteredData.filter(r => r.OhtElectricityBillAmount).length} bills</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <DollarSign className="w-12 h-12 mb-3 opacity-80" />
              <div className="text-3xl font-bold mb-1">₹{(totalDeposits / 100000).toFixed(2)}L</div>
              <div className="text-sm opacity-90">Total Deposits Made</div>
              <div className="text-xs opacity-75 mt-2">{((totalDeposits / totalBillAmount) * 100).toFixed(1)}% collection rate</div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
              <AlertCircle className="w-12 h-12 mb-3 opacity-80" />
              <div className="text-3xl font-bold mb-1">₹{(totalBalance / 100000).toFixed(2)}L</div>
              <div className="text-sm opacity-90">Outstanding Balance</div>
              <div className="text-xs opacity-75 mt-2">{filteredData.filter(r => r.BalanceAmount && r.BalanceAmount > 0).length} pending</div>
            </div>
          </div>

          {/* Billing Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Payment vs Outstanding</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Paid', value: totalDeposits, color: '#10B981' },
                      { name: 'Outstanding', value: totalBalance, color: '#EF4444' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ₹${(value/100000).toFixed(1)}L (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#EF4444" />
                  </Pie>
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Top Outstanding Bills</h3>
              <div className="space-y-3">
                {filteredData
                  .filter(r => r.BalanceAmount && r.BalanceAmount > 0)
                  .sort((a, b) => (b.BalanceAmount || 0) - (a.BalanceAmount || 0))
                  .slice(0, 5)
                  .map((r, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <button
                          onClick={() => handleOhtClick(r.OhtId)}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          OHT #{r.OhtId}
                        </button>
                        <div className="text-sm text-gray-600">{r.VillageName}, {r.DistrictName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">₹{r.BalanceAmount?.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Balance</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Billing Table */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Detailed Billing Records</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-200">
                    <th className="p-3 text-left font-semibold text-gray-700">OHT ID</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Location</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Bill Period</th>
                    <th className="p-3 text-right font-semibold text-gray-700">Bill Amount</th>
                    <th className="p-3 text-right font-semibold text-gray-700">Deposit</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Deposit Date</th>
                    <th className="p-3 text-right font-semibold text-gray-700">Balance</th>
                    <th className="p-3 text-center font-semibold text-gray-700">PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.filter(r => r.OhtElectricityBillAmount).map((r, idx) => (
                    <tr key={idx} className="border-b hover:bg-blue-50 transition-colors">
                      <td className="p-3">
                        <button
                          onClick={() => handleOhtClick(r.OhtId)}
                          className="text-blue-600 font-semibold hover:underline"
                        >
                          #{r.OhtId}
                        </button>
                      </td>
                      <td className="p-3 text-gray-700">
                        <div className="font-medium">{r.VillageName}</div>
                        <div className="text-sm text-gray-500">{r.DistrictName}</div>
                      </td>
                      <td className="p-3 text-gray-700 text-sm">
                        {r.BillFromDate && r.BillToDate ? (
                          <div>
                            <div>{formatDate(r.BillFromDate)}</div>
                            <div className="text-gray-500">to {formatDate(r.BillToDate)}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-medium text-gray-700">
                        ₹{r.OhtElectricityBillAmount?.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-medium text-green-600">
                        {r.DepositAmount ? `₹${r.DepositAmount.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-3 text-gray-700">{formatDate(r.DepositAmountDate)}</td>
                      <td className="p-3 text-right">
                        {r.BalanceAmount !== null ? (
                          <span className={r.BalanceAmount > 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                            ₹{r.BalanceAmount.toLocaleString()}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {r.PdfBillFilePath && r.PdfBillFilePath.trim() !== "" ? (
                          <button
                            onClick={() => handleViewPdf(r.PdfBillFilePath!)}
                            className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded"
                            title="View PDF"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Timeline View */}
      {activeView === 'timeline' && (
        <div className="space-y-6">
          {/* Billing Timeline */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-800">Billing Timeline</h3>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {billingTimeline.map((r, idx) => (
                <div key={idx} className="relative pl-8 pb-6 border-l-2 border-blue-300">
                  <div className="absolute left-0 top-0 w-4 h-4 bg-blue-600 rounded-full -ml-2"></div>
                  <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => handleOhtClick(r.OhtId)}
                            className="text-lg font-bold text-blue-600 hover:underline"
                          >
                            OHT #{r.OhtId}
                          </button>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-700 font-medium">{r.VillageName}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {r.DistrictName} • {r.BlockName} • {r.GramPanchayatName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">Bill Period</div>
                        <div className="font-medium text-gray-700">
                          {formatDate(r.BillFromDate)} - {formatDate(r.BillToDate)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Bill Amount</div>
                        <div className="text-lg font-bold text-blue-600">
                          ₹{r.OhtElectricityBillAmount?.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Deposit</div>
                        <div className="text-lg font-bold text-green-600">
                          ₹{r.DepositAmount?.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Balance</div>
                        <div className={`text-lg font-bold ${r.BalanceAmount && r.BalanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ₹{r.BalanceAmount?.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Deposit Date:</span>
                          <span className="ml-2 font-medium text-gray-700">{formatDate(r.DepositAmountDate)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Capacity:</span>
                          <span className="ml-2 font-medium text-gray-700">{r.OHTCapacity} KL</span>
                        </div>
                      </div>
                      {r.PdfBillFilePath && r.PdfBillFilePath.trim() !== "" && (
                        <button
                          onClick={() => handleViewPdf(r.PdfBillFilePath!)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          View Bill PDF
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cleaning Timeline */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-800">Cleaning Timeline</h3>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {cleaningTimeline.map((r, idx) => (
                <div key={idx} className="relative pl-8 pb-6 border-l-2 border-green-300">
                  <div className="absolute left-0 top-0 w-4 h-4 bg-green-600 rounded-full -ml-2"></div>
                  <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => handleOhtClick(r.OhtId)}
                            className="text-lg font-bold text-blue-600 hover:underline"
                          >
                            OHT #{r.OhtId}
                          </button>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-700 font-medium">{r.VillageName}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {r.DistrictName} • {r.BlockName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">Cleaning Date</div>
                        <div className="font-bold text-green-600">
                          {formatDate(r.OhtCleaningDate)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="bg-white p-3 rounded-lg border-2 border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-gray-700">Tank Cleaning</div>
                          {r.OhtTankCleaningStatus === 1 ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {r.OhtTankCleaningStatus === 1 ? 'Completed' : 'Pending'}
                        </div>
                        {r.OhtTankCleaningDueDate && (
                          <div className="text-xs text-orange-600 mt-1">
                            Due: {formatDate(r.OhtTankCleaningDueDate)}
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg border-2 border-yellow-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-gray-700">Solar Cleaning</div>
                          {r.OhtSolarCleaningStatus === 1 ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {r.OhtSolarCleaningStatus === 1 ? 'Completed' : 'Pending'}
                        </div>
                        {r.OhtSolarCleaningDueDate && (
                          <div className="text-xs text-orange-600 mt-1">
                            Due: {formatDate(r.OhtSolarCleaningDueDate)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div>
                        <span className="text-gray-500">Capacity:</span>
                        <span className="ml-2 font-medium">{r.OHTCapacity} KL</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Pumps:</span>
                        <span className="ml-2 font-medium">{r.NoOfPumps}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* OHT Details Modal */}
      {showModal && selectedOht && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-1">OHT Details</h2>
                  <p className="text-blue-100">Complete information for OHT #{selectedOht.OHTId}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-600 font-medium mb-1">OHT ID</div>
                  <div className="text-2xl font-bold text-blue-700">#{selectedOht.OHTId}</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600 font-medium mb-1">District</div>
                  <div className="text-lg font-semibold text-gray-800">{selectedOht.DistrictName}</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600 font-medium mb-1">Block</div>
                  <div className="text-lg font-semibold text-gray-800">{selectedOht.BlockName}</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600 font-medium mb-1">Gram Panchayat</div>
                  <div className="text-lg font-semibold text-gray-800">{selectedOht.GramPanchayatName}</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600 font-medium mb-1">Village</div>
                  <div className="text-lg font-semibold text-gray-800">{selectedOht.VillageName}</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-sm text-green-600 font-medium mb-1">OHT Capacity</div>
                  <div className="text-lg font-semibold text-green-700">{selectedOht.OHTCapacity} KL</div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-sm text-purple-600 font-medium mb-1">Number of Pumps</div>
                  <div className="text-lg font-semibold text-purple-700">{selectedOht.NoOfPumps}</div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {showPdfModal && currentPdfUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Electricity Bill PDF</h2>
                  <p className="text-red-100 text-sm">View and download bill document</p>
                </div>
              </div>
              <button
                onClick={() => setShowPdfModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-hidden">
              <iframe
                src={currentPdfUrl}
                className="w-full h-full border-2 border-gray-300 rounded-lg"
                title="PDF Viewer"
              />
            </div>
            
            <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-between items-center">
              <a
                href={currentPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Open in New Tab
              </a>

              <button
                onClick={() => setShowPdfModal(false)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-700 text-lg font-medium">Loading data...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the latest records</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-6 right-6 bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg z-50 max-w-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold mb-1">Error Loading Data</div>
              <div className="text-sm">{error}</div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 ml-4"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewOHTCleaningDetails;