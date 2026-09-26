import { useEffect, useState } from "react";
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

function getLocationLabel(location) {
  return [location.name, location.region, location.country]
    .filter(Boolean)
    .join(", ");
}

function SavedPage() {
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState([]);

  const [plan, setPlan] = useState("free");
  const [limit, setLimit] = useState(1);
  const [canSaveMore, setCanSaveMore] = useState(true);

  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [selectedLocation, setSelectedLocation] = useState(null);

  const [locationPreview, setLocationPreview] = useState(null);

  const [showSuggestions, setShowSuggestions] = useState(false);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDestinations();
  }, []);

  useEffect(() => {
    const query = city.trim();

    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (selectedLocation && city === getLocationLabel(selectedLocation)) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true);

        const results = await searchLocations(query);

        setSuggestions(results || []);
        setShowSuggestions(true);
      } catch (searchError) {
        console.error("Location suggestion error:", searchError);

        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [city, selectedLocation]);

  async function handleSearch(event) {
    event.preventDefault();

    const cleanCity = city.trim();

    if (cleanCity.length < 2) {
      setError("Enter at least 2 characters.");
      return;
    }

    try {
      setSearching(true);
      setError("");
      setMessage("");

      const results = await searchLocations(cleanCity);

      setSuggestions(results || []);
      setShowSuggestions(true);

      if (!results || results.length === 0) {
        setError("No matching location found.");
      }
    } catch (searchError) {
      setSuggestions([]);
      setShowSuggestions(false);
      setError(searchError.message);
    } finally {
      setSearching(false);
    }
  }

  function handleSelectLocation(location) {
    setSelectedLocation(location);

    setLocationPreview({
      city: location.name,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
    });

    setCity(getLocationLabel(location));

    setSuggestions([]);
    setShowSuggestions(false);
    setError("");
    setMessage("");
  }

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

      setCity("");
      setSuggestions([]);
      setSelectedLocation(null);
      setLocationPreview(null);
      setShowSuggestions(false);

      await loadDestinations();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

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
      setError(deleteError.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="saved-page">
      <div className="saved-page-container">
        <button
          className="saved-back-button"
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

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

          <form className="saved-search-form" onSubmit={handleSearch}>
            <Search size={18} />

            <input
              type="text"
              placeholder="Search city, e.g. Hyderabad"
              value={city}
              autoComplete="off"
              onChange={(event) => {
                setCity(event.target.value);

                setSelectedLocation(null);
                setLocationPreview(null);
                setError("");
              }}
            />

            <button type="submit" disabled={searching}>
              {searching ? "Searching..." : "Search"}
            </button>
          </form>

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
                    <strong>{location.name}</strong>

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
                    {Number(locationPreview.latitude).toFixed(4)},{" "}
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

          {message && <div className="saved-success-message">{message}</div>}

          {error && <div className="saved-error-message">{error}</div>}
        </section>

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
                          {Number(destination.latitude).toFixed(4)},{" "}
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
