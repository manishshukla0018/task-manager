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

- Signup / Login with JWT — **httpOnly cookie** plus **`Authorization: Bearer`** fallback (sessionStorage) when the browser does not send the cookie (common on split hosting). Logout clears both.
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
| `MONGODB_URI` | MongoDB connection string (`mongodb+srv://` or `mongodb://`) |
| `MONGODB_URI_DIRECT` | Optional. If set, used instead of `MONGODB_URI` — use Atlas **standard** `mongodb://` URI when SRV DNS fails |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) |
| `CLIENT_URL` | Allowed frontend origin(s) for CORS — **exact** URL users open (comma-separated, no trailing `/`) |
| `CORS_ORIGINS` | Optional extra origins (e.g. Vercel preview URLs) |
| `VITE_API_URL` | (Frontend build only) Set if the UI is **not** served by Express — full API origin, no trailing `/` |

### MongoDB: invalid scheme (`Invalid scheme, expected mongodb://...`)

Your `MONGODB_URI` (or `MONGODB_URI_DIRECT`) must **start with** `mongodb://` or `mongodb+srv://` — no `https://`, no spaces before `mongodb`, no accidental extra quotes.

- Copy the string from Atlas **as-is**; if you wrap it in quotes in `.env`, use only **one** pair: `MONGODB_URI="mongodb+srv://..."`  
- If `MONGODB_URI_DIRECT` was set to a wrong value, **delete that line** or fix it — a bad direct URI is ignored and `MONGODB_URI` is used.

### MongoDB: `querySrv ECONNREFUSED` (Atlas SRV on Windows)

That error means your PC could not resolve the Atlas SRV DNS record (`_mongodb._tcp...`). It is usually **network / DNS / VPN**, not application code.

1. **Atlas → Network Access** — allow your IP or `0.0.0.0/0` for testing.
2. **Use a direct URI** — In `.env`, set `MONGODB_URI_DIRECT` to the **standard** connection string from Atlas (starts with `mongodb://` with several hostnames and ports). Atlas: **Connect → MongoDB Compass** often shows this string; it avoids SRV lookups.
3. **Network** — Try another Wi‑Fi, disable VPN, or set DNS to `8.8.8.8`.
4. **Local dev** — Use `MONGODB_URI=mongodb://127.0.0.1:27017/team-task-manager` with MongoDB installed locally.

### Login works but `/api/auth/me` and other calls return **401** (production)

Usually one of these:

1. **Cross-site cookies** — Frontend on domain A, API on domain B. The server now sets `SameSite=None; Secure` in production so the JWT cookie is sent with `credentials: true`. Both must use **HTTPS** in production.

2. **`CLIENT_URL` mismatch** — On the **server** `.env`, set `CLIENT_URL` to the **exact** origin shown in the browser (scheme + host, no path, no trailing slash), e.g. `https://myapp.vercel.app` or `https://my-service.up.railway.app`. Add comma-separated values or use `CORS_ORIGINS` for preview URLs. Check server logs for `[CORS] Blocked Origin`.

3. **Separate frontend build** — If the SPA calls a different API host, set **`VITE_API_URL`** at **frontend build time** to that API origin (no trailing slash). Keep `CLIENT_URL` on the server matching the SPA origin.

4. **Create project returns 403** — Only users with global role **Admin** can create projects. Sign up as Admin or use an Admin account; Members can join projects and work on tasks only.

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

1. Connect the repo to Railway.
2. Set `MONGODB_URI` (or Atlas), `JWT_SECRET`, and `NODE_ENV=production`.
3. Set **`CLIENT_URL`** to the **exact** URL users open in the browser (e.g. `https://your-app.up.railway.app` or your Vercel URL). If the UI and API are on different hosts, production uses **`SameSite=None`** cookies so the login cookie is sent to the API over HTTPS — `CLIENT_URL` must match the UI origin for CORS. Use `CORS_ORIGINS` for extra preview URLs.
4. If the SPA is built separately and calls another host for the API, set **`VITE_API_URL`** at build time to that API origin (no trailing slash).
5. Deploy (`railway.toml` runs build + start).

## Demo Flow

1. Sign up as **Admin** → create a project
2. Sign up as **Member** (incognito)
3. Admin adds member by email
4. Create tasks, assign, track on dashboard

## License

MIT
