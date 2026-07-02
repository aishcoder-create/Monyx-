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
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));

/* ── Routes ─────────────────────────────────── */
app.use('/api/auth',         authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets',      budgetRoutes);
app.use('/api/user',         userRoutes);
app.use('/api/workspaces',   workspaceRoutes);
app.use('/api/accounts',     accountRoutes);

/* ── Health check ───────────────────────────── */
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date() }));

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
