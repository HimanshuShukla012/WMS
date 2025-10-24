// DirectorMonitoring.tsx - Fixed with correct userRole prop and section navigation

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useUserInfo } from '../utils/userInfo';
import { useDirectorData } from '../components/hooks/useDirectorData.ts';
import { useLocationData } from '../components/hooks/useLocationData';

// Component imports
import { DirectorHeader } from '../components/Header/DirectorHeader';
import { LocationFilters } from '../components/Filters/LocationFilters';
import { TabNavigation } from '../components/Tabs/TabNavigation';
import { OverviewTab } from '../components/Overview/OverviewTab';
import { BeneficiariesTab } from '../components/Beneficiaries/BeneficiariesTab';
import { InfrastructureTab } from '../components/Infrastructure/InfrastructureTab';
import { FinanceTab } from '../components/Finance/FinanceTab';
import { WaterQualityTab } from '../components/WaterQuality/WaterQualityTab';
import { ComplaintsTab } from '../components/Complaints/ComplaintsTab';

// Types
import { TabType } from '../components/types';

const DirectorMonitoring: React.FC = () => {
  const { userId, role, isLoading: userLoading, userInfo } = useUserInfo();
  
  // Location management
  const locationData = useLocationData();
  
  // Date range state
  const [fromDate, setFromDate] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return date.toISOString().split('T')[0];
  });
  
  const [toDate, setToDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Main data management
  const directorData = useDirectorData(
    locationData.selectedDistrictId,
    locationData.selectedBlockId,
    locationData.selectedGramPanchayatId,
    locationData.selectedVillageId,
    fromDate,
    toDate,
    locationData.districts,
    locationData.blocks,
    locationData.gramPanchayats,
    locationData.villages
  );

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [infrastructureSection, setInfrastructureSection] = useState<string>('oht');

  // Handle tab changes with optional section
  const handleTabChange = (tab: TabType, section?: string) => {
    setActiveTab(tab);
    
    // If switching to infrastructure tab with a specific section
    if (tab === 'infrastructure' && section) {
      setInfrastructureSection(section);
    }
  };

  // --- Export Functions ---
  const exportToExcel = () => {
    // Create comprehensive Excel export including performance data
    const exportData = {
      summary: {
        location: locationData.getSelectedLocationName(),
        period: `${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}`,
        ...directorData.stats
      },
      beneficiaries: directorData.filterByLocation(directorData.beneficiariesData),
      ohts: directorData.filterOHTsByLocation(directorData.ohtData),
      pumpHouses: directorData.filterPumpHousesByOHT(
        directorData.pumpHouseData, 
        directorData.filterOHTsByLocation(directorData.ohtData)
      ),
      waterFee: directorData.filterWaterFeeSummaryByLocation(directorData.waterFeeSummaryData),
      complaints: directorData.filterComplaintsByLocation(directorData.complaintsData),
      waterQuality: directorData.filterWaterQualityByLocation(directorData.waterQualityData),
      // Add performance data to export
      topDistricts: directorData.topDistrictsData,
      bottomDistricts: directorData.bottomDistrictsData,
      topBlocks: directorData.topBlocksData,
      bottomBlocks: directorData.bottomBlocksData,
      topGPs: directorData.topGPsData,
      bottomGPs: directorData.bottomGPsData
    };

    // Create download (simplified implementation)
    const blob = new Blob(['Director Monitoring Export'], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 
      `director_monitoring_${locationData.getSelectedLocationName().replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcelSheet = (data: any[], filename: string) => {
  if (!data.length) {
    alert("No data to export");
    return;
  }

  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  // Generate Excel file and trigger download
  XLSX.writeFile(
    workbook, 
    `${filename}_${locationData.getSelectedLocationName().replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
  );
};
  // Reset date filters along with location filters
  const handleResetFilters = () => {
    locationData.resetFilters();
    const defaultFromDate = new Date();
    defaultFromDate.setMonth(defaultFromDate.getMonth() - 6);
    setFromDate(defaultFromDate.toISOString().split('T')[0]);
    setToDate(new Date().toISOString().split('T')[0]);
  };

  // Handle performance data refresh
  const handleRefreshAll = () => {
    directorData.loadAllData();
    directorData.loadPerformanceData();
  };

  // --- Render Logic ---
  if (userLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        Loading user information...
      </div>
    );
  }
  
  if (!userId) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the Monitoring Dashboard for Directorate</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br relative z-10 from-gray-50 to-gray-100">
      {/* Header - FIXED: Changed 'role' to 'userRole' */}
      <DirectorHeader
        selectedLocationName={locationData.getSelectedLocationName()}
        onRefresh={handleRefreshAll}
        onExport={exportToExcel}
        loading={directorData.loading || directorData.performanceLoading}
        userRole={role}
      />

      {/* Error Display */}
      {directorData.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <div className="text-red-700">{directorData.error}</div>
          <button 
            onClick={() => directorData.setError('')}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-6 gap-6">
        {/* Filters Panel */}
        <LocationFilters
          {...locationData}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          loading={directorData.loading}
          onApplyFilters={handleRefreshAll}
          onResetFilters={handleResetFilters}
        />

        {/* Main Content Area */}
        <div className="xl:col-span-5 space-y-6">
          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Loading State */}
          {(directorData.loading || directorData.performanceLoading) && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <div className="text-gray-600">
                {directorData.loading && directorData.performanceLoading 
                  ? 'Loading comprehensive monitoring and performance data...'
                  : directorData.loading 
                    ? 'Loading monitoring data...'
                    : 'Loading performance data...'
                }
              </div>
            </div>
          )}

          {/* Tab Content */}
          {!directorData.loading && (
            <>
              {activeTab === 'overview' && (
                <OverviewTab
                  stats={directorData.stats}
                  beneficiaryTrend={directorData.beneficiaryTrend}
                  feeCollectionTrend={directorData.feeCollectionTrend}
                  waterFeeSummaryData={directorData.waterFeeSummaryData}
                  // Performance data props
                  topDistrictsData={directorData.topDistrictsData}
                  bottomDistrictsData={directorData.bottomDistrictsData}
                  topBlocksData={directorData.topBlocksData}
                  bottomBlocksData={directorData.bottomBlocksData}
                  topGPsData={directorData.topGPsData}
                  bottomGPsData={directorData.bottomGPsData}
                  performanceLoading={directorData.performanceLoading}
                  userRole={role || 'User'}
                  onTabChange={handleTabChange} // Pass the updated handler
                  onExportExcel={exportToExcelSheet}
                />
              )}

              {activeTab === 'beneficiaries' && (
                <BeneficiariesTab
                  beneficiariesData={directorData.beneficiariesData}
                  selectedLocationName={locationData.getSelectedLocationName()}
                  onExportExcel={exportToExcelSheet}
                  filterByLocation={directorData.filterByLocation}
                />
              )}

              {activeTab === 'infrastructure' && (
                <InfrastructureTab
                  ohtData={directorData.ohtData}
                  pumpHouseData={directorData.pumpHouseData}
                  selectedLocationName={locationData.getSelectedLocationName()}
                  onExportExcel={exportToExcelSheet}
                  filterOHTsByLocation={directorData.filterOHTsByLocation}
                  filterPumpHousesByOHT={directorData.filterPumpHousesByOHT}
                  initialSection={infrastructureSection} // Pass the section state
                />
              )}

              {activeTab === 'finance' && (
                <FinanceTab
                  waterFeeSummaryData={directorData.waterFeeSummaryData}
                  stats={directorData.stats}
                  selectedLocationName={locationData.getSelectedLocationName()}
                  fromDate={fromDate}
                  toDate={toDate}
                  onExportExcel={exportToExcelSheet}
                  filterWaterFeeSummaryByLocation={directorData.filterWaterFeeSummaryByLocation}
                />
              )}

              {activeTab === 'quality' && (
                <WaterQualityTab
                  waterQualityData={directorData.waterQualityData}
                  onExportExcel={exportToExcelSheet}
                  filterWaterQualityByLocation={directorData.filterWaterQualityByLocation}
                />
              )}

              {activeTab === 'complaints' && (
                <ComplaintsTab
                  complaintsData={directorData.complaintsData}
                  selectedLocationName={locationData.getSelectedLocationName()}
                  onExportExcel={exportToExcelSheet}
                  filterComplaintsByLocation={directorData.filterComplaintsByLocation}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                (directorData.loading || directorData.performanceLoading) 
                  ? 'bg-orange-500 animate-pulse' 
                  : 'bg-green-500'
              }`}></div>
              <span>
                {(directorData.loading || directorData.performanceLoading) 
                  ? 'Loading data...' 
                  : 'Data loaded successfully'
                }
              </span>
            </div>
            <div>
              Total Records: {
                directorData.beneficiariesData.length + 
                directorData.ohtData.length + 
                directorData.pumpHouseData.length + 
                directorData.waterQualityData.length + 
                directorData.waterFeeSummaryData.length +
                directorData.complaintsData.length
              }
            </div>
            {/* Performance data status */}
            <div className="text-xs">
              Performance Data: {
                directorData.topDistrictsData.length + 
                directorData.bottomDistrictsData.length + 
                directorData.topBlocksData.length + 
                directorData.bottomBlocksData.length +
                directorData.topGPsData.length + 
                directorData.bottomGPsData.length
              } entries
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div>Role: {role || 'User'}</div>
            <div>User ID: {userId}</div>
            <div>
              Last Refresh: {new Date().toLocaleTimeString('en-GB', { hour12: false })}
            </div>
          </div>
        </div>
      </div>

      {/* Location Loading Overlay */}
      {locationData.locationLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            <div>
              <div className="font-medium text-gray-900">Loading Location Data</div>
              <div className="text-sm text-gray-600">Fetching administrative boundaries...</div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Data Loading Overlay */}
      {directorData.performanceLoading && !directorData.loading && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center gap-3 z-40">
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
          <div className="text-sm">
            <div className="font-medium text-gray-900">Loading Performance Data</div>
            <div className="text-gray-600">Fetching top/bottom performers...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectorMonitoring;