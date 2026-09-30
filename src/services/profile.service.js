import { API_URL } from "../config/api";

async function profileRequest(path = "", options = {}) {
  const response = await fetch(`${API_BASE_URL}/api/profile${path}`, {
    ...options,

    credentials: "include",

    headers: {
      "Content-Type": "application/json",

      ...(options.headers || {}),
    },
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(data.message || "Profile request failed.");

    error.status = response.status;

    error.code = data.code || null;

    throw error;
  }

  return data;
}

/* =========================================================
   GET PROFILE
========================================================= */

export async function getProfile() {
  return profileRequest();
}

/* =========================================================
   UPDATE PROFILE
========================================================= */

export async function updateProfile(name) {
  return profileRequest("", {
    method: "PUT",

    body: JSON.stringify({
      name,
    }),
  });
}

/* =========================================================
   REQUEST PASSWORD CHANGE
========================================================= */

export async function requestPasswordChange({
  currentPassword,
  newPassword,
  confirmPassword,
}) {
  return profileRequest("/password/request-change", {
    method: "POST",

    body: JSON.stringify({
      currentPassword,
      newPassword,
      confirmPassword,
    }),
  });
}

/* =========================================================
   VERIFY PASSWORD CHANGE
========================================================= */

export async function verifyPasswordChange(code) {
  return profileRequest("/password/verify-change", {
    method: "POST",

    body: JSON.stringify({
      code,
    }),
  });
}

/* =========================================================
   DELETE ACCOUNT
========================================================= */

export async function deleteProfile() {
  return profileRequest("", {
    method: "DELETE",
  });
}
