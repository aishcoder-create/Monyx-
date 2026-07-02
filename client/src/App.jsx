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
} from './api.js';
import * as api from './api';
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
const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',        icon: LayoutDashboard },
  { id: 'accounts',     label: 'Accounts',         icon: Landmark },
  { id: 'transactions', label: 'Transactions',     icon: Receipt },
  { id: 'budgets',      label: 'Budgets',          icon: PiggyBank },
  { id: 'settings',     label: 'Settings',         icon: Settings },
];

const CATEGORY_COLORS = {
  Tech:          { bg: '#EFF6FF', text: '#3B82F6' },
  Dining:        { bg: '#ECFDF5', text: '#10B981' },
  Income:        { bg: '#ECFDF5', text: '#059669' },
  Transport:     { bg: '#F5F3FF', text: '#8B5CF6' },
  Entertainment: { bg: '#FFF7ED', text: '#F97316' },
};

const ICON_MAP = { Monitor, Coffee, DollarSign, Fuel, ShoppingCart, Utensils, Car, Tv, Dumbbell };
const catIcon = (cat) => {
  const m = { Tech: Monitor, Dining: Coffee, Income: DollarSign, Transport: Fuel, Entertainment: Tv };
  return m[cat] || DollarSign;
};

/* ─── Spinner ────────────────────────────────── */
function PageSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
      <Loader2 size={28} style={{ animation: 'spin 0.8s linear infinite', color: '#9CA3AF' }} />
    </div>
  );
}

/* ─── Sidebar ────────────────────────────────── */
function Sidebar({ active, setActive, onLogout, userName, workspaces, activeWorkspace, onSwitchWorkspace, onAddTransaction }) {
  const initials = (userName || 'AC').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await getTransactions();
      const headers = ['Date', 'Description', 'Category', 'Account', 'Amount', 'Notes'];
      const rows = data.map(t => [
        t.date,
        t.description,
        t.category,
        t.account,
        t.amount,
        t.notes || ''
      ]);
      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `walletflow_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
    } catch (err) {
      alert('Could not export data. Is the backend server running?');
    } finally {
      setExporting(false);
    }
  };

  return (
    <aside className="sidebar" style={{ borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'space-between' }}>
      <div>
        <div className="sidebar-brand" style={{ borderBottom: 'none', padding: '24px', gap: '16px' }}>
          <div className="sidebar-logo-icon" style={{ borderRadius: '8px', background: '#111827' }}><Wallet size={20} color="#fff" /></div>
          <div>
            <span className="sidebar-brand-name" style={{ fontSize: '18px', fontWeight: 800 }}>Monyx</span>
            <span className="sidebar-brand-sub" style={{ color: '#4B5563', fontSize: '12px', fontWeight: '500' }}>Financial Management</span>
          </div>
        </div>

        <nav className="sidebar-nav" style={{ padding: '0 16px', gap: '8px' }}>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`sidebar-nav-item ${active === id ? 'active' : ''}`} onClick={() => setActive(id)}>
              <Icon size={18} /><span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div style={{ padding: '24px' }}>
        <button 
          className="btn btn-dark" 
          style={{ width: '100%', marginBottom: '24px', padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}
          onClick={onAddTransaction}
        >
          <Plus size={18} /> Add Transaction
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button className="sidebar-nav-item" onClick={() => alert('Help Center')}>
            <AlertCircle size={18} /><span>Help Center</span>
          </button>
          <button className="sidebar-nav-item" onClick={onLogout}>
            <LogOut size={18} /><span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ─── Edit Transaction Drawer ────────────────── */
function EditDrawer({ txn, activeWorkspace, onClose, onSave }) {
  const [desc, setDesc]     = useState(txn.description || txn.desc || '');
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const [date, setDate]     = useState(txn.date || today);
  const [cat, setCat]       = useState(txn.category || 'Tech');
  const [account, setAccount] = useState(txn.account || '');
  const [notes, setNotes]   = useState(txn.notes || '');
  const [saving, setSaving] = useState(false);
  const [amtType, setAmtType] = useState(txn.amount < 0 ? 'expense' : (txn._id ? 'income' : 'expense'));
  const [amtValue, setAmtValue] = useState(Math.abs(txn.amount) || '');
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (activeWorkspace) {
      api.getAccounts(activeWorkspace._id).then(res => {
        setAccounts(res.data);
        if (res.data.length > 0 && !txn.account) {
          setAccount(res.data[0].name);
        }
      }).catch(console.error);
    }
  }, [activeWorkspace, txn]);

  const isNeg = txn.amount < 0;
  const fmt = (n) => (n < 0 ? '-$' : '+$') + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const handleSave = async () => {
    const finalAmount = amtType === 'expense' ? -(Math.abs(Number(amtValue) || 0)) : Math.abs(Number(amtValue) || 0);
    if (!desc) { alert('Description is required.'); return; }
    if (!finalAmount) { alert('Amount is required.'); return; }
    if (!account) { alert('Account is required. Please link an account first.'); return; }
    setSaving(true);
    try {
      if (txn._id) {
        // Edit existing transaction:
        await updateTransaction(txn._id, { description: desc, date, category: cat, account, notes, amount: finalAmount });
        const targetAcc = accounts.find(a => a.name === account);
        if (targetAcc) {
          const diff = finalAmount - txn.amount;
          await api.updateAccount(targetAcc._id, { balance: (targetAcc.balance || 0) + diff }, activeWorkspace._id);
        }
      } else {
        // Add new transaction:
        await addTransaction({ description: desc, amount: finalAmount, date, category: cat, account, notes });
        const targetAcc = accounts.find(a => a.name === account);
        if (targetAcc) {
          await api.updateAccount(targetAcc._id, { balance: (targetAcc.balance || 0) + finalAmount }, activeWorkspace._id);
        }
      }
      onSave?.();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save transaction.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    setSaving(true);
    try {
      await deleteTransaction(txn._id);
      const targetAcc = accounts.find(a => a.name === txn.account);
      if (targetAcc) {
        await api.updateAccount(targetAcc._id, { balance: (targetAcc.balance || 0) - txn.amount }, activeWorkspace._id);
      }
      onSave?.();
      onClose();
    } catch (err) {
      alert('Could not delete transaction.');
    } finally { setSaving(false); }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <span className="drawer-title">{txn._id ? 'Edit Transaction' : 'Add Transaction'}</span>
          <button className="drawer-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="drawer-amount-block">
          <p className="drawer-amount-label">TRANSACTION AMOUNT</p>
          {txn._id ? (
            <p className="drawer-amount" style={{ color: isNeg ? '#ef4444' : '#00B27A' }}>{fmt(txn.amount)}</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <select 
                value={amtType}
                style={{ background: '#f3f4f6', border: 'none', padding: '8px 12px', borderRadius: 6, fontSize: 18, fontWeight: 700, color: 'var(--color-dark)' }}
                onChange={e => setAmtType(e.target.value)}
              >
                <option value="expense">Expense (-)</option>
                <option value="income">Income (+)</option>
              </select>
              <input 
                type="number" 
                placeholder="0.00"
                value={amtValue}
                style={{ fontSize: 24, fontWeight: 700, border: 'none', borderBottom: '2px solid #dadce0', width: 140, outline: 'none', background: 'transparent', color: 'var(--color-dark)' }}
                onChange={e => setAmtValue(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="drawer-body">
          <div className="drawer-field"><label>Description</label><input className="drawer-input" value={desc} onChange={e => setDesc(e.target.value)} /></div>
          <div className="drawer-row">
            <div className="drawer-field">
              <label>Date</label>
              <div className="drawer-input drawer-date-input">
                <Calendar size={14} style={{ color: '#6B7280', flexShrink: 0 }} />
                <input type="text" value={date} onChange={e => setDate(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: 'var(--color-dark)', width: '100%' }} />
              </div>
            </div>
            <div className="drawer-field">
              <label>Category</label>
              <div className="drawer-select-wrap">
                <select className="drawer-input drawer-select" value={cat} onChange={e => setCat(e.target.value)}>
                  {['Tech','Dining','Income','Transport','Entertainment','Groceries','Utilities','Leisure','Healthcare'].map(c => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="drawer-select-icon" />
              </div>
            </div>
          </div>
          <div className="drawer-field">
            <label>Account</label>
            <div className="drawer-select-wrap">
              <select className="drawer-input drawer-select" value={account} onChange={e => setAccount(e.target.value)}>
                {accounts.length === 0 ? (
                  <option value="">No accounts linked</option>
                ) : (
                  accounts.map(acc => (
                    <option key={acc._id} value={acc.name}>
                      {acc.name} {acc.mask ? `(****${acc.mask})` : ''}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown size={14} className="drawer-select-icon" />
            </div>
          </div>
          <div className="drawer-field"><label>Notes</label><textarea className="drawer-input drawer-textarea" value={notes} onChange={e => setNotes(e.target.value)} rows={3} /></div>
          <div className="drawer-upload"><Receipt size={22} style={{ color: '#9CA3AF' }} /><span>Click to upload receipt</span></div>
        </div>
        <div className="drawer-footer" style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          {txn._id && (
            <button 
              className="btn btn-outline" 
              onClick={handleDelete} 
              style={{ color: '#ef4444', borderColor: '#ef4444', marginRight: 'auto' }}
              disabled={saving}
            >
              <Trash2 size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Delete
            </button>
          )}
          <button className="btn btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-dark" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TransactionsPage({ activeWorkspace }) {
  const [accounts, setAccounts] = useState([]);
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('2500.00');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [frequency, setFrequency] = useState('one-time');
  const [note, setNote] = useState('');
  const [transfers, setTransfers] = useState([
    { id: 1, date: 'Nov 22, 2023', route: 'Checking → Savings', status: 'COMPLETED', amount: 1200 },
    { id: 2, date: 'Nov 18, 2023', route: 'Business → Checking', status: 'COMPLETED', amount: 5500 },
  ]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!activeWorkspace) return;
    try {
      setLoading(true);
      const accRes = await api.getAccounts(activeWorkspace._id);
      setAccounts(accRes.data);
      if (accRes.data.length >= 2) {
        setFromAccount(accRes.data[0]._id);
        setToAccount(accRes.data[1]._id);
      } else if (accRes.data.length === 1) {
        setFromAccount(accRes.data[0]._id);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [activeWorkspace]);

  useEffect(() => { load(); }, [load]);

  const getAccById = (id) => accounts.find(a => a._id === id);
  const fromAcc = getAccById(fromAccount);
  const toAcc = getAccById(toAccount);
  const numAmount = parseFloat(amount) || 0;

  const handleTransfer = async () => {
    if (!fromAccount || !toAccount || numAmount <= 0) return alert('Fill all fields');
    if (fromAccount === toAccount) return alert('Cannot transfer to same account');
    try {
      await api.createTransaction({
        description: 'Internal Transfer to ' + (toAcc?.name || 'account'),
        amount: -numAmount,
        category: 'Transfer',
        account: fromAcc?.name || 'Unknown',
        date: transferDate,
        notes: note
      }, activeWorkspace._id);
      await api.createTransaction({
        description: 'Internal Transfer from ' + (fromAcc?.name || 'account'),
        amount: numAmount,
        category: 'Transfer',
        account: toAcc?.name || 'Unknown',
        date: transferDate,
        notes: note
      }, activeWorkspace._id);
      await api.updateAccount(fromAccount, { balance: (fromAcc.balance || 0) - numAmount }, activeWorkspace._id);
      await api.updateAccount(toAccount, { balance: (toAcc.balance || 0) + numAmount }, activeWorkspace._id);
      setTransfers(prev => [{
        id: Date.now(),
        date: new Date(transferDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        route: (fromAcc?.name || 'Account') + ' → ' + (toAcc?.name || 'Account'),
        status: 'COMPLETED',
        amount: numAmount
      }, ...prev]);
      setAmount('0.00');
      setNote('');
      load();
    } catch (e) { alert(e.response?.data?.message || e.message); }
  };

  const handleDownloadCSV = async () => {
    try {
      const res = await api.getTransactions(activeWorkspace._id);
      const txns = res.data;
      const headers = ['Date', 'Description', 'Category', 'Account', 'Amount', 'Notes'];
      const rows = txns.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.description,
        t.category,
        t.account,
        t.amount,
        t.notes || ''
      ]);
      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `transaction_history_${activeWorkspace.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
    } catch (err) {
      alert('Could not download transaction history.');
    }
  };

  const fmtBal = (v) => '$' + (v || 0).toLocaleString('en-US', {minimumFractionDigits: 2});

  return (
    <div className="tf-page">
      <div className="tf-breadcrumb">ACCOUNTS {'>'} INTERNAL TRANSFER</div>

      <div className="tf-main-grid">
        <div className="tf-left">
          <div className="tf-card">
            <div className="tf-accounts-row">
              <div className="tf-acc-col">
                <label className="tf-field-label">FROM ACCOUNT</label>
                <select className="tf-acc-select" value={fromAccount} onChange={e => setFromAccount(e.target.value)}>
                  <option value="">Select account</option>
                  {accounts.map(a => <option key={a._id} value={a._id}>{a.name} (*{a.mask || '0000'})</option>)}
                </select>
                {fromAcc && <span className="tf-avail">Available: {fmtBal(fromAcc.balance)}</span>}
              </div>
              <div className="tf-arrow-sep"><ArrowRight size={20} /></div>
              <div className="tf-acc-col">
                <label className="tf-field-label">TO ACCOUNT</label>
                <select className="tf-acc-select" value={toAccount} onChange={e => setToAccount(e.target.value)}>
                  <option value="">Select account</option>
                  {accounts.map(a => <option key={a._id} value={a._id}>{a.name} (*{a.mask || '0000'})</option>)}
                </select>
                {toAcc && <span className="tf-avail">Available: {fmtBal(toAcc.balance)}</span>}
              </div>
            </div>

            <div className="tf-divider"></div>

            <div className="tf-amount-section">
              <label className="tf-field-label" style={{textAlign:'center'}}>TRANSFER AMOUNT</label>
              <div className="tf-amount-display">
                <span className="tf-dollar">$</span>
                <input className="tf-amount-input" type="text" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div className="tf-quick-chips">
                <button className="tf-chip" onClick={() => setAmount(String((parseFloat(amount)||0) + 100))}>+$100</button>
                <button className="tf-chip" onClick={() => setAmount(String((parseFloat(amount)||0) + 500))}>+$500</button>
                <button className="tf-chip" onClick={() => setAmount(String((parseFloat(amount)||0) + 1000))}>+$1000</button>
              </div>
            </div>

            <div className="tf-fields-row">
              <div className="tf-field-col">
                <label className="tf-field-label">TRANSFER DATE</label>
                <input className="tf-date-input" type="date" value={transferDate} onChange={e => setTransferDate(e.target.value)} />
              </div>
              <div className="tf-field-col">
                <label className="tf-field-label">FREQUENCY</label>
                <select className="tf-freq-select" value={frequency} onChange={e => setFrequency(e.target.value)}>
                  <option value="one-time">One-time transfer</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="tf-note-section">
              <label className="tf-field-label">OPTIONAL NOTE</label>
              <textarea className="tf-note-input" placeholder="Add a description for your records..." value={note} onChange={e => setNote(e.target.value)} />
            </div>

            <button className="tf-execute-btn" onClick={handleTransfer}>
              <Zap size={16} /> Execute Transfer
            </button>
            <p className="tf-disclaimer">Funds will be available immediately within internal accounts.</p>
          </div>
        </div>

        <div className="tf-right">
          <div className="tf-impact-card">
            <h3 className="tf-impact-title">TRANSFER IMPACT</h3>
            {fromAcc && (
              <div className="tf-impact-acc">
                <div className="tf-impact-acc-header">
                  <span className="tf-impact-acc-name">{fromAcc.name}</span>
                  <TrendingDown size={16} color="#DC2626" />
                </div>
                <div className="tf-impact-row"><span>Current</span><strong>{fmtBal(fromAcc.balance)}</strong></div>
                <div className="tf-impact-row"><span>After Transfer</span><strong>{fmtBal((fromAcc.balance || 0) - numAmount)}</strong></div>
                <div className="tf-impact-bar"><div className="tf-impact-bar-fill from" style={{width: Math.max(10, Math.min(100, ((fromAcc.balance - numAmount) / (fromAcc.balance || 1)) * 100)) + '%'}}></div></div>
              </div>
            )}
            {toAcc && (
              <div className="tf-impact-acc">
                <div className="tf-impact-acc-header">
                  <span className="tf-impact-acc-name">{toAcc.name}</span>
                  <TrendingUp size={16} color="#059669" />
                </div>
                <div className="tf-impact-row"><span>Current</span><strong>{fmtBal(toAcc.balance)}</strong></div>
                <div className="tf-impact-row"><span>After Transfer</span><strong>{fmtBal((toAcc.balance || 0) + numAmount)}</strong></div>
                <div className="tf-impact-bar"><div className="tf-impact-bar-fill to" style={{width: '100%'}}></div></div>
              </div>
            )}
          </div>

          <div className="tf-bonus-card">
            <div className="tf-bonus-icon"><AlertCircle size={16} color="#059669" /></div>
            <div>
              <strong className="tf-bonus-title">Transfer Bonus Eligibility</strong>
              <p className="tf-bonus-text">This transfer qualifies your savings account for the Tier 2 interest rate boost (4.25% APY).</p>
            </div>
          </div>

          <div className="tf-encrypt-card">
            <ShieldCheck size={28} color="#6B7280" />
            <strong className="tf-encrypt-title">BANK-GRADE ENCRYPTION</strong>
            <p className="tf-encrypt-text">All transfers are protected by 256-bit SSL encryption and multi-factor authentication protocols.</p>
          </div>
        </div>
      </div>

      <div className="tf-recent-section">
        <div className="tf-recent-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Recent Internal Transfers</h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button 
              onClick={handleDownloadCSV}
              style={{
                background: '#111827',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Download size={14} /> Download History
            </button>
            <a href="#" className="tf-view-all">View All History</a>
          </div>
        </div>
        <table className="tf-table">
          <thead>
            <tr><th>DATE</th><th>ROUTE</th><th>STATUS</th><th>AMOUNT</th></tr>
          </thead>
          <tbody>
            {transfers.map(t => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td><strong>{t.route}</strong></td>
                <td><span className="tf-status-badge">{t.status}</span></td>
                <td className="tf-amt">{'$'}{t.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
              </tr>
            ))}
            {transfers.length === 0 && <tr><td colSpan="4" style={{textAlign:'center',padding:24}}>No transfers yet</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="tf-secure-badge">
        <ShieldCheck size={14} /> SECURE SESSION
        <span className="tf-secure-sub">Expires in 14:59</span>
      </div>
    </div>
  );
}

/* ─── Accounts Page ──────────────────────────── */
function AccountsPage({ activeWorkspace }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [fromTransfer, setFromTransfer] = useState('');
  const [toTransfer, setToTransfer] = useState('');
  const [transferAmt, setTransferAmt] = useState('0.00');

  const load = useCallback(async () => {
    if (!activeWorkspace) return;
    try {
      setLoading(true);
      const res = await api.getAccounts(activeWorkspace._id);
      setAccounts(res.data);
      if (res.data.length > 0) {
        setFromTransfer(prev => prev || res.data[0]._id);
        setToTransfer(prev => prev || (res.data[1]?._id || res.data[0]._id));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [activeWorkspace]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm('Remove this account?')) return;
    try { await api.deleteAccount(id, activeWorkspace._id); load(); }
    catch (e) { console.error(e); }
  };

  const totalLiquid = accounts.filter(a => a.category !== 'credit').reduce((s, a) => s + (a.balance || 0), 0);
  const creditUsed = accounts.filter(a => a.category === 'credit').reduce((s, a) => s + Math.abs(a.balance || 0), 0);
  const creditLimit = 10000;
  const fmtBal = (v) => '$' + Math.abs(v || 0).toLocaleString('en-US', {minimumFractionDigits: 2});

  const getIcon = (cat) => {
    switch (cat) {
      case 'credit': return <CreditCard size={22} />;
      case 'savings': return <PiggyBank size={22} />;
      case 'cash': return <Wallet size={22} />;
      default: return <Landmark size={22} />;
    }
  };

  const getBadge = (cat) => {
    if (cat === 'credit') return { cls: 'acc2-badge credit', text: 'CREDIT CARD' };
    if (cat === 'cash') return { cls: 'acc2-badge cash', text: 'CASH' };
    return { cls: 'acc2-badge bank', text: 'BANK' };
  };

  const handleTransfer = async () => {
    const amt = parseFloat(transferAmt);
    if (!fromTransfer || !toTransfer || amt <= 0) return alert('Fill all transfer fields');
    if (fromTransfer === toTransfer) return alert('Cannot transfer to same account');
    const fromAcc = accounts.find(a => a._id === fromTransfer);
    const toAcc = accounts.find(a => a._id === toTransfer);
    try {
      await api.createTransaction({
        description: 'Transfer to ' + (toAcc?.name || 'account'),
        amount: -amt, category: 'Transfer', account: fromAcc?.name || '', date: new Date().toISOString()
      }, activeWorkspace._id);
      await api.createTransaction({
        description: 'Transfer from ' + (fromAcc?.name || 'account'),
        amount: amt, category: 'Transfer', account: toAcc?.name || '', date: new Date().toISOString()
      }, activeWorkspace._id);
      await api.updateAccount(fromTransfer, { balance: (fromAcc.balance || 0) - amt }, activeWorkspace._id);
      await api.updateAccount(toTransfer, { balance: (toAcc.balance || 0) + amt }, activeWorkspace._id);
      alert('Transfer executed!');
      setTransferAmt('0.00');
      load();
    } catch (e) { alert(e.response?.data?.message || e.message); }
  };

  return (
    <div className="acc2-page">
      <div className="acc2-header">
        <div>
          <h1 className="acc2-title">Accounts</h1>
          <p className="acc2-subtitle">Manage and monitor your financial institutions and cash.</p>
        </div>
        <button className="acc2-add-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Account
        </button>
      </div>

      <div className="acc2-cards-grid">
        {loading ? (
          <div style={{gridColumn:'1/-1',textAlign:'center',padding:40}}>Loading accounts...</div>
        ) : accounts.length === 0 ? (
          <div className="acc2-empty-card" onClick={() => setShowAddModal(true)}>
            <Plus size={28} />
            <span>Add your first account</span>
          </div>
        ) : accounts.map(acc => {
          const badge = getBadge(acc.category);
          return (
            <div key={acc._id} className="acc2-card">
              <div className="acc2-card-top">
                <div className="acc2-card-icon">{getIcon(acc.category)}</div>
                <span className={badge.cls}>{badge.text}</span>
              </div>
              <h3 className="acc2-card-name">{acc.name}</h3>
              <p className="acc2-card-sub">{acc.type}{acc.mask ? ` ending in •••• ${acc.mask}` : ''}</p>
              <p className="acc2-card-bal-label">Current Balance</p>
              <p className={'acc2-card-bal' + (acc.balance < 0 ? ' negative' : '')}>
                {acc.balance < 0 ? '-' : ''}{fmtBal(acc.balance)}
              </p>
              <button className="acc2-card-delete" onClick={() => handleDelete(acc._id)} title="Remove"><Trash2 size={14} /></button>
            </div>
          );
        })}
      </div>

      <div className="acc2-bottom-grid">
        <div className="acc2-transfer-card">
          <div className="acc2-transfer-header">
            <ArrowLeftRight size={18} />
            <h3>Transfer Funds</h3>
            <span className="acc2-transfer-hint">Move money instantly between accounts</span>
          </div>
          <div className="acc2-transfer-fields">
            <div className="acc2-transfer-col">
              <label>From Account</label>
              <select value={fromTransfer} onChange={e => setFromTransfer(e.target.value)}>
                {accounts.map(a => <option key={a._id} value={a._id}>{a.name} ({fmtBal(a.balance)})</option>)}
              </select>
            </div>
            <div className="acc2-transfer-arrow"><ArrowRight size={18} /></div>
            <div className="acc2-transfer-col">
              <label>To Account</label>
              <select value={toTransfer} onChange={e => setToTransfer(e.target.value)}>
                {accounts.map(a => <option key={a._id} value={a._id}>{a.name} ({fmtBal(a.balance)})</option>)}
              </select>
            </div>
          </div>
          <div className="acc2-transfer-amount-row">
            <div className="acc2-transfer-amount-col">
              <label>Amount to Transfer</label>
              <div className="acc2-transfer-input-wrap">
                <span className="acc2-dollar">$</span>
                <input type="text" value={transferAmt} onChange={e => setTransferAmt(e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <button className="acc2-execute-btn" onClick={handleTransfer}>Execute Transfer</button>
          </div>
        </div>

        <div className="acc2-liquidity-card">
          <h3 className="acc2-liq-title">Liquidity Snapshot</h3>
          <div className="acc2-liq-row">
            <span>Total Liquid Assets</span>
            <strong>{fmtBal(totalLiquid)}</strong>
          </div>
          <div className="acc2-liq-bar"><div className="acc2-liq-bar-fill green" style={{width: '70%'}}></div></div>
          <div className="acc2-liq-row" style={{marginTop: 16}}>
            <span>Credit Utilization</span>
            <strong>{creditLimit > 0 ? Math.round((creditUsed / creditLimit) * 100) : 0}%</strong>
          </div>
          <div className="acc2-liq-bar"><div className="acc2-liq-bar-fill red" style={{width: (creditLimit > 0 ? Math.min(100, (creditUsed / creditLimit) * 100) : 0) + '%'}}></div></div>
          <p className="acc2-liq-note"><AlertCircle size={12} /> Daily reconciliation keeps your fiscal narrative accurate.</p>
        </div>
      </div>

      <div className="acc2-recent-section">
        <h3>Recent Transfers</h3>
        <table className="acc2-table">
          <thead>
            <tr><th>Date</th><th>From</th><th>To</th><th>Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr><td colSpan="5" style={{textAlign:'center',padding:24,color:'#9CA3AF'}}>Transfer history will appear here</td></tr>
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <AccountModal activeWorkspace={activeWorkspace} onClose={() => setShowAddModal(false)} onSaved={() => { setShowAddModal(false); load(); }} />
      )}
    </div>
  );
}

function AccountModal({ activeWorkspace, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [mask, setMask] = useState('');
  const [balance, setBalance] = useState('');
  const [category, setCategory] = useState('cash');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createAccount({ name, type, mask, balance: Number(balance), category, icon: category }, activeWorkspace._id);
      onSaved();
    } catch (err) { alert(err.response?.data?.message || err.message); }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', padding: 32, borderRadius: 16, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <h3 style={{marginTop: 0, fontSize: 20, fontWeight: 700}}>Add New Account</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="tf-field-label">Bank / Institution Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Chase, HDFC" style={{width:'100%', padding: '10px 12px', borderRadius: 8, border:'1px solid #E5E7EB', fontSize: 14, boxSizing:'border-box'}} />
          </div>
          <div>
            <label className="tf-field-label">Account Type</label>
            <input type="text" value={type} onChange={e => setType(e.target.value)} required placeholder="e.g. Checking, Savings, Visa" style={{width:'100%', padding: '10px 12px', borderRadius: 8, border:'1px solid #E5E7EB', fontSize: 14, boxSizing:'border-box'}} />
          </div>
          <div style={{display:'flex', gap: 12}}>
            <div style={{flex: 1}}>
              <label className="tf-field-label">Last 4 Digits</label>
              <input type="text" value={mask} onChange={e => setMask(e.target.value)} maxLength="4" placeholder="4902" style={{width:'100%', padding: '10px 12px', borderRadius: 8, border:'1px solid #E5E7EB', fontSize: 14, boxSizing:'border-box'}} />
            </div>
            <div style={{flex: 1}}>
              <label className="tf-field-label">Current Balance</label>
              <input type="number" step="0.01" value={balance} onChange={e => setBalance(e.target.value)} required placeholder="14892.20" style={{width:'100%', padding: '10px 12px', borderRadius: 8, border:'1px solid #E5E7EB', fontSize: 14, boxSizing:'border-box'}} />
            </div>
          </div>
          <div>
            <label className="tf-field-label">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{width:'100%', padding: '10px 12px', borderRadius: 8, border:'1px solid #E5E7EB', fontSize: 14, boxSizing:'border-box'}}>
              <option value="cash">Cash & Checking</option>
              <option value="credit">Credit Card</option>
              <option value="bank">Bank Account</option>
              <option value="savings">Savings</option>
              <option value="investment">Investment</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{padding: '10px 20px', borderRadius: 8, border:'1px solid #E5E7EB', background:'#fff', cursor:'pointer', fontSize: 14, fontWeight: 600}}>Cancel</button>
            <button type="submit" style={{padding: '10px 20px', borderRadius: 8, border:'none', background:'#111827', color:'#fff', cursor:'pointer', fontSize: 14, fontWeight: 600}}>Add Account</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Budgets Page ──────────────────────────── */
function BudgetsPage({ activeWorkspace }) {
  const [budgets, setBudgets] = useState([]);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const load = useCallback(async () => {
    if (!activeWorkspace) return;
    try {
      setLoading(true);
      const [budRes, txnRes] = await Promise.all([
        api.getBudgets(activeWorkspace._id),
        api.getTransactions(activeWorkspace._id)
      ]);
      setBudgets(budRes.data);
      setTxns(txnRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace]);

  useEffect(() => { load(); }, [load]);

  const getSpentForCategory = (catName) => {
    return txns
      .filter(t => t.category && t.category.toLowerCase() === catName.toLowerCase() && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const getCatIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('grocery') || n.includes('food') || n.includes('market')) return <ShoppingCart size={20} />;
    if (n.includes('din') || n.includes('restaurant') || n.includes('cafe')) return <Utensils size={20} />;
    if (n.includes('transport') || n.includes('uber') || n.includes('car') || n.includes('fuel')) return <Car size={20} />;
    if (n.includes('entertainment') || n.includes('netflix') || n.includes('tv') || n.includes('movie')) return <Tv size={20} />;
    if (n.includes('health') || n.includes('medical') || n.includes('gym')) return <Activity size={20} />;
    if (n.includes('tech') || n.includes('software') || n.includes('computer')) return <Monitor size={20} />;
    if (n.includes('util') || n.includes('bill') || n.includes('power') || n.includes('water')) return <Zap size={20} />;
    return <Coffee size={20} />;
  };

  const getIconClass = (name) => {
    const n = name.toLowerCase();
    if (n.includes('grocery')) return 'groceries';
    if (n.includes('din') || n.includes('food')) return 'dining';
    if (n.includes('transport')) return 'transport';
    if (n.includes('entertainment')) return 'entertainment';
    if (n.includes('health')) return 'health';
    return 'default';
  };

  const handleDeleteBudget = async (id) => {
    if (!confirm('Are you sure you want to delete this budget limit?')) return;
    try {
      await api.deleteBudget(id, activeWorkspace._id);
      load();
    } catch (err) {
      alert('Failed to delete budget limit.');
    }
  };

  const totalLimit = budgets.reduce((sum, b) => sum + (b.limit || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + getSpentForCategory(b.name), 0);
  const totalRemaining = Math.max(0, totalLimit - totalSpent);
  const utilizationPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  return (
    <div className="budget-page-new">
      <div className="budget-header-top">
        <div className="budget-title-area">
          <h1 className="budget-title-new">Monthly Budget</h1>
          <span className="budget-date-badge">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}</span>
        </div>
        <div className="budget-header-actions">
          <button className="budget-btn-create" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Create Budget
          </button>
          <button className="budget-btn-icon" onClick={() => load()}>
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className="budget-top-grid">
        <div className="budget-card">
          <div className="budget-card-label">CUMULATIVE PERFORMANCE</div>
          <h2 className="budget-card-title">Budget vs Actual</h2>
          <div className="budget-chart-area">
            <div style={{ position: 'absolute', bottom: 32, left: '5%', width: '90%', height: 2, background: '#F3F4F6' }}></div>
            <div style={{ position: 'absolute', bottom: 82, left: '5%', width: '90%', height: 2, background: '#F3F4F6' }}></div>
            <div style={{ position: 'absolute', bottom: 132, left: '5%', width: '90%', height: 2, background: '#F3F4F6' }}></div>
            
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
              <polyline points="0,180 200,140 400,100 600,60" fill="none" stroke="#C7D2FE" strokeWidth="3" />
            </svg>
            
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
              <polyline points="0,180 200,160 400,130 600,110" fill="none" stroke="#111827" strokeWidth="3" />
            </svg>

            <div className="budget-chart-label">WEEK 1</div>
            <div className="budget-chart-label">WEEK 2</div>
            <div className="budget-chart-label">WEEK 3</div>
            <div className="budget-chart-label">WEEK 4</div>
          </div>
          <div className="budget-chart-legend">
            <div className="budget-legend-item">
              <div className="budget-legend-dot allocated"></div> Allocated
            </div>
            <div className="budget-legend-item">
              <div className="budget-legend-dot spent"></div> Spent
            </div>
          </div>
        </div>

        <div className="budget-metric-col">
          <div className="budget-card">
            <div className="budget-card-label">REMAINING TO SPEND</div>
            <div className="budget-metric-val">${totalRemaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div className="budget-metric-trend">
              <TrendingUp size={14} /> {100 - utilizationPct}% remaining
            </div>
          </div>

          <div className="budget-card">
            <div className="budget-metric-limit-row">
              <div className="budget-card-label">OVERALL MONTHLY BUDGET</div>
              <button className="budget-limit-btn" onClick={() => setShowAddModal(true)}>Set Limit</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: 4 }}>
              <div className="budget-metric-val" style={{ marginBottom: 0 }}>${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              <div className="budget-spent-sub">spent of<br/>${totalLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="budget-progress-bar-bg">
              <div className="budget-progress-bar-fill" style={{ width: `${Math.min(100, utilizationPct)}%` }}></div>
            </div>
            <div className="budget-util-row">
              <div className="budget-util-status"><CheckCircle2 size={14} /> {utilizationPct}% Utilized</div>
              <div className="budget-util-rem">${totalRemaining.toLocaleString('en-US', { minimumFractionDigits: 2 })} remaining</div>
            </div>
          </div>
        </div>
      </div>

      <div className="budget-cat-section-header">
        <h2 className="budget-cat-section-title">Category Breakdown</h2>
        <div className="budget-cat-actions">
          <button className="budget-cat-action-btn" onClick={() => load()}>Refresh</button>
        </div>
      </div>

      <div className="budget-cat-grid">
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#6B7280' }}>Loading budgets...</div>
        ) : budgets.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#6B7280' }}>No spending limits defined yet. Create your first budget limit!</div>
        ) : budgets.map(b => {
          const spent = getSpentForCategory(b.name);
          const pct = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
          const isOver = pct > 100;
          const left = isOver ? spent - b.limit : b.limit - spent;
          const iconName = getIconClass(b.name);
          
          return (
            <div key={b._id} className="budget-cat-card">
              <div className="budget-cat-header-row">
                <div className={`budget-cat-icon ${iconName}`}>
                  {getCatIcon(b.name)}
                </div>
                <div className="budget-cat-title-col">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="budget-cat-name">{b.name}</div>
                    <button className="budget-limit-btn" onClick={() => handleDeleteBudget(b._id)} style={{ fontSize: 10, color: '#DC2626' }}>Remove</button>
                  </div>
                  {isOver ? (
                    <span className="budget-badge-overlimit">OVER LIMIT</span>
                  ) : (
                    <span className="budget-badge-ontrack">ON TRACK</span>
                  )}
                </div>
              </div>
              
              <div className="budget-cat-spent-limit">
                <div className="budget-cat-spent">Spent: <strong>${spent.toFixed(2)}</strong></div>
                <div className="budget-cat-limit">Limit: ${b.limit.toFixed(2)}</div>
              </div>
              
              <div className="budget-cat-bar-bg">
                <div className={`budget-cat-bar-fill ${isOver ? 'danger' : 'neutral'}`} style={{ width: `${Math.min(100, pct)}%` }}></div>
              </div>
              
              <div className="budget-cat-footer">
                <div className={`budget-cat-footer-left ${isOver ? 'danger' : ''}`}>
                  {isOver ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={10} /> -${left.toFixed(2)} over</span>
                  ) : (
                    `$${left.toFixed(2)} left`
                  )}
                </div>
                <div className="budget-cat-footer-right">
                  {pct}% used
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="budget-cat-add-card" onClick={() => setShowAddModal(true)}>
          <div className="budget-add-icon">
            <Plus size={16} />
          </div>
          <div className="budget-add-title">Add Category</div>
          <div className="budget-add-sub">Define a new spending limit</div>
        </div>
      </div>

      {showAddModal && (
        <CreateBudgetModal 
          activeWorkspace={activeWorkspace} 
          onClose={() => setShowAddModal(false)} 
          onSaved={() => { setShowAddModal(false); load(); }} 
        />
      )}
    </div>
  );
}

function CreateBudgetModal({ activeWorkspace, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !limit) return alert('Please fill in all fields.');
    setLoading(true);
    try {
      await api.addBudget({
        name,
        limit: Number(limit),
        spent: 0,
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
      }, activeWorkspace._id);
      onSaved();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create budget limit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', padding: 32, borderRadius: 16, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <h3 style={{ marginTop: 0, fontSize: 20, fontWeight: 700 }}>Define Spending Limit</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="tf-field-label">Category Name</label>
            <select value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, boxSizing: 'border-box', background: '#F9FAFB' }}>
              <option value="">Select category...</option>
              {['Groceries', 'Dining', 'Income', 'Transport', 'Entertainment', 'Tech', 'Utilities', 'Healthcare', 'Leisure'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="tf-field-label">Monthly Limit ($)</label>
            <input type="number" value={limit} onChange={e => setLimit(e.target.value)} required placeholder="e.g. 500" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#111827', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              {loading ? 'Creating...' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────── */

function ReportsPage({ activeWorkspace }) {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRange, setFilterRange] = useState('30days');

  const load = useCallback(async () => {
    if (!activeWorkspace) return;
    try {
      setLoading(true);
      const res = await api.getTransactions(activeWorkspace._id);
      setTxns(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace]);

  useEffect(() => { load(); }, [load]);

  const hasData = Array.isArray(txns) && txns.length > 0;

  const filteredTxns = useMemo(() => {
    const now = new Date();
    return (Array.isArray(txns) ? txns : []).filter(t => {
      if (!t || !t.date) return false;
      const tDate = new Date(t.date);
      if (isNaN(tDate.getTime())) return false;
      
      if (filterRange === '30days') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return tDate >= thirtyDaysAgo;
      }
      if (filterRange === '6months') {
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        return tDate >= sixMonthsAgo;
      }
      return true;
    });
  }, [txns, filterRange]);

  const stats = useMemo(() => {
    if (!hasData) {
      return { income: 42850.00, expenses: 28140.50, net: 14709.50, rate: 28 };
    }
    const income = filteredTxns.filter(t => Number(t.amount) > 0).reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = filteredTxns.filter(t => Number(t.amount) < 0).reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    const net = income - expenses;
    const rate = income > 0 ? Math.round((net / income) * 100) : 0;
    return { income, expenses, net, rate };
  }, [filteredTxns, hasData]);

  const categoryData = useMemo(() => {
    if (!hasData) {
      return [
        { id: 0, name: 'Housing & Utilities', sub: 'Housing & Utilities', amount: 4850.00, pct: 40, trend: '- Stable', color: 'black', icon: 'home' },
        { id: 1, name: 'Dining & Groceries', sub: 'Dining & Groceries', amount: 2420.15, pct: 25, trend: '↑ +12%', color: 'green', icon: 'cart' },
        { id: 2, name: 'Travel & Transport', sub: 'Travel & Transport', amount: 1980.40, pct: 20, trend: '↓ -5%', color: 'red', icon: 'car' },
        { id: 3, name: 'Shopping', sub: 'Shopping', amount: 1450.00, pct: 15, trend: '↓ -18%', color: 'grey', icon: 'tv' }
      ];
    }

    const expenses = filteredTxns.filter(t => Number(t.amount) < 0);
    const totalExp = expenses.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    
    const groups = {};
    expenses.forEach(t => {
      const cat = t.category || 'Other';
      groups[cat] = (groups[cat] || 0) + Math.abs(Number(t.amount));
    });

    const colorsList = ['black', 'green', 'red', 'grey'];
    const iconsList = ['home', 'cart', 'car', 'tv'];

    return Object.keys(groups).map((name, index) => {
      const amount = groups[name];
      const pct = totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0;
      
      const n = name.toLowerCase();
      let color = colorsList[index % 4];
      let icon = iconsList[index % 4];
      if (n.includes('grocery') || n.includes('food') || n.includes('market')) { color = 'green'; icon = 'cart'; }
      else if (n.includes('din') || n.includes('restaurant') || n.includes('cafe')) { color = 'green'; icon = 'coffee'; }
      else if (n.includes('transport') || n.includes('uber') || n.includes('car') || n.includes('fuel')) { color = 'red'; icon = 'car'; }
      else if (n.includes('entertainment') || n.includes('netflix') || n.includes('tv') || n.includes('movie')) { color = 'grey'; icon = 'tv'; }
      else if (n.includes('home') || n.includes('rent') || n.includes('mortgage') || n.includes('housing')) { color = 'black'; icon = 'home'; }

      let trend = '- Stable';
      if (index === 1) trend = '↑ +12%';
      if (index === 2) trend = '↓ -5%';
      if (index === 3) trend = '↓ -18%';

      return {
        id: index,
        name,
        sub: name + ' Spending',
        amount,
        pct,
        trend,
        color,
        icon
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [filteredTxns, hasData]);

  const avgDailySpend = useMemo(() => {
    if (!hasData) return 245;
    const expenses = filteredTxns.filter(t => Number(t.amount) < 0);
    if (expenses.length === 0) return 0;
    const totalExp = expenses.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    const dates = expenses.map(t => new Date(t.date).toDateString());
    const uniqueDays = new Set(dates).size || 1;
    return Math.round(totalExp / uniqueDays);
  }, [filteredTxns, hasData]);

  const getIcon = (iconStr) => {
    switch (iconStr) {
      case 'home': return <Home size={20} />;
      case 'cart': return <ShoppingCart size={20} />;
      case 'car': return <Car size={20} />;
      case 'tv': return <Tv size={20} />;
      default: return <Coffee size={20} />;
    }
  };

  const getTrendClass = (trend) => {
    if (!trend || typeof trend !== 'string') return 'neutral';
    if (trend.includes('↑')) return 'up';
    if (trend.includes('↓')) return 'down';
    return 'neutral';
  };

  const getTrendIcon = (trend) => {
    if (!trend || typeof trend !== 'string') return null;
    if (trend.includes('↑')) return <TrendingUp size={12} />;
    if (trend.includes('↓')) return <TrendingDown size={12} />;
    return null;
  };

  const handleExport = async () => {
    if (!activeWorkspace) return;
    try {
      const headers = ['Date', 'Description', 'Category', 'Account', 'Amount', 'Notes'];
      const txList = hasData ? filteredTxns : [
        { date: '2024-01-01', description: 'Rent Payment', category: 'Housing & Utilities', account: 'Main Checking', amount: -4850.00 },
        { date: '2024-01-08', description: 'Whole Foods Market', category: 'Dining & Groceries', account: 'Main Checking', amount: -2420.15 },
        { date: '2024-01-15', description: 'Uber & Flight', category: 'Travel & Transport', account: 'Visa Gold Card', amount: -1980.40 },
        { date: '2024-01-22', description: 'Apple Store Shopping', category: 'Shopping', account: 'Visa Gold Card', amount: -1450.00 }
      ];
      const rows = txList.map(t => {
        const d = new Date(t.date);
        const dateStr = isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleDateString();
        return [
          dateStr,
          t.description,
          t.category,
          t.account,
          t.amount,
          t.notes || ''
        ];
      });
      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `financial_report_${activeWorkspace.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
    } catch (err) {
      alert('Could not export report data.');
    }
  };

  const monthlyChartData = useMemo(() => {
    if (!hasData) {
      return [
        { label: 'Aug', incomeHeight: '65%', expenseHeight: '45%', income: 28000, expense: 19000 },
        { label: 'Sep', incomeHeight: '70%', expenseHeight: '50%', income: 30000, expense: 21000 },
        { label: 'Oct', incomeHeight: '75%', expenseHeight: '55%', income: 32000, expense: 23000 },
        { label: 'Nov', incomeHeight: '80%', expenseHeight: '60%', income: 34000, expense: 25000 },
        { label: 'Dec', incomeHeight: '90%', expenseHeight: '75%', income: 39000, expense: 32000 },
        { label: 'Jan', incomeHeight: '100%', expenseHeight: '70%', income: 42850, expense: 28140.50 }
      ];
    }

    const monthNames = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    const now = new Date();
    const list = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      list.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: monthNames[(d.getMonth() + 12 - (now.getMonth() - 5)) % 6] || monthNames[d.getMonth() % 6],
        income: 0,
        expense: 0
      });
    }

    list[0].label = 'Aug';
    list[1].label = 'Sep';
    list[2].label = 'Oct';
    list[3].label = 'Nov';
    list[4].label = 'Dec';
    list[5].label = 'Jan';

    (Array.isArray(txns) ? txns : []).forEach(t => {
      if (!t || !t.date) return;
      const tDate = new Date(t.date);
      if (isNaN(tDate.getTime())) return;
      
      const diffMonths = (now.getFullYear() - tDate.getFullYear()) * 12 + (now.getMonth() - tDate.getMonth());
      if (diffMonths >= 0 && diffMonths <= 5) {
        const idx = 5 - diffMonths;
        const amt = Number(t.amount);
        if (amt > 0) list[idx].income += amt;
        else list[idx].expense += Math.abs(amt);
      }
    });

    const maxVal = Math.max(...list.map(m => Math.max(m.income, m.expense)), 100);

    return list.map(m => ({
      ...m,
      incomeHeight: `${(m.income / maxVal) * 100}%`,
      expenseHeight: `${(m.expense / maxVal) * 100}%`
    }));
  }, [txns, hasData]);

  const donutStyle = useMemo(() => {
    if (!hasData) {
      return { background: 'conic-gradient(#111827 0% 40%, #059669 40% 65%, #DC2626 65% 85%, #CBD5E1 85% 100%)' };
    }
    let accum = 0;
    const colors = ['#111827', '#059669', '#DC2626', '#CBD5E1'];
    const segments = categoryData.slice(0, 3).map((c, i) => {
      const start = accum;
      accum += c.pct;
      return `${colors[i]} ${start}% ${accum}%`;
    });
    if (accum < 100) {
      segments.push(`#CBD5E1 ${accum}% 100%`);
    }
    return { background: `conic-gradient(${segments.join(', ')})` };
  }, [categoryData, hasData]);

  const trendChart = useMemo(() => {
    const height = 180;
    const width = 1000;

    if (!hasData) {
      return {
        strokeD: 'M 0,150 C 80,160 150,150 200,130 C 250,110 300,180 350,180 C 400,180 450,100 500,110 C 550,120 600,180 650,180 C 700,180 750,70 800,70 C 850,70 900,150 950,140 C 970,135 990,125 1000,120',
        fillD: 'M 0,150 C 80,160 150,150 200,130 C 250,110 300,180 350,180 C 400,180 450,100 500,110 C 550,120 600,180 650,180 C 700,180 750,70 800,70 C 850,70 900,150 950,140 C 970,135 990,125 1000,120 L 1000,180 L 0,180 Z',
        avgY: 140,
        maxAmt: 10
      };
    }

    const expenses = filteredTxns.filter(t => Number(t.amount) < 0);
    if (expenses.length === 0) {
      return {
        strokeD: `M 0,${height} L ${width},${height}`,
        fillD: `M 0,${height} L ${width},${height} L ${width},${height} L 0,${height} Z`,
        avgY: height,
        maxAmt: 10
      };
    }
    
    const dailyMap = {};
    expenses.forEach(t => {
      if (!t.date) return;
      const dateStr = new Date(t.date).toDateString();
      dailyMap[dateStr] = (dailyMap[dateStr] || 0) + Math.abs(Number(t.amount));
    });

    const sortedDates = Object.keys(dailyMap).sort((a, b) => new Date(a) - new Date(b));
    const maxAmt = Math.max(...Object.values(dailyMap), 10);

    const coords = sortedDates.map((date, index) => {
      const amt = dailyMap[date];
      const x = sortedDates.length > 1 ? (index / (sortedDates.length - 1)) * width : width / 2;
      const y = height - (amt / maxAmt) * height * 0.7;
      return { x, y };
    });

    let strokeD = '';
    let fillD = '';
    if (coords.length > 0) {
      strokeD = `M ${coords[0].x},${coords[0].y}`;
      for (let i = 1; i < coords.length; i++) {
        const prev = coords[i - 1];
        const curr = coords[i];
        const cpX1 = prev.x + (curr.x - prev.x) / 2;
        const cpY1 = prev.y;
        const cpX2 = prev.x + (curr.x - prev.x) / 2;
        const cpY2 = curr.y;
        strokeD += ` C ${cpX1},${cpY1} ${cpX2},${cpY2} ${curr.x},${curr.y}`;
      }
      fillD = `${strokeD} L ${width},${height} L 0,${height} Z`;
    }

    const avgY = height - (avgDailySpend / maxAmt) * height * 0.7;

    return { strokeD, fillD, avgY, maxAmt };
  }, [filteredTxns, hasData, avgDailySpend]);

  const dateLabels = useMemo(() => {
    if (!hasData) return ['1 JAN', '8 JAN', '15 JAN', '22 JAN', 'TODAY'];
    const expenses = filteredTxns.filter(t => Number(t.amount) < 0);
    if (expenses.length === 0) return ['1 JAN', '8 JAN', '15 JAN', '22 JAN', 'TODAY'];
    
    const dates = Array.from(new Set(expenses.map(t => {
      const d = new Date(t.date);
      return isNaN(d.getTime()) ? 'Unknown' : d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase();
    })));
    dates.sort((a, b) => new Date(a) - new Date(b));

    if (dates.length <= 5) return dates;
    
    const step = (dates.length - 1) / 4;
    return [
      dates[0],
      dates[Math.round(step)],
      dates[Math.round(step * 2)],
      dates[Math.round(step * 3)],
      'TODAY'
    ];
  }, [filteredTxns, hasData]);

  return (
    <div className="rep-page-new">
      <div className="rep-header-row">
        <div>
          <h1 className="rep-title" style={{ fontSize: 28, fontWeight: 800 }}>Financial Analytics</h1>
          <p className="rep-subtitle" style={{ fontSize: 14, color: '#4B5563' }}>Comprehensive performance analysis for your fiscal portfolio.</p>
        </div>
        <div className="rep-actions">
          <div className="rep-filter-container">
            <button className={`rep-filter-btn ${filterRange === '30days' ? 'active' : ''}`} onClick={() => setFilterRange('30days')}>Last 30 Days</button>
            <button className={`rep-filter-btn ${filterRange === '6months' ? 'active' : ''}`} onClick={() => setFilterRange('6months')}>Last 6 Months</button>
            <button className={`rep-filter-btn ${filterRange === 'all' ? 'active' : ''}`} onClick={() => setFilterRange('all')}>Custom</button>
          </div>
          <button className="rep-pdf-btn" onClick={handleExport}>
            <FileText size={16} /> Export PDF
          </button>
        </div>
      </div>

      <div className="rep-kpi-grid-new">
        <div className="rep-kpi-card-new">
          <div className="rep-kpi-card-top">
            <div className="rep-circle-icon income"><ArrowUp size={20} /></div>
            <div className="rep-kpi-badge up">+12.5% ↗</div>
          </div>
          <span className="rep-kpi-card-label">Total Income</span>
          <div className="rep-kpi-card-val">${stats.income.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
        </div>

        <div className="rep-kpi-card-new">
          <div className="rep-kpi-card-top">
            <div className="rep-circle-icon expense"><TrendingDown size={20} /></div>
            <div className="rep-kpi-badge down">-4.2% ↘</div>
          </div>
          <span className="rep-kpi-card-label">Total Expenses</span>
          <div className="rep-kpi-card-val">${stats.expenses.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
        </div>

        <div className="rep-kpi-card-new">
          <div className="rep-kpi-card-top">
            <div className="rep-circle-icon savings"><Wallet size={20} /></div>
            <div className="rep-kpi-badge up">+28.0% ↗</div>
          </div>
          <span className="rep-kpi-card-label">Net Savings</span>
          <div className="rep-kpi-card-val">${stats.net.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
        </div>
      </div>

      <div className="rep-chart-grid">
        <div className="rep-chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 className="rep-chart-card-title">Income vs. Expenses</h2>
            <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#4B5563', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0F766E' }}></div> Income</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E11D48' }}></div> Expenses</span>
            </div>
          </div>

          <div className="rep-bar-chart" style={{ borderLeft: 'none' }}>
            <div className="rep-bar-y-axis">
              <span>Max</span>
              <span>50%</span>
              <span>0</span>
            </div>
            {monthlyChartData.map((m, idx) => (
              <div key={idx} className="rep-bar-group">
                <div className="rep-bar-col inc" style={{ height: m.incomeHeight }} title={`Income: $${m.income.toFixed(2)}`}></div>
                <div className="rep-bar-col exp" style={{ height: m.expenseHeight }} title={`Expense: $${m.expense.toFixed(2)}`}></div>
                <div className="rep-bar-x-label">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rep-chart-card">
          <h2 className="rep-chart-card-title" style={{ marginBottom: 20 }}>Spending by Category</h2>
          <div className="rep-donut-container">
            <div className="rep-donut" style={donutStyle}>
              <div className="rep-donut-inner">
                <span className="rep-donut-total-lbl">Total Spent</span>
                <span className="rep-donut-total-val" style={{ fontSize: 20, marginTop: 4 }}>
                  ${(stats.expenses > 1000 ? (stats.expenses / 1000).toFixed(1) + 'k' : stats.expenses.toFixed(0))}
                </span>
              </div>
            </div>
            <div className="rep-donut-legend" style={{ gridTemplateColumns: '1fr', gap: 8, marginTop: 24 }}>
              {categoryData.slice(0, 4).map((c, idx) => (
                <div key={idx} className="rep-donut-leg-item" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className={`rep-donut-leg-dot ${c.color === 'black' ? 'black' : (c.color === 'green' ? 'green' : (c.color === 'red' ? 'red' : 'grey'))}`}></div>
                    <span>{c.name}</span>
                  </div>
                  <span style={{ fontWeight: 700 }}>{c.pct}%</span>
                </div>
              ))}
              {categoryData.length === 0 && <div className="rep-donut-leg-item">No expenses recorded</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="rep-line-chart-card">
        <div className="rep-line-header" style={{ marginBottom: 8 }}>
          <div>
            <h2 className="rep-chart-card-title">Daily Spending Trend</h2>
            <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0' }}>Cash flow velocity relative to daily average budget.</p>
          </div>
          <span className="rep-line-badge" style={{ background: '#F3F4F6', color: '#111827', fontWeight: 700 }}>Avg: ${avgDailySpend}/day</span>
        </div>
        
        <div className="rep-line-area" style={{ height: 180 }}>
          <div style={{ position: 'absolute', left: '25%', top: 0, bottom: 0, borderLeft: '1px dashed #E5E7EB' }}></div>
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, borderLeft: '1px dashed #E5E7EB' }}></div>
          <div style={{ position: 'absolute', left: '75%', top: 0, bottom: 0, borderLeft: '1px dashed #E5E7EB' }}></div>
          
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#111827" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#111827" stopOpacity="0.00" />
              </linearGradient>
            </defs>
            {/* Shaded Area */}
            {trendChart.fillD && <path d={trendChart.fillD} fill="url(#chartGrad)" />}
            {/* Dotted Average line */}
            {isFinite(trendChart.avgY) && (
              <line x1="0" y1={trendChart.avgY} x2="1000" y2={trendChart.avgY} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
            )}
            {/* Trend line */}
            {trendChart.strokeD && <path d={trendChart.strokeD} fill="none" stroke="#111827" strokeWidth="2" strokeLinejoin="round" />}
          </svg>
        </div>
        
        <div className="rep-line-x-axis">
          {dateLabels.map((lbl, idx) => <span key={idx}>{lbl}</span>)}
        </div>
      </div>

      <div className="rep-table-card">
        <div className="rep-table-header" style={{ padding: '20px 24px' }}>
          <h2 className="rep-chart-card-title">Top Category Breakdown</h2>
          <span className="rep-table-link" style={{ cursor: 'pointer', color: '#111827', textDecoration: 'underline' }}>View All Categories</span>
        </div>
        
        <table className="rep-table">
          <thead>
            <tr>
              <th style={{ padding: '12px 24px' }}>Category</th>
              <th style={{ padding: '12px 24px' }}>Total Amount</th>
              <th style={{ padding: '12px 24px' }}>% of Spending</th>
              <th style={{ padding: '12px 24px' }}>Trend (30d)</th>
              <th style={{ padding: '12px 24px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {categoryData.map(c => (
              <tr key={c.id}>
                <td style={{ padding: '12px 24px' }}>
                  <div className="rep-cat-cell">
                    <div className={`rep-cat-icon ${c.color === 'black' ? 'black' : (c.color === 'green' ? 'green' : (c.color === 'red' ? 'red' : 'grey'))}`} style={{ borderRadius: '8px' }}>
                      {getIcon(c.icon)}
                    </div>
                    <span className="rep-cat-name" style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 24px' }}>
                  <span className="rep-cat-name" style={{ fontSize: 14, fontWeight: 700 }}>${c.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </td>
                <td style={{ padding: '12px 24px' }}>
                  <div className="rep-prog-cell">
                    <div className="rep-prog-bar-bg" style={{ height: 6, width: 80, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
                      <div className="rep-prog-bar-fill" style={{ height: '100%', width: `${c.pct}%`, background: c.color === 'black' ? '#111827' : (c.color === 'green' ? '#059669' : (c.color === 'red' ? '#DC2626' : '#CBD5E1')) }} />
                    </div>
                    <span className="rep-prog-pct" style={{ fontSize: 13, fontWeight: 700, marginLeft: 8 }}>{c.pct}%</span>
                  </div>
                </td>
                <td style={{ padding: '12px 24px' }}>
                  <div className={`rep-trend-cell ${getTrendClass(c.trend)}`} style={{ fontWeight: 600 }}>
                    {getTrendIcon(c.trend)} {c.trend}
                  </div>
                </td>
                <td style={{ padding: '12px 24px', textAlign: 'right' }}>
                  <button className="rep-details-btn">Details</button>
                </td>
              </tr>
            ))}
            {categoryData.length === 0 && (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', padding: 24, color: '#9CA3AF'}}>No expense records found for this period.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────── */

function DashboardContent({ onInvite, activeWorkspace, userData, setActivePage, setGlobalEditingTxn }) {
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
        <div className="dash-balance-value">\${totalBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
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
          <div className="dash-kpi-value">\${totalIncome.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
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
          <div className="dash-kpi-value">\${totalExpense.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
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
          <div className="dash-kpi-value">\${netSavings.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
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
                <span className="dash-budget-usage-sub">(\${totalSpent.toLocaleString()} of \${budgetLimit.toLocaleString()})</span>
              </div>
              <span className="dash-budget-status">ON TRACK</span>
            </div>
            <div className="dash-budget-bar-bg">
              <div className="dash-budget-bar-fill" style={{ width: `\${budgetPct}%` }}></div>
            </div>
          </div>

          <div className="dash-budget-stats-grid">
            <div className="dash-budget-stat-box">
              <div className="dash-budget-stat-label">HIGHEST SPIKE</div>
              <div className="dash-budget-stat-val">{highestSpike}</div>
            </div>
            <div className="dash-budget-stat-box">
              <div className="dash-budget-stat-label">REMAINING</div>
              <div className="dash-budget-stat-val green">\${remaining.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
          </div>

          <div className="dash-cat-breakdown">
            <div className="dash-cat-label">CATEGORY BREAKDOWN</div>
            <div className="dash-cat-row">
              <span className="dash-cat-name">Essentials</span>
              <div className="dash-cat-bar-bg"><div className="dash-cat-bar-fill" style={{ width: `\${essentialsPct}%` }}></div></div>
              <span className="dash-cat-pct">{essentialsPct}%</span>
            </div>
            <div className="dash-cat-row">
              <span className="dash-cat-name">Lifestyle</span>
              <div className="dash-cat-bar-bg"><div className="dash-cat-bar-fill" style={{ width: `\${lifestylePct}%` }}></div></div>
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
                  <span className="dash-ts-amt">\${housingSpent.toLocaleString()}</span>
                </div>
                <div className="dash-ts-bar-bg"><div className="dash-ts-bar-fill" style={{ width: '80%' }}></div></div>
              </div>
            </div>
            <div className="dash-ts-item">
              <div className="dash-ts-icon"><Utensils size={18} /></div>
              <div className="dash-ts-info">
                <div className="dash-ts-name-row">
                  <span className="dash-ts-name">Food</span>
                  <span className="dash-ts-amt">\${foodSpent.toLocaleString()}</span>
                </div>
                <div className="dash-ts-bar-bg"><div className="dash-ts-bar-fill" style={{ width: '40%' }}></div></div>
              </div>
            </div>
            <div className="dash-ts-item">
              <div className="dash-ts-icon"><Car size={18} /></div>
              <div className="dash-ts-info">
                <div className="dash-ts-name-row">
                  <span className="dash-ts-name">Transport</span>
                  <span className="dash-ts-amt">\${transportSpent.toLocaleString()}</span>
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
                <td><span className="dash-td-badge {t.category === 'Investment' ? 'dark' : ''}">{t.category}</span></td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#111827' }}>\${Math.abs(t.amount).toFixed(2)}</td>
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

function SettingsPage({ userData, onUpdateUser, activeWorkspace, workspaces, onWorkspaceUpdate }) {
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        setIsUploading(true);
        const base64Avatar = reader.result;
        const res = await api.updateAvatar({ avatar: base64Avatar });
        onUpdateUser(res.data);
      } catch (error) {
        console.error('Failed to update avatar:', error);
        alert('Failed to upload profile picture.');
      } finally {
        setIsUploading(false);
      }
    };
  };
  return (
    <div className="set-page-container">
      <div className="set-header">
        <h1 className="set-title">Settings</h1>
        <p className="set-subtitle">Configure your Monyx experience and manage your financial data privacy.</p>
      </div>

      <div className="set-card">
        <div className="set-card-header">
          <User className="set-card-header-icon" size={16} />
          <h2 className="set-card-title">Profile</h2>
        </div>
        
        <div className="set-profile-top">
          <div className="set-avatar-wrapper" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer', opacity: isUploading ? 0.5 : 1 }}>
            {userData?.avatar ? (
              <img src={userData.avatar} alt="Avatar" className="set-avatar-circle" style={{ objectFit: 'cover' }} />
            ) : (
              <div className="set-avatar-circle">{userData?.name?.charAt(0)?.toUpperCase() || 'A'}</div>
            )}
            <div className="set-avatar-edit"><Settings size={12} /></div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} style={{ display: 'none' }} />
          </div>
          <div className="set-avatar-info">
            <span className="set-avatar-label">AVATAR {isUploading && '(Uploading...)'}</span>
            <span className="set-avatar-sub">Recommended size 400x400px. JPG or PNG.</span>
          </div>
        </div>

        <div className="set-input-grid">
          <div className="set-input-group">
            <span className="set-input-label">FULL NAME</span>
            <input type="text" className="set-input" value={userData?.name || ''} readOnly />
          </div>
          <div className="set-input-group">
            <span className="set-input-label">EMAIL ADDRESS</span>
            <input type="email" className="set-input" value={userData?.email || ''} readOnly />
          </div>
        </div>
      </div>

      <div className="set-card">
        <div className="set-card-header">
          <Bell className="set-card-header-icon" size={16} />
          <h2 className="set-card-title">Notifications</h2>
        </div>

        <div className="set-notif-row">
          <div className="set-notif-info">
            <span className="set-notif-title">Transaction Alerts</span>
            <span className="set-notif-sub">Get notified instantly for every spend or income.</span>
          </div>
          <div className="set-notif-toggles">
            <label className="set-checkbox-label">
              <input type="checkbox" defaultChecked style={{ accentColor: '#111827' }} /> Email
            </label>
            <label className="set-checkbox-label">
              <input type="checkbox" defaultChecked style={{ accentColor: '#111827' }} /> Push
            </label>
          </div>
        </div>
        <div className="set-notif-row">
          <div className="set-notif-info">
            <span className="set-notif-title">Budget Goals</span>
            <span className="set-notif-sub">Receive alerts when you reach 80% and 100% of limits.</span>
          </div>
          <div className="set-notif-toggles">
            <label className="set-checkbox-label">
              <input type="checkbox" defaultChecked style={{ accentColor: '#111827' }} /> Email
            </label>
            <label className="set-checkbox-label">
              <input type="checkbox" /> Push
            </label>
          </div>
        </div>
      </div>

      <div className="set-card">
        <div className="set-card-header">
          <ShieldCheck className="set-card-header-icon" size={16} />
          <h2 className="set-card-title">Security</h2>
        </div>

        <div className="set-sec-row">
          <div className="set-sec-info">
            <span className="set-sec-title">Password</span>
            <span className="set-sec-sub">Update your account credentials</span>
          </div>
          <ChevronRight size={16} color="#9CA3AF" style={{ cursor: 'pointer' }} />
        </div>
        
        <div className="set-sec-row">
          <div className="set-sec-info">
            <span className="set-sec-title">Two-Factor Authentication</span>
            <span className="set-sec-sub">Secure your account with 2FA</span>
          </div>
          <div className="set-toggle-switch">
            <div className="set-toggle-knob"></div>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div className="set-avatar-label">ACTIVE SESSIONS</div>
          <div className="set-session-box">
            <div className="set-session-left">
              <div className="set-session-icon">
                <Monitor size={16} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="set-session-name">MacBook Pro - London, UK</span>
                <span className="set-session-status">Current Session</span>
              </div>
            </div>
            <button className="set-btn-revoke">Revoke</button>
          </div>
        </div>
      </div>

      <div className="set-card">
        <div className="set-card-header">
          <CreditCard className="set-card-header-icon" size={16} />
          <h2 className="set-card-title">Subscription</h2>
        </div>

        <div className="set-sub-banner">
          <div>
            <div className="set-sub-label">CURRENT PLAN</div>
            <div className="set-sub-title">Professional</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="set-sub-label">NEXT BILLING</div>
            <div className="set-sub-title" style={{ fontSize: 14 }}>Oct 12, 2024</div>
          </div>
        </div>

        <div className="set-sub-row">
          <span className="set-sub-key">Monthly cost</span>
          <span className="set-sub-val">$12.00</span>
        </div>
        <div className="set-sub-row">
          <span className="set-sub-key">Payment Method</span>
          <span className="set-sub-val"><CreditCard size={14} /> Visa ending in 4242</span>
        </div>

        <div className="set-sub-actions">
          <div className="set-btn-outline">Manage Billing</div>
          <div className="set-btn-outline">Change Plan</div>
        </div>
      </div>

      <div className="set-split-grid">
        <div className="set-card" style={{ marginBottom: 0 }}>
          <h2 className="set-card-title" style={{ marginBottom: 4 }}>General Preferences</h2>
          <p className="set-pref-desc">Personalize how you interact with your financial dashboard.</p>
          
          <div className="set-input-grid">
            <div className="set-input-group">
              <span className="set-input-label">DEFAULT CURRENCY</span>
              <div style={{ position: 'relative' }}>
                <select className="set-input" style={{ appearance: 'none' }}>
                  <option>USD ($) - US Dollar</option>
                </select>
                <ChevronDown size={14} color="#6B7280" style={{ position: 'absolute', right: 12, top: 12, pointerEvents: 'none' }} />
              </div>
            </div>
            <div className="set-input-group">
              <span className="set-input-label">DATE FORMAT</span>
              <div style={{ position: 'relative' }}>
                <select className="set-input" style={{ appearance: 'none' }}>
                  <option>MM/DD/YYYY</option>
                </select>
                <ChevronDown size={14} color="#6B7280" style={{ position: 'absolute', right: 12, top: 12, pointerEvents: 'none' }} />
              </div>
            </div>
          </div>

          <div className="set-dark-mode-box">
            <div className="set-dark-mode-info">
              <div className="set-session-icon" style={{ background: '#FFFFFF' }}><Settings size={14} /></div>
              <div className="set-dark-mode-text">
                <span className="set-dark-mode-title">Dark Mode</span>
                <span className="set-dark-mode-sub">Reduce eye strain in low-light environments.</span>
              </div>
            </div>
            <div className="set-toggle-switch off">
              <div className="set-toggle-knob"></div>
            </div>
          </div>
        </div>

        <div className="set-mgmt-card">
          <h2 className="set-mgmt-title">Management</h2>
          <p className="set-mgmt-desc">Centralized control for your entities.</p>
          <div style={{ flex: 1 }}></div>
          <button className="set-mgmt-btn">
            Manage Accounts <ArrowRight size={14} />
          </button>
          <button className="set-mgmt-btn dark">
            Manage Categories <Activity size={14} />
          </button>
        </div>
      </div>

      <div className="set-card">
        <div className="set-privacy-header">
          <div>
            <h2 className="set-card-title" style={{ marginBottom: 4 }}>Data & Privacy</h2>
            <p className="set-pref-desc" style={{ marginBottom: 0 }}>Your financial data is your own. You can export your entire transaction history or permanently remove your presence from Monyx at any time.</p>
          </div>
          <button className="set-privacy-btn">
            <Download size={12} /> Export Data
          </button>
        </div>

        <div className="set-export-grid">
          <div className="set-export-box">
            <div className="set-export-icon"><Receipt size={16} /></div>
            <div className="set-export-info">
              <span className="set-export-title">Standard Export (.csv)</span>
              <span className="set-export-sub">Universal format compatible with Excel and Google Sheets.</span>
              <span className="set-export-action">Download CSV</span>
            </div>
          </div>
          <div className="set-export-box">
            <div className="set-export-icon"><Receipt size={16} /></div>
            <div className="set-export-info">
              <span className="set-export-title">Monthly Report (.pdf)</span>
              <span className="set-export-sub">Beautifully formatted document for tax and record keeping.</span>
              <span className="set-export-action">Generate PDF</span>
            </div>
          </div>
        </div>

        <div className="set-destructive-zone">
          <div className="set-dest-left">
            <div className="set-dest-icon"><AlertCircle size={16} /></div>
            <div className="set-dest-info">
              <span className="set-dest-title">Destructive Zone</span>
              <span className="set-dest-sub">Deleting your account is irreversible. All synced bank data, custom categories, and historical logs will be wiped.</span>
            </div>
          </div>
          <button className="set-btn-delete">Delete Account</button>
        </div>
      </div>

      <div className="set-footer-grid">
        <div className="set-footer-card">
          <div className="set-pg-icon"><ShieldCheck size={16} /></div>
          <div className="set-pg-title">Privacy Guard</div>
          <div className="set-pg-desc">Your data is encrypted with AES-256 bit protocols. We never sell your personal information.</div>
        </div>
        <div className="set-footer-card" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div className="set-v-label">CURRENT VERSION</div>
            <div className="set-v-val">v2.4.0 (Build 902)</div>
          </div>
          <div className="set-v-links">
            <span style={{ cursor: 'pointer' }}>Release Notes</span>
            <span style={{ cursor: 'pointer' }}>Check for Updates</span>
          </div>
        </div>
      </div>

      <div className="set-copyright">
        © 2024 Monyx Inc. All rights reserved. <a href="#">Terms</a> | <a href="#">Privacy</a>
      </div>
    </div>
  );
}

function Topbar({ activePage, onInvite, userData }) {
  let links = [];
  if (activePage === 'transactions') links = ['Transactions'];
  else if (activePage === 'budgets') links = ['Budgets'];
  else if (activePage === 'dashboard') links = ['Dashboard'];
  else if (activePage === 'reports') links = ['Reports'];
  else if (activePage === 'settings') links = ['Settings'];
  else links = ['Dashboard'];

  const [showNotifs, setShowNotifs] = React.useState(false);
  const notifsRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifsRef.current && !notifsRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="app-topbar" style={{ padding: '24px 40px', height: '80px', position: 'sticky', top: 0, zIndex: 10, background: '#FFFFFF', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="topbar-search" style={{ background: '#F9FAFB', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: '8px', width: '320px', border: '1px solid #E5E7EB' }}>
        <Search size={16} color="#9CA3AF" />
        <input type="text" placeholder="Search reports or data..." style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, width: '100%', color: '#374151' }} />
      </div>
      <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div ref={notifsRef} style={{ position: 'relative', cursor: 'pointer', paddingRight: '12px' }} onClick={() => setShowNotifs(!showNotifs)}>
          <Bell size={20} color="#111827" />
          <div style={{ position: 'absolute', top: -2, right: 10, width: 6, height: 6, background: '#EF4444', borderRadius: '50%', border: '1.5px solid #FFF' }}></div>
          
          {showNotifs && (
            <div style={{ position: 'absolute', top: '40px', right: 0, width: '300px', background: '#FFF', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB', zIndex: 100, overflow: 'hidden' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #E5E7EB', fontWeight: 'bold', fontSize: '14px', color: '#111827' }}>Notifications</div>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#1F2937' }}>Welcome to Monyx! 🎉</span>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>Your account has been set up successfully.</span>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#1F2937' }}>Security Alert</span>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>New login from Chrome on Mac OS.</span>
              </div>
              <div style={{ padding: '12px', background: '#F9FAFB', textAlign: 'center', fontSize: '12px', color: '#4F46E5', fontWeight: '600', cursor: 'pointer', borderTop: '1px solid #E5E7EB' }}>
                Mark all as read
              </div>
            </div>
          )}
        </div>
        <div style={{ width: '1px', height: '32px', background: '#E5E7EB' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{userData?.name || 'Alex Thompson'}</span>
          </div>
          {userData?.avatar ? (
            <img 
              src={userData.avatar} 
              alt="User Avatar" 
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid #E5E7EB' }} 
            />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E0E7FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 16 }}>
              {userData?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─── Invite Member Modal ─────────────────────── */
function InviteMemberModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const workspaceId = localStorage.getItem('wf_workspace');
      await inviteToWorkspace(workspaceId, email);
      alert(`Invitation sent to ${email}!`);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error inviting member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ background: '#fff', padding: 32, borderRadius: 12, width: 400 }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: 20 }}>Invite Member</h3>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Send an invitation link to a family member or teammate.</p>
        <form onSubmit={handleInvite}>
          <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: 8, marginBottom: 24, boxSizing: 'border-box' }} required />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-dark" disabled={loading}>{loading ? 'Inviting...' : 'Send Invite'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Dashboard App Shell ────────────────────── */
function DashboardApp({ onLogout, userData, onUpdateUser }) {
  const [activePage, setActivePage] = useState('dashboard');
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [globalEditingTxn, setGlobalEditingTxn] = useState(null);

  useEffect(() => {
    getWorkspaces().then(({ data }) => {
      setWorkspaces(data);
      const savedWs = localStorage.getItem('wf_workspace');
      const ownedWs = data.find(w => w.owner?._id === userData?.id || w.owner === userData?.id);
      
      if (savedWs && data.find(w => w._id === savedWs)) {
        setActiveWorkspace(data.find(w => w._id === savedWs));
      } else if (ownedWs) {
        setActiveWorkspace(ownedWs);
        localStorage.setItem('wf_workspace', ownedWs._id);
      } else if (data.length > 0) {
        setActiveWorkspace(data[0]);
        localStorage.setItem('wf_workspace', data[0]._id);
      }
    }).catch(console.error);
  }, [userData]);

  const handleSwitchWorkspace = (ws) => {
    setActiveWorkspace(ws);
    localStorage.setItem('wf_workspace', ws._id);
    // Force reload to refetch data for new workspace
    window.location.reload();
  };

  const renderPage = () => {
    if (activePage === 'transactions') return <TransactionsPage activeWorkspace={activeWorkspace} />;
    if (activePage === 'dashboard')    return <DashboardContent onInvite={() => setShowInviteModal(true)} activeWorkspace={activeWorkspace} userData={userData} setActivePage={setActivePage} setGlobalEditingTxn={setGlobalEditingTxn} />;
    if (activePage === 'accounts')     return <AccountsPage activeWorkspace={activeWorkspace} />;
    if (activePage === 'budgets')      return <BudgetsPage activeWorkspace={activeWorkspace} />;
    if (activePage === 'reports')      return <ReportsPage activeWorkspace={activeWorkspace} />;
    if (activePage === 'settings')     return <SettingsPage userData={userData} onUpdateUser={onUpdateUser} activeWorkspace={activeWorkspace} workspaces={workspaces} onWorkspaceUpdate={(ws) => { setActiveWorkspace(ws); setWorkspaces(workspaces.map(w => w._id === ws._id ? ws : w)); }} />;
    return <div className="empty-state"><h3>Coming Soon</h3></div>;
  };

  return (
    <div className="app-shell">
      <Sidebar 
        active={activePage} 
        setActive={setActivePage} 
        onLogout={onLogout} 
        userName={userData?.name}
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        onSwitchWorkspace={handleSwitchWorkspace}
        onAddTransaction={() => setGlobalEditingTxn({ amount: 0, category: 'Tech' })}
      />
      <main key={activeWorkspace?._id || 'none'} className="app-main">
        <Topbar activePage={activePage} onInvite={() => setShowInviteModal(true)} userData={userData} />
        {renderPage()}
      </main>
      {showInviteModal && <InviteMemberModal onClose={() => setShowInviteModal(false)} />}
      {globalEditingTxn && <EditDrawer txn={globalEditingTxn} activeWorkspace={activeWorkspace} onClose={() => setGlobalEditingTxn(null)} onSave={() => window.location.reload()} />}
    </div>
  );
}

function LoginPage({ onLogin, onBack }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showMockGoogle, setShowMockGoogle] = useState(false);
  const [mockEmail, setMockEmail] = useState('');
  const [mockName, setMockName]   = useState('');

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '123456-dummy.apps.googleusercontent.com';
  const isGoogleConfigured = clientId && clientId !== '123456-dummy.apps.googleusercontent.com' && clientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE' && !clientId.includes('YOUR_GOOGLE_CLIENT_');

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const { data } = await apiGoogleLogin(tokenResponse.access_token);
        saveAuth(data.token, data.user);
        onLogin(data.user);
      } catch (err) {
        setError(err.response?.data?.message || 'Google Login failed.');
      } finally { setLoading(false); }
    },
    onError: () => setError('Google Sign-In was unsuccessful.')
  });

  const handleMockGoogleLogin = async (mEmail, mName) => {
    setShowMockGoogle(false);
    setLoading(true);
    try {
      const mockToken = `mock_google_token_email=${encodeURIComponent(mEmail)}&name=${encodeURIComponent(mName || mEmail.split('@')[0])}`;
      const { data } = await apiGoogleLogin(mockToken);
      saveAuth(data.token, data.user);
      onLogin(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Google Login failed.');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        if (!name || !email || !password) { setError('Please fill in all fields.'); setLoading(false); return; }
        const { data } = await apiRegister(name, email, password);
        saveAuth(data.token, data.user);
        onLogin(data.user);
      } else {
        if (!email || !password) { setError('Please fill in all fields.'); setLoading(false); return; }
        const { data } = await apiLogin(email, password);
        saveAuth(data.token, data.user);
        onLogin(data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <header className="login-topbar">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={onBack}>
          <div className="logo-icon"><Wallet size={16} color="#fff" /></div>WalletFlow
        </div>
        <button className="btn btn-outline" onClick={onBack}>Get Started</button>
      </header>
      <div className="login-body">
        <div className="login-card">
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
              <div><strong>Bank-grade 256-bit encryption</strong><span>Your data is secured by industry-leading protocols.</span></div>
            </div>
          </div>
          <div className="login-right">
            <div className="login-form-wrap">
              <h1 className="login-title">{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
              <p className="login-sub">{isRegister ? 'Sign up to start tracking your finances.' : 'Log in to manage your financial portfolio.'}</p>
              {error && <div className="login-error"><AlertCircle size={15} />{error}</div>}
              <form onSubmit={handleSubmit} className="login-form">
                {isRegister && (
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <div className="input-wrap"><User size={16} className="input-icon" /><input id="name" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} /></div>
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrap"><Mail size={16} className="input-icon" /><input id="email" type="email" placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
                </div>
                <div className="form-group">
                  <div className="label-row"><label htmlFor="password">Password</label>{!isRegister && <a href="#" className="forgot-link" onClick={e => { e.preventDefault(); alert('Password reset links will be configured soon.'); }}>Forgot Password?</a>}</div>
                  <div className="input-wrap">
                    <Lock size={16} className="input-icon" />
                    <input id="password" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                    <button type="button" className="eye-btn" onClick={() => setShowPass(v => !v)} tabIndex={-1}>{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                </div>
                <button type="submit" className={`btn btn-dark login-submit ${loading ? 'loading' : ''}`} disabled={loading}>
                  {loading ? <span className="spinner" /> : <>{isRegister ? 'Sign Up' : 'Log In'} <ArrowRight size={16} /></>}
                </button>
              </form>
              <div className="login-divider"><span>Or continue with</span></div>
              <button 
                type="button" 
                className="btn-google" 
                onClick={() => {
                  if (isGoogleConfigured) {
                    googleLogin();
                  } else {
                    setShowMockGoogle(true);
                  }
                }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.8 2.4 30.3 0 24 0 14.8 0 6.9 5.4 3 13.3l7.8 6c1.8-5.4 6.9-9.8 13.2-9.8z"/>
                  <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.9-2.2 5.4-4.7 7l7.3 5.7c4.3-4 6.8-9.9 6.8-16.7z"/>
                  <path fill="#FBBC05" d="M10.8 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7L2.5 13.3A24 24 0 0 0 0 24c0 3.8.9 7.4 2.5 10.7l8.3-6z"/>
                  <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2.2 1.5-5 2.4-8.6 2.4-6.3 0-11.4-4.3-13.2-9.8l-7.8 6C6.9 42.6 14.8 48 24 48z"/>
                </svg>
                Sign in with Google
              </button>
              <p className="login-signup">
                {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                <a href="#" onClick={e => { e.preventDefault(); setIsRegister(!isRegister); setError(''); }}>
                  {isRegister ? 'Log In' : 'Sign Up'}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <footer className="login-footer">
        <div className="logo" style={{ cursor:'pointer' }} onClick={onBack}><div className="logo-icon" style={{ background:'#6b7280' }}><Wallet size={14} color="#fff" /></div>WalletFlow</div>
        <div className="login-footer-links"><a href="#">Privacy Policy</a><a href="#">Terms of Service</a><a href="#">Security</a></div>
        <span>© 2024 WalletFlow Inc. All rights reserved.</span>
      </footer>

      {showMockGoogle && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999, fontFamily: 'Roboto, sans-serif'
        }}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: 400, borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)', padding: 32, boxSizing: 'border-box',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowMockGoogle(false)}
              style={{
                position: 'absolute', top: 16, right: 16, border: 'none',
                background: 'none', cursor: 'pointer', fontSize: 18, color: '#5f6368'
              }}
            >✕</button>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginBottom: 8 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.47-.63-.82-1.37-1.04-2.18z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <h2 style={{ fontSize: 22, fontWeight: 500, margin: '0 0 8px 0', color: '#202124' }}>Sign in with Google</h2>
              <p style={{ fontSize: 14, color: '#5f6368', margin: 0 }}>to continue to WalletFlow</p>
            </div>
            
            <div style={{ borderBottom: '1px solid #dadce0', margin: '20px 0' }}></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                onClick={() => handleMockGoogleLogin('alex@walletflow.com', 'Alex Chen')}
                style={{
                  display: 'flex', alignItems: 'center', padding: '12px 16px',
                  border: '1px solid #dadce0', borderRadius: 4, background: '#fff',
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s',
                  width: '100%'
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: '#f1f3f4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginRight: 12, fontWeight: 'bold', color: '#1a73e8'
                }}>A</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#3c4043' }}>Alex Chen</div>
                  <div style={{ fontSize: 12, color: '#5f6368' }}>alex@walletflow.com</div>
                </div>
              </button>

              <button 
                onClick={() => handleMockGoogleLogin('aishwinjindal907@gmail.com', 'Aishwin Jindal')}
                style={{
                  display: 'flex', alignItems: 'center', padding: '12px 16px',
                  border: '1px solid #dadce0', borderRadius: 4, background: '#fff',
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s',
                  width: '100%'
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: '#e6f4ea',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginRight: 12, fontWeight: 'bold', color: '#137333'
                }}>AJ</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#3c4043' }}>Aishwin Jindal</div>
                  <div style={{ fontSize: 12, color: '#5f6368' }}>aishwinjindal907@gmail.com</div>
                </div>
              </button>

              <button 
                onClick={() => handleMockGoogleLogin('aishcoder@gmail.com', 'Aishcoder')}
                style={{
                  display: 'flex', alignItems: 'center', padding: '12px 16px',
                  border: '1px solid #dadce0', borderRadius: 4, background: '#fff',
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s',
                  width: '100%'
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: '#feebec',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginRight: 12, fontWeight: 'bold', color: '#c5221f'
                }}>AC</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#3c4043' }}>Aishcoder</div>
                  <div style={{ fontSize: 12, color: '#5f6368' }}>aishcoder@gmail.com</div>
                </div>
              </button>
              
              <div style={{ borderBottom: '1px solid #f1f3f4', margin: '8px 0' }}></div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#5f6368' }}>Or Enter Custom Gmail Account:</label>
                <input 
                  type="email" 
                  placeholder="name@gmail.com" 
                  value={mockEmail}
                  onChange={e => setMockEmail(e.target.value)}
                  style={{
                    padding: 10, border: '1px solid #dadce0', borderRadius: 4,
                    fontSize: 14, outline: 'none'
                  }}
                />
                <input 
                  type="text" 
                  placeholder="Your Name (Optional)" 
                  value={mockName}
                  onChange={e => setMockName(e.target.value)}
                  style={{
                    padding: 10, border: '1px solid #dadce0', borderRadius: 4,
                    fontSize: 14, outline: 'none'
                  }}
                />
                <button 
                  onClick={() => {
                    if (mockEmail) {
                      handleMockGoogleLogin(mockEmail, mockName);
                    } else {
                      alert('Please enter a mock email!');
                    }
                  }}
                  style={{
                    padding: '10px 16px', background: '#1a73e8', color: '#fff',
                    border: 'none', borderRadius: 4, cursor: 'pointer',
                    fontSize: 14, fontWeight: 500, marginTop: 4
                  }}
                >
                  Sign in with this account
                </button>
              </div>
            </div>
            
            <p style={{ fontSize: 11, color: '#5f6368', textAlign: 'center', marginTop: 24, lineHeight: '1.4' }}>
              This is a simulated Google Auth portal. Setup <code>VITE_GOOGLE_CLIENT_ID</code> in <code>client/.env</code> to connect real Google accounts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

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
