// hooks/useDirectorData.ts - Fixed to use actual userId instead of hardcoded 0 for admin

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
  
  // Performance data state
  const [topDistrictsData, setTopDistrictsData] = useState<Types.TopBottomDistrictData[]>([]);
  const [bottomDistrictsData, setBottomDistrictsData] = useState<Types.TopBottomDistrictData[]>([]);
  const [topBlocksData, setTopBlocksData] = useState<Types.TopBottomBlockData[]>([]);
  const [bottomBlocksData, setBottomBlocksData] = useState<Types.TopBottomBlockData[]>([]);
  const [topGPsData, setTopGPsData] = useState<Types.TopBottomGPData[]>([]);
  const [bottomGPsData, setBottomGPsData] = useState<Types.TopBottomGPData[]>([]);
  
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
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Get current financial year
  const getCurrentFinancialYear = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
    
    console.log('Financial Year Calculation:', {
      currentDate: currentDate.toISOString(),
      currentYear,
      currentMonth,
      logic: currentMonth >= 4 ? `${currentMonth} >= 4, so FY should be ${currentYear}` : `${currentMonth} < 4, so FY should be ${currentYear}`
    });
    
    // Financial year starts from April (month 4)
    // April 2025 to March 2026 = FY 2026
    // But your API might expect the CURRENT year format
    if (currentMonth >= 4) {
      // For September 2025, this would return 2026
      const calculatedFY = currentYear ;
      console.log('Calculated FY (April+ logic):', calculatedFY);
      return calculatedFY;
    } else {
      // January to March 2025 = FY 2025
      console.log('Calculated FY (Jan-Mar logic):', currentYear);
      return currentYear;
    }
  };

  // --- API Functions ---
  const fetchBeneficiaries = async (): Promise<Types.BeneficiaryData[]> => {
    try {
      // FIXED: Use actual userId instead of hardcoded 0 for admin
      const response = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/GetBeneficiaryListByUserIdVillageAndStatus', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ userId: userId, VillageId: 0, Status: 0 }) 
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
      // FIXED: Use actual userId instead of hardcoded 0 for admin
      const response = await fetch('https://wmsapi.kdsgroup.co.in/api/Complain/GetComplaintListByUserIdVillageAndStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          UserId: userId, // Changed from: role === 'Admin' ? 0 : userId
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

  // --- Performance API Functions ---
  const fetchTopDistricts = async (): Promise<Types.TopBottomDistrictData[]> => {
    try {
      const financialYear = getCurrentFinancialYear();
      console.log('Fetching top districts for FY:', financialYear);
      
      const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTop10DistrictByFeeCollection?FinancialYear=${financialYear}`, {
        method: 'POST',
        headers: { accept: '*/*' }
      });
      
      if (!response.ok) {
        console.error('Top districts API response not ok:', response.status);
        return [];
      }
      
      const result = await response.json();
      console.log('Top districts API response:', result);
      
      if (result.Status && result.Data) {
        const transformedData = result.Data.map((item: any) => ({
          DistrictId: item.DistrictId,
          DistrictName: item.DistrictName,
          TotalAmountPaid: item.TotalAmount || item.TotalAmountPaid || 0,
          TotalAmount: item.TotalAmount || item.TotalAmountPaid || 0
        }));
        console.log('Transformed top districts data:', transformedData);
        return transformedData;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch top districts:', error);
      return [];
    }
  };

  const fetchBottomDistricts = async (): Promise<Types.TopBottomDistrictData[]> => {
    try {
      const financialYear = getCurrentFinancialYear();
      console.log('Fetching bottom districts for FY:', financialYear, 'UserId:', userId);
      
      const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Dashboard/GetBottom10DistrictByFeeCollection?FinancialYear=${financialYear}&UserId=${userId}`, {
        method: 'POST',
        headers: { accept: '*/*' }
      });
      
      if (!response.ok) {
        console.error('Bottom districts API response not ok:', response.status);
        return [];
      }
      
      const result = await response.json();
      console.log('Bottom districts API response:', result);
      
      if (result.Status && result.Data) {
        const transformedData = result.Data.map((item: any) => ({
          DistrictId: item.DistrictId,
          DistrictName: item.DistrictName,
          TotalAmountPaid: item.TotalAmount || item.TotalAmountPaid || 0,
          TotalAmount: item.TotalAmount || item.TotalAmountPaid || 0
        }));
        console.log('Transformed bottom districts data:', transformedData);
        return transformedData;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch bottom districts:', error);
      return [];
    }
  };

  const fetchTopBlocks = async (): Promise<Types.TopBottomBlockData[]> => {
    try {
      const financialYear = getCurrentFinancialYear();
      console.log('Fetching top blocks for FY:', financialYear, 'UserId:', userId);
      
      const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTop10BlockFeeCollection?userId=${userId}&FinancialYear=${financialYear}`, {
        method: 'POST',
        headers: { accept: '*/*' }
      });
      
      if (!response.ok) {
        console.error('Top blocks API response not ok:', response.status);
        return [];
      }
      
      const result = await response.json();
      console.log('Top blocks API response:', result);
      
      if (result.Status && result.Data && result.Data.Top10) {
        const transformedData = result.Data.Top10.map((item: any) => ({
          BlockId: item.BlockId,
          BlockName: item.BlockName,
          DistrictName: item.DistrictName,
          TotalAmountPaid: item.TotalAmountPaid || item.TotalAmount || 0,
          TotalAmount: item.TotalAmountPaid || item.TotalAmount || 0
        }));
        console.log('Transformed top blocks data:', transformedData);
        return transformedData;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch top blocks:', error);
      return [];
    }
  };

  const fetchBottomBlocks = async (): Promise<Types.TopBottomBlockData[]> => {
    try {
      const financialYear = getCurrentFinancialYear();
      console.log('Fetching bottom blocks for FY:', financialYear, 'UserId:', userId);
      
      const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Dashboard/GetBottom10BlockFeeCollection?userId=${userId}&FinancialYear=${financialYear}`, {
        method: 'POST',
        headers: { accept: '*/*' }
      });
      
      if (!response.ok) {
        console.error('Bottom blocks API response not ok:', response.status);
        return [];
      }
      
      const result = await response.json();
      console.log('Bottom blocks API response:', result);
      
      if (result.Status && result.Data) {
        const transformedData = result.Data.map((item: any) => ({
          BlockId: item.BlockId,
          BlockName: item.BlockName,
          DistrictName: item.DistrictName,
          TotalAmountPaid: item.TotalAmountPaid || item.TotalAmount || 0,
          TotalAmount: item.TotalAmountPaid || item.TotalAmount || 0
        }));
        console.log('Transformed bottom blocks data:', transformedData);
        return transformedData;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch bottom blocks:', error);
      return [];
    }
  };

  const fetchTopGPs = async (): Promise<Types.TopBottomGPData[]> => {
    try {
      const financialYear = getCurrentFinancialYear();
      console.log('Fetching top GPs for FY:', financialYear, 'UserId:', userId);
      
      const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Dashboard/GetTop10GpFeeCollection?userId=${userId}&FinancialYear=${financialYear}`, {
        method: 'POST',
        headers: { accept: '*/*' }
      });
      
      if (!response.ok) {
        console.error('Top GPs API response not ok:', response.status);
        return [];
      }
      
      const result = await response.json();
      console.log('Top GPs API response:', result);
      
      if (result.Status && result.Data) {
        const transformedData = result.Data.map((item: any) => ({
          GPId: item.GpId,
          GpId: item.GpId,
          GPName: item.GpName,
          GpName: item.GpName,
          BlockName: item.BlockName,
          DistrictName: item.DistrictName,
          TotalAmountPaid: item.TotalAmountPaid || item.TotalAmount || 0,
          TotalAmount: item.TotalAmountPaid || item.TotalAmount || 0
        }));
        console.log('Transformed top GPs data:', transformedData);
        return transformedData;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch top GPs:', error);
      return [];
    }
  };

  const fetchBottomGPs = async (): Promise<Types.TopBottomGPData[]> => {
    try {
      const financialYear = getCurrentFinancialYear();
      console.log('Fetching bottom GPs for FY:', financialYear, 'UserId:', userId);
      
      const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Dashboard/GetBottom10GPFeeCollection?userId=${userId}&FinancialYear=${financialYear}`, {
        method: 'POST',
        headers: { accept: '*/*' }
      });
      
      if (!response.ok) {
        console.error('Bottom GPs API response not ok:', response.status);
        return [];
      }
      
      const result = await response.json();
      console.log('Bottom GPs API response:', result);
      
      if (result.Status && result.Data) {
        const transformedData = result.Data.map((item: any) => ({
          GPId: item.GPId,
          GpId: item.GPId,
          GPName: item.GPName,
          GpName: item.GPName,
          BlockName: item.BlockName,
          DistrictName: item.DistrictName,
          TotalAmountPaid: item.TotalAmountPaid || item.TotalAmount || 0,
          TotalAmount: item.TotalAmountPaid || item.TotalAmount || 0
        }));
        console.log('Transformed bottom GPs data:', transformedData);
        return transformedData;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch bottom GPs:', error);
      return [];
    }
  };

  // --- Load Performance Data ---
  const loadPerformanceData = async () => {
    console.log('=== PERFORMANCE DATA LOADING START ===');
    console.log('userId:', userId);
    console.log('role:', role);
    
    if (!userId) {
      console.log('❌ No userId, exiting loadPerformanceData');
      return;
    }
    
    setPerformanceLoading(true);
    
    try {
      console.log('🔄 Starting performance data load for role:', role);
      const promises = [];
      
      // Admin, Director, and DD can see district data
      if (role === 'Admin' || role === 'Director' || role === 'DD') {
        console.log('✅ Role allows district data, adding district promises');
        
        promises.push(
          fetchTopDistricts().then(data => {
            console.log('📊 TOP DISTRICTS RESPONSE:', data);
            setTopDistrictsData(data);
            return data;
          }).catch(err => {
            console.error('❌ TOP DISTRICTS ERROR:', err);
            return [];
          })
        );
        
        promises.push(
          fetchBottomDistricts().then(data => {
            console.log('📊 BOTTOM DISTRICTS RESPONSE:', data);
            setBottomDistrictsData(data);
            return data;
          }).catch(err => {
            console.error('❌ BOTTOM DISTRICTS ERROR:', err);
            return [];
          })
        );
      } else {
        console.log('❌ Role does not allow district data:', role);
      }
      
      // Admin, Director, DPRO, and DD can see block data
      if (role === 'Admin' || role === 'Director' || role === 'DPRO' || role === 'DD') {
        console.log('✅ Role allows block data, adding block promises');
        
        promises.push(
          fetchTopBlocks().then(data => {
            console.log('📊 TOP BLOCKS RESPONSE:', data);
            setTopBlocksData(data);
            return data;
          }).catch(err => {
            console.error('❌ TOP BLOCKS ERROR:', err);
            return [];
          })
        );
        
        promises.push(
          fetchBottomBlocks().then(data => {
            console.log('📊 BOTTOM BLOCKS RESPONSE:', data);
            setBottomBlocksData(data);
            return data;
          }).catch(err => {
            console.error('❌ BOTTOM BLOCKS ERROR:', err);
            return [];
          })
        );
      } else {
        console.log('❌ Role does not allow block data:', role);
      }
      
      // Admin, Director, ADO, and DD can see GP data
      if (role === 'Admin' || role === 'Director' || role === 'ADO' || role === 'DD') {
        console.log('✅ Role allows GP data, adding GP promises');
        
        promises.push(
          fetchTopGPs().then(data => {
            console.log('📊 TOP GPS RESPONSE:', data);
            setTopGPsData(data);
            return data;
          }).catch(err => {
            console.error('❌ TOP GPS ERROR:', err);
            return [];
          })
        );
        
        promises.push(
          fetchBottomGPs().then(data => {
            console.log('📊 BOTTOM GPS RESPONSE:', data);
            setBottomGPsData(data);
            return data;
          }).catch(err => {
            console.error('❌ BOTTOM GPS ERROR:', err);
            return [];
          })
        );
      } else {
        console.log('❌ Role does not allow GP data:', role);
      }
      
      console.log('🚀 Total promises to execute:', promises.length);
      
      if (promises.length === 0) {
        console.log('⚠️ No promises to execute - check role permissions');
        return;
      }
      
      const results = await Promise.all(promises);
      console.log('✅ All promises completed:', results);
      
    } catch (error) {
      console.error('💥 Failed to load performance data:', error);
    } finally {
      setPerformanceLoading(false);
      console.log('=== PERFORMANCE DATA LOADING END ===');
    }
  };

  // --- Existing Filtering Functions ---
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

  // Load performance data when user role changes
  useEffect(() => {
  if (userId && role) {
    loadPerformanceData();
  }
}, [userId, role]);

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
    
    // Performance data
    topDistrictsData,
    bottomDistrictsData,
    topBlocksData,
    bottomBlocksData,
    topGPsData,
    bottomGPsData,
    
    // Derived data
    beneficiaryTrend,
    feeCollectionTrend,
    
    // States
    loading,
    performanceLoading,
    error,
    setError,
    
    // Functions
    loadAllData,
    loadPerformanceData,
    
    // Filtering functions
    filterByLocation,
    filterOHTsByLocation,
    filterPumpHousesByOHT,
    filterWaterFeeSummaryByLocation,
    filterComplaintsByLocation,
    filterWaterQualityByLocation
  };
};