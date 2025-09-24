// components/Infrastructure/InfrastructureTab.tsx - Infrastructure data management tab

import React from 'react';
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
}

export const InfrastructureTab: React.FC<InfrastructureTabProps> = ({
  ohtData,
  pumpHouseData,
  selectedLocationName,
  onExportCSV,
  filterOHTsByLocation,
  filterPumpHousesByOHT
}) => {
  const filteredOHTs = filterOHTsByLocation(ohtData);
  const filteredPumpHouses = filterPumpHousesByOHT(pumpHouseData, filteredOHTs);

  return (
    <div className="space-y-6">
      {/* Over Head Tanks Section */}
      <OHTSection 
        ohtData={filteredOHTs}
        selectedLocationName={selectedLocationName}
        onExportCSV={onExportCSV}
      />
      
      {/* Pump Houses Section */}
      <PumpHouseSection 
        pumpHouseData={filteredPumpHouses}
        selectedLocationName={selectedLocationName}
        onExportCSV={onExportCSV}
      />
    </div>
  );
};