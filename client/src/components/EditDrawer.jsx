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
} from '../services/api.js';
import * as api from '../services/api';
import '../index.css';

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

export default function EditDrawer({ txn, activeWorkspace, onClose, onSave }) {
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
