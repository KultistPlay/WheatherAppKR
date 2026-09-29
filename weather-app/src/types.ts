export interface CitySuggestion {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface HourPoint {
  time: number;
  temp: number;
  pop: number;
}

export interface DailyForecast {
  date: number;
  min: number;
  max: number;
  icon: string;
  description: string;
  pop: number;
}

export interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  icon: string;
  main: string;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  windGust: number | null;
  pressure: number;
  visibility: number;
  clouds: number;
  dewPoint: number | null;
  uvIndex: number | null;
  aqi: number | null;
  hourly: HourPoint[];
  daily: DailyForecast[];
  dt: number;
  sunrise: number;
  sunset: number;
  timezone: number;
}