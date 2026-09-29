import { useEffect, useRef, useState } from "react";

import { searchLocations } from "../../services/location.service";

function DestinationSearch({
  selectedLocation = null,
  onSelect,
  disabled = false,
  label = "Destination",
  placeholder = "Search city or destination...",
}) {
  const [query, setQuery] = useState(selectedLocation?.locationName || "");

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [open, setOpen] = useState(false);

  const requestIdRef = useRef(0);

  useEffect(() => {
    if (selectedLocation?.locationName) {
      setQuery(selectedLocation.locationName);
    }
  }, [selectedLocation]);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (disabled || selectedLocation?.locationName === trimmedQuery) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      setError("");
      setSearched(false);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      try {
        setLoading(true);
        setError("");
        setSearched(false);

        const results = await searchLocations(trimmedQuery);

        if (requestId !== requestIdRef.current) {
          return;
        }

        setSuggestions(results);
        setSearched(true);
        setOpen(true);
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setSuggestions([]);
        setSearched(true);
        setOpen(true);

        setError(err.message || "Unable to search destinations.");
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [query, disabled, selectedLocation?.locationName]);

  function handleChange(event) {
    const value = event.target.value;

    setQuery(value);
    setError("");
    setSearched(false);

    if (selectedLocation) {
      onSelect(null);
    }

    if (value.trim().length >= 2) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }

  function handleSelect(location) {
    setQuery(location.locationName);
    setSuggestions([]);
    setOpen(false);
    setError("");
    setSearched(false);

    onSelect(location);
  }

  function handleFocus() {
    if (query.trim().length >= 2 && !selectedLocation) {
      setOpen(true);
    }
  }

  function handleBlur() {
    setTimeout(() => {
      setOpen(false);
    }, 150);
  }

  function getSuggestionKey(location, index) {
    if (location.id) {
      return location.id;
    }

    return [
      location.city,
      location.country,
      location.latitude,
      location.longitude,
      index,
    ].join("-");
  }

  return (
    <div className="trip-destination-search">
      <label className="trip-field-label">{label}</label>

      <div className="trip-destination-search-wrapper">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete="off"
          disabled={disabled}
          className="trip-destination-input"
        />

        {loading && (
          <span className="trip-destination-loading">Searching...</span>
        )}

        {open && (
          <div className="trip-destination-suggestions">
            {error && (
              <div className="trip-destination-message trip-destination-error">
                {error}
              </div>
            )}

            {!error && !loading && searched && suggestions.length === 0 && (
              <div className="trip-destination-message">
                No destinations found.
              </div>
            )}

            {!error &&
              suggestions.map((location, index) => (
                <button
                  key={getSuggestionKey(location, index)}
                  type="button"
                  className="trip-destination-suggestion"
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                  onClick={() => handleSelect(location)}
                >
                  <div className="trip-destination-suggestion-main">
                    <strong>{location.city}</strong>

                    <span>
                      {location.region
                        ? `${location.region}, ${location.country}`
                        : location.country}
                    </span>
                  </div>

                  <small>
                    {Number(location.latitude).toFixed(4)},{" "}
                    {Number(location.longitude).toFixed(4)}
                  </small>
                </button>
              ))}
          </div>
        )}
      </div>

      {selectedLocation && (
        <div className="trip-selected-destination">
          <div>
            <strong>{selectedLocation.locationName}</strong>

            <span>{selectedLocation.timezone || "Timezone unavailable"}</span>
          </div>

          <small>
            {Number(selectedLocation.latitude).toFixed(4)},{" "}
            {Number(selectedLocation.longitude).toFixed(4)}
          </small>
        </div>
      )}
    </div>
  );
}

export default DestinationSearch;
