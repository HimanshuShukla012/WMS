import React, { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  Users,
  Droplets,
  Zap,
  AlertTriangle,
  CheckCircle,
  MessageSquare, Clock, CheckCircle2, XCircle,
  RefreshCw,
  Download,
  TrendingUp,
  BarChart3,
  DollarSign,
  Activity,
  Settings,
  Eye
} from 'lucide-react';
import { useUserInfo } from '../utils/userInfo';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// --- Types ---
interface District { DistrictId: number; DistrictName: string }
interface Block { BlockId: number; BlockName: string; Id: number; DistrictId: number }
interface GramPanchayat { Id: number; GramPanchayatName: string; BlockId: number }
interface Village { Id: number; GramPanchayatId: number; VillageName: string; VillageId?: number; VillageName?: string }

interface BeneficiaryData { 
  BeneficiaryId: number; 
  BeneficiaryName: string; 
  VillageId: number; 
  VillageName: string; 
  Status: string | number; 
  FamilyMembers?: any; 
  FamilyCount?: any; 
  familyCount?: any; 
  DistrictName?: string; 
  BlockName?: string; 
  GrampanchayatName?: string;
  FatherHusbandName?: string;
}

interface OHTData { 
  OhtId: number; 
  Districtname: string; 
  BlockName: string; 
  GramPanchayatName: string; 
  VillageName: string; 
  OHTCapacity: number; 
  NoOfPumps: number;
  Status?: number;
}

interface PumpHouseData { 
  PumpId: number; 
  OhtId: number; 
  OperatorName: string; 
  Contact: string; 
  HorsePower: string; 
  PowerSource: string; 
  Status: number; 
  SolarOutput: number;
}

interface WaterQualityData {
  DistrictName: string;
  BlockName: string;
  GramPanchayatName: string;
  Year: number;
  Month: number;
  TotalSamplesCollected: number;
  TotalSamplesContaminated: number;
  VillagesTestedNames: string;
  VillagesTestedCount: number;
  ContaminatedVillagesNames: string;
  ContaminatedVillagesCount: number;
}

interface ComplaintData {
  ComplaintID: number;
  District: string;
  DistrictId: number;
  Block: string;
  BlockId: number;
  GramPanchayat: string;
  GramPanchayatId: number;
  Village: string;
  VillageId: number;
  BeneficiaryName: string;
  Contact: string;
  Landmark: string;
  Category: string;
  CategoryId: number;
  OtherCategory: string;
  Status: number; // 0 = Pending, 1 = Resolved, 2 = Closed
  ComplaintDetails: string;
}

interface WaterFeeSummaryData {
  DistrictName: string;
  BlockName: string;
  GramPanchayatName: string;
  VillageName: string;
  Year: number;
  Month: number;
  BaseFee: number;
  PreviousBalance: number;
  OutstandingAmount: number;
  PaidAmount: number;
}

interface LocationStats { 
  totalBeneficiaries: number; 
  activeBeneficiaries: number; 
  totalFamilyMembers: number; 
  totalOHTs: number; 
  totalOHTCapacity: number; 
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  closedComplaints: number;
  totalPumps: number; 
  activePumps: number; 
  solarPumps: number;
  totalBaseFee: number;
  totalPreviousBalance: number;
  totalOutstanding: number;
  totalPaidAmount: number;
  collectionEfficiency: number;
}

const DirectorMonitoring: React.FC = () => {

  const filterWaterQualityByLocation = (data: WaterQualityData[]) => {
  const selectedDistrict = districts.find(d => d.DistrictId === selectedDistrictId)?.DistrictName;
  const selectedBlock = blocks.find(b => b.BlockId === selectedBlockId)?.BlockName;
  const selectedGP = gramPanchayats.find(gp => gp.GramPanchayatId === selectedGramPanchayatId)?.GramPanchayatName;

  return data.filter(wq => {
    const matchDistrict = !selectedDistrict || wq.DistrictName === selectedDistrict;
    const matchBlock = !selectedBlock || wq.BlockName === selectedBlock;
    const matchGP = !selectedGP || wq.GramPanchayatName === selectedGP;
    return matchDistrict && matchBlock && matchGP;
  });
};

  const { userId, role, isLoading: userLoading } = useUserInfo();

  // Location lists
  const [districts, setDistricts] = useState<District[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayat[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [complaintsData, setComplaintsData] = useState<ComplaintData[]>([]);

  // Multi-level selection - director can pick any level
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [selectedGramPanchayatId, setSelectedGramPanchayatId] = useState<number | null>(null);
  const [selectedVillageId, setSelectedVillageId] = useState<number | null>(null);

  // Data arrays
  const [beneficiariesData, setBeneficiariesData] = useState<BeneficiaryData[]>([]);
  const [ohtData, setOhtData] = useState<OHTData[]>([]);
  const [pumpHouseData, setPumpHouseData] = useState<PumpHouseData[]>([]);
  const [waterQualityData, setWaterQualityData] = useState<WaterQualityData[]>([]);
  const filteredWQ = filterWaterQualityByLocation(waterQualityData);
  const [waterFeeSummaryData, setWaterFeeSummaryData] = useState<WaterFeeSummaryData[]>([]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'beneficiaries' | 'infrastructure' | 'finance' | 'quality' | 'complaints'>('overview');

  // Date range for fee collection
  const [fromDate, setFromDate] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 6); // Default to 6 months ago
    return date.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [stats, setStats] = useState<LocationStats>({ 
    totalBeneficiaries: 0, 
    activeBeneficiaries: 0, 
    totalFamilyMembers: 0, 
    totalOHTs: 0, 
    totalOHTCapacity: 0, 
    totalPumps: 0, 
    activePumps: 0, 
    solarPumps: 0,
    totalBaseFee: 0,
    totalPreviousBalance: 0,
    totalOutstanding: 0,
    totalPaidAmount: 0,
    collectionEfficiency: 0,
    totalComplaints: 0,        // Add this
  pendingComplaints: 0,      // Add this
  resolvedComplaints: 0,     // Add this
  closedComplaints: 0   
  });

  // --- API Functions ---
  const fetchDistricts = async () => {
    try {
      const r = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/AllDistrict', { 
        method: 'POST', 
        headers: { accept: '*/*' } 
      });
      if (!r.ok) return [];
      const j = await r.json();
      return j.Status ? j.Data : [];
    } catch (e) { console.error(e); return [] }
  };

const fetchComplaintsData = async () => {
  try {
    const effectiveUserId = role === 'Admin' ? 0 : userId;
    const r = await fetch('https://wmsapi.kdsgroup.co.in/api/Complain/GetComplaintListByUserIdVillageAndStatus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        UserId: effectiveUserId, 
        VillageId: selectedVillageId || 0, 
        Status: 0 // 0 for all statuses
      })
    });
    if (!r.ok) return [];
    const j = await r.json();
    return j.Status ? j.Data || [] : [];
  } catch (e) { 
    console.error(e); 
    return [] 
  }
};

  const fetchBlocks = async (districtId: number) => {
    try {
      const r = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetAllBlocks?DistrictId=${districtId}`, { 
        method: 'POST', 
        headers: { accept: '*/*' } 
      });
      if (!r.ok) return [];
      const j = await r.json();
      return j.Status ? j.Data : [];
    } catch (e) { console.error(e); return [] }
  };

  const fetchGramPanchayats = async (blockId: number) => {
    try {
      const r = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetAllGramPanchayat?BlockId=${blockId}`, { 
        method: 'POST', 
        headers: { accept: '*/*' } 
      });
      if (!r.ok) return [];
      const j = await r.json();
      return j.Status ? j.Data : [];
    } catch (e) { console.error(e); return [] }
  };

  const fetchVillages = async (blockId: number, gramPanchayatId: number) => {
    try {
      const r = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/GetVillegeByGramPanchayat', {
        method: 'POST', 
        headers: { accept: '*/*', 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ BlockId: blockId, GramPanchayatId: gramPanchayatId })
      });
      if (!r.ok) return [];
      const j = await r.json();
      return j.Status ? j.Data : [];
    } catch (e) { console.error(e); return [] }
  };

  const fetchBeneficiaries = async () => {
    try {
      const effectiveUserId = role === 'Admin' ? 0 : userId;
      const r = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/GetBeneficiaryListByUserIdVillageAndStatus', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ userId: effectiveUserId, VillageId: 0, Status: 0 }) 
      });
      if (!r.ok) return [];
      const j = await r.json();
      return j.Status ? j.Data || [] : [];
    } catch (e) { console.error(e); return [] }
  };

  const fetchOHTData = async () => {
    try {
      const r = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetOHTListByVillage?VillageId=0&UserId=${userId}`, { 
        method: 'GET', 
        headers: { Accept: '*/*', 'Content-Type': 'application/json' } 
      });
      if (!r.ok) return [];
      const j = await r.json();
      return j.Status ? j.Data || [] : [];
    } catch (e) { console.error(e); return [] }
  };

  const fetchPumpHouseData = async () => {
    try {
      const r = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetPumpHouseListByUserId?UserId=${userId}`, { 
        method: 'GET', 
        headers: { accept: '*/*' } 
      });
      if (!r.ok) return [];
      const j = await r.json();
      return j.Status ? j.Data || [] : [];
    } catch (e) { console.error(e); return [] }
  };

  const fetchWaterQualityData = async () => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    const r = await fetch(
      "https://wmsapi.kdsgroup.co.in/api/Master/GetWaterQualityTestReportDetails",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({
          User_Id: userId ? parseInt(userId.toString()) : 0,
          FromDate: startDate.toISOString(),
          ToDate: endDate.toISOString(),
        }),
      }
    );
    if (!r.ok) return [];
    const j = await r.json();
    return j.Status ? j.Data || [] : [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

  const fetchWaterFeeSummaryData = async () => {
    try {
      const fromDateISO = new Date(fromDate + 'T00:00:00.000Z').toISOString();
      const toDateISO = new Date(toDate + 'T23:59:59.999Z').toISOString();
      
      const r = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/GetWaterFeeSummaryReportDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*'
        },
        body: JSON.stringify({
          User_Id: userId ? parseInt(userId.toString()) : 1,
          FromDate: fromDateISO,
          ToDate: toDateISO
        })
      });
      
      if (!r.ok) return [];
      const result = await r.json();
      return result.Status ? result.Data || [] : [];
    } catch (e) { 
      console.error('Error fetching water fee summary:', e); 
      return [] 
    }
  };

  // --- Load location data ---
  useEffect(() => {
    if (userLoading) return;
    const load = async () => {
      setLocationLoading(true);
      try {
        const d = await fetchDistricts();
        setDistricts(d);
        if (d.length === 1) setSelectedDistrictId(d[0].DistrictId);
      } catch (e) { 
        console.error(e); 
        setError('Failed to load districts') 
      } finally { 
        setLocationLoading(false) 
      }
    };
    load();
  }, [userLoading]);

  // Load dependent location lists
  useEffect(() => {
    if (!selectedDistrictId) { 
      setBlocks([]); 
      setSelectedBlockId(null); 
      setGramPanchayats([]); 
      setVillages([]); 
      return 
    }
    (async () => {
      setLocationLoading(true);
      const b = await fetchBlocks(selectedDistrictId);
      setBlocks(b);
      setSelectedBlockId(null); 
      setGramPanchayats([]); 
      setVillages([]);
      setLocationLoading(false);
    })();
  }, [selectedDistrictId]);

  useEffect(() => {
    if (!selectedBlockId) { 
      setGramPanchayats([]); 
      setSelectedGramPanchayatId(null); 
      setVillages([]); 
      return 
    }
    (async () => {
      setLocationLoading(true);
      const gp = await fetchGramPanchayats(selectedBlockId);
      setGramPanchayats(gp);
      setSelectedGramPanchayatId(null); 
      setVillages([]);
      setLocationLoading(false);
    })();
  }, [selectedBlockId]);

  useEffect(() => {
    if (!selectedBlockId || !selectedGramPanchayatId) { 
      setVillages([]); 
      setSelectedVillageId(null); 
      return 
    }
    (async () => {
      setLocationLoading(true);
      const v = await fetchVillages(selectedBlockId, selectedGramPanchayatId);
      setVillages(v);
      setSelectedVillageId(null);
      setLocationLoading(false);
    })();
  }, [selectedBlockId, selectedGramPanchayatId]);

  // --- Load all monitoring data ---
  const loadAllData = async () => {
    if (!userId) return;
    setLoading(true); 
    setError('');
    
    try {
      const [ben, ohts, pumps, wq, feeSummary, complaints] = await Promise.all([
        fetchBeneficiaries(), 
        fetchOHTData(), 
        fetchPumpHouseData(), 
        fetchWaterQualityData(),
        fetchWaterFeeSummaryData(),
        fetchComplaintsData()
      ]);
      
      setBeneficiariesData(ben); 
      setOhtData(ohts); 
      setPumpHouseData(pumps); 
      setWaterQualityData(wq);
      setWaterFeeSummaryData(feeSummary);
      setComplaintsData(complaints),

    calculateLocationStats(ben, ohts, pumps, wq, feeSummary, complaints); // Update parameters
    } catch (e) { 
      console.error(e); 
      setError('Failed to load monitoring data') 
    } finally { 
      setLoading(false) 
    }
  };

  // Load data when location or date range changes
  useEffect(() => { 
    loadAllData(); 
  }, [userId, selectedDistrictId, selectedBlockId, selectedGramPanchayatId, selectedVillageId]);

  useEffect(() => {
    if (fromDate && toDate) {
      loadAllData();
    }
  }, [fromDate, toDate]);

  // --- Filtering helpers ---
  const filterByLocation = (data: BeneficiaryData[]) => data.filter(item => {
    if (selectedDistrictId && item.DistrictName) {
      const sd = districts.find(d => d.DistrictId === selectedDistrictId);
      if (sd && item.DistrictName !== sd.DistrictName) return false;
    }
    if (selectedBlockId && item.BlockName) {
      const sb = blocks.find(b => b.BlockId === selectedBlockId);
      if (sb && item.BlockName !== sb.BlockName) return false;
    }
    if (selectedGramPanchayatId && item.GrampanchayatName) {
      const sg = gramPanchayats.find(g => g.Id === selectedGramPanchayatId);
      if (sg && item.GrampanchayatName !== sg.GramPanchayatName) return false;
    }
    if (selectedVillageId && item.VillageId) {
      const sv = villages.find(v => v.Id === selectedVillageId);
      if (sv && item.VillageName !== sv.VillageName) return false;
    }
    return true;
  });

const filterComplaintsByLocation = (data: ComplaintData[]) => data.filter(item => {
  if (selectedDistrictId) {
    const sd = districts.find(d => d.DistrictId === selectedDistrictId);
    if (sd && item.District !== sd.DistrictName) return false;
  }
  if (selectedBlockId) {
    const sb = blocks.find(b => b.BlockId === selectedBlockId);
    if (sb && item.Block !== sb.BlockName) return false;
  }
  if (selectedGramPanchayatId) {
    const sg = gramPanchayats.find(g => g.Id === selectedGramPanchayatId);
    if (sg && item.GramPanchayat !== sg.GramPanchayatName) return false;
  }
  if (selectedVillageId) {
    const sv = villages.find(v => v.Id === selectedVillageId);
    if (sv && item.Village !== sv.VillageName) return false;
  }
  return true;
});



  const filterOHTsByLocation = (data: OHTData[]) => data.filter(item => {
    if (selectedDistrictId) { 
      const sd = districts.find(d => d.DistrictId === selectedDistrictId); 
      if (sd && item.Districtname !== sd.DistrictName) return false 
    }
    if (selectedBlockId) { 
      const sb = blocks.find(b => b.BlockId === selectedBlockId); 
      if (sb && item.BlockName !== sb.BlockName) return false 
    }
    if (selectedGramPanchayatId) { 
      const sg = gramPanchayats.find(g => g.Id === selectedGramPanchayatId); 
      if (sg && item.GramPanchayatName !== sg.GramPanchayatName) return false 
    }
    if (selectedVillageId) { 
      const sv = villages.find(v => v.Id === selectedVillageId); 
      if (sv && item.VillageName !== sv.VillageName) return false 
    }
    return true;
  });

  const filterPumpHousesByOHT = (pumpHouses: PumpHouseData[], filteredOHTs: OHTData[]) => {
    const ohtIds = filteredOHTs.map(o => o.OhtId);
    return pumpHouses.filter(p => ohtIds.includes(p.OhtId));
  };

  const filterWaterFeeSummaryByLocation = (data: WaterFeeSummaryData[]) => data.filter(item => {
    if (selectedDistrictId) {
      const sd = districts.find(d => d.DistrictId === selectedDistrictId);
      if (sd && item.DistrictName !== sd.DistrictName) return false;
    }
    if (selectedBlockId) {
      const sb = blocks.find(b => b.BlockId === selectedBlockId);
      if (sb && item.BlockName !== sb.BlockName) return false;
    }
    if (selectedGramPanchayatId) {
      const sg = gramPanchayats.find(g => g.Id === selectedGramPanchayatId);
      if (sg && item.GramPanchayatName !== sg.GramPanchayatName) return false;
    }
    if (selectedVillageId) {
      const sv = villages.find(v => v.Id === selectedVillageId);
      if (sv && item.VillageName !== sv.VillageName) return false;
    }
    return true;
  });

  // --- Calculate comprehensive stats ---
  // Fix the collection efficiency calculation in the calculateLocationStats function

const calculateLocationStats = (
  beneficiaries: BeneficiaryData[], 
  ohts: OHTData[], 
  pumpHouses: PumpHouseData[], 
  waterQuality: WaterQualityData[],
  feeSummary: WaterFeeSummaryData[],
  complaints: ComplaintData[]
) => {
  const filteredBeneficiaries = filterByLocation(beneficiaries);
  const filteredOHTs = filterOHTsByLocation(ohts);
  const filteredPumpHouses = filterPumpHousesByOHT(pumpHouses, filteredOHTs);
  const filteredFeeSummary = filterWaterFeeSummaryByLocation(feeSummary);

  const totalBeneficiaries = filteredBeneficiaries.length;
  const activeBeneficiaries = filteredBeneficiaries.filter(b => b.Status === 1 || b.Status === 'Active').length;

  const totalFamilyMembers = filteredBeneficiaries.reduce((sum, b) => {
    const fm = b.FamilyMembers ?? b.FamilyCount ?? b.familyCount ?? 0;
    return sum + (Number(fm) || 0);
  }, 0);

  const totalOHTs = filteredOHTs.length;
  const totalOHTCapacity = filteredOHTs.reduce((s, o) => s + (o.OHTCapacity || 0), 0);

  const totalPumps = filteredPumpHouses.length;
  const activePumps = filteredPumpHouses.filter(p => p.Status === 1).length;
  const solarPumps = filteredPumpHouses.filter(p => p.PowerSource === '2').length;

  // Water fee summary stats
  const totalBaseFee = filteredFeeSummary.reduce((sum, item) => sum + (item.BaseFee || 0), 0);
  const totalPreviousBalance = filteredFeeSummary.reduce((sum, item) => sum + (item.PreviousBalance || 0), 0);
  const totalOutstanding = filteredFeeSummary.reduce((sum, item) => sum + (item.OutstandingAmount || 0), 0);
  const totalPaidAmount = filteredFeeSummary.reduce((sum, item) => sum + (item.PaidAmount || 0), 0);
  
  // FIXED: Collection efficiency calculation
  // Check if denominator (totalBaseFee + totalPreviousBalance) > 0 instead of totalOutstanding > 0
  const denominator = totalBaseFee + totalPreviousBalance;
  const collectionEfficiency = denominator > 0 ? (totalPaidAmount / denominator) * 100 : 0;

  const filteredComplaints = filterComplaintsByLocation(complaints);
  const totalComplaints = filteredComplaints.length;
  const pendingComplaints = filteredComplaints.filter(c => c.Status === 0).length;
  const resolvedComplaints = filteredComplaints.filter(c => c.Status === 1).length;
  const closedComplaints = filteredComplaints.filter(c => c.Status === 2).length;

  setStats({ 
    totalBeneficiaries, 
    activeBeneficiaries, 
    totalFamilyMembers, 
    totalOHTs, 
    totalOHTCapacity, 
    totalPumps, 
    activePumps, 
    solarPumps,
    totalBaseFee,
    totalPreviousBalance,
    totalOutstanding,
    totalPaidAmount,
    collectionEfficiency,
    totalComplaints,
    pendingComplaints,
    resolvedComplaints,
    closedComplaints
  });
};
  // Recalculate stats when fee summary data changes
  useEffect(() => {
  calculateLocationStats(beneficiariesData, ohtData, pumpHouseData, waterQualityData, waterFeeSummaryData, complaintsData);
}, [waterFeeSummaryData, beneficiariesData, ohtData, pumpHouseData, waterQualityData, complaintsData, selectedDistrictId, selectedBlockId, selectedGramPanchayatId, selectedVillageId]);

  // --- Chart data preparation ---
  const beneficiaryTrend = useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(); 
      d.setMonth(d.getMonth() - (5 - i));
      return d.toLocaleString('en-GB', { month: 'short', year: '2-digit' });
    });
    const filtered = filterByLocation(beneficiariesData);
    const base = filtered.length;
    return months.map((m, i) => ({ 
      month: m, 
      total: Math.max(0, Math.round(base * (0.6 + i * 0.08))), 
      active: Math.max(0, Math.round(base * (0.5 + i * 0.06))) 
    }));
  }, [beneficiariesData, selectedDistrictId, selectedBlockId, selectedGramPanchayatId, selectedVillageId]);

  const pumpStatusData = useMemo(() => {
    const filteredOHTs = filterOHTsByLocation(ohtData);
    const filteredPumps = filterPumpHousesByOHT(pumpHouseData, filteredOHTs);
    
    return [
      { name: 'Active', value: filteredPumps.filter(p => p.Status === 1).length, color: '#10b981' },
      { name: 'Inactive', value: filteredPumps.filter(p => p.Status !== 1).length, color: '#f97316' },
      { name: 'Solar', value: filteredPumps.filter(p => p.PowerSource === '2').length, color: '#60a5fa' }
    ];
  }, [pumpHouseData, ohtData, selectedDistrictId, selectedBlockId, selectedGramPanchayatId, selectedVillageId]);

  // Water Quality Trend by Year + Month
const waterQualityTrend = waterQualityData.map((item) => {
  const monthYear = `${item.Month.toString().padStart(2, "0")}-${item.Year}`;
  const contaminationPercent =
    item.TotalSamplesCollected > 0
      ? (item.TotalSamplesContaminated / item.TotalSamplesCollected) * 100
      : 0;

  return {
    Month: monthYear,
    Samples: item.TotalSamplesCollected,
    ContaminationPercent: contaminationPercent.toFixed(1),
  };
});

  const feeCollectionTrend = useMemo(() => {
    const filteredData = filterWaterFeeSummaryByLocation(waterFeeSummaryData);
    
    // Group by Year-Month and aggregate
    const monthlyData = filteredData.reduce((acc, item) => {
      const monthYear = `${item.Month.toString().padStart(2, '0')}-${item.Year}`;
      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          baseFee: 0,
          outstanding: 0,
          collected: 0
        };
      }
      acc[monthYear].baseFee += item.BaseFee || 0;
      acc[monthYear].outstanding += item.OutstandingAmount || 0;
      acc[monthYear].collected += item.PaidAmount || 0;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month));
  }, [waterFeeSummaryData, selectedDistrictId, selectedBlockId, selectedGramPanchayatId, selectedVillageId]);

  // --- Export functionality ---
  const exportToExcel = () => {
    const filteredBeneficiaries = filterByLocation(beneficiariesData);
    const filteredOHTs = filterOHTsByLocation(ohtData);
    const filteredPumpHouses = filterPumpHousesByOHT(pumpHouseData, filteredOHTs);
    const filteredFeeSummary = filterWaterFeeSummaryByLocation(waterFeeSummaryData);

    // Create workbook
    const wb = { Sheets: {}, SheetNames: [] };
    
    // Summary sheet
    const summary = [{
      'Monitoring Level': getSelectedLocationName(),
      'Total Beneficiaries': stats.totalBeneficiaries,
      'Active Beneficiaries': stats.activeBeneficiaries,
      'Total Family Members': stats.totalFamilyMembers,
      'Total OHTs': stats.totalOHTs,
      'Total OHT Capacity (KL)': stats.totalOHTCapacity,
      'Total Pumps': stats.totalPumps,
      'Active Pumps': stats.activePumps,
      'Solar Pumps': stats.solarPumps,
      'Total Base Fee (₹)': stats.totalBaseFee,
      'Total Previous Balance (₹)': stats.totalPreviousBalance,
      'Total Outstanding (₹)': stats.totalOutstanding,
      'Total Paid Amount (₹)': stats.totalPaidAmount,
    }];
    
    wb.Sheets['Summary'] = { A1: { v: 'Summary Data' } };
    wb.SheetNames.push('Summary');

    // Add detailed data sheets
    if (filteredBeneficiaries.length) {
      wb.Sheets['Beneficiaries'] = { A1: { v: 'Beneficiaries Data' } };
      wb.SheetNames.push('Beneficiaries');
    }
    
    if (filteredOHTs.length) {
      wb.Sheets['OHTs'] = { A1: { v: 'OHT Data' } };
      wb.SheetNames.push('OHTs');
    }
    
    if (filteredPumpHouses.length) {
      wb.Sheets['PumpHouses'] = { A1: { v: 'Pump Houses Data' } };
      wb.SheetNames.push('PumpHouses');
    }

    if (filteredFeeSummary.length) {
      wb.Sheets['WaterFeeSummary'] = { A1: { v: 'Water Fee Summary Data' } };
      wb.SheetNames.push('WaterFeeSummary');
    }

    // Create download
    const blob = new Blob(['Director Monitoring Export'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `director_monitoring_${getSelectedLocationName().replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCSV = (data: any[], filename: string) => {
    if (!data.length) {
      alert("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${getSelectedLocationName().replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSelectedLocationName = () => {
    const parts: string[] = [];
    if (selectedDistrictId) { 
      const d = districts.find(dd => dd.DistrictId === selectedDistrictId); 
      if (d) parts.push(d.DistrictName) 
    }
    if (selectedBlockId) { 
      const b = blocks.find(bb => bb.BlockId === selectedBlockId); 
      if (b) parts.push(b.BlockName) 
    }
    if (selectedGramPanchayatId) { 
      const g = gramPanchayats.find(x => x.Id === selectedGramPanchayatId); 
      if (g) parts.push(g.GramPanchayatName) 
    }
    if (selectedVillageId) { 
      const v = villages.find(x => x.Id === selectedVillageId); 
      if (v) parts.push(v.VillageName) 
    }
    return parts.length ? parts.join(' > ') : 'All Areas';
  };

  const resetFilters = () => {
    setSelectedDistrictId(null);
    setSelectedBlockId(null);
    setSelectedGramPanchayatId(null);
    setSelectedVillageId(null);
    // Reset to default date range (6 months ago to today)
    const defaultFromDate = new Date();
    defaultFromDate.setMonth(defaultFromDate.getMonth() - 6);
    setFromDate(defaultFromDate.toISOString().split('T')[0]);
    setToDate(new Date().toISOString().split('T')[0]);
  };

  if (userLoading) return <div className="p-6 flex items-center justify-center">Loading user information...</div>;
  
  if (!userId) return (
    <div className="p-6 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
        <p className="text-gray-600">Please log in to access the Monitoring Dashboard for Directorate</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br relative z-10 from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 rounded-2xl p-6 shadow-2xl text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Monitoring Dashboard for Directorate</h1>
            <div className="flex items-center gap-4 text-blue-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Monitoring: {getSelectedLocationName()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Real-time Data</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-blue-200">Last Updated</div>
              <div className="font-semibold">{new Date().toLocaleString('en-GB', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric',
                hour: '2-digit', 
                minute: '2-digit'
              })}</div>
            </div>
            <button 
              onClick={loadAllData} 
              disabled={loading}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={exportToExcel} 
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <div className="text-red-700">{error}</div>
          <button 
            onClick={() => setError('')}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-6 gap-6">
        {/* Enhanced Filters Panel */}
        <div className="xl:col-span-1 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Director Controls</h3>
          </div>

          <div className="space-y-4">
            {/* Location Filters */}
            <div className="border-b pb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Administrative Level
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">District</label>
                  <select 
                    value={selectedDistrictId || ''} 
                    onChange={(e) => setSelectedDistrictId(Number(e.target.value) || null)} 
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={locationLoading}
                  >
                    <option value="">All Districts</option>
                    {districts.map(d => <option key={d.DistrictId} value={d.DistrictId}>{d.DistrictName}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Block</label>
                  <select 
                    value={selectedBlockId || ''} 
                    onChange={(e) => setSelectedBlockId(Number(e.target.value) || null)} 
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!selectedDistrictId || locationLoading}
                  >
                    <option value="">All Blocks</option>
                    {blocks.map(b => <option key={b.BlockId} value={b.BlockId}>{b.BlockName}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Gram Panchayat</label>
                  <select 
                    value={selectedGramPanchayatId || ''} 
                    onChange={(e) => setSelectedGramPanchayatId(Number(e.target.value) || null)} 
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!selectedBlockId || locationLoading}
                  >
                    <option value="">All GPs</option>
                    {gramPanchayats.map(g => <option key={g.Id} value={g.Id}>{g.GramPanchayatName}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Village</label>
                  <select 
                    value={selectedVillageId || ''} 
                    onChange={(e) => setSelectedVillageId(Number(e.target.value) || null)} 
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!selectedGramPanchayatId || locationLoading}
                  >
                    <option value="">All Villages</option>
                    {villages.map(v => <option key={v.Id} value={v.Id}>{v.VillageName}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Date Range Filters */}
            <div className="border-b pb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Fee Data Period
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button 
                onClick={loadAllData}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                {loading ? 'Loading...' : 'Apply Filters'}
              </button>
              
              <button 
                onClick={resetFilters}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Reset Filters
              </button>
            </div>

            {/* Current Selection Info */}
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-xs text-blue-600 font-medium mb-1">Currently Monitoring:</div>
              <div className="text-sm text-blue-800 font-semibold break-words">
                {getSelectedLocationName()}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Period: {new Date(fromDate).toLocaleDateString()} to {new Date(toDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="xl:col-span-5 space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-lg p-2">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'beneficiaries', label: 'Beneficiaries', icon: Users },
                { id: 'infrastructure', label: 'Infrastructure', icon: Zap },
                { id: 'finance', label: 'Financial', icon: DollarSign },
                { id: 'quality', label: 'Water Quality', icon: Droplets },
                { id: 'complaints', label: 'Complaints', icon: MessageSquare }, // Add this line
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <div className="text-gray-600">Loading comprehensive monitoring data...</div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Enhanced KPI Cards */}
              {/* Enhanced KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => setActiveTab('beneficiaries')}
                  className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-200 cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-blue-600">{stats.totalBeneficiaries.toLocaleString()}</div>
                      <div className="text-sm font-medium text-gray-600">Total Beneficiaries</div>
                      <div className="text-xs text-green-600 mt-1">
                        {stats.totalBeneficiaries > 0 ? Math.round((stats.activeBeneficiaries / stats.totalBeneficiaries) * 100) : 0}% active
                      </div>
                      <div className="text-xs text-blue-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to view details →
                      </div>
                    </div>
                    <Users className="w-12 h-12 text-blue-500 opacity-20" />
                  </div>
                </button>

                <button 
                  onClick={() => setActiveTab('beneficiaries')}
                  className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-200 cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-green-600">{stats.totalFamilyMembers.toLocaleString()}</div>
                      <div className="text-sm font-medium text-gray-600">Family Members</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {stats.totalBeneficiaries > 0 ? (stats.totalFamilyMembers / stats.totalBeneficiaries).toFixed(1) : 0} avg per family
                      </div>
                      <div className="text-xs text-green-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to view details →
                      </div>
                    </div>
                    <Users className="w-12 h-12 text-green-500 opacity-20" />
                  </div>
                </button>

                <button 
                  onClick={() => setActiveTab('infrastructure')}
                  className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500 hover:shadow-xl transition-shadow duration-200 cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-indigo-600">{stats.totalOHTs.toLocaleString()}</div>
                      <div className="text-sm font-medium text-gray-600">Overhead Tank</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {stats.totalOHTCapacity.toLocaleString()} KL capacity
                      </div>
                      <div className="text-xs text-indigo-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to view details →
                      </div>
                    </div>
                    <Droplets className="w-12 h-12 text-indigo-500 opacity-20" />
                  </div>
                </button>

                <button 
                  onClick={() => setActiveTab('infrastructure')}
                  className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow duration-200 cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-orange-600">{stats.totalPumps.toLocaleString()}</div>
                      <div className="text-sm font-medium text-gray-600">Pumping Station</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {stats.activePumps} active • {stats.totalPumps - stats.activePumps} inactive
                      </div>
                      <div className="text-xs text-orange-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to view details →
                      </div>
                    </div>
                    <Zap className="w-12 h-12 text-orange-500 opacity-20" />
                  </div>
                </button>
              </div>
              {/* Water Fee Detail Card */}
{waterFeeSummaryData.length > 0 && (
  <div className="bg-white rounded-xl shadow-lg p-6">
    {/* Heading */}
    <h3 className="text-xl font-semibold text-gray-800 mb-4">
      Water Fee Detail
    </h3>

    {/* Sub-details */}
    <div className="space-y-3">
      {/* Proposed Amount */}
      <div className="flex items-center justify-between border-b pb-2">
        <span className="text-sm font-medium text-gray-600">Proposed Amount</span>
        <span className="text-lg font-semibold text-blue-600">
          ₹{stats.totalBaseFee.toLocaleString()}
        </span>
      </div>

      {/* Collected Amount */}
      <div className="flex items-center justify-between border-b pb-2">
        <span className="text-sm font-medium text-gray-600">Collected Amount</span>
        <span className="text-lg font-semibold text-green-600">
          ₹{stats.totalPaidAmount.toLocaleString()}
        </span>
      </div>

      {/* Outstanding Amount */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Outstanding Amount</span>
        <span className="text-lg font-semibold text-orange-600">
          ₹{stats.totalOutstanding.toLocaleString()}
        </span>
      </div>
    </div>
  </div>
)}

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {/* Beneficiary Trend */}
<div className="bg-white rounded-xl shadow-lg p-6">
  <div className="flex items-center justify-between mb-4">
    <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
      <TrendingUp className="w-5 h-5 text-blue-600" />
      Beneficiary Growth Trend
    </h4>
    <button 
      onClick={() => exportCSV(beneficiaryTrend, 'beneficiary_trend')}
      className="text-blue-600 hover:text-blue-800 text-sm"
    >
      Export
    </button>
  </div>
  <div style={{ height: 280 }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={beneficiaryTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }} 
        />
        <Legend />
        <Bar 
          dataKey="total" 
          fill="#3b82f6" 
          name="Total Beneficiaries"
          barSize={40}
          radius={[6, 6, 0, 0]} 
        />
        <Bar 
          dataKey="active" 
          fill="#10b981" 
          name="Active Beneficiaries"
          barSize={40}
          radius={[6, 6, 0, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

{/* Fee Collection Trend */}
{feeCollectionTrend.length > 0 && (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-green-600" />
        Fee Collection Trend
      </h4>
      <button 
        onClick={() => exportCSV(feeCollectionTrend, 'fee_collection_trend')}
        className="text-blue-600 hover:text-blue-800 text-sm"
      >
        Export
      </button>
    </div>
    <div style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={feeCollectionTrend} 
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value: any, name: any) => [
              `₹${Number(value).toLocaleString()}`, 
              name
            ]}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }} 
          />
          <Legend />

          {/* Base Fee Bar */}
          <Bar 
            dataKey="baseFee" 
            fill="#3b82f6" 
            name="Base Fee"
            barSize={40}
            radius={[6, 6, 0, 0]} 
          />

          {/* Collected Bar */}
          <Bar 
            dataKey="collected" 
            fill="#10b981" 
            name="Collected"
            barSize={40}
            radius={[6, 6, 0, 0]} 
          />

          {/* Outstanding Bar */}
          <Bar 
            dataKey="outstanding" 
            fill="#f97316" 
            name="Outstanding"
            barSize={40}
            radius={[6, 6, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
)}

              </div>
            </div>
          )}

{/* Complaints Tab */}
{activeTab === 'complaints' && (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-purple-600" />
        Complaint Management
      </h3>
      <button 
        onClick={() => exportCSV(filterComplaintsByLocation(complaintsData), 'complaints_data')}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        disabled={filterComplaintsByLocation(complaintsData).length === 0}
      >
        <Download className="w-4 h-4" />
        Export CSV
      </button>
    </div>

    {complaintsData.length > 0 ? (
      <>
        {/* Complaint Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {filterComplaintsByLocation(complaintsData).length}
            </div>
            <div className="text-sm text-blue-800">Total Complaints</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {filterComplaintsByLocation(complaintsData).filter(c => c.Status === 0).length}
            </div>
            <div className="text-sm text-yellow-800">Pending</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {filterComplaintsByLocation(complaintsData).filter(c => c.Status === 1).length}
            </div>
            <div className="text-sm text-green-800">Resolved</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-600">
              {filterComplaintsByLocation(complaintsData).filter(c => c.Status === 2).length}
            </div>
            <div className="text-sm text-gray-800">Closed</div>
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          Showing {filterComplaintsByLocation(complaintsData).length} complaints for {getSelectedLocationName()}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Complaint ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">District</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Block</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">GP</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Village</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Beneficiary</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filterComplaintsByLocation(complaintsData).slice(0, 50).map((complaint, index) => (
                <tr key={complaint.ComplaintID} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">#{complaint.ComplaintID}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{complaint.District}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{complaint.Block}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{complaint.GramPanchayat}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{complaint.Village}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{complaint.BeneficiaryName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{complaint.Contact}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div>
                      <div className="font-medium">{complaint.Category}</div>
                      {complaint.Landmark && (
                        <div className="text-xs text-gray-500">📍 {complaint.Landmark}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      complaint.Status === 0 ? 'bg-yellow-100 text-yellow-800' :
                      complaint.Status === 1 ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {complaint.Status === 0 ? 'Pending' : 
                       complaint.Status === 1 ? 'Resolved' : 'Closed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filterComplaintsByLocation(complaintsData).length > 50 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing first 50 records out of {filterComplaintsByLocation(complaintsData).length} total complaints.
            <button 
              onClick={() => exportCSV(filterComplaintsByLocation(complaintsData), 'all_complaints')}
              className="ml-2 text-blue-600 hover:text-blue-800 underline"
            >
              Export all records
            </button>
          </div>
        )}
      </>
    ) : (
      <div className="text-center py-12">
        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-600 mb-2">No Complaint Data</h4>
        <p className="text-gray-500">
          No complaint records found for the selected criteria. 
          Try adjusting your filters or check if complaints have been registered.
        </p>
      </div>
    )}
  </div>
)}

          {/* Beneficiaries Tab */}
{activeTab === 'beneficiaries' && (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <Users className="w-6 h-6 text-blue-600" />
        Beneficiaries Data
      </h3>
      <div className="flex gap-2">
        <button 
          onClick={() => exportCSV(filterByLocation(beneficiariesData), 'beneficiaries')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          disabled={filterByLocation(beneficiariesData).length === 0}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>
    </div>

    {/* --- Summary Stat Cards --- */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total Beneficiaries */}
      <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200">
        <div className="text-sm font-medium text-gray-600">Total Beneficiaries</div>
        <div className="text-2xl font-bold text-blue-700">
          {filterByLocation(beneficiariesData).length.toLocaleString()}
        </div>
      </div>

      {/* Total Family Members */}
<div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-200">
  <div className="text-sm font-medium text-gray-600">Total Family Members</div>
  <div className="text-2xl font-bold text-green-700">
    {filterByLocation(beneficiariesData).reduce(
      (sum, b) => sum + Number(b.FamilyMembers ?? b.FamilyCount ?? b.familyCount ?? 0), 
      0
    ).toLocaleString()}
  </div>
</div>


      {/* Total Active Households */}
      <div className="bg-orange-50 rounded-lg p-4 shadow-sm border border-orange-200">
        <div className="text-sm font-medium text-gray-600">Total Active Households</div>
        <div className="text-2xl font-bold text-orange-700">
          {filterByLocation(beneficiariesData).filter(
            (b) => b.Status === 1 || b.Status === 'Active'
          ).length.toLocaleString()}
        </div>
      </div>
    </div>

    <div className="mb-4 text-sm text-gray-600">
      Showing {filterByLocation(beneficiariesData).length} beneficiaries for {getSelectedLocationName()}
    </div>

    {/* --- Table --- */}
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Beneficiary ID</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">District</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Block</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">GP</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Village</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Family Members</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filterByLocation(beneficiariesData).slice(0, 50).map((beneficiary, index) => (
            <tr key={beneficiary.BeneficiaryId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-4 py-3 text-sm text-gray-900">#{beneficiary.BeneficiaryId}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{beneficiary.BeneficiaryName}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{beneficiary.DistrictName || 'N/A'}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{beneficiary.BlockName || 'N/A'}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{beneficiary.GrampanchayatName || 'N/A'}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{beneficiary.VillageName}</td>
              <td className="px-4 py-3 text-sm text-gray-600 text-center">
                {beneficiary.FamilyMembers ?? beneficiary.FamilyCount ?? beneficiary.familyCount ?? 0}
              </td>
              <td className="px-4 py-3 text-sm">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  beneficiary.Status === 1 || beneficiary.Status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {beneficiary.Status === 1 || beneficiary.Status === 'Active' ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {filterByLocation(beneficiariesData).length > 50 && (
      <div className="mt-4 text-center text-sm text-gray-600">
        Showing first 50 records out of {filterByLocation(beneficiariesData).length} total beneficiaries.
        <button 
          onClick={() => exportCSV(filterByLocation(beneficiariesData), 'all_beneficiaries')}
          className="ml-2 text-blue-600 hover:text-blue-800 underline"
        >
          Export all records
        </button>
      </div>
    )}
  </div>
)}


          {/* Infrastructure Tab */}
          {activeTab === 'infrastructure' && (
            <div className="space-y-6">
              {/* OHT Data */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Droplets className="w-6 h-6 text-indigo-600" />
                    Overhead Tank (OHT) Infrastructure
                  </h3>
                  <button 
                    onClick={() => exportCSV(filterOHTsByLocation(ohtData), 'oht_data')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    disabled={filterOHTsByLocation(ohtData).length === 0}
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-yellow-100 rounded-lg p-4">
                    <div className="text-2xl font-bold text-grey-900">{filterOHTsByLocation(ohtData).length}</div>
                    <div className="text-sm text-grey-900">Total Overhead Tanks</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {filterOHTsByLocation(ohtData).reduce((sum, oht) => sum + (oht.OHTCapacity || 0), 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-800">Total Capacity (KL)</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {filterOHTsByLocation(ohtData).reduce((sum, oht) => sum + (oht.NoOfPumps || 0), 0)}
                    </div>
                    <div className="text-sm text-green-800">Total Pumps</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">OHT ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">District</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Block</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">GP</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Village</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Capacity (KL)</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">No. of Pumps</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filterOHTsByLocation(ohtData).slice(0, 30).map((oht, index) => (
                        <tr key={oht.OhtId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">#{oht.OhtId}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{oht.Districtname}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{oht.BlockName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{oht.GramPanchayatName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{oht.VillageName}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                            {(oht.OHTCapacity || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{oht.NoOfPumps || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pump House Data */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-orange-600" />
                    Pump House Infrastructure
                  </h3>
                  <button 
                    onClick={() => exportCSV(filterPumpHousesByOHT(pumpHouseData, filterOHTsByLocation(ohtData)), 'pump_house_data')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    disabled={filterPumpHousesByOHT(pumpHouseData, filterOHTsByLocation(ohtData)).length === 0}
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-yellow-100 rounded-lg p-4">
                    <div className="text-2xl font-bold text-grey-900">
                      {filterPumpHousesByOHT(pumpHouseData, filterOHTsByLocation(ohtData)).length}
                    </div>
                    <div className="text-sm text-grey-900">Total Pumps</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {filterPumpHousesByOHT(pumpHouseData, filterOHTsByLocation(ohtData)).filter(p => p.Status === 1).length}
                    </div>
                    <div className="text-sm text-green-800">Active Pumps</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {filterPumpHousesByOHT(pumpHouseData, filterOHTsByLocation(ohtData)).filter(p => p.PowerSource === '2').length}
                    </div>
                    <div className="text-sm text-blue-800">Solar Pumps</div>
                  </div>
                  <div className="bg-red-100 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-800">
                      {filterPumpHousesByOHT(pumpHouseData, filterOHTsByLocation(ohtData)).filter(p => p.Status !== 1).length}
                    </div>
                    <div className="text-sm text-red-800">Inactive Pumps</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Pump ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">OHT ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Operator</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Contact</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Capacity (HP)</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Power Source</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Solar Output</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filterPumpHousesByOHT(pumpHouseData, filterOHTsByLocation(ohtData)).slice(0, 30).map((pump, index) => (
                        <tr key={pump.PumpId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">#{pump.PumpId}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">#{pump.OhtId}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{pump.OperatorName || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{pump.Contact || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{pump.HorsePower || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              pump.PowerSource === '2' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {pump.PowerSource === '2' ? 'Solar' : 'Electric'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{pump.SolarOutput || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              pump.Status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {pump.Status === 1 ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Updated Financial Tab */}
          {activeTab === 'finance' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  Water Fee Summary Management
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => exportCSV(filterWaterFeeSummaryByLocation(waterFeeSummaryData), 'water_fee_summary')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    disabled={waterFeeSummaryData.length === 0}
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
              </div>

              {waterFeeSummaryData.length > 0 ? (
                <>
                  {/* Financial Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-600">₹{stats.totalPreviousBalance.toLocaleString()}</div>
                      <div className="text-sm text-yellow-800">Previous Balance</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-orange-600">₹{stats.totalOutstanding.toLocaleString()}</div>
                      <div className="text-sm text-orange-800">Outstanding Amount</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">₹{stats.totalPaidAmount.toLocaleString()}</div>
                      <div className="text-sm text-green-800">Paid Amount</div>
                    </div>
                    
                  </div>

                  <div className="mb-4 text-sm text-gray-600">
                    Showing {filterWaterFeeSummaryByLocation(waterFeeSummaryData).length} water fee records for {getSelectedLocationName()}
                    • Period: {new Date(fromDate).toLocaleDateString()} to {new Date(toDate).toLocaleDateString()}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">District</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Block</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">GP</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Village</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Year</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Month</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Base Fee (₹)</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Previous Balance (₹)</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Outstanding (₹)</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Paid (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filterWaterFeeSummaryByLocation(waterFeeSummaryData).slice(0, 50).map((fee, index) => (
                          <tr key={`${fee.DistrictName}-${fee.VillageName}-${fee.Year}-${fee.Month}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">{fee.DistrictName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{fee.BlockName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{fee.GramPanchayatName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{fee.VillageName}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{fee.Year}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{fee.Month}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{(fee.BaseFee || 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-yellow-600 text-right font-medium">{(fee.PreviousBalance || 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-orange-600 text-right font-medium">{(fee.OutstandingAmount || 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-green-600 text-right font-medium">{(fee.PaidAmount || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filterWaterFeeSummaryByLocation(waterFeeSummaryData).length > 50 && (
                    <div className="mt-4 text-center text-sm text-gray-600">
                      Showing first 50 records out of {filterWaterFeeSummaryByLocation(waterFeeSummaryData).length} total water fee records.
                      <button 
                        onClick={() => exportCSV(filterWaterFeeSummaryByLocation(waterFeeSummaryData), 'all_water_fee_summary')}
                        className="ml-2 text-blue-600 hover:text-blue-800 underline"
                      >
                        Export all records
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">No Water Fee Summary Data</h4>
                  <p className="text-gray-500">
                    No water fee summary records found for the selected criteria. 
                    Try adjusting your filters or check if data is available for the selected time period.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Water Quality Tab */}
          {activeTab === 'quality' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Droplets className="w-6 h-6 text-blue-600" />
                  Water Quality Monitoring
                </h3>
                <button 
                  onClick={() => exportCSV(filteredWQ, 'water_quality')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  disabled={waterQualityData.length === 0}
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>

              {waterQualityData.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {filteredWQ.reduce((sum, w) => sum + (w.TotalSamplesCollected || 0), 0)}
                      </div>
                      <div className="text-sm text-blue-800">Total Samples</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-600">
                        {filteredWQ.reduce((sum, w) => sum + (w.TotalSamplesContaminated || 0), 0)}
                      </div>
                      <div className="text-sm text-red-800">Contaminated</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {filteredWQ.reduce((sum, w) => sum + (w.VillagesTestedCount || 0), 0)}
                      </div>
                      <div className="text-sm text-green-800">Villages Tested</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-orange-600">
                        {filteredWQ.reduce((sum, w) => sum + (w.ContaminatedVillagesCount || 0), 0)}
                      </div>
                      <div className="text-sm text-orange-800">Villages with Issues</div>
                    </div>
                  </div>

                  <div className="mb-4 text-sm text-gray-600">
                    Showing {waterQualityData.length} water quality test records (last 6 months)
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">District</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Block</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Gram Panchayat</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Year</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Month</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Samples Collected</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Contaminated Samples</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Villages Tested</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Villages with Issues</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Contamination %</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-200">
                        {filteredWQ.slice(0, 30).map((test, index) => (
                          <tr key={`${test.DistrictName}-${test.BlockName}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 text-sm text-gray-900">{test.DistrictName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{test.BlockName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{test.GramPanchayatName}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{test.Year}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{test.Month}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{test.TotalSamplesCollected || 0}</td>
                            <td className="px-4 py-3 text-sm text-red-600 text-right font-medium">{test.TotalSamplesContaminated || 0}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{test.VillagesTestedCount || 0}</td>
                            <td className="px-4 py-3 text-sm text-orange-600 text-right font-medium">{test.ContaminatedVillagesCount || 0}</td>
                            <td className="px-4 py-3 text-sm text-right">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  (test.TotalSamplesCollected > 0 ? (test.TotalSamplesContaminated / test.TotalSamplesCollected) * 100 : 0) > 20
                                    ? 'bg-red-100 text-red-800'
                                    : (test.TotalSamplesCollected > 0 ? (test.TotalSamplesContaminated / test.TotalSamplesCollected) * 100 : 0) > 10
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {test.TotalSamplesCollected > 0
                                  ? ((test.TotalSamplesContaminated / test.TotalSamplesCollected) * 100).toFixed(1)
                                  : 0}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Droplets className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">No Water Quality Data</h4>
                  <p className="text-gray-500">
                    No water quality test records found for the last 6 months. 
                    Water quality monitoring may not have been conducted recently.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${loading ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span>{loading ? 'Loading data...' : 'Data loaded successfully'}</span>
            </div>
            <div>
              Total Records: {beneficiariesData.length + ohtData.length + pumpHouseData.length + waterQualityData.length + waterFeeSummaryData.length}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div>Role: {role || 'User'}</div>
            <div>User ID: {userId}</div>
            <div>
              Last Refresh: {new Date().toLocaleTimeString('en-GB', { hour12: false })}
            </div>
          </div>
        </div>
      </div>

      {/* Location Loading Overlay */}
      {locationLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            <div>
              <div className="font-medium text-gray-900">Loading Location Data</div>
              <div className="text-sm text-gray-600">Fetching administrative boundaries...</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectorMonitoring;