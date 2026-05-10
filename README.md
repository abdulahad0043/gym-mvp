# GymOS — MVP Backend

A minimal gym management system built with Node.js, Express, and MongoDB.

## Stack
- **Runtime**: Node.js 18+
- **Framework**: Express 4
- **Database**: MongoDB via Mongoose
- **Auth**: JWT (12h expiry)
- **Frontend**: EJS + Tailwind CDN

---

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and admin credentials

# 3. Run dev server (with auto-reload)
npm run dev

# 4. Open browser
open http://localhost:3000
```

---

## API Reference

All routes (except `/api/auth/login`) require:
```
Authorization: Bearer <token>
```

| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| POST   | `/api/auth/login`         | Admin login → returns JWT          |
| POST   | `/api/members/register`   | Register a new member              |
| GET    | `/api/members`            | List all members (auto-flags overdue) |
| GET    | `/api/members/:id`        | Single member detail               |
| PUT    | `/api/members/:id`        | Update member fields               |
| DELETE | `/api/members/:id`        | Remove member                      |
| POST   | `/api/attendance/checkin` | Check-in a member (1 per day)      |
| GET    | `/api/attendance`         | Today's check-ins                  |
| GET    | `/api/attendance/:id`     | Last 30 check-ins for a member     |
| PUT    | `/api/plans/assign-plan`  | Assign diet & workout plan         |
| GET    | `/api/plans/:memberId`    | Plan assignment history            |

---

## Deploy to Render / Railway

1. Push this repo to GitHub.
2. Create a new **Web Service** on Render (or Railway).
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node server.js`
5. Add environment variables from `.env.example` in the dashboard.
6. Done — both platforms auto-deploy on every push.

---

## Project Structure

```
gym-mvp/
├── server.js              # Entry point
├── models/
│   ├── Member.js          # Schema + daysRemaining virtual + overdue pre-save hook
│   ├── Attendance.js      # Check-in log
│   └── Plan.js            # Plan assignment history
├── routes/
│   ├── auth.js            # POST /login
│   ├── members.js         # CRUD + register
│   ├── attendance.js      # Check-in
│   └── plans.js           # Assign plan
├── middleware/
│   ├── auth.js            # JWT protect()
│   └── errorHandler.js    # Global error handler
├── views/
│   ├── login.ejs          # Admin login page
│   └── dashboard.ejs      # Main dashboard
└── .env.example
```

## Beta → Production Upgrade Path

- Replace single-admin `.env` auth with a hashed `Admin` Mongoose model
- Add `express-rate-limit` on `/api/auth/login`
- Add pagination to `GET /api/members` for large gyms
- Add SMS reminders via Twilio when `daysRemaining <= 3`
- Add photo upload (multer + Cloudinary) to member profiles
