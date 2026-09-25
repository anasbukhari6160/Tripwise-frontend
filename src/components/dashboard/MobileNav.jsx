import {
  CloudSun,
  LayoutDashboard,
  MapPinned,
  Route,
  User,
} from "lucide-react";

function MobileNav() {
  return (
    <nav className="mobile-dashboard-nav">
      <button className="mobile-nav-item active" type="button">
        <LayoutDashboard size={19} />
        <span>Home</span>
      </button>

      <button className="mobile-nav-item" type="button">
        <CloudSun size={19} />
        <span>Weather</span>
      </button>

      <button className="mobile-nav-item" type="button">
        <Route size={19} />
        <span>Trips</span>
      </button>

      <button className="mobile-nav-item" type="button">
        <MapPinned size={19} />
        <span>Saved</span>
      </button>

      <button className="mobile-nav-item" type="button">
        <User size={19} />
        <span>Profile</span>
      </button>
    </nav>
  );
}

export default MobileNav;
