import {
    Activity,
    CheckCircle2,
    Clock3,
    Info,
    Mail,
    Radio,
    Save,
    UserRound,
} from "lucide-react";

function Settings() {
    return (
        <div className="page">

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="page-header">
                <div>
                    <p className="breadcrumb">System</p>

                    <h2>Settings</h2>

                    <p className="subtitle">
                        Configure therapist, session and telemetry
                        platform preferences.
                    </p>
                </div>
            </div>

            {/* =========================
                SETTINGS GRID
            ========================= */}

            <div className="settings-grid">

                {/* =========================
                    THERAPIST PROFILE
                ========================= */}

                <section className="settings-panel">

                    <div className="settings-panel-header">
                        <div className="settings-section-icon blue">
                            <UserRound size={19} />
                        </div>

                        <div>
                            <span className="card-label">
                                PROFILE
                            </span>

                            <h3>Therapist Profile</h3>

                            <p>
                                Information associated with the
                                current therapist account.
                            </p>
                        </div>
                    </div>

                    <div className="settings-form">

                        <div className="settings-field">
                            <label>
                                Therapist Name
                            </label>

                            <div className="settings-input-wrapper">
                                <UserRound size={16} />

                                <input
                                    type="text"
                                    defaultValue="Karthik S."
                                />
                            </div>
                        </div>

                        <div className="settings-field">
                            <label>
                                Role
                            </label>

                            <div className="settings-input-wrapper">
                                <Activity size={16} />

                                <input
                                    type="text"
                                    defaultValue="Therapist"
                                />
                            </div>
                        </div>

                        <div className="settings-field">
                            <label>
                                Email
                            </label>

                            <div className="settings-input-wrapper">
                                <Mail size={16} />

                                <input
                                    type="email"
                                    defaultValue="therapist@vestibularrehab.com"
                                />
                            </div>
                        </div>

                        <div className="settings-field">
                            <label>
                                Therapist ID
                            </label>

                            <div className="settings-input-wrapper">
                                <Info size={16} />

                                <input
                                    type="text"
                                    defaultValue="TH-001"
                                    disabled
                                />
                            </div>
                        </div>

                    </div>

                    <button className="settings-save-button">
                        <Save size={15} />

                        Save Profile
                    </button>

                </section>

                {/* =========================
                    SESSION PREFERENCES
                ========================= */}

                <section className="settings-panel">

                    <div className="settings-panel-header">
                        <div className="settings-section-icon purple">
                            <Clock3 size={19} />
                        </div>

                        <div>
                            <span className="card-label">
                                SESSION
                            </span>

                            <h3>Session Preferences</h3>

                            <p>
                                Configure default therapy session
                                behaviour.
                            </p>
                        </div>
                    </div>

                    <div className="settings-form">

                        <div className="settings-field">
                            <label>
                                Default Session Duration
                            </label>

                            <select defaultValue="10">
                                <option value="5">
                                    5 minutes
                                </option>

                                <option value="10">
                                    10 minutes
                                </option>

                                <option value="15">
                                    15 minutes
                                </option>

                                <option value="20">
                                    20 minutes
                                </option>

                                <option value="30">
                                    30 minutes
                                </option>
                            </select>
                        </div>

                        <div className="settings-field">
                            <label>
                                Telemetry Sampling Interval
                            </label>

                            <select defaultValue="1">
                                <option value="1">
                                    1 second
                                </option>

                                <option value="2">
                                    2 seconds
                                </option>

                                <option value="5">
                                    5 seconds
                                </option>
                            </select>
                        </div>

                        <div className="settings-toggle-row">
                            <div>
                                <strong>
                                    Auto-save completed sessions
                                </strong>

                                <span>
                                    Automatically save session
                                    results after completion.
                                </span>
                            </div>

                            <label className="settings-switch">
                                <input
                                    type="checkbox"
                                    defaultChecked
                                />

                                <span />
                            </label>
                        </div>

                    </div>

                    <button className="settings-save-button">
                        <Save size={15} />

                        Save Preferences
                    </button>

                </section>

                {/* =========================
                    TELEMETRY
                ========================= */}

                <section className="settings-panel">

                    <div className="settings-panel-header">
                        <div className="settings-section-icon green">
                            <Radio size={19} />
                        </div>

                        <div>
                            <span className="card-label">
                                TELEMETRY
                            </span>

                            <h3>Telemetry Configuration</h3>

                            <p>
                                Monitor the current telemetry data
                                source and connection.
                            </p>
                        </div>
                    </div>

                    <div className="settings-status-list">

                        <div className="settings-status-row">

                            <div className="settings-status-icon">
                                <Activity size={17} />
                            </div>

                            <div>
                                <strong>
                                    Data Source
                                </strong>

                                <span>
                                    Simulated Telemetry
                                </span>
                            </div>

                            <span className="settings-status-badge">
                                Active
                            </span>

                        </div>

                        <div className="settings-status-row">

                            <div className="settings-status-icon">
                                <Radio size={17} />
                            </div>

                            <div>
                                <strong>
                                    Connection
                                </strong>

                                <span>
                                    Simulation engine connected
                                </span>
                            </div>

                            <span className="settings-status-badge">
                                Connected
                            </span>

                        </div>

                    </div>

                    <div className="settings-toggle-row">

                        <div>
                            <strong>
                                Simulation Mode
                            </strong>

                            <span>
                                Generate dummy telemetry for
                                development and MVP testing.
                            </span>
                        </div>

                        <label className="settings-switch">
                            <input
                                type="checkbox"
                                defaultChecked
                            />

                            <span />
                        </label>

                    </div>

                    <div className="settings-info-box">
                        <Info size={16} />

                        <span>
                            Hardware telemetry will replace the
                            simulated data source when the physical
                            device is integrated.
                        </span>
                    </div>

                </section>

                {/* =========================
                    ABOUT
                ========================= */}

                <section className="settings-panel">

                    <div className="settings-panel-header">
                        <div className="settings-section-icon orange">
                            <Info size={19} />
                        </div>

                        <div>
                            <span className="card-label">
                                PLATFORM
                            </span>

                            <h3>About</h3>

                            <p>
                                Platform information and project
                                details.
                            </p>
                        </div>
                    </div>

                    <div className="settings-about">

                        <div className="settings-about-brand">
                            <div className="settings-about-icon">
                                <Activity size={24} />
                            </div>

                            <div>
                                <strong>
                                    Vestibular Rehab
                                </strong>

                                <span>
                                    Telemetry Platform
                                </span>
                            </div>
                        </div>

                        <div className="settings-about-details">

                            <div>
                                <span>
                                    Version
                                </span>

                                <strong>
                                    1.0.0 MVP
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Platform Status
                                </span>

                                <strong>
                                    Prototype
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Telemetry
                                </span>

                                <strong>
                                    Simulated
                                </strong>
                            </div>

                        </div>

                        <div className="settings-info-box">
                            <CheckCircle2 size={16} />

                            <span>
                                This platform is currently running
                                as a software MVP with simulated
                                telemetry data.
                            </span>
                        </div>

                    </div>

                </section>

            </div>

        </div>
    );
}

export default Settings;