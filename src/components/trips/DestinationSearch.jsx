import { useEffect, useRef, useState } from "react";

import { MapPin } from "lucide-react";

import { searchLocations } from "../../services/weather.service";

function getLocationName(location) {
  return location?.name || location?.city || location?.locationName || "";
}

function getLocationLabel(location) {
  if (!location) {
    return "";
  }

  if (location.locationName) {
    return location.locationName;
  }

  return [getLocationName(location), location.region, location.country]
    .filter(Boolean)
    .join(", ");
}

function normalizeLocation(location) {
  const city = location?.city || location?.name || location?.locationName || "";

  const country = location?.country || "";

  const region = location?.region || null;

  const locationName =
    location?.locationName ||
    [city, region, country].filter(Boolean).join(", ");

  return {
    id: location?.id ?? null,

    locationName,

    city,

    country,

    countryCode: location?.countryCode || location?.country_code || null,

    latitude: Number(location?.latitude),

    longitude: Number(location?.longitude),

    timezone: location?.timezone || null,

    region,
  };
}

function DestinationSearch({
  selectedLocation = null,
  onSelect,
  disabled = false,
  label = "Destination",
  placeholder = "Search Dubai, Lahore, Paris...",
}) {
  const wrapperRef = useRef(null);

  const requestRef = useRef(0);

  const [query, setQuery] = useState(() => getLocationLabel(selectedLocation));

  const [suggestions, setSuggestions] = useState([]);

  const [open, setOpen] = useState(false);

  const [searching, setSearching] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    function handleOutsideClick(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const cleanQuery = query.trim();

    const selectedLabel = getLocationLabel(selectedLocation);

    if (
      disabled ||
      cleanQuery.length < 2 ||
      (selectedLocation && cleanQuery === selectedLabel)
    ) {
      return undefined;
    }

    const requestId = ++requestRef.current;

    const timer = setTimeout(async () => {
      try {
        setSearching(true);

        const results = await searchLocations(cleanQuery);

        if (requestId !== requestRef.current) {
          return;
        }

        const safeResults = Array.isArray(results) ? results : [];

        setSuggestions(safeResults);

        setOpen(safeResults.length > 0);

        setError(
          safeResults.length === 0 ? "No matching destination found." : "",
        );
      } catch (requestError) {
        if (requestId !== requestRef.current) {
          return;
        }

        if (import.meta.env.DEV) console.error("Destination search error:", requestError);

        setSuggestions([]);

        setOpen(false);

        setError(requestError.message || "Unable to search destinations.");
      } finally {
        if (requestId === requestRef.current) {
          setSearching(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [query, selectedLocation, disabled]);

  function handleQueryChange(event) {
    requestRef.current += 1;

    const value = event.target.value;

    setQuery(value);

    setSuggestions([]);

    setOpen(false);

    setSearching(false);

    setError("");
  }

  function handleSelect(location) {
    requestRef.current += 1;

    const normalized = normalizeLocation(location);

    setQuery(normalized.locationName);

    setSuggestions([]);

    setOpen(false);

    setSearching(false);

    setError("");

    onSelect(normalized);
  }

  return (
    <div className="trip-destination-search" ref={wrapperRef}>
      <label className="trip-field-label">{label}</label>

      <div className="trip-destination-search-wrapper">
        <input
          type="text"
          className="trip-destination-input"
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          disabled={disabled}
          onChange={handleQueryChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setOpen(true);
            }
          }}
        />

        {searching && (
          <span className="trip-destination-loading">Searching...</span>
        )}

        {open && suggestions.length > 0 && (
          <div className="trip-destination-suggestions">
            {suggestions.map((location, index) => {
              const name = getLocationName(location);

              const secondary = [
                location.district,
                location.region,
                location.country,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <button
                  key={
                    location.id ||
                    `${location.latitude}-${location.longitude}-${index}`
                  }
                  type="button"
                  className="trip-destination-suggestion"
                  onClick={() => handleSelect(location)}
                >
                  <div className="trip-destination-suggestion-main">
                    <strong>{name}</strong>

                    {secondary && <span>{secondary}</span>}
                  </div>

                  {location.countryCode && (
                    <small>{location.countryCode}</small>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div className="trip-destination-message trip-destination-error">
          {error}
        </div>
      )}

      {selectedLocation && (
        <div className="trip-selected-destination">
          <div>
            <strong>
              <MapPin size={12} />{" "}
              {selectedLocation.city || getLocationName(selectedLocation)}
            </strong>

            <span>
              {selectedLocation.country}
              {selectedLocation.region ? ` · ${selectedLocation.region}` : ""}
            </span>
          </div>

          {Number.isFinite(Number(selectedLocation.latitude)) &&
            Number.isFinite(Number(selectedLocation.longitude)) && (
              <small>
                {Number(selectedLocation.latitude).toFixed(4)},{" "}
                {Number(selectedLocation.longitude).toFixed(4)}
              </small>
            )}
        </div>
      )}
    </div>
  );
}

export default DestinationSearch;
