export function apiUrl(path) {
  if (typeof path !== "string" || !path.trim()) throw new Error("An API path is required.");
  return "/" + path.replace(/^\/+/, "");
}
