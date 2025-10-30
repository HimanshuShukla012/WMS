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
  // Calculate statistics directly from filtered data
  const filteredBeneficiaries = directorData.filterByLocation(directorData.beneficiariesData);
  const filteredOHTs = directorData.filterOHTsByLocation(directorData.ohtData);
  const filteredPumpHouses = directorData.filterPumpHousesByOHT(
    directorData.pumpHouseData, 
    filteredOHTs
  );
  const filteredWaterFee = directorData.filterWaterFeeSummaryByLocation(directorData.waterFeeSummaryData);
  const filteredComplaints = directorData.filterComplaintsByLocation(directorData.complaintsData);
  const filteredWaterQuality = directorData.filterWaterQualityByLocation(directorData.waterQualityData);

  // Calculate actual values
  const totalBeneficiaries = filteredBeneficiaries.length;
  const activeBeneficiaries = filteredBeneficiaries.filter(b => 
    b.Status === 1 || b.Status === 'Active'
  ).length;

  const totalOHTs = filteredOHTs.length;
  const activeOHTs = filteredOHTs.filter(oht => 
    oht.Status === 1 || oht.IsActive === 1
  ).length;

  const totalPumpHouses = filteredPumpHouses.length;
  const activePumpHouses = filteredPumpHouses.filter(ph => 
    ph.Status === 1
  ).length;

  const totalFeeCollection = filteredWaterFee.reduce((sum, fee) => 
    sum + (Number(fee.PaidAmount) || 0), 0
  );

  const totalComplaints = filteredComplaints.length;
  const resolvedComplaints = filteredComplaints.filter(c => c.Status === 1).length;
  const pendingComplaints = filteredComplaints.filter(c => c.Status === 0).length;
  const closedComplaints = filteredComplaints.filter(c => c.Status === 2).length;

  // Create comprehensive Excel export
  const workbook = XLSX.utils.book_new();
  
  // Summary Sheet with actual calculated values
  const summaryData = [{
    'Location': locationData.getSelectedLocationName(),
    'Period': `${new Date(fromDate).toLocaleDateString('en-IN')} to ${new Date(toDate).toLocaleDateString('en-IN')}`,
    'Total Beneficiaries': totalBeneficiaries,
    'Active Beneficiaries': activeBeneficiaries,
    'Inactive Beneficiaries': totalBeneficiaries - activeBeneficiaries,
    'Total Family Members': directorData.stats.totalFamilyMembers || 0,
    'Total OHTs': totalOHTs,
    'Active OHTs': activeOHTs,
    'Inactive OHTs': totalOHTs - activeOHTs,
    'Total OHT Capacity (KL)': directorData.stats.totalOHTCapacity || 0,
    'Total Pump Houses': totalPumpHouses,
    'Active Pump Houses': activePumpHouses,
    'Inactive Pump Houses': totalPumpHouses - activePumpHouses,
    'Solar Pumps': directorData.stats.solarPumps || 0,
    'Total Base Fee (₹)': (directorData.stats.totalBaseFee || 0).toFixed(2),
    'Total Previous Balance (₹)': (directorData.stats.totalPreviousBalance || 0).toFixed(2),
    'Total Outstanding (₹)': (directorData.stats.totalOutstanding || 0).toFixed(2),
    'Total Fee Collected (₹)': totalFeeCollection.toFixed(2),
    'Collection Efficiency (%)': (directorData.stats.collectionEfficiency || 0).toFixed(2),
    'Total Complaints': totalComplaints,
    'Pending Complaints': pendingComplaints,
    'Resolved Complaints': resolvedComplaints,
    'Closed Complaints': closedComplaints,
    'Water Quality Tests': filteredWaterQuality.length,
    'Generated On': new Date().toLocaleString('en-IN'),
    'Generated By': role || 'User',
    'User ID': userId
  }];
  
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  
  // Add column widths for better formatting
  summarySheet['!cols'] = [
    { wch: 30 }, // Column A - Labels
    { wch: 25 }  // Column B - Values
  ];
  
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Beneficiaries Sheet
  if (filteredBeneficiaries.length > 0) {
    const beneficiariesExport = filteredBeneficiaries.map(b => ({
      'Beneficiary ID': b.BeneficiaryId,
      'Name': b.BeneficiaryName,
      'Father/Husband Name': b.FatherHusbandName || '',
      'Contact': b.Contact,
      'District': b.DistrictName,
      'Block': b.BlockName,
      'Gram Panchayat': b.GrampanchayatName,
      'Village': b.VillageName,
      'Family Members': b.FamilyMembers || b.FamilyCount || 0,
      'Status': b.Status === 1 || b.Status === 'Active' ? 'Active' : 'Inactive'
    }));
    const beneficiariesSheet = XLSX.utils.json_to_sheet(beneficiariesExport);
    XLSX.utils.book_append_sheet(workbook, beneficiariesSheet, 'Beneficiaries');
  }
  
  // OHTs Sheet
  if (filteredOHTs.length > 0) {
    const ohtsExport = filteredOHTs.map(oht => ({
      'OHT ID': oht.OhtId,
      'District': oht.Districtname,
      'Block': oht.BlockName,
      'Gram Panchayat': oht.GramPanchayatName,
      'Village': oht.VillageName,
      'Capacity (KL)': oht.OHTCapacity,
      'Number of Pumps': oht.NoOfPumps,
      'Status': oht.Status === 1 ? 'Active' : 'Inactive'
    }));
    const ohtsSheet = XLSX.utils.json_to_sheet(ohtsExport);
    XLSX.utils.book_append_sheet(workbook, ohtsSheet, 'OHTs');
  }
  
  // Pump Houses Sheet
  if (filteredPumpHouses.length > 0) {
    const pumpHousesExport = filteredPumpHouses.map(ph => ({
      'Pump House ID': ph.PumpHouseId,
      'OHT ID': ph.OhtId,
      'Pump Name': ph.PumpName || '',
      'Power Source': ph.PowerSource === '1' ? 'Electric' : ph.PowerSource === '2' ? 'Solar' : 'Other',
      'Status': ph.Status === 1 ? 'Active' : 'Inactive'
    }));
    const pumpHousesSheet = XLSX.utils.json_to_sheet(pumpHousesExport);
    XLSX.utils.book_append_sheet(workbook, pumpHousesSheet, 'Pump Houses');
  }
  
  // Water Fee Sheet
  if (filteredWaterFee.length > 0) {
    const waterFeeExport = filteredWaterFee.map(fee => ({
      'District': fee.DistrictName,
      'Block': fee.BlockName,
      'Gram Panchayat': fee.GramPanchayatName,
      'Village': fee.VillageName,
      'Month': fee.Month,
      'Year': fee.Year,
      'Base Fee (₹)': (fee.BaseFee || 0).toFixed(2),
      'Previous Balance (₹)': (fee.PreviousBalance || 0).toFixed(2),
      'Outstanding (₹)': (fee.OutstandingAmount || 0).toFixed(2),
      'Paid Amount (₹)': (fee.PaidAmount || 0).toFixed(2)
    }));
    const waterFeeSheet = XLSX.utils.json_to_sheet(waterFeeExport);
    XLSX.utils.book_append_sheet(workbook, waterFeeSheet, 'Water Fee');
  }
  
  // Complaints Sheet
  if (filteredComplaints.length > 0) {
    const complaintsExport = filteredComplaints.map(c => ({
      'Complaint ID': c.ComplaintID,
      'District': c.District,
      'Block': c.Block,
      'Gram Panchayat': c.GramPanchayat,
      'Village': c.Village,
      'Beneficiary Name': c.BeneficiaryName,
      'Contact': c.Contact,
      'Category': c.Category,
      'Other Category': c.OtherCategory || '',
      'Landmark': c.Landmark || '',
      'Status': c.Status === 0 ? 'Pending' : c.Status === 1 ? 'Resolved' : 'Closed',
      'Details': c.ComplaintDetails || ''
    }));
    const complaintsSheet = XLSX.utils.json_to_sheet(complaintsExport);
    XLSX.utils.book_append_sheet(workbook, complaintsSheet, 'Complaints');
  }
  
  // Water Quality Sheet
  if (filteredWaterQuality.length > 0) {
    const waterQualityExport = filteredWaterQuality.map(wq => ({
      'Test ID': wq.TestId || '',
      'District': wq.DistrictName,
      'Block': wq.BlockName,
      'Gram Panchayat': wq.GramPanchayatName,
      'Village': wq.VillageName || '',
      'Test Date': wq.TestDate || '',
      'pH Level': wq.PHLevel || '',
      'TDS': wq.TDS || '',
      'Chlorine': wq.Chlorine || '',
      'Status': wq.Status || ''
    }));
    const waterQualitySheet = XLSX.utils.json_to_sheet(waterQualityExport);
    XLSX.utils.book_append_sheet(workbook, waterQualitySheet, 'Water Quality');
  }
  
  // Performance Sheets (only if data exists)
  if (directorData.topDistrictsData.length > 0) {
    const topDistrictsExport = directorData.topDistrictsData.map((d, index) => ({
      'Rank': index + 1,
      'District ID': d.DistrictId,
      'District Name': d.DistrictName,
      'Total Amount Collected (₹)': (d.TotalAmountPaid || d.TotalAmount || 0).toFixed(2)
    }));
    const topDistrictsSheet = XLSX.utils.json_to_sheet(topDistrictsExport);
    XLSX.utils.book_append_sheet(workbook, topDistrictsSheet, 'Top 10 Districts');
  }
  
  if (directorData.bottomDistrictsData.length > 0) {
    const bottomDistrictsExport = directorData.bottomDistrictsData.map((d, index) => ({
      'Rank': index + 1,
      'District ID': d.DistrictId,
      'District Name': d.DistrictName,
      'Total Amount Collected (₹)': (d.TotalAmountPaid || d.TotalAmount || 0).toFixed(2)
    }));
    const bottomDistrictsSheet = XLSX.utils.json_to_sheet(bottomDistrictsExport);
    XLSX.utils.book_append_sheet(workbook, bottomDistrictsSheet, 'Bottom 10 Districts');
  }
  
  if (directorData.topBlocksData.length > 0) {
    const topBlocksExport = directorData.topBlocksData.map((b, index) => ({
      'Rank': index + 1,
      'Block ID': b.BlockId,
      'Block Name': b.BlockName,
      'District': b.DistrictName,
      'Total Amount Collected (₹)': (b.TotalAmountPaid || b.TotalAmount || 0).toFixed(2)
    }));
    const topBlocksSheet = XLSX.utils.json_to_sheet(topBlocksExport);
    XLSX.utils.book_append_sheet(workbook, topBlocksSheet, 'Top 10 Blocks');
  }
  
  if (directorData.bottomBlocksData.length > 0) {
    const bottomBlocksExport = directorData.bottomBlocksData.map((b, index) => ({
      'Rank': index + 1,
      'Block ID': b.BlockId,
      'Block Name': b.BlockName,
      'District': b.DistrictName,
      'Total Amount Collected (₹)': (b.TotalAmountPaid || b.TotalAmount || 0).toFixed(2)
    }));
    const bottomBlocksSheet = XLSX.utils.json_to_sheet(bottomBlocksExport);
    XLSX.utils.book_append_sheet(workbook, bottomBlocksSheet, 'Bottom 10 Blocks');
  }
  
  if (directorData.topGPsData.length > 0) {
    const topGPsExport = directorData.topGPsData.map((gp, index) => ({
      'Rank': index + 1,
      'GP ID': gp.GpId || gp.GPId,
      'GP Name': gp.GpName || gp.GPName,
      'Block': gp.BlockName,
      'District': gp.DistrictName,
      'Total Amount Collected (₹)': (gp.TotalAmountPaid || gp.TotalAmount || 0).toFixed(2)
    }));
    const topGPsSheet = XLSX.utils.json_to_sheet(topGPsExport);
    XLSX.utils.book_append_sheet(workbook, topGPsSheet, 'Top 10 GPs');
  }
  
  if (directorData.bottomGPsData.length > 0) {
    const bottomGPsExport = directorData.bottomGPsData.map((gp, index) => ({
      'Rank': index + 1,
      'GP ID': gp.GpId || gp.GPId,
      'GP Name': gp.GpName || gp.GPName,
      'Block': gp.BlockName,
      'District': gp.DistrictName,
      'Total Amount Collected (₹)': (gp.TotalAmountPaid || gp.TotalAmount || 0).toFixed(2)
    }));
    const bottomGPsSheet = XLSX.utils.json_to_sheet(bottomGPsExport);
    XLSX.utils.book_append_sheet(workbook, bottomGPsSheet, 'Bottom 10 GPs');
  }
  
  // Generate and download Excel file
  const filename = `monitoring_report_${locationData.getSelectedLocationName().replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
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