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

export default function Topbar({ activePage, onInvite, userData }) {
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
