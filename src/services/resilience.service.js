import { API_URL } from "../config/api";

async function parseResponse(response, fallbackMessage) {
  let data;

  try {
    data = await response.json();
  } catch {
    const error = new Error("Invalid response from the TripWise server.");

    error.status = response.status;

    throw error;
  }

  if (!response.ok) {
    const error = new Error(data.message || fallbackMessage);

    error.status = response.status;

    error.code = data.code;

    throw error;
  }

  return data;
}

export async function stressTestTrip(tripId, scenarios) {
  const response = await fetch(
    `${API_BASE_URL}/api/trips/${tripId}/stress-test`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify({
        scenarios,
      }),
    },
  );

  return parseResponse(response, "Unable to stress-test this trip.");
}

export async function applyTripRecovery(tripId, action) {
  const response = await fetch(
    `${API_BASE_URL}/api/trips/${tripId}/recovery/apply`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify({
        confirmed: true,

        action: {
          type: action.type,

          targetNodeId: String(action.targetNodeId),
        },
      }),
    },
  );

  return parseResponse(response, "Unable to apply this recovery.");
}
