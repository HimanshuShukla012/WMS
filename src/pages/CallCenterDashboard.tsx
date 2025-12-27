import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { RefreshCw, AlertCircle } from 'lucide-react';

interface ComplaintSummaryData {
  TotalComplaint: number;
  ResolvedComplaint: number;
  PendingComplaint: number;
}

interface ComplaintStatusData {
  Status: number;
  TotalComplaint: number;
}

interface ApiResponse<T> {
  Data: T;
  Message: string;
  Status: boolean;
  Errror: string | null;
}

const CallCenterDashboard = () => {
  const [summaryData, setSummaryData] = useState<ComplaintSummaryData>({
    TotalComplaint: 0,
    ResolvedComplaint: 0,
    PendingComplaint: 0
  });
  
  const [statusData, setStatusData] = useState<ComplaintStatusData>({
    Status: 0,
    TotalComplaint: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch complaint summary count
  const fetchComplaintSummary = async () => {
    try {
      const response = await fetch(
        'https://wmsapi.kdsgroup.co.in/api/Dashboard/GetComplaintSummaryCountForCallCenterDashboard',
        {
          method: 'GET',
          headers: { accept: '*/*' }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch complaint summary');
      }
      
      const result: ApiResponse<ComplaintSummaryData> = await response.json();
      
      if (result.Status && result.Data) {
        setSummaryData(result.Data);
      } else {
        throw new Error(result.Message || 'Failed to load data');
      }
    } catch (err) {
      console.error('Error fetching complaint summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to load complaint summary');
    }
  };

  // Fetch complaint status summary
  const fetchComplaintStatusSummary = async () => {
    try {
      const response = await fetch(
        'https://wmsapi.kdsgroup.co.in/api/Dashboard/GetComplaintStatusSummaryCountForCallCenterDashboard',
        {
          method: 'GET',
          headers: { accept: '*/*' }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch complaint status');
      }
      
      const result: ApiResponse<ComplaintStatusData> = await response.json();
      
      if (result.Status && result.Data) {
        setStatusData(result.Data);
      } else {
        throw new Error(result.Message || 'Failed to load data');
      }
    } catch (err) {
      console.error('Error fetching complaint status:', err);
      setError(err instanceof Error ? err.message : 'Failed to load complaint status');
    }
  };

  // Load all data
  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      await Promise.all([
        fetchComplaintSummary(),
        fetchComplaintStatusSummary()
      ]);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Prepare chart data
  const chartData = [
    { 
      name: "Resolved", 
      value: summaryData.ResolvedComplaint,
      color: "#10B981"
    },
    { 
      name: "Pending", 
      value: summaryData.PendingComplaint,
      color: "#F59E0B"
    },
    { 
      name: "Total", 
      value: summaryData.TotalComplaint,
      color: "#3B82F6"
    }
  ];

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{payload[0].payload.name}</p>
          <p className="text-lg font-bold" style={{ color: payload[0].payload.color }}>
            {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-blue-800">Call Center Dashboard</h1>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="text-red-700">{error}</div>
          <button 
            onClick={() => setError('')}
            className="ml-auto text-red-500 hover:text-red-700 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-md p-8 text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <div className="text-gray-600">Loading dashboard data...</div>
        </div>
      )}

      {/* Stats Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-md p-6 text-center transform transition-all hover:scale-105">
              <h2 className="text-gray-600 text-sm font-medium mb-2">Total Complaints</h2>
              <p className="text-4xl font-bold text-blue-600">{summaryData.TotalComplaint}</p>
              <div className="mt-2 text-xs text-gray-500">All registered complaints</div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md p-6 text-center transform transition-all hover:scale-105">
              <h2 className="text-gray-600 text-sm font-medium mb-2">Resolved</h2>
              <p className="text-4xl font-bold text-green-600">{summaryData.ResolvedComplaint}</p>
              <div className="mt-2 text-xs text-gray-500">
                {summaryData.TotalComplaint > 0 
                  ? `${((summaryData.ResolvedComplaint / summaryData.TotalComplaint) * 100).toFixed(1)}% resolution rate`
                  : 'No data'
                }
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md p-6 text-center transform transition-all hover:scale-105">
              <h2 className="text-gray-600 text-sm font-medium mb-2">Pending</h2>
              <p className="text-4xl font-bold text-yellow-600">{summaryData.PendingComplaint}</p>
              <div className="mt-2 text-xs text-gray-500">
                {summaryData.TotalComplaint > 0 
                  ? `${((summaryData.PendingComplaint / summaryData.TotalComplaint) * 100).toFixed(1)}% pending`
                  : 'No data'
                }
              </div>
            </div>
          </div>

          {/* Status Summary Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Current Status Summary</h3>
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-xl px-4 py-2">
                <span className="text-sm text-gray-600">Status Code:</span>
                <span className="ml-2 font-bold text-blue-600">{statusData.Status}</span>
              </div>
              <div className="bg-white rounded-xl px-4 py-2">
                <span className="text-sm text-gray-600">Total Count:</span>
                <span className="ml-2 font-bold text-blue-600">{statusData.TotalComplaint}</span>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Complaint Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  tick={{ fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Total Registered Complaints</span>
                <span className="font-semibold text-gray-800">{summaryData.TotalComplaint}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Successfully Resolved</span>
                <span className="font-semibold text-green-600">{summaryData.ResolvedComplaint}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Awaiting Resolution</span>
                <span className="font-semibold text-yellow-600">{summaryData.PendingComplaint}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Resolution Rate</span>
                <span className="font-semibold text-blue-600">
                  {summaryData.TotalComplaint > 0 
                    ? `${((summaryData.ResolvedComplaint / summaryData.TotalComplaint) * 100).toFixed(1)}%`
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center text-sm text-gray-500">
            Last updated: {new Date().toLocaleString('en-IN')}
          </div>
        </>
      )}
    </div>
  );
};

export default CallCenterDashboard;