import { useEffect, useState } from "react";
import { Bookmark, CalendarDays, CloudSun, Crown } from "lucide-react";

import MobileNav from "../components/dashboard/MobileNav";
import ProFeaturesCard from "../components/dashboard/ProFeaturesCard";

import QuickPlanner from "../components/dashboard/QuickPlanner";
import SavedDestinations from "../components/dashboard/SavedDestinations";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import Sidebar from "../components/dashboard/Sidebar";
import StatCard from "../components/dashboard/StatCard";

import { getCurrentUser } from "../services/auth.service";

import "../styles/dashboard.css";

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

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
              value="26°C"
              subtitle="Lahore, Pakistan"
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

            <div className="dashboard-panel weather-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-label">WEATHER</span>

                  <h2>Weather overview</h2>
                </div>

                <button type="button">Details</button>
              </div>

              <div className="weather-current">
                <div>
                  <span>Lahore</span>

                  <strong>26°</strong>

                  <p>Clear skies</p>
                </div>

                <CloudSun size={50} />
              </div>

              <div className="weather-days">
                <div>
                  <span>Mon</span>
                  <strong>26°</strong>
                </div>

                <div>
                  <span>Tue</span>
                  <strong>28°</strong>
                </div>

                <div>
                  <span>Wed</span>
                  <strong>25°</strong>
                </div>

                <div>
                  <span>Thu</span>
                  <strong>27°</strong>
                </div>

                <div>
                  <span>Fri</span>
                  <strong>29°</strong>
                </div>
              </div>
            </div>
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
