import React, { useState, useEffect, useCallback } from 'react';
import {
  PiggyBank, Plus, Trash2, Loader2, Target, TrendingUp, TrendingDown,
  DollarSign, ChevronDown, MoreVertical, RefreshCw, CheckCircle2,
  ShoppingCart, Utensils, Car, Tv, Activity, Monitor, Zap, Coffee, AlertCircle
} from 'lucide-react';
import { getBudgets, addBudget, updateBudget, deleteBudget, getTransactions } from '../services/api.js';
import * as api from '../services/api';
import '../index.css';
import PageSpinner from '../components/PageSpinner.jsx';
import CreateBudgetModal from '../components/CreateBudgetModal.jsx';

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

export default function BudgetsPage({ activeWorkspace }) {
  const [budgets, setBudgets] = useState([]);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const load = useCallback(async () => {
    if (!activeWorkspace) return;
    try {
      setLoading(true);
      const [budRes, txnRes] = await Promise.all([
        api.getBudgets(activeWorkspace._id),
        api.getTransactions(activeWorkspace._id)
      ]);
      setBudgets(budRes.data);
      setTxns(txnRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace]);

  useEffect(() => { load(); }, [load]);

  const getSpentForCategory = (catName) => {
    return txns
      .filter(t => t.category && t.category.toLowerCase() === catName.toLowerCase() && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const getCatIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('grocery') || n.includes('food') || n.includes('market')) return <ShoppingCart size={20} />;
    if (n.includes('din') || n.includes('restaurant') || n.includes('cafe')) return <Utensils size={20} />;
    if (n.includes('transport') || n.includes('uber') || n.includes('car') || n.includes('fuel')) return <Car size={20} />;
    if (n.includes('entertainment') || n.includes('netflix') || n.includes('tv') || n.includes('movie')) return <Tv size={20} />;
    if (n.includes('health') || n.includes('medical') || n.includes('gym')) return <Activity size={20} />;
    if (n.includes('tech') || n.includes('software') || n.includes('computer')) return <Monitor size={20} />;
    if (n.includes('util') || n.includes('bill') || n.includes('power') || n.includes('water')) return <Zap size={20} />;
    return <Coffee size={20} />;
  };

  const getIconClass = (name) => {
    const n = name.toLowerCase();
    if (n.includes('grocery')) return 'groceries';
    if (n.includes('din') || n.includes('food')) return 'dining';
    if (n.includes('transport')) return 'transport';
    if (n.includes('entertainment')) return 'entertainment';
    if (n.includes('health')) return 'health';
    return 'default';
  };

  const handleDeleteBudget = async (id) => {
    if (!confirm('Are you sure you want to delete this budget limit?')) return;
    try {
      await api.deleteBudget(id, activeWorkspace._id);
      load();
    } catch (err) {
      alert('Failed to delete budget limit.');
    }
  };

  const totalLimit = budgets.reduce((sum, b) => sum + (b.limit || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + getSpentForCategory(b.name), 0);
  const totalRemaining = Math.max(0, totalLimit - totalSpent);
  const utilizationPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  return (
    <div className="budget-page-new">
      <div className="budget-header-top">
        <div className="budget-title-area">
          <h1 className="budget-title-new">Monthly Budget</h1>
          <span className="budget-date-badge">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}</span>
        </div>
        <div className="budget-header-actions">
          <button className="budget-btn-create" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Create Budget
          </button>
          <button className="budget-btn-icon" onClick={() => load()}>
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className="budget-top-grid">
        <div className="budget-card">
          <div className="budget-card-label">CUMULATIVE PERFORMANCE</div>
          <h2 className="budget-card-title">Budget vs Actual</h2>
          <div className="budget-chart-area">
            <div style={{ position: 'absolute', bottom: 32, left: '5%', width: '90%', height: 2, background: '#F3F4F6' }}></div>
            <div style={{ position: 'absolute', bottom: 82, left: '5%', width: '90%', height: 2, background: '#F3F4F6' }}></div>
            <div style={{ position: 'absolute', bottom: 132, left: '5%', width: '90%', height: 2, background: '#F3F4F6' }}></div>
            
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
              <polyline points="0,180 200,140 400,100 600,60" fill="none" stroke="#C7D2FE" strokeWidth="3" />
            </svg>
            
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
              <polyline points="0,180 200,160 400,130 600,110" fill="none" stroke="#111827" strokeWidth="3" />
            </svg>

            <div className="budget-chart-label">WEEK 1</div>
            <div className="budget-chart-label">WEEK 2</div>
            <div className="budget-chart-label">WEEK 3</div>
            <div className="budget-chart-label">WEEK 4</div>
          </div>
          <div className="budget-chart-legend">
            <div className="budget-legend-item">
              <div className="budget-legend-dot allocated"></div> Allocated
            </div>
            <div className="budget-legend-item">
              <div className="budget-legend-dot spent"></div> Spent
            </div>
          </div>
        </div>

        <div className="budget-metric-col">
          <div className="budget-card">
            <div className="budget-card-label">REMAINING TO SPEND</div>
            <div className="budget-metric-val">${totalRemaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div className="budget-metric-trend">
              <TrendingUp size={14} /> {100 - utilizationPct}% remaining
            </div>
          </div>

          <div className="budget-card">
            <div className="budget-metric-limit-row">
              <div className="budget-card-label">OVERALL MONTHLY BUDGET</div>
              <button className="budget-limit-btn" onClick={() => setShowAddModal(true)}>Set Limit</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: 4 }}>
              <div className="budget-metric-val" style={{ marginBottom: 0 }}>${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              <div className="budget-spent-sub">spent of<br/>${totalLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="budget-progress-bar-bg">
              <div className="budget-progress-bar-fill" style={{ width: `${Math.min(100, utilizationPct)}%` }}></div>
            </div>
            <div className="budget-util-row">
              <div className="budget-util-status"><CheckCircle2 size={14} /> {utilizationPct}% Utilized</div>
              <div className="budget-util-rem">${totalRemaining.toLocaleString('en-US', { minimumFractionDigits: 2 })} remaining</div>
            </div>
          </div>
        </div>
      </div>

      <div className="budget-cat-section-header">
        <h2 className="budget-cat-section-title">Category Breakdown</h2>
        <div className="budget-cat-actions">
          <button className="budget-cat-action-btn" onClick={() => load()}>Refresh</button>
        </div>
      </div>

      <div className="budget-cat-grid">
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#6B7280' }}>Loading budgets...</div>
        ) : budgets.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#6B7280' }}>No spending limits defined yet. Create your first budget limit!</div>
        ) : budgets.map(b => {
          const spent = getSpentForCategory(b.name);
          const pct = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
          const isOver = pct > 100;
          const left = isOver ? spent - b.limit : b.limit - spent;
          const iconName = getIconClass(b.name);
          
          return (
            <div key={b._id} className="budget-cat-card">
              <div className="budget-cat-header-row">
                <div className={`budget-cat-icon ${iconName}`}>
                  {getCatIcon(b.name)}
                </div>
                <div className="budget-cat-title-col">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="budget-cat-name">{b.name}</div>
                    <button className="budget-limit-btn" onClick={() => handleDeleteBudget(b._id)} style={{ fontSize: 10, color: '#DC2626' }}>Remove</button>
                  </div>
                  {isOver ? (
                    <span className="budget-badge-overlimit">OVER LIMIT</span>
                  ) : (
                    <span className="budget-badge-ontrack">ON TRACK</span>
                  )}
                </div>
              </div>
              
              <div className="budget-cat-spent-limit">
                <div className="budget-cat-spent">Spent: <strong>${spent.toFixed(2)}</strong></div>
                <div className="budget-cat-limit">Limit: ${b.limit.toFixed(2)}</div>
              </div>
              
              <div className="budget-cat-bar-bg">
                <div className={`budget-cat-bar-fill ${isOver ? 'danger' : 'neutral'}`} style={{ width: `${Math.min(100, pct)}%` }}></div>
              </div>
              
              <div className="budget-cat-footer">
                <div className={`budget-cat-footer-left ${isOver ? 'danger' : ''}`}>
                  {isOver ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={10} /> -${left.toFixed(2)} over</span>
                  ) : (
                    `$${left.toFixed(2)} left`
                  )}
                </div>
                <div className="budget-cat-footer-right">
                  {pct}% used
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="budget-cat-add-card" onClick={() => setShowAddModal(true)}>
          <div className="budget-add-icon">
            <Plus size={16} />
          </div>
          <div className="budget-add-title">Add Category</div>
          <div className="budget-add-sub">Define a new spending limit</div>
        </div>
      </div>

      {showAddModal && (
        <CreateBudgetModal 
          activeWorkspace={activeWorkspace} 
          onClose={() => setShowAddModal(false)} 
          onSaved={() => { setShowAddModal(false); load(); }} 
        />
      )}
    </div>
  );
}
