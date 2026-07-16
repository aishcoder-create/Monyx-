import React, { useState, useEffect, useCallback } from 'react';
import {
  getTransactions, addTransaction, updateTransaction, deleteTransaction,
  getBudgets, addBudget, updateBudget, deleteBudget,
  getProfile, updateProfile, changePassword, getDashStats, requestOtp, verifyOtpProfileUpdate,
  getWorkspaces, createWorkspace, inviteToWorkspace,
  getAccounts, addAccount, deleteAccount
} from '../services/api.js';
import * as api from '../services/api';
import '../index.css';

import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';
import EditDrawer from '../components/EditDrawer.jsx';
import InviteMemberModal from '../components/InviteMemberModal.jsx';
import DashboardContent from './DashboardContent.jsx';
import TransactionsPage from './TransactionsPage.jsx';
import AccountsPage from './AccountsPage.jsx';
import BudgetsPage from './BudgetsPage.jsx';
import ReportsPage from './ReportsPage.jsx';
import SettingsPage from './SettingsPage.jsx';


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

export default function DashboardApp({ onLogout, userData, onUpdateUser }) {
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
