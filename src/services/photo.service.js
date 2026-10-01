import { apiRequest } from "./api.service";

export async function getDestinationPhotos(city, country) {
  if (!city?.trim()) return [];
  const params = new URLSearchParams({ city: city.trim() });
  if (country?.trim()) params.set("country", country.trim());
  const data = await apiRequest("/api/photos/destination?" + params);
  return Array.isArray(data.photos) ? data.photos : [];
}
