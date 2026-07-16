import React, { useState, useEffect } from 'react';
import {
  Receipt, Wallet, LayoutDashboard, PiggyBank, Settings,
  Search, Plus, ChevronLeft, ChevronRight, Monitor, Coffee, DollarSign,
  ChevronDown, LogOut, User, Bell, TrendingUp, ShoppingCart, Utensils,
  Car, Tv, Dumbbell, MoreVertical, CirclePlus, Filter, CreditCard, Loader2,
  Trash2, Users, UserPlus, Landmark, TrendingDown, Download, ArrowUp,
  ArrowUpRight, ArrowDownRight, RefreshCw, FileText, Calendar, X
} from 'lucide-react';
import {
  getTransactions, getBudgets, getAccounts
} from '../services/api.js';
import * as api from '../services/api';
import '../index.css';
import PageSpinner from '../components/PageSpinner.jsx';


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

export default function DashboardContent({ onInvite, activeWorkspace, userData, setActivePage, setGlobalEditingTxn }) {
  const [txns, setTxns]     = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTransactionIcon = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'dining':
      case 'dining out':
      case 'food':
      case 'groceries': return <Utensils size={16} />;
      case 'housing':
      case 'rent':
      case 'utilities': return <Landmark size={16} />;
      case 'tech':
      case 'electronics': return <Monitor size={16} />;
      case 'income':
      case 'salary': return <DollarSign size={16} />;
      case 'transport':
      case 'travel': return <Car size={16} />;
      case 'entertainment':
      case 'leisure': return <Tv size={16} />;
      default: return <CreditCard size={16} />;
    }
  };

  useEffect(() => {
    if (!activeWorkspace) return;
    Promise.all([
      getTransactions(activeWorkspace._id),
      getBudgets(activeWorkspace._id),
      api.getAccounts(activeWorkspace._id)
    ])
      .then(([t, b, acc]) => {
        setTxns(t.data);
        setBudgets(b.data);
        setAccounts(acc.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeWorkspace]);

  const [dateFilter, setDateFilter] = useState('30days');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Filter Transactions by Date
  const filteredTxns = React.useMemo(() => {
    const now = new Date();
    return txns.filter(t => {
      if (dateFilter === 'all') return true;
      const tDate = new Date(t.date || t.createdAt);
      const diffDays = (now - tDate) / (1000 * 60 * 60 * 24);
      if (dateFilter === '30days') return diffDays <= 30;
      if (dateFilter === '90days') return diffDays <= 90;
      return true;
    });
  }, [txns, dateFilter]);

  if (loading) return <PageSpinner />;

  // Calculate actual combined balance from accounts
  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  
  // Calculate Income / Expense
  const totalIncome = filteredTxns.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = Math.abs(filteredTxns.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  const netSavings = totalIncome - totalExpense;

  const expenses = filteredTxns.filter(t => t.amount < 0);
  const totalSpent = totalExpense;
  
  // Budget Progress
  const budgetLimit = budgets.reduce((sum, b) => sum + (b.limit || 0), 0);
  const budgetPct = budgetLimit > 0 ? Math.min(100, Math.round((totalSpent / budgetLimit) * 100)) : 0;
  
  // Highest Spike Category
  const categoryTotals = {};
  expenses.forEach(t => {
    const cat = t.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(t.amount);
  });
  let highestSpike = 'None';
  let maxSpent = 0;
  Object.keys(categoryTotals).forEach(cat => {
    if (categoryTotals[cat] > maxSpent) {
      maxSpent = categoryTotals[cat];
      highestSpike = cat;
    }
  });

  const remaining = Math.max(0, budgetLimit - totalSpent);
  
  // Essentials vs Lifestyle
  const essentialsSpent = Math.abs(expenses.filter(t => ['utilities', 'rent', 'housing', 'bills', 'groceries'].includes(t.category?.toLowerCase())).reduce((sum, t) => sum + t.amount, 0));
  const lifestyleSpent = Math.abs(expenses.filter(t => ['dining', 'entertainment', 'leisure', 'shopping'].includes(t.category?.toLowerCase())).reduce((sum, t) => sum + t.amount, 0));
  const totalCategorySpent = essentialsSpent + lifestyleSpent;
  const essentialsPct = totalCategorySpent > 0 ? Math.round((essentialsSpent / totalCategorySpent) * 100) : 0;
  const lifestylePct = totalCategorySpent > 0 ? Math.round((lifestyleSpent / totalCategorySpent) * 100) : 0;

  // Top Spending
  const housingSpent = Math.abs(expenses.filter(t => ['utilities', 'rent', 'housing', 'bills'].includes(t.category?.toLowerCase())).reduce((sum, t) => sum + t.amount, 0));
  const foodSpent = Math.abs(expenses.filter(t => ['dining', 'groceries', 'food'].includes(t.category?.toLowerCase())).reduce((sum, t) => sum + t.amount, 0));
  const transportSpent = Math.abs(expenses.filter(t => ['transport', 'travel', 'fuel'].includes(t.category?.toLowerCase())).reduce((sum, t) => sum + t.amount, 0));

  return (
    <div className="dash-layout">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Financial Overview</h1>
          <p className="dash-subtitle">Real-time insights across your household liquidity.</p>
        </div>
        <div style={{ position: 'relative' }}>
          <button className="dash-date-btn" onClick={() => setShowFilterDropdown(!showFilterDropdown)}>
            <Calendar size={14} color="#6B7280" />
            {dateFilter === '30days' ? 'Last 30 Days' : dateFilter === '90days' ? 'Last 90 Days' : 'All Time'}
          </button>
          {showFilterDropdown && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, minWidth: '150px' }}>
              <div 
                style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '13px', background: dateFilter === '30days' ? '#F3F4F6' : 'transparent' }}
                onClick={() => { setDateFilter('30days'); setShowFilterDropdown(false); }}
              >
                Last 30 Days
              </div>
              <div 
                style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '13px', background: dateFilter === '90days' ? '#F3F4F6' : 'transparent' }}
                onClick={() => { setDateFilter('90days'); setShowFilterDropdown(false); }}
              >
                Last 90 Days
              </div>
              <div 
                style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '13px', background: dateFilter === 'all' ? '#F3F4F6' : 'transparent' }}
                onClick={() => { setDateFilter('all'); setShowFilterDropdown(false); }}
              >
                All Time
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hero Card */}
      <div className="dash-card-new" style={{ marginBottom: 24 }}>
        <div className="dash-balance-label">TOTAL COMBINED BALANCE</div>
        <div className="dash-balance-value">${totalBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        <div className="dash-trend-up">
          <TrendingUp size={14} />
          +2.4% vs last month
        </div>
      </div>

      {/* 3 KPI Cards */}
      <div className="dash-kpi-grid">
        <div className="dash-kpi-card">
          <div className="dash-kpi-top">
            <div className="dash-kpi-icon income"><DollarSign size={20} /></div>
            <div className="dash-kpi-trend">
              <span className="dash-kpi-trend-val up"><ArrowUp size={12} />12%</span>
              <div className="dash-kpi-bars">
                <div className="dash-kpi-bar neutral" style={{ height: '40%' }}></div>
                <div className="dash-kpi-bar neutral" style={{ height: '60%' }}></div>
                <div className="dash-kpi-bar up" style={{ height: '100%' }}></div>
              </div>
            </div>
          </div>
          <div className="dash-kpi-label">MONTHLY INCOME</div>
          <div className="dash-kpi-value">${totalIncome.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </div>

        <div className="dash-kpi-card">
          <div className="dash-kpi-top">
            <div className="dash-kpi-icon expense"><ShoppingCart size={20} /></div>
            <div className="dash-kpi-trend">
              <span className="dash-kpi-trend-val down"><ArrowUp size={12} />5%</span>
              <div className="dash-kpi-bars">
                <div className="dash-kpi-bar neutral" style={{ height: '50%' }}></div>
                <div className="dash-kpi-bar neutral" style={{ height: '80%' }}></div>
                <div className="dash-kpi-bar down" style={{ height: '100%' }}></div>
              </div>
            </div>
          </div>
          <div className="dash-kpi-label">MONTHLY EXPENSES</div>
          <div className="dash-kpi-value">${totalExpense.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </div>

        <div className="dash-kpi-card">
          <div className="dash-kpi-top">
            <div className="dash-kpi-icon savings"><Wallet size={20} /></div>
            <div className="dash-kpi-trend">
              <span className="dash-kpi-trend-val up"><ArrowUp size={12} />8%</span>
              <div className="dash-kpi-bars">
                <div className="dash-kpi-bar neutral" style={{ height: '30%' }}></div>
                <div className="dash-kpi-bar neutral" style={{ height: '60%' }}></div>
                <div className="dash-kpi-bar up" style={{ height: '100%' }}></div>
              </div>
            </div>
          </div>
          <div className="dash-kpi-label">NET SAVINGS</div>
          <div className="dash-kpi-value">${netSavings.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </div>
      </div>

      {/* Budget Progress & Top Spending */}
      <div className="dash-mid-grid">
        {/* Budget Progress */}
        <div className="dash-card-new">
          <div className="dash-section-header">
            <h2 className="dash-section-title">Budget Progress</h2>
            <span className="dash-section-link" onClick={() => setActivePage('budgets')}>VIEW LIMITS</span>
          </div>

          <div className="dash-budget-progress-wrap">
            <div className="dash-cat-label" style={{ marginBottom: 4 }}>MONTHLY USAGE</div>
            <div className="dash-budget-header">
              <div>
                <span className="dash-budget-usage">{budgetPct}%</span>
                <span className="dash-budget-usage-sub">(${totalSpent.toLocaleString()} of ${budgetLimit.toLocaleString()})</span>
              </div>
              <span className="dash-budget-status">ON TRACK</span>
            </div>
            <div className="dash-budget-bar-bg">
              <div className="dash-budget-bar-fill" style={{ width: `${budgetPct}%` }}></div>
            </div>
          </div>

          <div className="dash-budget-stats-grid">
            <div className="dash-budget-stat-box">
              <div className="dash-budget-stat-label">HIGHEST SPIKE</div>
              <div className="dash-budget-stat-val">{highestSpike}</div>
            </div>
            <div className="dash-budget-stat-box">
              <div className="dash-budget-stat-label">REMAINING</div>
              <div className="dash-budget-stat-val green">${remaining.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
          </div>

          <div className="dash-cat-breakdown">
            <div className="dash-cat-label">CATEGORY BREAKDOWN</div>
            <div className="dash-cat-row">
              <span className="dash-cat-name">Essentials</span>
              <div className="dash-cat-bar-bg"><div className="dash-cat-bar-fill" style={{ width: `${essentialsPct}%` }}></div></div>
              <span className="dash-cat-pct">{essentialsPct}%</span>
            </div>
            <div className="dash-cat-row">
              <span className="dash-cat-name">Lifestyle</span>
              <div className="dash-cat-bar-bg"><div className="dash-cat-bar-fill" style={{ width: `${lifestylePct}%` }}></div></div>
              <span className="dash-cat-pct">{lifestylePct}%</span>
            </div>
          </div>
        </div>

        {/* Top Spending */}
        <div className="dash-card-new">
          <h2 className="dash-section-title" style={{ marginBottom: 20 }}>Top Spending</h2>
          <div className="dash-top-spending-chart">
            <div className="dash-ts-bar" style={{ height: '20%' }}></div>
            <div className="dash-ts-bar" style={{ height: '30%' }}></div>
            <div className="dash-ts-bar" style={{ height: '25%' }}></div>
            <div className="dash-ts-bar" style={{ height: '50%' }}></div>
            <div className="dash-ts-bar" style={{ height: '40%' }}></div>
            <div className="dash-ts-bar active" style={{ height: '90%' }}></div>
            <div className="dash-ts-bar" style={{ height: '40%' }}></div>
          </div>
          
          <div className="dash-ts-list">
            <div className="dash-ts-item">
              <div className="dash-ts-icon"><Landmark size={18} /></div>
              <div className="dash-ts-info">
                <div className="dash-ts-name-row">
                  <span className="dash-ts-name">Housing</span>
                  <span className="dash-ts-amt">${housingSpent.toLocaleString()}</span>
                </div>
                <div className="dash-ts-bar-bg"><div className="dash-ts-bar-fill" style={{ width: '80%' }}></div></div>
              </div>
            </div>
            <div className="dash-ts-item">
              <div className="dash-ts-icon"><Utensils size={18} /></div>
              <div className="dash-ts-info">
                <div className="dash-ts-name-row">
                  <span className="dash-ts-name">Food</span>
                  <span className="dash-ts-amt">${foodSpent.toLocaleString()}</span>
                </div>
                <div className="dash-ts-bar-bg"><div className="dash-ts-bar-fill" style={{ width: '40%' }}></div></div>
              </div>
            </div>
            <div className="dash-ts-item">
              <div className="dash-ts-icon"><Car size={18} /></div>
              <div className="dash-ts-info">
                <div className="dash-ts-name-row">
                  <span className="dash-ts-name">Transport</span>
                  <span className="dash-ts-amt">${transportSpent.toLocaleString()}</span>
                </div>
                <div className="dash-ts-bar-bg"><div className="dash-ts-bar-fill" style={{ width: '20%' }}></div></div>
              </div>
            </div>
          </div>

          <button className="dash-ts-btn" onClick={() => setActivePage('budgets')}>VIEW ALL CATEGORIES</button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="dash-table-card">
        <div className="dash-table-header">
          <h2 className="dash-section-title">Recent Transactions</h2>
          <div className="dash-table-filter">
            FILTER <Filter size={14} style={{ marginLeft: 4 }} />
          </div>
        </div>
        <table className="dash-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>MERCHANT</th>
              <th>CATEGORY</th>
              <th style={{ textAlign: 'right' }}>AMOUNT</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {txns.slice(0, 5).length > 0 ? txns.slice(0, 5).map(t => (
              <tr key={t._id}>
                <td style={{ color: '#4B5563' }}>{t.date}</td>
                <td>
                  <div className="dash-td-merchant">
                    <div className="dash-td-icon">
                      {t.description.substring(0, 2).toUpperCase()}
                    </div>
                    {t.description}
                  </div>
                </td>
                <td><span className={`dash-td-badge ${t.category === 'Investment' ? 'dark' : ''}`}>{t.category}</span></td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#111827' }}>${Math.abs(t.amount).toFixed(2)}</td>
                <td>
                  <div className="dash-td-status">
                    <div className="dash-td-status-dot"></div>
                    PAID
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#6B7280' }}>No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
        {txns.length > 5 && (
          <div className="dash-table-footer">
            <button className="dash-table-footer-btn" onClick={() => setActivePage('transactions')}>VIEW FULL TRANSACTION HISTORY</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────── */
