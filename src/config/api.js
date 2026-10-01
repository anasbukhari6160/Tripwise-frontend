import { validateApiUrl } from "./environment.js";

export const API_URL = validateApiUrl(import.meta.env.VITE_API_URL, import.meta.env.PROD);

export function apiUrl(path) {
  if (typeof path !== "string" || !path.trim()) throw new Error("An API path is required.");
  return API_URL + "/" + path.replace(/^\/+/, "");
}
