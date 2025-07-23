import React, { useState } from 'react';

const WaterGauge = ({ totalDemand, totalConsumed, totalLoss }) => {
  const [tooltip, setTooltip] = useState(null);
  const [selectedRange, setSelectedRange] = useState('This Week');

  const width = 300;
  const height = 180;
  const radius = 110;
  const strokeWidth = 18;
  const centerX = width / 2;
  const centerY = height;

  const consumedPercent = totalConsumed / totalDemand;
  const lossPercent = totalLoss / totalDemand;
  const distributedPercent = ((totalConsumed + totalLoss) / totalDemand) * 100;

  const consumedAngle = consumedPercent * 180;
  const lossAngle = lossPercent * 180;

  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const angleRad = (Math.PI / 180) * angleDeg;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy - r * Math.sin(angleRad),
    };
  };

  const arcPath = (startAngle, endAngle) => {
    const start = polarToCartesian(centerX, centerY, radius, 180 - startAngle);
    const end = polarToCartesian(centerX, centerY, radius, 180 - endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${start.x} ${start.y}
      A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}
    `;
  };

  return (
    <div className="text-white w-full max-w-5xl mx-auto py-8 px-6 rounded-2xl bg-gradient-to-br from-blue-800 via-blue-700 to-purple-800 shadow-xl">

      {/* Heading Row */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-2xl font-semibold">Water Distribution Summary</h2>
        <select
  className="bg-transparent text-white font-bold border border-white px-3 py-1 rounded-full"
          value={selectedRange}
          onChange={(e) => setSelectedRange(e.target.value)}
        >
          <option className="text-black font-bold">This Week</option>
          <option className="text-black font-bold">Last Week</option>
          <option className="text-black font-bold">Last Month</option>
        </select>
      </div>

      {/* Gauge and Legend Block */}
      <div className="flex flex-col items-center gap-16">
        {/* Gauge Section */}
        <div className="relative">
          <svg width={width} height={height}>
            {/* Base Arc - White */}
            <path
              d={arcPath(0, 180)}
              stroke="#ffffff50"
              strokeWidth={strokeWidth}
              fill="none"
            />

            {/* Green Consumed */}
            {consumedPercent > 0 && (
              <path
                d={arcPath(0, consumedAngle)}
                stroke="#22C55E"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="butt"
                onMouseEnter={() => setTooltip('Water Consumed')}
                onMouseLeave={() => setTooltip(null)}
              />
            )}

            {/* Red Loss */}
            {lossPercent > 0 && (
              <path
                d={arcPath(consumedAngle, consumedAngle + lossAngle)}
                stroke="#EF4444"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="butt"
                onMouseEnter={() => setTooltip('Water Loss')}
                onMouseLeave={() => setTooltip(null)}
              />
            )}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-sm bg-white text-black px-2 py-1 rounded shadow">
              {tooltip}
            </div>
          )}

          {/* % and Fulfilled Text */}
          <div className="absolute top-[65%] left-1/2 -translate-x-1/2 text-center">
            <div className="text-3xl font-bold text-white">
              {Math.round(distributedPercent)}%
            </div>
            <div className="text-sm text-gray-400">Fulfilled</div>
          </div>
        </div>

        {/* Legend (below gauge) */}
        <div className="flex items-center justify-center gap-10 text-lg text-gray-300">
          <div><span className="text-white">Total Demand:</span> {totalDemand} KLD</div>
          <div><span className="text-green-400">Consumed:</span> {totalConsumed} KLD</div>
          <div><span className="text-red-400">Loss:</span> {totalLoss} KLD</div>
        </div>
      </div>
    </div>
  );
};

export default WaterGauge;
