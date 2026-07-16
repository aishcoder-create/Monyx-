import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowRight, Zap, ShieldCheck, AlertCircle, Download,
  Receipt, Plus, Search, SlidersHorizontal, ChevronLeft, ChevronRight,
  Loader2, Trash2, Filter, CreditCard, DollarSign, Utensils, Car,
  Tv, Dumbbell, Monitor, Landmark, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, RefreshCw, FileText, MoreVertical
} from 'lucide-react';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from '../services/api.js';
import * as api from '../services/api';
import '../index.css';
import PageSpinner from '../components/PageSpinner.jsx';
import EditDrawer from '../components/EditDrawer.jsx';

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

export default function TransactionsPage({ activeWorkspace }) {
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
