const WEATHER_API_URL = "http://localhost:3000/api/weather";

export async function getWeather(city) {
  const response = await fetch(
    `${WEATHER_API_URL}?city=${encodeURIComponent(city)}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load weather.");
  }

  return data.weather;
}

export async function searchLocations(query) {
  const cleanQuery = query.trim();

  if (cleanQuery.length < 2) {
    return [];
  }

  const response = await fetch(
    `${WEATHER_API_URL}/locations?query=${encodeURIComponent(cleanQuery)}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to search locations.");
  }

  return data.locations || [];
}

export async function getWeatherForLocation(location) {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    name: location.name,
    country: location.country,
    region: location.region || "",
  });

  const response = await fetch(
    `${WEATHER_API_URL}/location?${params.toString()}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load weather.");
  }

  return data.weather;
}
