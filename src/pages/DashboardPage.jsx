import { useCallback, useEffect, useState } from "react";

import {
  Bookmark,
  CalendarDays,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Crown,
  MapPin,
  Search,
  Snowflake,
  Sun,
} from "lucide-react";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import Sidebar from "../components/dashboard/Sidebar";
import StatCard from "../components/dashboard/StatCard";
import SavedDestinations from "../components/dashboard/SavedDestinations";
import QuickPlanner from "../components/dashboard/QuickPlanner";
import ProFeaturesCard from "../components/dashboard/ProFeaturesCard";
import MobileNav from "../components/dashboard/MobileNav";

import { getCurrentUser } from "../services/auth.service";
import { getSavedDestinations } from "../services/saved.service";

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

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState("");

  const [weatherQuery, setWeatherQuery] = useState("");
  const [weatherSuggestions, setWeatherSuggestions] = useState([]);
  const [showWeatherSuggestions, setShowWeatherSuggestions] = useState(false);
  const [searchingLocations, setSearchingLocations] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [savedDestinations, setSavedDestinations] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getCurrentUser();
        setUser(data.user);
      } catch (error) {
        console.error("Unable to load dashboard user:", error);
      } finally {
        setLoadingUser(false);
      }
    }

    loadUser();
  }, []);

  const loadWeather = useCallback(async (city) => {
    try {
      setLoadingWeather(true);
      setWeatherError("");

      const weatherData = await getWeather(city);

      setWeather(weatherData);
    } catch (error) {
      console.error("Unable to load weather:", error);

      setWeatherError(error.message || "Weather information is unavailable.");
    } finally {
      setLoadingWeather(false);
    }
  }, []);

  useEffect(() => {
    loadWeather("Lahore");
  }, [loadWeather]);

  useEffect(() => {
    async function loadSavedDestinations() {
      try {
        setLoadingSaved(true);

        const data = await getSavedDestinations();

        setSavedDestinations(data.destinations || []);
      } catch (error) {
        console.error("Unable to load saved destinations:", error);

        setSavedDestinations([]);
      } finally {
        setLoadingSaved(false);
      }
    }

    loadSavedDestinations();
  }, []);

  useEffect(() => {
    const cleanQuery = weatherQuery.trim();

    if (cleanQuery.length < 2) {
      setWeatherSuggestions([]);
      setShowWeatherSuggestions(false);
      return;
    }

    if (
      selectedLocation &&
      weatherQuery === getLocationLabel(selectedLocation)
    ) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchingLocations(true);

        const results = await searchLocations(cleanQuery);

        setWeatherSuggestions(results || []);
        setShowWeatherSuggestions(true);
      } catch (error) {
        console.error("Dashboard location search error:", error);

        setWeatherSuggestions([]);
        setShowWeatherSuggestions(false);
      } finally {
        setSearchingLocations(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [weatherQuery, selectedLocation]);

  async function handleWeatherSearch(event) {
    event.preventDefault();

    const cleanQuery = weatherQuery.trim();

    if (cleanQuery.length < 2) {
      setWeatherError("Enter at least 2 characters.");
      setWeatherSuggestions([]);
      setShowWeatherSuggestions(false);
      return;
    }

    try {
      setSearchingLocations(true);
      setWeatherError("");

      const results = await searchLocations(cleanQuery);

      setWeatherSuggestions(results || []);
      setShowWeatherSuggestions(true);

      if (!results || results.length === 0) {
        setWeatherError("No matching location found.");
      }
    } catch (error) {
      console.error("Unable to search locations:", error);

      setWeatherError(error.message || "Unable to search locations.");

      setWeatherSuggestions([]);
      setShowWeatherSuggestions(false);
    } finally {
      setSearchingLocations(false);
    }
  }

  async function handleSelectLocation(location) {
    setSelectedLocation(location);

    setWeatherQuery(getLocationLabel(location));

    setWeatherSuggestions([]);
    setShowWeatherSuggestions(false);
    setWeatherError("");

    try {
      setLoadingWeather(true);

      const weatherData = await getWeatherForLocation(location);

      setWeather(weatherData);
    } catch (error) {
      console.error("Unable to load selected location weather:", error);

      setWeatherError(error.message || "Unable to load weather.");
    } finally {
      setLoadingWeather(false);
    }
  }

  function handleWeatherInputChange(event) {
    setWeatherQuery(event.target.value);

    setSelectedLocation(null);
    setWeatherError("");
  }

  if (loadingUser) {
    return <div className="dashboard-loading">Loading your dashboard...</div>;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <DashboardHeader user={user} />

        <main className="dashboard-content">
          <section className="dashboard-welcome">
            <div>
              <span className="dashboard-eyebrow">TRAVEL OVERVIEW</span>

              <h1>
                Welcome back
                {user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
              </h1>

              <p>Your trips, weather insights and travel plans in one place.</p>
            </div>

            <button className="dashboard-primary-button" type="button">
              Plan a New Trip
            </button>
          </section>

          <section className="dashboard-stats">
            <StatCard
              icon={<Bookmark size={20} />}
              title="Saved Destinations"
              value={loadingSaved ? "--" : savedDestinations.length}
              subtitle={
                loadingSaved
                  ? "Loading saved places..."
                  : savedDestinations.length === 1
                    ? "Place saved for later"
                    : "Places saved for later"
              }
            />

            <StatCard
              icon={<CalendarDays size={20} />}
              title="Upcoming Trips"
              value="2"
              subtitle="Trips currently planned"
            />

            <StatCard
              icon={<CloudSun size={20} />}
              title="Current Weather"
              value={
                weather ? `${Math.round(weather.current.temperature)}°C` : "--"
              }
              subtitle={
                weather
                  ? `${weather.location.name}, ${weather.location.country}`
                  : loadingWeather
                    ? "Loading weather..."
                    : "Weather unavailable"
              }
            />

            <StatCard
              icon={<Crown size={20} />}
              title="Current Plan"
              value={user?.plan === "pro" ? "Pro" : "Free"}
              subtitle={
                user?.plan === "pro"
                  ? "All premium features unlocked"
                  : "Upgrade for more features"
              }
            />
          </section>

          <section className="dashboard-grid">
            <div className="dashboard-panel upcoming-trip-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-label">UPCOMING TRIP</span>

                  <h2>Your next journey</h2>
                </div>

                <button type="button">View Trip</button>
              </div>

              <div className="trip-placeholder">
                <div className="trip-placeholder-content">
                  <span>Dubai, UAE</span>

                  <h3>Dubai Escape</h3>

                  <p>October 12 – October 16</p>
                </div>

                <div className="trip-days">
                  <strong>4</strong>
                  <span>Days</span>
                </div>
              </div>
            </div>

            <div className="dashboard-panel weather-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-label">WEATHER</span>

                  <h2>Weather overview</h2>
                </div>
              </div>

              <div className="weather-search-wrapper">
                <form className="weather-search" onSubmit={handleWeatherSearch}>
                  <Search size={17} />

                  <input
                    type="text"
                    placeholder="Search city..."
                    value={weatherQuery}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    onChange={handleWeatherInputChange}
                  />

                  <button type="submit" disabled={searchingLocations}>
                    {searchingLocations ? "Searching..." : "Search"}
                  </button>
                </form>

                {showWeatherSuggestions && weatherSuggestions.length > 0 && (
                  <div className="weather-suggestions">
                    {weatherSuggestions.map((location) => (
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

                      <strong>
                        {Math.round(weather.current.temperature)}°
                      </strong>

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
            </div>
          </section>

          <section className="dashboard-secondary-grid">
            <SavedDestinations
              destinations={savedDestinations}
              loading={loadingSaved}
            />

            <QuickPlanner />
          </section>

          <section className="dashboard-pro-section">
            <ProFeaturesCard />
          </section>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}

export default DashboardPage;
