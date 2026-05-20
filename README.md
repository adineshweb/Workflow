# Role-Based Approval & Workflow Management System (MERN Stack)

A complete, production-ready, and enterprise-scalable **MERN Stack Role-Based Approval & Workflow Management System**. It features a robust workflow transition state validation engine, secure JWT authentication, role-based route guard protections, customizable metrics dashboards, search/filtering datatables, and complete chronological activity audit logging.

---

## 🏗️ Project Architecture & Folder Structure

The project is structured following clean coding practices, separation of concerns (MVC for backend, feature-based slices for Redux on frontend), and standard MERN layouts.

```text
workspace/
 ├── package.json                   # Root package.json coordinating concurrent bootup
 ├── client/                        # React.js + Vite Frontend
 │    ├── src/
 │    │    ├── api/                 # Axios configuration (Interceptors, Auth headers)
 │    │    ├── components/          # Reusable UI (Buttons, Inputs, Modals, Status Badges)
 │    │    ├── layouts/             # Master pages layouts (SidebarLayout)
 │    │    ├── pages/               # Views (Login, User/Manager/Admin dashboards, Create, Details)
 │    │    ├── redux/               # Global Redux store and slices (authSlice, requestSlice)
 │    │    ├── App.jsx              # Routing rules & session reloading
 │    │    ├── index.css            # Tailwind CSS directives & global scrollbars
 │    │    └── main.jsx             # React DOM mounting
 │    ├── postcss.config.js
 │    ├── tailwind.config.js
 │    └── vite.config.js
 └── server/                        # Node.js + Express Backend
      ├── config/                   # Database (Mongoose config)
      ├── controllers/              # Request handlers (authController, requestController)
      ├── middleware/               # Token decoding, RBAC, error handlers, rate-limiting
      ├── models/                   # Schemas (User, Request, RequestLog)
      ├── routes/                   # Routing mounts (authRoutes, requestRoutes)
      ├── services/                 # Workflow status validation engine
      ├── validators/               # Input payload validators (express-validator)
      ├── app.js                    # Express app initialization & security plugins
      ├── server.js                 # Entry point listening to port
      └── seed.js                   # Database seed script for test roles/users
```

---

## ⚙️ Backend API Reference

All requests must carry a `Authorization: Bearer <JWT_TOKEN>` header (except `/login`).

### Auth Endpoints
- `POST /api/auth/login` – Authenticates user credentials. Returns JWT token and User info.
- `GET /api/auth/me` – Verifies current session. Returns active User object.

### Request Workflows
- `POST /api/requests` – Creates a new request in `Submitted` status (Role: `User` only).
- `GET /api/requests` – Lists all requests with search/filter/pagination (Role: `Manager` and `Admin` only).
- `GET /api/my-requests` – Lists current logged in user's requests (Role: `User` only).
- `GET /api/requests/:id` – Fetches details of a specific request.
- `PATCH /api/requests/:id/status` – Transitions request status. Checks workflow rules (Role: Auth-based dependent).
- `GET /api/requests/:id/logs` – Fetches chronological audit/timeline logs for the request.

---

## 🛡️ Workflow State Transition Rules

The system restricts status transitions strictly in the backend, returning `400 Bad Request` if invalid operations are called:

| Source Status | Destination Status | Allowed Role | Meaning / Context |
| :--- | :--- | :--- | :--- |
| **None** | `Submitted` | `User` | Creator initializes a request |
| **Submitted** | `Approved` | `Manager` | Reviewer approves the request |
| **Submitted** | `Rejected` | `Manager` | Reviewer rejects the request |
| **Submitted** | `Needs Clarification` | `Manager` | Reviewer requests clarifications |
| **Needs Clarification** | `Submitted` | `User` | Creator modifies details and resubmits |
| **Approved** | `Closed` | `Admin` | Executive closes/resolves approved tickets |
| **Closed** | `Reopened` | `Admin` | Executive reopens ticket for modification |
| **Reopened** | `Approved` / `Rejected` / `Needs Clarification` | `Manager` | Reviewer processes reopened request |
| **Reopened** | `Closed` | `Admin` | Executive closes reopened request |

---

## 🚀 Quick Start Guide (Local Development)

### 1. Prerequisites
- [Node.js](https://nodejs.org) (v16+)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally (port 27017) or a MongoDB Atlas URI.

### 2. Install Workspace Dependencies
Run the command below at the root directory of the workspace:
```bash
npm run install-all
```
*This installs dependencies for the root, backend server, and frontend client.*

### 3. Environment Setup
Check that `.env` is created inside `/server` with:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/approval-workflow
JWT_SECRET=super_secret_jwt_sign_key_987654321_abc_xyz
JWT_EXPIRE=7d
NODE_ENV=development
```

### 4. Seed Database Users & Requests
Run the seed command to load test users and mock timelines:
```bash
npm run seed
```

This creates the following credentials for testing:
- 👤 **Employee / User**: `user@example.com` / `Password123`
- 📋 **Reviewer / Manager**: `manager@example.com` / `Password123`
- 🛡️ **Executive / Admin**: `admin@example.com` / `Password123`

### 5. Launch Application
Boot both frontend and backend concurrently:
```bash
npm run dev
```
Open **http://localhost:5173** to view the app!

---

## 🔮 Production Deployment Guide

### Backend Deployment (Render)
1. Sign up on [Render.com](https://render.com) and create a **Web Service**.
2. Connect your Git repository. Set the **Root Directory** as `server`.
3. Select environment `Node`. Set **Build Command** to `npm install`.
4. Set **Start Command** to `node server.js`.
5. Under **Environment Variables**, define:
   - `MONGODB_URI` (Pointer to production MongoDB Atlas connection string)
   - `JWT_SECRET` (A secure random hash)
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (or default)
6. Trigger the deploy.

### Frontend Deployment (Vercel)
1. Sign up on [Vercel.com](https://vercel.com) and create a **New Project**.
2. Connect your Git repository. Set **Root Directory** as `client`.
3. Set **Framework Preset** as `Vite`.
4. Adjust the **Build Command** if needed (`npm run build`) and **Output Directory** as `dist`.
5. Under **Environment Variables**, if you are referencing a hardcoded API endpoint instead of a local proxy in production, you can set the backend service URL or let Vite forward queries. *Note: For production, we can modify `axiosInstance.js` to target the Render backend url, e.g., using `import.meta.env.VITE_API_URL`.*
6. Deploy.
