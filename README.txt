# Team Task Manager

A full-stack web application designed for teams to create projects, assign tasks to members, and track progress with role-based access control (Admin & Member).

## Tech Stack
- **Frontend**: React + Vite + TailwindCSS + React Router (Deployed to Vercel)
- **Backend**: Node.js + Express.js + REST APIs (Deployed to Render)
- **Database**: MongoDB with Mongoose
- **Auth**: JWT-based authentication with bcrypt password hashing (httpOnly cookies)

## Features
- **Authentication**: Secure signup/login with JWT and httpOnly cookies.
- **Role-Based Access Control**:
  - Admin: Full control over projects, tasks, and members.
  - Member: Can view assigned projects, create tasks, and update status of their tasks.
- **Project Management**: Admins can create projects and assign members.
- **Task Management**: Create, assign, filter, and track status (To Do, In Progress, Done).
- **Dashboard**: Real-time stats and overview of pending/overdue tasks.

## Local Setup

### Prerequisites
- Node.js (v18+)
- MongoDB connection string (Atlas or Local)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory based on the `.env.example`.
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` directory based on the `.env.example`.
4. Start the Vite dev server:
   ```bash
   npm run dev
   ```

## API Documentation

### Auth
- `POST /api/auth/register`: Register new user.
- `POST /api/auth/login`: Login user and set JWT cookie.
- `POST /api/auth/logout`: Clear JWT cookie.
- `GET /api/auth/me`: Get current authenticated user details.

### Projects
- `POST /api/projects`: Create a new project (Admin only).
- `GET /api/projects`: Get all projects user belongs to.
- `GET /api/projects/:id`: Get project details.
- `PUT /api/projects/:id/members`: Add a member to a project by email (Admin only).

### Tasks
- `POST /api/tasks`: Create a new task in a project.
- `GET /api/tasks`: Get tasks filtered by query params.
- `PUT /api/tasks/:id/status`: Update task status.
- `DELETE /api/tasks/:id`: Delete a task (Admin only).

## Deployment

The application is configured for separated deployments:
1. **Backend**: Deployed to Render. Make sure to set environment variables including `FRONTEND_URL` for CORS and cookie setting.
2. **Frontend**: Deployed to Vercel. Make sure to set `VITE_API_URL` to point to the Render backend URL.
