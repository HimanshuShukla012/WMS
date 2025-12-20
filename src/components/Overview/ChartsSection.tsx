// components/Overview/ChartsSection.tsx - Charts for overview section

import React from "react";
import { TrendingUp, IndianRupee } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import * as Types from "../../types";

interface ChartsSectionProps {
  beneficiaryTrend: Types.BeneficiaryTrendData[];
  feeCollectionTrend: Types.FeeCollectionTrendData[];
  onExportCSV: (data: any[], filename: string) => void;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  beneficiaryTrend,
  feeCollectionTrend,
  onExportCSV,
}) => {
  const beneficiaryChartRef = React.useRef<HTMLDivElement>(null);
  const feeCollectionChartRef = React.useRef<HTMLDivElement>(null);

  const exportChartToPDF = async (
    chartRef: React.RefObject<HTMLDivElement>,
    filename: string
  ) => {
    if (!chartRef.current) {
      alert("Chart not found");
      return;
    }

    try {
      // Hide export buttons by adding a class
      const exportButtons = chartRef.current.querySelectorAll(
        ".export-button-container"
      );
      exportButtons.forEach((btn) => {
        (btn as HTMLElement).style.display = "none";
      });

      // Wait for DOM update
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Capture the chart as canvas
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      // Show export buttons again
      exportButtons.forEach((btn) => {
        (btn as HTMLElement).style.display = "flex";
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add title
      pdf.setFontSize(16);
      pdf.text(filename.replace(/_/g, " ").toUpperCase(), 148, 15, {
        align: "center",
      });

      // Add chart image
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 10, 25, imgWidth, imgHeight);

      // Add timestamp
      pdf.setFontSize(10);
      pdf.text(
        `Generated on: ${new Date().toLocaleString("en-IN")}`,
        10,
        imgHeight + 35
      );

      // Save PDF
      pdf.save(`${filename}_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Error exporting chart:", error);

      // Ensure buttons are shown again even on error
      const exportButtons = chartRef.current?.querySelectorAll(
        ".export-button-container"
      );
      exportButtons?.forEach((btn) => {
        (btn as HTMLElement).style.display = "flex";
      });

      alert("Failed to export chart. Please try again.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
      {/* Beneficiary Growth Trend */}
      <div
        className="bg-white rounded-xl shadow-lg p-6"
        ref={beneficiaryChartRef}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Beneficiary Growth Trend
          </h4>
          <div className="flex gap-2 export-button-container">
            <button
              onClick={() =>
                exportChartToPDF(
                  beneficiaryChartRef,
                  "beneficiary_growth_trend"
                )
              }
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Export PDF
            </button>
          </div>
        </div>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={beneficiaryTrend}
              margin={{ top: 25, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Bar
                dataKey="total"
                fill="#3b82f6"
                name="Total Beneficiaries"
                barSize={40}
                radius={[6, 6, 0, 0]}
                label={{ position: "top", fontSize: 11, fill: "#1e40af" }}
              />
              <Bar
                dataKey="active"
                fill="#10b981"
                name="Active Beneficiaries"
                barSize={40}
                radius={[6, 6, 0, 0]}
                label={{ position: "top", fontSize: 11, fill: "#065f46" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fee Collection Trend */}
      {feeCollectionTrend.length > 0 && (
        <div
          className="bg-white rounded-xl shadow-lg p-6"
          ref={feeCollectionChartRef}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-green-600" />
              Fee Collection Trend
            </h4>
            <div className="flex gap-2 export-button-container">
              <button
                onClick={() =>
                  exportChartToPDF(
                    feeCollectionChartRef,
                    "fee_collection_trend"
                  )
                }
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Export PDF
              </button>
            </div>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={feeCollectionTrend}
                margin={{ top: 25, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `₹${Number(value).toLocaleString()}`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />

                {/* Proposed Water Fee Bar */}
                <Bar
                  dataKey="baseFee"
                  fill="#3b82f6"
                  name="Proposed Water Fee"
                  barSize={40}
                  radius={[6, 6, 0, 0]}
                  label={{
                    position: "top",
                    fontSize: 10,
                    fill: "#1e40af",
                    formatter: (value: number) => `₹${value.toLocaleString()}`,
                  }}
                />

                {/* Collected Water Fee Bar */}
                <Bar
                  dataKey="collected"
                  fill="#10b981"
                  name="Collected Water Fee"
                  barSize={40}
                  radius={[6, 6, 0, 0]}
                  label={{
                    position: "top",
                    fontSize: 10,
                    fill: "#065f46",
                    formatter: (value: number) => `₹${value.toLocaleString()}`,
                  }}
                />

                {/* Outstanding Water Fee Bar */}
                <Bar
                  dataKey="outstanding"
                  fill="#f97316"
                  name="Outstanding Water Fee"
                  barSize={40}
                  radius={[6, 6, 0, 0]}
                  label={{
                    position: "top",
                    fontSize: 10,
                    fill: "#9a3412",
                    formatter: (value: number) => `₹${value.toLocaleString()}`,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
