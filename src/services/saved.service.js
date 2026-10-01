import { apiRequest } from "./api.service";

export const getSavedDestinations = () => apiRequest("/api/saved");
export const saveDestination = (body) => apiRequest("/api/saved", { method: "POST", body });
export const deleteSavedDestination = (id) => apiRequest("/api/saved/" + id, { method: "DELETE" });
