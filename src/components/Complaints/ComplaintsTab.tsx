// components/Complaints/ComplaintsTab.tsx - Complaints management and tracking tab

import React from 'react';
import { MessageSquare, Download } from 'lucide-react';
import * as Types from '../../types';

interface ComplaintsTabProps {
  complaintsData: Types.ComplaintData[];
  selectedLocationName: string;
  onExportCSV: (data: any[], filename: string) => void;
  // Filtering function should be passed from parent
  filterComplaintsByLocation: (data: Types.ComplaintData[]) => Types.ComplaintData[];
}

export const ComplaintsTab: React.FC<ComplaintsTabProps> = ({
  complaintsData,
  selectedLocationName,
  onExportCSV,
  filterComplaintsByLocation
}) => {
  const filteredComplaints = filterComplaintsByLocation(complaintsData);

  if (complaintsData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-600 mb-2">No Complaint Data</h4>
          <p className="text-gray-500">
            No complaint records found for the selected criteria. 
            Try adjusting your filters or check if complaints have been registered.
          </p>
        </div>
      </div>
    );
  }

  // Calculate complaint statistics
  const totalComplaints = filteredComplaints.length;
  const pendingComplaints = filteredComplaints.filter(c => c.Status === 0).length;
  const resolvedComplaints = filteredComplaints.filter(c => c.Status === 1).length;
  const closedComplaints = filteredComplaints.filter(c => c.Status === 2).length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-purple-600" />
          Complaint Management
        </h3>
        <button 
          onClick={() => onExportCSV(filteredComplaints, 'complaints_data')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          disabled={filteredComplaints.length === 0}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Complaint Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {totalComplaints}
          </div>
          <div className="text-sm text-blue-800">Total Complaints</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {pendingComplaints}
          </div>
          <div className="text-sm text-yellow-800">Pending</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {resolvedComplaints}
          </div>
          <div className="text-sm text-green-800">Resolved</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-600">
            {closedComplaints}
          </div>
          <div className="text-sm text-gray-800">Closed</div>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredComplaints.length} complaints for {selectedLocationName}
      </div>

      {/* Complaints Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Complaint ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">District</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Block</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">GP</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Village</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Beneficiary</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredComplaints.slice(0, 50).map((complaint, index) => (
              <tr key={complaint.ComplaintID} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">#{complaint.ComplaintID}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{complaint.District}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{complaint.Block}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{complaint.GramPanchayat}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{complaint.Village}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{complaint.BeneficiaryName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{complaint.Contact}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <div>
                    <div className="font-medium">{complaint.Category}</div>
                    {complaint.Landmark && (
                      <div className="text-xs text-gray-500">📍 {complaint.Landmark}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    complaint.Status === 0 ? 'bg-yellow-100 text-yellow-800' :
                    complaint.Status === 1 ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {complaint.Status === 0 ? 'Pending' : 
                     complaint.Status === 1 ? 'Resolved' : 'Closed'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Info */}
      {filteredComplaints.length > 50 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing first 50 records out of {filteredComplaints.length} total complaints.
          <button 
            onClick={() => onExportCSV(filteredComplaints, 'all_complaints')}
            className="ml-2 text-blue-600 hover:text-blue-800 underline"
          >
            Export all records
          </button>
        </div>
      )}
    </div>
  );
};