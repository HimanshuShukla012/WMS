// components/Overview/PerformanceCard.tsx - Single performance card component (renamed from PerformanceCards)

import React, { useState } from 'react';
import { 
  MapPin, 
  Building, 
  Home, 
  Download, 
  Search,
  Eye,
  EyeOff
} from 'lucide-react';

interface PerformanceCardProps {
  title: string;
  data: any[];
  icon: React.ReactNode;
  type: 'district' | 'block' | 'gp';
  isTop: boolean;
  onExport?: (data: any[], filename: string) => void;
}

export const PerformanceCard: React.FC<PerformanceCardProps> = ({ 
  title, 
  data = [], // Provide default empty array to prevent undefined errors
  icon, 
  type, 
  isTop,
  onExport 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const getLocationIcon = () => {
    switch (type) {
      case 'district': return <MapPin className="w-4 h-4 text-gray-500" />;
      case 'block': return <Building className="w-4 h-4 text-gray-500" />;
      case 'gp': return <Home className="w-4 h-4 text-gray-500" />;
      default: return <MapPin className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAmountColor = (amount: number) => {
    if (amount === 0) return 'text-red-600';
    if (amount < 5000) return 'text-orange-600';
    return isTop ? 'text-green-600' : 'text-orange-600';
  };

  const getRankColor = (index: number) => {
    if (isTop) {
      if (index === 0) return 'bg-yellow-100 text-yellow-800 border border-yellow-300'; // Gold
      if (index === 1) return 'bg-gray-100 text-gray-800 border border-gray-300'; // Silver
      if (index === 2) return 'bg-orange-100 text-orange-800 border border-orange-300'; // Bronze
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    } else {
      return 'bg-red-50 text-red-700 border border-red-200';
    }
  };

  // Ensure data is an array before filtering
  const safeData = Array.isArray(data) ? data : [];

  // Filter data based on search term
  const filteredData = safeData.filter(item => {
    const searchableText = (
      item?.DistrictName || 
      item?.BlockName || 
      item?.GPName || 
      item?.GpName || 
      ''
    ).toLowerCase();
    return searchableText.includes(searchTerm.toLowerCase());
  });

  // Determine how many items to show
  const displayData = showAll ? filteredData : filteredData.slice(0, 10);

  const handleExport = () => {
    if (onExport && filteredData.length > 0) {
      const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}`;
      onExport(filteredData, filename);
    }
  };

  // Get the amount field based on data structure
  const getAmount = (item: any): number => {
    return item?.TotalAmountPaid || item?.TotalAmount || 0;
  };

  // Get the name field based on type
  const getName = (item: any): string => {
    if (type === 'district') return item?.DistrictName || 'Unknown District';
    if (type === 'block') return item?.BlockName || 'Unknown Block';
    if (type === 'gp') return item?.GPName || item?.GpName || 'Unknown GP';
    return 'Unknown';
  };

  // Get ID field based on type
  const getId = (item: any): number | string => {
    if (type === 'district') return item?.DistrictId;
    if (type === 'block') return item?.BlockId;
    if (type === 'gp') return item?.GPId || item?.GpId;
    return Math.random(); // fallback
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-semibold text-gray-800 truncate">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded hover:bg-gray-200 transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <EyeOff className="w-4 h-4 text-gray-600" />
              ) : (
                <Eye className="w-4 h-4 text-gray-600" />
              )}
            </button>
            {onExport && filteredData.length > 0 && (
              <button
                onClick={handleExport}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                title="Export to CSV"
              >
                <Download className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Search and Stats */}
        {isExpanded && (
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2 top-2 text-gray-400" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-xs text-gray-500">
              {filteredData.length} of {safeData.length}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {filteredData.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              {searchTerm ? 'No matching locations found' : 'No data available'}
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {displayData.map((item, index) => {
                  // Calculate the actual rank considering search filtering
                  const originalIndex = safeData.findIndex(dataItem => 
                    getId(dataItem) === getId(item)
                  );

                  return (
                    <div
                      key={getId(item) || index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getRankColor(originalIndex >= 0 ? originalIndex : index)}`}>
                          #{originalIndex >= 0 ? originalIndex + 1 : index + 1}
                        </span>
                        <div className="flex items-center gap-2 min-w-0">
                          {getLocationIcon()}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {getName(item)}
                            </p>
                            {/* Show parent location for context */}
                            {((item?.BlockName && type === 'district') || 
                              (item?.DistrictName && type !== 'district')) && (
                              <p className="text-xs text-gray-500 truncate">
                                {type === 'district' ? item?.BlockName : item?.DistrictName}
                                {type === 'gp' && item?.BlockName && `, ${item.BlockName}`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-semibold ${getAmountColor(getAmount(item))}`}>
                          ₹{getAmount(item).toLocaleString()}
                        </span>
                        <div className="text-xs text-gray-500">
                          {(getAmount(item) / 1000).toFixed(1)}K
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Show More/Less Button */}
              {filteredData.length > 10 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    {showAll ? 'Show Less' : `Show All ${filteredData.length} Items`}
                  </button>
                </div>
              )}

              {/* Summary Stats */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-800">
                      ₹{filteredData.reduce((sum, item) => sum + getAmount(item), 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Total Collection</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-800">
                      ₹{filteredData.length > 0 ? Math.round(filteredData.reduce((sum, item) => sum + getAmount(item), 0) / filteredData.length).toLocaleString() : 0}
                    </div>
                    <div className="text-xs text-gray-500">Average</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};