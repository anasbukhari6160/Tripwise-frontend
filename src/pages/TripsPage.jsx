import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { getTrips } from "../services/trip.service";

function formatDate(value) {
  if (!value) {
    return "Date not set";
  }

  const [year, month, day] = value.slice(0, 10).split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTripStatus(trip) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(`${trip.startDate.slice(0, 10)}T00:00:00`);

  const endDate = new Date(`${trip.endDate.slice(0, 10)}T00:00:00`);

  if (today < startDate) {
    return "Upcoming";
  }

  if (today > endDate) {
    return "Completed";
  }

  return "In progress";
}

function TripsPage() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [proLocked, setProLocked] = useState(false);

  async function loadTrips() {
    try {
      setLoading(true);
      setError("");
      setProLocked(false);

      const data = await getTrips();

      setTrips(data);
    } catch (err) {
      if (err.status === 401) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      if (err.status === 403) {
        setProLocked(true);
        setTrips([]);
        return;
      }

      setError(err.message || "Unable to load your trips.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrips();
  }, []);

  if (loading) {
    return (
      <div className="trips-page">
        <div className="trips-page-container">
          <button
            type="button"
            className="trip-dashboard-button"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={20} />
            <span>Dashboard</span>
          </button>

          <div className="trips-loading-state">Loading your trips...</div>
        </div>
      </div>
    );
  }

  if (proLocked) {
    return (
      <div className="trips-page">
        <div className="trips-page-container">
          <button
            type="button"
            className="trip-dashboard-button"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={20} />
            <span>Dashboard</span>
          </button>

          <div className="trips-pro-lock">
            <span>TRIPWISE PRO</span>

            <h1>Premium Trip Planner</h1>

            <p>
              Multi-destination trip planning is available to TripWise Pro
              members.
            </p>

            <button type="button" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trips-page">
      <div className="trips-page-container">
        <button
          type="button"
          className="trip-dashboard-button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={20} />
          <span>Dashboard</span>
        </button>

        <div className="trips-page-heading">
          <div>
            <span className="trip-page-label">MY JOURNEYS</span>

            <h1>My Trips</h1>

            <p>View and manage your upcoming and previous travel plans.</p>
          </div>

          <button
            type="button"
            className="trip-primary-button"
            onClick={() => navigate("/trip-planner")}
          >
            + Plan New Trip
          </button>
        </div>

        {error && (
          <div className="trip-page-error">
            <span>{error}</span>

            <button type="button" onClick={loadTrips}>
              Try Again
            </button>
          </div>
        )}

        {!error && trips.length === 0 && (
          <div className="trips-empty-state">
            <div className="trips-empty-icon">✈</div>

            <h2>No trips planned yet</h2>

            <p>
              Create your first journey and start building a smarter travel
              itinerary.
            </p>

            <button
              type="button"
              className="trip-primary-button"
              onClick={() => navigate("/trip-planner")}
            >
              Plan Your First Trip
            </button>
          </div>
        )}

        {!error && trips.length > 0 && (
          <div className="trips-list">
            {trips.map((trip) => {
              const status = getTripStatus(trip);

              const firstStop = trip.stops?.[0];

              const lastStop = trip.stops?.[trip.stops.length - 1];

              return (
                <article
                  key={trip.id}
                  className="trip-list-card"
                  onClick={() => navigate(`/trips/${trip.id}`)}
                >
                  <div className="trip-list-card-top">
                    <span
                      className={`trip-status trip-status-${status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {status}
                    </span>

                    <span className="trip-stop-count">
                      {trip.stops?.length || 0}{" "}
                      {(trip.stops?.length || 0) === 1
                        ? "destination"
                        : "destinations"}
                    </span>
                  </div>

                  <h2>{trip.title}</h2>

                  <div className="trip-list-dates">
                    <span>{formatDate(trip.startDate)}</span>

                    <span>→</span>

                    <span>{formatDate(trip.endDate)}</span>
                  </div>

                  {firstStop && (
                    <div className="trip-list-route">
                      <div>
                        <small>FROM</small>

                        <strong>{firstStop.city}</strong>

                        <span>{firstStop.country}</span>
                      </div>

                      <div className="trip-route-line">
                        <span />
                        <div />
                        <span />
                      </div>

                      <div>
                        <small>TO</small>

                        <strong>{lastStop.city}</strong>

                        <span>{lastStop.country}</span>
                      </div>
                    </div>
                  )}

                  {trip.notes && (
                    <p className="trip-list-notes">{trip.notes}</p>
                  )}

                  <button
                    type="button"
                    className="trip-view-button"
                    onClick={(event) => {
                      event.stopPropagation();

                      navigate(`/trips/${trip.id}`);
                    }}
                  >
                    View Trip
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default TripsPage;
