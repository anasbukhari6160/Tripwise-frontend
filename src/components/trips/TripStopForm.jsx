import DestinationSearch from "./DestinationSearch";

function TripStopForm({
  stop,
  index,
  totalStops,
  tripStartDate,
  tripEndDate,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  disabled = false,
}) {
  function handleLocationSelect(location) {
    onChange(index, {
      location,
    });
  }

  function handleDateChange(event) {
    const { name, value } = event.target;

    onChange(index, {
      [name]: value,
    });
  }

  return (
    <div className="trip-stop-card">
      <div className="trip-stop-header">
        <div>
          <span className="trip-stop-number">{index + 1}</span>

          <div>
            <strong>Destination {index + 1}</strong>

            <p>Search and select your destination.</p>
          </div>
        </div>

        <div className="trip-stop-actions">
          <button
            type="button"
            className="trip-stop-move-button"
            onClick={() => onMoveUp(index)}
            disabled={disabled || index === 0}
            aria-label="Move destination up"
          >
            ↑
          </button>

          <button
            type="button"
            className="trip-stop-move-button"
            onClick={() => onMoveDown(index)}
            disabled={disabled || index === totalStops - 1}
            aria-label="Move destination down"
          >
            ↓
          </button>

          <button
            type="button"
            className="trip-stop-remove-button"
            onClick={() => onRemove(index)}
            disabled={disabled || totalStops <= 1}
          >
            Remove
          </button>
        </div>
      </div>

      <DestinationSearch
        selectedLocation={stop.location}
        onSelect={handleLocationSelect}
        disabled={disabled}
        label="Destination"
        placeholder="Search Dubai, Lahore, Paris..."
      />

      <div className="trip-stop-date-grid">
        <div className="trip-form-group">
          <label htmlFor={`arrival-${stop.clientId}`}>Arrival date</label>

          <input
            id={`arrival-${stop.clientId}`}
            type="date"
            name="arrivalDate"
            value={stop.arrivalDate || ""}
            min={tripStartDate || undefined}
            max={tripEndDate || undefined}
            onChange={handleDateChange}
            disabled={disabled}
          />
        </div>

        <div className="trip-form-group">
          <label htmlFor={`departure-${stop.clientId}`}>Departure date</label>

          <input
            id={`departure-${stop.clientId}`}
            type="date"
            name="departureDate"
            value={stop.departureDate || ""}
            min={stop.arrivalDate || tripStartDate || undefined}
            max={tripEndDate || undefined}
            onChange={handleDateChange}
            disabled={disabled}
          />
        </div>
      </div>

      {stop.location && (
        <div className="trip-stop-location-meta">
          <span>{stop.location.countryCode || stop.location.country}</span>

          <span>{stop.location.timezone || "Timezone unavailable"}</span>

          <span>
            {Number(stop.location.latitude).toFixed(4)},{" "}
            {Number(stop.location.longitude).toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
}

export default TripStopForm;
