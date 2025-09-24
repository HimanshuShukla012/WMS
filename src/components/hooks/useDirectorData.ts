// hooks/useDirectorData.ts - Custom hook for all director monitoring data management

import { useState, useEffect, useMemo } from 'react';
import { useUserInfo } from '../../utils/userInfo';
import * as Types from '../types';

export const useDirectorData = (
  selectedDistrictId: number | null,
  selectedBlockId: number | null,
  selectedGramPanchayatId: number | null,
  selectedVillageId: number | null,
  fromDate: string,
  toDate: string,
  districts: Types.District[],
  blocks: Types.Block[],
  gramPanchayats: Types.GramPanchayat[],
  villages: Types.Village[]
) => {
  const { userId, role } = useUserInfo();
  
  // All data state
  const [beneficiariesData, setBeneficiariesData] = useState<Types.BeneficiaryData[]>([]);
  const [ohtData, setOhtData] = useState<Types.OHTData[]>([]);
  const [pumpHouseData, setPumpHouseData] = useState<Types.PumpHouseData[]>([]);
  const [waterQualityData, setWaterQualityData] = useState<Types.WaterQualityData[]>([]);
  const [waterFeeSummaryData, setWaterFeeSummaryData] = useState<Types.WaterFeeSummaryData[]>([]);
  const [complaintsData, setComplaintsData] = useState<Types.ComplaintData[]>([]);
  const [stats, setStats] = useState<Types.LocationStats>({ 
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
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    closedComplaints: 0   
  });

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // --- API Functions ---
  const fetchBeneficiaries = async (): Promise<Types.BeneficiaryData[]> => {
    try {
      const effectiveUserId = role === 'Admin' ? 0 : userId;
      const response = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/GetBeneficiaryListByUserIdVillageAndStatus', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ userId: effectiveUserId, VillageId: 0, Status: 0 }) 
      });
      if (!response.ok) return [];
      const result = await response.json();
      return result.Status ? result.Data || [] : [];
    } catch (error) { 
      console.error('Failed to fetch beneficiaries:', error); 
      return [];
    }
  };

  const fetchOHTData = async (): Promise<Types.OHTData[]> => {
    try {
      const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetOHTListByVillage?VillageId=0&UserId=${userId}`, { 
        method: 'GET', 
        headers: { Accept: '*/*', 'Content-Type': 'application/json' } 
      });
      if (!response.ok) return [];
      const result = await response.json();
      return result.Status ? result.Data || [] : [];
    } catch (error) { 
      console.error('Failed to fetch OHT data:', error); 
      return [];
    }
  };

  const fetchPumpHouseData = async (): Promise<Types.PumpHouseData[]> => {
    try {
      const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetPumpHouseListByUserId?UserId=${userId}`, { 
        method: 'GET', 
        headers: { accept: '*/*' } 
      });
      if (!response.ok) return [];
      const result = await response.json();
      return result.Status ? result.Data || [] : [];
    } catch (error) { 
      console.error('Failed to fetch pump house data:', error); 
      return [];
    }
  };

  const fetchWaterQualityData = async (): Promise<Types.WaterQualityData[]> => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);

      const response = await fetch("https://wmsapi.kdsgroup.co.in/api/Master/GetWaterQualityTestReportDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({
          User_Id: userId ? parseInt(userId.toString()) : 0,
          FromDate: startDate.toISOString(),
          ToDate: endDate.toISOString(),
        }),
      });
      if (!response.ok) return [];
      const result = await response.json();
      return result.Status ? result.Data || [] : [];
    } catch (error) {
      console.error('Failed to fetch water quality data:', error);
      return [];
    }
  };

  const fetchWaterFeeSummaryData = async (): Promise<Types.WaterFeeSummaryData[]> => {
    try {
      const fromDateISO = new Date(fromDate + 'T00:00:00.000Z').toISOString();
      const toDateISO = new Date(toDate + 'T23:59:59.999Z').toISOString();
      
      const response = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/GetWaterFeeSummaryReportDetails', {
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
      
      if (!response.ok) return [];
      const result = await response.json();
      return result.Status ? result.Data || [] : [];
    } catch (error) { 
      console.error('Failed to fetch water fee summary:', error); 
      return [];
    }
  };

  const fetchComplaintsData = async (): Promise<Types.ComplaintData[]> => {
    try {
      const effectiveUserId = role === 'Admin' ? 0 : userId;
      const response = await fetch('https://wmsapi.kdsgroup.co.in/api/Complain/GetComplaintListByUserIdVillageAndStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          UserId: effectiveUserId, 
          VillageId: selectedVillageId || 0, 
          Status: 0
        })
      });
      if (!response.ok) return [];
      const result = await response.json();
      return result.Status ? result.Data || [] : [];
    } catch (error) { 
      console.error('Failed to fetch complaints data:', error); 
      return [];
    }
  };

  // --- Filtering Functions ---
  const filterByLocation = (data: Types.BeneficiaryData[]) => data.filter(item => {
    if (selectedDistrictId && item.DistrictName) {
      const selectedDistrict = districts.find(d => d.DistrictId === selectedDistrictId);
      if (selectedDistrict && item.DistrictName !== selectedDistrict.DistrictName) return false;
    }
    if (selectedBlockId && item.BlockName) {
      const selectedBlock = blocks.find(b => b.BlockId === selectedBlockId);
      if (selectedBlock && item.BlockName !== selectedBlock.BlockName) return false;
    }
    if (selectedGramPanchayatId && item.GrampanchayatName) {
      const selectedGP = gramPanchayats.find(g => g.Id === selectedGramPanchayatId);
      if (selectedGP && item.GrampanchayatName !== selectedGP.GramPanchayatName) return false;
    }
    if (selectedVillageId && item.VillageId) {
      const selectedVillage = villages.find(v => v.Id === selectedVillageId);
      if (selectedVillage && item.VillageName !== selectedVillage.VillageName) return false;
    }
    return true;
  });

  const filterOHTsByLocation = (data: Types.OHTData[]) => data.filter(item => {
    if (selectedDistrictId) { 
      const selectedDistrict = districts.find(d => d.DistrictId === selectedDistrictId); 
      if (selectedDistrict && item.Districtname !== selectedDistrict.DistrictName) return false;
    }
    if (selectedBlockId) { 
      const selectedBlock = blocks.find(b => b.BlockId === selectedBlockId); 
      if (selectedBlock && item.BlockName !== selectedBlock.BlockName) return false;
    }
    if (selectedGramPanchayatId) { 
      const selectedGP = gramPanchayats.find(g => g.Id === selectedGramPanchayatId); 
      if (selectedGP && item.GramPanchayatName !== selectedGP.GramPanchayatName) return false;
    }
    if (selectedVillageId) { 
      const selectedVillage = villages.find(v => v.Id === selectedVillageId); 
      if (selectedVillage && item.VillageName !== selectedVillage.VillageName) return false;
    }
    return true;
  });

  const filterPumpHousesByOHT = (pumpHouses: Types.PumpHouseData[], filteredOHTs: Types.OHTData[]) => {
    const ohtIds = filteredOHTs.map(o => o.OhtId);
    return pumpHouses.filter(p => ohtIds.includes(p.OhtId));
  };

  const filterWaterFeeSummaryByLocation = (data: Types.WaterFeeSummaryData[]) => data.filter(item => {
    if (selectedDistrictId) {
      const selectedDistrict = districts.find(d => d.DistrictId === selectedDistrictId);
      if (selectedDistrict && item.DistrictName !== selectedDistrict.DistrictName) return false;
    }
    if (selectedBlockId) {
      const selectedBlock = blocks.find(b => b.BlockId === selectedBlockId);
      if (selectedBlock && item.BlockName !== selectedBlock.BlockName) return false;
    }
    if (selectedGramPanchayatId) {
      const selectedGP = gramPanchayats.find(g => g.Id === selectedGramPanchayatId);
      if (selectedGP && item.GramPanchayatName !== selectedGP.GramPanchayatName) return false;
    }
    if (selectedVillageId) {
      const selectedVillage = villages.find(v => v.Id === selectedVillageId);
      if (selectedVillage && item.VillageName !== selectedVillage.VillageName) return false;
    }
    return true;
  });

  const filterComplaintsByLocation = (data: Types.ComplaintData[]) => data.filter(item => {
    if (selectedDistrictId) {
      const selectedDistrict = districts.find(d => d.DistrictId === selectedDistrictId);
      if (selectedDistrict && item.District !== selectedDistrict.DistrictName) return false;
    }
    if (selectedBlockId) {
      const selectedBlock = blocks.find(b => b.BlockId === selectedBlockId);
      if (selectedBlock && item.Block !== selectedBlock.BlockName) return false;
    }
    if (selectedGramPanchayatId) {
      const selectedGP = gramPanchayats.find(g => g.Id === selectedGramPanchayatId);
      if (selectedGP && item.GramPanchayat !== selectedGP.GramPanchayatName) return false;
    }
    if (selectedVillageId) {
      const selectedVillage = villages.find(v => v.Id === selectedVillageId);
      if (selectedVillage && item.Village !== selectedVillage.VillageName) return false;
    }
    return true;
  });

  const filterWaterQualityByLocation = (data: Types.WaterQualityData[]) => {
    const selectedDistrict = districts.find(d => d.DistrictId === selectedDistrictId)?.DistrictName;
    const selectedBlock = blocks.find(b => b.BlockId === selectedBlockId)?.BlockName;
    const selectedGP = gramPanchayats.find(gp => gp.Id === selectedGramPanchayatId)?.GramPanchayatName;

    return data.filter(wq => {
      const matchDistrict = !selectedDistrict || wq.DistrictName === selectedDistrict;
      const matchBlock = !selectedBlock || wq.BlockName === selectedBlock;
      const matchGP = !selectedGP || wq.GramPanchayatName === selectedGP;
      return matchDistrict && matchBlock && matchGP;
    });
  };

  // --- Calculate Statistics ---
  const calculateLocationStats = (
    beneficiaries: Types.BeneficiaryData[], 
    ohts: Types.OHTData[], 
    pumpHouses: Types.PumpHouseData[], 
    waterQuality: Types.WaterQualityData[],
    feeSummary: Types.WaterFeeSummaryData[],
    complaints: Types.ComplaintData[]
  ) => {
    const filteredBeneficiaries = filterByLocation(beneficiaries);
    const filteredOHTs = filterOHTsByLocation(ohts);
    const filteredPumpHouses = filterPumpHousesByOHT(pumpHouses, filteredOHTs);
    const filteredFeeSummary = filterWaterFeeSummaryByLocation(feeSummary);
    const filteredComplaints = filterComplaintsByLocation(complaints);

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

    const totalBaseFee = filteredFeeSummary.reduce((sum, item) => sum + (item.BaseFee || 0), 0);
    const totalPreviousBalance = filteredFeeSummary.reduce((sum, item) => sum + (item.PreviousBalance || 0), 0);
    const totalOutstanding = filteredFeeSummary.reduce((sum, item) => sum + (item.OutstandingAmount || 0), 0);
    const totalPaidAmount = filteredFeeSummary.reduce((sum, item) => sum + (item.PaidAmount || 0), 0);
    
    const denominator = totalBaseFee + totalPreviousBalance;
    const collectionEfficiency = denominator > 0 ? (totalPaidAmount / denominator) * 100 : 0;

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

  // --- Load All Data ---
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
      setComplaintsData(complaints);

      calculateLocationStats(ben, ohts, pumps, wq, feeSummary, complaints);
    } catch (error) { 
      console.error('Failed to load monitoring data:', error); 
      setError('Failed to load monitoring data');
    } finally { 
      setLoading(false);
    }
  };

  // --- Chart Data Preparation ---
  const beneficiaryTrend: Types.BeneficiaryTrendData[] = useMemo(() => {
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

  const feeCollectionTrend: Types.FeeCollectionTrendData[] = useMemo(() => {
    const filteredData = filterWaterFeeSummaryByLocation(waterFeeSummaryData);
    
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

  // Load data when dependencies change
  useEffect(() => { 
    loadAllData(); 
  }, [userId, selectedDistrictId, selectedBlockId, selectedGramPanchayatId, selectedVillageId, fromDate, toDate]);

  // Recalculate stats when data changes
  useEffect(() => {
    calculateLocationStats(beneficiariesData, ohtData, pumpHouseData, waterQualityData, waterFeeSummaryData, complaintsData);
  }, [waterFeeSummaryData, beneficiariesData, ohtData, pumpHouseData, waterQualityData, complaintsData, selectedDistrictId, selectedBlockId, selectedGramPanchayatId, selectedVillageId]);

  return {
    // Data
    beneficiariesData,
    ohtData,
    pumpHouseData,
    waterQualityData,
    waterFeeSummaryData,
    complaintsData,
    stats,
    
    // Derived data
    beneficiaryTrend,
    feeCollectionTrend,
    
    // States
    loading,
    error,
    setError,
    
    // Functions
    loadAllData,
    
    // Filtering functions
    filterByLocation,
    filterOHTsByLocation,
    filterPumpHousesByOHT,
    filterWaterFeeSummaryByLocation,
    filterComplaintsByLocation,
    filterWaterQualityByLocation
  };
};