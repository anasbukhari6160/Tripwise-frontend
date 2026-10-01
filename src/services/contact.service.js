import { apiRequest } from "./api.service";

export const submitContactMessage = (body) => apiRequest("/api/contact", { method: "POST", body });
