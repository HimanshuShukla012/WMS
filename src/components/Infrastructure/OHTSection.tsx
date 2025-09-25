// components/Infrastructure/OHTSection.tsx - Over Head Tanks infrastructure section

import React from 'react';
import { Droplets, Download } from 'lucide-react';
import * as Types from '../types';

interface OHTSectionProps {
  ohtData: Types.OHTData[];
  selectedLocationName: string;
  onExportCSV: (data: any[], filename: string) => void;
}

export const OHTSection: React.FC<OHTSectionProps> = ({
  ohtData,
  selectedLocationName,
  onExportCSV
}) => {
  // Calculate summary statistics
  const totalCapacity = ohtData.reduce((sum, oht) => sum + (oht.OHTCapacity || 0), 0);
  const totalPumps = ohtData.reduce((sum, oht) => sum + (oht.NoOfPumps || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Droplets className="w-6 h-6 text-indigo-600" />
          Over Head Tank (OHT) Infrastructure
        </h3>
        <button 
          onClick={() => onExportCSV(ohtData, 'oht_data')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          disabled={ohtData.length === 0}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-100 rounded-lg p-4">
          <div className="text-2xl font-bold text-grey-900">{ohtData.length}</div>
          <div className="text-sm text-grey-900">Total Over Head Tanks</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {totalCapacity.toLocaleString()}
          </div>
          <div className="text-sm text-blue-800">Total Capacity (KL)</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {totalPumps}
          </div>
          <div className="text-sm text-green-800">Total Pumps</div>
        </div>
      </div>

      {/* OHT Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">OHT ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">District</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Block</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">GP</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Village</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Capacity (KL)</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">No. of Pumps</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ohtData.slice(0, 30).map((oht, index) => (
              <tr key={oht.OhtId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">#{oht.OhtId}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{oht.Districtname}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{oht.BlockName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{oht.GramPanchayatName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{oht.VillageName}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                  {(oht.OHTCapacity || 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{oht.NoOfPumps || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Info */}
      {ohtData.length > 30 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing first 30 records out of {ohtData.length} total OHTs.
          <button 
            onClick={() => onExportCSV(ohtData, 'all_oht_data')}
            className="ml-2 text-blue-600 hover:text-blue-800 underline"
          >
            Export all records
          </button>
        </div>
      )}
    </div>
  );
};