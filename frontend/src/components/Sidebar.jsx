import {
    Activity,
    BarChart3,
    LayoutDashboard,
    Settings,
    Users,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {
    return (
        <aside className="sidebar">

            {/* =========================
                BRAND
            ========================= */}

            <div className="brand">

                <div className="brand-icon">
                    <Activity size={22} />
                </div>

                <div>
                    <h1>Vestibular Rehab</h1>
                    <span>Telemetry Platform</span>
                </div>

            </div>

            {/* =========================
                NAVIGATION
            ========================= */}

            <nav className="navigation">

                <p className="nav-label">
                    MAIN MENU
                </p>

                {/* Dashboard */}

                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `nav-item ${isActive ? "active" : ""}`
                    }
                >
                    <LayoutDashboard size={18} />

                    <span>
                        Dashboard
                    </span>
                </NavLink>

                {/* Patients */}

                <NavLink
                    to="/patients"
                    className={({ isActive }) =>
                        `nav-item ${isActive ? "active" : ""}`
                    }
                >
                    <Users size={18} />

                    <span>
                        Patients
                    </span>
                </NavLink>

                {/* Live Session */}

                <NavLink
                    to="/session"
                    className={({ isActive }) =>
                        `nav-item ${isActive ? "active" : ""}`
                    }
                >
                    <Activity size={18} />

                    <span>
                        Live Session
                    </span>
                </NavLink>

                {/* Analytics */}

                <NavLink
                    to="/analytics"
                    className={({ isActive }) =>
                        `nav-item ${isActive ? "active" : ""}`
                    }
                >
                    <BarChart3 size={18} />

                    <span>
                        Analytics
                    </span>
                </NavLink>

                {/* System */}

                <p className="nav-label settings-label">
                    SYSTEM
                </p>

                {/* Settings */}

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `nav-item ${isActive ? "active" : ""}`
                    }
                >
                    <Settings size={18} />

                    <span>
                        Settings
                    </span>
                </NavLink>

            </nav>

            {/* =========================
                THERAPIST
            ========================= */}

            <div className="sidebar-bottom">

                <div className="therapist">

                    <div className="avatar">
                        KT
                    </div>

                    <div className="therapist-info">

                        <strong>
                            Karthik S.
                        </strong>

                        <span>
                            Therapist
                        </span>

                    </div>

                </div>

            </div>

        </aside>
    );
}

export default Sidebar;