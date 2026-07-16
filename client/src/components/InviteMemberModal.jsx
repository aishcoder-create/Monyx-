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

export default function InviteMemberModal({ onClose }) {
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
