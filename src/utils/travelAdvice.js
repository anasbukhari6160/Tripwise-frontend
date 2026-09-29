export function getTravelAdvice(weather) {
  if (!weather?.current) {
    return [];
  }

  const current = weather.current;

  const temperature = Number(current.temperature);
  const humidity = Number(current.humidity);
  const windSpeed = Number(current.windSpeed);

  const condition = current.condition?.toLowerCase() || "";

  const advice = [];

  // Extreme heat
  if (temperature >= 35) {
    advice.push({
      type: "heat",
      title: "High temperature",
      message:
        "Stay well hydrated, wear light breathable clothing and avoid prolonged outdoor activity during peak afternoon heat.",
    });
  } else if (temperature >= 25 && temperature < 35) {
    advice.push({
      type: "warm",
      title: "Warm conditions",
      message:
        "Light breathable clothing is recommended. Carry water while exploring outdoors.",
    });
  }

  // Cold weather
  if (temperature <= 10 && temperature > 0) {
    advice.push({
      type: "cold",
      title: "Cold weather",
      message:
        "Pack warm layers and a light jacket, especially for mornings and evenings.",
    });
  }

  // Freezing conditions
  if (temperature <= 0) {
    advice.push({
      type: "freezing",
      title: "Freezing conditions",
      message:
        "Thermal layers, gloves, a warm hat and insulated footwear are recommended.",
    });
  }

  // Rain
  if (
    condition.includes("rain") ||
    condition.includes("shower") ||
    condition.includes("drizzle")
  ) {
    advice.push({
      type: "rain",
      title: "Rain expected",
      message:
        "Carry an umbrella or waterproof jacket and choose footwear suitable for wet conditions.",
    });
  }

  // Thunderstorm
  if (condition.includes("thunder")) {
    advice.push({
      type: "storm",
      title: "Thunderstorm conditions",
      message:
        "Avoid exposed outdoor areas during thunderstorms and allow extra time for travel disruptions.",
    });
  }

  // Snow
  if (condition.includes("snow")) {
    advice.push({
      type: "snow",
      title: "Snow conditions",
      message:
        "Wear insulated waterproof footwear and allow additional travel time for slippery roads or paths.",
    });
  }

  // Fog
  if (condition.includes("fog")) {
    advice.push({
      type: "fog",
      title: "Reduced visibility",
      message:
        "Fog may reduce visibility. Allow extra travel time, particularly when driving.",
    });
  }

  // Strong wind
  if (Number.isFinite(windSpeed) && windSpeed >= 30) {
    advice.push({
      type: "wind",
      title: "Strong winds",
      message:
        "Take extra care around exposed areas and secure lightweight personal items.",
    });
  }

  // High humidity
  if (Number.isFinite(humidity) && humidity >= 75 && temperature >= 24) {
    advice.push({
      type: "humidity",
      title: "High humidity",
      message:
        "Conditions may feel warmer than the measured temperature. Stay hydrated and choose breathable clothing.",
    });
  }

  // Sunny / hot conditions
  if (condition.includes("clear") && temperature >= 28) {
    advice.push({
      type: "sun",
      title: "Sun protection",
      message:
        "Consider sunscreen, sunglasses and a hat when spending extended time outdoors.",
    });
  }

  // Normal conditions fallback
  if (advice.length === 0) {
    advice.push({
      type: "normal",
      title: "Comfortable conditions",
      message:
        "No significant weather concerns are currently detected. Standard travel preparation should be sufficient.",
    });
  }

  return advice;
}
