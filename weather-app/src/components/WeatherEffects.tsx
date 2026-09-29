import React from 'react';

interface WeatherEffectsProps {
  main: string;
}

const WeatherEffects: React.FC<WeatherEffectsProps> = ({ main }) => {
  const weatherMain = main.toLowerCase();

  if (weatherMain === 'rain' || weatherMain === 'drizzle' || weatherMain === 'thunderstorm') {
    return (
      <div className="effect-container rain-container">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="rain-drop"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 0.4 + 0.4}s`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}
      </div>
    );
  }

  if (weatherMain === 'snow') {
    return (
      <div className="effect-container snow-container">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="snow-flake"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 5}s`,
              width: `${Math.random() * 6 + 3}px`,
              height: `${Math.random() * 6 + 3}px`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>
    );
  }

  if (weatherMain === 'clear') {
    return (
      <div className="effect-container">
        <div className="sun-glow" />
        <div className="sun-rays" />
      </div>
    );
  }

  return null;
};

export default WeatherEffects;