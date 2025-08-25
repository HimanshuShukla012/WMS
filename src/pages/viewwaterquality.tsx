import React, { useState } from 'react';
import {Search, Download, BarChart3, Droplets, AlertTriangle, CheckCircle} from 'lucide-react';
import { useUserInfo } from '../utils/userInfo';
import * as XLSX from 'xlsx'; // top imports

const WaterQualityPage = () => {
  const { userId } = useUserInfo(); // ✅ Call hook at top level

  const [formData, setFormData] = useState({
    StartDate: '',
    EndDate: ''
  });
  
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  const getContaminationRate = (item) => {
    return item.NoOfSampleCollected > 0 
      ? ((item.NoOfContaminatedSamples / item.NoOfSampleCollected) * 100).toFixed(1)
      : 0;
  };

  const downloadTableExcel = () => {
    if (!reportData || reportData.length === 0) return;

    // Map data for export
    const exportData = reportData.map((item) => ({
      'Test ID': item.TestId,
      'Samples Collected': item.NoOfSampleCollected,
      'Contaminated Samples': item.NoOfContaminatedSamples,
      'Villages Tested': item.VillagesTested,
      'Villages With Contamination': item.VillagesWithContamination,
      'Action Taken': item.ActionTaken,
      'Created Date': item.CreatedDate,
      'Contamination Rate (%)': getContaminationRate(item),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Optional: Auto-size columns
    const colWidths = Object.keys(exportData[0]).map((key) => ({
      wch: Math.max(
        key.length,
        ...exportData.map((row) => String(row[key as keyof typeof row]).length)
      ),
    }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'WaterQualityReport');

    const filename = `water_quality_report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const validateDates = (startDate, endDate) => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end < start) {
        setValidationError('End date cannot be before start date');
        return false;
      }
    }
    setValidationError('');
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(updatedFormData);
    
    // Validate dates whenever either date changes
    if (name === 'StartDate' || name === 'EndDate') {
      validateDates(
        name === 'StartDate' ? value : formData.StartDate,
        name === 'EndDate' ? value : formData.EndDate
      );
    }
  };

  const handleSubmit = async () => {
    // Clear any existing errors
    setError('');
    setValidationError('');
    
    // Validate dates before submitting
    if (!validateDates(formData.StartDate, formData.EndDate)) {
      return;
    }

    setLoading(true);
    
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("User not authenticated. Please login.");
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('https://wmsapi.kdsgroup.co.in/api/Master/GetWaterQualityReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
          'Authorization': `Bearer ${token}` // ✅ token now defined
        },
        body: JSON.stringify({
          CreatedBy: userId ? parseInt(userId) : 0,
          StartDate: formData.StartDate ? new Date(formData.StartDate).toISOString() : new Date().toISOString(),
          EndDate: formData.EndDate ? new Date(formData.EndDate).toISOString() : new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const result = await response.json();

      if (result.Status) {
        setReportData(result.Data || []);
      } else {
        setError(result.Message || 'Failed to fetch data');
      }
    } catch (err: any) {
      setError(`Failed to fetch water quality reports: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (rate) => {
    if (rate === 0) return 'text-green-600 bg-green-50';
    if (rate <= 20) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Droplets className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Water Quality Report</h1>
                <p className="text-gray-600">Monitor and analyze water quality test results</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="StartDate"
                value={formData.StartDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationError ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="EndDate"
                value={formData.EndDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationError ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
          </div>

          {/* Validation Error Message */}
          {validationError && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-red-800 text-sm">{validationError}</span>
              </div>
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading || validationError}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="h-4 w-4" />
              <span>{loading ? 'Loading...' : 'Generate Report'}</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Report Results */}
        {reportData.length > 0 && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportData.map((item, index) => {
                const contaminationRate = getContaminationRate(item);
                return (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-gray-900">Test #{item.TestId}</span>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contaminationRate)}`}>
                        {contaminationRate}% Contaminated
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Samples Collected</span>
                        <span className="font-semibold text-gray-900">{item.NoOfSampleCollected}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Contaminated</span>
                        <span className="font-semibold text-red-600">{item.NoOfContaminatedSamples}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Villages Tested</span>
                        <span className="font-semibold text-gray-900">{item.VillagesTested}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">With Contamination</span>
                        <span className="font-semibold text-orange-600">{item.VillagesWithContamination}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed Report Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Detailed Report</h3>

                <button
                  onClick={downloadTableExcel}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  disabled={reportData.length === 0}
                >
                  <Download className="h-4 w-4" />
                  <span>Download Excel</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Test ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Samples
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contaminated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Villages
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action Taken
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.map((item, index) => {
                      const contaminationRate = getContaminationRate(item);
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{item.TestId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.NoOfSampleCollected}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                            {item.NoOfContaminatedSamples}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.VillagesTested} tested, {item.VillagesWithContamination} contaminated
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {item.ActionTaken}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.CreatedDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {contaminationRate === '0.0' ? (
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                              )}
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(contaminationRate)}`}>
                                {contaminationRate === '0.0' ? 'Clean' : `${contaminationRate}% Contaminated`}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* No Data State */}
        {reportData.length === 0 && !loading && !error && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Droplets className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Generated Yet</h3>
            <p className="text-gray-600">Use the filter form above to generate water quality reports</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaterQualityPage;