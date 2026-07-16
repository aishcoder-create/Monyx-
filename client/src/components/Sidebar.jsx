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

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',        icon: LayoutDashboard },
  { id: 'accounts',     label: 'Accounts',         icon: Landmark },
  { id: 'transactions', label: 'Transactions',     icon: Receipt },
  { id: 'budgets',      label: 'Budgets',          icon: PiggyBank },
  { id: 'settings',     label: 'Settings',         icon: Settings },
];

export default function Sidebar({ active, setActive, onLogout, userName, workspaces, activeWorkspace, onSwitchWorkspace, onAddTransaction }) {
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
