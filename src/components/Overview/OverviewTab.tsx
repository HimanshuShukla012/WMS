// components/Overview/OverviewTab.tsx - Complete overview tab component

import React from 'react';
import { KPICards } from './KPICards';
import { WaterFeeDetailCard } from './WaterFeeDetailCard';
import { ChartsSection } from './ChartsSection';
import * as Types from '../../types';

interface OverviewTabProps {
  stats: Types.LocationStats;
  beneficiaryTrend: Types.BeneficiaryTrendData[];
  feeCollectionTrend: Types.FeeCollectionTrendData[];
  waterFeeSummaryData: Types.WaterFeeSummaryData[];
  onTabChange: (tab: string) => void;
  onExportCSV: (data: any[], filename: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  beneficiaryTrend,
  feeCollectionTrend,
  waterFeeSummaryData,
  onTabChange,
  onExportCSV
}) => {
  return (
    <div className="space-y-6">
      {/* KPI Cards Section */}
      <KPICards stats={stats} onTabChange={onTabChange} />
      
      {/* Water Fee Detail Card - Only show if data exists */}
      {waterFeeSummaryData.length > 0 && (
        <WaterFeeDetailCard stats={stats} />
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