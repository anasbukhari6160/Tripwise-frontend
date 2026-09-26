import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import WeatherOverview from "../components/dashboard/WeatherOverview";
import MobileNav from "../components/dashboard/MobileNav";

import { getWeather } from "../services/weather.service";

import "../styles/dashboard.css";
import "../styles/weather-page.css";

function WeatherPage() {
  const navigate = useNavigate();

  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState("");
  const [weatherCity, setWeatherCity] = useState("Lahore");

  async function loadWeather(city) {
    try {
      setLoadingWeather(true);
      setWeatherError("");

      const weatherData = await getWeather(city);

      setWeather(weatherData);
      setWeatherCity(weatherData.location.name);
    } catch (error) {
      console.error("Unable to load weather:", error);

      setWeatherError(error.message || "Weather information is unavailable.");
    } finally {
      setLoadingWeather(false);
    }
  }

  useEffect(() => {
    loadWeather("Lahore");
  }, []);

  return (
    <div className="weather-page">
      <div className="weather-page-container">
        <button
          className="weather-back-button"
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="weather-page-heading">
          <span>TRIPWISE WEATHER</span>

          <h1>Weather Explorer</h1>

          <p>
            Search any destination and check current conditions and the upcoming
            forecast.
          </p>
        </div>

        <div className="weather-page-content">
          <WeatherOverview
            weather={weather}
            loading={loadingWeather}
            error={weatherError}
            currentCity={weatherCity}
            onSearch={loadWeather}
          />
        </div>
      </div>

      <MobileNav />
    </div>
  );
}

export default WeatherPage;
