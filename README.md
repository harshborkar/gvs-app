# Vestibular Rehab Telemetry Platform

## Quick Start

This README only covers how to start the **frontend** and **backend** locally.

---

## 1. Start the Backend

Open a terminal and go to the backend folder:

```powershell
cd D:\Visual_Studio_Code\Other_repos\Vestibular_Rehab_Telemetry_Platform-main\backend
```

Activate the Python virtual environment:

```powershell
.\venv\Scripts\Activate.ps1
```

Start the FastAPI backend:

```powershell
python -m uvicorn main:app --reload
```

The backend should start at:

```text
http://127.0.0.1:8000
```

FastAPI Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

Keep this terminal running.

> **Important:** Use `python -m uvicorn main:app --reload` rather than `uvicorn main:app --reload`.

---

## 2. Start the Frontend

Open a **new terminal**.

Go to the frontend folder:

```powershell
cd D:\Visual_Studio_Code\Other_repos\Vestibular_Rehab_Telemetry_Platform-main\frontend
```

If this is the first time running the project, install the dependencies:

```powershell
npm install
```

Start the Vite development server:

```powershell
npm run dev
```

Vite will display the frontend URL in the terminal, normally:

```text
http://localhost:5173
```

Open that URL in your browser.

---

## 3. Running Both Together

You need **two terminals**.

### Terminal 1 - Backend

```powershell
cd D:\Visual_Studio_Code\Other_repos\Vestibular_Rehab_Telemetry_Platform-main\backend
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload
```

### Terminal 2 - Frontend

```powershell
cd D:\Visual_Studio_Code\Other_repos\Vestibular_Rehab_Telemetry_Platform-main\frontend
npm run dev
```

If dependencies have not been installed yet, run:

```powershell
npm install
```

once before `npm run dev`.

---

## 4. Stopping the Servers

In either terminal, press:

```text
Ctrl + C
```

to stop the running server.

---

## Quick Reference

| Part | Command |
|---|---|
| Backend activate venv | `.env\Scripts\Activate.ps1` |
| Backend start | `python -m uvicorn main:app --reload` |
| Backend API | `http://127.0.0.1:8000` |
| Backend Swagger | `http://127.0.0.1:8000/docs` |
| Frontend install | `npm install` |
| Frontend start | `npm run dev` |
| Frontend | `http://localhost:5173` |
