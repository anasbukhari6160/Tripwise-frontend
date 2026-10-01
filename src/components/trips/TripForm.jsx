import { useState } from "react";

import TripStopForm from "./TripStopForm";

function createClientId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createEmptyStop() {
  return {
    clientId: createClientId(),
    location: null,
    arrivalDate: "",
    departureDate: "",
  };
}

function normalizeInitialTrip(initialTrip) {
  if (!initialTrip) {
    return {
      title: "",
      startDate: "",
      endDate: "",
      notes: "",
      stops: [createEmptyStop()],
    };
  }

  return {
    title: initialTrip.title || "",
    startDate: initialTrip.startDate || "",
    endDate: initialTrip.endDate || "",
    notes: initialTrip.notes || "",

    stops:
      initialTrip.stops?.length > 0
        ? initialTrip.stops.map((stop) => ({
            clientId: createClientId(),

            location: {
              id: stop.id,
              locationName: stop.locationName,
              city: stop.city,
              country: stop.country,
              countryCode: stop.countryCode,
              latitude: stop.latitude,
              longitude: stop.longitude,
              timezone: stop.timezone,
              region: stop.region || null,
            },

            arrivalDate: stop.arrivalDate || "",
            departureDate: stop.departureDate || "",
          }))
        : [createEmptyStop()],
  };
}

function TripFormContent({
  initialTrip = null,
  onSubmit,
  submitting = false,
  submitLabel = "Create Trip",
}) {
  const [form, setForm] = useState(() => normalizeInitialTrip(initialTrip));

  const [error, setError] = useState("");

  function handleFieldChange(event) {
    const { name, value } = event.target;

    setError("");

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleStopChange(index, changes) {
    setError("");

    setForm((previous) => ({
      ...previous,

      stops: previous.stops.map((stop, stopIndex) =>
        stopIndex === index
          ? {
              ...stop,
              ...changes,
            }
          : stop,
      ),
    }));
  }

  function addStop() {
    setError("");

    setForm((previous) => {
      if (previous.stops.length >= 10) {
        return previous;
      }

      return {
        ...previous,

        stops: [...previous.stops, createEmptyStop()],
      };
    });
  }

  function removeStop(index) {
    setError("");

    setForm((previous) => {
      if (previous.stops.length <= 1) {
        return previous;
      }

      return {
        ...previous,

        stops: previous.stops.filter((_, stopIndex) => stopIndex !== index),
      };
    });
  }

  function moveStopUp(index) {
    if (index <= 0) {
      return;
    }

    setForm((previous) => {
      const stops = [...previous.stops];

      [stops[index - 1], stops[index]] = [stops[index], stops[index - 1]];

      return {
        ...previous,
        stops,
      };
    });
  }

  function moveStopDown(index) {
    setForm((previous) => {
      if (index >= previous.stops.length - 1) {
        return previous;
      }

      const stops = [...previous.stops];

      [stops[index], stops[index + 1]] = [stops[index + 1], stops[index]];

      return {
        ...previous,
        stops,
      };
    });
  }

  function validateForm() {
    const title = form.title.trim();

    if (title.length < 2) {
      return "Trip title must be at least 2 characters.";
    }

    if (!form.startDate) {
      return "Trip start date is required.";
    }

    if (!form.endDate) {
      return "Trip end date is required.";
    }

    if (form.endDate < form.startDate) {
      return "Trip end date cannot be before the start date.";
    }

    if (form.notes.length > 2000) {
      return "Trip notes cannot exceed 2000 characters.";
    }

    if (form.stops.length < 1) {
      return "At least one destination is required.";
    }

    if (form.stops.length > 10) {
      return "A trip can contain a maximum of 10 destinations.";
    }

    for (let index = 0; index < form.stops.length; index += 1) {
      const stop = form.stops[index];

      if (!stop.location) {
        return `Please select destination ${index + 1}.`;
      }

      if (stop.arrivalDate && stop.arrivalDate < form.startDate) {
        return `Destination ${
          index + 1
        } arrival date cannot be before the trip start date.`;
      }

      if (stop.arrivalDate && stop.arrivalDate > form.endDate) {
        return `Destination ${
          index + 1
        } arrival date cannot be after the trip end date.`;
      }

      if (stop.departureDate && stop.departureDate < form.startDate) {
        return `Destination ${
          index + 1
        } departure date cannot be before the trip start date.`;
      }

      if (stop.departureDate && stop.departureDate > form.endDate) {
        return `Destination ${
          index + 1
        } departure date cannot be after the trip end date.`;
      }

      if (
        stop.arrivalDate &&
        stop.departureDate &&
        stop.departureDate < stop.arrivalDate
      ) {
        return `Destination ${
          index + 1
        } departure date cannot be before arrival date.`;
      }
    }

    for (let index = 1; index < form.stops.length; index += 1) {
      const previousStop = form.stops[index - 1];

      const currentStop = form.stops[index];

      const previousEnd =
        previousStop.departureDate || previousStop.arrivalDate;

      const currentStart = currentStop.arrivalDate || currentStop.departureDate;

      if (previousEnd && currentStart && currentStart < previousEnd) {
        return `Destination ${
          index + 1
        } cannot start before destination ${index} ends.`;
      }
    }

    return "";
  }

  function buildPayload() {
    return {
      title: form.title.trim(),

      startDate: form.startDate,

      endDate: form.endDate,

      notes: form.notes.trim(),

      stops: form.stops.map((stop) => ({
        locationName: stop.location.locationName,

        city: stop.location.city,

        country: stop.location.country,

        countryCode: stop.location.countryCode || null,

        latitude: Number(stop.location.latitude),

        longitude: Number(stop.location.longitude),

        timezone: stop.location.timezone || null,

        arrivalDate: stop.arrivalDate || null,

        departureDate: stop.departureDate || null,
      })),
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);

      return;
    }

    try {
      await onSubmit(buildPayload());
    } catch (err) {
      setError(err.message || "Unable to save trip.");
    }
  }

  return (
    <form className="trip-form" onSubmit={handleSubmit}>

      <section className="trip-form-section">
        <div className="trip-form-section-heading">
          <div>
            <span>TRIP DETAILS</span>

            <h2>Plan your journey</h2>

            <p>Add your trip dates, destinations and itinerary.</p>
          </div>
        </div>

        <div className="trip-form-grid">

          <div className="trip-form-group trip-form-group-full">
            <label htmlFor="trip-title">Trip title</label>

            <input
              id="trip-title"
              type="text"
              name="title"
              value={form.title}
              onChange={handleFieldChange}
              placeholder="e.g. UAE Adventure"
              maxLength={120}
              disabled={submitting}
            />
          </div>

          <div className="trip-form-group">
            <label htmlFor="trip-start-date">Start date</label>

            <input
              id="trip-start-date"
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleFieldChange}
              disabled={submitting}
            />
          </div>

          <div className="trip-form-group">
            <label htmlFor="trip-end-date">End date</label>

            <input
              id="trip-end-date"
              type="date"
              name="endDate"
              value={form.endDate}
              min={form.startDate || undefined}
              onChange={handleFieldChange}
              disabled={submitting}
            />
          </div>

          <div className="trip-form-group trip-form-group-full">
            <label htmlFor="trip-notes">Notes</label>

            <textarea
              id="trip-notes"
              name="notes"
              value={form.notes}
              onChange={handleFieldChange}
              placeholder="Add optional notes about your trip..."
              rows={4}
              maxLength={2000}
              disabled={submitting}
            />

            <small className="trip-character-count">
              {form.notes.length}
              /2000
            </small>
          </div>
        </div>
      </section>

      <section className="trip-form-section">
        <div className="trip-form-section-heading trip-form-itinerary-heading">
          <div>
            <span>ITINERARY</span>

            <h2>Destinations</h2>

            <p>Add up to 10 destinations in travel order.</p>
          </div>

          <strong>
            {form.stops.length}
            /10
          </strong>
        </div>

        <div className="trip-stop-list">
          {form.stops.map((stop, index) => (
            <TripStopForm
              key={stop.clientId}
              stop={stop}
              index={index}
              totalStops={form.stops.length}
              tripStartDate={form.startDate}
              tripEndDate={form.endDate}
              onChange={handleStopChange}
              onRemove={removeStop}
              onMoveUp={moveStopUp}
              onMoveDown={moveStopDown}
              disabled={submitting}
            />
          ))}
        </div>

        <button
          type="button"
          className="trip-add-stop-button"
          onClick={addStop}
          disabled={submitting || form.stops.length >= 10}
        >
          + Add destination
        </button>
      </section>

      {error && <div className="trip-form-error">{error}</div>}

      <div className="trip-form-actions">
        <button
          type="submit"
          className="trip-primary-button"
          disabled={submitting}
        >
          {submitting ? "Saving trip..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function TripForm(props) {
  const initialTrip = props.initialTrip;

  const formKey =
    initialTrip?.id ?? (initialTrip ? JSON.stringify(initialTrip) : "new-trip");

  return <TripFormContent key={formKey} {...props} />;
}

export default TripForm;
