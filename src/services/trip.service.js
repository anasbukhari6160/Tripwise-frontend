import { apiRequest } from "./api.service";

export async function getTrips() {
  const data = await apiRequest("/api/trips");
  return data.trips || [];
}
export async function getTrip(tripId) {
  const data = await apiRequest("/api/trips/" + tripId);
  return data.trip;
}
export async function createTrip(body) {
  const data = await apiRequest("/api/trips", { method: "POST", body });
  return data.trip;
}
export async function updateTrip(tripId, body) {
  const data = await apiRequest("/api/trips/" + tripId, { method: "PUT", body });
  return data.trip;
}
export const deleteTrip = (tripId) => apiRequest("/api/trips/" + tripId, { method: "DELETE" });
