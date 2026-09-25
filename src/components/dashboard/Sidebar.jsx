import {
  CloudSun,
  Compass,
  Crown,
  LayoutDashboard,
  MapPinned,
  Route,
  Settings,
  User,
} from "lucide-react";

function Sidebar() {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        Trip<span>Wise</span>
      </div>

      <nav className="sidebar-nav">
        <a className="sidebar-link active" href="#">
          <LayoutDashboard size={19} />
          <span>Overview</span>
        </a>

        <a className="sidebar-link" href="#">
          <CloudSun size={19} />
          <span>Weather</span>
        </a>

        <a className="sidebar-link" href="#">
          <Route size={19} />
          <span>My Trips</span>
        </a>

        <a className="sidebar-link" href="#">
          <MapPinned size={19} />
          <span>Saved</span>
        </a>

        <a className="sidebar-link" href="#">
          <Compass size={19} />
          <span>Trip Planner</span>
        </a>

        <a className="sidebar-link" href="#">
          <User size={19} />
          <span>Profile</span>
        </a>
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-pro-card">
          <div className="sidebar-pro-icon">
            <Crown size={18} />
          </div>

          <div>
            <strong>Upgrade to Pro</strong>
            <p>Unlock smarter travel tools.</p>
          </div>

          <button type="button">Upgrade</button>
        </div>

        <a className="sidebar-link" href="#">
          <Settings size={19} />
          <span>Settings</span>
        </a>
      </div>
    </aside>
  );
}

export default Sidebar;
