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

export default function CreateBudgetModal({ activeWorkspace, onClose, onSaved }) {
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
