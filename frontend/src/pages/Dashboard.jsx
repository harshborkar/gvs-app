import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePatients } from "../context/PatientContext";

import {
    Activity,
    ArrowRight,
    BarChart3,
    CalendarDays,
    Clock3,
    Play,
    UserRound,
    Users,
    Zap,
} from "lucide-react";

function getInitials(name) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function parseDurationToSeconds(duration) {
    if (typeof duration === "number") {
        return Number.isFinite(duration) ? duration : 0;
    }

    if (typeof duration !== "string") {
        return 0;
    }

    if (!duration.includes(":")) {
        const numericValue = Number(duration);
        return Number.isFinite(numericValue) ? numericValue : 0;
    }

    const [minutes, seconds] = duration.split(":").map(Number);

    if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) {
        return 0;
    }

    return minutes * 60 + seconds;
}

function formatDuration(totalSeconds) {
    if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
        return "—";
    }

    const roundedSeconds = Math.round(totalSeconds);

    const minutes = Math.floor(roundedSeconds / 60);
    const seconds = roundedSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        seconds
    ).padStart(2, "0")}`;
}

function parseIntensity(session) {
    if (typeof session.averageIntensity === "number") {
        return session.averageIntensity;
    }

    if (typeof session.intensity === "number") {
        return session.intensity;
    }

    if (typeof session.intensity === "string") {
        const value = parseFloat(session.intensity);

        return Number.isFinite(value) ? value : 0;
    }

    return 0;
}

function parseSessionDate(dateValue) {
    if (!dateValue) {
        return 0;
    }

    const parsed = new Date(dateValue).getTime();

    return Number.isNaN(parsed) ? 0 : parsed;
}

function Dashboard() {
    const navigate = useNavigate();

    const {
        patients,
        setSelectedPatient,
    } = usePatients();

    /*
     * =========================
     * ALL SESSION DATA
     * =========================
     */

    const allSessions = useMemo(() => {
        return patients.flatMap((patient) =>
            (patient.history || []).map((session) => ({
                ...session,
                patientName: patient.name,
                patientId: patient.id,
            }))
        );
    }, [patients]);

    /*
     * =========================
     * SORTED SESSION DATA
     * =========================
     */

    const sortedSessions = useMemo(() => {
        return [...allSessions].sort((a, b) => {
            return (
                parseSessionDate(b.date) -
                parseSessionDate(a.date)
            );
        });
    }, [allSessions]);

    /*
     * =========================
     * OVERVIEW STATISTICS
     * =========================
     */

    const totalPatients = patients.length;

    const totalSessions = allSessions.length;

    const activePatients = patients.filter(
        (patient) => patient.status === "Active"
    ).length;

    const averageDuration = useMemo(() => {
        if (allSessions.length === 0) {
            return "—";
        }

        const totalSeconds = allSessions.reduce(
            (total, session) =>
                total + parseDurationToSeconds(session.duration),
            0
        );

        const averageSeconds =
            totalSeconds / allSessions.length;

        return formatDuration(averageSeconds);
    }, [allSessions]);

    const averageIntensity = useMemo(() => {
        if (allSessions.length === 0) {
            return "—";
        }

        const validIntensities = allSessions
            .map(parseIntensity)
            .filter((value) => value > 0);

        if (validIntensities.length === 0) {
            return "—";
        }

        const average =
            validIntensities.reduce(
                (total, value) => total + value,
                0
            ) / validIntensities.length;

        return `${average.toFixed(1)} mA`;
    }, [allSessions]);

    /*
     * =========================
     * TODAY'S SESSIONS
     * =========================
     */

    const todaysSessions = useMemo(() => {
        const today = new Date();

        const todayDay = today.getDate();
        const todayMonth = today.getMonth();
        const todayYear = today.getFullYear();

        return allSessions.filter((session) => {
            const sessionDate = new Date(session.date);

            return (
                sessionDate.getDate() === todayDay &&
                sessionDate.getMonth() === todayMonth &&
                sessionDate.getFullYear() === todayYear
            );
        });
    }, [allSessions]);

    /*
     * =========================
     * RECENT PATIENTS
     * =========================
     */

    const recentPatients = useMemo(() => {
        return [...patients]
            .sort((a, b) => {
                const dateA = parseSessionDate(a.lastSession);
                const dateB = parseSessionDate(b.lastSession);

                return dateB - dateA;
            })
            .slice(0, 5);
    }, [patients]);

    /*
     * =========================
     * RECENT SESSIONS
     * =========================
     */

    const recentSessions = useMemo(() => {
        return sortedSessions.slice(0, 6);
    }, [sortedSessions]);

    /*
     * =========================
     * START SESSION
     * =========================
     */

    function handleStartSession(patient) {
        setSelectedPatient(patient);
        navigate("/session");
    }

    return (
        <div className="page">

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="page-header">
                <div>
                    <p className="breadcrumb">Overview</p>

                    <h2>Dashboard</h2>

                    <p className="subtitle">
                        Vestibular rehabilitation telemetry platform
                        overview.
                    </p>
                </div>

                <div className="session-header-status">
                    <span className="session-status-dot" />
                    Simulation Active
                </div>
            </div>

            {/* =========================
                OVERVIEW STATISTICS
            ========================= */}

            <div className="dashboard-stats-grid">

                {/* Total Patients */}

                <div className="dashboard-stat-card">
                    <div className="dashboard-stat-icon blue">
                        <Users size={21} />
                    </div>

                    <div>
                        <span>TOTAL PATIENTS</span>

                        <strong>{totalPatients}</strong>

                        <p>
                            Patients in the platform
                        </p>
                    </div>
                </div>

                {/* Total Sessions */}

                <div className="dashboard-stat-card">
                    <div className="dashboard-stat-icon purple">
                        <Activity size={21} />
                    </div>

                    <div>
                        <span>SESSIONS COMPLETED</span>

                        <strong>{totalSessions}</strong>

                        <p>
                            Recorded therapy sessions
                        </p>
                    </div>
                </div>

                {/* Active Patients */}

                <div className="dashboard-stat-card">
                    <div className="dashboard-stat-icon green">
                        <Zap size={21} />
                    </div>

                    <div>
                        <span>ACTIVE PATIENTS</span>

                        <strong>{activePatients}</strong>

                        <p>
                            Currently active patients
                        </p>
                    </div>
                </div>

                {/* Average Duration */}

                <div className="dashboard-stat-card">
                    <div className="dashboard-stat-icon orange">
                        <Clock3 size={21} />
                    </div>

                    <div>
                        <span>AVG. SESSION TIME</span>

                        <strong>{averageDuration}</strong>

                        <p>
                            Average recorded duration
                        </p>
                    </div>
                </div>
            </div>

            {/* =========================
                MAIN DASHBOARD GRID
            ========================= */}

            <div className="dashboard-content-grid">

                {/* =========================
                    PATIENT OVERVIEW
                ========================= */}

                <section className="dashboard-panel">

                    <div className="dashboard-panel-header">
                        <div>
                            <span className="card-label">
                                PATIENT MANAGEMENT
                            </span>

                            <h3>Recent Patients</h3>

                            <p>
                                Patients currently registered in
                                the platform.
                            </p>
                        </div>

                        <button
                            className="dashboard-link-button"
                            onClick={() =>
                                navigate("/patients")
                            }
                        >
                            View All

                            <ArrowRight size={14} />
                        </button>
                    </div>

                    <div className="dashboard-patient-list">

                        {recentPatients.length === 0 ? (

                            <div className="dashboard-empty">
                                <UserRound size={28} />

                                <strong>
                                    No patients yet
                                </strong>

                                <span>
                                    Add a patient from Patient
                                    Management.
                                </span>
                            </div>

                        ) : (

                            recentPatients.map((patient) => (

                                <div
                                    className="dashboard-patient-row"
                                    key={patient.id}
                                >

                                    <div className="dashboard-patient-avatar">
                                        {getInitials(
                                            patient.name
                                        )}
                                    </div>

                                    <div className="dashboard-patient-info">

                                        <strong>
                                            {patient.name}
                                        </strong>

                                        <span>
                                            {patient.id} ·{" "}
                                            {patient.age} years ·{" "}
                                            {patient.gender}
                                        </span>

                                    </div>

                                    <div className="dashboard-patient-sessions">

                                        <strong>
                                            {patient.sessions || 0}
                                        </strong>

                                        <span>
                                            Sessions
                                        </span>

                                    </div>

                                    <span
                                        className={
                                            patient.status ===
                                            "Active"
                                                ? "dashboard-status active"
                                                : "dashboard-status"
                                        }
                                    >
                                        {patient.status}
                                    </span>

                                    <button
                                        className="dashboard-start-button"
                                        onClick={() =>
                                            handleStartSession(
                                                patient
                                            )
                                        }
                                        title={`Start session with ${patient.name}`}
                                    >
                                        <Play size={13} />
                                    </button>

                                </div>
                            ))
                        )}

                    </div>

                    <button
                        className="dashboard-primary-button"
                        onClick={() =>
                            navigate("/patients")
                        }
                    >
                        <Users size={15} />

                        Manage Patients
                    </button>

                </section>

                {/* =========================
                    QUICK ACTIONS
                ========================= */}

                <section className="dashboard-panel">

                    <div className="dashboard-panel-header">

                        <div>
                            <span className="card-label">
                                QUICK ACTIONS
                            </span>

                            <h3>Therapy Workflow</h3>

                            <p>
                                Start a session or review patient
                                progress.
                            </p>
                        </div>

                    </div>

                    <div className="dashboard-actions">

                        {/* Start Session */}

                        <button
                            className="dashboard-action-card blue"
                            onClick={() =>
                                navigate("/patients")
                            }
                        >
                            <div className="dashboard-action-icon">
                                <Play size={20} />
                            </div>

                            <div>
                                <strong>
                                    Start New Session
                                </strong>

                                <span>
                                    Select a patient and begin
                                    simulated telemetry.
                                </span>
                            </div>

                            <ArrowRight size={16} />
                        </button>

                        {/* Analytics */}

                        <button
                            className="dashboard-action-card purple"
                            onClick={() =>
                                navigate("/analytics")
                            }
                        >
                            <div className="dashboard-action-icon">
                                <BarChart3 size={20} />
                            </div>

                            <div>
                                <strong>
                                    View Progress Analytics
                                </strong>

                                <span>
                                    Review session trends and
                                    patient history.
                                </span>
                            </div>

                            <ArrowRight size={16} />
                        </button>

                        {/* Patient Management */}

                        <button
                            className="dashboard-action-card green"
                            onClick={() =>
                                navigate("/patients")
                            }
                        >
                            <div className="dashboard-action-icon">
                                <UserRound size={20} />
                            </div>

                            <div>
                                <strong>
                                    Patient Management
                                </strong>

                                <span>
                                    Add, search and manage
                                    registered patients.
                                </span>
                            </div>

                            <ArrowRight size={16} />
                        </button>

                    </div>

                </section>

            </div>

            {/* =========================
                RECENT SESSIONS
            ========================= */}

            <section className="dashboard-panel dashboard-sessions-panel">

                <div className="dashboard-panel-header">

                    <div>
                        <span className="card-label">
                            SESSION ACTIVITY
                        </span>

                        <h3>
                            Recent Therapy Sessions
                        </h3>

                        <p>
                            Latest recorded rehabilitation
                            sessions.
                        </p>
                    </div>

                    <CalendarDays size={19} />

                </div>

                {recentSessions.length === 0 ? (

                    <div className="dashboard-empty">

                        <CalendarDays size={28} />

                        <strong>
                            No sessions recorded yet
                        </strong>

                        <span>
                            Completed sessions will appear here.
                        </span>

                    </div>

                ) : (

                    <div className="dashboard-session-table">

                        <div className="dashboard-table-header">
                            <span>Patient</span>
                            <span>Date</span>
                            <span>Duration</span>
                            <span>Avg. Intensity</span>
                            <span>Status</span>
                        </div>

                        {recentSessions.map(
                            (session, index) => (

                                <div
                                    className="dashboard-table-row"
                                    key={`${session.patientId}-${session.date}-${index}`}
                                >

                                    <span>
                                        <strong>
                                            {session.patientName}
                                        </strong>

                                        <small>
                                            {session.patientId}
                                        </small>
                                    </span>

                                    <span>
                                        {session.date}
                                    </span>

                                    <span>
                                        {session.duration}
                                    </span>

                                    <span>
                                        {session.intensity ||
                                            session.averageIntensity
                                                ? `${parseIntensity(
                                                      session
                                                  ).toFixed(1)} mA`
                                                : "—"}
                                    </span>

                                    <span>
                                        <span className="completed-badge">
                                            {session.status ||
                                                "Completed"}
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

export default Dashboard;