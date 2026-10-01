export function validateApiUrl(value) {
  if (!value?.trim()) throw new Error("VITE_API_URL is required.");
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("VITE_API_URL must be a valid HTTP URL.");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error("VITE_API_URL must be an HTTP URL without credentials, a query, or a fragment.");
  }
  return url.href.replace(/\/+$/, "");
}

export function validateGoogleClientId(value) {
  if (!value?.trim()) throw new Error("VITE_GOOGLE_CLIENT_ID is required.");
  return value.trim();
}
