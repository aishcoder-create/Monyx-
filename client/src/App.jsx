import React, { useState, useEffect, useCallback } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import {
  ArrowRight, Activity, Target, BarChart3, CheckCircle2, ShieldCheck,
  Receipt, Check, X, Globe, Link2, MessageCircle, Wallet, Zap,
  LayoutDashboard, ArrowLeftRight, PiggyBank, Settings, Mail, Lock,
  Eye, EyeOff, AlertCircle, Search, SlidersHorizontal, Plus, ChevronLeft,
  ChevronRight, Monitor, Coffee, DollarSign, Fuel, Calendar,
  ChevronDown, LogOut, User, Bell, TrendingUp, ShoppingCart, Utensils,
  Car, Tv, Dumbbell, MoreVertical, CirclePlus, Filter, CreditCard, Loader2,
  Trash2, Play, Users, UserPlus, Landmark, TrendingDown, Download, ArrowUp, HelpCircle,
  Home, Trash, ArrowUpRight, ArrowDownRight, RefreshCw, FileText
} from 'lucide-react';
import {
  login as apiLogin, register as apiRegister, googleLogin as apiGoogleLogin,
  getTransactions, addTransaction, updateTransaction, deleteTransaction,
  getBudgets, addBudget, updateBudget, deleteBudget,
  getProfile, updateProfile, changePassword, getDashStats, requestOtp, verifyOtpProfileUpdate,
  getWorkspaces, createWorkspace, inviteToWorkspace,
  getAccounts, addAccount, deleteAccount
} from './services/api.js';
import * as api from './services/api';
import './index.css';

/* ─── Auth helpers ───────────────────────────── */
const getToken = () => localStorage.getItem('wf_token');
const getUser  = () => { try { return JSON.parse(localStorage.getItem('wf_user')); } catch { return null; } };
const saveAuth = (token, user) => {
  localStorage.setItem('wf_token', token);
  localStorage.setItem('wf_user', JSON.stringify(user));
};
const clearAuth = () => {
  localStorage.removeItem('wf_token');
  localStorage.removeItem('wf_user');
  localStorage.removeItem('wf_workspace');
};

/* ─── Constants ──────────────────────────────── */

import PageSpinner from './components/PageSpinner.jsx';
import Sidebar from './components/Sidebar.jsx';
import EditDrawer from './components/EditDrawer.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import AccountsPage from './pages/AccountsPage.jsx';
import AccountModal from './components/AccountModal.jsx';
import BudgetsPage from './pages/BudgetsPage.jsx';
import CreateBudgetModal from './components/CreateBudgetModal.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import DashboardContent from './pages/DashboardContent.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import Topbar from './components/Topbar.jsx';
import InviteMemberModal from './components/InviteMemberModal.jsx';
import DashboardApp from './pages/DashboardApp.jsx';
import LoginPage from './pages/LoginPage.jsx';


const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',        icon: LayoutDashboard },
  { id: 'accounts',     label: 'Accounts',         icon: Landmark },
  { id: 'transactions', label: 'Transactions',     icon: Receipt },
  { id: 'budgets',      label: 'Budgets',          icon: PiggyBank },
  { id: 'settings',     label: 'Settings',         icon: Settings },
];

export default function App() {
  // Check if already logged in (persisted token)
  const [screen, setScreen]   = useState(() => getToken() ? 'dashboard' : 'landing');
  const [userData, setUserData] = useState(() => getUser());
  const [showDemo, setShowDemo] = useState(false);

  const handleLogin = (user) => {
    setUserData(user);
    setScreen('dashboard');
  };

  const handleLogout = () => {
    clearAuth();
    setUserData(null);
    setScreen('landing');
  };

  const handleUpdateUser = (updates) => {
    const newUser = { ...userData, ...updates };
    setUserData(newUser);
    saveAuth(getToken(), newUser);
  };

  if (screen === 'login')     return <LoginPage onLogin={handleLogin} onBack={() => setScreen('landing')} />;
  if (screen === 'dashboard') return <DashboardApp onLogout={handleLogout} userData={userData} onUpdateUser={handleUpdateUser} />;

  /* ── LANDING ── */
  return (
    <>
      <header className="header">
        <div className="container">
          <div className="logo"><div className="logo-icon"><Wallet size={16} color="#fff" /></div>WalletFlow</div>
          <nav className="nav"><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#resources">Resources</a></nav>
          <button className="btn btn-dark" onClick={() => setScreen('login')}>Login</button>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="pill"><Zap size={12} /> Early Bird Seats Available</div>
            <h1>Take Control of<br />Your Financial<br />Future</h1>
            <p className="hero-desc">A precision-engineered platform designed for professionals to manage liquidity, track expenses, and forecast growth with controlled calm.</p>
            <div className="hero-actions">
              <button className="btn btn-dark" onClick={() => setScreen('login')}>Get Started Free <ArrowRight size={15} /></button>
              <button className="btn btn-outline" onClick={() => setShowDemo(true)}>Watch Demo</button>
            </div>
          </div>
          <div className="hero-visual"><img src="/hero.jpg" alt="WalletFlow dashboard" /></div>
        </div>
      </section>

      <div className="stats-bar">
        <div className="container">
          <div className="stat-item"><div className="stat-value">500k+</div><div className="stat-label">Active Users</div></div>
          <div className="stat-divider" />
          <div className="stat-item"><div className="stat-value">$2B+</div><div className="stat-label">Wealth Tracked</div></div>
          <div className="stat-divider" />
          <div className="stat-item"><div className="stat-value">4.9/5</div><div className="stat-label">App Store Rating</div></div>
          <div className="stat-divider" />
          <div className="stat-item"><div className="stat-value">99.9%</div><div className="stat-label">Uptime SLA</div></div>
        </div>
      </div>

      <section id="features" className="features">
        <div className="container">
          <p className="section-eyebrow">What we offer</p>
          <h2 className="section-title">Engineered for Clarity</h2>
          <p className="section-sub">We stripped away the clutter to give you a financial tool that works as hard as you do.</p>
          <div className="features-grid">
            <div className="feature-card"><div className="feature-icon icon-blue"><Activity size={22} /></div><h3>Real-time Tracking</h3><p>Connect accounts securely and see your net worth update in real-time.</p></div>
            <div className="feature-card"><div className="feature-icon icon-green"><Target size={22} /></div><h3>Intelligent Budgets</h3><p>AI learns your patterns to suggest realistic budgets that help you save faster.</p></div>
            <div className="feature-card"><div className="feature-icon icon-purple"><BarChart3 size={22} /></div><h3>Deep Analytics</h3><p>Professional-grade reports that turn raw numbers into actionable strategies.</p></div>
          </div>
        </div>
      </section>

      <section id="pricing" className="pricing">
        <div className="container">
          <p className="section-eyebrow">Pricing Plans</p>
          <h2 className="section-title">Simple, transparent pricing</h2>
          <p className="section-sub">Start for free and upgrade when you need advanced professional features.</p>
          
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-tier">Starter</div>
              <div className="pricing-price">$0<span>/mo</span></div>
              <ul className="pricing-features">
                <li><Check size={18} /> Basic income & expense tracking</li>
                <li><Check size={18} /> 1 Connected account</li>
                <li><Check size={18} /> Standard dashboard</li>
                <li><Check size={18} /> Community support</li>
              </ul>
              <button className="btn btn-outline" onClick={() => setScreen('login')} style={{ width: '100%' }}>Get Started Free</button>
            </div>
            
            <div className="pricing-card premium">
              <div className="pricing-tier">Professional</div>
              <div className="pricing-price">$12<span>/mo</span></div>
              <ul className="pricing-features">
                <li><Check size={18} /> Unlimited connected accounts</li>
                <li><Check size={18} /> AI-powered smart budgets</li>
                <li><Check size={18} /> Advanced net worth analytics</li>
                <li><Check size={18} /> Priority 24/7 support</li>
              </ul>
              <button className="btn btn-primary" onClick={() => setScreen('login')} style={{ width: '100%' }}>Start 14-Day Trial</button>
            </div>
          </div>
        </div>
      </section>

      <section id="resources" className="resources">
        <div className="container">
          <p className="section-eyebrow">Resources</p>
          <h2 className="section-title">Knowledge is wealth</h2>
          <p className="section-sub">Master your finances with our latest guides, tutorials, and industry insights.</p>
          
          <div className="resources-grid">
            <div className="resource-card">
              <span className="resource-tag">Guide</span>
              <h3 className="resource-title">The 50/30/20 Rule for Professionals</h3>
              <p className="resource-desc">Learn how to effortlessly split your income between needs, wants, and savings without sacrificing your lifestyle.</p>
              <a href="#" className="resource-link" onClick={e => { e.preventDefault(); alert('The 50/30/20 Guide is available exclusively inside the WalletFlow dashboard. Please sign in to access it.'); setScreen('login'); }}>Read Guide <ArrowRight size={14} /></a>
            </div>
            
            <div className="resource-card">
              <span className="resource-tag">Tutorial</span>
              <h3 className="resource-title">Mastering AI Smart Budgets</h3>
              <p className="resource-desc">A step-by-step walkthrough on setting up predictive AI budgets to automate your monthly savings goals.</p>
              <a href="#" className="resource-link" onClick={e => { e.preventDefault(); alert('Video tutorials are available exclusively inside the WalletFlow dashboard. Please sign in to access it.'); setScreen('login'); }}>Watch Tutorial <ArrowRight size={14} /></a>
            </div>
            
            <div className="resource-card">
              <span className="resource-tag">Insight</span>
              <h3 className="resource-title">State of Personal Finance 2024</h3>
              <p className="resource-desc">Our annual report on how top professionals are diversifying their portfolios and managing inflation risks.</p>
              <a href="#" className="resource-link" onClick={e => { e.preventDefault(); alert('The 2024 Finance Report is available exclusively inside the WalletFlow dashboard. Please sign in to access it.'); setScreen('login'); }}>Download Report <ArrowRight size={14} /></a>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Ready to master your money?</h2>
          <p>Join 500,000+ professionals who trust WalletFlow for financial clarity.</p>
          <div className="cta-actions">
            <button className="btn btn-primary" onClick={() => setScreen('login')}>Create Your Free Account</button>
            <button className="btn btn-ghost" onClick={() => window.location.href = 'mailto:sales@walletflow.com?subject=WalletFlow%20Enterprise%20Sales%20Inquiry'}>Contact Sales</button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo"><div className="logo-icon" style={{ background: '#6b7280' }}><Wallet size={15} color="#fff" /></div>WalletFlow</div>
              <p>Precision financial tools for the modern professional.</p>
            </div>
            <div className="footer-col"><h5>Product</h5><ul><li><a href="#">Features</a></li><li><a href="#">Security</a></li><li><a href="#">Integrations</a></li></ul></div>
            <div className="footer-col"><h5>Company</h5><ul><li><a href="#">About</a></li><li><a href="#">Careers</a></li><li><a href="#">Privacy Policy</a></li></ul></div>
            <div className="footer-col"><h5>Connect</h5><div className="social-row"><a href="#"><Globe size={16} /></a><a href="#"><MessageCircle size={16} /></a><a href="#"><Link2 size={16} /></a></div></div>
          </div>
          <div className="footer-bottom">© 2024 WalletFlow Inc. All rights reserved.</div>
        </div>
      </footer>

      {showDemo && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999, padding: 16, boxSizing: 'border-box'
          }} 
          onClick={() => setShowDemo(false)}
        >
          <div 
            style={{
              background: '#1A1D27', width: '100%', maxWidth: 640, borderRadius: 12,
              border: '1px solid #374151', padding: 32, boxSizing: 'border-box',
              position: 'relative', textAlign: 'center', color: '#fff'
            }} 
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowDemo(false)}
              style={{
                position: 'absolute', top: 16, right: 16, border: 'none',
                background: '#2d313f', color: '#fff', cursor: 'pointer',
                borderRadius: '50%', width: 28, height: 28, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 14
              }}
            >✕</button>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 700 }}>WalletFlow Live Tour</h3>
            <p style={{ color: '#9CA3AF', margin: '0 0 24px 0', fontSize: 15 }}>
              Take a quick tour of our professional expense manager, target planning, and analytics dashboard.
            </p>
            
            <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid #1f2937', background: '#000', marginBottom: 24, position: 'relative', paddingTop: '56.25%', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
              <iframe 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                src="https://www.youtube.com/embed/oHg5SJYRHA0?autoplay=0&controls=1&rel=0" 
                title="WalletFlow Product Demo" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            
            <button 
              onClick={() => { setShowDemo(false); setScreen('login'); }}
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: '#fff', border: 'none',
                padding: '16px 24px', borderRadius: 8, fontWeight: 600,
                cursor: 'pointer', width: '100%', fontSize: 16,
                boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                transition: 'transform 0.1s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Sign In & Get Started
            </button>
          </div>
        </div>
      )}
    </>
  );
}
