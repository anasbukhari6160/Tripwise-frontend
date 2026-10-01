import { useEffect, useState } from "react";

import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplets,
  Snowflake,
  Sun,
  Wind,
} from "lucide-react";

import { getWeatherForLocation } from "../../services/weather.service";
import { getTravelAdvice } from "../../utils/travelAdvice";
import { getPackingSuggestions } from "../../utils/packingSuggestions";

function getWeatherIcon(condition, size = 26) {
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

function hasValidCoordinate(value) {
  return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(Number(value))
  );
}

function DestinationWeather({ city, country, latitude, longitude }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      if (!hasValidCoordinate(latitude) || !hasValidCoordinate(longitude)) {
        setWeather(null);
        setError("Weather unavailable for this destination.");
        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        const weatherData = await getWeatherForLocation({
          latitude: Number(latitude),
          longitude: Number(longitude),
          name: city || "Destination",
          country: country || "",
          region: "",
        });

        if (cancelled) {
          return;
        }

        setWeather(weatherData);
      } catch (err) {
        if (cancelled) {
          return;
        }

        if (import.meta.env.DEV) console.error(`Unable to load weather for ${city}:`, err);

        setWeather(null);

        setError("Live weather is temporarily unavailable.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadWeather();

    return () => {
      cancelled = true;
    };
  }, [city, country, latitude, longitude]);

  if (loading) {
    return (
      <div className="trip-stop-weather trip-stop-weather-loading">
        Loading live weather...
      </div>
    );
  }

  if (error || !weather?.current) {
    return (
      <div className="trip-stop-weather trip-stop-weather-error">
        {error || "Weather unavailable."}
      </div>
    );
  }

  const travelAdvice = getTravelAdvice(weather);

  const packingSuggestions = getPackingSuggestions(weather);

  return (
    <div className="trip-stop-weather">

      <div className="trip-stop-weather-header">
        <div>
          <span>LIVE WEATHER</span>

          <strong>{city || "Destination"}</strong>
        </div>

        <div className="trip-stop-weather-icon">
          {getWeatherIcon(weather.current.condition, 30)}
        </div>
      </div>

      <div className="trip-stop-weather-main">
        <strong>
          {Math.round(weather.current.temperature)}
          °C
        </strong>

        <div>
          <span>{weather.current.condition}</span>

          <small>
            Feels like {Math.round(weather.current.feelsLike)}
            °C
          </small>
        </div>
      </div>

      <div className="trip-stop-weather-details">
        <div>
          <Droplets size={15} />

          <span>Humidity</span>

          <strong>{weather.current.humidity}%</strong>
        </div>

        <div>
          <Wind size={15} />

          <span>Wind</span>

          <strong>{Math.round(weather.current.windSpeed)} km/h</strong>
        </div>
      </div>

      <div className="trip-weather-advice">
        <div className="trip-weather-advice-heading">
          <span>TRAVEL ADVICE</span>

          <strong>Based on current conditions</strong>
        </div>

        <div className="trip-weather-advice-list">
          {travelAdvice.map((item, index) => (
            <div
              className="trip-weather-advice-item"
              key={`${item.type}-${index}`}
            >
              <span className="trip-weather-advice-dot" />

              <div>
                <strong>{item.title}</strong>

                <p>{item.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="trip-packing">
        <div className="trip-packing-heading">
          <span>PACKING SUGGESTIONS</span>

          <strong>Recommended for current conditions</strong>
        </div>

        <div className="trip-packing-list">
          {packingSuggestions.map((item) => (
            <div className="trip-packing-item" key={item.id}>
              <span className="trip-packing-check">✓</span>

              <div>
                <strong>{item.label}</strong>

                <small>{item.category}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DestinationWeather;
