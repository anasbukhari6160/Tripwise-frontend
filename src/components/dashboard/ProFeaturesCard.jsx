import { Crown, CloudSun, MapPinned, Route, Sparkles } from "lucide-react";

function ProFeaturesCard() {
  const features = [
    {
      icon: <MapPinned size={17} />,
      text: "Unlimited saved destinations",
    },
    {
      icon: <CloudSun size={17} />,
      text: "Extended weather insights",
    },
    {
      icon: <Route size={17} />,
      text: "Multi-city trip planning",
    },
  ];

  return (
    <div className="dashboard-panel pro-features-panel">
      <div className="pro-features-top">
        <div className="pro-feature-icon">
          <Crown size={21} />
        </div>

        <span className="pro-badge">PRO</span>
      </div>

      <span className="panel-label">TRIPWISE PRO</span>

      <h2>Travel with fewer limits.</h2>

      <p>
        Unlock advanced planning, extended weather insights and more flexibility
        for every trip.
      </p>

      <div className="pro-feature-list">
        {features.map((feature) => (
          <div className="pro-feature-item" key={feature.text}>
            <span>{feature.icon}</span>

            <p>{feature.text}</p>
          </div>
        ))}
      </div>

      <button className="pro-upgrade-button" type="button">
        <Sparkles size={17} />
        Upgrade to Pro
      </button>
    </div>
  );
}

export default ProFeaturesCard;
