import { useState } from "react";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Search,
  Snowflake,
  Sun,
} from "lucide-react";

function getWeatherIcon(condition, size = 24) {
  const value = condition?.toLowerCase() || "";

  if (value.includes("thunder")) {
    return <CloudLightning size={size} />;
  }

  if (value.includes("rain") || value.includes("shower")) {
    return <CloudRain size={size} />;
  }

  if (value.includes("drizzle")) {
    return <CloudDrizzle size={size} />;
  }

  if (value.includes("snow")) {
    return <Snowflake size={size} />;
  }

  if (value.includes("fog")) {
    return <CloudFog size={size} />;
  }

  if (value.includes("cloud")) {
    return <Cloud size={size} />;
  }

  if (value.includes("clear")) {
    return <Sun size={size} />;
  }

  return <CloudSun size={size} />;
}

function formatDay(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
  });
}

function WeatherOverview({ weather, loading, error, currentCity, onSearch }) {
  const [city, setCity] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const value = city.trim();

    if (!value || loading) {
      return;
    }

    await onSearch(value);
  }

  return (
    <div className="dashboard-panel weather-panel">
      <div className="panel-heading weather-panel-heading">
        <div>
          <span className="panel-label">WEATHER</span>

          <h2>Weather overview</h2>
        </div>
      </div>

      <form className="weather-search" onSubmit={handleSubmit}>
        <Search size={17} />

        <input
          type="text"
          placeholder="Search city..."
          value={city}
          onChange={(event) => setCity(event.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </button>
      </form>

      {error && <div className="weather-search-error">{error}</div>}

      {loading && !weather ? (
        <div className="weather-state">Loading weather...</div>
      ) : weather ? (
        <>
          <div className="weather-current">
            <div>
              <span>
                {weather.location.name}, {weather.location.country}
              </span>

              <strong>{Math.round(weather.current.temperature)}°</strong>

              <p>{weather.current.condition}</p>
            </div>

            <div className="weather-main-icon">
              {getWeatherIcon(weather.current.condition, 50)}
            </div>
          </div>

          <div className="weather-extra-details">
            <div>
              <span>Feels like</span>

              <strong>{Math.round(weather.current.feelsLike)}°</strong>
            </div>

            <div>
              <span>Humidity</span>

              <strong>{weather.current.humidity}%</strong>
            </div>

            <div>
              <span>Wind</span>

              <strong>{Math.round(weather.current.windSpeed)} km/h</strong>
            </div>
          </div>

          <div className="weather-days">
            {weather.forecast.map((day) => (
              <div key={day.date}>
                <span>{formatDay(day.date)}</span>

                <div className="weather-day-icon">
                  {getWeatherIcon(day.condition, 17)}
                </div>

                <strong>{Math.round(day.maxTemperature)}°</strong>

                <small>{Math.round(day.minTemperature)}°</small>
              </div>
            ))}
          </div>

          <p className="weather-location-note">
            Showing weather for {currentCity}
          </p>
        </>
      ) : null}
    </div>
  );
}

export default WeatherOverview;
