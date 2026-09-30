import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { ArrowLeft } from "lucide-react";

import MobileNav from "../components/dashboard/MobileNav";

import TripMap from "../components/trips/TripMap";
import DestinationPhoto from "../components/trips/DestinationPhoto";
import DestinationWeather from "../components/trips/DestinationWeather";
import TripResiliencePanel from "../components/trips/TripResiliencePanel";

import { deleteTrip, getTrip } from "../services/trip.service";

function formatDate(value) {
  if (!value) {
    return "Not specified";
  }

  const [year, month, day] = value.slice(0, 10).split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function calculateTripDays(startDate, endDate) {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(`${startDate.slice(0, 10)}T00:00:00`);

  const end = new Date(`${endDate.slice(0, 10)}T00:00:00`);

  const difference = end.getTime() - start.getTime();

  return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
}

function getTripStatus(trip) {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const start = new Date(`${trip.startDate.slice(0, 10)}T00:00:00`);

  const end = new Date(`${trip.endDate.slice(0, 10)}T00:00:00`);

  if (today < start) {
    return "Upcoming";
  }

  if (today > end) {
    return "Completed";
  }

  return "In progress";
}

function TripDetailsPage() {
  const { tripId } = useParams();

  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [deleting, setDeleting] = useState(false);

  /* =========================================================
     LOAD TRIP
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadTrip() {
      try {
        const data = await getTrip(tripId);

        if (cancelled) {
          return;
        }

        setTrip(data);
        setError("");
      } catch (err) {
        if (cancelled) {
          return;
        }

        if (err.status === 401) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        if (err.status === 403) {
          setError("Trip Planner is available to TripWise Pro users only.");

          return;
        }

        if (err.status === 404) {
          setError("This trip could not be found.");

          return;
        }

        setError(err.message || "Unable to load this trip.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTrip();

    return () => {
      cancelled = true;
    };
  }, [tripId, navigate]);

  /* =========================================================
     DELETE TRIP
  ========================================================= */

  async function handleDeleteTrip() {
    try {
      setDeleting(true);

      await deleteTrip(tripId);

      navigate("/trips", {
        replace: true,
      });
    } catch (err) {
      setShowDeleteConfirm(false);

      setError(err.message || "Unable to delete trip.");
    } finally {
      setDeleting(false);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="trip-details-page">
        <div className="trip-details-container">
          <button
            type="button"
            className="trip-dashboard-button"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={20} />

            <span>Dashboard</span>
          </button>

          <div className="trip-details-loading">Loading trip...</div>
        </div>

        <MobileNav />
      </div>
    );
  }

  /* =========================================================
     LOAD ERROR
  ========================================================= */

  if (error && !trip) {
    return (
      <div className="trip-details-page">
        <div className="trip-details-container">
          <div className="trip-details-error-state">
            <h1>Unable to open trip</h1>

            <p>{error}</p>

            <button
              type="button"
              className="trip-primary-button"
              onClick={() => navigate("/trips")}
            >
              Back to My Trips
            </button>
          </div>
        </div>

        <MobileNav />
      </div>
    );
  }

  if (!trip) {
    return null;
  }

  const tripDays = calculateTripDays(trip.startDate, trip.endDate);

  const status = getTripStatus(trip);

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="trip-details-page">
      <div className="trip-details-container">
        {/* =====================================================
            TOP BAR
        ===================================================== */}

        <div className="trip-details-topbar">
          <button
            type="button"
            className="trip-back-button"
            onClick={() => navigate("/trips")}
          >
            ← My Trips
          </button>

          <div className="trip-details-actions">
            <button
              type="button"
              className="trip-edit-button"
              onClick={() => navigate(`/trip-planner?edit=${trip.id}`)}
            >
              Edit Trip
            </button>

            <button
              type="button"
              className="trip-delete-button"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Trip
            </button>
          </div>
        </div>

        {/* =====================================================
            PAGE ERROR
        ===================================================== */}

        {error && <div className="trip-page-error">{error}</div>}

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="trip-details-hero">
          <div className="trip-details-hero-content">
            <div className="trip-details-badges">
              <span className="trip-pro-badge">PRO</span>

              <span
                className={`trip-status trip-status-${status
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                {status}
              </span>
            </div>

            <h1>{trip.title}</h1>

            <div className="trip-details-date-range">
              <span>{formatDate(trip.startDate)}</span>

              <strong>→</strong>

              <span>{formatDate(trip.endDate)}</span>
            </div>

            {trip.notes && <p className="trip-details-notes">{trip.notes}</p>}
          </div>

          <div className="trip-details-summary">
            <div>
              <span>Duration</span>

              <strong>{tripDays}</strong>

              <small>{tripDays === 1 ? "day" : "days"}</small>
            </div>

            <div>
              <span>Destinations</span>

              <strong>{trip.stops?.length || 0}</strong>

              <small>stops</small>
            </div>
          </div>
        </section>

        {/* =====================================================
            ITINERARY
        ===================================================== */}

        <section className="trip-details-section">
          <div className="trip-details-section-heading">
            <div>
              <span>ITINERARY</span>

              <h2>Your journey</h2>

              <p>Destinations are displayed in travel order.</p>
            </div>
          </div>

          <div className="trip-itinerary">
            {trip.stops?.map((stop, index) => (
              <article key={stop.id} className="trip-itinerary-stop">
                <div className="trip-itinerary-marker">
                  <span>{index + 1}</span>

                  {index < trip.stops.length - 1 && <div />}
                </div>

                <div className="trip-itinerary-card">
                  <DestinationPhoto city={stop.city} country={stop.country} />

                  <div className="trip-itinerary-card-heading">
                    <div>
                      <small>DESTINATION {index + 1}</small>

                      <h3>{stop.city}</h3>

                      <p>{stop.country}</p>
                    </div>

                    {stop.countryCode && (
                      <span className="trip-country-code">
                        {stop.countryCode}
                      </span>
                    )}
                  </div>

                  <div className="trip-itinerary-location">
                    <strong>{stop.locationName}</strong>
                  </div>

                  <div className="trip-itinerary-meta">
                    <div>
                      <span>Arrival</span>

                      <strong>{formatDate(stop.arrivalDate)}</strong>
                    </div>

                    <div>
                      <span>Departure</span>

                      <strong>{formatDate(stop.departureDate)}</strong>
                    </div>

                    <div>
                      <span>Timezone</span>

                      <strong>{stop.timezone || "—"}</strong>
                    </div>
                  </div>

                  <div className="trip-itinerary-coordinates">
                    <span>
                      Latitude
                      <strong>{Number(stop.latitude).toFixed(4)}</strong>
                    </span>

                    <span>
                      Longitude
                      <strong>{Number(stop.longitude).toFixed(4)}</strong>
                    </span>
                  </div>

                  <DestinationWeather
                    city={stop.city}
                    country={stop.country}
                    latitude={stop.latitude}
                    longitude={stop.longitude}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* =====================================================
            TRIP RESILIENCE
        ===================================================== */}

        <TripResiliencePanel
          key={trip.id}
          trip={trip}
          onTripUpdated={setTrip}
        />

        {/* =====================================================
            JOURNEY MAP
        ===================================================== */}

        <section className="trip-details-section trip-map-section">
          <div className="trip-details-section-heading">
            <div>
              <span>JOURNEY MAP</span>

              <h2>Your travel route</h2>

              <p>
                Explore your destinations in itinerary order. The connecting
                line represents your planned destination sequence.
              </p>
            </div>
          </div>

          <TripMap stops={trip.stops || []} />
        </section>

        {/* =====================================================
            DELETE CONFIRMATION
        ===================================================== */}

        {showDeleteConfirm && (
          <div className="trip-delete-overlay">
            <div className="trip-delete-modal">
              <span className="trip-delete-warning">!</span>

              <h2>Delete this trip?</h2>

              <p>
                This will permanently delete
                <strong> {trip.title}</strong> and all of its destinations.
              </p>

              <div className="trip-delete-actions">
                <button
                  type="button"
                  className="trip-delete-cancel"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Keep Trip
                </button>

                <button
                  type="button"
                  className="trip-delete-confirm"
                  onClick={handleDeleteTrip}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete Trip"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}

export default TripDetailsPage;
