import { useState, useEffect, useRef } from 'react';
import WeatherCard from './components/wheatherCards/wheatherCard';
import WeatherEffects from './components/WeatherEffects';
import LeftSidebar from './components/Sidebars/LeftSidebar';
import RightSidebar from './components/Sidebars/RightSidebar';
import { useTilt } from './hooks/useTilt';
import type { CitySuggestion, WeatherData, HourPoint, DailyForecast } from './types';
import './App.css';

const API_KEY = '2f074fd2995eed3456285ee96a418e28';

function getSeason(): { icon: string; label: string } {
  const month = new Date().getMonth();
  if (month === 11 || month <= 1) return { icon: '❄️', label: 'Зима' };
  if (month >= 2 && month <= 4) return { icon: '🍃', label: 'Весна' };
  if (month >= 5 && month <= 7) return { icon: '☀️', label: 'Лето' };
  return { icon: '🍂', label: 'Осень' };
}

function App() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('theme-default');
  const [topHover, setTopHover] = useState(false);

  const dropdownRef = useRef<HTMLUListElement>(null);
  const searchTilt = useTilt<HTMLDivElement>();
  const hideTimer = useRef<number | null>(null);
  const season = getSeason();

  const showSearch =
    topHover || suggestions.length > 0 || query.length > 0 || (!weather && !loading && !error);

  const cancelHide = () => {
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  const scheduleHide = () => {
    cancelHide();
    hideTimer.current = window.setTimeout(() => {
      setTopHover(false);
      hideTimer.current = null;
    }, 250);
  };

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
        );
        const data = await res.json();
        setSuggestions(data && data.length > 0 ? data : []);
      } catch (err) {
        console.error('Ошибка поиска городов', err);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const fetchWeather = async (city: CitySuggestion) => {
    setLoading(true);
    setError('');
    setQuery(`${city.name}${city.state ? `, ${city.state}` : ''}, ${city.country}`);
    setSuggestions([]);

    try {
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric&lang=ru`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric&lang=ru`),
      ]);

      if (!weatherRes.ok) throw new Error('Ошибка API');
      const data = await weatherRes.json();

      let forecastData: { list?: { dt: number; main: { temp: number }; weather: { icon: string; description: string }[]; pop?: number }[] } = { list: [] };
      if (forecastRes.ok) forecastData = await forecastRes.json();

      let uvIndex: number | null = null;
      try {
        const uvRes = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}`);
        if (uvRes.ok) {
          const uvData = await uvRes.json();
          if (typeof uvData.value === 'number') uvIndex = Math.round(uvData.value * 10) / 10;
        }
      } catch {}

      let aqi: number | null = null;
      try {
        const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}`);
        if (aqiRes.ok) {
          const aqiData = await aqiRes.json();
          aqi = aqiData?.list?.[0]?.main?.aqi ?? null;
        }
      } catch {}

      const tz = data.timezone ?? 0;
      const currentPop = typeof data.pop === 'number' ? data.pop : 0;

      const hourly: HourPoint[] = [
        { time: data.dt, temp: Math.round(data.main.temp), pop: currentPop },
      ];
      (forecastData.list || []).slice(0, 8).forEach((item) => {
        hourly.push({
          time: item.dt,
          temp: Math.round(item.main.temp),
          pop: typeof item.pop === 'number' ? item.pop : 0,
        });
      });

      // Группировка по локальной дате в городе
      const dailyMap: Record<string, DailyForecast> = {};
      (forecastData.list || []).forEach((item) => {
        const localDate = new Date((item.dt + tz) * 1000);
        const key = localDate.toISOString().slice(0, 10);
        if (!dailyMap[key]) {
          dailyMap[key] = {
            date: item.dt,
            min: item.main.temp,
            max: item.main.temp,
            icon: item.weather[0].icon,
            description: item.weather[0].description,
            pop: item.pop ?? 0,
          };
        } else {
          dailyMap[key].min = Math.min(dailyMap[key].min, item.main.temp);
          dailyMap[key].max = Math.max(dailyMap[key].max, item.main.temp);
          const h = localDate.getUTCHours();
          if (h >= 11 && h <= 14) {
            dailyMap[key].icon = item.weather[0].icon;
            dailyMap[key].description = item.weather[0].description;
          }
          dailyMap[key].pop = Math.max(dailyMap[key].pop, item.pop ?? 0);
        }
      });
      const daily = Object.values(dailyMap).slice(0, 5);

      const weatherInfo: WeatherData = {
        city: data.name,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        main: data.weather[0].main,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        windDeg: data.wind.deg ?? 0,
        windGust: typeof data.wind.gust === 'number' ? data.wind.gust : null,
        pressure: data.main.pressure,
        visibility: data.visibility ?? 0,
        clouds: data.clouds?.all ?? 0,
        dewPoint: typeof data.main.dew_point === 'number' ? data.main.dew_point : null,
        uvIndex,
        aqi,
        hourly,
        daily,
        dt: data.dt,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        timezone: tz,
      };

      setWeather(weatherInfo);
      updateTheme(weatherInfo);
      setTopHover(false);
      setQuery('');
    } catch (err) {
      setError('Не удалось загрузить погоду. Проверь ключ API или попробуй позже.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const updateTheme = (data: WeatherData) => {
    const isDay = data.dt > data.sunrise && data.dt < data.sunset;
    const month = new Date().getMonth();
    let seasonKey = 'spring';
    if (month === 11 || month <= 1) seasonKey = 'winter';
    else if (month >= 2 && month <= 4) seasonKey = 'spring';
    else if (month >= 5 && month <= 7) seasonKey = 'summer';
    else seasonKey = 'autumn';
    const mainWeather = data.main.toLowerCase();
    const newTheme = isDay ? `theme-day-${mainWeather}-${seasonKey}` : `theme-night-${mainWeather}-any`;
    setTheme(newTheme);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`app ${theme}`}>
      {weather && <WeatherEffects main={weather.main} />}

      {weather && (
        <div className="season-badge">
          <span className="season-icon">{season.icon}</span>
          <span className="season-label">{season.label}</span>
        </div>
      )}

      {weather && <LeftSidebar data={weather} />}
      {weather && <RightSidebar data={weather} />}

      <div className="content-wrapper">
        <div className="top-zone"
          onMouseEnter={() => { cancelHide(); setTopHover(true); }}
          onMouseLeave={() => { if (query.length === 0 && suggestions.length === 0) scheduleHide(); }}
        >
          <h1>Погода</h1>
          <div className="search-wrapper" ref={searchTilt.ref}
            onMouseMove={searchTilt.onMouseMove}
            onMouseLeave={searchTilt.onMouseLeave}>
            <div className={`search-container ${showSearch ? '' : 'search-hidden'}`}>
              <input type="text" placeholder="Введи город (например, Moscow)" value={query}
                onChange={(e) => setQuery(e.target.value)} className="search-input" />
            </div>
            {suggestions.length > 0 && showSearch && (
              <ul className="suggestions-list" ref={dropdownRef}>
                {suggestions.map((city, index) => (
                  <li key={index} onClick={() => fetchWeather(city)}>
                    {city.name} {city.state ? `, ${city.state}` : ''}, {city.country}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {loading && <p className="status">Загрузка...</p>}
        {error && <p className="status error">{error}</p>}

        {weather && !loading && (
          <WeatherCard key={`${weather.city}-${weather.dt}`} data={weather} />
        )}
      </div>
    </div>
  );
}

export default App;