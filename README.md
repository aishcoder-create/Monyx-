# Monyx — Personal Finance Manager

> A full-stack expense tracker built with React, Node.js, Express, and MongoDB.

![Tech Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![Node](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb) ![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)

---

## ✨ Features

- 🔐 **Authentication** — Email/password + Google OAuth login
- 💰 **Dashboard** — Real-time financial overview with KPI cards
- 🏦 **Accounts** — Manage bank/savings/credit accounts + internal transfers
- 📊 **Budgets** — Set category spending limits and track usage
- 📋 **Transactions** — Internal fund transfers between accounts
- 📈 **Reports** — Spending analytics and trend charts
- ⚙️ **Settings** — Profile management, notifications, security
- 👥 **Workspaces** — Multi-user shared financial workspaces

---

## 🏗️ Project Structure

```
monyx/
├── client/                    # React + Vite frontend
│   ├── public/                # Static assets (images, icons)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── AccountModal.jsx
│   │   │   ├── CreateBudgetModal.jsx
│   │   │   ├── EditDrawer.jsx
│   │   │   ├── InviteMemberModal.jsx
│   │   │   ├── PageSpinner.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Topbar.jsx
│   │   ├── pages/             # Route-level page components
│   │   │   ├── AccountsPage.jsx
│   │   │   ├── BudgetsPage.jsx
│   │   │   ├── DashboardApp.jsx
│   │   │   ├── DashboardContent.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── TransactionsPage.jsx
│   │   ├── services/
│   │   │   └── api.js         # Axios API client + all endpoints
│   │   ├── hooks/             # Custom React hooks (future)
│   │   ├── utils/             # Utility functions (future)
│   │   ├── App.jsx            # Root component + routing logic
│   │   ├── index.css          # Global styles
│   │   └── main.jsx           # React entry point
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Express + MongoDB backend
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT authentication guard
│   ├── models/                # Mongoose data models
│   │   ├── Account.js
│   │   ├── Budget.js
│   │   ├── Transaction.js
│   │   ├── User.js
│   │   └── Workspace.js
│   ├── routes/                # REST API route handlers
│   │   ├── accounts.js
│   │   ├── auth.js
│   │   ├── budgets.js
│   │   ├── transactions.js
│   │   ├── user.js
│   │   └── workspaces.js
│   ├── scripts/               # Database utility scripts
│   │   ├── dropDB.js
│   │   ├── resetPasswords.js
│   │   └── seed.js
│   ├── utils/
│   │   └── email.js           # Nodemailer email helper
│   ├── .env.example
│   ├── index.js               # Server entry point
│   └── package.json
│
├── package.json               # Root scripts (dev:server, dev:client)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/aishcoder-create/Monyx-.git
cd Monyx-
```

### 2. Configure environment variables

**Server:**
```bash
cp server/.env.example server/.env
# Edit server/.env with your values
```

**Client:**
```bash
cp client/.env.example client/.env
# Edit client/.env if needed
```

### 3. Install dependencies
```bash
# Install all dependencies (server + client)
npm run install:all
```

### 4. Run in development
```bash
# Terminal 1 — Start backend
npm run dev:server

# Terminal 2 — Start frontend
npm run dev:client
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5001 |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login with email/password |
| `POST` | `/api/auth/google` | Google OAuth login |
| `GET` | `/api/workspaces` | List user workspaces |
| `GET` | `/api/transactions` | List transactions |
| `POST` | `/api/transactions` | Create transaction |
| `GET` | `/api/accounts` | List accounts |
| `POST` | `/api/accounts` | Create account |
| `GET` | `/api/budgets` | List budgets |
| `POST` | `/api/budgets` | Create budget |
| `GET` | `/api/user/profile` | Get user profile |
| `GET` | `/api/health` | Server health check |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Lucide Icons |
| Styling | Vanilla CSS (custom design system) |
| Backend | Node.js, Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT + Google OAuth 2.0 |
| Email | Nodemailer (Gmail SMTP) |
| Dev | Nodemon, ESM modules |

---

## 📄 License

MIT © 2024 Monyx Inc.
