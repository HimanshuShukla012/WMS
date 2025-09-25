// components/Overview/PerformanceCardsContainer.tsx - Fixed version with DD role support

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin,
} from 'lucide-react';
import { PerformanceCard } from './PerformanceCards'; // The single card component
import * as Types from '../types';

interface PerformanceCardsContainerProps {
  topDistricts: Types.TopBottomDistrictData[];
  bottomDistricts: Types.TopBottomDistrictData[];
  topBlocks: Types.TopBottomBlockData[];
  bottomBlocks: Types.TopBottomBlockData[];
  topGPs: Types.TopBottomGPData[];
  bottomGPs: Types.TopBottomGPData[];
  userRole: string;
  loading: boolean;
  onExportCSV: (data: any[], filename: string) => void;
}

export const PerformanceCardsContainer: React.FC<PerformanceCardsContainerProps> = ({
  topDistricts,
  bottomDistricts,
  topBlocks,
  bottomBlocks,
  topGPs,
  bottomGPs,
  userRole,
  loading,
  onExportCSV
}) => {
  // Debug logging
  console.log('Performance Cards Container Debug:', {
    topDistricts: topDistricts?.length || 0,
    bottomDistricts: bottomDistricts?.length || 0,
    topBlocks: topBlocks?.length || 0,
    bottomBlocks: bottomBlocks?.length || 0,
    topGPs: topGPs?.length || 0,
    bottomGPs: bottomGPs?.length || 0,
    userRole
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [];

  // DD Role: Show districts, blocks, and GPs (all performance data)
if (userRole === 'DD') {
  // Top 10 Districts
  if (topDistricts && topDistricts.length > 0) {
    cards.push(
      <PerformanceCard
        key="top-districts"
        title="Top 10 Performing Districts"
        data={topDistricts}
        icon={<TrendingUp className="w-5 h-5 text-green-600" />}
        type="district"
        isTop={true}
        onExport={onExportCSV}
      />
    );
  }

  // Bottom 10 Districts
  if (bottomDistricts && bottomDistricts.length > 0) {
    cards.push(
      <PerformanceCard
        key="bottom-districts"
        title="Bottom 10 Performing Districts"
        data={bottomDistricts}
        icon={<TrendingDown className="w-5 h-5 text-red-600" />}
        type="district"
        isTop={false}
        onExport={onExportCSV}
      />
    );
  }

  // Top 10 Blocks
  if (topBlocks && topBlocks.length > 0) {
    cards.push(
      <PerformanceCard
        key="top-blocks"
        title="Top 10 Performing Blocks"
        data={topBlocks}
        icon={<TrendingUp className="w-5 h-5 text-green-600" />}
        type="block"
        isTop={true}
        onExport={onExportCSV}
      />
    );
  }

  // Bottom 10 Blocks
  if (bottomBlocks && bottomBlocks.length > 0) {
    cards.push(
      <PerformanceCard
        key="bottom-blocks"
        title="Bottom 10 Performing Blocks"
        data={bottomBlocks}
        icon={<TrendingDown className="w-5 h-5 text-red-600" />}
        type="block"
        isTop={false}
        onExport={onExportCSV}
      />
    );
  }

  // Top 10 GPs
  if (topGPs && topGPs.length > 0) {
    cards.push(
      <PerformanceCard
        key="top-gps"
        title="Top 10 Performing Gram Panchayats"
        data={topGPs}
        icon={<TrendingUp className="w-5 h-5 text-green-600" />}
        type="gp"
        isTop={true}
        onExport={onExportCSV}
      />
    );
  }

  // Bottom 10 GPs
  if (bottomGPs && bottomGPs.length > 0) {
    cards.push(
      <PerformanceCard
        key="bottom-gps"
        title="Bottom 10 Performing Gram Panchayats"
        data={bottomGPs}
        icon={<TrendingDown className="w-5 h-5 text-red-600" />}
        type="gp"
        isTop={false}
        onExport={onExportCSV}
      />
    );
  }
}

// DPRO Role: Show blocks and GPs only
else if (userRole === 'DPRO') {
  // Top 10 Blocks
  if (topBlocks && topBlocks.length > 0) {
    cards.push(
      <PerformanceCard
        key="top-blocks"
        title="Top 10 Performing Blocks"
        data={topBlocks}
        icon={<TrendingUp className="w-5 h-5 text-green-600" />}
        type="block"
        isTop={true}
        onExport={onExportCSV}
      />
    );
  }

  // Bottom 10 Blocks
  if (bottomBlocks && bottomBlocks.length > 0) {
    cards.push(
      <PerformanceCard
        key="bottom-blocks"
        title="Bottom 10 Performing Blocks"
        data={bottomBlocks}
        icon={<TrendingDown className="w-5 h-5 text-red-600" />}
        type="block"
        isTop={false}
        onExport={onExportCSV}
      />
    );
  }

  // Top 10 GPs
  if (topGPs && topGPs.length > 0) {
    cards.push(
      <PerformanceCard
        key="top-gps"
        title="Top 10 Performing Gram Panchayats"
        data={topGPs}
        icon={<TrendingUp className="w-5 h-5 text-green-600" />}
        type="gp"
        isTop={true}
        onExport={onExportCSV}
      />
    );
  }

  // Bottom 10 GPs
  if (bottomGPs && bottomGPs.length > 0) {
    cards.push(
      <PerformanceCard
        key="bottom-gps"
        title="Bottom 10 Performing Gram Panchayats"
        data={bottomGPs}
        icon={<TrendingDown className="w-5 h-5 text-red-600" />}
        type="gp"
        isTop={false}
        onExport={onExportCSV}
      />
    );
  }
}

// ADO Role: Show GPs only
else if (userRole === 'ADO') {
  // Top 10 GPs
  if (topGPs && topGPs.length > 0) {
    cards.push(
      <PerformanceCard
        key="top-gps"
        title="Top 10 Performing Gram Panchayats"
        data={topGPs}
        icon={<TrendingUp className="w-5 h-5 text-green-600" />}
        type="gp"
        isTop={true}
        onExport={onExportCSV}
      />
    );
  }

  // Bottom 10 GPs
  if (bottomGPs && bottomGPs.length > 0) {
    cards.push(
      <PerformanceCard
        key="bottom-gps"
        title="Bottom 10 Performing Gram Panchayats"
        data={bottomGPs}
        icon={<TrendingDown className="w-5 h-5 text-red-600" />}
        type="gp"
        isTop={false}
        onExport={onExportCSV}
      />
    );
  }
}

// Admin/Director: Show all data (backward compatibility)
else if (['Admin', 'Director'].includes(userRole)) {
  // Districts
  if (topDistricts && topDistricts.length > 0) {
    cards.push(
      <PerformanceCard
        key="top-districts"
        title="Top 10 Performing Districts"
        data={topDistricts}
        icon={<TrendingUp className="w-5 h-5 text-green-600" />}
        type="district"
        isTop={true}
        onExport={onExportCSV}
      />
    );
  }

  if (bottomDistricts && bottomDistricts.length > 0) {
    cards.push(
      <PerformanceCard
        key="bottom-districts"
        title="Bottom 10 Performing Districts"
        data={bottomDistricts}
        icon={<TrendingDown className="w-5 h-5 text-red-600" />}
        type="district"
        isTop={false}
        onExport={onExportCSV}
      />
    );
  }

  // Blocks
  if (topBlocks && topBlocks.length > 0) {
    cards.push(
      <PerformanceCard
        key="top-blocks"
        title="Top 10 Performing Blocks"
        data={topBlocks}
        icon={<TrendingUp className="w-5 h-5 text-green-600" />}
        type="block"
        isTop={true}
        onExport={onExportCSV}
      />
    );
  }

  if (bottomBlocks && bottomBlocks.length > 0) {
    cards.push(
      <PerformanceCard
        key="bottom-blocks"
        title="Bottom 10 Performing Blocks"
        data={bottomBlocks}
        icon={<TrendingDown className="w-5 h-5 text-red-600" />}
        type="block"
        isTop={false}
        onExport={onExportCSV}
      />
    );
  }

  // GPs
  if (topGPs && topGPs.length > 0) {
    cards.push(
      <PerformanceCard
        key="top-gps"
        title="Top 10 Performing Gram Panchayats"
        data={topGPs}
        icon={<TrendingUp className="w-5 h-5 text-green-600" />}
        type="gp"
        isTop={true}
        onExport={onExportCSV}
      />
    );
  }

  if (bottomGPs && bottomGPs.length > 0) {
    cards.push(
      <PerformanceCard
        key="bottom-gps"
        title="Bottom 10 Performing Gram Panchayats"
        data={bottomGPs}
        icon={<TrendingDown className="w-5 h-5 text-red-600" />}
        type="gp"
        isTop={false}
        onExport={onExportCSV}
      />
    );
  }
}

  if (cards.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-gray-500 mb-4">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <h3 className="font-medium text-lg mb-2">No Performance Data Available</h3>
          <p className="text-sm">
  {userRole === 'DD'
    ? 'District, Block, and GP performance data will appear here once fee collection data is available.'
    : userRole === 'DPRO'
    ? 'Block and GP performance data will appear here once fee collection data is available.'
    : userRole === 'ADO'
    ? 'GP performance data will appear here once fee collection data is available.'
    : ['Admin', 'Director'].includes(userRole)
    ? 'Performance data will appear here once fee collection data is available.'
    : `Performance data for ${userRole} role will appear here once available.`
  }
</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {cards}
    </div>
  );
};