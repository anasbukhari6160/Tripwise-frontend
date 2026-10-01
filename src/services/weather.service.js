import { apiRequest } from "./api.service";

export async function getWeather(city) {
  const data = await apiRequest("/api/weather?city=" + encodeURIComponent(city));
  return data.weather;
}
export async function searchLocations(query) {
  const cleanQuery = query.trim();
  if (cleanQuery.length < 2) return [];
  const data = await apiRequest("/api/weather/locations?query=" + encodeURIComponent(cleanQuery));
  return data.locations || [];
}
export async function getWeatherForLocation(location) {
  const params = new URLSearchParams({
    latitude: String(location.latitude), longitude: String(location.longitude),
    name: location.name, country: location.country, region: location.region || "",
  });
  const data = await apiRequest("/api/weather/location?" + params);
  return data.weather;
}
