import { useEffect, useState } from "react";
import { format } from "date-fns";
import axios from "axios";

// Define interfaces for the data structures
interface FillingRoaster {
  gpName: string;
  ohtName: string;
  inletValveStatus: string;
  outletValveStatus: string;
  fillingTime: string;
  filledBy: string;
}

interface DistributionRoaster {
  gpName: string;
  distributionArea: string;
  valveStatus: string;
  distributionTime: string;
  distributedBy: string;
}

const ViewRoaster = () => {
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [fillingData, setFillingData] = useState<FillingRoaster[]>([]);
  const [distributionData, setDistributionData] = useState<DistributionRoaster[]>([]);

  const fetchRoasterData = async () => {
    try {
      const [fillingRes, distributionRes] = await Promise.all([
        axios.get<FillingRoaster[]>(`https://wmsapi.kdsgroup.co.in/api/FillingRoaster/ViewFillingRoaster?date=${selectedDate}`),
        axios.get<DistributionRoaster[]>(`https://wmsapi.kdsgroup.co.in/api/DistributionRoaster/ViewDistributionRoaster?date=${selectedDate}`)
      ]);
      setFillingData(fillingRes.data || []);
      setDistributionData(distributionRes.data || []);
    } catch (error) {
      console.error("Error fetching roaster data", error);
    }
  };

  useEffect(() => {
    fetchRoasterData();
  }, [selectedDate]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">View Pump House Roaster</h1>
      <p className="text-sm text-gray-900 mb-6">
        View the filled roasters for any selected date. This data is view-only and cannot be changed.
      </p>

      <div className="flex gap-4 mb-4">
        <input
          type="date"
          className="p-2 border rounded"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Filled OHT Roaster Table */}
      <h2 className="text-xl font-semibold mb-2">Filled OHT Roaster (Filling)</h2>
      <table className="w-full text-sm border border-collapse mb-8">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="border p-2">GP Name</th>
            <th className="border p-2">OHT Name</th>
            <th className="border p-2">Inlet Valve Status</th>
            <th className="border p-2">Outlet Valve Status</th>
            <th className="border p-2">Filling Time</th>
            <th className="border p-2">Filled By</th>
          </tr>
        </thead>
        <tbody>
          {fillingData.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center p-2">No data available</td>
            </tr>
          ) : (
            fillingData.map((item, index) => (
              <tr key={index} className="bg-white">
                <td className="border p-2">{item.gpName}</td>
                <td className="border p-2">{item.ohtName}</td>
                <td className="border p-2">{item.inletValveStatus}</td>
                <td className="border p-2">{item.outletValveStatus}</td>
                <td className="border p-2">{item.fillingTime}</td>
                <td className="border p-2">{item.filledBy}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Filled Distribution Roaster Table */}
      <h2 className="text-xl font-semibold mb-2">Filled Distribution Roaster</h2>
      <table className="w-full text-sm border border-collapse">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="border p-2">GP Name</th>
            <th className="border p-2">Distribution Area</th>
            <th className="border p-2">Valve Status</th>
            <th className="border p-2">Distribution Time</th>
            <th className="border p-2">Distributed By</th>
          </tr>
        </thead>
        <tbody>
          {distributionData.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center p-2">No data available</td>
            </tr>
          ) : (
            distributionData.map((item, index) => (
              <tr key={index} className="bg-white">
                <td className="border p-2">{item.gpName}</td>
                <td className="border p-2">{item.distributionArea}</td>
                <td className="border p-2">{item.valveStatus}</td>
                <td className="border p-2">{item.distributionTime}</td>
                <td className="border p-2">{item.distributedBy}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ViewRoaster;
