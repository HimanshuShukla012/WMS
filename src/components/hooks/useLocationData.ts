// hooks/useLocationData.ts - Custom hook for location hierarchy management

import { useState, useEffect } from 'react';
import { useUserInfo } from '../../utils/userInfo';
import * as Types from '../types';

export const useLocationData = () => {
  const { isLoading: userLoading } = useUserInfo();

  // Location data arrays
  const [districts, setDistricts] = useState<Types.District[]>([]);
  const [blocks, setBlocks] = useState<Types.Block[]>([]);
  const [gramPanchayats, setGramPanchayats] = useState<Types.GramPanchayat[]>([]);
  const [villages, setVillages] = useState<Types.Village[]>([]);

  // Selected location IDs
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [selectedGramPanchayatId, setSelectedGramPanchayatId] = useState<number | null>(null);
  const [selectedVillageId, setSelectedVillageId] = useState<number | null>(null);

  // Loading state
  const [locationLoading, setLocationLoading] = useState(false);

  // --- API Functions ---
  const fetchDistricts = async (): Promise<Types.District[]> => {
    try {
      const response = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/AllDistrict', { 
        method: 'POST', 
        headers: { accept: '*/*' } 
      });
      if (!response.ok) return [];
      const result = await response.json();
      return result.Status ? result.Data : [];
    } catch (error) { 
      console.error('Failed to fetch districts:', error); 
      return [];
    }
  };

  const fetchBlocks = async (districtId: number): Promise<Types.Block[]> => {
    try {
      const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetAllBlocks?DistrictId=${districtId}`, { 
        method: 'POST', 
        headers: { accept: '*/*' } 
      });
      if (!response.ok) return [];
      const result = await response.json();
      return result.Status ? result.Data : [];
    } catch (error) { 
      console.error('Failed to fetch blocks:', error); 
      return [];
    }
  };

  const fetchGramPanchayats = async (blockId: number): Promise<Types.GramPanchayat[]> => {
    try {
      const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetAllGramPanchayat?BlockId=${blockId}`, { 
        method: 'POST', 
        headers: { accept: '*/*' } 
      });
      if (!response.ok) return [];
      const result = await response.json();
      return result.Status ? result.Data : [];
    } catch (error) { 
      console.error('Failed to fetch gram panchayats:', error); 
      return [];
    }
  };

  const fetchVillages = async (blockId: number, gramPanchayatId: number): Promise<Types.Village[]> => {
    try {
      const response = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/GetVillegeByGramPanchayat', {
        method: 'POST', 
        headers: { accept: '*/*', 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ BlockId: blockId, GramPanchayatId: gramPanchayatId })
      });
      if (!response.ok) return [];
      const result = await response.json();
      return result.Status ? result.Data : [];
    } catch (error) { 
      console.error('Failed to fetch villages:', error); 
      return [];
    }
  };

  // --- Load initial districts ---
  useEffect(() => {
    if (userLoading) return;
    
    const loadDistricts = async () => {
      setLocationLoading(true);
      try {
        const districtData = await fetchDistricts();
        setDistricts(districtData);
        
        // Auto-select if only one district
        if (districtData.length === 1) {
          setSelectedDistrictId(districtData[0].DistrictId);
        }
      } catch (error) { 
        console.error('Error loading districts:', error);
      } finally { 
        setLocationLoading(false);
      }
    };
    
    loadDistricts();
  }, [userLoading]);

  // --- Load blocks when district changes ---
  useEffect(() => {
    if (!selectedDistrictId) { 
      setBlocks([]); 
      setSelectedBlockId(null); 
      setGramPanchayats([]); 
      setVillages([]);
      setSelectedGramPanchayatId(null);
      setSelectedVillageId(null);
      return;
    }

    const loadBlocks = async () => {
      setLocationLoading(true);
      try {
        const blockData = await fetchBlocks(selectedDistrictId);
        setBlocks(blockData);
        setSelectedBlockId(null); 
        setGramPanchayats([]); 
        setVillages([]);
        setSelectedGramPanchayatId(null);
        setSelectedVillageId(null);
      } catch (error) {
        console.error('Error loading blocks:', error);
      } finally {
        setLocationLoading(false);
      }
    };

    loadBlocks();
  }, [selectedDistrictId]);

  // --- Load gram panchayats when block changes ---
  useEffect(() => {
    if (!selectedBlockId) { 
      setGramPanchayats([]); 
      setSelectedGramPanchayatId(null); 
      setVillages([]);
      setSelectedVillageId(null);
      return;
    }

    const loadGramPanchayats = async () => {
      setLocationLoading(true);
      try {
        const gpData = await fetchGramPanchayats(selectedBlockId);
        setGramPanchayats(gpData);
        setSelectedGramPanchayatId(null); 
        setVillages([]);
        setSelectedVillageId(null);
      } catch (error) {
        console.error('Error loading gram panchayats:', error);
      } finally {
        setLocationLoading(false);
      }
    };

    loadGramPanchayats();
  }, [selectedBlockId]);

  // --- Load villages when gram panchayat changes ---
  useEffect(() => {
    if (!selectedBlockId || !selectedGramPanchayatId) { 
      setVillages([]); 
      setSelectedVillageId(null); 
      return;
    }

    const loadVillages = async () => {
      setLocationLoading(true);
      try {
        const villageData = await fetchVillages(selectedBlockId, selectedGramPanchayatId);
        setVillages(villageData);
        setSelectedVillageId(null);
      } catch (error) {
        console.error('Error loading villages:', error);
      } finally {
        setLocationLoading(false);
      }
    };

    loadVillages();
  }, [selectedBlockId, selectedGramPanchayatId]);

  // --- Helper Functions ---
  const getSelectedLocationName = (): string => {
    const parts: string[] = [];
    
    if (selectedDistrictId) { 
      const district = districts.find(d => d.DistrictId === selectedDistrictId); 
      if (district) parts.push(district.DistrictName);
    }
    
    if (selectedBlockId) { 
      const block = blocks.find(b => b.BlockId === selectedBlockId); 
      if (block) parts.push(block.BlockName);
    }
    
    if (selectedGramPanchayatId) { 
      const gp = gramPanchayats.find(g => g.Id === selectedGramPanchayatId); 
      if (gp) parts.push(gp.GramPanchayatName);
    }
    
    if (selectedVillageId) { 
      const village = villages.find(v => v.Id === selectedVillageId); 
      if (village) parts.push(village.VillageName);
    }
    
    return parts.length ? parts.join(' > ') : 'All Areas';
  };

  const resetFilters = () => {
    setSelectedDistrictId(null);
    setSelectedBlockId(null);
    setSelectedGramPanchayatId(null);
    setSelectedVillageId(null);
  };

  // --- Return all data and functions ---
  return {
    // Location data
    districts,
    blocks,
    gramPanchayats,
    villages,
    
    // Selected values
    selectedDistrictId,
    setSelectedDistrictId,
    selectedBlockId,
    setSelectedBlockId,
    selectedGramPanchayatId,
    setSelectedGramPanchayatId,
    selectedVillageId,
    setSelectedVillageId,
    
    // Loading state
    locationLoading,
    
    // Helper functions
    getSelectedLocationName,
    resetFilters
  };
};