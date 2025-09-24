// components/Overview/KPICards.tsx - Interactive KPI cards for the overview section

import React from 'react';
import { Users, Droplets, Zap } from 'lucide-react';
import * as Types from '../../types';

interface KPICardsProps {
  stats: Types.LocationStats;
  onTabChange: (tab: string) => void;
}

export const KPICards: React.FC<KPICardsProps> = ({ stats, onTabChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Beneficiaries Card */}
      <button 
        onClick={() => onTabChange('beneficiaries')}
        className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-200 cursor-pointer text-left group"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-blue-600">
              {stats.totalBeneficiaries.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-gray-600">Total Beneficiaries</div>
            <div className="text-xs text-green-600 mt-1">
              {stats.totalBeneficiaries > 0 
                ? Math.round((stats.activeBeneficiaries / stats.totalBeneficiaries) * 100) 
                : 0}% active
            </div>
            <div className="text-xs text-blue-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Click to view details →
            </div>
          </div>
          <Users className="w-12 h-12 text-blue-500 opacity-20" />
        </div>
      </button>

      {/* Family Members Card */}
      <button 
        onClick={() => onTabChange('beneficiaries')}
        className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-200 cursor-pointer text-left group"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-green-600">
              {stats.totalFamilyMembers.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-gray-600">Family Members</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.totalBeneficiaries > 0 
                ? (stats.totalFamilyMembers / stats.totalBeneficiaries).toFixed(1) 
                : 0} avg per family
            </div>
            <div className="text-xs text-green-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Click to view details →
            </div>
          </div>
          <Users className="w-12 h-12 text-green-500 opacity-20" />
        </div>
      </button>

      {/* Over Head Tanks Card */}
      <button 
        onClick={() => onTabChange('infrastructure')}
        className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500 hover:shadow-xl transition-shadow duration-200 cursor-pointer text-left group"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-indigo-600">
              {stats.totalOHTs.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-gray-600">Over Head Tanks</div>
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

      {/* Pumping Stations Card */}
      <button 
        onClick={() => onTabChange('infrastructure')}
        className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow duration-200 cursor-pointer text-left group"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-orange-600">
              {stats.totalPumps.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-gray-600">Pumping Stations</div>
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
  );
};