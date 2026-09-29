const API_URL = "http://localhost:3000/api/photos";

export async function getDestinationPhotos(city, country) {
  if (!city?.trim()) {
    return [];
  }

  const params = new URLSearchParams({
    city: city.trim(),
  });

  if (country?.trim()) {
    params.set("country", country.trim());
  }

  const response = await fetch(`${API_URL}/destination?${params.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.message || "Unable to load destination photos.",
    );

    error.status = response.status;

    throw error;
  }

  return Array.isArray(data.photos) ? data.photos : [];
}
