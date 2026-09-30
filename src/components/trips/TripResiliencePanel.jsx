import { useEffect, useRef, useState } from "react";

import {
  Activity,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  CloudRain,
  MapPin,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import {
  applyTripRecovery,
  stressTestTrip,
} from "../../services/resilience.service";

import "../../styles/trip-resilience.css";

const SCENARIO_OPTIONS = [
  {
    value: "ARRIVAL_DELAY",
    label: "Arrival Delay",
  },
  {
    value: "WEATHER_DISRUPTION",
    label: "Weather Disruption",
  },
  {
    value: "REDUCED_DAY_TIME",
    label: "Reduced Day Time",
  },
  {
    value: "ACTIVITY_UNAVAILABLE",
    label: "Activity Unavailable",
  },
];

function createScenario({
  type = "ARRIVAL_DELAY",
  targetNodeId = "",
  hours = 8,
} = {}) {
  return {
    localId: `${Date.now()}-${Math.random()}`,
    type,
    targetNodeId: String(targetNodeId || ""),
    hours,
  };
}

function buildInitialScenarios(trip) {
  const stops = Array.isArray(trip?.stops) ? trip.stops : [];

  if (stops.length === 0) {
    return [];
  }

  const firstStop = stops[0];
  const lastStop = stops[stops.length - 1];

  if (stops.length === 1) {
    return [
      createScenario({
        type: "ARRIVAL_DELAY",
        targetNodeId: firstStop.id,
        hours: 8,
      }),
    ];
  }

  return [
    createScenario({
      type: "ARRIVAL_DELAY",
      targetNodeId: firstStop.id,
      hours: 8,
    }),

    createScenario({
      type: "WEATHER_DISRUPTION",
      targetNodeId: lastStop.id,
      hours: 6,
    }),
  ];
}

function scenarioNeedsHours(type) {
  return type !== "ACTIVITY_UNAVAILABLE";
}

function buildApiScenario(scenario) {
  const baseScenario = {
    type: scenario.type,
    targetNodeId: String(scenario.targetNodeId),
  };

  const hours = Number(scenario.hours);

  if (scenario.type === "ARRIVAL_DELAY") {
    return {
      ...baseScenario,
      delayHours: hours,
    };
  }

  if (
    scenario.type === "WEATHER_DISRUPTION" ||
    scenario.type === "REDUCED_DAY_TIME"
  ) {
    return {
      ...baseScenario,
      lostHours: hours,
    };
  }

  return baseScenario;
}

function humanize(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getStopName(trip, nodeId) {
  const stop = trip?.stops?.find((item) => String(item.id) === String(nodeId));

  return stop?.city || stop?.locationName || "Trip destination";
}

function getSeverityIcon(severity) {
  if (severity === "high") {
    return <AlertTriangle size={17} />;
  }

  if (severity === "moderate") {
    return <Activity size={17} />;
  }

  return <CheckCircle2 size={17} />;
}

/* =========================================================
   CUSTOM DROPDOWN
========================================================= */

function TripResilienceSelect({
  value,
  options = [],
  onChange,
  icon: Icon,
  disabled = false,
  ariaLabel,
}) {
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef(null);

  const selectedOption =
    options.find((option) => String(option.value) === String(value)) ||
    options[0] ||
    null;

  useEffect(() => {
    function handleOutsideClick(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);

      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleSelect(optionValue) {
    onChange(String(optionValue));

    setOpen(false);
  }

  return (
    <div
      ref={wrapperRef}
      className={`trip-resilience-dropdown ${
        open ? "trip-resilience-dropdown--open" : ""
      }`}
    >
      <button
        type="button"
        className="trip-resilience-dropdown__trigger"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {Icon && <Icon size={15} className="trip-resilience-dropdown__icon" />}

        <span className="trip-resilience-dropdown__value">
          {selectedOption?.label || "Select"}
        </span>

        <ChevronDown size={16} className="trip-resilience-dropdown__arrow" />
      </button>

      {open && !disabled && (
        <div className="trip-resilience-dropdown__menu" role="listbox">
          {options.map((option) => {
            const active = String(option.value) === String(value);

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                className={`trip-resilience-dropdown__option ${
                  active ? "trip-resilience-dropdown__option--active" : ""
                }`}
                onClick={() => handleSelect(option.value)}
              >
                <span>{option.label}</span>

                {active && <Check size={15} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   COMPONENT
========================================================= */

function TripResiliencePanel({ trip, onTripUpdated }) {
  const [scenarios, setScenarios] = useState(() => buildInitialScenarios(trip));

  const [report, setReport] = useState(null);

  const [running, setRunning] = useState(false);

  const [error, setError] = useState("");

  const [showDetails, setShowDetails] = useState(false);

  const [pendingRecovery, setPendingRecovery] = useState(null);

  const [applyingRecovery, setApplyingRecovery] = useState(false);

  const [recoverySuccess, setRecoverySuccess] = useState("");

  /* =========================================================
     UPDATE SCENARIO
  ========================================================= */

  function updateScenario(localId, field, value) {
    setScenarios((current) =>
      current.map((scenario) =>
        scenario.localId === localId
          ? {
              ...scenario,
              [field]: value,
            }
          : scenario,
      ),
    );

    setReport(null);
    setError("");
    setRecoverySuccess("");
  }

  /* =========================================================
     ADD SCENARIO
  ========================================================= */

  function handleAddScenario() {
    if (scenarios.length >= 10) {
      setError("A maximum of 10 stress-test scenarios can be added.");

      return;
    }

    const firstStop = trip?.stops?.[0];

    if (!firstStop) {
      setError("This trip does not contain any destinations.");

      return;
    }

    setScenarios((current) => [
      ...current,

      createScenario({
        type: "ARRIVAL_DELAY",

        targetNodeId: firstStop.id,

        hours: 4,
      }),
    ]);

    setReport(null);
    setError("");
    setRecoverySuccess("");
  }

  /* =========================================================
     REMOVE SCENARIO
  ========================================================= */

  function handleRemoveScenario(localId) {
    setScenarios((current) =>
      current.filter((scenario) => scenario.localId !== localId),
    );

    setReport(null);
    setError("");
    setRecoverySuccess("");
  }

  /* =========================================================
     VALIDATION
  ========================================================= */

  function validateScenarios() {
    if (scenarios.length === 0) {
      return "Add at least one stress-test scenario.";
    }

    for (const scenario of scenarios) {
      if (!scenario.type) {
        return "Choose a scenario type.";
      }

      if (!scenario.targetNodeId) {
        return "Choose a destination for every scenario.";
      }

      if (scenarioNeedsHours(scenario.type)) {
        const hours = Number(scenario.hours);

        if (!Number.isFinite(hours) || hours <= 0) {
          return "Scenario hours must be greater than 0.";
        }

        if (hours > 72) {
          return "Scenario hours cannot exceed 72 hours.";
        }
      }
    }

    return "";
  }

  /* =========================================================
     RUN STRESS TEST
  ========================================================= */

  async function handleStressTest() {
    if (!trip?.id || running || applyingRecovery) {
      return;
    }

    const validationError = validateScenarios();

    if (validationError) {
      setError(validationError);

      return;
    }

    try {
      setRunning(true);
      setError("");
      setRecoverySuccess("");

      const apiScenarios = scenarios.map(buildApiScenario);

      const result = await stressTestTrip(trip.id, apiScenarios);

      setReport(result);

      setShowDetails(true);
    } catch (requestError) {
      setError(requestError.message || "Unable to stress-test this trip.");
    } finally {
      setRunning(false);
    }
  }

  /* =========================================================
     REQUEST RECOVERY
  ========================================================= */

  function requestRecoveryApplication(action) {
    if (!action?.application?.canApply) {
      return;
    }

    setPendingRecovery(action);

    setError("");
    setRecoverySuccess("");
  }

  /* =========================================================
     CANCEL RECOVERY
  ========================================================= */

  function cancelRecoveryApplication() {
    if (applyingRecovery) {
      return;
    }

    setPendingRecovery(null);
  }

  /* =========================================================
     CONFIRM RECOVERY
  ========================================================= */

  async function confirmRecoveryApplication() {
    if (!pendingRecovery || applyingRecovery) {
      return;
    }

    try {
      setApplyingRecovery(true);

      setError("");
      setRecoverySuccess("");

      const result = await applyTripRecovery(trip.id, pendingRecovery);

      const updatedTrip = result.trip;

      if (!updatedTrip) {
        throw new Error(
          "TripWise applied the recovery but did not return the updated trip.",
        );
      }

      if (typeof onTripUpdated === "function") {
        onTripUpdated(updatedTrip);
      }

      setScenarios(buildInitialScenarios(updatedTrip));

      setReport(null);

      setShowDetails(false);

      setPendingRecovery(null);

      setRecoverySuccess(
        "Recovery applied successfully. Your itinerary has been updated.",
      );
    } catch (requestError) {
      setError(requestError.message || "Unable to apply this recovery.");
    } finally {
      setApplyingRecovery(false);
    }
  }

  if (!trip) {
    return null;
  }

  const destinationOptions = (trip.stops || []).map((stop) => ({
    value: String(stop.id),

    label: stop.city || stop.locationName,
  }));

  return (
    <section className="trip-resilience">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="trip-resilience__header">
        <div className="trip-resilience__heading">
          <div className="trip-resilience__icon">
            <ShieldCheck size={22} />
          </div>

          <div>
            <span>TRIP RESILIENCE</span>

            <h2>Stress-test your journey</h2>

            <p>
              Simulate disruptions and see how well your itinerary can recover
              before anything changes.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="trip-resilience__run"
          onClick={handleStressTest}
          disabled={running || applyingRecovery || scenarios.length === 0}
        >
          {running ? (
            <>
              <RefreshCw size={17} className="trip-resilience__spin" />
              Testing...
            </>
          ) : report ? (
            <>
              <RefreshCw size={17} />
              Run Again
            </>
          ) : (
            <>
              <Activity size={17} />
              Run Test
            </>
          )}
        </button>
      </div>

      {/* =====================================================
          SCENARIO BUILDER
      ===================================================== */}

      <div className="trip-resilience__scenario-builder">
        <div className="trip-resilience__scenario-heading">
          <div>
            <span>TEST CONDITIONS</span>

            <h3>Choose disruption scenarios</h3>

            <p>
              Configure what could go wrong and which destination should be
              affected.
            </p>
          </div>

          <button
            type="button"
            className="trip-resilience__add-scenario"
            onClick={handleAddScenario}
            disabled={running || applyingRecovery || scenarios.length >= 10}
          >
            <Plus size={16} />
            Add Scenario
          </button>
        </div>

        <div className="trip-resilience__scenario-list">
          {scenarios.map((scenario, index) => (
            <div
              className="trip-resilience__scenario-row"
              key={scenario.localId}
            >
              <div className="trip-resilience__scenario-number">
                {index + 1}
              </div>

              <div className="trip-resilience__scenario-fields">
                {/* SCENARIO */}

                <div className="trip-resilience__field">
                  <label>Scenario</label>

                  <TripResilienceSelect
                    value={scenario.type}
                    options={SCENARIO_OPTIONS}
                    icon={Activity}
                    disabled={running || applyingRecovery}
                    ariaLabel="Choose disruption scenario"
                    onChange={(value) =>
                      updateScenario(scenario.localId, "type", value)
                    }
                  />
                </div>

                {/* DESTINATION */}

                <div className="trip-resilience__field">
                  <label>Destination</label>

                  <TripResilienceSelect
                    value={scenario.targetNodeId}
                    options={destinationOptions}
                    icon={MapPin}
                    disabled={running || applyingRecovery}
                    ariaLabel="Choose destination"
                    onChange={(value) =>
                      updateScenario(scenario.localId, "targetNodeId", value)
                    }
                  />
                </div>

                {/* HOURS */}

                {scenarioNeedsHours(scenario.type) ? (
                  <div className="trip-resilience__field trip-resilience__field--hours">
                    <label htmlFor={`scenario-hours-${scenario.localId}`}>
                      Hours
                    </label>

                    <div className="trip-resilience__hours">
                      <Clock3 size={15} />

                      <input
                        id={`scenario-hours-${scenario.localId}`}
                        type="number"
                        min="1"
                        max="72"
                        step="1"
                        value={scenario.hours}
                        disabled={running || applyingRecovery}
                        onChange={(event) =>
                          updateScenario(
                            scenario.localId,
                            "hours",
                            event.target.value,
                          )
                        }
                      />

                      <span>hrs</span>
                    </div>
                  </div>
                ) : (
                  <div className="trip-resilience__field trip-resilience__field--unavailable">
                    <label>Effect</label>

                    <div className="trip-resilience__unavailable">
                      Unavailable
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="trip-resilience__remove-scenario"
                onClick={() => handleRemoveScenario(scenario.localId)}
                disabled={running || applyingRecovery}
                aria-label={`Remove scenario ${index + 1}`}
                title="Remove scenario"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {scenarios.length === 0 && (
          <div className="trip-resilience__scenario-empty">
            No scenarios added.
          </div>
        )}

        <div className="trip-resilience__scenario-footer">
          <span>
            {scenarios.length}
            /10 scenarios
          </span>

          <button
            type="button"
            className="trip-resilience__run-large"
            onClick={handleStressTest}
            disabled={running || applyingRecovery || scenarios.length === 0}
          >
            {running ? (
              <>
                <RefreshCw size={17} className="trip-resilience__spin" />
                Running stress test...
              </>
            ) : (
              <>
                <ShieldCheck size={17} />
                Stress Test My Trip
              </>
            )}
          </button>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="trip-resilience__error" role="alert">
          <AlertTriangle size={18} />

          <span>{error}</span>
        </div>
      )}

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {recoverySuccess && (
        <div className="trip-resilience__success">
          <CheckCircle2 size={18} />

          <span>{recoverySuccess}</span>
        </div>
      )}

      {/* =====================================================
          PREVIEW
      ===================================================== */}

      {!report && !running && (
        <div className="trip-resilience__preview">
          <div>
            <CloudRain size={18} />

            <span>Weather disruption</span>
          </div>

          <div>
            <Activity size={18} />

            <span>Arrival delay</span>
          </div>

          <div>
            <ShieldCheck size={18} />

            <span>Recovery planning</span>
          </div>
        </div>
      )}

      {/* =====================================================
          RESULTS
      ===================================================== */}

      {report && (
        <>
          <div className="trip-resilience__summary">
            <div className="trip-resilience__score-card">
              <div className="trip-resilience__score-heading">
                <span>RESILIENCE SCORE</span>

                <strong>{report.resilience.label}</strong>
              </div>

              <div className="trip-resilience__score">
                <strong>{report.resilience.score}</strong>

                <span>/100</span>
              </div>

              <div className="trip-resilience__score-track">
                <div
                  className="trip-resilience__score-fill"
                  style={{
                    width: `${report.resilience.score}%`,
                  }}
                />
              </div>

              <p>
                Risk level: <strong>{report.resilience.riskLevel}</strong>
              </p>
            </div>

            <div className="trip-resilience__metric">
              <span>Risks detected</span>

              <strong>{report.riskSummary.total}</strong>

              <small>
                {report.riskSummary.high} high · {report.riskSummary.moderate}{" "}
                moderate
              </small>
            </div>

            <div className="trip-resilience__metric">
              <span>Recovery plans</span>

              <strong>{report.recoverySummary.recoverableScenarios}</strong>

              <small>
                {report.recoverySummary.totalActions} recovery actions
              </small>
            </div>
          </div>

          {/* DETAILS TOGGLE */}

          <button
            type="button"
            className="trip-resilience__details-toggle"
            onClick={() => setShowDetails((current) => !current)}
          >
            <span>
              {showDetails
                ? "Hide resilience analysis"
                : "View resilience analysis"}
            </span>

            {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showDetails && (
            <div className="trip-resilience__details">
              {/* =================================================
                  RISKS
              ================================================= */}

              <div className="trip-resilience__block">
                <div className="trip-resilience__block-heading">
                  <div>
                    <span>RISKS</span>

                    <h3>Detected impact</h3>
                  </div>

                  <span className="trip-resilience__count">
                    {report.riskSummary.total}
                  </span>
                </div>

                <div className="trip-resilience__risk-list">
                  {report.risks.length === 0 ? (
                    <div className="trip-resilience__scenario-empty">
                      No meaningful risks were detected.
                    </div>
                  ) : (
                    report.risks.map((risk, index) => (
                      <article
                        className={`trip-resilience__risk trip-resilience__risk--${risk.severity}`}
                        key={`${risk.scenarioId || risk.type}-${index}`}
                      >
                        <div className="trip-resilience__risk-icon">
                          {getSeverityIcon(risk.severity)}
                        </div>

                        <div className="trip-resilience__risk-content">
                          <div className="trip-resilience__risk-top">
                            <strong>{humanize(risk.type)}</strong>

                            <span>{risk.severity}</span>
                          </div>

                          <small>{getStopName(trip, risk.nodeId)}</small>

                          <p>{risk.message}</p>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>

              {/* =================================================
                  RECOVERY
              ================================================= */}

              <div className="trip-resilience__block">
                <div className="trip-resilience__block-heading">
                  <div>
                    <span>RECOVERY</span>

                    <h3>Recovery options</h3>
                  </div>

                  <ShieldCheck size={20} />
                </div>

                <div className="trip-resilience__recovery-list">
                  {report.recoveryPlans.flatMap((plan, planIndex) => {
                    const actions = Array.isArray(plan.actions)
                      ? plan.actions
                      : [];

                    return actions.map((action, actionIndex) => (
                      <article
                        className="trip-resilience__recovery"
                        key={`${plan.scenarioId}-${action.type}-${actionIndex}`}
                      >
                        <div className="trip-resilience__recovery-number">
                          {planIndex + 1}
                        </div>

                        <div className="trip-resilience__recovery-content">
                          <span>
                            {humanize(plan.scenarioType)}

                            {actionIndex === 0 && " · RECOMMENDED"}
                          </span>

                          <h4>{action.title}</h4>

                          <p>{action.description}</p>

                          <div className="trip-resilience__recovery-meta">
                            <span>{action.feasibility}</span>

                            {action.estimatedHours !== null &&
                              action.estimatedHours !== undefined && (
                                <span>{action.estimatedHours} hrs</span>
                              )}
                          </div>

                          {action.application && (
                            <div className="trip-resilience__application">
                              <div>
                                <strong>
                                  {humanize(action.application.mode)}
                                </strong>

                                <p>{action.application.reason}</p>
                              </div>

                              {action.application.canApply && (
                                <button
                                  type="button"
                                  className="trip-resilience__apply-button"
                                  onClick={() =>
                                    requestRecoveryApplication(action)
                                  }
                                >
                                  Apply Recovery
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </article>
                    ));
                  })}
                </div>

                <div className="trip-resilience__safe-note">
                  <ShieldCheck size={17} />

                  <p>
                    Stress-test results are simulations. Your saved itinerary
                    changes only after you explicitly confirm an applicable
                    recovery action.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* =====================================================
          APPLY CONFIRMATION
      ===================================================== */}

      {pendingRecovery && (
        <div className="trip-resilience__confirm-overlay">
          <div
            className="trip-resilience__confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="recovery-confirm-title"
          >
            <div className="trip-resilience__confirm-icon">
              <AlertTriangle size={22} />
            </div>

            <span>APPLY RECOVERY</span>

            <h3 id="recovery-confirm-title">Update your saved trip?</h3>

            <p>TripWise will permanently apply this recovery action:</p>

            <div className="trip-resilience__confirm-action">
              <strong>{pendingRecovery.title}</strong>

              <p>{pendingRecovery.description}</p>

              <small>
                Destination: {getStopName(trip, pendingRecovery.targetNodeId)}
              </small>
            </div>

            <div className="trip-resilience__confirm-warning">
              <AlertTriangle size={16} />

              <span>This action will modify your saved itinerary.</span>
            </div>

            <div className="trip-resilience__confirm-buttons">
              <button
                type="button"
                className="trip-resilience__confirm-cancel"
                onClick={cancelRecoveryApplication}
                disabled={applyingRecovery}
              >
                Cancel
              </button>

              <button
                type="button"
                className="trip-resilience__confirm-apply"
                onClick={confirmRecoveryApplication}
                disabled={applyingRecovery}
              >
                {applyingRecovery ? "Applying..." : "Apply Recovery"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default TripResiliencePanel;
