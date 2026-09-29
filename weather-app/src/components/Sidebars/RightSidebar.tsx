import type { WeatherData } from '../../types';

interface Props {
  data: WeatherData;
}

const getWindDirection = (deg: number): string => {
  const dirs = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
  return dirs[Math.round(deg / 45) % 8];
};

const getAqiLabel = (aqi: number): string => {
  switch (aqi) {
    case 1: return 'Хорошо';
    case 2: return 'Норма';
    case 3: return 'Средне';
    case 4: return 'Плохо';
    case 5: return 'Оч. плохо';
    default: return '—';
  }
};

function RightSidebar({ data }: Props) {
  return (
    <aside className="right-sidebar">
      <div className="side-card compass-card">
        <div className="side-card-title">Ветер</div>
        <div className="compass-wrap">
          <svg className="compass-svg" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <circle cx="70" cy="70" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <text x="70" y="20" textAnchor="middle" className="compass-cardinal">С</text>
            <text x="70" y="128" textAnchor="middle" className="compass-cardinal">Ю</text>
            <text x="16" y="74" textAnchor="middle" className="compass-cardinal">З</text>
            <text x="124" y="74" textAnchor="middle" className="compass-cardinal">В</text>
            <g style={{ transform: `rotate(${data.windDeg}deg)`, transformOrigin: '70px 70px' }}>
              <path d="M 70 20 L 60 45 L 70 40 L 80 45 Z" fill="#a7d2ff" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
            </g>
            <circle cx="70" cy="70" r="4" fill="#fff" />
          </svg>
        </div>
        <div className="compass-info">
          <div className="compass-speed">{data.windSpeed} м/с</div>
          <div className="compass-dir">{getWindDirection(data.windDeg)} · {data.windDeg}°</div>
          {data.windGust !== null && (
            <div className="compass-gust">порывы до {data.windGust} м/с</div>
          )}
        </div>
      </div>

      <div className="side-card metrics-card">
        <div className="side-card-title">Ещё</div>
        <div className="metrics-grid">
          <div className="metric-cell">
            <span className="metric-label">Видимость</span>
            <span className="metric-value">
              {data.visibility >= 1000 ? `${(data.visibility / 1000).toFixed(1)} км` : `${data.visibility} м`}
            </span>
          </div>
          <div className="metric-cell">
            <span className="metric-label">Облачность</span>
            <span className="metric-value">{data.clouds}%</span>
          </div>
          <div className="metric-cell">
            <span className="metric-label">Т. росы</span>
            <span className="metric-value">{data.dewPoint !== null ? `${Math.round(data.dewPoint)}°` : '—'}</span>
          </div>
          <div className="metric-cell">
            <span className="metric-label">Давление</span>
            <span className="metric-value">{Math.round(data.pressure * 0.750062)} мм</span>
          </div>
        </div>
      </div>

      {data.aqi !== null && (
        <div className={`side-card aqi-card aqi-${data.aqi}`}>
          <div className="side-card-title">Воздух</div>
          <div className="aqi-value">{data.aqi}</div>
          <div className="aqi-label">{getAqiLabel(data.aqi)}</div>
          <div className="aqi-bar">
            <div className="aqi-bar-fill" style={{ width: `${(data.aqi / 5) * 100}%` }} />
          </div>
        </div>
      )}
    </aside>
  );
}

export default RightSidebar;    