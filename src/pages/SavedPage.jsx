import { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Bookmark,
  Crown,
  MapPin,
  Search,
  Trash2,
} from "lucide-react";

import MobileNav from "../components/dashboard/MobileNav";

import { searchLocations } from "../services/weather.service";

import {
  deleteSavedDestination,
  getSavedDestinations,
  saveDestination,
} from "../services/saved.service";

import "../styles/saved.css";
import "../styles/dashboard.css";

/* =========================================================
   LOCATION HELPERS
========================================================= */

function getLocationName(location) {
  return location?.name || location?.city || location?.locationName || "";
}

function getLocationLabel(location) {
  return [getLocationName(location), location?.region, location?.country]
    .filter(Boolean)
    .join(", ");
}

function createLocationPreview(location) {
  const latitude = Number(location?.latitude);

  const longitude = Number(location?.longitude);

  return {
    city: getLocationName(location),
    country: location?.country || "",
    latitude,
    longitude,
  };
}

/* =========================================================
   PAGE
========================================================= */

function SavedPage() {
  const navigate = useNavigate();

  /*
   * Used to invalidate older autocomplete requests.
   */
  const suggestionRequestRef = useRef(0);

  /* =========================================================
     SAVED DESTINATIONS STATE
  ========================================================= */

  const [destinations, setDestinations] = useState([]);

  const [plan, setPlan] = useState("free");

  const [limit, setLimit] = useState(1);

  const [canSaveMore, setCanSaveMore] = useState(true);

  /* =========================================================
     SEARCH STATE
  ========================================================= */

  const [city, setCity] = useState("");

  const [suggestions, setSuggestions] = useState([]);

  const [selectedLocation, setSelectedLocation] = useState(null);

  const [locationPreview, setLocationPreview] = useState(null);

  const [showSuggestions, setShowSuggestions] = useState(false);

  /* =========================================================
     UI STATE
  ========================================================= */

  const [loading, setLoading] = useState(true);

  const [searching, setSearching] = useState(false);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  /* =========================================================
     RELOAD DESTINATIONS

     Used after save/delete actions.
  ========================================================= */

  async function loadDestinations() {
    try {
      setLoading(true);
      setError("");

      const data = await getSavedDestinations();

      setDestinations(data.destinations || []);

      setPlan(data.plan || "free");

      setLimit(data.limit);

      setCanSaveMore(data.canSaveMore);
    } catch (requestError) {
      setError(requestError.message || "Unable to load saved destinations.");
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadInitialDestinations() {
      try {
        const data = await getSavedDestinations();

        if (cancelled) {
          return;
        }

        setDestinations(data.destinations || []);

        setPlan(data.plan || "free");

        setLimit(data.limit);

        setCanSaveMore(data.canSaveMore);
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(requestError.message || "Unable to load saved destinations.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialDestinations();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     AUTOCOMPLETE
  ========================================================= */

  useEffect(() => {
    const query = city.trim();

    /*
     * The input change handler already clears
     * stale suggestions when query is too short.
     */
    if (query.length < 2) {
      return undefined;
    }

    /*
     * If a location has already been selected,
     * don't search again for its completed label.
     */
    if (selectedLocation && city === getLocationLabel(selectedLocation)) {
      return undefined;
    }

    const requestId = suggestionRequestRef.current + 1;

    suggestionRequestRef.current = requestId;

    const timer = setTimeout(async () => {
      try {
        setSearching(true);

        const results = await searchLocations(query);

        /*
         * Ignore stale requests.
         */
        if (suggestionRequestRef.current !== requestId) {
          return;
        }

        const safeResults = Array.isArray(results) ? results : [];

        setSuggestions(safeResults);

        setShowSuggestions(safeResults.length > 0);
      } catch (searchError) {
        if (suggestionRequestRef.current !== requestId) {
          return;
        }

        console.error("Location suggestion error:", searchError);

        setSuggestions([]);

        setShowSuggestions(false);
      } finally {
        if (suggestionRequestRef.current === requestId) {
          setSearching(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [city, selectedLocation]);

  /* =========================================================
     SELECT LOCATION
  ========================================================= */

  function selectLocation(location) {
    const preview = createLocationPreview(location);

    if (
      !preview.city ||
      !preview.country ||
      !Number.isFinite(preview.latitude) ||
      !Number.isFinite(preview.longitude)
    ) {
      setSelectedLocation(null);

      setLocationPreview(null);

      setSuggestions([]);

      setShowSuggestions(false);

      setSearching(false);

      setError(
        "The selected destination does not contain valid location data.",
      );

      return;
    }

    /*
     * Invalidate any autocomplete request
     * that may still be running.
     */
    suggestionRequestRef.current += 1;

    setSelectedLocation(location);

    setLocationPreview(preview);

    setCity(getLocationLabel(location));

    setSuggestions([]);

    setShowSuggestions(false);

    setSearching(false);

    setError("");

    setMessage("");
  }

  function handleSelectLocation(location) {
    selectLocation(location);
  }

  /* =========================================================
     EXPLICIT SEARCH
  ========================================================= */

  async function handleSearch(event) {
    event.preventDefault();

    const cleanQuery = city.trim();

    setError("");

    setMessage("");

    if (cleanQuery.length < 2) {
      suggestionRequestRef.current += 1;

      setSelectedLocation(null);

      setLocationPreview(null);

      setSuggestions([]);

      setShowSuggestions(false);

      setSearching(false);

      setError("Enter at least 2 characters.");

      return;
    }

    /*
     * Invalidate predictive autocomplete
     * before explicit search.
     */
    const requestId = suggestionRequestRef.current + 1;

    suggestionRequestRef.current = requestId;

    setSuggestions([]);

    setShowSuggestions(false);

    try {
      setSearching(true);

      const results = await searchLocations(cleanQuery);

      /*
       * User may have changed input
       * while request was running.
       */
      if (suggestionRequestRef.current !== requestId) {
        return;
      }

      const safeResults = Array.isArray(results) ? results : [];

      if (safeResults.length === 0) {
        setSelectedLocation(null);

        setLocationPreview(null);

        setSuggestions([]);

        setShowSuggestions(false);

        setError("No matching destination found.");

        return;
      }

      const bestMatch = safeResults[0];

      selectLocation(bestMatch);
    } catch (searchError) {
      if (suggestionRequestRef.current !== requestId) {
        return;
      }

      console.error("Saved destination search error:", searchError);

      setSelectedLocation(null);

      setLocationPreview(null);

      setSuggestions([]);

      setShowSuggestions(false);

      setError(searchError.message || "Unable to search destinations.");
    } finally {
      /*
       * selectLocation() increments the request ref,
       * so only update searching if this request
       * is still current.
       */
      if (suggestionRequestRef.current === requestId) {
        setSearching(false);
      }
    }
  }

  /* =========================================================
     INPUT CHANGE
  ========================================================= */

  function handleCityChange(event) {
    /*
     * Immediately invalidate any old request.
     */
    suggestionRequestRef.current += 1;

    setCity(event.target.value);

    setSelectedLocation(null);

    setLocationPreview(null);

    /*
     * Remove old suggestions immediately.
     */
    setSuggestions([]);

    setShowSuggestions(false);

    setSearching(false);

    setError("");

    setMessage("");
  }

  /* =========================================================
     SAVE DESTINATION
  ========================================================= */

  async function handleSave() {
    if (!locationPreview) {
      setError("Select a destination first.");

      return;
    }

    try {
      setSaving(true);

      setError("");

      setMessage("");

      await saveDestination(locationPreview);

      setMessage(`${locationPreview.city} saved successfully.`);

      suggestionRequestRef.current += 1;

      setCity("");

      setSuggestions([]);

      setShowSuggestions(false);

      setSelectedLocation(null);

      setLocationPreview(null);

      setSearching(false);

      await loadDestinations();
    } catch (saveError) {
      setError(saveError.message || "Unable to save destination.");
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     DELETE DESTINATION
  ========================================================= */

  async function handleDelete(destination) {
    const confirmed = window.confirm(
      `Remove ${destination.city} from your saved destinations?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(destination.id);

      setError("");

      setMessage("");

      await deleteSavedDestination(destination.id);

      setMessage(`${destination.city} removed successfully.`);

      await loadDestinations();
    } catch (deleteError) {
      setError(deleteError.message || "Unable to remove destination.");
    } finally {
      setDeletingId(null);
    }
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="saved-page">
      <div className="saved-page-container">
        {/* =========================
            BACK
        ========================= */}

        <button
          className="saved-back-button"
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        {/* =========================
            HEADING
        ========================= */}

        <section className="saved-heading">
          <div>
            <span>SAVED PLACES</span>

            <h1>Your Destinations</h1>

            <p>
              Save places you want to visit and keep them ready for future
              TripWise plans.
            </p>
          </div>

          <div className="saved-plan-badge">
            <Crown size={15} />

            {plan === "pro"
              ? "Pro Plan"
              : `Free Plan · ${destinations.length}/${limit}`}
          </div>
        </section>

        {/* =========================
            SEARCH CARD
        ========================= */}

        <section className="saved-search-card">
          <div className="saved-search-heading">
            <div className="saved-search-icon">
              <MapPin size={20} />
            </div>

            <div>
              <h2>Save a destination</h2>

              <p>
                Search for a city and select the exact location you want to
                visit.
              </p>
            </div>
          </div>

          {/* =========================
              SEARCH FORM
          ========================= */}

          <form className="saved-search-form" onSubmit={handleSearch}>
            <Search size={18} />

            <input
              type="text"
              placeholder="Search city, e.g. Hyderabad"
              value={city}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              onChange={handleCityChange}
            />

            <button type="submit" disabled={searching}>
              {searching ? "Searching..." : "Search"}
            </button>
          </form>

          {/* =========================
              AUTOCOMPLETE
          ========================= */}

          {showSuggestions && suggestions.length > 0 && (
            <div className="saved-suggestions">
              {suggestions.map((location) => (
                <button
                  key={`${location.id}-${location.latitude}-${location.longitude}`}
                  type="button"
                  className="saved-suggestion-item"
                  onClick={() => handleSelectLocation(location)}
                >
                  <div className="saved-suggestion-icon">
                    <MapPin size={17} />
                  </div>

                  <div>
                    <strong>{getLocationName(location)}</strong>

                    <span>
                      {[location.district, location.region, location.country]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* =========================
              FREE PLAN LIMIT
          ========================= */}

          {!canSaveMore && plan !== "pro" && (
            <div className="saved-limit-message">
              <Crown size={17} />

              <div>
                <strong>Free destination limit reached</strong>

                <p>
                  Free users can save 1 destination. Upgrade to Pro for
                  unlimited saved destinations.
                </p>
              </div>
            </div>
          )}

          {/* =========================
              SELECTED LOCATION
          ========================= */}

          {locationPreview && (
            <div className="saved-location-preview">
              <div className="saved-location-preview-info">
                <div className="destination-icon">
                  <MapPin size={18} />
                </div>

                <div>
                  <strong>{locationPreview.city}</strong>

                  <span>{locationPreview.country}</span>

                  <small>
                    {Number(locationPreview.latitude).toFixed(4)}
                    {", "}
                    {Number(locationPreview.longitude).toFixed(4)}
                  </small>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || (!canSaveMore && plan !== "pro")}
              >
                <Bookmark size={16} />

                {saving ? "Saving..." : "Save Destination"}
              </button>
            </div>
          )}

          {/* =========================
              MESSAGES
          ========================= */}

          {message && <div className="saved-success-message">{message}</div>}

          {error && <div className="saved-error-message">{error}</div>}
        </section>

        {/* =========================
            SAVED LIST
        ========================= */}

        <section className="saved-list-section">
          <div className="saved-list-heading">
            <div>
              <span>YOUR LIST</span>

              <h2>Saved destinations</h2>
            </div>

            <strong>{destinations.length}</strong>
          </div>

          {loading ? (
            <div className="saved-state">Loading saved destinations...</div>
          ) : destinations.length === 0 ? (
            <div className="saved-empty-state">
              <div>
                <Bookmark size={26} />
              </div>

              <h3>No saved destinations yet</h3>

              <p>
                Search for a city above and save your first TripWise
                destination.
              </p>
            </div>
          ) : (
            <div className="saved-page-list">
              {destinations.map((destination) => (
                <article className="saved-page-item" key={destination.id}>
                  <div className="saved-page-item-left">
                    <div className="destination-icon">
                      <MapPin size={19} />
                    </div>

                    <div>
                      <h3>{destination.city}</h3>

                      <p>{destination.country}</p>

                      {destination.latitude && destination.longitude && (
                        <small>
                          {Number(destination.latitude).toFixed(4)}
                          {", "}
                          {Number(destination.longitude).toFixed(4)}
                        </small>
                      )}
                    </div>
                  </div>

                  <button
                    className="saved-delete-button"
                    type="button"
                    onClick={() => handleDelete(destination)}
                    disabled={deletingId === destination.id}
                  >
                    <Trash2 size={17} />

                    {deletingId === destination.id ? "Removing..." : "Remove"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <MobileNav />
    </div>
  );
}

export default SavedPage;
