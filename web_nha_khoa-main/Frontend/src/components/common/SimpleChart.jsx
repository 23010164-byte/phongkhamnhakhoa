import './SimpleChart.css';

/**
 * Simple Bar Chart using SVG
 * @param {Array} data - [{ label, value }]
 * @param {string} title
 * @param {string} color
 * @param {string} [unit]
 */
export function BarChart({ data = [], title, color = '#2563eb', unit = '' }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const width = 520;
  const height = 200;
  const paddingLeft = 50;
  const paddingBottom = 36;
  const paddingTop = 16;
  const chartW = width - paddingLeft - 16;
  const chartH = height - paddingBottom - paddingTop;
  const barCount = data.length;
  const barGap = 8;
  const barWidth = barCount > 0 ? (chartW - barGap * (barCount - 1)) / barCount : 20;

  return (
    <div className="simple-chart">
      {title && <div className="simple-chart__title">{title}</div>}
      <svg viewBox={`0 0 ${width} ${height}`} className="simple-chart__svg">
        {/* Y axis grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = paddingTop + chartH * (1 - frac);
          const val = Math.round(max * frac);
          return (
            <g key={frac}>
              <line
                x1={paddingLeft}
                x2={width - 16}
                y1={y}
                y2={y}
                stroke="#e5e7eb"
                strokeDasharray="3 3"
              />
              <text x={paddingLeft - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
                {Number.isInteger(val) ? val : val.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barH = (d.value / max) * chartH;
          const x = paddingLeft + i * (barWidth + barGap);
          const y = paddingTop + chartH - barH;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                fill={color}
                rx={3}
                opacity={0.85}
              />
              {d.value > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 4}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#374151"
                >
                  {Number.isInteger(d.value) ? d.value : d.value.toFixed(1)}{unit}
                </text>
              )}
              <text
                x={x + barWidth / 2}
                y={height - 6}
                textAnchor="middle"
                fontSize="9"
                fill="#6b7280"
              >
                {data.length <= 7 || i % Math.ceil(data.length / 5) === 0 ? d.label : ''}
              </text>
            </g>
          );
        })}

        {/* Y axis */}
        <line
          x1={paddingLeft}
          x2={paddingLeft}
          y1={paddingTop}
          y2={paddingTop + chartH}
          stroke="#d1d5db"
        />
      </svg>
    </div>
  );
}

/**
 * Simple Line Chart using SVG
 * @param {Array} data - [{ label, value }]
 * @param {string} title
 * @param {string} color
 * @param {string} [unit]
 */
export function LineChart({ data = [], title, color = '#10b981', unit = '' }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const width = 520;
  const height = 200;
  const paddingLeft = 50;
  const paddingBottom = 36;
  const paddingTop = 16;
  const chartW = width - paddingLeft - 16;
  const chartH = height - paddingBottom - paddingTop;
  const n = data.length;

  const getX = (i) => paddingLeft + (i / Math.max(n - 1, 1)) * chartW;
  const getY = (v) => paddingTop + chartH - (v / max) * chartH;

  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
  const areaPoints =
    n > 0
      ? `${paddingLeft},${paddingTop + chartH} ${points} ${getX(n - 1)},${paddingTop + chartH}`
      : '';

  return (
    <div className="simple-chart">
      {title && <div className="simple-chart__title">{title}</div>}
      <svg viewBox={`0 0 ${width} ${height}`} className="simple-chart__svg">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = paddingTop + chartH * (1 - frac);
          return (
            <g key={frac}>
              <line x1={paddingLeft} x2={width - 16} y1={y} y2={y} stroke="#e5e7eb" strokeDasharray="3 3" />
              <text x={paddingLeft - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
                {Number.isInteger(max * frac) ? (max * frac) : (max * frac).toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        {n > 1 && (
          <polygon points={areaPoints} fill={color} opacity={0.1} />
        )}

        {/* Line */}
        {n > 1 && (
          <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        )}

        {/* Dots + labels */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={getX(i)} cy={getY(d.value)} r={4} fill={color} />
            <text
              x={getX(i)}
              y={paddingTop + chartH + 16}
              textAnchor="middle"
              fontSize="9"
              fill="#6b7280"
            >
              {data.length <= 7 || i % Math.ceil(data.length / 5) === 0 ? d.label : ''}
            </text>
            {d.value > 0 && (
              <text
                x={getX(i)}
                y={getY(d.value) - 8}
                textAnchor="middle"
                fontSize="9"
                fill="#374151"
              >
                {Number.isInteger(d.value) ? d.value : d.value.toFixed(1)}{unit}
              </text>
            )}
          </g>
        ))}

        <line x1={paddingLeft} x2={paddingLeft} y1={paddingTop} y2={paddingTop + chartH} stroke="#d1d5db" />
      </svg>
    </div>
  );
}
