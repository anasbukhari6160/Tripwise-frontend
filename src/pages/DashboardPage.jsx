import { useNavigate } from "react-router-dom";

import { logoutUser } from "../services/auth.service";
import "../styles/dashboard.css";

function DashboardPage() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logoutUser();

      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <main className="dashboard-page">
      <h1>TripWise Dashboard</h1>

      <p>You are logged in successfully.</p>

      <button onClick={handleLogout}>Logout</button>
    </main>
  );
}

export default DashboardPage;
