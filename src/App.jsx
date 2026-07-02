import React, { useState } from 'react';
import {
  ArrowRight, Activity, Target, BarChart3, CheckCircle2, ShieldCheck,
  Receipt, Check, X, Globe, Link2, MessageCircle, Wallet, Zap,
  LayoutDashboard, ArrowLeftRight, PiggyBank, Settings, Mail, Lock,
  Eye, EyeOff, AlertCircle, Search, SlidersHorizontal, Plus, ChevronLeft,
  ChevronRight, Monitor, Coffee, DollarSign, Fuel, Upload, Calendar,
  ChevronDown, LogOut, User, Bell, TrendingUp, ShoppingCart, Utensils,
  Car, Tv, Dumbbell, MoreVertical, CirclePlus, Filter, CreditCard,
} from 'lucide-react';
import './index.css';

/* ─── Constants ─────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'budgets',      label: 'Budgets',      icon: PiggyBank },
  { id: 'settings',     label: 'Settings',     icon: Settings },
];

const ALL_TRANSACTIONS = [
  { id: 1,  date: 'Oct 24, 2023', desc: 'Apple Store – MacBook Air',  icon: Monitor,    category: 'Tech',      account: 'Checking (****4210)', amount: -1299.00 },
  { id: 2,  date: 'Oct 24, 2023', desc: 'Starbucks Coffee',           icon: Coffee,     category: 'Dining',    account: 'Checking (****4210)', amount: -6.50   },
  { id: 3,  date: 'Oct 23, 2023', desc: 'Monthly Salary – TechCorp',  icon: DollarSign, category: 'Income',    account: 'Savings (****8892)',  amount: +6400.00 },
  { id: 4,  date: 'Oct 22, 2023', desc: 'Shell Gasoline',             icon: Fuel,       category: 'Transport', account: 'Checking (****4210)', amount: -52.12  },
  { id: 5,  date: 'Oct 21, 2023', desc: 'Netflix Subscription',       icon: Monitor,    category: 'Entertainment', account: 'Checking (****4210)', amount: -15.99 },
  { id: 6,  date: 'Oct 20, 2023', desc: 'Whole Foods Market',         icon: Coffee,     category: 'Dining',    account: 'Checking (****4210)', amount: -87.34  },
  { id: 7,  date: 'Oct 19, 2023', desc: 'Freelance Payment',          icon: DollarSign, category: 'Income',    account: 'Savings (****8892)',  amount: +850.00 },
  { id: 8,  date: 'Oct 18, 2023', desc: 'Uber Ride',                  icon: Fuel,       category: 'Transport', account: 'Checking (****4210)', amount: -12.50  },
];

const CATEGORY_COLORS = {
  Tech:          { bg: '#EFF6FF', text: '#3B82F6' },
  Dining:        { bg: '#ECFDF5', text: '#10B981' },
  Income:        { bg: '#ECFDF5', text: '#059669' },
  Transport:     { bg: '#F5F3FF', text: '#8B5CF6' },
  Entertainment: { bg: '#FFF7ED', text: '#F97316' },
};

/* ─── Sidebar ────────────────────────────────────────────── */
function Sidebar({ active, setActive, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo-icon"><Wallet size={18} color="#fff" /></div>
        <div>
          <span className="sidebar-brand-name">WalletFlow</span>
          <span className="sidebar-brand-sub">Professional Finance</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`sidebar-nav-item ${active === id ? 'active' : ''}`}
            onClick={() => setActive(id)}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Export Data button */}
      <div className="sidebar-export">
        <button className="sidebar-export-btn">Export Data</button>
      </div>

      {/* User profile */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">AC</div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">Alex Chen</span>
          <span className="sidebar-user-plan">PREMIUM PLAN</span>
        </div>
        <button className="sidebar-user-logout" onClick={onLogout} title="Sign out">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

/* ─── Category Badge ─────────────────────────────────────── */
function CategoryBadge({ cat }) {
  const c = CATEGORY_COLORS[cat] || { bg: '#F3F4F6', text: '#6B7280' };
  return (
    <span className="cat-badge" style={{ background: c.bg, color: c.text }}>
      {cat}
    </span>
  );
}

/* ─── Edit Transaction Drawer ────────────────────────────── */
function EditDrawer({ txn, onClose }) {
  const [desc, setDesc]     = useState(txn.desc);
  const [date, setDate]     = useState(txn.date);
  const [cat, setCat]       = useState(txn.category);
  const [account, setAccount] = useState(txn.account);
  const [notes, setNotes]   = useState('Work laptop replacement. Approved by finance dept on 10/22.');

  const isNeg = txn.amount < 0;
  const fmt = (n) => (n < 0 ? '-$' : '+$') + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <span className="drawer-title">Edit Transaction</span>
          <button className="drawer-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Amount */}
        <div className="drawer-amount-block">
          <p className="drawer-amount-label">TRANSACTION AMOUNT</p>
          <p className="drawer-amount" style={{ color: isNeg ? '#ef4444' : '#00B27A' }}>
            {fmt(txn.amount)}
          </p>
        </div>

        {/* Fields */}
        <div className="drawer-body">
          <div className="drawer-field">
            <label>Description</label>
            <input
              className="drawer-input"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>

          <div className="drawer-row">
            <div className="drawer-field">
              <label>Date</label>
              <div className="drawer-input drawer-date-input">
                <Calendar size={14} style={{ color: '#6B7280', flexShrink: 0 }} />
                <input
                  type="text"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: 'var(--color-dark)', width: '100%' }}
                />
              </div>
            </div>
            <div className="drawer-field">
              <label>Category</label>
              <div className="drawer-select-wrap">
                <select
                  className="drawer-input drawer-select"
                  value={cat}
                  onChange={e => setCat(e.target.value)}
                >
                  {Object.keys(CATEGORY_COLORS).map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="drawer-select-icon" />
              </div>
            </div>
          </div>

          <div className="drawer-field">
            <label>Account</label>
            <div className="drawer-select-wrap">
              <select
                className="drawer-input drawer-select"
                value={account}
                onChange={e => setAccount(e.target.value)}
              >
                <option>Checking (****4210)</option>
                <option>Savings (****8892)</option>
              </select>
              <ChevronDown size={14} className="drawer-select-icon" />
            </div>
          </div>

          <div className="drawer-field">
            <label>Notes</label>
            <textarea
              className="drawer-input drawer-textarea"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Upload receipt */}
          <div className="drawer-upload">
            <Receipt size={22} style={{ color: '#9CA3AF' }} />
            <span>Click to upload receipt</span>
          </div>
        </div>

        {/* Footer */}
        <div className="drawer-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-dark">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Transactions Page ──────────────────────────────────── */
function TransactionsPage() {
  const [search, setSearch]       = useState('');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [category, setCategory]   = useState('All Categories');
  const [accountTab, setAccountTab] = useState('Checking');
  const [editTxn, setEditTxn]     = useState(null);
  const [page, setPage]           = useState(1);
  const PER_PAGE = 4;

  // Filter
  const filtered = ALL_TRANSACTIONS.filter(t => {
    const matchSearch = t.desc.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All Categories' || t.category === category;
    const matchAcc = t.account.toLowerCase().includes(accountTab.toLowerCase());
    return matchSearch && matchCat && matchAcc;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="txn-page">
      {/* Page header */}
      <div className="txn-page-header">
        <h1 className="app-page-title">Transaction History</h1>
        <div className="txn-header-actions">
          <div className="txn-search-wrap">
            <Search size={15} className="txn-search-icon" />
            <input
              className="txn-search"
              placeholder="Search transactions..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <button className="btn btn-outline txn-filter-btn">
            <SlidersHorizontal size={14} /> Filters
          </button>
          <button className="btn btn-dark" onClick={() => setEditTxn(ALL_TRANSACTIONS[0])}>
            <Plus size={15} /> ADD TRANSACTION
          </button>
        </div>
      </div>

      {/* Filter row */}
      <div className="txn-filter-row">
        <div className="txn-filter-group">
          <span className="txn-filter-label">DATE RANGE:</span>
          <div className="txn-select-wrap">
            <select
              className="txn-select"
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
            >
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
            </select>
            <ChevronDown size={12} className="txn-select-chevron" />
          </div>
        </div>

        <div className="txn-filter-group">
          <span className="txn-filter-label">CATEGORY:</span>
          <div className="txn-select-wrap">
            <select
              className="txn-select"
              value={category}
              onChange={e => { setCategory(e.target.value); setPage(1); }}
            >
              <option>All Categories</option>
              {Object.keys(CATEGORY_COLORS).map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={12} className="txn-select-chevron" />
          </div>
        </div>

        <div className="txn-filter-group">
          <span className="txn-filter-label">ACCOUNT:</span>
          <div className="txn-account-tabs">
            {['Checking', 'Savings'].map(tab => (
              <button
                key={tab}
                className={`txn-account-tab ${accountTab === tab ? 'active' : ''}`}
                onClick={() => { setAccountTab(tab); setPage(1); }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="txn-table-wrap">
        <table className="txn-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>DESCRIPTION</th>
              <th>CATEGORY</th>
              <th>ACCOUNT</th>
              <th>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF', fontSize: 14 }}>
                  No transactions found.
                </td>
              </tr>
            ) : paginated.map(t => {
              const IconEl = t.icon;
              const isPos = t.amount > 0;
              const fmt = n => (n < 0 ? '-$' : '+$') + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              return (
                <tr key={t.id} className="txn-row-item" onClick={() => setEditTxn(t)}>
                  <td className="txn-date">{t.date}</td>
                  <td>
                    <div className="txn-desc-cell">
                      <div className="txn-desc-icon"><IconEl size={15} /></div>
                      <span className="txn-desc-text">{t.desc}</span>
                    </div>
                  </td>
                  <td><CategoryBadge cat={t.category} /></td>
                  <td className="txn-acc">{t.account}</td>
                  <td className={`txn-amt ${isPos ? 'positive' : 'negative'}`}>{fmt(t.amount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="txn-pagination">
          <span className="txn-showing">
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} transactions
          </span>
          <div className="txn-pages">
            <button
              className="txn-page-btn"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                className={`txn-page-btn ${page === n ? 'active' : ''}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              className="txn-page-btn"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="txn-fab" onClick={() => setEditTxn(ALL_TRANSACTIONS[0])}>
        <Plus size={22} />
      </button>

      {/* Edit Drawer */}
      {editTxn && <EditDrawer txn={editTxn} onClose={() => setEditTxn(null)} />}
    </div>
  );
}

/* ─── Dashboard App Shell ────────────────────────────────── */
/* ─── Budget Chart (SVG sparklines) ─────────────────────── */
function BudgetChart() {
  // week data: [allocated, spent]
  const data = [
    { week: 'WEEK 1', alloc: 1125, spent: 820 },
    { week: 'WEEK 2', alloc: 1125, spent: 1040 },
    { week: 'WEEK 3', alloc: 1125, spent: 960 },
    { week: 'WEEK 4', alloc: 1125, spent: 725 },
  ];
  const W = 620, H = 160, PAD = 20;
  const maxVal = 1400;
  const xStep = (W - PAD * 2) / (data.length - 1);
  const yScale = v => PAD + (H - PAD * 2) * (1 - v / maxVal);

  const pts = (key) => data.map((d, i) => `${PAD + i * xStep},${yScale(d[key])}`).join(' ');
  const areaPath = (key) => {
    const coords = data.map((d, i) => [PAD + i * xStep, yScale(d[key])]);
    const line = coords.map(([x, y]) => `${x},${y}`).join(' L ');
    return `M ${coords[0][0]},${coords[0][1]} L ${line} L ${coords[coords.length-1][0]},${H - PAD} L ${coords[0][0]},${H - PAD} Z`;
  };

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 10}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="gradAlloc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D1D5DB" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#D1D5DB" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="gradSpent" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A1D27" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#1A1D27" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <line key={f} x1={PAD} x2={W - PAD} y1={yScale(maxVal * (1 - f))} y2={yScale(maxVal * (1 - f))}
          stroke="#F3F4F6" strokeWidth="1" />
      ))}
      {/* Area fills */}
      <path d={areaPath('alloc')} fill="url(#gradAlloc)" />
      <path d={areaPath('spent')} fill="url(#gradSpent)" />
      {/* Lines */}
      <polyline points={pts('alloc')} fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinejoin="round" />
      <polyline points={pts('spent')} fill="none" stroke="#1A1D27" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Dots */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={PAD + i * xStep} cy={yScale(d.alloc)} r="4" fill="#fff" stroke="#9CA3AF" strokeWidth="2" />
          <circle cx={PAD + i * xStep} cy={yScale(d.spent)} r="4" fill="#fff" stroke="#1A1D27" strokeWidth="2" />
        </g>
      ))}
      {/* X labels */}
      {data.map((d, i) => (
        <text key={i} x={PAD + i * xStep} y={H + 8}
          textAnchor="middle" fontSize="10" fill="#9CA3AF" fontFamily="Inter, sans-serif">
          {d.week}
        </text>
      ))}
    </svg>
  );
}

/* ─── Budget Category Card ───────────────────────────────── */
const BUDGET_CATS = [
  { id: 1, name: 'Groceries',     icon: ShoppingCart, spent: 420,  limit: 800,  color: '#00B27A', iconBg: '#E8F5F0' },
  { id: 2, name: 'Dining Out',    icon: Utensils,     spent: 550,  limit: 500,  color: '#ef4444', iconBg: '#FEE2E2' },
  { id: 3, name: 'Transport',     icon: Car,          spent: 180,  limit: 350,  color: '#1A1D27', iconBg: '#F3F4F6' },
  { id: 4, name: 'Entertainment', icon: Tv,           spent: 210,  limit: 600,  color: '#1A1D27', iconBg: '#F3F4F6' },
  { id: 5, name: 'Health',        icon: Dumbbell,     spent: 85,   limit: 150,  color: '#1A1D27', iconBg: '#F3F4F6' },
];

function BudgetCategoryCard({ cat }) {
  const { name, icon: Icon, spent, limit, color, iconBg } = cat;
  const pct = Math.min((spent / limit) * 100, 100);
  const over = spent > limit;
  const left = limit - spent;
  const status = over ? 'OVER LIMIT' : 'ON TRACK';
  const statusColor = over ? '#ef4444' : '#00B27A';
  const fmt = v => '$' + Math.abs(v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return (
    <div className="budget-cat-card">
      <div className="bcc-header">
        <div className="bcc-icon" style={{ background: iconBg }}>
          <Icon size={18} color={over ? '#ef4444' : '#374151'} />
        </div>
        <div className="bcc-title-wrap">
          <span className="bcc-name">{name}</span>
          <span className="bcc-status" style={{ color: statusColor }}>{status}</span>
        </div>
        <button className="bcc-menu"><MoreVertical size={16} /></button>
      </div>
      <div className="bcc-amounts">
        <span>Spent: <strong>{fmt(spent)}</strong></span>
        <span>Limit: <strong>{fmt(limit)}</strong></span>
      </div>
      <div className="bcc-bar-bg">
        <div className="bcc-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="bcc-footer">
        <span style={{ color: over ? '#ef4444' : 'var(--color-text-muted)', fontWeight: over ? 700 : 500 }}>
          {over ? `-${fmt(Math.abs(left))} over` : `${fmt(left)} left`}
        </span>
        <span>{Math.round(pct)}% used</span>
      </div>
    </div>
  );
}

/* ─── Budgets Page ───────────────────────────────────────── */
function BudgetsPage() {
  const totalBudget = 4500;
  const totalSpent  = BUDGET_CATS.reduce((s, c) => s + c.spent, 0);
  const remaining   = totalBudget - totalSpent;
  const utilPct     = Math.round((totalSpent / totalBudget) * 100);

  return (
    <div className="budgets-page">
      {/* Page header */}
      <div className="budgets-header">
        <div className="budgets-header-left">
          <h1 className="app-page-title" style={{ marginBottom: 0 }}>Monthly Budget</h1>
          <span className="budget-month-badge">JUNE 2024</span>
        </div>
        <div className="budgets-header-right">
          <button className="bud-bell"><Bell size={18} /></button>
          <button className="btn btn-dark">
            <Plus size={15} /> Create Budget
          </button>
        </div>
      </div>

      {/* Top section: chart + side cards */}
      <div className="budgets-top">
        {/* Chart card */}
        <div className="budget-chart-card">
          <p className="budget-chart-eyebrow">CUMULATIVE PERFORMANCE</p>
          <h3 className="budget-chart-title">Budget vs Actual</h3>
          <div className="budget-chart-area">
            <BudgetChart />
          </div>
          <div className="budget-chart-legend">
            <span className="legend-item">
              <span className="legend-dot" style={{ background: '#9CA3AF' }} />
              Allocated
            </span>
            <span className="legend-item">
              <span className="legend-dot" style={{ background: '#1A1D27' }} />
              Spent
            </span>
          </div>
        </div>

        {/* Side cards */}
        <div className="budget-side-cards">
          <div className="budget-kpi-card">
            <p className="bki-label">REMAINING TO SPEND</p>
            <p className="bki-value">${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <p className="bki-delta">
              <TrendingUp size={13} style={{ color: '#00B27A' }} />
              12% better than May
            </p>
          </div>
          <div className="budget-kpi-card">
            <p className="bki-label">TOTAL BUDGET UTILIZATION</p>
            <p className="bki-big">
              <span className="bki-pct">{utilPct}%</span>
              <span className="bki-of"> of ${totalBudget.toLocaleString()} total</span>
            </p>
            <div className="bki-bar-bg">
              <div className="bki-bar-fill" style={{ width: `${utilPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="budgets-breakdown">
        <div className="breakdown-header">
          <h2 className="breakdown-title">Category Breakdown</h2>
          <div className="breakdown-actions">
            <button className="btn btn-outline bud-action-btn">
              <Filter size={13} /> Filters
            </button>
            <button className="btn btn-outline bud-action-btn">Sort by %</button>
          </div>
        </div>

        <div className="budget-cat-grid">
          {BUDGET_CATS.map(cat => <BudgetCategoryCard key={cat.id} cat={cat} />)}
          {/* Add Category tile */}
          <button className="budget-add-cat">
            <CirclePlus size={28} color="#9CA3AF" />
            <span className="bac-title">Add Category</span>
            <span className="bac-sub">Define a new spending limit</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="budgets-footer">
        Secure end-to-end encryption. WalletFlow Financial Services © 2024
      </div>
    </div>
  );
}

/* ─── Dashboard App ─────────────────────────────────────── */
/* ─── Settings Page ─────────────────────────────────────── */
function SettingsPage() {
  const [fullName, setFullName]     = useState('Alex Chen');
  const [email, setEmail]           = useState('alex.chen@professional.com');
  const [twoFA, setTwoFA]           = useState(true);
  const [txnEmail, setTxnEmail]     = useState(true);
  const [txnPush, setTxnPush]       = useState(true);
  const [budgetEmail, setBudgetEmail] = useState(true);
  const [budgetPush, setBudgetPush] = useState(false);
  const [saved, setSaved]           = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-page">
      {/* Top search bar */}
      <div className="settings-topbar">
        <div className="settings-search-wrap">
          <Search size={15} className="settings-search-icon" />
          <input className="settings-search" placeholder="Search settings..." />
        </div>
        <div className="settings-topbar-right">
          <button className="stb-icon-btn"><Bell size={18} /></button>
          <button className="stb-icon-btn" style={{ fontSize: 14, fontWeight: 700 }}>?</button>
          <div className="stb-user">
            <div className="stb-avatar">AC</div>
            <span>Alex Chen</span>
          </div>
        </div>
      </div>

      {/* Page heading */}
      <div className="settings-heading">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-sub">Manage your personal information, security preferences, and subscription details.</p>
      </div>

      {/* 2×2 grid */}
      <div className="settings-grid">

        {/* ── Profile ── */}
        <div className="scard">
          <div className="scard-header">
            <User size={18} />
            <span>Profile</span>
          </div>
          <div className="profile-avatar-row">
            <div className="profile-avatar">
              AC
              <span className="avatar-edit">✏</span>
            </div>
            <div>
              <p className="avatar-label">AVATAR</p>
              <p className="avatar-hint">Recommended size 400×400px. JPG or PNG.</p>
            </div>
          </div>
          <div className="sfield">
            <label>FULL NAME</label>
            <input className="sinput" value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          <div className="sfield">
            <label>EMAIL ADDRESS</label>
            <input className="sinput" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </div>

        {/* ── Security ── */}
        <div className="scard">
          <div className="scard-header">
            <ShieldCheck size={18} />
            <span>Security</span>
          </div>

          <div className="sec-row clickable">
            <div>
              <p className="sec-row-title">Password</p>
              <p className="sec-row-sub">Last updated 3 months ago</p>
            </div>
            <ChevronRight size={18} color="#9CA3AF" />
          </div>

          <div className="sec-row toggle-row">
            <div>
              <p className="sec-row-title">Two-Factor Authentication</p>
              <p className="sec-row-sub">Secure your account with 2FA</p>
            </div>
            <button
              className={`toggle-btn ${twoFA ? 'on' : ''}`}
              onClick={() => setTwoFA(v => !v)}
            >
              <span className="toggle-thumb" />
            </button>
          </div>

          <p className="sec-section-label">ACTIVE SESSIONS</p>
          <div className="session-row">
            <div className="session-icon"><Monitor size={15} /></div>
            <div className="session-info">
              <p className="session-name">MacBook Pro – London, UK</p>
              <p className="session-sub">Current Session</p>
            </div>
            <button className="revoke-btn">Revoke</button>
          </div>
        </div>

        {/* ── Notifications ── */}
        <div className="scard">
          <div className="scard-header">
            <Bell size={18} />
            <span>Notifications</span>
          </div>

          <div className="notif-row">
            <div className="notif-info">
              <p className="notif-title">Transaction Alerts</p>
              <p className="notif-sub">Get notified instantly for every spend or income.</p>
            </div>
            <div className="notif-checks">
              <label className="chk-label">
                <input type="checkbox" checked={txnEmail} onChange={e => setTxnEmail(e.target.checked)} />
                Email
              </label>
              <label className="chk-label">
                <input type="checkbox" checked={txnPush} onChange={e => setTxnPush(e.target.checked)} />
                Push
              </label>
            </div>
          </div>

          <div className="notif-divider" />

          <div className="notif-row">
            <div className="notif-info">
              <p className="notif-title">Budget Goals</p>
              <p className="notif-sub">Receive alerts when you reach 80% and 100% of limits.</p>
            </div>
            <div className="notif-checks">
              <label className="chk-label">
                <input type="checkbox" checked={budgetEmail} onChange={e => setBudgetEmail(e.target.checked)} />
                Email
              </label>
              <label className="chk-label">
                <input type="checkbox" checked={budgetPush} onChange={e => setBudgetPush(e.target.checked)} />
                Push
              </label>
            </div>
          </div>
        </div>

        {/* ── Subscription ── */}
        <div className="scard">
          <div className="scard-header">
            <Receipt size={18} />
            <span>Subscription</span>
          </div>

          <div className="sub-plan-banner">
            <div>
              <p className="sub-plan-label">CURRENT PLAN</p>
              <p className="sub-plan-name">Professional</p>
            </div>
            <div className="sub-billing">
              <p className="sub-billing-label">Next billing</p>
              <p className="sub-billing-date">Oct 12, 2024</p>
            </div>
          </div>

          <div className="sub-detail-row">
            <span>Monthly cost</span>
            <strong>$12.00</strong>
          </div>
          <div className="sub-detail-row">
            <span>Payment Method</span>
            <span className="sub-card">
              <CreditCard size={14} /> Visa ending in 4242
            </span>
          </div>

          <div className="sub-actions">
            <button className="btn btn-outline sub-btn">Manage Billing</button>
            <button className="btn btn-outline sub-btn">Change Plan</button>
          </div>
        </div>
      </div>

      {/* Bottom save bar */}
      <div className="settings-save-bar">
        <button className="btn btn-outline">Discard Changes</button>
        <button className="btn btn-dark" onClick={handleSave} style={{ minWidth: 140 }}>
          {saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

/* ─── Dashboard App ─────────────────────────────────────── */
function DashboardApp({ onLogout }) {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    if (activePage === 'transactions') return <TransactionsPage />;
    if (activePage === 'dashboard')    return <DashboardContent />;
    if (activePage === 'budgets')      return <BudgetsPage />;
    if (activePage === 'settings')     return <SettingsPage />;
    return (
      <div className="empty-state">
        <div>
          {React.createElement(NAV_ITEMS.find(n => n.id === activePage)?.icon || Settings, { size: 48, color: '#9CA3AF' })}
        </div>
        <h3>{NAV_ITEMS.find(n => n.id === activePage)?.label}</h3>
        <p>This section is coming soon. Stay tuned!</p>
      </div>
    );
  };

  return (
    <div className="app-shell">
      <Sidebar active={activePage} setActive={setActivePage} onLogout={onLogout} />
      <main className="app-main">{renderPage()}</main>
    </div>
  );
}

/* ─── Dashboard Content ──────────────────────────────────── */
function DashboardContent() {
  return (
    <div className="app-content" style={{ paddingTop: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="app-page-title">Dashboard</h1>
        <p className="app-page-sub">Welcome back! Here's your financial overview.</p>
      </div>
      <div className="dash-stats">
        {[
          { label: 'Total Balance',  value: '$24,560.00', delta: '+3.2% this month', color: '#00B27A' },
          { label: 'Monthly Spend',  value: '$3,120.40',  delta: '-8.1% vs last month', color: '#ef4444' },
          { label: 'Savings Goal',   value: '68%',        delta: '+5% progress',    color: '#3b82f6' },
          { label: 'Investments',    value: '$11,200.00', delta: '+1.4% today',     color: '#8b5cf6' },
        ].map(({ label, value, delta, color }) => (
          <div className="dash-stat-card" key={label}>
            <p className="dash-stat-label">{label}</p>
            <p className="dash-stat-value">{value}</p>
            <span className="dash-stat-delta" style={{ color }}>{delta}</span>
          </div>
        ))}
      </div>
      <div className="dash-grid">
        <div className="dash-card">
          <h3>Recent Transactions</h3>
          {ALL_TRANSACTIONS.slice(0, 5).map((t, i) => {
            const isPos = t.amount > 0;
            const fmt = n => (n < 0 ? '-$' : '+$') + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return (
              <div className="txn-row" key={i}>
                <div>
                  <p className="txn-name">{t.desc}</p>
                  <p className="txn-cat">{t.category} · {t.date}</p>
                </div>
                <span className={`txn-amount ${isPos ? 'positive' : 'negative'}`}>{fmt(t.amount)}</span>
              </div>
            );
          })}
        </div>
        <div className="dash-card">
          <h3>Budget Overview</h3>
          {[
            { name: 'Food & Dining', spent: 320, total: 500, color: '#00B27A' },
            { name: 'Entertainment', spent: 80,  total: 100, color: '#8b5cf6' },
            { name: 'Transport',     spent: 145, total: 200, color: '#3b82f6' },
            { name: 'Shopping',      spent: 430, total: 400, color: '#ef4444' },
          ].map(({ name, spent, total, color }) => (
            <div className="budget-row" key={name}>
              <div className="budget-row-top">
                <span>{name}</span><span>${spent} / ${total}</span>
              </div>
              <div className="budget-bar-bg">
                <div className="budget-bar-fill" style={{ width: `${Math.min((spent/total)*100,100)}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Login Page ─────────────────────────────────────────── */
function LoginPage({ onLogin, onBack }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1200);
  };

  return (
    <div className="login-page">
      <header className="login-topbar">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={onBack}>
          <div className="logo-icon"><Wallet size={16} color="#fff" /></div>
          WalletFlow
        </div>
        <button className="btn btn-outline" onClick={onBack}>Get Started</button>
      </header>

      <div className="login-body">
        <div className="login-card">
          {/* Left */}
          <div className="login-left">
            <img src="/login-bg.jpg" alt="" className="login-left-bg" />
            <div className="login-left-overlay" />
            <div className="login-left-content">
              <div className="login-eyebrow">Precision Liquidity</div>
              <h2>Master your capital flow with surgical precision.</h2>
              <p>Experience the tranquility of perfectly organized enterprise-grade finance management.</p>
            </div>
            <div className="login-security-badge">
              <ShieldCheck size={18} color="#00B27A" />
              <div>
                <strong>Bank-grade 256-bit encryption</strong>
                <span>Your data is secured by industry-leading protocols.</span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="login-right">
            <div className="login-form-wrap">
              <h1 className="login-title">Welcome Back</h1>
              <p className="login-sub">Log in to manage your financial portfolio.</p>

              {error && (
                <div className="login-error">
                  <AlertCircle size={15} />{error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrap">
                    <Mail size={16} className="input-icon" />
                    <input id="email" type="email" placeholder="name@company.com"
                      value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <div className="label-row">
                    <label htmlFor="password">Password</label>
                    <a href="#" className="forgot-link">Forgot Password?</a>
                  </div>
                  <div className="input-wrap">
                    <Lock size={16} className="input-icon" />
                    <input id="password" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                      value={password} onChange={e => setPassword(e.target.value)} />
                    <button type="button" className="eye-btn" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className={`btn btn-dark login-submit ${loading ? 'loading' : ''}`} disabled={loading}>
                  {loading ? <span className="spinner" /> : <>Log In <ArrowRight size={16} /></>}
                </button>
              </form>

              <div className="login-divider"><span>Or continue with</span></div>

              <button className="btn-google">
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.8 2.4 30.3 0 24 0 14.8 0 6.9 5.4 3 13.3l7.8 6c1.8-5.4 6.9-9.8 13.2-9.8z"/>
                  <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.9-2.2 5.4-4.7 7l7.3 5.7c4.3-4 6.8-9.9 6.8-16.7z"/>
                  <path fill="#FBBC05" d="M10.8 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7L2.5 13.3A24 24 0 0 0 0 24c0 3.8.9 7.4 2.5 10.7l8.3-6z"/>
                  <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2.2 1.5-5 2.4-8.6 2.4-6.3 0-11.4-4.3-13.2-9.8l-7.8 6C6.9 42.6 14.8 48 24 48z"/>
                </svg>
                Sign in with Google
              </button>

              <p className="login-signup">
                Don't have an account?{' '}
                <a href="#" onClick={e => { e.preventDefault(); onLogin(); }}>Sign Up</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="login-footer">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={onBack}>
          <div className="logo-icon" style={{ background: '#6b7280' }}><Wallet size={14} color="#fff" /></div>
          WalletFlow
        </div>
        <div className="login-footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Security</a>
        </div>
        <span>© 2024 WalletFlow Inc. All rights reserved.</span>
      </footer>
    </div>
  );
}

/* ─── ROOT ───────────────────────────────────────────────── */
export default function App() {
  const [screen, setScreen] = useState('landing');

  if (screen === 'login')     return <LoginPage onLogin={() => setScreen('dashboard')} onBack={() => setScreen('landing')} />;
  if (screen === 'dashboard') return <DashboardApp onLogout={() => setScreen('landing')} />;

  /* LANDING */
  return (
    <>
      <header className="header">
        <div className="container">
          <div className="logo">
            <div className="logo-icon"><Wallet size={16} color="#fff" /></div>
            WalletFlow
          </div>
          <nav className="nav">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#resources">Resources</a>
          </nav>
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
              <button className="btn btn-outline">Watch Demo</button>
            </div>
          </div>
          <div className="hero-visual">
            <img src="/hero.jpg" alt="WalletFlow dashboard" />
          </div>
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
            <div className="feature-card">
              <div className="feature-icon icon-blue"><Activity size={22} /></div>
              <h3>Real-time Tracking</h3>
              <p>Connect your accounts securely and see your net worth update in real-time across all your devices.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon icon-green"><Target size={22} /></div>
              <h3>Intelligent Budgets</h3>
              <p>Our AI learns your spending patterns to suggest realistic, flexible budgets that help you save faster.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon icon-purple"><BarChart3 size={22} /></div>
              <h3>Deep Analytics</h3>
              <p>Professional-grade reports and visualizations that turn raw numbers into actionable financial strategies.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cross-device">
        <div className="container">
          <div className="cd-top-grid">
            <div className="cd-main-card">
              <div className="cd-content">
                <h3>Cross-Device Mastery</h3>
                <p>Start an expense entry on your watch, verify it on your phone, and run a full tax report on your desktop.</p>
                <ul className="cd-checklist">
                  <li><CheckCircle2 size={16} /> Instant Cloud Sync</li>
                  <li><CheckCircle2 size={16} /> Multi-currency Support</li>
                </ul>
                <button className="btn btn-dark" style={{ width: 'fit-content' }}>Learn More <ArrowRight size={14} /></button>
              </div>
              <div className="cd-image"><img src="/cross-device.jpg" alt="Multi-device sync" /></div>
            </div>
            <div className="cd-security-card">
              <div className="security-badge"><ShieldCheck size={12} /> Bank-Grade Security</div>
              <h3>Your data stays yours — always.</h3>
              <p>AES-256 encryption, SOC 2 Type II certification, and zero-knowledge architecture.</p>
              <a href="#" className="cd-link">Learn about our security <ArrowRight size={14} /></a>
            </div>
          </div>
          <div className="cd-bottom-grid">
            <div className="mini-card">
              <div className="icon-wrap"><Receipt size={20} /></div>
              <h4>Smart Receipt Scan</h4>
              <p>Snap a photo and let our OCR do the manual entry.</p>
            </div>
            <div className="numbers-card">
              <div className="num-item"><h4>256-bit</h4><p>Encryption</p></div>
              <div className="num-divider" />
              <div className="num-item"><h4>9,000+</h4><p>Banks Connected</p></div>
              <div className="num-divider" />
              <div className="num-item"><h4>0</h4><p>Breaches Ever</p></div>
              <div className="num-divider" />
              <div className="num-item"><h4>24/7</h4><p>Expert Support</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="pricing">
        <div className="container">
          <p className="section-eyebrow">Pricing</p>
          <h2 className="section-title">Simple, Transparent Pricing</h2>
          <p className="section-sub">Choose the plan that fits your financial journey.</p>
          <div className="pricing-cards">
            <div className="pricing-card">
              <div className="plan-name">Personal</div>
              <div className="price-row"><span className="price-currency">$</span><span className="price-amount">0</span><span className="price-period">/month</span></div>
              <p className="plan-desc">Perfect for individuals starting their journey to financial clarity.</p>
              <ul className="feat-list">
                <li><Check size={15} className="check-icon" /> Unlimited Transactions</li>
                <li><Check size={15} className="check-icon" /> 3 Bank Accounts</li>
                <li><Check size={15} className="check-icon" /> Basic Reports</li>
                <li><X size={15} className="x-icon" /><span className="strikethrough">Pro Analytics</span></li>
              </ul>
              <button className="btn btn-outline" onClick={() => setScreen('login')}>Get Started</button>
            </div>
            <div className="pricing-card pro">
              <div className="popular-badge">Most Popular</div>
              <div className="plan-name">Professional</div>
              <div className="price-row"><span className="price-currency">$</span><span className="price-amount">12</span><span className="price-period">/month</span></div>
              <p className="plan-desc">Full precision for high net-worth individuals and business owners.</p>
              <ul className="feat-list">
                <li><Check size={15} className="check-icon" /> Unlimited Everything</li>
                <li><Check size={15} className="check-icon" /> Smart Receipt Scanning</li>
                <li><Check size={15} className="check-icon" /> Custom API Access</li>
                <li><Check size={15} className="check-icon" /> Priority Concierge Support</li>
              </ul>
              <button className="btn btn-primary" onClick={() => setScreen('login')}>Start 14-Day Free Trial</button>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Ready to master your money?</h2>
          <p>Join 500,000+ professionals who trust WalletFlow for their financial clarity.</p>
          <div className="cta-actions">
            <button className="btn btn-primary" onClick={() => setScreen('login')}>Create Your Free Account</button>
            <button className="btn btn-ghost">Contact Sales</button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">
                <div className="logo-icon" style={{ background: '#6b7280' }}><Wallet size={15} color="#fff" /></div>
                WalletFlow
              </div>
              <p>Precision financial tools for the modern professional.</p>
            </div>
            <div className="footer-col">
              <h5>Product</h5>
              <ul><li><a href="#">Features</a></li><li><a href="#">Security</a></li><li><a href="#">Integrations</a></li><li><a href="#">Enterprise</a></li></ul>
            </div>
            <div className="footer-col">
              <h5>Company</h5>
              <ul><li><a href="#">About</a></li><li><a href="#">Careers</a></li><li><a href="#">Privacy Policy</a></li><li><a href="#">Terms of Service</a></li></ul>
            </div>
            <div className="footer-col">
              <h5>Connect</h5>
              <div className="social-row">
                <a href="#"><Globe size={16} /></a>
                <a href="#"><MessageCircle size={16} /></a>
                <a href="#"><Link2 size={16} /></a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">© 2024 WalletFlow Inc. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}
