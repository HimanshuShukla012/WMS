// components/Overview/WaterFeeDetailCard.tsx - Water fee summary details

import React from 'react';
import * as Types from '../types';

interface WaterFeeDetailCardProps {
  stats: Types.LocationStats;
}

export const WaterFeeDetailCard: React.FC<WaterFeeDetailCardProps> = ({ stats }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Water Fee Detail
      </h3>

      <div className="space-y-3">
        {/* Proposed Amount */}
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-sm font-medium text-gray-600">Proposed Water Fee</span>
          <span className="text-lg font-semibold text-blue-600">
            ₹{stats.totalBaseFee.toLocaleString()}
          </span>
        </div>

        {/* Collected Amount */}
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-sm font-medium text-gray-600">Collected Water Fee</span>
          <span className="text-lg font-semibold text-green-600">
            ₹{stats.totalPaidAmount.toLocaleString()}
          </span>
        </div>

        {/* Outstanding Amount */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Outstanding Water Fee</span>
          <span className="text-lg font-semibold text-orange-600">
            ₹{stats.totalOutstanding.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};