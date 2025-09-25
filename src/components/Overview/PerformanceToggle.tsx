// components/Overview/PerformanceToggle.tsx - Toggle for performance cards visibility

import React from 'react';
import { BarChart3, EyeOff, Eye, Settings } from 'lucide-react';

interface PerformanceToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  userRole: string;
  loading?: boolean;
}

export const PerformanceToggle: React.FC<PerformanceToggleProps> = ({
  isEnabled,
  onToggle,
  userRole,
  loading = false
}) => {
  // Check if user has access to performance data
  const hasAccess = ['Admin', 'Director', 'DPRO', 'ADO'].includes(userRole);

  if (!hasAccess) {
    return null; // Don't show toggle if user has no access
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Performance Analytics</h3>
          </div>
          <div className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
            {userRole}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            {isEnabled ? 'Visible' : 'Hidden'}
          </div>
          
          <button
            onClick={() => onToggle(!isEnabled)}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isEnabled ? 'bg-blue-600' : 'bg-gray-200'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>

          <div className="flex items-center gap-1 text-gray-500">
            {isEnabled ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Settings className="w-3 h-3" />
          <span>
            {userRole === 'Admin' || userRole === 'Director' 
              ? 'Shows district, block, and GP performance data'
              : userRole === 'DPRO'
                ? 'Shows block performance data only'
                : userRole === 'ADO'
                  ? 'Shows GP performance data only'
                  : 'Performance data not available'
            }
          </span>
        </div>
      </div>
    </div>
  );
};