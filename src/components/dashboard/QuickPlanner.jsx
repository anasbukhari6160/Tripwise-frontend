import { ArrowRight, CalendarDays, MapPin, Sparkles } from "lucide-react";

function QuickPlanner() {
  return (
    <div className="dashboard-panel quick-planner-panel">
      <div className="quick-planner-icon">
        <Sparkles size={21} />
      </div>

      <span className="panel-label">QUICK PLANNER</span>

      <h2>Where do you want to go next?</h2>

      <p>
        Start planning your next journey with destination, dates and weather
        insights.
      </p>

      <div className="quick-planner-fields">
        <button className="planner-field" type="button">
          <MapPin size={17} />

          <div>
            <span>Destination</span>
            <strong>Choose a place</strong>
          </div>
        </button>

        <button className="planner-field" type="button">
          <CalendarDays size={17} />

          <div>
            <span>Travel dates</span>
            <strong>Select dates</strong>
          </div>
        </button>
      </div>

      <button className="quick-planner-button" type="button">
        Start Planning
        <ArrowRight size={17} />
      </button>
    </div>
  );
}

export default QuickPlanner;
