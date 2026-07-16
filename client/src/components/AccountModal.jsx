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

export default function AccountModal({ activeWorkspace, onClose, onSaved }) {
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
