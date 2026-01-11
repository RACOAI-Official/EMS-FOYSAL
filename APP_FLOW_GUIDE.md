# Application Flow Guide - Easy-Employee

This document outlines the high-level application flow and the directory structure for both the Frontend (React) and Backend (Node.js/Express) components of the Easy-Employee system.

---

## 📂 Project Structure

### Backend (`/backend`)
```bash
backend/
├── configs/            # Database and environment configurations
├── controllers/        # Request handling logic
├── dtos/               # Data Transfer Objects (sanitization)
├── dummy-data/         # JSON files for DB seeding
├── middlewares/        # Auth, Role, and Error guards
├── models/             # Mongoose/MongoDB Schemas
├── routes/             # API endpoint definitions
├── services/           # Core business logic & DB operations
├── storage/            # Local storage for images (profile/teams)
├── utils/              # Helper functions (e.g., OTP, Date)
└── server.js           # Server initialization (Entry Point)
```

### Frontend (`/frontend`)
```bash
frontend/
├── public/             # Static assets (HTML, Icons)
└── src/
    ├── assets/         # UI assets (Images, CSS)
    ├── components/     # Reusable UI components
    ├── hooks/          # Custom React hooks (e.g., useAutoLogin)
    ├── http/           # Axios instance & API functions
    ├── pages/          # Page-level components
    ├── store/          # Redux state & Slices
    ├── App.js          # Routing & Route Guards (Main Hub)
    └── index.js        # React bootstrap (Entry Point)
```

---

## 🖥️ Frontend Flow (React)

The frontend is a Single Page Application (SPA) built with React and Redux for state management.

### 1. Initialization & Authentication
- **Entry Point**: `App.js` wraps the application in a `Switch` for routing.
- **Auto-Login**: The `useAutoLogin` hook runs on mount, checking for a valid session (refresh token) and populating the Redux state (`authSlice`).
- **Route Protection**:
    - `GuestRoute`: Only accessible when logged out (Login, Forgot Password).
    - `ProtectedRoute`: Accessible to any authenticated user (Home).
    - `AdminRoute`: Restricted to `User.type === 'Admin'`.
    - `LeaderRoute`: Restricted to `User.type === 'Leader'`.
    - `EmployeeRoute`: Accessible to both `Employee` and `Leader`.

### 2. Navigation Flow
- **Sidebar**: The `SideBar.jsx` component dynamically renders navigation items based on the user's role:
    - `Admin.jsx` (Navigation): Lists administrative tools (Employees, Teams, Attendance, etc.).
    - `Leader.jsx` (Navigation): Lists leadership tools (Team members, Attendance, etc.).
    - `Employee.jsx` (Navigation): Lists basic tools (Attendance, Leave, Salary).

### 3. Data Interaction (Axios Interceptors)
- **API Client**: `http/index.js` configures an Axios instance with:
    - `withCredentials: true` to handle HTTP-only cookies.
    - **Response Interceptor**: Intercepts every response to handle global error messages (via `react-toastify`) and log details.

---

## ⚙️ Backend Flow (Express)

The backend follows a Controller-Service-Model architecture with explicit middleware layering.

### 1. Request Lifecycle
- **Entry Point**: `server.js` initializes the Express app, connects to MongoDB, and defines middlewares.
- **Middleware Stack**:
    1.  `CORS`: Whitelists frontend origins.
    2.  `Body Parsers`: `express.json()` and `express.urlencoded()`.
    3.  `Cookie Parser`: Processes session cookies.
    4.  **Routes**: Directs traffic to specific route files.
    5.  **Error Middleware**: Catches all unhanded errors and returns a formatted JSON response (`ErrorHandler.js`).

### 2. Routing & Authentication
- **Auth Middleware** (`auth-middleware.js`):
    - `auth`: Decodes JWT from cookies and attaches the user object to `req.user`.
    - `authRole`: Verifies if `req.user.type` has the required permissions for a specific route.
- **Endpoints**:
    - `/api/auth`: Login, logout, and token refresh logic.
    - `/api/admin`: User management, team creation, and administrative oversight.
    - `/api/employee/leader`: Role-specific features like attendance and leaves.

### 3. Execution Logic (Controller-Service-Model)
1.  **Route**: Receives the request (e.g., `POST /api/problems/submit`).
2.  **Controller**: Validates inputs and extracts data from `req.body`.
3.  **Service**: Contains the core business logic (e.g., creating a database entry, handling file uploads).
4.  **Model**: Mongoose schemas interact with MongoDB.
5.  **DTO (Data Transfer Object)**: Before returning a response, data is often mapped through a DTO to sanitize fields (e.g., hashing paths, removing sensitive data).

---

## 🔄 Interaction Flow (Example: Reporting a Problem)

1.  **Frontend**: User fills out form in `Userproblem.jsx` → calls `submitProblem(data)` in `http/index.js`.
2.  **Network**: Axios sends POST request to `/api/problems/submit`.
3.  **Backend Middleware**: `auth` verify's the user's JWT.
4.  **Backend Controller**: `problem-controller.js` receives `req.body`.
5.  **Backend Service**: `problem-service.js` creates a new `Problem` document in MongoDB.
6.  **Response**: Backend sends `{ success: true, data: problem }`.
7.  **Frontend**: `Userproblem.jsx` receives success → displays a Toast notification → refreshes the problems list.
