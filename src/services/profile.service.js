const PROFILE_API_URL = "http://localhost:3000/api/profile";

export async function getProfile() {
  const response = await fetch(PROFILE_API_URL, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load profile.");
  }

  return data.profile;
}

export async function updateProfile(name) {
  const response = await fetch(PROFILE_API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      name,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update profile.");
  }

  return data;
}

export async function deleteProfile() {
  const response = await fetch(PROFILE_API_URL, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete account.");
  }

  return data;
}
