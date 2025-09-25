// components/Infrastructure/InfrastructureTab.tsx - Infrastructure data management tab

import React, { useState, useEffect } from 'react';
import { OHTSection } from './OHTSection';
import { PumpHouseSection } from './PumpHouseSection';
import * as Types from '../types';

interface InfrastructureTabProps {
  ohtData: Types.OHTData[];
  pumpHouseData: Types.PumpHouseData[];
  selectedLocationName: string;
  onExportCSV: (data: any[], filename: string) => void;
  // Filtering functions should be passed from parent
  filterOHTsByLocation: (data: Types.OHTData[]) => Types.OHTData[];
  filterPumpHousesByOHT: (pumpHouses: Types.PumpHouseData[], filteredOHTs: Types.OHTData[]) => Types.PumpHouseData[];
  initialSection?: string; // 'oht' | 'pumphouse'
}

export const InfrastructureTab: React.FC<InfrastructureTabProps> = ({
  ohtData,
  pumpHouseData,
  selectedLocationName,
  onExportCSV,
  filterOHTsByLocation,
  filterPumpHousesByOHT,
  initialSection
}) => {
  const [activeSection, setActiveSection] = useState<string>(initialSection || 'oht');

  // Update active section when initialSection prop changes
  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  const filteredOHTs = filterOHTsByLocation(ohtData);
  const filteredPumpHouses = filterPumpHousesByOHT(pumpHouseData, filteredOHTs);

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveSection('oht')}
            className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeSection === 'oht'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Over Head Tanks ({filteredOHTs.length})
          </button>
          <button
            onClick={() => setActiveSection('pumphouse')}
            className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeSection === 'pumphouse'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pump Houses ({filteredPumpHouses.length})
          </button>
        </div>
      </div>

      {/* Content Sections */}
      {activeSection === 'oht' && (
        <OHTSection 
          ohtData={filteredOHTs}
          selectedLocationName={selectedLocationName}
          onExportCSV={onExportCSV}
        />
      )}

      {activeSection === 'pumphouse' && (
        <PumpHouseSection 
          pumpHouseData={filteredPumpHouses}
          selectedLocationName={selectedLocationName}
          onExportCSV={onExportCSV}
        />
      )}
    </div>
  );
};