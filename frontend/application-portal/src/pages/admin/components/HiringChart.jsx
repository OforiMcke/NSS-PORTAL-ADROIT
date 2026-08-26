import { chartColors } from "../hooks/useAdminDashboard";

export default function HiringChart({
  hiringData,
  maxValue,
  timeRange,
  onTimeRangeChange,
}) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Hiring Chart</h3>
        <select
          className="chart-filter"
          value={timeRange}
          onChange={(e) => onTimeRangeChange(Number(e.target.value))}
        >
          <option value={6}>Last 6 Months</option>
          <option value={10}>Last 10 Months</option>
          <option value={12}>Last 12 Months</option>
        </select>
      </div>
      <div className="bar-chart">
        {hiringData.map((d, i) => (
          <div className="bar-wrapper" key={i}>
            <div
              className="bar"
              style={{
                height: `${(d.value / maxValue) * 100}%`,
                background: chartColors[i % chartColors.length],
              }}
            />
            <span className="bar-label">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
