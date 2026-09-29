import { useEffect, useMemo } from "react";

import L from "leaflet";

import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

function isValidCoordinate(value) {
  return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(Number(value))
  );
}

function getValidStops(stops = []) {
  return stops.filter(
    (stop) =>
      isValidCoordinate(stop.latitude) && isValidCoordinate(stop.longitude),
  );
}

function createNumberedIcon(number) {
  return L.divIcon({
    className: "trip-map-numbered-icon",
    html: `
      <div class="trip-map-marker">
        <span>${number}</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

function FitTripBounds({ stops }) {
  const map = useMap();

  useEffect(() => {
    if (!stops.length) {
      return;
    }

    if (stops.length === 1) {
      map.setView([Number(stops[0].latitude), Number(stops[0].longitude)], 11, {
        animate: true,
      });

      return;
    }

    const bounds = L.latLngBounds(
      stops.map((stop) => [Number(stop.latitude), Number(stop.longitude)]),
    );

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 11,
      animate: true,
    });
  }, [map, stops]);

  return null;
}

function TripMap({ stops = [] }) {
  const validStops = useMemo(() => getValidStops(stops), [stops]);

  const positions = useMemo(
    () =>
      validStops.map((stop) => [Number(stop.latitude), Number(stop.longitude)]),
    [validStops],
  );

  if (validStops.length === 0) {
    return (
      <div className="trip-map-empty">
        <strong>Map unavailable</strong>

        <p>No valid destination coordinates were found for this trip.</p>
      </div>
    );
  }

  const initialCenter = positions[0];

  return (
    <div className="trip-map-wrapper">
      <MapContainer
        center={initialCenter}
        zoom={8}
        scrollWheelZoom
        className="trip-leaflet-map"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitTripBounds stops={validStops} />

        {positions.length > 1 && (
          <Polyline
            positions={positions}
            pathOptions={{
              color: "#caff33",
              weight: 3,
              opacity: 0.8,
              dashArray: "7 7",
            }}
          />
        )}

        {validStops.map((stop, index) => (
          <Marker
            key={stop.id ?? `${stop.latitude}-${stop.longitude}-${index}`}
            position={[Number(stop.latitude), Number(stop.longitude)]}
            icon={createNumberedIcon(index + 1)}
          >
            <Popup>
              <div className="trip-map-popup">
                <span>Destination {index + 1}</span>

                <strong>{stop.city}</strong>

                <p>{stop.country}</p>

                {stop.locationName && <small>{stop.locationName}</small>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="trip-map-legend">
        <span>
          {validStops.length}{" "}
          {validStops.length === 1 ? "destination" : "destinations"}
        </span>

        {validStops.length > 1 && (
          <span>Dashed line shows itinerary order</span>
        )}
      </div>
    </div>
  );
}

export default TripMap;
