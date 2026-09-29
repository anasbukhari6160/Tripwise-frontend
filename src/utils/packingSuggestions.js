export function getPackingSuggestions(weather) {
  if (!weather?.current) {
    return [];
  }

  const current = weather.current;

  const temperature = Number(current.temperature);
  const humidity = Number(current.humidity);
  const windSpeed = Number(current.windSpeed);

  const condition = current.condition?.toLowerCase() || "";

  const suggestions = [
    {
      id: "documents",
      label: "Travel documents",
      category: "Essential",
    },
    {
      id: "charger",
      label: "Phone charger / power bank",
      category: "Essential",
    },
    {
      id: "water",
      label: "Reusable water bottle",
      category: "Essential",
    },
  ];

  // Hot weather
  if (Number.isFinite(temperature) && temperature >= 25) {
    suggestions.push(
      {
        id: "light-clothes",
        label: "Light breathable clothes",
        category: "Clothing",
      },
      {
        id: "sunglasses",
        label: "Sunglasses",
        category: "Weather",
      },
    );
  }

  // Very hot
  if (Number.isFinite(temperature) && temperature >= 35) {
    suggestions.push(
      {
        id: "sun-hat",
        label: "Sun hat or cap",
        category: "Weather",
      },
      {
        id: "extra-water",
        label: "Extra hydration supply",
        category: "Essential",
      },
    );
  }

  // Cold
  if (Number.isFinite(temperature) && temperature <= 10) {
    suggestions.push({
      id: "warm-jacket",
      label: "Warm jacket or layered clothing",
      category: "Clothing",
    });
  }

  // Freezing
  if (Number.isFinite(temperature) && temperature <= 0) {
    suggestions.push(
      {
        id: "thermal",
        label: "Thermal clothing",
        category: "Clothing",
      },
      {
        id: "gloves",
        label: "Gloves and warm hat",
        category: "Clothing",
      },
      {
        id: "winter-footwear",
        label: "Insulated footwear",
        category: "Footwear",
      },
    );
  }

  // Rain
  if (
    condition.includes("rain") ||
    condition.includes("shower") ||
    condition.includes("drizzle")
  ) {
    suggestions.push(
      {
        id: "umbrella",
        label: "Compact umbrella",
        category: "Weather",
      },
      {
        id: "rain-jacket",
        label: "Waterproof jacket",
        category: "Clothing",
      },
      {
        id: "waterproof-footwear",
        label: "Water-resistant footwear",
        category: "Footwear",
      },
    );
  }

  // Snow
  if (condition.includes("snow")) {
    suggestions.push({
      id: "snow-boots",
      label: "Waterproof winter boots",
      category: "Footwear",
    });
  }

  // Strong wind
  if (Number.isFinite(windSpeed) && windSpeed >= 30) {
    suggestions.push({
      id: "windbreaker",
      label: "Wind-resistant outer layer",
      category: "Clothing",
    });
  }

  // Hot + humid
  if (
    Number.isFinite(humidity) &&
    Number.isFinite(temperature) &&
    humidity >= 75 &&
    temperature >= 24
  ) {
    suggestions.push({
      id: "breathable-clothes",
      label: "Quick-dry breathable clothing",
      category: "Clothing",
    });
  }

  // Sunny / clear
  if (
    condition.includes("clear") &&
    Number.isFinite(temperature) &&
    temperature >= 28
  ) {
    suggestions.push({
      id: "sunscreen",
      label: "Sunscreen",
      category: "Weather",
    });
  }

  // Remove duplicate items by id.
  return [...new Map(suggestions.map((item) => [item.id, item])).values()];
}
