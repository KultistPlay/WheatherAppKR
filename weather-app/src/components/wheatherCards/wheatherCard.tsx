import { useTilt } from '../../hooks/useTilt';
import WeatherChart, { PrecipitationChart } from '../WeatherChart';
import type { WeatherData } from '../../types';

interface WeatherCardProps {
  data: WeatherData;
}

function WeatherCard({ data }: WeatherCardProps) {
  const tilt = useTilt<HTMLDivElement>();

  return (
    <div className="weather-block">
      <div className="weather-card" ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}>
        <h2 className="card-layer-2">{data.city}</h2>
        <img src={`https://openweathermap.org/img/wn/${data.icon}@4x.png`} alt={data.description}
          className="weather-icon card-layer-3" />
        <p className="temperature card-layer-3">{data.temperature}°C</p>
        <p className="description card-layer-2">{data.description}</p>
      </div>

      <div className="weather-extras">
        <div className="extra-plate">
          <span className="extra-label">Влажность</span>
          <span className="extra-value">{data.humidity}%</span>
        </div>
        <div className="extra-plate">
          <span className="extra-label">Ветер</span>
          <span className="extra-value">{data.windSpeed} м/с</span>
        </div>
        <div className="extra-plate">
          <span className="extra-label">Давление</span>
          <span className="extra-value">{Math.round(data.pressure * 0.750062)} мм</span>
        </div>
        <div className="extra-plate">
          <span className="extra-label">УФ-индекс</span>
          <span className="extra-value">{data.uvIndex !== null ? data.uvIndex : '—'}</span>
        </div>
      </div>

      {data.hourly && data.hourly.length > 1 ? (
        <>
          <div className="weather-chart-container">
            <div className="chart-title">Температура · 24 часа</div>
            <WeatherChart data={data.hourly} />
          </div>
          <div className="weather-chart-container">
            <div className="chart-title">Вероятность осадков · 24 часа</div>
            <PrecipitationChart data={data.hourly} />
          </div>
        </>
      ) : (
        <div className="weather-chart-empty">Прогноз на сутки недоступен</div>
      )}
    </div>
  );
}

export default WeatherCard;