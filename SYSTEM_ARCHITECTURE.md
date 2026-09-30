# Vestibular Rehab Telemetry Platform: System Architecture

This document provides a comprehensive technical overview of the Galvanic Vestibular Stimulation (GVS) system, detailing both its physical hardware constraints and its software telemetry stack.

---

## 1. Hardware Architecture

The hardware architecture relies on a **Voltage-Controlled Constant Current Source**. Human skin resistance fluctuates constantly due to sweat, pressure, and temperature, typically ranging from $10,000\Omega$ to $100,000\Omega$. Applying a static voltage to the skin is dangerous because a drop in resistance would cause a sudden spike in current according to Ohm's law ($I = \frac{V}{R}$). 

To prevent this, the hardware uses a closed feedback loop to automatically adjust the voltage in real-time, ensuring the current flowing through the patient remains exactly at the target level (e.g., $1.0\text{ mA}$).

### 1.1 Power and Galvanic Isolation
Safety dictates that the stimulation circuit must **never** have a physical path to AC mains power.
- **The Logic Power (ESP32):** Powered by a standard USB battery bank providing $5\text{ V}$.
- **The Stimulation Power (Analog Circuit):** Powered by an isolated $9\text{ V}$ alkaline battery. A standard $3.3\text{ V}$ or $5\text{ V}$ logic supply cannot push enough current through high skin resistance.
- **The Common Ground:** The negative terminal of the $9\text{ V}$ battery must be connected to the GND pin of the ESP32. Without this shared reference point, the analog control signals will not function.

### 1.2 Core Component Logic
The circuit requires three primary components acting together as a single regulatory engine:
- **The Command (ESP32 Pin 25 - DAC1):** The ESP32's Digital-to-Analog Converter (DAC) translates the software's instructions into a physical, smooth control voltage between $0\text{ V}$ and $3.3\text{ V}$.
- **The Watchdog (LM358 or TL072 Op-Amp):** The operational amplifier continuously compares the "target" voltage requested by the ESP32 against the "actual" current flowing through the user.
- **The Valve (2N2222 NPN Transistor):** This semiconductor sits between the $9\text{ V}$ battery and the user. It opens and closes based on the Op-Amp's output, physically throttling the electrical current.
- **The Scale ($1k\Omega$ Precision Resistor):** Placed at the very end of the circuit, this resistor translates the flowing current back into a measurable voltage so the Op-Amp can read it.

### 1.3 Step-by-Step Circuit Operation
When the therapist initiates an intervention (e.g., prompting a sway to the left at $1.0\text{ mA}$), the hardware executes the following physical loop in milliseconds:
1. **Target Generation:** The ESP32 code calculates that to achieve $1.0\text{ mA}$ across a $1,000\Omega$ sense resistor, it needs to output exactly $1.0\text{ V}$ ($V = 0.001\text{ A} \times 1,000\Omega$). Pin 25 outputs $1.0\text{ V}$ directly to the non-inverting input (+) of the Op-Amp.
2. **Valve Opening:** The Op-Amp sees $1.0\text{ V}$ on its + pin but $0\text{ V}$ on its inverting input (-). Seeking balance, it sends voltage out to the Base pin of the 2N2222 Transistor, turning it "on".
3. **Current Flow:** Electricity flows from the $9\text{ V}$ battery positive terminal, through the left mastoid electrode, through the user's inner ear tissue, out the right mastoid electrode, into the Transistor's Collector pin, out the Emitter pin, through the $1k\Omega$ sense resistor, and finally to Ground.
4. **The Feedback Loop:** As current passes through the $1k\Omega$ resistor on its way to Ground, it generates a voltage drop. The node between the Transistor and the Resistor is wired directly back to the Op-Amp's - pin.
5. **Real-Time Regulation:** If the user sweats and their skin resistance drops, the current naturally tries to spike to $2.0\text{ mA}$. This pushes $2.0\text{ V}$ across the sense resistor. The Op-Amp instantly detects that the - pin ($2.0\text{ V}$) is higher than the + pin target ($1.0\text{ V}$). The Op-Amp reduces its output to the Transistor, partially closing the valve, instantly forcing the current back down to $1.0\text{ mA}$.

### 1.4 Hardware Safety Limits
This specific design incorporates an inherent hardware ceiling. The ESP32 DAC is physically incapable of outputting more than $3.3\text{ V}$. Because the Op-Amp's feedback loop forces the voltage across the $1k\Omega$ resistor to match the ESP32's output, the maximum theoretical voltage across that resistor is $3.3\text{ V}$.

$$I_{max} = \frac{3.3\text{ V}}{1,000\Omega} = 3.3\text{ mA}$$

Even if the software crashes and sends a maximum signal, the circuit physically cannot push more than $3.3\text{ mA}$ through the patient, keeping it within safe, non-lethal biomedical testing thresholds.

### 1.5 The Physical Interface
The connection to the patient utilizes standard Ag/AgCl (Silver/Silver Chloride) hydrogel medical electrodes. Bare metal contacts are strictly avoided as they cause uneven current density, leading to localized heating and skin burns. The electrodes are placed directly over the mastoid bones behind each ear, ensuring the shortest electrical path through the vestibular nerve bundles.

---

## 2. Software Architecture

The software stack provides a modern, responsive telemetry interface for therapists to monitor, record, and analyze patient sessions in real-time. It operates alongside the ESP32 hardware, tracking manual interventions.

### 2.1 Backend (Python, FastAPI, SQLite)
The backend acts as the permanent record for patient profiles, session logs, and time-series telemetry data. 

- **Framework:** FastAPI is used for its high performance and automatic validation.
- **Database:** SQLite is used as a lightweight, zero-configuration local database, making deployment and standalone usage simple.
- **Data Models (SQLAlchemy & Pydantic):**
  - **Patient:** Stores demographic information (Name, Age, Gender, ID).
  - **Session:** Records top-level session metadata, such as the total duration, date, dominant direction of sway, and specifically, the **Total Therapist Inputs** and **Peak Inputs per Minute**. 
  - **Telemetry:** Captures point-in-time metrics during a session. Instead of recording raw electrical intensity, the system logs the exact number of manual interventions required over specific time intervals.

### 2.2 Frontend (React, Vite)
The frontend is a Single Page Application (SPA) designed for rapid interaction during live clinical settings.

- **Global State Management:** Context API (`PatientContext.jsx`) is utilized to maintain active patient data, handle asynchronous API communication to the backend, and inject dummy data if the backend is empty.
- **Live Session Simulation (`LiveSession.jsx`):** 
  - Provides a real-time dashboard for active therapy. 
  - Features global keyboard event listeners (Left/Right arrow keys) to immediately log therapist interventions without requiring mouse interaction.
  - Dynamically calculates a rolling 60-second window to plot the exact rate of interventions over time using Recharts, giving the therapist immediate feedback on patient stability.
- **Session Summaries and Analytics (`SessionSummary.jsx` & `Analytics.jsx`):** 
  - Post-session interfaces that aggregate the telemetry data. 
  - Generates comprehensive charts displaying "Total Inputs" and "Peak Inputs/Min" to evaluate the session's overall difficulty and track the patient's long-term rehabilitation progress.

### 2.3 Hardware/Software Integration (Future Roadmap)
Currently, the software tracks manual therapist interventions. Moving forward, the ESP32 can be programmed to expose a local WebSocket or REST server. The React frontend can connect directly to the ESP32 to:
1. Dispatch specific target stimulation voltages mapped to the arrow keys.
2. Read real-time diagnostic telemetry (e.g., actual measured current or battery status) from the ESP32's ADC pins to overlay hardware data onto the software's clinical graphs.
