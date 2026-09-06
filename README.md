# LensCraft Photography Booking Platform

A full-stack photography & videography booking platform built with React + Express.js + MySQL.

## 🏗️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 19, Vite, React Router, Axios |
| Backend   | Node.js, Express.js, MySQL2         |
| Auth      | JWT (jsonwebtoken), bcrypt          |
| Database  | MySQL 8+                            |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8+

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/photography-booking-platform.git
cd photography-booking-platform

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secret
```

### 3. Setup Database

```bash
cd backend
node migrations/run.js   # Creates tables
node seeds/seed.js       # Seeds test data & services
```

### 4. Run Development Servers

**Terminal 1 — Backend (port 5000):**
```bash
cd backend && npm run dev
```

**Terminal 2 — Frontend (port 5173):**
```bash
cd frontend && npm run dev
```

Open **http://localhost:5173**

---

## 🔑 Development Credentials

| Role     | Email                                | Password      |
|----------|--------------------------------------|---------------|
| Owner    | owner@lenscraftphotography.com       | owner@123     |
| Customer | customer@example.com                 | customer@123  |

> ⚠️ Change these before deploying to production!

---

## 📁 Project Structure

```
photography-booking-platform/
├── backend/
│   ├── migrations/         # SQL schema migrations
│   ├── seeds/              # Test data seeder
│   └── src/
│       ├── config/         # DB config
│       ├── controllers/    # Route handlers
│       ├── middleware/     # Auth, error handling
│       ├── repositories/   # DB queries
│       ├── routes/         # API routes
│       ├── services/       # Business logic
│       └── utils/          # Helpers
└── frontend/
    ├── public/images/      # Service images
    └── src/
        ├── api/            # Axios client
        ├── components/     # Reusable components
        ├── context/        # Auth context
        └── pages/          # All pages
            ├── public/     # Home, Services, Login, Register
            ├── customer/   # Booking, My Bookings
            └── owner/      # Dashboard, Bookings, Calendar, Services
```

## 🌐 API Endpoints

| Method | Endpoint                        | Auth     | Description              |
|--------|---------------------------------|----------|--------------------------|
| POST   | /api/auth/register              | —        | Customer registration    |
| POST   | /api/auth/login                 | —        | Customer login           |
| POST   | /api/auth/owner/login           | —        | Owner login              |
| GET    | /api/services                   | —        | List active services     |
| GET    | /api/bookings/availability      | —        | Check slot availability  |
| POST   | /api/bookings                   | Customer | Create booking           |
| GET    | /api/bookings/my                | Customer | My bookings              |
| GET    | /api/owner/dashboard            | Owner    | Stats & upcoming         |
| GET    | /api/owner/calendar             | Owner    | Calendar view            |
| GET    | /api/owner/bookings             | Owner    | All bookings             |
| PATCH  | /api/owner/bookings/:id/status  | Owner    | Update booking status    |
| POST   | /api/services                   | Owner    | Create service           |
| PUT    | /api/services/:id               | Owner    | Update service           |
| DELETE | /api/services/:id               | Owner    | Delete service           |
