import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePatients } from "../context/PatientContext";
import {
    Activity,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Pause,
    Play,
    RotateCcw,
    Square,
    Timer,
    PlusCircle,
} from "lucide-react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

// =========================================
// HELPERS
// =========================================
function getInitials(name) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function LiveSession() {
    const { selectedPatient } = usePatients();
    const navigate = useNavigate();
    if (!selectedPatient) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <p className="breadcrumb">Therapy Session</p>
                        <h2>No Patient Selected</h2>
                        <p className="subtitle">Please select a patient before starting a therapy session.</p>
                    </div>
                </div>
                <button className="primary-action" onClick={() => navigate("/patients")}>
                    Back to Patients
                </button>
            </div>
        );
    }
    return <LiveSessionContent key={selectedPatient.id} patient={selectedPatient} />;
}

function LiveSessionContent({ patient }) {
    const { addSessionToPatient } = usePatients();
    const navigate = useNavigate();

    const [sessionStarted, setSessionStarted] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [direction, setDirection] = useState("CENTER");
    const directionRef = useRef("CENTER");
    
    const interventionsRef = useRef([]);

    const [telemetry, setTelemetry] = useState([
        {
            time: "00:00",
            inputs: 0,
            direction: "CENTER",
        },
    ]);

    const [sessionEnded, setSessionEnded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    // =========================================
    // TELEMETRY SIMULATION
    // =========================================
    useEffect(() => {
        if (!sessionStarted || !isRunning || sessionEnded) return;

        const interval = setInterval(() => {
            setElapsedSeconds((currentSeconds) => {
                const nextSeconds = currentSeconds + 1;

                setTelemetry((currentTelemetry) => {
                    // calculate rolling window inputs (last 60s)
                    const recentInputs = interventionsRef.current.filter(t => t >= nextSeconds - 60 && t <= nextSeconds).length;
                    
                    return [
                        ...currentTelemetry.slice(-59),
                        {
                            time: formatTime(nextSeconds),
                            inputs: recentInputs,
                            direction: directionRef.current,
                        },
                    ];
                });

                return nextSeconds;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [sessionStarted, isRunning, sessionEnded]);

    function handleStartSession() {
        setSaveError(null);
        setSessionStarted(true);
        setIsRunning(true);
    }

    function handleIntervention(dir) {
        if (!isRunning) return;
        setDirection(dir);
        directionRef.current = dir;
        interventionsRef.current.push(elapsedSeconds);
        // Force update telemetry instantly for UI responsiveness
        const recentInputs = interventionsRef.current.filter(t => t >= elapsedSeconds - 60 && t <= elapsedSeconds).length;
        setTelemetry(prev => {
            const newT = [...prev];
            if (newT.length > 0) {
                newT[newT.length - 1] = { ...newT[newT.length - 1], inputs: recentInputs, direction: dir };
            }
            return newT;
        });
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowLeft") handleIntervention("LEFT");
            else if (e.key === "ArrowRight") handleIntervention("RIGHT");
            else if (e.key === "ArrowUp") handleIntervention("FORWARD");
            else if (e.key === "ArrowDown") handleIntervention("BACKWARD");
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isRunning, elapsedSeconds]);

    async function handleEndSession() {
        if (!sessionStarted || sessionEnded || isSaving) return;

        setIsRunning(false);
        setIsSaving(true);
        setSaveError(null);

        const totalInputs = interventionsRef.current.length;
        const peakInputsPerMinute = Math.max(...telemetry.map(point => point.inputs), 0);

        const directionCounts = telemetry.reduce((counts, point) => {
            counts[point.direction] = (counts[point.direction] || 0) + 1;
            return counts;
        }, {});

        const dominantDirection =
            Object.entries(directionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || direction;

        const sessionCode = `S-${Date.now()}`;

        const completedSession = {
            id: sessionCode,
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            duration: formatTime(elapsedSeconds),
            totalInputs,
            peakInputsPerMinute,
            dominantDirection,
            status: "Completed",
            telemetry,
        };

        try {
            await addSessionToPatient(patient.id, completedSession);
            setSessionEnded(true);
            navigate("/session/summary", { state: { session: completedSession, patient: patient } });
        } catch (error) {
            console.error("Failed to save session:", error);
            setSaveError(error.message || "The session could not be saved to the database.");
            setIsRunning(true);
        } finally {
            setIsSaving(false);
        }
    }

    function handleRestart() {
        setSessionStarted(false);
        setIsRunning(false);
        setSessionEnded(false);
        setElapsedSeconds(0);
        setDirection("CENTER");
        setSaveError(null);
        interventionsRef.current = [];
        directionRef.current = "CENTER";
        setTelemetry([{ time: "00:00", inputs: 0, direction: "CENTER" }]);
    }

    function getDirectionIcon() {
        if (direction === "LEFT") return <ArrowLeft size={21} />;
        if (direction === "RIGHT") return <ArrowRight size={21} />;
        if (direction === "FORWARD") return <ArrowUp size={21} />;
        if (direction === "BACKWARD") return <ArrowDown size={21} />;
        return <Activity size={21} />;
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <p className="breadcrumb">Therapy Session</p>
                    <h2>Live Therapy Session</h2>
                    <p className="subtitle">Real-time vestibular rehabilitation telemetry</p>
                </div>
                <div className="session-header-status">
                    <span className={`session-status-dot ${sessionEnded ? "ended" : !sessionStarted ? "paused" : !isRunning ? "paused" : ""}`} />
                    {sessionEnded ? "Session Ended" : !sessionStarted ? "Ready to Start" : isRunning ? "Session Active" : "Session Paused"}
                </div>
            </div>

            <div className="session-patient-bar">
                <div className="session-patient">
                    <div className="large-avatar">{getInitials(patient.name)}</div>
                    <div>
                        <span className="card-label">CURRENT PATIENT</span>
                        <h3>{patient.name}</h3>
                        <p>{patient.id} · {patient.age} years · {patient.gender}</p>
                    </div>
                </div>
                <div className="simulation-badge">
                    <Activity size={15} /> Live Telemetry
                </div>
            </div>

            {saveError && (
                <div style={{ marginBottom: "16px", padding: "12px 16px", borderRadius: "8px", background: "#fff1f1", border: "1px solid #f1caca", color: "#b42318", fontSize: "13px" }}>
                    {saveError}
                </div>
            )}

            <div className="live-metrics">
                {/* Interventions Metric */}
                <div className="live-metric-card">
                    <div className="live-metric-icon blue">
                        <PlusCircle size={22} />
                    </div>
                    <div>
                        <span>TOTAL INPUTS</span>
                        <strong>{interventionsRef.current.length}</strong>
                        <p>Therapist interventions this session</p>
                    </div>
                </div>

                <div className="live-metric-card">
                    <div className="live-metric-icon purple">
                        {getDirectionIcon()}
                    </div>
                    <div>
                        <span>CURRENT DIRECTION</span>
                        <strong className="direction-value">{direction.charAt(0) + direction.slice(1).toLowerCase()}</strong>
                        <p>Detected sway direction</p>
                    </div>
                </div>

                <div className="live-metric-card">
                    <div className="live-metric-icon green">
                        <Timer size={22} />
                    </div>
                    <div>
                        <span>SESSION TIME</span>
                        <strong>{formatTime(elapsedSeconds)}</strong>
                        <p>{sessionEnded ? "Session completed" : isSaving ? "Saving session..." : !sessionStarted ? "Ready to start" : isRunning ? "Recording telemetry" : "Telemetry paused"}</p>
                    </div>
                </div>
            </div>

            <div className="telemetry-panel">
                <div className="telemetry-header">
                    <div>
                        <span className="card-label">REAL-TIME TELEMETRY</span>
                        <h3>Therapist Interventions / Min</h3>
                        <p>Live rate of manual therapist interventions</p>
                    </div>
                    <div className="telemetry-live">
                        <span className="status-dot" />
                        {sessionEnded ? "ENDED" : !sessionStarted ? "READY" : isRunning ? "LIVE" : "PAUSED"}
                    </div>
                </div>
                <div className="telemetry-chart">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={telemetry}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e8edf2" />
                            <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#8995a2" }} tickLine={false} axisLine={{ stroke: "#dfe5ea" }} />
                            <YAxis domain={[0, 'auto']} tick={{ fontSize: 9, fill: "#8995a2" }} tickLine={false} axisLine={{ stroke: "#dfe5ea" }} />
                            <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "6px", border: "1px solid #e4e9ef", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }} />
                            <Line type="monotone" dataKey="inputs" stroke="#2878d2" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="session-controls">
                <div className="control-info">
                    <span className="card-label">SESSION CONTROL</span>
                    <h3>{sessionEnded ? "Session completed" : isSaving ? "Saving session" : !sessionStarted ? "Ready to start" : isRunning ? "Telemetry recording" : "Telemetry paused"}</h3>
                    <p>{sessionEnded ? "Session data has been saved." : isSaving ? "Saving session and telemetry data to the backend." : !sessionStarted ? "Press Start Session when you are ready to begin telemetry recording." : "Control the simulated therapy telemetry session."}</p>
                </div>
                <div className="control-actions">
                    {!sessionEnded ? (
                        !sessionStarted ? (
                            <button className="primary-action" onClick={handleStartSession}>
                                <Play size={15} /> Start Session
                            </button>
                        ) : (
                            <>
                                <button className="pause-button" onClick={() => setIsRunning((current) => !current)} disabled={isSaving}>
                                    {isRunning ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Resume</>}
                                </button>
                                <button className="end-session-button" onClick={handleEndSession} disabled={isSaving}>
                                    <Square size={14} /> {isSaving ? "Saving..." : "End Session"}
                                </button>
                            </>
                        )
                    ) : (
                        <button className="restart-button" onClick={handleRestart}>
                            <RotateCcw size={15} /> Restart Demo
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LiveSession;