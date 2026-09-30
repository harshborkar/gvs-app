import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePatients } from "../context/PatientContext";

import {
  CalendarDays,
  ChevronRight,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Patients() {
  const {
    patients,
    selectedPatient,
    setSelectedPatient,
    addPatient,
    deletePatient,
  } = usePatients();

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    gender: "Male",
  });

  const filteredPatients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return patients;
    }

    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(query) ||
        patient.id.toLowerCase().includes(query)
    );
  }, [patients, searchTerm]);

  function handleAddPatient(event) {
    event.preventDefault();

    const ageNum = Number(newPatient.age);
    if (!newPatient.name.trim() || !newPatient.age || isNaN(ageNum) || ageNum <= 0 || ageNum > 120 || !Number.isInteger(ageNum)) {
      alert("Please enter a valid name and an age between 1 and 120.");
      return;
    }

    const nextNumber = patients.length + 1;

    const patient = {
      id: `P-${String(nextNumber).padStart(3, "0")}`,
      name: newPatient.name.trim(),
      age: Number(newPatient.age),
      gender: newPatient.gender,
      lastSession: "No sessions yet",
      sessions: 0,
      avgInputs: 0,
      status: "Ready",
      history: [],

      // Dummy telemetry profile for the MVP simulation
      telemetry: {
        baseline: 2.4,
        min: 1.8,
        max: 3.0,
        variation: 0.12,
      },
    };

    addPatient(patient);
    setSelectedPatient(patient);

    setNewPatient({
      name: "",
      age: "",
      gender: "Male",
    });

    setShowAddModal(false);
  }

  function handleDeletePatient() {
    if (!selectedPatient) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedPatient.name} from the demo patient list?`
    );

    if (!confirmed) {
      return;
    }

    deletePatient(selectedPatient.id);
  }

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <p className="breadcrumb">Patient Management</p>

          <h2>Patients</h2>

          <p className="subtitle">
            Manage patient profiles and review rehabilitation history.
          </p>
        </div>

        <button
          className="primary-action"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={17} />
          Add Patient
        </button>
      </div>

      {/* Main Patient Layout */}
      <div className="patients-layout">
        {/* Patient List */}
        <section className="patient-panel">
          <div className="patient-panel-header">
            <div>
              <span className="card-label">PATIENT DIRECTORY</span>

              <h3>{patients.length} Patients</h3>
            </div>
          </div>

          <div className="patient-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="patients-list">
            {filteredPatients.length === 0 ? (
              <div className="empty-state">
                <UserRound size={28} />

                <strong>No patients found</strong>

                <span>Try a different search term.</span>
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  className={`directory-row ${
                    selectedPatient?.id === patient.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedPatient(patient)}
                >
                  <div className="directory-avatar">
                    {getInitials(patient.name)}
                  </div>

                  <div className="directory-info">
                    <strong>{patient.name}</strong>

                    <span>
                      {patient.id} · Age {patient.age}
                    </span>
                  </div>

                  <div className="directory-last-session">
                    <span>Last session</span>

                    <strong>{patient.lastSession}</strong>
                  </div>

                  <ChevronRight size={17} />
                </button>
              ))
            )}
          </div>
        </section>

        {/* Patient Details */}
        {selectedPatient && (
          <section className="patient-details">
            <div className="details-header">
              <div className="details-profile">
                <div className="large-avatar">
                  {getInitials(selectedPatient.name)}
                </div>

                <div>
                  <span className="card-label">PATIENT PROFILE</span>

                  <h3>{selectedPatient.name}</h3>

                  <p>
                    {selectedPatient.id} · {selectedPatient.gender} ·{" "}
                    {selectedPatient.age} years
                  </p>
                </div>
              </div>

              <button
                className="delete-button"
                onClick={handleDeletePatient}
                title="Delete patient"
              >
                <Trash2 size={17} />
              </button>
            </div>

            {/* Patient Metrics */}
            <div className="patient-metrics">
              <div>
                <span>Total Sessions</span>

                <strong>{selectedPatient.sessions}</strong>
              </div>

              <div>
                <span>Avg. Inputs</span>

                <strong>
                  {selectedPatient.avgInputs !== undefined
                    ? selectedPatient.avgInputs
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Last Session</span>

                <strong>{selectedPatient.lastSession}</strong>
              </div>
            </div>

            {/* Session History */}
            <div className="history-section">
              <div className="section-heading">
                <div>
                  <span className="card-label">HISTORY</span>

                  <h3>Recent Sessions</h3>
                </div>

                <CalendarDays size={18} />
              </div>

              {selectedPatient.history.length === 0 ? (
                <div className="empty-history">
                  No therapy sessions recorded yet.
                </div>
              ) : (
                <div className="history-table">
                  <div className="history-table-header">
                    <span>Date</span>

                    <span>Duration</span>

                    <span>Total Inputs</span>
                  </div>

                  {selectedPatient.history.map((session, index) => (
                    <div
                      className="history-table-row"
                      key={`${session.date}-${index}`}
                    >
                      <span>{session.date}</span>

                      <span>{session.duration}</span>

                      <span>{session.inputs}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Start Session */}
            <button
              className="start-session-button"
              onClick={() => {
                setSelectedPatient(selectedPatient);
                navigate("/session");
              }}
            >
              Start Session with {selectedPatient.name}
            </button>
          </section>
        )}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div
          className="modal-overlay"
          onMouseDown={() => setShowAddModal(false)}
        >
          <div
            className="modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="card-label">PATIENT MANAGEMENT</span>

                <h3>Add New Patient</h3>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleAddPatient}>
              <label>
                Full Name

                <input
                  type="text"
                  placeholder="Enter patient's name"
                  value={newPatient.name}
                  onChange={(event) =>
                    setNewPatient({
                      ...newPatient,
                      name: event.target.value,
                    })
                  }
                  autoFocus
                />
              </label>

              <label>
                Age

                <input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="Enter age"
                  value={newPatient.age}
                  onChange={(event) =>
                    setNewPatient({
                      ...newPatient,
                      age: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Gender

                <select
                  value={newPatient.gender}
                  onChange={(event) =>
                    setNewPatient({
                      ...newPatient,
                      gender: event.target.value,
                    })
                  }
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-action">
                  <Plus size={16} />
                  Add Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Patients;