import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes        from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import budgetRoutes      from './routes/budgets.js';
import userRoutes        from './routes/user.js';
import workspaceRoutes   from './routes/workspaces.js';
import accountRoutes     from './routes/accounts.js';

const app  = express();
const PORT = process.env.PORT || 5000;

/* ── Middleware ─────────────────────────────── */
app.use(cors({ origin: [process.env.CLIENT_URL, 'http://localhost:5173'].filter(Boolean), credentials: true }));
app.use(express.json({ limit: '10mb' }));

/* ── Routes ─────────────────────────────────── */
app.use('/api/auth',         authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets',      budgetRoutes);
app.use('/api/user',         userRoutes);
app.use('/api/workspaces',   workspaceRoutes);
app.use('/api/accounts',     accountRoutes);

/* ── Health check ───────────────────────────── */
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date(), db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

/* ── Root status page ───────────────────────── */
app.get('/', (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1;
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Monyx API Server</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f1117; color: #e5e7eb; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: #1a1d27; border: 1px solid #2d3148; border-radius: 16px; padding: 40px; max-width: 640px; width: 100%; box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
    .logo { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
    .logo-icon { width: 44px; height: 44px; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
    .logo-name { font-size: 22px; font-weight: 800; color: #fff; }
    .logo-sub { font-size: 13px; color: #6b7280; }
    .status-row { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; padding: 14px 18px; background: #111827; border-radius: 10px; border: 1px solid ${dbStatus ? '#064e3b' : '#7f1d1d'}; }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: ${dbStatus ? '#10b981' : '#ef4444'}; box-shadow: 0 0 8px ${dbStatus ? '#10b981' : '#ef4444'}; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
    .status-text { font-size: 14px; font-weight: 600; color: ${dbStatus ? '#10b981' : '#ef4444'}; }
    .status-sub { font-size: 12px; color: #6b7280; margin-left: auto; }
    h2 { font-size: 13px; font-weight: 700; color: #6b7280; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px; }
    .endpoints { display: flex; flex-direction: column; gap: 8px; }
    .ep { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: #111827; border-radius: 8px; border: 1px solid #1f2937; }
    .method { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; min-width: 48px; text-align: center; }
    .get  { background: #052e16; color: #4ade80; }
    .post { background: #1e1b4b; color: #818cf8; }
    .put  { background: #1c1917; color: #fb923c; }
    .del  { background: #450a0a; color: #f87171; }
    .ep-path { font-size: 13px; font-family: 'SF Mono', monospace; color: #d1d5db; }
    .ep-desc { font-size: 12px; color: #4b5563; margin-left: auto; }
    .divider { height: 1px; background: #1f2937; margin: 24px 0; }
    .footer { font-size: 12px; color: #374151; text-align: center; }
    .footer span { color: #4f46e5; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <div class="logo-icon">💰</div>
      <div>
        <div class="logo-name">Monyx</div>
        <div class="logo-sub">Backend API Server</div>
      </div>
    </div>

    <div class="status-row">
      <div class="dot"></div>
      <div class="status-text">${dbStatus ? 'API Online & Database Connected' : 'Database Disconnected'}</div>
      <div class="status-sub">Port ${PORT}</div>
    </div>

    <h2>API Endpoints</h2>
    <div class="endpoints">
      <div class="ep"><span class="method post">POST</span><span class="ep-path">/api/auth/register</span><span class="ep-desc">Create account</span></div>
      <div class="ep"><span class="method post">POST</span><span class="ep-path">/api/auth/login</span><span class="ep-desc">Login</span></div>
      <div class="ep"><span class="method post">POST</span><span class="ep-path">/api/auth/google</span><span class="ep-desc">Google OAuth</span></div>
      <div class="ep"><span class="method get">GET</span><span class="ep-path">/api/workspaces</span><span class="ep-desc">List workspaces</span></div>
      <div class="ep"><span class="method get">GET</span><span class="ep-path">/api/transactions</span><span class="ep-desc">List transactions</span></div>
      <div class="ep"><span class="method post">POST</span><span class="ep-path">/api/transactions</span><span class="ep-desc">Create transaction</span></div>
      <div class="ep"><span class="method get">GET</span><span class="ep-path">/api/accounts</span><span class="ep-desc">List accounts</span></div>
      <div class="ep"><span class="method post">POST</span><span class="ep-path">/api/accounts</span><span class="ep-desc">Create account</span></div>
      <div class="ep"><span class="method get">GET</span><span class="ep-path">/api/budgets</span><span class="ep-desc">List budgets</span></div>
      <div class="ep"><span class="method post">POST</span><span class="ep-path">/api/budgets</span><span class="ep-desc">Create budget</span></div>
      <div class="ep"><span class="method get">GET</span><span class="ep-path">/api/user/profile</span><span class="ep-desc">User profile</span></div>
      <div class="ep"><span class="method get">GET</span><span class="ep-path">/api/health</span><span class="ep-desc">Health check (JSON)</span></div>
    </div>

    <div class="divider"></div>
    <div class="footer">Frontend running at <span>http://localhost:5173</span> · MongoDB at <span>localhost:27017</span></div>
  </div>
</body>
</html>`);
});


/* ── Connect MongoDB → start server ─────────── */
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected:', process.env.MONGO_URI);
    // Auto-seed if DB is empty
    const { seedDB } = await import('./seed.js');
    await seedDB();
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
