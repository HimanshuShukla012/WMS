// components/WaterQuality/WaterQualityTab.tsx - Water quality monitoring and testing data

import React from 'react';
import { Droplets, Download } from 'lucide-react';
import * as Types from '../../types';

interface WaterQualityTabProps {
  waterQualityData: Types.WaterQualityData[];
  onExportExcel: (data: any[], filename: string) => void;
  // Filtering function should be passed from parent
  filterWaterQualityByLocation: (data: Types.WaterQualityData[]) => Types.WaterQualityData[];
}

export const WaterQualityTab: React.FC<WaterQualityTabProps> = ({
  waterQualityData,
  onExportExcel,
  filterWaterQualityByLocation
}) => {
  const filteredWaterQuality = filterWaterQualityByLocation(waterQualityData);

  // Helper function to convert month number to month name
  const getMonthName = (monthNumber: number): string => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Handle month numbers 1-12
    if (monthNumber >= 1 && monthNumber <= 12) {
      return monthNames[monthNumber - 1];
    }
    
    // Return the number as string if it's outside valid range
    return monthNumber.toString();
  };

  if (waterQualityData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-12">
          <Droplets className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-600 mb-2">No Water Quality Data</h4>
          <p className="text-gray-500">
            No water quality test records found for the last 6 months. 
            Water quality monitoring may not have been conducted recently.
          </p>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalSamples = filteredWaterQuality.reduce((sum, w) => sum + (w.TotalSamplesCollected || 0), 0);
  const totalContaminated = filteredWaterQuality.reduce((sum, w) => sum + (w.TotalSamplesContaminated || 0), 0);
  const totalVillagesTested = filteredWaterQuality.reduce((sum, w) => sum + (w.VillagesTestedCount || 0), 0);
  const totalVillagesWithIssues = filteredWaterQuality.reduce((sum, w) => sum + (w.ContaminatedVillagesCount || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Droplets className="w-6 h-6 text-blue-600" />
          Water Quality Monitoring
        </h3>
        <button 
          onClick={() => onExportExcel(filteredWaterQuality, 'water_quality')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          disabled={waterQualityData.length === 0}
        >
          <Download className="w-4 h-4" />
          Export Excel
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {totalSamples}
          </div>
          <div className="text-sm text-blue-800">Total Samples</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">
            {totalContaminated}
          </div>
          <div className="text-sm text-red-800">Contaminated</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {totalVillagesTested}
          </div>
          <div className="text-sm text-green-800">Villages Tested</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">
            {totalVillagesWithIssues}
          </div>
          <div className="text-sm text-orange-800">Villages with Issues</div>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Showing {waterQualityData.length} water quality test records (last 6 months)
      </div>

      {/* Water Quality Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">District</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Block</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Gram Panchayat</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Year</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Month</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Samples Collected</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Contaminated Samples</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Villages Tested</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Villages with Issues</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Contamination %</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredWaterQuality.slice(0, 30).map((test, index) => {
              const contaminationPercentage = test.TotalSamplesCollected > 0 
                ? (test.TotalSamplesContaminated / test.TotalSamplesCollected) * 100 
                : 0;

              return (
                <tr key={`${test.DistrictName}-${test.BlockName}-${index}`} 
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-sm text-gray-900">{test.DistrictName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{test.BlockName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{test.GramPanchayatName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{test.Year}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{getMonthName(test.Month)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{test.TotalSamplesCollected || 0}</td>
                  <td className="px-4 py-3 text-sm text-red-600 text-right font-medium">{test.TotalSamplesContaminated || 0}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{test.VillagesTestedCount || 0}</td>
                  <td className="px-4 py-3 text-sm text-orange-600 text-right font-medium">{test.ContaminatedVillagesCount || 0}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        contaminationPercentage > 20
                          ? 'bg-red-100 text-red-800'
                          : contaminationPercentage > 10
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {contaminationPercentage.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Info */}
      {filteredWaterQuality.length > 30 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing first 30 records out of {filteredWaterQuality.length} total water quality tests.
          <button 
            onClick={() => onExportExcel(filteredWaterQuality, 'all_water_quality_data')}
            className="ml-2 text-blue-600 hover:text-blue-800 underline"
          >
            Export all records
          </button>
        </div>
      )}
    </div>
  );
};