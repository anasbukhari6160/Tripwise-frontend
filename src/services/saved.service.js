const SAVED_API_URL = "http://localhost:3000/api/saved";

export async function getSavedDestinations() {
  const response = await fetch(SAVED_API_URL, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load saved destinations.");
  }

  return data;
}

export async function saveDestination(destination) {
  const response = await fetch(SAVED_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(destination),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Unable to save destination.");

    error.status = response.status;
    error.upgradeRequired = data.upgradeRequired || false;

    throw error;
  }

  return data;
}

export async function deleteSavedDestination(id) {
  const response = await fetch(`${SAVED_API_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to remove destination.");
  }

  return data;
}
