// components/Finance/FinanceTab.tsx - Water fee summary and financial data management

import React from 'react';
import { DollarSign, Download } from 'lucide-react';
import * as Types from '../../types';

interface FinanceTabProps {
  waterFeeSummaryData: Types.WaterFeeSummaryData[];
  stats: Types.LocationStats;
  selectedLocationName: string;
  fromDate: string;
  toDate: string;
  onExportCSV: (data: any[], filename: string) => void;
  // Filtering function should be passed from parent
  filterWaterFeeSummaryByLocation: (data: Types.WaterFeeSummaryData[]) => Types.WaterFeeSummaryData[];
}

export const FinanceTab: React.FC<FinanceTabProps> = ({
  waterFeeSummaryData,
  stats,
  selectedLocationName,
  fromDate,
  toDate,
  onExportCSV,
  filterWaterFeeSummaryByLocation
}) => {
  const filteredWaterFeeSummary = filterWaterFeeSummaryByLocation(waterFeeSummaryData);

  if (waterFeeSummaryData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-600 mb-2">No Water Fee Summary Data</h4>
          <p className="text-gray-500">
            No water fee summary records found for the selected criteria. 
            Try adjusting your filters or check if data is available for the selected time period.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          Water Fee Summary Management
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => onExportCSV(filteredWaterFeeSummary, 'water_fee_summary')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            disabled={filteredWaterFeeSummary.length === 0}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">₹{stats.totalBaseFee.toLocaleString()}</div>
          <div className="text-sm text-yellow-800">Proposed Water Fee</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">₹{stats.totalPaidAmount.toLocaleString()}</div>
          <div className="text-sm text-green-800">Collected Water Fee</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">₹{stats.totalOutstanding.toLocaleString()}</div>
          <div className="text-sm text-orange-800">Outstanding Water Fee</div>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredWaterFeeSummary.length} water fee records for {selectedLocationName}
        • Period: {new Date(fromDate).toLocaleDateString()} to {new Date(toDate).toLocaleDateString()}
      </div>

      {/* Water Fee Summary Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">District</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Block</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">GP</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Village</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Year</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Month</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Proposed Water Fee (₹)</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Collected Water Fee (₹)</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Outstanding Water Fee (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredWaterFeeSummary.slice(0, 50).map((fee, index) => (
              <tr key={`${fee.DistrictName}-${fee.VillageName}-${fee.Year}-${fee.Month}-${index}`} 
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{fee.DistrictName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{fee.BlockName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{fee.GramPanchayatName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{fee.VillageName}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{fee.Year}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{fee.Month}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{(fee.BaseFee || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-green-600 text-right font-medium">{(fee.PaidAmount || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-orange-600 text-right font-medium">{(fee.OutstandingAmount || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Info */}
      {filteredWaterFeeSummary.length > 50 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing first 50 records out of {filteredWaterFeeSummary.length} total water fee records.
          <button 
            onClick={() => onExportCSV(filteredWaterFeeSummary, 'all_water_fee_summary')}
            className="ml-2 text-blue-600 hover:text-blue-800 underline"
          >
            Export all records
          </button>
        </div>
      )}
    </div>
  );
};