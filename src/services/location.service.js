const API_URL = "http://localhost:3000/api/locations";

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

export async function searchLocations(query) {
  const normalizedQuery = query?.trim();

  if (!normalizedQuery || normalizedQuery.length < 2) {
    return [];
  }

  const response = await fetch(
    `${API_URL}/search?q=${encodeURIComponent(normalizedQuery)}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const data = await handleResponse(response);

  return data.locations || [];
}
