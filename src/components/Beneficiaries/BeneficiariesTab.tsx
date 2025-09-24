// components/Beneficiaries/BeneficiariesTab.tsx - Beneficiaries data management tab

import React, { useState, useEffect } from 'react';
import { Users, Download } from 'lucide-react';
import * as Types from '../../types';

interface BeneficiariesTabProps {
  beneficiariesData: Types.BeneficiaryData[];
  selectedLocationName: string;
  onExportCSV: (data: any[], filename: string) => void;
  // Filtering function should be passed from parent
  filterByLocation: (data: Types.BeneficiaryData[]) => Types.BeneficiaryData[];
}

export const BeneficiariesTab: React.FC<BeneficiariesTabProps> = ({
  beneficiariesData,
  selectedLocationName,
  onExportCSV,
  filterByLocation
}) => {
  const filteredBeneficiaries = filterByLocation(beneficiariesData);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredBeneficiaries.length, selectedLocationName]);

  // Calculate summary statistics
  const totalFamilyMembers = filteredBeneficiaries.reduce(
    (sum, b) => sum + Number(b.FamilyMembers ?? b.FamilyCount ?? b.familyCount ?? 0), 
    0
  );

  const totalActiveHouseholds = filteredBeneficiaries.filter(
    (b) => b.Status === 1 || b.Status === 'Active'
  ).length;

  // Pagination calculations
  const totalPages = Math.ceil(filteredBeneficiaries.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredBeneficiaries.slice(startIndex, endIndex);

  // Calculate total family members for current page only (after paginatedData is defined)
  const currentPageFamilyMembers = paginatedData.reduce(
    (sum, b) => sum + Number(b.FamilyMembers ?? b.FamilyCount ?? b.familyCount ?? 0), 
    0
  );

  // Pagination controls
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getVisiblePageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          Beneficiaries Data
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => onExportCSV(filteredBeneficiaries, 'beneficiaries')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            disabled={filteredBeneficiaries.length === 0}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Beneficiaries */}
        <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200">
          <div className="text-sm font-medium text-gray-600">Total Beneficiaries</div>
          <div className="text-2xl font-bold text-blue-700">
            {filteredBeneficiaries.length.toLocaleString()}
          </div>
        </div>

        {/* Total Family Members */}
        <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-200">
          <div className="text-sm font-medium text-gray-600">Total Family Members</div>
          <div className="text-2xl font-bold text-green-700">
            {totalFamilyMembers.toLocaleString()}
          </div>
        </div>

        {/* Total Active Households */}
        <div className="bg-orange-50 rounded-lg p-4 shadow-sm border border-orange-200">
          <div className="text-sm font-medium text-gray-600">Total Active Households</div>
          <div className="text-2xl font-bold text-orange-700">
            {totalActiveHouseholds.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Showing {startIndex + 1} to {Math.min(endIndex, filteredBeneficiaries.length)} of {filteredBeneficiaries.length} beneficiaries for {selectedLocationName}
      </div>

      {/* Pagination Controls - Top */}
      {filteredBeneficiaries.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center py-4 border-b border-gray-200 gap-4 mb-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Rows per page:
            </label>
            <select
              value={rowsPerPage}
              onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
            </select>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {getVisiblePageNumbers().map((page, index) => (
                  <span key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-1 text-sm text-gray-500">...</span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(page as number)}
                        className={`px-3 py-1 border rounded-md text-sm ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Beneficiaries Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">S.No.</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Beneficiary ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">District</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Block</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">GP</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Village</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Family Members</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.map((beneficiary, index) => (
              <tr key={beneficiary.BeneficiaryId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-sm text-gray-900">{startIndex + index + 1}</td>
                <td className="px-4 py-3 text-sm text-gray-900">#{beneficiary.BeneficiaryId}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{beneficiary.BeneficiaryName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{beneficiary.DistrictName || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{beneficiary.BlockName || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{beneficiary.GrampanchayatName || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{beneficiary.VillageName}</td>
                <td className="px-4 py-3 text-sm text-gray-600 text-center">
                  {beneficiary.FamilyMembers ?? beneficiary.FamilyCount ?? beneficiary.familyCount ?? 0}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    beneficiary.Status === 1 || beneficiary.Status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {beneficiary.Status === 1 || beneficiary.Status === 'Active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
            
            {/* Total Row */}
            {paginatedData.length > 0 && (
              <tr className="bg-blue-50 border-t-2 border-blue-200 font-semibold">
                <td className="px-4 py-3 text-sm text-blue-900" colSpan={7}>
                  Total (Current Page)
                </td>
                <td className="px-4 py-3 text-sm text-blue-900 text-center font-bold">
                  {currentPageFamilyMembers.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-blue-900">
                  {/* Empty cell for status column */}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls - Bottom */}
      {filteredBeneficiaries.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-200 gap-4 mt-4">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredBeneficiaries.length)} of {filteredBeneficiaries.length} entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              First
            </button>

            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {getVisiblePageNumbers().map((page, index) => (
                <span key={index}>
                  {page === '...' ? (
                    <span className="px-3 py-1 text-sm text-gray-500">...</span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(page as number)}
                      className={`px-3 py-1 border rounded-md text-sm ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </span>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>

            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Last
            </button>
          </div>
        </div>
      )}

      {filteredBeneficiaries.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium mb-2">No beneficiaries found</h3>
          <p className="text-sm">No data available for the selected location.</p>
        </div>
      )}
    </div>
  );
};