import { apiRequest } from "./api.service";

export const stressTestTrip = (tripId, scenarios) => apiRequest("/api/trips/" + tripId + "/stress-test", { method: "POST", body: { scenarios } });
export const applyTripRecovery = (tripId, action) => apiRequest("/api/trips/" + tripId + "/recovery/apply", {
  method: "POST",
  body: { confirmed: true, action: { type: action.type, targetNodeId: String(action.targetNodeId) } },
});
