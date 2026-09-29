import type { WeatherData } from '../../types';

interface Props {
  data: WeatherData;
}

const formatTime = (unix: number, tzOffsetSec: number) => {
  const d = new Date((unix + tzOffsetSec) * 1000);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
};

const getDayName = (unix: number, tzOffsetSec: number) => {
  const d = new Date((unix + tzOffsetSec) * 1000);
  return d.toLocaleDateString('ru-RU', { weekday: 'short', timeZone: 'UTC' });
};

function LeftSidebar({ data }: Props) {
  const total = data.sunset - data.sunrise || 1;
  const elapsed = data.dt - data.sunrise;
  const progress = Math.max(0, Math.min(1, elapsed / total));
  const isNight = data.dt < data.sunrise || data.dt > data.sunset;

  const p0 = { x: 20, y: 72 };
  const p1 = { x: 100, y: 8 };
  const p2 = { x: 180, y: 72 };
  const t = progress;
  const px = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
  const py = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;

  return (
    <aside className="left-sidebar">
      <div className="side-card sun-card">
        <div className="side-card-title">Солнце</div>
        <svg className="sun-arc-svg" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="sunArcGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffb86b" />
              <stop offset="100%" stopColor="#fff5b8" />
            </linearGradient>
          </defs>
          <path d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`} fill="none"
            stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 4" />
          <path d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`} fill="none"
            stroke="url(#sunArcGrad)" strokeWidth="2.5" strokeLinecap="round"
            pathLength={100} strokeDasharray={`${progress * 100} 100`} />
          <line x1="10" y1="72" x2="190" y2="72" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          {!isNight && (
            <circle cx={px} cy={py} r="6" fill="#fff5b8" stroke="rgba(255,200,100,0.6)" strokeWidth="2" />
          )}
          <text x={p0.x} y="92" textAnchor="middle" className="sun-arc-label">
            ↑ {formatTime(data.sunrise, data.timezone)}
          </text>
          <text x={p2.x} y="92" textAnchor="middle" className="sun-arc-label">
            ↓ {formatTime(data.sunset, data.timezone)}
          </text>
        </svg>
        <div className="sun-local-time">
          <div className="sun-local-value">{formatTime(data.dt, data.timezone)}</div>
          <div className="sun-local-label">местное время</div>
        </div>
      </div>

      {data.daily.length > 0 && (
        <div className="side-card forecast-card">
          <div className="side-card-title">Прогноз · 5 дней</div>
          <div className="forecast-list">
            {data.daily.map((d) => (
              <div key={d.date} className="forecast-row">
                <span className="forecast-day">{getDayName(d.date, data.timezone)}</span>
                <img src={`https://openweathermap.org/img/wn/${d.icon}@2x.png`} alt={d.description} className="forecast-icon" />
                <span className="forecast-temps">
                  <span className="forecast-max">{Math.round(d.max)}°</span>
                  <span className="forecast-min">{Math.round(d.min)}°</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

export default LeftSidebar;