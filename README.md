# 🛡️ Enterprise Multi-Tenant Security Gateway

**CSC337 - Advanced Web Technologies | Lab Assignment 05**

A production-grade security gateway implementing Hybrid Authentication (Local Bcrypt + Social OAuth 2.0), JWT Token Rotation, Role-Based Access Control (RBAC), and OWASP security hardening.

---

## 🌐 Live Demo

| Service  | URL |
|----------|-----|
| Frontend | `https://your-app.vercel.app` |
| Backend API | `https://your-api.onrender.com` |
| Health Check | `https://your-api.onrender.com/health` |

---

## 🔑 Test Credentials

| Role        | Email                           | Password        |
|-------------|--------------------------------|-----------------|
| SuperAdmin  | superadmin@securegateway.com   | SuperAdmin@123  |
| Manager     | manager@securegateway.com      | Manager@123     |
| Employee    | employee@securegateway.com     | Employee@123    |

> Run `node src/utils/seedUsers.js` to seed these accounts into your database.

---

## ✅ Features Implemented

### 1. Local Authentication & Hashing
- `/api/v1/auth/register` — Register with Bcrypt-hashed passwords (12 salt rounds)
- `/api/v1/auth/login` — Login with credential verification
- **Account Lockout**: Max 5 failed attempts per 15 minutes (automatic lock + countdown)
- Plain-text passwords are **never** stored

### 2. Social Authentication (OAuth 2.0)
- Google OAuth 2.0 via `passport-google-oauth20`
- GitHub OAuth 2.0 via `passport-github2`
- Auto user creation and profile sync on first OAuth login
- Existing accounts linked to OAuth providers

### 3. JWT Token Architecture
| Token | Lifetime | Delivery |
|-------|----------|----------|
| Access Token | 15 minutes | `Authorization: Bearer` header |
| Refresh Token | 7 days | `httpOnly` cookie (Secure, SameSite=Strict) |

- **Refresh Token Rotation** at `/api/v1/auth/refresh` — new pair issued every refresh
- Refresh tokens stored as **bcrypt hashes** in DB (never plaintext)
- Token reuse detection — revokes all tokens if replay attack detected
- Token revocation on logout

### 4. Role-Based Access Control (RBAC)

| Route | Method | Allowed Roles |
|-------|--------|---------------|
| `/api/v1/employee/profile` | GET | SuperAdmin, Manager, Employee |
| `/api/v1/employee/all` | GET | Manager, SuperAdmin |
| `/api/v1/payroll/approve` | POST | Manager, SuperAdmin |
| `/api/v1/payroll/list` | GET | Manager, SuperAdmin |
| `/api/v1/users` | GET | SuperAdmin |
| `/api/v1/users/:id` | DELETE | SuperAdmin |
| `/api/v1/users/:id/role` | PATCH | SuperAdmin |

### 5. OWASP Security Hardening
- **Helmet.js** — HTTP security headers (CSP, HSTS, X-Frame-Options, etc.)
- **Strict CORS** — Allowlist-based origin validation
- **express-mongo-sanitize** — NoSQL injection prevention (strips `$` and `.` operators)
- **express-rate-limit** — Login (5/15min), Register (10/hr), Global API (100/15min)
- **Request body size limit** — 10kb max
- **httpOnly cookies** — Prevents XSS theft of refresh tokens

---

## 🏗️ Project Structure

```
Lab 5/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection
│   │   │   └── passport.js        # OAuth strategies
│   │   ├── controllers/
│   │   │   ├── authController.js  # Register, Login, Refresh, Logout, OAuth
│   │   │   ├── employeeController.js
│   │   │   ├── payrollController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── auth.js            # protect() + checkRole()
│   │   │   └── rateLimiter.js     # express-rate-limit configs
│   │   ├── models/
│   │   │   └── User.js            # Mongoose schema + lockout logic
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── employeeRoutes.js
│   │   │   ├── payrollRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── utils/
│   │   │   ├── tokenUtils.js      # JWT generation + cookie helpers
│   │   │   └── seedUsers.js       # Seed test accounts
│   │   └── server.js              # Express app entry point
│   ├── .env.example
│   ├── package.json
│   └── render.yaml
│
└── frontend/
    ├── src/
    │   ├── api/axiosInstance.js   # Axios + auto token refresh interceptor
    │   ├── context/AuthContext.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── OAuthCallbackPage.jsx
    │   │   └── UnauthorizedPage.jsx
    │   └── App.jsx
    ├── vercel.json
    └── package.json
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (free tier)
- Google OAuth credentials (console.developers.google.com)
- GitHub OAuth app (github.com/settings/developers)

### Backend Setup

```bash
cd backend
npm install

# Copy and fill environment variables
cp .env.example .env

# Seed test users
node src/utils/seedUsers.js

# Start dev server
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install

# Copy and set VITE_API_URL
cp .env.example .env

# Start dev server
npm run dev
```

---

## ☁️ Deployment

### Backend → Render

1. Push code to GitHub (public repo)
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect GitHub repo → select `backend/` folder
4. Set environment variables (all from `.env.example`)
5. Build command: `npm install`
6. Start command: `npm start`

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Connect GitHub repo → select `frontend/` folder
3. Set `VITE_API_URL` to your Render backend URL
4. Framework preset: Vite
5. Deploy

### OAuth Callback URLs to Register

**Google Cloud Console:**
```
https://your-api.onrender.com/api/v1/auth/google/callback
```

**GitHub OAuth App:**
```
https://your-api.onrender.com/api/v1/auth/github/callback
```

---

## 🧪 Postman Testing Guide

### Register
```
POST /api/v1/auth/register
Body: { "name": "Test User", "email": "test@example.com", "password": "Test@12345", "role": "Employee" }
```

### Login
```
POST /api/v1/auth/login
Body: { "email": "superadmin@securegateway.com", "password": "SuperAdmin@123" }
→ Copy accessToken from response
```

### Use Access Token
```
GET /api/v1/employee/profile
Headers: Authorization: Bearer <accessToken>
```

### Test RBAC Rejection (403)
```
DELETE /api/v1/users/some-id
Headers: Authorization: Bearer <employee-token>
→ Expected: 403 Forbidden
```

### Test Rate Limiting (429)
```
POST /api/v1/auth/login (wrong password × 5)
→ Expected: 429 or 423 locked
```

### Refresh Token Rotation
```
POST /api/v1/auth/refresh
(Cookie refreshToken is sent automatically)
→ New accessToken returned, new cookie set
```

### Logout (token revocation)
```
POST /api/v1/auth/logout
→ Cookie cleared, DB token hash deleted
```

---

## 🔒 Security Architecture

```
Client
  │
  ├── Access Token (15min) ──→ localStorage → Authorization header
  │
  └── Refresh Token (7d)  ──→ httpOnly cookie → /api/v1/auth/refresh
                                    │
                              Bcrypt hash stored in MongoDB
                              Token Rotation on every use
                              Reuse detection → revoke all
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT, Bcrypt, Passport.js |
| Security | Helmet, CORS, express-rate-limit, express-mongo-sanitize |
| Frontend | React 18, Vite, React Router v6 |
| Deployment | Render (backend), Vercel (frontend) |
