// components/Overview/OverviewTab.tsx - Corrected version

import React, { useState } from 'react';
import { KPICards } from './KPICards';
import { WaterFeeDetailCard } from './WaterFeeDetailCard';
import { PerformanceCardsContainer } from './PerformanceContainer';
import { PerformanceToggle } from './PerformanceToggle';
import { ChartsSection } from './ChartsSection';
import * as Types from '../types';

interface OverviewTabProps {
  stats: Types.LocationStats;
  beneficiaryTrend: Types.BeneficiaryTrendData[];
  feeCollectionTrend: Types.FeeCollectionTrendData[];
  waterFeeSummaryData: Types.WaterFeeSummaryData[];
  // Performance data props
  topDistrictsData: Types.TopBottomDistrictData[];
  bottomDistrictsData: Types.TopBottomDistrictData[];
  topBlocksData: Types.TopBottomBlockData[];
  bottomBlocksData: Types.TopBottomBlockData[];
  topGPsData: Types.TopBottomGPData[];
  bottomGPsData: Types.TopBottomGPData[];
  performanceLoading: boolean;
  userRole: string;
  onTabChange: (tab: string) => void;
  onExportCSV: (data: any[], filename: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  beneficiaryTrend,
  feeCollectionTrend,
  waterFeeSummaryData,
  topDistrictsData,
  bottomDistrictsData,
  topBlocksData,
  bottomBlocksData,
  topGPsData,
  bottomGPsData,
  performanceLoading,
  userRole,
  onTabChange,
  onExportCSV
}) => {
  // State for performance cards toggle
  const [showPerformanceCards, setShowPerformanceCards] = useState(true);

  // Debug logging - remove in production
  console.log('Performance Data Debug:', {
    topDistrictsData: topDistrictsData?.length || 0,
    bottomDistrictsData: bottomDistrictsData?.length || 0,
    topBlocksData: topBlocksData?.length || 0,
    bottomBlocksData: bottomBlocksData?.length || 0,
    topGPsData: topGPsData?.length || 0,
    bottomGPsData: bottomGPsData?.length || 0,
    userRole,
    performanceLoading
  });

  // Additional debug logging for actual data
  console.log('Raw Performance Data:', {
    topDistrictsData,
    bottomDistrictsData,
    topBlocksData,
    bottomBlocksData,
    topGPsData,
    bottomGPsData
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards Section */}
      <KPICards stats={stats} onTabChange={onTabChange} />
      
      {/* Water Fee Detail Card - Only show if data exists */}
      {waterFeeSummaryData.length > 0 && (
        <WaterFeeDetailCard stats={stats} />
      )}
      
      {/* Performance Cards Toggle */}
      <PerformanceToggle
        isEnabled={showPerformanceCards}
        onToggle={setShowPerformanceCards}
        userRole={userRole}
        loading={performanceLoading}
      />
      
      {/* Performance Cards Section - Only show if enabled */}
      {showPerformanceCards && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Performance Overview
          </h2>
          
          {/* Performance Loading State */}
          {performanceLoading ? (
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
          ) : (
            /* Use the container PerformanceCardsContainer component */
            <PerformanceCardsContainer
              topDistricts={topDistrictsData || []}
              bottomDistricts={bottomDistrictsData || []}
              topBlocks={topBlocksData || []}
              bottomBlocks={bottomBlocksData || []}
              topGPs={topGPsData || []}
              bottomGPs={bottomGPsData || []}
              userRole={userRole}
              loading={false}
              onExportCSV={onExportCSV}
            />
          )}
        </div>
      )}
      
      {/* Charts Section */}
      <ChartsSection 
        beneficiaryTrend={beneficiaryTrend}
        feeCollectionTrend={feeCollectionTrend}
        onExportCSV={onExportCSV}
      />
    </div>
  );
};