import { apiUrl } from "../config/api";

export async function apiRequest(path, { body, timeout = 60000, ...options } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(apiUrl(path), {
      ...options,
      credentials: "include",
      signal: controller.signal,
      headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...options.headers },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const text = await response.text();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        const error = new Error("Invalid response from the TripWise server. Please try again.");
        error.status = response.status;
        throw error;
      }
      if (!data || typeof data !== "object") {
        throw new Error("Invalid response from the TripWise server.");
      }
    }
    if (!response.ok) {
      const error = new Error(data.message || "The request failed. Please try again.");
      error.status = response.status;
      for (const key of ["code", "errors", "upgradeRequired", "canResend", "email"]) {
        if (data[key] !== undefined) error[key] = data[key];
      }
      throw error;
    }
    return data;
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("The request timed out. Please try again.", { cause: error });
    }
    if (error instanceof TypeError) {
      throw new Error("Unable to reach TripWise. Check your connection and try again.", { cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
