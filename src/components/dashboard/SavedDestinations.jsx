import { MapPin, MoreHorizontal } from "lucide-react";

import { useNavigate } from "react-router-dom";

function SavedDestinations({ destinations = [], loading = false }) {
  const navigate = useNavigate();

  const visibleDestinations = destinations.slice(0, 3);

  return (
    <div className="dashboard-panel saved-destinations-panel">
      <div className="panel-heading">
        <div>
          <span className="panel-label">SAVED DESTINATIONS</span>

          <h2>Places on your list</h2>
        </div>

        <button type="button" onClick={() => navigate("/saved")}>
          View All
        </button>
      </div>

      {loading ? (
        <div className="saved-dashboard-state">Loading destinations...</div>
      ) : visibleDestinations.length === 0 ? (
        <div className="saved-dashboard-state">No saved destinations yet.</div>
      ) : (
        <div className="saved-destination-list">
          {visibleDestinations.map((destination) => (
            <div className="saved-destination-item" key={destination.id}>
              <div className="destination-icon">
                <MapPin size={18} />
              </div>

              <div className="destination-info">
                <strong>{destination.city}</strong>

                <span>{destination.country}</span>

                <small>Saved destination</small>
              </div>

              <button
                type="button"
                className="destination-menu-button"
                onClick={() => navigate("/saved")}
                aria-label={`Open ${destination.city}`}
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedDestinations;
