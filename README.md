# Daily Log Tracker

This repository contains a two-tier daily log tracker: a Node/Express backend with SQLite for persistence, and a Create React App frontend. Employees can submit daily progress logs while managers review them.

## Structure

- `backend/`: Express API, SQLite database, authentication with JWT, role-based authorization.
- `frontend/`: React app (Create React App) that handles authentication, log submission for employees, and log review for managers.

## Getting started

### Backend

1. Copy `.env.example` to `.env` and adjust values (especially `JWT_SECRET`).
2. Install dependencies and start server:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
3. Default manager credentials are seeded via `.env` values (`DEFAULT_MANAGER_EMAIL` / `DEFAULT_MANAGER_PASSWORD`). Use `MANAGER_CREDS_SECRET` when manually registering additional managers.

### Frontend

1. Copy `.env.example` to `.env` and update `REACT_APP_API_URL` if the backend runs on another host.
2. Install dependencies and start the app:
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Notes

- All authentication requests return a JWT token that the frontend stores in `localStorage`.
- Employees can create exactly one log per date; duplicates are rejected.
- Managers can filter logs by date or employee email.
