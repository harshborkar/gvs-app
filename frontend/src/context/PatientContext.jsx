import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const PatientContext = createContext();

const API_BASE_URL =
    "http://127.0.0.1:8000";


// =========================================
// SESSION HELPERS
// =========================================

function getSessionInputs(session) {
    if (
        typeof session.totalInputs ===
        "number"
    ) {
        return session.totalInputs;
    }

    if (
        typeof session.inputs ===
        "number"
    ) {
        return session.inputs;
    }

    if (
        typeof session.inputs ===
        "string"
    ) {
        const value =
            parseInt(
                session.inputs, 10
            );

        return Number.isFinite(value)
            ? value
            : 0;
    }

    return 0;
}


function calculateAverageInputs(
    history
) {
    if (
        !history ||
        history.length === 0
    ) {
        return 0;
    }

    const inputsList =
        history
            .map(getSessionInputs);

    if (
        inputsList.length === 0
    ) {
        return 0;
    }

    const total =
        inputsList.reduce(
            (
                sum,
                value
            ) =>
                sum + value,
            0
        );

    return Math.round(total / inputsList.length);
}


// =========================================
// MAP SESSION FROM API
// =========================================

function mapSessionFromApi(
    session
) {
    return {
        id:
            session.session_code,

        databaseId:
            session.id,

        date:
            session.date,

        duration:
            session.duration,

        inputs:
            typeof session.total_inputs ===
            "number"
                ? session.total_inputs
                : 0,

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
    };
}


// =========================================
// FETCH PATIENT SESSIONS
// =========================================

async function fetchPatientSessions(
    patientDatabaseId
) {
    const response =
        await fetch(
            `${API_BASE_URL}/api/patients/${patientDatabaseId}/sessions`
        );

    if (!response.ok) {
        throw new Error(
            "Failed to fetch patient sessions"
        );
    }

    const sessions =
        await response.json();

    return sessions.map(
        mapSessionFromApi
    );
}


// =========================================
// MAP PATIENT FROM API
// =========================================

async function mapPatientFromApi(
    patient
) {
    const history =
        await fetchPatientSessions(
            patient.id
        );

    return {
        id:
            patient.patient_code,

        databaseId:
            patient.id,

        name:
            patient.name,

        age:
            patient.age,

        gender:
            patient.gender,

        status:
            patient.status,

        sessions:
            history.length,

        avgInputs:
            calculateAverageInputs(
                history
            ),

        lastSession:
            history.length > 0
                ? history[0].date
                : "—",

        history,
    };
}


// =========================================
// PROVIDER
// =========================================

export function PatientProvider({
    children,
}) {

    const [
        patients,
        setPatients,
    ] = useState([]);


    const [
        selectedPatient,
        setSelectedPatient,
    ] = useState(null);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState(null);


    // =========================================
    // LOAD ALL PATIENTS
    // =========================================

    async function loadPatients() {

        try {

            setLoading(true);
            setError(null);


            const response =
                await fetch(
                    `${API_BASE_URL}/api/patients`
                );


            if (!response.ok) {

                throw new Error(
                    "Failed to fetch patients"
                );
            }


            const apiPatients =
                await response.json();


            const mappedPatients =
                await Promise.all(
                    apiPatients.map(
                        mapPatientFromApi
                    )
                );


            setPatients(
                mappedPatients
            );


            /*
             * Keep the currently selected
             * patient if possible.
             */

            setSelectedPatient(
                (currentSelected) => {

                    if (
                        currentSelected
                    ) {

                        const refreshed =
                            mappedPatients.find(
                                (patient) =>
                                    patient.id ===
                                    currentSelected.id
                            );

                        if (refreshed) {
                            return refreshed;
                        }
                    }


                    return (
                        mappedPatients[0] ||
                        null
                    );
                }
            );

        } catch (loadError) {

            console.error(
                "Failed to load patients:",
                loadError
            );


            setError(
                "Unable to connect to the telemetry backend."
            );

        } finally {

            setLoading(false);

        }
    }


    // =========================================
    // INITIAL LOAD
    // =========================================

    useEffect(() => {

        loadPatients();

    }, []);


    // =========================================
    // ADD PATIENT
    // =========================================

    const addPatient =
        async (patient) => {

            try {

                setError(null);


                const response =
                    await fetch(
                        `${API_BASE_URL}/api/patients`,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body:
                                JSON.stringify(
                                    {
                                        patient_code:
                                            patient.id,

                                        name:
                                            patient.name,

                                        age:
                                            Number(
                                                patient.age
                                            ),

                                        gender:
                                            patient.gender,

                                        status:
                                            patient.status ||
                                            "Active",
                                    }
                                ),
                        }
                    );


                if (!response.ok) {

                    const errorData =
                        await response.json();


                    throw new Error(
                        errorData.detail ||
                            "Failed to create patient"
                    );
                }


                /*
                 * Reload everything from
                 * SQLite after creation.
                 */

                await loadPatients();

            } catch (error) {

                console.error(
                    "Failed to add patient:",
                    error
                );


                setError(
                    error.message ||
                        "Failed to add patient."
                );


                throw error;
            }
        };


    // =========================================
    // DELETE PATIENT
    // =========================================

    const deletePatient =
        async (patientId) => {

            try {

                setError(null);


                const patient =
                    patients.find(
                        (item) =>
                            item.id ===
                            patientId
                    );


                if (!patient) {
                    return;
                }


                const response =
                    await fetch(
                        `${API_BASE_URL}/api/patients/${patient.databaseId}`,
                        {
                            method:
                                "DELETE",
                        }
                    );


                if (!response.ok) {

                    const errorData =
                        await response.json();


                    throw new Error(
                        errorData.detail ||
                            "Failed to delete patient"
                    );
                }


                /*
                 * Reload everything from
                 * SQLite.
                 */

                await loadPatients();

            } catch (error) {

                console.error(
                    "Failed to delete patient:",
                    error
                );


                setError(
                    error.message ||
                        "Failed to delete patient."
                );
            }
        };


    // =========================================
    // SAVE COMPLETED SESSION
    // =========================================

    const addSessionToPatient =
        async (
            patientId,
            session
        ) => {

            try {

                setError(null);


                /*
                 * Find the actual SQLite
                 * patient ID.
                 */

                const patient =
                    patients.find(
                        (item) =>
                            item.id ===
                            patientId
                    );


                if (!patient) {

                    throw new Error(
                        "Patient not found."
                    );
                }


                if (
                    !patient.databaseId
                ) {

                    throw new Error(
                        "Patient database ID is missing."
                    );
                }


                // =====================================
                // 1. CREATE SESSION IN SQLITE
                // =====================================

                const sessionResponse =
                    await fetch(
                        `${API_BASE_URL}/api/sessions`,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body:
                                JSON.stringify(
                                    {
                                        session_code:
                                            session.id,

                                        patient_id:
                                            patient.databaseId,

                                        date:
                                            session.date,

                                        duration:
                                            session.duration,

                                        total_inputs:
                                            session.totalInputs,

                                        peak_inputs_per_minute:
                                            session.peakInputsPerMinute,

                                        dominant_direction:
                                            session.dominantDirection,

                                        status:
                                            session.status ||
                                            "Completed",
                                    }
                                ),
                        }
                    );


                if (
                    !sessionResponse.ok
                ) {

                    const errorData =
                        await sessionResponse.json();


                    throw new Error(
                        errorData.detail ||
                            "Failed to save session."
                    );
                }


                const createdSession =
                    await sessionResponse.json();


                // =====================================
                // 2. SAVE TELEMETRY TO SQLITE
                // =====================================

                const telemetry =
                    session.telemetry ||
                    [];


                for (
                    const point
                    of telemetry
                ) {

                    const telemetryResponse =
                        await fetch(
                            `${API_BASE_URL}/api/sessions/${createdSession.id}/telemetry`,
                            {
                                method:
                                    "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",
                                },

                                body:
                                    JSON.stringify(
                                        {
                                            timestamp:
                                                point.time,

                                            inputs:
                                                Number(
                                                    point.inputs
                                                ),

                                            direction:
                                                point.direction,
                                        }
                                    ),
                            }
                        );


                    if (
                        !telemetryResponse.ok
                    ) {

                        const errorData =
                            await telemetryResponse.json();


                        throw new Error(
                            errorData.detail ||
                                "Failed to save telemetry."
                        );
                    }
                }


                // =====================================
                // 3. RELOAD PATIENT DATA
                // =====================================

                await loadPatients();


                return createdSession;

            } catch (error) {

                console.error(
                    "Failed to save session:",
                    error
                );


                setError(
                    error.message ||
                        "Failed to save session."
                );


                throw error;
            }
        };


    // =========================================
    // CONTEXT
    // =========================================

    return (

        <PatientContext.Provider
            value={{
                patients,

                selectedPatient,

                setSelectedPatient,

                addPatient,

                deletePatient,

                addSessionToPatient,

                loadPatients,

                loading,

                error,
            }}
        >

            {children}

        </PatientContext.Provider>
    );
}


// =========================================
// HOOK
// =========================================

export function usePatients() {

    return useContext(
        PatientContext
    );
}