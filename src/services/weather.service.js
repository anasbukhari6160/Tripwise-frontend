const WEATHER_API_URL = "http://localhost:3000/api/weather";

export async function getWeather(city) {
  const response = await fetch(
    `${WEATHER_API_URL}?city=${encodeURIComponent(city)}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load weather.");
  }

  return data.weather;
}
