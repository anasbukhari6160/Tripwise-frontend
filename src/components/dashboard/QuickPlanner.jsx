import { ArrowRight, CalendarDays, MapPin, Route } from "lucide-react";

import { useNavigate } from "react-router-dom";

function QuickPlanner() {
  const navigate = useNavigate();

  function openPlanner() {
    navigate("/trip-planner");
  }

  return (
    <div className="dashboard-panel quick-planner-panel">
      <div className="quick-planner-icon">
        <Route size={20} />
      </div>

      <span className="panel-label">QUICK PLANNER</span>

      <h2>Where do you want to go next?</h2>

      <p>
        Start planning your next journey with destination, dates and weather
        insights.
      </p>

      <div className="quick-planner-fields">
        <button type="button" className="planner-field" onClick={openPlanner}>
          <MapPin size={17} />

          <div>
            <span>Destination</span>
            <strong>Choose a place</strong>
          </div>
        </button>

        <button type="button" className="planner-field" onClick={openPlanner}>
          <CalendarDays size={17} />

          <div>
            <span>Travel dates</span>
            <strong>Select dates</strong>
          </div>
        </button>
      </div>

      <button
        type="button"
        className="quick-planner-button"
        onClick={openPlanner}
      >
        Start Planning
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

export default QuickPlanner;
