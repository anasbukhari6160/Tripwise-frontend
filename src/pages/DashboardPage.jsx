import { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

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
import { getTrips } from "../services/trip.service";
import { getDestinationPhotos } from "../services/photo.service";

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

function getTodayDateKey() {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(today.getMonth() + 1).padStart(2, "0");

  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTripDate(value) {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.slice(0, 10).split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function calculateTripDays(startDate, endDate) {
  if (!startDate || !endDate) {
    return 0;
  }

  const [startYear, startMonth, startDay] = startDate
    .slice(0, 10)
    .split("-")
    .map(Number);

  const [endYear, endMonth, endDay] = endDate
    .slice(0, 10)
    .split("-")
    .map(Number);

  const start = Date.UTC(startYear, startMonth - 1, startDay);

  const end = Date.UTC(endYear, endMonth - 1, endDay);

  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function DashboardPage() {
  const navigate = useNavigate();

  /* =========================================================
     USER
  ========================================================= */

  const [user, setUser] = useState(null);

  const [loadingUser, setLoadingUser] = useState(true);

  /* =========================================================
     WEATHER
  ========================================================= */

  const [weather, setWeather] = useState(null);

  const [loadingWeather, setLoadingWeather] = useState(true);

  const [weatherError, setWeatherError] = useState("");

  const [weatherQuery, setWeatherQuery] = useState("");

  const [weatherSuggestions, setWeatherSuggestions] = useState([]);

  const [showWeatherSuggestions, setShowWeatherSuggestions] = useState(false);

  const [searchingLocations, setSearchingLocations] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState(null);

  const weatherSearchRequestRef = useRef(0);

  /* =========================================================
     SAVED DESTINATIONS
  ========================================================= */

  const [savedDestinations, setSavedDestinations] = useState([]);

  const [loadingSaved, setLoadingSaved] = useState(true);

  /* =========================================================
     TRIPS
  ========================================================= */

  const [trips, setTrips] = useState([]);

  const [loadingTrips, setLoadingTrips] = useState(true);

  const [nextTripPhotos, setNextTripPhotos] = useState([]);

  const [currentTripPhotoIndex, setCurrentTripPhotoIndex] = useState(0);

  /* =========================================================
     LOAD USER
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const data = await getCurrentUser();

        if (cancelled) {
          return;
        }

        setUser(data.user);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Unable to load dashboard user:", error);
      } finally {
        if (!cancelled) {
          setLoadingUser(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     LOAD DEFAULT WEATHER
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadDefaultWeather() {
      try {
        const weatherData = await getWeather("Lahore");

        if (cancelled) {
          return;
        }

        setWeather(weatherData);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Unable to load weather:", error);

        setWeatherError(error.message || "Weather information is unavailable.");
      } finally {
        if (!cancelled) {
          setLoadingWeather(false);
        }
      }
    }

    loadDefaultWeather();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     LOAD SAVED DESTINATIONS
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadSavedDestinations() {
      try {
        const data = await getSavedDestinations();

        if (cancelled) {
          return;
        }

        setSavedDestinations(data.destinations || []);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Unable to load saved destinations:", error);

        setSavedDestinations([]);
      } finally {
        if (!cancelled) {
          setLoadingSaved(false);
        }
      }
    }

    loadSavedDestinations();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     LOAD TRIPS
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadTrips() {
      try {
        const data = await getTrips();

        if (cancelled) {
          return;
        }

        setTrips(data || []);
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error.status !== 403) {
          console.error("Unable to load dashboard trips:", error);
        }

        setTrips([]);
      } finally {
        if (!cancelled) {
          setLoadingTrips(false);
        }
      }
    }

    loadTrips();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     WEATHER LOCATION SUGGESTIONS
  ========================================================= */

  useEffect(() => {
    const cleanQuery = weatherQuery.trim();

    const requestId = ++weatherSearchRequestRef.current;

    if (cleanQuery.length < 2) {
      return undefined;
    }

    if (
      selectedLocation &&
      weatherQuery === getLocationLabel(selectedLocation)
    ) {
      return undefined;
    }

    const timer = setTimeout(async () => {
      if (requestId !== weatherSearchRequestRef.current) {
        return;
      }

      try {
        setSearchingLocations(true);

        const results = await searchLocations(cleanQuery);

        if (requestId !== weatherSearchRequestRef.current) {
          return;
        }

        const safeResults = Array.isArray(results) ? results : [];

        setWeatherSuggestions(safeResults);

        setShowWeatherSuggestions(safeResults.length > 0);
      } catch (error) {
        if (requestId !== weatherSearchRequestRef.current) {
          return;
        }

        console.error("Dashboard location search error:", error);

        setWeatherSuggestions([]);

        setShowWeatherSuggestions(false);
      } finally {
        if (requestId === weatherSearchRequestRef.current) {
          setSearchingLocations(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [weatherQuery, selectedLocation]);

  /* =========================================================
     WEATHER SEARCH
  ========================================================= */

  async function handleWeatherSearch(event) {
    event.preventDefault();

    const cleanQuery = weatherQuery.trim();

    weatherSearchRequestRef.current += 1;

    setWeatherSuggestions([]);

    setShowWeatherSuggestions(false);

    if (cleanQuery.length < 2) {
      setWeatherError("Enter at least 2 characters.");

      return;
    }

    try {
      setSearchingLocations(true);

      setWeatherError("");

      let location = null;

      if (
        selectedLocation &&
        weatherQuery === getLocationLabel(selectedLocation)
      ) {
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

        setWeatherQuery(getLocationLabel(location));
      }

      setWeatherSuggestions([]);

      setShowWeatherSuggestions(false);

      setLoadingWeather(true);

      const weatherData = await getWeatherForLocation(location);

      setWeather(weatherData);
    } catch (error) {
      console.error("Unable to search weather location:", error);

      setWeatherError(error.message || "Unable to load weather.");

      setWeatherSuggestions([]);

      setShowWeatherSuggestions(false);
    } finally {
      setSearchingLocations(false);

      setLoadingWeather(false);
    }
  }

  /* =========================================================
     SELECT WEATHER LOCATION
  ========================================================= */

  async function handleSelectLocation(location) {
    weatherSearchRequestRef.current += 1;

    setWeatherSuggestions([]);

    setShowWeatherSuggestions(false);

    setSelectedLocation(location);

    setWeatherQuery(getLocationLabel(location));

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

  /* =========================================================
     WEATHER INPUT
  ========================================================= */

  function handleWeatherInputChange(event) {
    weatherSearchRequestRef.current += 1;

    setWeatherQuery(event.target.value);

    setSelectedLocation(null);

    setWeatherSuggestions([]);

    setShowWeatherSuggestions(false);

    setWeatherError("");
  }

  /* =========================================================
     UPCOMING TRIPS
  ========================================================= */

  const todayDateKey = getTodayDateKey();

  const upcomingTrips = [...trips]
    .filter((trip) => {
      const endDate = trip.endDate?.slice(0, 10);

      return endDate && endDate >= todayDateKey;
    })
    .sort((a, b) => {
      const aStart = a.startDate?.slice(0, 10) || "";

      const bStart = b.startDate?.slice(0, 10) || "";

      const aEnd = a.endDate?.slice(0, 10) || "";

      const bEnd = b.endDate?.slice(0, 10) || "";

      const aInProgress = aStart <= todayDateKey && aEnd >= todayDateKey;

      const bInProgress = bStart <= todayDateKey && bEnd >= todayDateKey;

      if (aInProgress && !bInProgress) {
        return -1;
      }

      if (!aInProgress && bInProgress) {
        return 1;
      }

      return aStart.localeCompare(bStart);
    });

  const nextTrip = upcomingTrips[0] || null;

  const nextTripFirstStop = nextTrip?.stops?.[0] || null;

  /* =========================================================
     NEXT TRIP PHOTOS
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadNextTripPhotos() {
      if (!nextTripFirstStop?.city) {
        return;
      }

      try {
        const photos = await getDestinationPhotos(
          nextTripFirstStop.city,
          nextTripFirstStop.country,
        );

        if (cancelled) {
          return;
        }

        const validPhotos = (Array.isArray(photos) ? photos : []).filter(
          (photo) => photo?.landscapeUrl || photo?.imageUrl,
        );

        setNextTripPhotos(validPhotos);

        setCurrentTripPhotoIndex(0);

        validPhotos.forEach((photo) => {
          const image = new Image();

          image.src = photo.landscapeUrl || photo.imageUrl;
        });
      } catch (error) {
        console.error("Unable to load dashboard trip photos:", error);

        if (!cancelled) {
          setNextTripPhotos([]);

          setCurrentTripPhotoIndex(0);
        }
      }
    }

    loadNextTripPhotos();

    return () => {
      cancelled = true;
    };
  }, [nextTripFirstStop?.city, nextTripFirstStop?.country]);

  /* =========================================================
     PHOTO ROTATION
  ========================================================= */

  useEffect(() => {
    if (nextTripPhotos.length <= 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      setCurrentTripPhotoIndex(
        (previousIndex) => (previousIndex + 1) % nextTripPhotos.length,
      );
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [nextTripPhotos]);

  const nextTripPhoto = nextTripPhotos[currentTripPhotoIndex] || null;

  const nextTripDays = nextTrip
    ? calculateTripDays(nextTrip.startDate, nextTrip.endDate)
    : 0;

  /* =========================================================
     LOADING
  ========================================================= */

  if (loadingUser) {
    return <div className="dashboard-loading">Loading your dashboard...</div>;
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} />

      <div className="dashboard-main">
        <DashboardHeader
          user={user}
          trips={trips}
          savedDestinations={savedDestinations}
        />

        <main className="dashboard-content">
          {/* WELCOME */}

          <section className="dashboard-welcome">
            <div>
              <span className="dashboard-eyebrow">TRAVEL OVERVIEW</span>

              <h1>
                Welcome back
                {user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
              </h1>

              <p>Your trips, weather insights and travel plans in one place.</p>
            </div>

            <button
              className="dashboard-primary-button"
              type="button"
              onClick={() => navigate("/trip-planner")}
            >
              Plan a New Trip
            </button>
          </section>

          {/* STATS */}

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
              value={loadingTrips ? "--" : upcomingTrips.length}
              subtitle={
                loadingTrips
                  ? "Loading trips..."
                  : upcomingTrips.length === 1
                    ? "Active or upcoming journey"
                    : "Active or upcoming journeys"
              }
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

          {/* MAIN GRID */}

          <section className="dashboard-grid">
            {/* UPCOMING TRIP */}

            <div className="dashboard-panel upcoming-trip-panel">
              {nextTrip &&
                nextTripPhoto &&
                (nextTripPhoto.landscapeUrl || nextTripPhoto.imageUrl) && (
                  <img
                    key={nextTripPhoto.id || currentTripPhotoIndex}
                    className="upcoming-trip-background"
                    src={nextTripPhoto.landscapeUrl || nextTripPhoto.imageUrl}
                    alt={
                      nextTripFirstStop
                        ? `${nextTripFirstStop.city}, ${nextTripFirstStop.country}`
                        : "Trip destination"
                    }
                  />
                )}

              {nextTrip && <div className="upcoming-trip-overlay" />}

              <div className="panel-heading upcoming-trip-heading">
                <div>
                  <span className="panel-label">UPCOMING TRIP</span>

                  <h2>Your next journey</h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(nextTrip ? `/trips/${nextTrip.id}` : "/trips")
                  }
                >
                  {nextTrip ? "View Trip" : "View Trips"}
                </button>
              </div>

              {loadingTrips ? (
                <div className="trip-placeholder">
                  <div className="trip-placeholder-content">
                    <span>LOADING TRIPS</span>

                    <h3>Finding your next journey</h3>

                    <p>Please wait...</p>
                  </div>
                </div>
              ) : nextTrip ? (
                <div
                  className="trip-placeholder upcoming-trip-content"
                  onClick={() => navigate(`/trips/${nextTrip.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();

                      navigate(`/trips/${nextTrip.id}`);
                    }
                  }}
                >
                  <div className="trip-placeholder-content">
                    <span>
                      {nextTripFirstStop
                        ? `${nextTripFirstStop.city}, ${nextTripFirstStop.country}`
                        : "TripWise Journey"}
                    </span>

                    <h3>{nextTrip.title}</h3>

                    <p>
                      {formatTripDate(nextTrip.startDate)}
                      {" – "}
                      {formatTripDate(nextTrip.endDate)}
                    </p>
                  </div>

                  <div className="trip-days">
                    <strong>{nextTripDays}</strong>

                    <span>{nextTripDays === 1 ? "Day" : "Days"}</span>
                  </div>

                  {nextTripPhotos.length > 1 && (
                    <div className="trip-photo-indicators" aria-hidden="true">
                      {nextTripPhotos.map((photo, index) => (
                        <span
                          key={photo.id || index}
                          className={
                            index === currentTripPhotoIndex ? "active" : ""
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="trip-placeholder">
                  <div className="trip-placeholder-content">
                    <span>NO ACTIVE OR UPCOMING TRIP</span>

                    <h3>Ready for your next journey?</h3>

                    <p>Create a new trip to see it here.</p>
                  </div>

                  <button
                    type="button"
                    className="dashboard-primary-button"
                    onClick={() => navigate("/trip-planner")}
                  >
                    Plan Trip
                  </button>
                </div>
              )}
            </div>

            {/* WEATHER */}

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

          {/* SECONDARY */}

          <section className="dashboard-secondary-grid">
            <SavedDestinations
              destinations={savedDestinations}
              loading={loadingSaved}
            />

            <QuickPlanner />
          </section>

          {/* PRO */}

          <section id="pro-section" className="dashboard-pro-section">
            <ProFeaturesCard user={user} />
          </section>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}

export default DashboardPage;
