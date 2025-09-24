// components/Header/DirectorHeader.tsx - Enhanced page header component

import React from 'react';
import { MapPin, Activity, RefreshCw, Download } from 'lucide-react';

interface DirectorHeaderProps {
  selectedLocationName: string;
  onRefresh: () => void;
  onExport: () => void;
  loading: boolean;
}

export const DirectorHeader: React.FC<DirectorHeaderProps> = ({
  selectedLocationName,
  onRefresh,
  onExport,
  loading
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 rounded-2xl p-6 shadow-2xl text-white mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Monitoring Dashboard for Directorate</h1>
          <div className="flex items-center gap-4 text-blue-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Monitoring: {selectedLocationName}</span>
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
            <div className="font-semibold">
              {new Date().toLocaleString('en-GB', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric',
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </div>
          </div>
          
          <button 
            onClick={onRefresh} 
            disabled={loading}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button 
            onClick={onExport} 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
    </div>
  );
};