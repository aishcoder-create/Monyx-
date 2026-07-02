# WalletFlow — Full-Stack React + Node.js + MongoDB

A modern expense tracker with a React frontend and Express/MongoDB backend.

## 🗂️ Project Structure

```
EXPENSE tracker ANTI/
├── client/          ← React + Vite frontend
│   ├── src/
│   │   ├── App.jsx  ← Main UI (all pages)
│   │   ├── api.js   ← Axios API client
│   │   └── index.css
│   └── package.json
└── server/          ← Node.js + Express backend
    ├── index.js     ← Entry point
    ├── models/      ← MongoDB schemas
    ├── routes/      ← API route handlers
    ├── middleware/  ← JWT auth middleware
    ├── seed.js      ← Sample data seeder
    └── package.json
```

## 🚀 Getting Started

### 1. Start MongoDB
Make sure MongoDB is running locally:
```bash
mongod
# or
brew services start mongodb-community
```

### 2. Start the Backend (Terminal 1)
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

### 3. Start the Frontend (Terminal 2)
```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

## 🔑 Demo Login Credentials
The database is auto-seeded on first run:
- **Email**: `alex@walletflow.com`
- **Password**: `password123`

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login → returns JWT |
| POST | `/api/auth/register` | Register new user |
| GET | `/api/transactions` | Get all transactions |
| POST | `/api/transactions` | Add transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/budgets` | Get all budgets |
| POST | `/api/budgets` | Create budget |
| PUT | `/api/budgets/:id` | Update budget |
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update profile |
| PUT | `/api/user/password` | Change password |
| GET | `/api/user/stats` | Dashboard stats |

## 🛡️ Tech Stack
- **Frontend**: React 19, Vite, Axios, lucide-react
- **Backend**: Node.js, Express 4, Mongoose
- **Database**: MongoDB
- **Auth**: JWT (jsonwebtoken) + bcryptjs
