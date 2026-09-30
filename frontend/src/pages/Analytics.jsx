import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { usePatients } from "../context/PatientContext";

import {
    Activity,
    BarChart3,
    CalendarDays,
    Clock3,
    TrendingUp,
    UserRound,
} from "lucide-react";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";


// =========================================
// BACKEND
// =========================================

const API_BASE_URL =
    "http://127.0.0.1:8000";


// =========================================
// HELPERS
// =========================================

function parseDuration(duration) {

    if (
        typeof duration !== "string" ||
        !duration.includes(":")
    ) {
        const numericValue =
            Number(duration);

        return Number.isFinite(numericValue)
            ? numericValue
            : 0;
    }

    const [minutes, seconds] =
        duration
            .split(":")
            .map(Number);

    return (
        (Number.isFinite(minutes)
            ? minutes
            : 0) *
            60 +
        (Number.isFinite(seconds)
            ? seconds
            : 0)
    );
}


function formatDuration(totalSeconds) {

    const safeSeconds =
        Number.isFinite(totalSeconds)
            ? Math.max(
                  0,
                  Math.round(totalSeconds)
              )
            : 0;


    const minutes =
        Math.floor(
            safeSeconds / 60
        );


    const seconds =
        safeSeconds % 60;


    return `${String(minutes).padStart(
        2,
        "0"
    )}:${String(seconds).padStart(
        2,
        "0"
    )}`;
}


// =========================================
// ANALYTICS
// =========================================

function Analytics() {

    const {
        patients,
        selectedPatient,
        setSelectedPatient,
    } = usePatients();


    // =========================================
    // SELECTED PATIENT
    // =========================================

    const [
        selectedPatientId,
        setSelectedPatientId,
    ] = useState(
        selectedPatient?.id ||
            patients[0]?.id ||
            ""
    );


    const activePatient =
        patients.find(
            (patient) =>
                patient.id ===
                selectedPatientId
        ) ||
        selectedPatient ||
        patients[0];


    // =========================================
    // BACKEND SESSION DATA
    // =========================================

    const [history, setHistory] =
        useState([]);


    const [loading, setLoading] =
        useState(false);


    const [error, setError] =
        useState(null);


    // =========================================
    // LOAD PATIENT SESSIONS
    // =========================================

    useEffect(() => {

        async function loadPatientSessions() {

            if (
                !activePatient ||
                !activePatient.databaseId
            ) {
                setHistory([]);
                return;
            }


            try {

                setLoading(true);

                setError(null);


                const response =
                    await fetch(
                        `${API_BASE_URL}/api/patients/${activePatient.databaseId}/sessions`
                    );


                if (!response.ok) {

                    throw new Error(
                        "Failed to load patient sessions."
                    );
                }


                const sessions =
                    await response.json();


                /*
                 * FastAPI already returns sessions
                 * newest first.
                 */

                const mappedSessions =
                    sessions.map(
                        (session) => ({

                            id:
                                session.session_code,

                            databaseId:
                                session.id,

                            date:
                                session.date,

                            duration:
                                session.duration,

                            totalInputs:
                                session.total_inputs ??
                                0,

                            peakInputsPerMinute:
                                session.peak_inputs_per_minute ??
                                0,

                            dominantDirection:
                                session.dominant_direction ||
                                "Unknown",

                            status:
                                session.status ||
                                "Completed",

                            /*
                             * Keep the same
                             * display format used
                             * throughout the frontend.
                             */

                            inputs:
                                typeof session.total_inputs ===
                                "number"
                                    ? session.total_inputs
                                    : 0,
                        })
                    );


                setHistory(
                    mappedSessions
                );

            } catch (loadError) {

                console.error(
                    "Failed to load analytics:",
                    loadError
                );


                setError(
                    loadError.message ||
                        "Failed to load analytics."
                );


                setHistory([]);

            } finally {

                setLoading(false);

            }
        }


        loadPatientSessions();

    }, [
        activePatient?.databaseId,
    ]);


    // =========================================
    // ANALYTICS CHART DATA
    // =========================================

    const analyticsData =
        useMemo(() => {

            /*
             * Backend history is newest → oldest.
             *
             * Reverse it so the chart displays
             * Session 1 → Session 2 → Session 3
             * chronologically.
             */

            return history
                .slice()
                .reverse()
                .map(
                    (
                        session,
                        index
                    ) => ({

                        session:
                            `Session ${
                                index + 1
                            }`,

                        date:
                            session.date,

                        inputs:
                            Number(
                                session.totalInputs ||
                                    0
                            ),

                        duration:
                            parseDuration(
                                session.duration
                            ),

                        durationLabel:
                            session.duration,
                    })
                );

        }, [history]);


    // =========================================
    // STATISTICS
    // =========================================

    const totalSessions =
        history.length;


    const averageInputs =
        history.length > 0
            ? Math.round(
                  history.reduce(
                      (
                          total,
                          session
                      ) =>
                          total +
                          Number(
                              session.totalInputs ||
                                  0
                          ),
                      0
                  ) /
                  history.length
              )
            : "—";


    const averageDuration =
        history.length > 0
            ? formatDuration(
                  Math.round(
                      history.reduce(
                          (
                              total,
                              session
                          ) =>
                              total +
                              parseDuration(
                                  session.duration
                              ),
                          0
                      ) /
                          history.length
                  )
              )
            : "—";


    const latestInputs =
        history.length > 0
            ? history[0]
                  .totalInputs
            : "—";


    // =========================================
    // PATIENT SELECTOR
    // =========================================

    function handlePatientChange(
        event
    ) {

        const patientId =
            event.target.value;


        setSelectedPatientId(
            patientId
        );


        const patient =
            patients.find(
                (item) =>
                    item.id ===
                    patientId
            );


        if (patient) {

            setSelectedPatient(
                patient
            );
        }
    }


    // =========================================
    // NO PATIENT
    // =========================================

    if (!activePatient) {

        return (

            <div className="page">

                <div className="page-header">

                    <div>

                        <p className="breadcrumb">
                            Patient Analytics
                        </p>

                        <h2>
                            Progress Analytics
                        </h2>

                        <p className="subtitle">
                            Review rehabilitation
                            session trends and
                            patient progress.
                        </p>

                    </div>

                </div>


                <div className="analytics-empty">

                    <UserRound
                        size={32}
                    />

                    <strong>
                        No patients available
                    </strong>

                    <span>
                        Add a patient from Patient
                        Management to view
                        analytics.
                    </span>

                </div>

            </div>
        );
    }


    // =========================================
    // UI
    // =========================================

    return (

        <div className="page">

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="page-header">

                <div>

                    <p className="breadcrumb">
                        Patient Analytics
                    </p>

                    <h2>
                        Progress Analytics
                    </h2>

                    <p className="subtitle">
                        Review rehabilitation
                        session trends and
                        patient progress.
                    </p>

                </div>


                <div className="analytics-patient-selector">

                    <UserRound
                        size={16}
                    />

                    <select
                        value={
                            activePatient.id
                        }
                        onChange={
                            handlePatientChange
                        }
                    >

                        {patients.map(
                            (patient) => (

                                <option
                                    key={
                                        patient.id
                                    }
                                    value={
                                        patient.id
                                    }
                                >

                                    {patient.name}
                                    {" · "}
                                    {patient.id}

                                </option>
                            )
                        )}

                    </select>

                </div>

            </div>


            {/* =========================
                DATABASE STATUS
            ========================= */}

            {loading && (

                <div
                    style={{
                        marginBottom:
                            "16px",

                        padding:
                            "10px 14px",

                        borderRadius:
                            "7px",

                        background:
                            "#f2f7fc",

                        border:
                            "1px solid #d8e7f5",

                        color:
                            "#2878d2",

                        fontSize:
                            "12px",
                    }}
                >
                    Loading session data from
                    the backend...
                </div>

            )}


            {error && (

                <div
                    style={{
                        marginBottom:
                            "16px",

                        padding:
                            "12px 16px",

                        borderRadius:
                            "8px",

                        background:
                            "#fff1f1",

                        border:
                            "1px solid #f1caca",

                        color:
                            "#b42318",

                        fontSize:
                            "13px",
                    }}
                >
                    {error}
                </div>

            )}


            {/* =========================
                PATIENT OVERVIEW
            ========================= */}

            <div className="analytics-patient-card">

                <div className="analytics-patient-profile">

                    <div className="large-avatar">

                        {activePatient.name
                            .split(" ")
                            .map(
                                (part) =>
                                    part[0]
                            )
                            .join("")
                            .slice(
                                0,
                                2
                            )
                            .toUpperCase()}

                    </div>


                    <div>

                        <span className="card-label">
                            PATIENT PROFILE
                        </span>

                        <h3>
                            {activePatient.name}
                        </h3>

                        <p>
                            {activePatient.id}
                            {" · "}
                            {activePatient.gender}
                            {" · "}
                            {activePatient.age}
                            {" years"}
                        </p>

                    </div>

                </div>


                <div className="analytics-patient-status">

                    <span className="status-dot" />

                    {activePatient.status}

                </div>

            </div>


            {/* =========================
                STATISTICS
            ========================= */}

            <div className="analytics-stats-grid">

                {/* Total Sessions */}

                <div className="analytics-stat-card">

                    <div className="analytics-stat-icon blue">

                        <Activity
                            size={21}
                        />

                    </div>


                    <div>

                        <span>
                            TOTAL SESSIONS
                        </span>

                        <strong>
                            {totalSessions}
                        </strong>

                        <p>
                            Recorded therapy
                            sessions
                        </p>

                    </div>

                </div>


                {/* Average Intensity */}

                <div className="analytics-stat-card">

                    <div className="analytics-stat-icon purple">

                        <TrendingUp
                            size={21}
                        />

                    </div>


                    <div>

                        <span>
                            AVG. INPUTS
                        </span>

                        <strong>

                            {averageInputs}

                        </strong>

                        <p>
                            Across recorded
                            sessions
                        </p>

                    </div>

                </div>


                {/* Average Duration */}

                <div className="analytics-stat-card">

                    <div className="analytics-stat-icon green">

                        <Clock3
                            size={21}
                        />

                    </div>


                    <div>

                        <span>
                            AVG. DURATION
                        </span>

                        <strong>
                            {averageDuration}
                        </strong>

                        <p>
                            Average session
                            length
                        </p>

                    </div>

                </div>


                {/* Latest Intensity */}

                <div className="analytics-stat-card">

                    <div className="analytics-stat-icon orange">

                        <BarChart3
                            size={21}
                        />

                    </div>


                    <div>

                        <span>
                            LATEST INPUTS
                        </span>

                        <strong>

                            {latestInputs !==
                            "—"
                                ? Number(
                                      latestInputs
                                  )
                                : "—"}

                        </strong>

                        <p>
                            Most recent
                            recorded session
                        </p>

                    </div>

                </div>

            </div>


            {/* =========================
                CHARTS
            ========================= */}

            <div className="analytics-chart-grid">

                {/* =========================
                    INTENSITY TREND
                ========================= */}

                <section className="analytics-panel">

                    <div className="analytics-panel-header">

                        <div>

                            <span className="card-label">
                                SESSION TREND
                            </span>

                            <h3>
                                Input Trend
                            </h3>

                            <p>
                                Total therapist
                                inputs across
                                recorded sessions.
                            </p>

                        </div>


                        <TrendingUp
                            size={19}
                        />

                    </div>


                    {analyticsData.length ===
                    0 ? (

                        <div className="analytics-chart-empty">

                            No session data
                            available yet.

                        </div>

                    ) : (

                        <div className="analytics-chart">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <LineChart
                                    data={
                                        analyticsData
                                    }
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e8edf2"
                                    />

                                    <XAxis
                                        dataKey="session"
                                        tick={{
                                            fontSize:
                                                9,
                                            fill:
                                                "#8995a2",
                                        }}
                                        tickLine={
                                            false
                                        }
                                        axisLine={{
                                            stroke:
                                                "#dfe5ea",
                                        }}
                                    />

                                    <YAxis
                                        domain={[
                                            "auto",
                                            "auto",
                                        ]}
                                        tick={{
                                            fontSize:
                                                9,
                                            fill:
                                                "#8995a2",
                                        }}
                                        tickLine={
                                            false
                                        }
                                        axisLine={{
                                            stroke:
                                                "#dfe5ea",
                                        }}
                                    />

                                    <Tooltip
                                        contentStyle={{
                                            fontSize:
                                                "11px",

                                            borderRadius:
                                                "6px",

                                            border:
                                                "1px solid #e4e9ef",

                                            boxShadow:
                                                "0 4px 12px rgba(0, 0, 0, 0.08)",
                                        }}
                                        formatter={(
                                            value
                                        ) => [
                                            `${value}`,
                                            "Inputs",
                                        ]}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="inputs"
                                        stroke="#2878d2"
                                        strokeWidth={
                                            2.5
                                        }
                                        dot={{
                                            r: 3,
                                        }}
                                        activeDot={{
                                            r: 5,
                                        }}
                                    />

                                </LineChart>

                            </ResponsiveContainer>

                        </div>
                    )}

                </section>


                {/* =========================
                    DURATION TREND
                ========================= */}

                <section className="analytics-panel">

                    <div className="analytics-panel-header">

                        <div>

                            <span className="card-label">
                                SESSION DURATION
                            </span>

                            <h3>
                                Therapy Duration
                            </h3>

                            <p>
                                Duration of each
                                recorded
                                rehabilitation
                                session.
                            </p>

                        </div>


                        <Clock3
                            size={19}
                        />

                    </div>


                    {analyticsData.length ===
                    0 ? (

                        <div className="analytics-chart-empty">

                            No session data
                            available yet.

                        </div>

                    ) : (

                        <div className="analytics-chart">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <BarChart
                                    data={
                                        analyticsData
                                    }
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e8edf2"
                                    />

                                    <XAxis
                                        dataKey="session"
                                        tick={{
                                            fontSize:
                                                9,
                                            fill:
                                                "#8995a2",
                                        }}
                                        tickLine={
                                            false
                                        }
                                        axisLine={{
                                            stroke:
                                                "#dfe5ea",
                                        }}
                                    />

                                    <YAxis
                                        tick={{
                                            fontSize:
                                                9,
                                            fill:
                                                "#8995a2",
                                        }}
                                        tickLine={
                                            false
                                        }
                                        axisLine={{
                                            stroke:
                                                "#dfe5ea",
                                        }}
                                        tickFormatter={(
                                            value
                                        ) =>
                                            `${Math.floor(
                                                value /
                                                    60
                                            )}m`
                                        }
                                    />

                                    <Tooltip
                                        contentStyle={{
                                            fontSize:
                                                "11px",

                                            borderRadius:
                                                "6px",

                                            border:
                                                "1px solid #e4e9ef",

                                            boxShadow:
                                                "0 4px 12px rgba(0, 0, 0, 0.08)",
                                        }}
                                        formatter={(
                                            value
                                        ) => [
                                            formatDuration(
                                                value
                                            ),
                                            "Duration",
                                        ]}
                                    />

                                    <Bar
                                        dataKey="duration"
                                        fill="#7159c7"
                                        radius={[
                                            4,
                                            4,
                                            0,
                                            0,
                                        ]}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>
                    )}

                </section>

            </div>


            {/* =========================
                SESSION HISTORY
            ========================= */}

            <section className="analytics-history-panel">

                <div className="analytics-panel-header">

                    <div>

                        <span className="card-label">
                            SESSION HISTORY
                        </span>

                        <h3>
                            Recent Therapy
                            Sessions
                        </h3>

                        <p>
                            Historical session data
                            recorded for this
                            patient.
                        </p>

                    </div>


                    <CalendarDays
                        size={19}
                    />

                </div>


                {history.length ===
                0 ? (

                    <div className="analytics-history-empty">

                        No therapy sessions
                        recorded yet.

                    </div>

                ) : (

                    <div className="analytics-history-table">

                        <div className="analytics-history-header">

                            <span>
                                Session
                            </span>

                            <span>
                                Date
                            </span>

                            <span>
                                Duration
                            </span>

                            <span>
                                Total Inputs
                            </span>

                            <span>
                                Status
                            </span>

                        </div>


                        {history.map(
                            (
                                session,
                                index
                            ) => (

                                <div
                                    className="analytics-history-row"
                                    key={
                                        session.databaseId ||
                                        `${session.date}-${index}`
                                    }
                                >

                                    <span>

                                        <strong>
                                            Session #
                                            {
                                                history.length -
                                                    index
                                            }
                                        </strong>

                                    </span>


                                    <span>
                                        {
                                            session.date
                                        }
                                    </span>


                                    <span>
                                        {
                                            session.duration
                                        }
                                    </span>


                                    <span>
                                        {
                                            session.inputs
                                        }
                                    </span>


                                    <span>

                                        <span className="completed-badge">

                                            {
                                                session.status ||
                                                "Completed"
                                            }

                                        </span>

                                    </span>

                                </div>
                            )
                        )}

                    </div>
                )}

            </section>

        </div>
    );
}


export default Analytics;