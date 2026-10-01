export function validateApiUrl(value, production) {
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
  if (production) {
    const localHosts = ["localhost", "127.0.0.1", "[::1]", "0.0.0.0"];
    const isLocal = localHosts.includes(url.hostname) || url.hostname.endsWith(".local");
    if (url.protocol !== "https:" || isLocal) {
      throw new Error("Production VITE_API_URL must use HTTPS and a public backend host.");
    }
  }
  return url.href.replace(/\/+$/, "");
}

export function validateGoogleClientId(value) {
  if (!value?.trim()) throw new Error("VITE_GOOGLE_CLIENT_ID is required.");
  return value.trim();
}
