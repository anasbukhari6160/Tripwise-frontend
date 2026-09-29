const API_URL = "http://localhost:3000/api/trips";

async function handleResponse(response) {
  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid server response.");
  }

  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong.");

    error.status = response.status;
    error.errors = data.errors || [];

    throw error;
  }

  return data;
}

export async function getTrips() {
  const response = await fetch(API_URL, {
    method: "GET",
    credentials: "include",
  });

  const data = await handleResponse(response);

  return data.trips || [];
}

export async function getTrip(tripId) {
  const response = await fetch(`${API_URL}/${tripId}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await handleResponse(response);

  return data.trip;
}

export async function createTrip(tripData) {
  const response = await fetch(API_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    credentials: "include",

    body: JSON.stringify(tripData),
  });

  const data = await handleResponse(response);

  return data.trip;
}

export async function updateTrip(tripId, tripData) {
  const response = await fetch(`${API_URL}/${tripId}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    credentials: "include",

    body: JSON.stringify(tripData),
  });

  const data = await handleResponse(response);

  return data.trip;
}

export async function deleteTrip(tripId) {
  const response = await fetch(`${API_URL}/${tripId}`, {
    method: "DELETE",
    credentials: "include",
  });

  return handleResponse(response);
}
