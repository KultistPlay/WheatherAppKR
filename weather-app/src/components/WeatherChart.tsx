import type { HourPoint } from '../types';

interface WeatherChartProps {
  data: HourPoint[];
}

function WeatherChart({ data }: WeatherChartProps) {
  if (data.length < 2) return null;

  const W = 500;
  const H = 190;
  const padX = 34;
  const padTop = 34;
  const padBottom = 46;
  const chartW = W - padX * 2;
  const chartH = H - padTop - padBottom;

  const temps = data.map((d) => d.temp);
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const range = maxT - minT || 1;

  const pts = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * chartW,
    y: padTop + (1 - (d.temp - minT) / range) * chartH,
    ...d,
  }));

  let path = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  const areaPath = `${path} L ${pts[pts.length - 1].x} ${padTop + chartH} L ${pts[0].x} ${padTop + chartH} Z`;

  const labelIndices: number[] = [];
  const step = Math.max(1, Math.floor((data.length - 1) / 4));
  for (let i = 0; i < data.length; i += step) labelIndices.push(i);
  if (labelIndices[labelIndices.length - 1] !== data.length - 1) {
    labelIndices.push(data.length - 1);
  }

  return (
    <svg className="weather-chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255, 252, 220, 0.45)" />
          <stop offset="100%" stopColor="rgba(255, 252, 220, 0)" />
        </linearGradient>
        <linearGradient id="tempStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff5b8" />
          <stop offset="100%" stopColor="#ffe680" />
        </linearGradient>
      </defs>

      {[0, 0.5, 1].map((f, i) => (
        <line key={i} x1={padX} x2={W - padX} y1={padTop + f * chartH} y2={padTop + f * chartH}
          stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" strokeDasharray="3 5" />
      ))}

      <path d={areaPath} fill="url(#tempFill)" />
      <path d={path} fill="none" stroke="url(#tempStroke)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#fff5b8" stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
      ))}

      <text x={padX - 8} y={padTop + 4} textAnchor="end" className="chart-axis-text">{Math.round(maxT)}°</text>
      <text x={padX - 8} y={padTop + chartH + 4} textAnchor="end" className="chart-axis-text">{Math.round(minT)}°</text>

      {labelIndices.map((idx) => {
        const p = pts[idx];
        const label = new Date(data[idx].time * 1000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        return <text key={idx} x={p.x} y={H - padBottom + 26} textAnchor="middle" className="chart-axis-text">{label}</text>;
      })}

      {pts.map((p, i) => (
        <text key={`t${i}`} x={p.x} y={p.y - 12} textAnchor="middle" className="chart-temp-text">{p.temp}°</text>
      ))}
    </svg>
  );
}

interface PrecipitationChartProps {
  data: HourPoint[];
}

export function PrecipitationChart({ data }: PrecipitationChartProps) {
  if (data.length < 2) return null;

  const W = 500;
  const H = 150;
  const padX = 34;
  const padTop = 34;
  const padBottom = 46;
  const chartW = W - padX * 2;
  const chartH = H - padTop - padBottom;
  const slotW = chartW / data.length;
  const barW = Math.max(6, slotW * 0.5);

  const labelIndices: number[] = [];
  const step = Math.max(1, Math.floor((data.length - 1) / 4));
  for (let i = 0; i < data.length; i += step) labelIndices.push(i);
  if (labelIndices[labelIndices.length - 1] !== data.length - 1) {
    labelIndices.push(data.length - 1);
  }

  return (
    <svg className="weather-chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="rainBar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8ec5ff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#5b8dee" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {[0, 0.5, 1].map((f, i) => (
        <line key={i} x1={padX} x2={W - padX} y1={padTop + (1 - f) * chartH} y2={padTop + (1 - f) * chartH}
          stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" strokeDasharray="3 5" />
      ))}

      {data.map((d, i) => {
        const cx = padX + slotW * i + slotW / 2;
        const pct = Math.max(0, Math.min(1, d.pop));
        const barH = pct * chartH;
        const y = padTop + chartH - barH;
        return (
          <g key={i}>
            <rect x={cx - barW / 2} y={padTop} width={barW} height={chartH} rx={4} fill="rgba(255, 255, 255, 0.05)" />
            <rect x={cx - barW / 2} y={y} width={barW} height={barH} rx={4} fill="url(#rainBar)"
              style={{
                transformOrigin: `${cx}px ${padTop + chartH}px`,
                animation: `barGrow 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${0.05 * i}s both`,
              }}
            />
            {pct > 0.05 && (
              <text x={cx} y={y - 6} textAnchor="middle" className="chart-rain-text">{Math.round(pct * 100)}%</text>
            )}
          </g>
        );
      })}

      <text x={padX - 8} y={padTop + 4} textAnchor="end" className="chart-axis-text">100%</text>
      <text x={padX - 8} y={padTop + chartH / 2 + 4} textAnchor="end" className="chart-axis-text">50%</text>
      <text x={padX - 8} y={padTop + chartH + 4} textAnchor="end" className="chart-axis-text">0%</text>

      {labelIndices.map((idx) => {
        const cx = padX + slotW * idx + slotW / 2;
        const label = new Date(data[idx].time * 1000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        return <text key={idx} x={cx} y={H - padBottom + 26} textAnchor="middle" className="chart-axis-text">{label}</text>;
      })}
    </svg>
  );
}

export default WeatherChart;