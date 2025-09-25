// components/Debug/PerformanceDebug.tsx - Debug component for performance data

import React from 'react';
import { Bug, User, Database, Clock } from 'lucide-react';
import * as Types from '../types';

interface PerformanceDebugProps {
  topDistrictsData: Types.TopBottomDistrictData[];
  bottomDistrictsData: Types.TopBottomDistrictData[];
  topBlocksData: Types.TopBottomBlockData[];
  bottomBlocksData: Types.TopBottomBlockData[];
  topGPsData: Types.TopBottomGPData[];
  bottomGPsData: Types.TopBottomGPData[];
  userRole: string;
  userId: any;
  performanceLoading: boolean;
}

export const PerformanceDebug: React.FC<PerformanceDebugProps> = ({
  topDistrictsData,
  bottomDistrictsData,
  topBlocksData,
  bottomBlocksData,
  topGPsData,
  bottomGPsData,
  userRole,
  userId,
  performanceLoading
}) => {
  const getCurrentFinancialYear = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    if (currentMonth >= 4) {
      return currentYear + 1;
    } else {
      return currentYear;
    }
  };

  const debugInfo = {
    userInfo: {
      userId,
      userRole,
      hasUserId: !!userId,
      userType: typeof userId
    },
    systemInfo: {
      currentFinancialYear: getCurrentFinancialYear(),
      performanceLoading,
      timestamp: new Date().toISOString()
    },
    dataInfo: {
      topDistricts: topDistrictsData?.length || 0,
      bottomDistricts: bottomDistrictsData?.length || 0,
      topBlocks: topBlocksData?.length || 0,
      bottomBlocks: bottomBlocksData?.length || 0,
      topGPs: topGPsData?.length || 0,
      bottomGPs: bottomGPsData?.length || 0
    },
    roleAccess: {
      hasDistrictAccess: userRole === 'Admin' || userRole === 'Director',
      hasBlockAccess: userRole === 'Admin' || userRole === 'Director' || userRole === 'DPRO',
      hasGPAccess: userRole === 'Admin' || userRole === 'Director' || userRole === 'ADO',
      shouldLoadData: !!(userId && ['Admin', 'Director', 'DPRO', 'ADO'].includes(userRole))
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Bug className="w-5 h-5 text-yellow-600" />
        <h3 className="font-semibold text-yellow-800">Performance Data Debug Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* User Information */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-blue-600" />
            <h4 className="font-medium text-gray-800">User Info</h4>
          </div>
          <div className="space-y-1 text-sm">
            <div>ID: <code className="bg-gray-100 px-1 rounded">{debugInfo.userInfo.userId || 'null'}</code></div>
            <div>Role: <code className="bg-gray-100 px-1 rounded">{debugInfo.userInfo.userRole}</code></div>
            <div>Has ID: <span className={debugInfo.userInfo.hasUserId ? 'text-green-600' : 'text-red-600'}>{debugInfo.userInfo.hasUserId ? 'Yes' : 'No'}</span></div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-green-600" />
            <h4 className="font-medium text-gray-800">System Info</h4>
          </div>
          <div className="space-y-1 text-sm">
            <div>FY: <code className="bg-gray-100 px-1 rounded">{debugInfo.systemInfo.currentFinancialYear}</code></div>
            <div>Loading: <span className={debugInfo.systemInfo.performanceLoading ? 'text-orange-600' : 'text-green-600'}>{debugInfo.systemInfo.performanceLoading ? 'Yes' : 'No'}</span></div>
            <div>Should Load: <span className={debugInfo.roleAccess.shouldLoadData ? 'text-green-600' : 'text-red-600'}>{debugInfo.roleAccess.shouldLoadData ? 'Yes' : 'No'}</span></div>
          </div>
        </div>

        {/* Data Counts */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-purple-600" />
            <h4 className="font-medium text-gray-800">Data Counts</h4>
          </div>
          <div className="space-y-1 text-sm">
            <div>Top Districts: <span className="font-medium">{debugInfo.dataInfo.topDistricts}</span></div>
            <div>Bottom Districts: <span className="font-medium">{debugInfo.dataInfo.bottomDistricts}</span></div>
            <div>Top Blocks: <span className="font-medium">{debugInfo.dataInfo.topBlocks}</span></div>
            <div>Bottom Blocks: <span className="font-medium">{debugInfo.dataInfo.bottomBlocks}</span></div>
            <div>Top GPs: <span className="font-medium">{debugInfo.dataInfo.topGPs}</span></div>
            <div>Bottom GPs: <span className="font-medium">{debugInfo.dataInfo.bottomGPs}</span></div>
          </div>
        </div>

        {/* Role Access */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-indigo-600" />
            <h4 className="font-medium text-gray-800">Role Access</h4>
          </div>
          <div className="space-y-1 text-sm">
            <div>Districts: <span className={debugInfo.roleAccess.hasDistrictAccess ? 'text-green-600' : 'text-red-600'}>{debugInfo.roleAccess.hasDistrictAccess ? 'Yes' : 'No'}</span></div>
            <div>Blocks: <span className={debugInfo.roleAccess.hasBlockAccess ? 'text-green-600' : 'text-red-600'}>{debugInfo.roleAccess.hasBlockAccess ? 'Yes' : 'No'}</span></div>
            <div>GPs: <span className={debugInfo.roleAccess.hasGPAccess ? 'text-green-600' : 'text-red-600'}>{debugInfo.roleAccess.hasGPAccess ? 'Yes' : 'No'}</span></div>
          </div>
        </div>
      </div>

      {/* Sample Data Preview */}
      {(topDistrictsData?.length > 0 || topBlocksData?.length > 0 || topGPsData?.length > 0) && (
        <div className="mt-4 p-4 bg-white rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Sample Data Preview</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {topDistrictsData?.length > 0 && (
              <div>
                <div className="font-medium text-green-600">Top District Sample:</div>
                <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto">
                  {JSON.stringify(topDistrictsData[0], null, 2)}
                </pre>
              </div>
            )}
            {topBlocksData?.length > 0 && (
              <div>
                <div className="font-medium text-blue-600">Top Block Sample:</div>
                <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto">
                  {JSON.stringify(topBlocksData[0], null, 2)}
                </pre>
              </div>
            )}
            {topGPsData?.length > 0 && (
              <div>
                <div className="font-medium text-purple-600">Top GP Sample:</div>
                <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto">
                  {JSON.stringify(topGPsData[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* API URLs for Testing */}
      <div className="mt-4 p-4 bg-white rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">API URLs for Manual Testing</h4>
        <div className="space-y-1 text-xs font-mono">
          <div>Districts Top: <code>GET /api/Dashboard/GetTop10DistrictByFeeCollection?FinancialYear={getCurrentFinancialYear()}</code></div>
          <div>Districts Bottom: <code>GET /api/Dashboard/GetBottom10DistrictByFeeCollection?FinancialYear={getCurrentFinancialYear()}&UserId={userId}</code></div>
          <div>Blocks Top: <code>GET /api/Dashboard/GetTop10BlockFeeCollection?userId={userId}&FinancialYear={getCurrentFinancialYear()}</code></div>
          <div>Blocks Bottom: <code>GET /api/Dashboard/GetBottom10BlockFeeCollection?userId={userId}&FinancialYear={getCurrentFinancialYear()}</code></div>
          <div>GPs Top: <code>GET /api/Dashboard/GetTop10GpFeeCollection?userId={userId}&FinancialYear={getCurrentFinancialYear()}</code></div>
          <div>GPs Bottom: <code>GET /api/Dashboard/GetBottom10GPFeeCollection?userId={userId}&FinancialYear={getCurrentFinancialYear()}</code></div>
        </div>
      </div>
    </div>
  );
};