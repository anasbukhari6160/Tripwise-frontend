import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  MapPin,
  Search,
  Snowflake,
  Sun,
} from "lucide-react";

import MobileNav from "../components/dashboard/MobileNav";

import {
  getWeather,
  getWeatherForLocation,
  searchLocations,
} from "../services/weather.service";

import "../styles/dashboard.css";
import "../styles/weather-page.css";

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

function getLocationLabel(location) {
  return [location.name, location.region, location.country]
    .filter(Boolean)
    .join(", ");
}

function WeatherPage() {
  const navigate = useNavigate();

  const [weather, setWeather] = useState(null);

  const [loadingWeather, setLoadingWeather] = useState(true);

  const [weatherError, setWeatherError] = useState("");

  const [query, setQuery] = useState("");

  const [suggestions, setSuggestions] = useState([]);

  const [showSuggestions, setShowSuggestions] = useState(false);

  const [searchingLocations, setSearchingLocations] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState(null);

  const locationSearchRequestRef = useRef(0);

  useEffect(() => {
    async function loadDefaultWeather() {
      try {
        setLoadingWeather(true);
        setWeatherError("");

        const weatherData = await getWeather("Lahore");

        setWeather(weatherData);
      } catch (error) {
        console.error("Default weather error:", error);

        setWeatherError(error.message || "Weather information is unavailable.");
      } finally {
        setLoadingWeather(false);
      }
    }

    loadDefaultWeather();
  }, []);

  useEffect(() => {
    const cleanQuery = query.trim();
    const requestId = ++locationSearchRequestRef.current;

    if (cleanQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);

      return undefined;
    }

    if (selectedLocation && query === getLocationLabel(selectedLocation)) {
      setSuggestions([]);
      setShowSuggestions(false);

      return undefined;
    }

    const timer = setTimeout(async () => {
      if (requestId !== locationSearchRequestRef.current) {
        return;
      }

      try {
        setSearchingLocations(true);

        const results = await searchLocations(cleanQuery);

        if (requestId !== locationSearchRequestRef.current) {
          return;
        }

        const safeResults = Array.isArray(results) ? results : [];

        setSuggestions(safeResults);
        setShowSuggestions(safeResults.length > 0);
      } catch (error) {
        if (requestId !== locationSearchRequestRef.current) {
          return;
        }

        console.error("Location suggestion error:", error);

        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        if (requestId === locationSearchRequestRef.current) {
          setSearchingLocations(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [query, selectedLocation]);

  async function handleSearch(event) {
    event.preventDefault();

    const cleanQuery = query.trim();

    locationSearchRequestRef.current += 1;
    setSuggestions([]);
    setShowSuggestions(false);

    if (cleanQuery.length < 2) {
      setWeatherError("Enter at least 2 characters.");
      return;
    }

    try {
      setSearchingLocations(true);
      setWeatherError("");

      let location = null;

      if (selectedLocation && query === getLocationLabel(selectedLocation)) {
        location = selectedLocation;
      } else {
        const results = await searchLocations(cleanQuery);
        const safeResults = Array.isArray(results) ? results : [];

        if (safeResults.length === 0) {
          setWeatherError("No matching location found.");
          return;
        }

        location = safeResults[0];

        setSelectedLocation(location);
        setQuery(getLocationLabel(location));
      }

      setSuggestions([]);
      setShowSuggestions(false);

      setLoadingWeather(true);

      const weatherData = await getWeatherForLocation(location);

      setWeather(weatherData);
    } catch (error) {
      console.error("Location search error:", error);

      setWeatherError(error.message || "Unable to load weather.");

      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setSearchingLocations(false);
      setLoadingWeather(false);
    }
  }

  async function handleSelectLocation(location) {
    locationSearchRequestRef.current += 1;

    setSuggestions([]);
    setShowSuggestions(false);

    setSelectedLocation(location);
    setQuery(getLocationLabel(location));
    setWeatherError("");

    try {
      setLoadingWeather(true);

      const weatherData = await getWeatherForLocation(location);

      setWeather(weatherData);
    } catch (error) {
      console.error("Selected weather error:", error);

      setWeatherError(error.message || "Unable to load weather.");
    } finally {
      setLoadingWeather(false);
    }
  }

  function handleQueryChange(event) {
    locationSearchRequestRef.current += 1;

    setQuery(event.target.value);
    setSelectedLocation(null);

    setSuggestions([]);
    setShowSuggestions(false);
    setWeatherError("");
  }

  return (
    <div className="weather-page">
      <div className="weather-page-container">
        <button
          className="weather-back-button"
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="weather-page-heading">
          <span>TRIPWISE WEATHER</span>

          <h1>Weather Explorer</h1>

          <p>
            Search for a destination and select the exact location to view its
            current weather and forecast.
          </p>
        </div>

        <div className="weather-page-content">
          <section className="dashboard-panel weather-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-label">WEATHER</span>

                <h2>Weather overview</h2>
              </div>
            </div>

            <div className="weather-search-wrapper">
              <form className="weather-search" onSubmit={handleSearch}>
                <Search size={17} />

                <input
                  type="text"
                  placeholder="Search city, e.g. Hyderabad"
                  value={query}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  onChange={handleQueryChange}
                />

                <button type="submit" disabled={searchingLocations}>
                  {searchingLocations ? "Searching..." : "Search"}
                </button>
              </form>

              {showSuggestions && suggestions.length > 0 && (
                <div className="weather-suggestions">
                  {suggestions.map((location) => (
                    <button
                      key={`${location.id}-${location.latitude}-${location.longitude}`}
                      type="button"
                      className="weather-suggestion-item"
                      onClick={() => handleSelectLocation(location)}
                    >
                      <div className="weather-suggestion-icon">
                        <MapPin size={17} />
                      </div>

                      <div className="weather-suggestion-info">
                        <strong>{location.name}</strong>

                        <span>
                          {[
                            location.district,
                            location.region,
                            location.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {weatherError && (
              <div className="weather-search-error">{weatherError}</div>
            )}

            {loadingWeather && !weather ? (
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

                    <strong>
                      {Math.round(weather.current.windSpeed)} km/h
                    </strong>
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
                  Showing weather for {weather.location.name}
                  {weather.location.region
                    ? `, ${weather.location.region}`
                    : ""}
                  , {weather.location.country}
                </p>
              </>
            ) : null}
          </section>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}

export default WeatherPage;
