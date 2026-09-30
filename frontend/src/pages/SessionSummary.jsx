import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Gauge,
  TrendingUp,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useLocation, useNavigate } from "react-router-dom";

function formatDuration(value) {
  // Already formatted as MM:SS
  if (typeof value === "string" && value.includes(":")) {
    return value;
  }

  // Convert numeric/string seconds into MM:SS
  const totalSeconds = Number(value);

  if (!Number.isFinite(totalSeconds)) {
    return "00:00";
  }

  const mins = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");

  const secs = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${mins}:${secs}`;
}

function SessionSummary() {
  const navigate = useNavigate();
  const location = useLocation();

  /*
    Get the completed session and patient from LiveSession.

    LiveSession sends:
    {
      state: {
        session: completedSession,
        patient: patient
      }
    }

    We also keep fallback demo data so the page
    still works if opened directly.
  */

  const session = location.state?.session || {
    duration: 42,
    totalInputs: 12,
    peakInputsPerMinute: 3,
    direction: "Left",

    telemetry: [
      { time: "00:00", inputs: 0 },
      { time: "00:05", inputs: 1 },
      { time: "00:10", inputs: 2 },
      { time: "00:15", inputs: 3 },
      { time: "00:20", inputs: 3 },
      { time: "00:25", inputs: 2 },
      { time: "00:30", inputs: 1 },
      { time: "00:35", inputs: 0 },
      { time: "00:40", inputs: 0 },
    ],
  };

  /*
    IMPORTANT:
    The patient is passed separately from LiveSession.

    We also check session.patient so the fallback
    demo structure remains compatible.
  */
  const patient =
    location.state?.patient ||
    session.patient || {
      id: "P-002",
      name: "Anita Rao",
      age: 31,
      gender: "Female",
    };

  const initials = patient.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const totalInputs =
    typeof session.totalInputs === "number"
      ? session.totalInputs
      : 0;

  const peakInputsPerMinute =
    typeof session.peakInputsPerMinute === "number"
      ? session.peakInputsPerMinute
      : 0;

  const telemetry = session.telemetry || [];

  return (
    <div className="page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="page-header">
        <div>
          <p className="breadcrumb">Therapy Session</p>

          <h2>Session Summary</h2>

          <p className="subtitle">
            Review telemetry and session metrics for the completed therapy
            session.
          </p>
        </div>

        <div className="summary-completed-badge">
          <CheckCircle2 size={15} />
          Session Completed
        </div>
      </div>

      {/* =========================
          PATIENT SUMMARY BAR
      ========================= */}

      <section className="summary-patient-bar">

        <div className="summary-patient">

          <div className="summary-avatar">
            {initials}
          </div>

          <div>
            <span className="card-label">PATIENT</span>

            <h3>{patient.name}</h3>

            <p>
              {patient.id} · {patient.age} years · {patient.gender}
            </p>
          </div>

        </div>

        <div className="summary-date">
          <CalendarDays size={15} />
          <span>September 25, 2026</span>
        </div>

      </section>

      {/* =========================
          METRIC CARDS
      ========================= */}

      <div className="summary-metrics">

        <div className="summary-metric-card">

          <div className="summary-metric-icon blue">
            <Clock3 size={21} />
          </div>

          <div>
            <span>SESSION DURATION</span>

            <strong>
              {formatDuration(session.duration)}
            </strong>

            <p>Total therapy time</p>
          </div>

        </div>

        <div className="summary-metric-card">

          <div className="summary-metric-icon purple">
            <Gauge size={21} />
          </div>

          <div>
            <span>TOTAL INPUTS</span>

            <strong>
              {totalInputs}
            </strong>

            <p>Total therapist interventions</p>
          </div>

        </div>

        <div className="summary-metric-card">

          <div className="summary-metric-icon green">
            <Activity size={21} />
          </div>

          <div>
            <span>TELEMETRY READINGS</span>

            <strong>{telemetry.length}</strong>

            <p>Recorded measurements</p>
          </div>

        </div>

      </div>

      {/* =========================
          INTENSITY RANGE
      ========================= */}

      <section className="summary-range-card">

        <div className="summary-range-header">

          <div>
            <span className="card-label">
              INTERVENTION METRICS
            </span>

            <h3>Session Input Summary</h3>
          </div>

          <TrendingUp size={18} />

        </div>

        <div className="summary-range-grid">

          <div>
            <span>Total Inputs</span>

            <strong>
              {totalInputs}
            </strong>
          </div>

          <div>
            <span>Peak Inputs/Min</span>

            <strong>
              {peakInputsPerMinute}
            </strong>
          </div>

          <div>
            <span>Dominant Direction</span>

            <strong>
              {session.direction || "—"}
            </strong>
          </div>

        </div>

      </section>

      {/* =========================
          TELEMETRY CHART
      ========================= */}

      <section className="summary-chart-panel">

        <div className="summary-chart-header">

          <div>
            <span className="card-label">
              SESSION TELEMETRY
            </span>

            <h3>Therapist Interventions</h3>

            <p>
              Rate of manual interventions during this session.
            </p>
          </div>

          <div className="summary-recorded">
            <span className="summary-recorded-dot"></span>
            Recorded
          </div>

        </div>

        <div className="summary-chart">

          <ResponsiveContainer width="100%" height="100%">

            <LineChart
              data={telemetry}
              margin={{
                top: 10,
                right: 15,
                left: 0,
                bottom: 5,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e8edf2"
              />

              <XAxis
                dataKey="time"
                tick={{
                  fill: "#8995a2",
                  fontSize: 9,
                }}
                axisLine={{
                  stroke: "#dfe5eb",
                }}
                tickLine={false}
              />

              <YAxis
                domain={["auto", "auto"]}
                tick={{
                  fill: "#8995a2",
                  fontSize: 9,
                }}
                axisLine={{
                  stroke: "#dfe5eb",
                }}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  border: "1px solid #e2e8ee",
                  borderRadius: "7px",
                  fontSize: "10px",
                  boxShadow:
                    "0 5px 18px rgba(20, 35, 50, 0.08)",
                }}
                formatter={(value) => [
                  `${value}`,
                  "Inputs/Min",
                ]}
              />

              <Line
                type="monotone"
                dataKey="inputs"
                stroke="#2878d2"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 4,
                }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </section>

      {/* =========================
          SESSION NOTES
      ========================= */}

      <section className="summary-notes-card">

        <div>

          <span className="card-label">
            SESSION STATUS
          </span>

          <h3>
            Therapy session completed successfully
          </h3>

          <p>
            Telemetry data was recorded throughout the simulated therapy
            session. The session metrics above provide a summary of the
            therapist interventions required during the session.
          </p>

        </div>

        <div className="summary-status">
          <CheckCircle2 size={17} />
          Complete
        </div>

      </section>

      {/* =========================
          ACTIONS
      ========================= */}

      <div className="summary-actions">

        <button
          className="summary-back-button"
          onClick={() => navigate("/patients")}
        >
          <ArrowLeft size={16} />
          Back to Patients
        </button>

        <button
          className="summary-analytics-button"
          onClick={() => navigate("/analytics")}
        >
          View Patient Analytics
        </button>

      </div>

    </div>
  );
}

export default SessionSummary;