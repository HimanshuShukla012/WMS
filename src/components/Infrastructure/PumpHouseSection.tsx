// components/Infrastructure/PumpHouseSection.tsx - Pump house infrastructure section

import React from 'react';
import { Zap, Download } from 'lucide-react';
import * as Types from '../../types';

interface PumpHouseSectionProps {
  pumpHouseData: Types.PumpHouseData[];
  selectedLocationName: string;
  onExportCSV: (data: any[], filename: string) => void;
}

export const PumpHouseSection: React.FC<PumpHouseSectionProps> = ({
  pumpHouseData,
  selectedLocationName,
  onExportCSV
}) => {
  // Calculate summary statistics
  const totalPumps = pumpHouseData.length;
  const activePumps = pumpHouseData.filter(p => p.Status === 1).length;
  const solarPumps = pumpHouseData.filter(p => p.PowerSource === '2').length;
  const inactivePumps = totalPumps - activePumps;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Zap className="w-6 h-6 text-orange-600" />
          Pump House Infrastructure
        </h3>
        <button 
          onClick={() => onExportCSV(pumpHouseData, 'pump_house_data')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          disabled={pumpHouseData.length === 0}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-100 rounded-lg p-4">
          <div className="text-2xl font-bold text-grey-900">
            {totalPumps}
          </div>
          <div className="text-sm text-grey-900">Total Pumps</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {activePumps}
          </div>
          <div className="text-sm text-green-800">Active Pumps</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {solarPumps}
          </div>
          <div className="text-sm text-blue-800">Solar Pumps</div>
        </div>
        <div className="bg-red-100 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-800">
            {inactivePumps}
          </div>
          <div className="text-sm text-red-800">Inactive Pumps</div>
        </div>
      </div>

      {/* Pump House Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Pump ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">OHT ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Operator</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Capacity (HP)</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Power Source</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Solar Output</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pumpHouseData.slice(0, 30).map((pump, index) => (
              <tr key={pump.PumpId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">#{pump.PumpId}</td>
                <td className="px-4 py-3 text-sm text-gray-600">#{pump.OhtId}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{pump.OperatorName || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{pump.Contact || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{pump.HorsePower || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pump.PowerSource === '2' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {pump.PowerSource === '2' ? 'Solar' : 'Electric'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{pump.SolarOutput || 'N/A'}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    pump.Status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {pump.Status === 1 ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Info */}
      {pumpHouseData.length > 30 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing first 30 records out of {pumpHouseData.length} total pump houses.
          <button 
            onClick={() => onExportCSV(pumpHouseData, 'all_pump_house_data')}
            className="ml-2 text-blue-600 hover:text-blue-800 underline"
          >
            Export all records
          </button>
        </div>
      )}
    </div>
  );
};