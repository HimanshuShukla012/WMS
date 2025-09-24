// components/Filters/LocationFilters.tsx - Comprehensive filters panel for director controls

import React from 'react';
import { Settings, MapPin, DollarSign, Eye, RefreshCw } from 'lucide-react';
import * as Types from '../../types';

interface LocationFiltersProps {
  // Location data
  districts: Types.District[];
  blocks: Types.Block[];
  gramPanchayats: Types.GramPanchayat[];
  villages: Types.Village[];
  
  // Selected values
  selectedDistrictId: number | null;
  setSelectedDistrictId: (id: number | null) => void;
  selectedBlockId: number | null;
  setSelectedBlockId: (id: number | null) => void;
  selectedGramPanchayatId: number | null;
  setSelectedGramPanchayatId: (id: number | null) => void;
  selectedVillageId: number | null;
  setSelectedVillageId: (id: number | null) => void;
  
  // Date range
  fromDate: string;
  setFromDate: (date: string) => void;
  toDate: string;
  setToDate: (date: string) => void;
  
  // States
  locationLoading: boolean;
  loading: boolean;
  selectedLocationName: string;
  
  // Actions
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export const LocationFilters: React.FC<LocationFiltersProps> = ({
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
  
  // Date range
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  
  // States
  locationLoading,
  loading,
  selectedLocationName,
  
  // Actions
  onApplyFilters,
  onResetFilters
}) => {
  return (
    <div className="xl:col-span-1 bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Director Controls</h3>
      </div>

      <div className="space-y-4">
        {/* Location Filters Section */}
        <div className="border-b pb-4">
          <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Administrative Level
          </h4>
          
          <div className="space-y-3">
            {/* District Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">District</label>
              <select 
                value={selectedDistrictId || ''} 
                onChange={(e) => setSelectedDistrictId(Number(e.target.value) || null)} 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={locationLoading}
              >
                <option value="">All Districts</option>
                {districts.map(district => (
                  <option key={district.DistrictId} value={district.DistrictId}>
                    {district.DistrictName}
                  </option>
                ))}
              </select>
            </div>

            {/* Block Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Block</label>
              <select 
                value={selectedBlockId || ''} 
                onChange={(e) => setSelectedBlockId(Number(e.target.value) || null)} 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!selectedDistrictId || locationLoading}
              >
                <option value="">All Blocks</option>
                {blocks.map(block => (
                  <option key={block.BlockId} value={block.BlockId}>
                    {block.BlockName}
                  </option>
                ))}
              </select>
            </div>

            {/* Gram Panchayat Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Gram Panchayat</label>
              <select 
                value={selectedGramPanchayatId || ''} 
                onChange={(e) => setSelectedGramPanchayatId(Number(e.target.value) || null)} 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!selectedBlockId || locationLoading}
              >
                <option value="">All GPs</option>
                {gramPanchayats.map(gp => (
                  <option key={gp.Id} value={gp.Id}>
                    {gp.GramPanchayatName}
                  </option>
                ))}
              </select>
            </div>

            {/* Village Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Village</label>
              <select 
                value={selectedVillageId || ''} 
                onChange={(e) => setSelectedVillageId(Number(e.target.value) || null)} 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!selectedGramPanchayatId || locationLoading}
              >
                <option value="">All Villages</option>
                {villages.map(village => (
                  <option key={village.Id} value={village.Id}>
                    {village.VillageName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Date Range Filters Section */}
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

        {/* Action Buttons Section */}
        <div className="space-y-2">
          <button 
            onClick={onApplyFilters}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {loading ? 'Loading...' : 'Apply Filters'}
          </button>
          
          <button 
            onClick={onResetFilters}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Reset Filters
          </button>
        </div>

        {/* Current Selection Info */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-xs text-blue-600 font-medium mb-1">Currently Monitoring:</div>
          <div className="text-sm text-blue-800 font-semibold break-words">
            {selectedLocationName}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Period: {new Date(fromDate).toLocaleDateString()} to {new Date(toDate).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};