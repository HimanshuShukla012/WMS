// components/Overview/ChartsSection.tsx - Charts for overview section

import React from 'react';
import { TrendingUp, DollarSign } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import * as Types from '../../types';

interface ChartsSectionProps {
  beneficiaryTrend: Types.BeneficiaryTrendData[];
  feeCollectionTrend: Types.FeeCollectionTrendData[];
  onExportCSV: (data: any[], filename: string) => void;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  beneficiaryTrend,
  feeCollectionTrend,
  onExportCSV
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
      {/* Beneficiary Growth Trend */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Beneficiary Growth Trend
          </h4>
          <button 
            onClick={() => onExportCSV(beneficiaryTrend, 'beneficiary_trend')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Export
          </button>
        </div>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={beneficiaryTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Legend />
              <Bar 
                dataKey="total" 
                fill="#3b82f6" 
                name="Total Beneficiaries"
                barSize={40}
                radius={[6, 6, 0, 0]} 
              />
              <Bar 
                dataKey="active" 
                fill="#10b981" 
                name="Active Beneficiaries"
                barSize={40}
                radius={[6, 6, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fee Collection Trend */}
      {feeCollectionTrend.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Fee Collection Trend
            </h4>
            <button 
              onClick={() => onExportCSV(feeCollectionTrend, 'fee_collection_trend')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Export
            </button>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={feeCollectionTrend} 
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    `₹${Number(value).toLocaleString()}`, 
                    name
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend />

                {/* Proposed Water Fee Bar */}
                <Bar 
                  dataKey="baseFee" 
                  fill="#3b82f6" 
                  name="Proposed Water Fee"
                  barSize={40}
                  radius={[6, 6, 0, 0]} 
                />

                {/* Collected Water Fee Bar */}
                <Bar 
                  dataKey="collected" 
                  fill="#10b981" 
                  name="Collected Water Fee"
                  barSize={40}
                  radius={[6, 6, 0, 0]} 
                />

                {/* Outstanding Water Fee Bar */}
                <Bar 
                  dataKey="outstanding" 
                  fill="#f97316" 
                  name="Outstanding Water Fee"
                  barSize={40}
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};