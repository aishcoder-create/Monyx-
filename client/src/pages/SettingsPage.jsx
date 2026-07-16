import React, { useState, useEffect } from 'react';
import {
  Settings, User, Lock, Mail, Eye, EyeOff, AlertCircle, Users,
  UserPlus, Loader2, CheckCircle2, Bell, Globe, Trash2, RefreshCw, Shield,
  ChevronRight, ChevronDown, Monitor, Activity, CreditCard, ShieldCheck,
  Receipt, Download, ArrowRight
} from 'lucide-react';
import {
  getProfile, updateProfile, changePassword, requestOtp, verifyOtpProfileUpdate,
  getWorkspaces, createWorkspace, inviteToWorkspace
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

export default function SettingsPage({ userData, onUpdateUser, activeWorkspace, workspaces, onWorkspaceUpdate }) {
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
