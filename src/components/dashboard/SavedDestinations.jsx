import { MapPin, MoreHorizontal } from "lucide-react";

function SavedDestinations() {
  const destinations = [
    {
      city: "Dubai",
      country: "United Arab Emirates",
      note: "Saved for winter trip",
    },
    {
      city: "Istanbul",
      country: "Türkiye",
      note: "Saved for next vacation",
    },
    {
      city: "Baku",
      country: "Azerbaijan",
      note: "Saved destination",
    },
  ];

  return (
    <div className="dashboard-panel saved-destinations-panel">
      <div className="panel-heading">
        <div>
          <span className="panel-label">SAVED DESTINATIONS</span>

          <h2>Places on your list</h2>
        </div>

        <button type="button">View All</button>
      </div>

      <div className="saved-destination-list">
        {destinations.map((destination) => (
          <div className="saved-destination-item" key={destination.city}>
            <div className="destination-icon">
              <MapPin size={18} />
            </div>

            <div className="destination-info">
              <strong>{destination.city}</strong>

              <span>{destination.country}</span>

              <small>{destination.note}</small>
            </div>

            <button
              type="button"
              className="destination-menu-button"
              aria-label={`Options for ${destination.city}`}
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SavedDestinations;
