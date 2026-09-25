import { useEffect, useState } from "react";
import { Bookmark, CalendarDays, CloudSun, Crown } from "lucide-react";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import Sidebar from "../components/dashboard/Sidebar";
import StatCard from "../components/dashboard/StatCard";
import SavedDestinations from "../components/dashboard/SavedDestinations";
import QuickPlanner from "../components/dashboard/QuickPlanner";
import ProFeaturesCard from "../components/dashboard/ProFeaturesCard";
import MobileNav from "../components/dashboard/MobileNav";
import WeatherOverview from "../components/dashboard/WeatherOverview";

import { getCurrentUser } from "../services/auth.service";
import { getWeather } from "../services/weather.service";

import "../styles/dashboard.css";

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState("");
  const [weatherCity, setWeatherCity] = useState("Lahore");

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getCurrentUser();
        setUser(data.user);
      } catch (error) {
        console.error("Unable to load dashboard user:", error);
      } finally {
        setLoadingUser(false);
      }
    }

    loadUser();
  }, []);

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

  if (loadingUser) {
    return <div className="dashboard-loading">Loading your dashboard...</div>;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <DashboardHeader user={user} />

        <main className="dashboard-content">
          <section className="dashboard-welcome">
            <div>
              <span className="dashboard-eyebrow">TRAVEL OVERVIEW</span>

              <h1>
                Welcome back
                {user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
              </h1>

              <p>Your trips, weather insights and travel plans in one place.</p>
            </div>

            <button className="dashboard-primary-button" type="button">
              Plan a New Trip
            </button>
          </section>

          <section className="dashboard-stats">
            <StatCard
              icon={<Bookmark size={20} />}
              title="Saved Destinations"
              value="4"
              subtitle="Places you want to visit"
            />

            <StatCard
              icon={<CalendarDays size={20} />}
              title="Upcoming Trips"
              value="2"
              subtitle="Trips currently planned"
            />

            <StatCard
              icon={<CloudSun size={20} />}
              title="Current Weather"
              value={
                weather ? `${Math.round(weather.current.temperature)}°C` : "--"
              }
              subtitle={
                weather
                  ? `${weather.location.name}, ${weather.location.country}`
                  : loadingWeather
                    ? "Loading weather..."
                    : "Weather unavailable"
              }
            />

            <StatCard
              icon={<Crown size={20} />}
              title="Current Plan"
              value={user?.plan === "pro" ? "Pro" : "Free"}
              subtitle={
                user?.plan === "pro"
                  ? "All premium features unlocked"
                  : "Upgrade for more features"
              }
            />
          </section>

          <section className="dashboard-grid">
            <div className="dashboard-panel upcoming-trip-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-label">UPCOMING TRIP</span>

                  <h2>Your next journey</h2>
                </div>

                <button type="button">View Trip</button>
              </div>

              <div className="trip-placeholder">
                <div className="trip-placeholder-content">
                  <span>Dubai, UAE</span>

                  <h3>Dubai Escape</h3>

                  <p>October 12 – October 16</p>
                </div>

                <div className="trip-days">
                  <strong>4</strong>
                  <span>Days</span>
                </div>
              </div>
            </div>

            <WeatherOverview
              weather={weather}
              loading={loadingWeather}
              error={weatherError}
              currentCity={weatherCity}
              onSearch={loadWeather}
            />
          </section>

          <section className="dashboard-secondary-grid">
            <SavedDestinations />
            <QuickPlanner />
          </section>

          <section className="dashboard-pro-section">
            <ProFeaturesCard />
          </section>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}

export default DashboardPage;
