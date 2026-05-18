# Team Task Manager

Production-ready full-stack MERN application for team project and task management with role-based access control.

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React, TailwindCSS, React Router, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (httpOnly cookies), bcrypt |
| Deployment | Railway |

## Architecture

```
team-task-manager/
├── backend/
│   ├── config/          # env, database, cors
│   ├── controllers/     # HTTP request handlers (thin)
│   ├── middleware/      # auth, validation, errors
│   ├── models/          # Mongoose schemas
│   ├── routes/          # REST API routes
│   ├── services/        # Business logic layer
│   ├── utils/           # helpers, AppError, JWT
│   └── server.js        # Express entry point
├── frontend/
│   └── src/
│       ├── components/  # reusable UI
│       ├── context/     # Auth context
│       ├── hooks/       # useDashboard, useProjects, useTasks
│       ├── layouts/     # AppLayout, AuthLayout
│       ├── pages/       # route pages
│       ├── services/    # API client layer
│       └── utils/
├── railway.toml
└── .env.example
```

### Design principles

- **Separation of concerns** — Controllers delegate to services; UI uses hooks + services
- **RBAC** — Global roles (Admin/Member) + per-project admin
- **Production-ready** — Validation, error handling, static serving, Railway config

## Features

- Signup / Login with JWT httpOnly cookies
- Admin: create projects, manage members, full task control
- Member: view projects, create tasks, update assigned task status
- Task filters: status, assignee, due date
- Dashboard: stats, recent tasks, overdue highlighting

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Setup

```bash
# Install all dependencies
npm run install:all

# Copy environment file
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET
```

### Development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5000

### Production

```bash
npm run build
npm start
```

Express serves the React build and API on one port.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) |
| `CLIENT_URL` | Frontend URL for CORS (dev) |

## API Reference

Base URL: `/api`

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Current user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | List user projects |
| POST | `/projects` | Create (Admin) |
| GET | `/projects/:id` | Get project |
| PUT | `/projects/:id` | Update |
| DELETE | `/projects/:id` | Delete |
| POST | `/projects/:id/members` | Add member by email |
| DELETE | `/projects/:id/members/:userId` | Remove member |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks/stats/dashboard` | Dashboard stats |
| GET | `/tasks` | List (filters: `projectId`, `status`, `assignee`, `dueDate`, `myTasks`) |
| POST | `/tasks` | Create |
| GET | `/tasks/:id` | Get task |
| PUT | `/tasks/:id` | Update |
| DELETE | `/tasks/:id` | Delete (Admin) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all (Admin) |
| GET | `/users/search?email=` | Find by email |

## Railway Deployment

1. Connect repo to Railway
2. Add MongoDB (plugin or Atlas `MONGODB_URI`)
3. Set `NODE_ENV=production`, `JWT_SECRET`, `MONGODB_URI`
4. Deploy — uses `railway.toml` build/start commands

## Demo Flow

1. Sign up as **Admin** → create a project
2. Sign up as **Member** (incognito)
3. Admin adds member by email
4. Create tasks, assign, track on dashboard

## License

MIT
