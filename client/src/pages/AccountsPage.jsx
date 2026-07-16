import React, { useState, useEffect, useCallback } from 'react';
import {
  Landmark, Plus, Trash2, Loader2, CreditCard, DollarSign, PiggyBank,
  ArrowUpRight, ArrowDownRight, RefreshCw, Wallet, ArrowLeftRight, ArrowRight, AlertCircle
} from 'lucide-react';
import { getAccounts, addAccount, deleteAccount } from '../services/api.js';
import * as api from '../services/api';
import '../index.css';
import PageSpinner from '../components/PageSpinner.jsx';
import AccountModal from '../components/AccountModal.jsx';

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

export default function AccountsPage({ activeWorkspace }) {
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
