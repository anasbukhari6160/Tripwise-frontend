import { useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  Bell,
  Bookmark,
  ChevronDown,
  MapPin,
  Route as RouteIcon,
  Search,
} from "lucide-react";

function buildTripSearchText(trip) {
  const stopText = (trip.stops || [])
    .map((stop) =>
      [stop.locationName, stop.city, stop.country].filter(Boolean).join(" "),
    )
    .join(" ");

  return [trip.title, trip.notes, stopText]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function buildSavedSearchText(destination) {
  return [
    destination.name,
    destination.locationName,
    destination.city,
    destination.region,
    destination.country,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getSavedTitle(destination) {
  return (
    destination.city ||
    destination.name ||
    destination.locationName ||
    "Saved destination"
  );
}

function getSavedSubtitle(destination) {
  return [destination.region, destination.country].filter(Boolean).join(", ");
}

function DashboardHeader({ user, trips = [], savedDestinations = [] }) {
  const navigate = useNavigate();

  const searchRef = useRef(null);

  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const cleanQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (cleanQuery.length < 2) {
      return [];
    }

    const tripResults = trips
      .filter((trip) => buildTripSearchText(trip).includes(cleanQuery))
      .slice(0, 5)
      .map((trip) => {
        const firstStop = trip.stops?.[0];

        return {
          key: `trip-${trip.id}`,
          type: "trip",
          title: trip.title,
          subtitle: firstStop
            ? [firstStop.city, firstStop.country].filter(Boolean).join(", ")
            : "Trip",
          tripId: trip.id,
        };
      });

    const savedResults = savedDestinations
      .filter((destination) =>
        buildSavedSearchText(destination).includes(cleanQuery),
      )
      .slice(0, 5)
      .map((destination) => ({
        key: `saved-${destination.id}`,
        type: "saved",
        title: getSavedTitle(destination),
        subtitle: getSavedSubtitle(destination) || "Saved destination",
        destinationId: destination.id,
      }));

    return [...tripResults, ...savedResults].slice(0, 8);
  }, [cleanQuery, trips, savedDestinations]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function handleInputChange(event) {
    const value = event.target.value;

    setQuery(value);

    setShowResults(value.trim().length >= 2);
  }

  function handleResultClick(result) {
    setQuery("");
    setShowResults(false);

    if (result.type === "trip") {
      navigate(`/trips/${result.tripId}`);
      return;
    }

    if (result.type === "saved") {
      navigate("/saved");
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    if (results.length === 0) {
      return;
    }

    handleResultClick(results[0]);
  }

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="dashboard-header">
      <div className="dashboard-search-wrapper" ref={searchRef}>
        <form className="dashboard-search" onSubmit={handleSearchSubmit}>
          <Search size={18} />

          <input
            type="search"
            value={query}
            placeholder="Search trips or destinations..."
            autoComplete="off"
            spellCheck={false}
            onChange={handleInputChange}
            onFocus={() => {
              if (query.trim().length >= 2) {
                setShowResults(true);
              }
            }}
          />
        </form>

        {showResults && (
          <div className="dashboard-global-search-results">
            {results.length > 0 ? (
              results.map((result) => (
                <button
                  key={result.key}
                  type="button"
                  className="dashboard-global-search-item"
                  onClick={() => handleResultClick(result)}
                >
                  <span className="dashboard-global-search-icon">
                    {result.type === "trip" ? (
                      <RouteIcon size={17} />
                    ) : (
                      <Bookmark size={17} />
                    )}
                  </span>

                  <span className="dashboard-global-search-info">
                    <strong>{result.title}</strong>

                    <small>{result.subtitle}</small>
                  </span>

                  <span className="dashboard-global-search-type">
                    {result.type === "trip" ? "TRIP" : "SAVED"}
                  </span>
                </button>
              ))
            ) : (
              <div className="dashboard-global-search-empty">
                <MapPin size={18} />

                <span>No matching trips or destinations.</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="dashboard-header-actions">
        <button
          type="button"
          className="header-icon-button"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <button
          type="button"
          className="profile-menu"
          onClick={() => navigate("/profile")}
        >
          <span className="profile-avatar">{userInitial}</span>

          <span className="profile-details">
            <strong>{user?.name || "TripWise User"}</strong>

            <span>{user?.plan === "pro" ? "Pro Plan" : "Free Plan"}</span>
          </span>

          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;
