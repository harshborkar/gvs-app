import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import LiveSession from "./pages/LiveSession";
import SessionSummary from "./pages/SessionSummary";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <div className="app">

                <Sidebar />

                <main className="main-content">
                    <Routes>

                        <Route
                            path="/"
                            element={<Dashboard />}
                        />

                        <Route
                            path="/patients"
                            element={<Patients />}
                        />

                        <Route
                            path="/session"
                            element={<LiveSession />}
                        />

                        <Route
                            path="/session/summary"
                            element={<SessionSummary />}
                        />

                        <Route
                            path="/analytics"
                            element={<Analytics />}
                        />

                        <Route
                            path="/settings"
                            element={<Settings />}
                        />

                    </Routes>
                </main>

            </div>
        </BrowserRouter>
    );
}

export default App;