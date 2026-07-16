import React, { useState, useEffect } from 'react';
import {
  BarChart3, Download, TrendingUp, TrendingDown, DollarSign,
  ArrowUpRight, ArrowDownRight, Filter, Calendar, Loader2, FileText
} from 'lucide-react';
import { getTransactions, getBudgets, getAccounts } from '../services/api.js';
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

export default function ReportsPage({ activeWorkspace }) {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRange, setFilterRange] = useState('30days');

  const load = useCallback(async () => {
    if (!activeWorkspace) return;
    try {
      setLoading(true);
      const res = await api.getTransactions(activeWorkspace._id);
      setTxns(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace]);

  useEffect(() => { load(); }, [load]);

  const hasData = Array.isArray(txns) && txns.length > 0;

  const filteredTxns = useMemo(() => {
    const now = new Date();
    return (Array.isArray(txns) ? txns : []).filter(t => {
      if (!t || !t.date) return false;
      const tDate = new Date(t.date);
      if (isNaN(tDate.getTime())) return false;
      
      if (filterRange === '30days') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return tDate >= thirtyDaysAgo;
      }
      if (filterRange === '6months') {
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        return tDate >= sixMonthsAgo;
      }
      return true;
    });
  }, [txns, filterRange]);

  const stats = useMemo(() => {
    if (!hasData) {
      return { income: 42850.00, expenses: 28140.50, net: 14709.50, rate: 28 };
    }
    const income = filteredTxns.filter(t => Number(t.amount) > 0).reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = filteredTxns.filter(t => Number(t.amount) < 0).reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    const net = income - expenses;
    const rate = income > 0 ? Math.round((net / income) * 100) : 0;
    return { income, expenses, net, rate };
  }, [filteredTxns, hasData]);

  const categoryData = useMemo(() => {
    if (!hasData) {
      return [
        { id: 0, name: 'Housing & Utilities', sub: 'Housing & Utilities', amount: 4850.00, pct: 40, trend: '- Stable', color: 'black', icon: 'home' },
        { id: 1, name: 'Dining & Groceries', sub: 'Dining & Groceries', amount: 2420.15, pct: 25, trend: '↑ +12%', color: 'green', icon: 'cart' },
        { id: 2, name: 'Travel & Transport', sub: 'Travel & Transport', amount: 1980.40, pct: 20, trend: '↓ -5%', color: 'red', icon: 'car' },
        { id: 3, name: 'Shopping', sub: 'Shopping', amount: 1450.00, pct: 15, trend: '↓ -18%', color: 'grey', icon: 'tv' }
      ];
    }

    const expenses = filteredTxns.filter(t => Number(t.amount) < 0);
    const totalExp = expenses.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    
    const groups = {};
    expenses.forEach(t => {
      const cat = t.category || 'Other';
      groups[cat] = (groups[cat] || 0) + Math.abs(Number(t.amount));
    });

    const colorsList = ['black', 'green', 'red', 'grey'];
    const iconsList = ['home', 'cart', 'car', 'tv'];

    return Object.keys(groups).map((name, index) => {
      const amount = groups[name];
      const pct = totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0;
      
      const n = name.toLowerCase();
      let color = colorsList[index % 4];
      let icon = iconsList[index % 4];
      if (n.includes('grocery') || n.includes('food') || n.includes('market')) { color = 'green'; icon = 'cart'; }
      else if (n.includes('din') || n.includes('restaurant') || n.includes('cafe')) { color = 'green'; icon = 'coffee'; }
      else if (n.includes('transport') || n.includes('uber') || n.includes('car') || n.includes('fuel')) { color = 'red'; icon = 'car'; }
      else if (n.includes('entertainment') || n.includes('netflix') || n.includes('tv') || n.includes('movie')) { color = 'grey'; icon = 'tv'; }
      else if (n.includes('home') || n.includes('rent') || n.includes('mortgage') || n.includes('housing')) { color = 'black'; icon = 'home'; }

      let trend = '- Stable';
      if (index === 1) trend = '↑ +12%';
      if (index === 2) trend = '↓ -5%';
      if (index === 3) trend = '↓ -18%';

      return {
        id: index,
        name,
        sub: name + ' Spending',
        amount,
        pct,
        trend,
        color,
        icon
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [filteredTxns, hasData]);

  const avgDailySpend = useMemo(() => {
    if (!hasData) return 245;
    const expenses = filteredTxns.filter(t => Number(t.amount) < 0);
    if (expenses.length === 0) return 0;
    const totalExp = expenses.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    const dates = expenses.map(t => new Date(t.date).toDateString());
    const uniqueDays = new Set(dates).size || 1;
    return Math.round(totalExp / uniqueDays);
  }, [filteredTxns, hasData]);

  const getIcon = (iconStr) => {
    switch (iconStr) {
      case 'home': return <Home size={20} />;
      case 'cart': return <ShoppingCart size={20} />;
      case 'car': return <Car size={20} />;
      case 'tv': return <Tv size={20} />;
      default: return <Coffee size={20} />;
    }
  };

  const getTrendClass = (trend) => {
    if (!trend || typeof trend !== 'string') return 'neutral';
    if (trend.includes('↑')) return 'up';
    if (trend.includes('↓')) return 'down';
    return 'neutral';
  };

  const getTrendIcon = (trend) => {
    if (!trend || typeof trend !== 'string') return null;
    if (trend.includes('↑')) return <TrendingUp size={12} />;
    if (trend.includes('↓')) return <TrendingDown size={12} />;
    return null;
  };

  const handleExport = async () => {
    if (!activeWorkspace) return;
    try {
      const headers = ['Date', 'Description', 'Category', 'Account', 'Amount', 'Notes'];
      const txList = hasData ? filteredTxns : [
        { date: '2024-01-01', description: 'Rent Payment', category: 'Housing & Utilities', account: 'Main Checking', amount: -4850.00 },
        { date: '2024-01-08', description: 'Whole Foods Market', category: 'Dining & Groceries', account: 'Main Checking', amount: -2420.15 },
        { date: '2024-01-15', description: 'Uber & Flight', category: 'Travel & Transport', account: 'Visa Gold Card', amount: -1980.40 },
        { date: '2024-01-22', description: 'Apple Store Shopping', category: 'Shopping', account: 'Visa Gold Card', amount: -1450.00 }
      ];
      const rows = txList.map(t => {
        const d = new Date(t.date);
        const dateStr = isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleDateString();
        return [
          dateStr,
          t.description,
          t.category,
          t.account,
          t.amount,
          t.notes || ''
        ];
      });
      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `financial_report_${activeWorkspace.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
    } catch (err) {
      alert('Could not export report data.');
    }
  };

  const monthlyChartData = useMemo(() => {
    if (!hasData) {
      return [
        { label: 'Aug', incomeHeight: '65%', expenseHeight: '45%', income: 28000, expense: 19000 },
        { label: 'Sep', incomeHeight: '70%', expenseHeight: '50%', income: 30000, expense: 21000 },
        { label: 'Oct', incomeHeight: '75%', expenseHeight: '55%', income: 32000, expense: 23000 },
        { label: 'Nov', incomeHeight: '80%', expenseHeight: '60%', income: 34000, expense: 25000 },
        { label: 'Dec', incomeHeight: '90%', expenseHeight: '75%', income: 39000, expense: 32000 },
        { label: 'Jan', incomeHeight: '100%', expenseHeight: '70%', income: 42850, expense: 28140.50 }
      ];
    }

    const monthNames = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    const now = new Date();
    const list = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      list.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: monthNames[(d.getMonth() + 12 - (now.getMonth() - 5)) % 6] || monthNames[d.getMonth() % 6],
        income: 0,
        expense: 0
      });
    }

    list[0].label = 'Aug';
    list[1].label = 'Sep';
    list[2].label = 'Oct';
    list[3].label = 'Nov';
    list[4].label = 'Dec';
    list[5].label = 'Jan';

    (Array.isArray(txns) ? txns : []).forEach(t => {
      if (!t || !t.date) return;
      const tDate = new Date(t.date);
      if (isNaN(tDate.getTime())) return;
      
      const diffMonths = (now.getFullYear() - tDate.getFullYear()) * 12 + (now.getMonth() - tDate.getMonth());
      if (diffMonths >= 0 && diffMonths <= 5) {
        const idx = 5 - diffMonths;
        const amt = Number(t.amount);
        if (amt > 0) list[idx].income += amt;
        else list[idx].expense += Math.abs(amt);
      }
    });

    const maxVal = Math.max(...list.map(m => Math.max(m.income, m.expense)), 100);

    return list.map(m => ({
      ...m,
      incomeHeight: `${(m.income / maxVal) * 100}%`,
      expenseHeight: `${(m.expense / maxVal) * 100}%`
    }));
  }, [txns, hasData]);

  const donutStyle = useMemo(() => {
    if (!hasData) {
      return { background: 'conic-gradient(#111827 0% 40%, #059669 40% 65%, #DC2626 65% 85%, #CBD5E1 85% 100%)' };
    }
    let accum = 0;
    const colors = ['#111827', '#059669', '#DC2626', '#CBD5E1'];
    const segments = categoryData.slice(0, 3).map((c, i) => {
      const start = accum;
      accum += c.pct;
      return `${colors[i]} ${start}% ${accum}%`;
    });
    if (accum < 100) {
      segments.push(`#CBD5E1 ${accum}% 100%`);
    }
    return { background: `conic-gradient(${segments.join(', ')})` };
  }, [categoryData, hasData]);

  const trendChart = useMemo(() => {
    const height = 180;
    const width = 1000;

    if (!hasData) {
      return {
        strokeD: 'M 0,150 C 80,160 150,150 200,130 C 250,110 300,180 350,180 C 400,180 450,100 500,110 C 550,120 600,180 650,180 C 700,180 750,70 800,70 C 850,70 900,150 950,140 C 970,135 990,125 1000,120',
        fillD: 'M 0,150 C 80,160 150,150 200,130 C 250,110 300,180 350,180 C 400,180 450,100 500,110 C 550,120 600,180 650,180 C 700,180 750,70 800,70 C 850,70 900,150 950,140 C 970,135 990,125 1000,120 L 1000,180 L 0,180 Z',
        avgY: 140,
        maxAmt: 10
      };
    }

    const expenses = filteredTxns.filter(t => Number(t.amount) < 0);
    if (expenses.length === 0) {
      return {
        strokeD: `M 0,${height} L ${width},${height}`,
        fillD: `M 0,${height} L ${width},${height} L ${width},${height} L 0,${height} Z`,
        avgY: height,
        maxAmt: 10
      };
    }
    
    const dailyMap = {};
    expenses.forEach(t => {
      if (!t.date) return;
      const dateStr = new Date(t.date).toDateString();
      dailyMap[dateStr] = (dailyMap[dateStr] || 0) + Math.abs(Number(t.amount));
    });

    const sortedDates = Object.keys(dailyMap).sort((a, b) => new Date(a) - new Date(b));
    const maxAmt = Math.max(...Object.values(dailyMap), 10);

    const coords = sortedDates.map((date, index) => {
      const amt = dailyMap[date];
      const x = sortedDates.length > 1 ? (index / (sortedDates.length - 1)) * width : width / 2;
      const y = height - (amt / maxAmt) * height * 0.7;
      return { x, y };
    });

    let strokeD = '';
    let fillD = '';
    if (coords.length > 0) {
      strokeD = `M ${coords[0].x},${coords[0].y}`;
      for (let i = 1; i < coords.length; i++) {
        const prev = coords[i - 1];
        const curr = coords[i];
        const cpX1 = prev.x + (curr.x - prev.x) / 2;
        const cpY1 = prev.y;
        const cpX2 = prev.x + (curr.x - prev.x) / 2;
        const cpY2 = curr.y;
        strokeD += ` C ${cpX1},${cpY1} ${cpX2},${cpY2} ${curr.x},${curr.y}`;
      }
      fillD = `${strokeD} L ${width},${height} L 0,${height} Z`;
    }

    const avgY = height - (avgDailySpend / maxAmt) * height * 0.7;

    return { strokeD, fillD, avgY, maxAmt };
  }, [filteredTxns, hasData, avgDailySpend]);

  const dateLabels = useMemo(() => {
    if (!hasData) return ['1 JAN', '8 JAN', '15 JAN', '22 JAN', 'TODAY'];
    const expenses = filteredTxns.filter(t => Number(t.amount) < 0);
    if (expenses.length === 0) return ['1 JAN', '8 JAN', '15 JAN', '22 JAN', 'TODAY'];
    
    const dates = Array.from(new Set(expenses.map(t => {
      const d = new Date(t.date);
      return isNaN(d.getTime()) ? 'Unknown' : d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase();
    })));
    dates.sort((a, b) => new Date(a) - new Date(b));

    if (dates.length <= 5) return dates;
    
    const step = (dates.length - 1) / 4;
    return [
      dates[0],
      dates[Math.round(step)],
      dates[Math.round(step * 2)],
      dates[Math.round(step * 3)],
      'TODAY'
    ];
  }, [filteredTxns, hasData]);

  return (
    <div className="rep-page-new">
      <div className="rep-header-row">
        <div>
          <h1 className="rep-title" style={{ fontSize: 28, fontWeight: 800 }}>Financial Analytics</h1>
          <p className="rep-subtitle" style={{ fontSize: 14, color: '#4B5563' }}>Comprehensive performance analysis for your fiscal portfolio.</p>
        </div>
        <div className="rep-actions">
          <div className="rep-filter-container">
            <button className={`rep-filter-btn ${filterRange === '30days' ? 'active' : ''}`} onClick={() => setFilterRange('30days')}>Last 30 Days</button>
            <button className={`rep-filter-btn ${filterRange === '6months' ? 'active' : ''}`} onClick={() => setFilterRange('6months')}>Last 6 Months</button>
            <button className={`rep-filter-btn ${filterRange === 'all' ? 'active' : ''}`} onClick={() => setFilterRange('all')}>Custom</button>
          </div>
          <button className="rep-pdf-btn" onClick={handleExport}>
            <FileText size={16} /> Export PDF
          </button>
        </div>
      </div>

      <div className="rep-kpi-grid-new">
        <div className="rep-kpi-card-new">
          <div className="rep-kpi-card-top">
            <div className="rep-circle-icon income"><ArrowUp size={20} /></div>
            <div className="rep-kpi-badge up">+12.5% ↗</div>
          </div>
          <span className="rep-kpi-card-label">Total Income</span>
          <div className="rep-kpi-card-val">${stats.income.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
        </div>

        <div className="rep-kpi-card-new">
          <div className="rep-kpi-card-top">
            <div className="rep-circle-icon expense"><TrendingDown size={20} /></div>
            <div className="rep-kpi-badge down">-4.2% ↘</div>
          </div>
          <span className="rep-kpi-card-label">Total Expenses</span>
          <div className="rep-kpi-card-val">${stats.expenses.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
        </div>

        <div className="rep-kpi-card-new">
          <div className="rep-kpi-card-top">
            <div className="rep-circle-icon savings"><Wallet size={20} /></div>
            <div className="rep-kpi-badge up">+28.0% ↗</div>
          </div>
          <span className="rep-kpi-card-label">Net Savings</span>
          <div className="rep-kpi-card-val">${stats.net.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
        </div>
      </div>

      <div className="rep-chart-grid">
        <div className="rep-chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 className="rep-chart-card-title">Income vs. Expenses</h2>
            <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#4B5563', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0F766E' }}></div> Income</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E11D48' }}></div> Expenses</span>
            </div>
          </div>

          <div className="rep-bar-chart" style={{ borderLeft: 'none' }}>
            <div className="rep-bar-y-axis">
              <span>Max</span>
              <span>50%</span>
              <span>0</span>
            </div>
            {monthlyChartData.map((m, idx) => (
              <div key={idx} className="rep-bar-group">
                <div className="rep-bar-col inc" style={{ height: m.incomeHeight }} title={`Income: $${m.income.toFixed(2)}`}></div>
                <div className="rep-bar-col exp" style={{ height: m.expenseHeight }} title={`Expense: $${m.expense.toFixed(2)}`}></div>
                <div className="rep-bar-x-label">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rep-chart-card">
          <h2 className="rep-chart-card-title" style={{ marginBottom: 20 }}>Spending by Category</h2>
          <div className="rep-donut-container">
            <div className="rep-donut" style={donutStyle}>
              <div className="rep-donut-inner">
                <span className="rep-donut-total-lbl">Total Spent</span>
                <span className="rep-donut-total-val" style={{ fontSize: 20, marginTop: 4 }}>
                  ${(stats.expenses > 1000 ? (stats.expenses / 1000).toFixed(1) + 'k' : stats.expenses.toFixed(0))}
                </span>
              </div>
            </div>
            <div className="rep-donut-legend" style={{ gridTemplateColumns: '1fr', gap: 8, marginTop: 24 }}>
              {categoryData.slice(0, 4).map((c, idx) => (
                <div key={idx} className="rep-donut-leg-item" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className={`rep-donut-leg-dot ${c.color === 'black' ? 'black' : (c.color === 'green' ? 'green' : (c.color === 'red' ? 'red' : 'grey'))}`}></div>
                    <span>{c.name}</span>
                  </div>
                  <span style={{ fontWeight: 700 }}>{c.pct}%</span>
                </div>
              ))}
              {categoryData.length === 0 && <div className="rep-donut-leg-item">No expenses recorded</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="rep-line-chart-card">
        <div className="rep-line-header" style={{ marginBottom: 8 }}>
          <div>
            <h2 className="rep-chart-card-title">Daily Spending Trend</h2>
            <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0' }}>Cash flow velocity relative to daily average budget.</p>
          </div>
          <span className="rep-line-badge" style={{ background: '#F3F4F6', color: '#111827', fontWeight: 700 }}>Avg: ${avgDailySpend}/day</span>
        </div>
        
        <div className="rep-line-area" style={{ height: 180 }}>
          <div style={{ position: 'absolute', left: '25%', top: 0, bottom: 0, borderLeft: '1px dashed #E5E7EB' }}></div>
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, borderLeft: '1px dashed #E5E7EB' }}></div>
          <div style={{ position: 'absolute', left: '75%', top: 0, bottom: 0, borderLeft: '1px dashed #E5E7EB' }}></div>
          
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#111827" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#111827" stopOpacity="0.00" />
              </linearGradient>
            </defs>
            {/* Shaded Area */}
            {trendChart.fillD && <path d={trendChart.fillD} fill="url(#chartGrad)" />}
            {/* Dotted Average line */}
            {isFinite(trendChart.avgY) && (
              <line x1="0" y1={trendChart.avgY} x2="1000" y2={trendChart.avgY} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
            )}
            {/* Trend line */}
            {trendChart.strokeD && <path d={trendChart.strokeD} fill="none" stroke="#111827" strokeWidth="2" strokeLinejoin="round" />}
          </svg>
        </div>
        
        <div className="rep-line-x-axis">
          {dateLabels.map((lbl, idx) => <span key={idx}>{lbl}</span>)}
        </div>
      </div>

      <div className="rep-table-card">
        <div className="rep-table-header" style={{ padding: '20px 24px' }}>
          <h2 className="rep-chart-card-title">Top Category Breakdown</h2>
          <span className="rep-table-link" style={{ cursor: 'pointer', color: '#111827', textDecoration: 'underline' }}>View All Categories</span>
        </div>
        
        <table className="rep-table">
          <thead>
            <tr>
              <th style={{ padding: '12px 24px' }}>Category</th>
              <th style={{ padding: '12px 24px' }}>Total Amount</th>
              <th style={{ padding: '12px 24px' }}>% of Spending</th>
              <th style={{ padding: '12px 24px' }}>Trend (30d)</th>
              <th style={{ padding: '12px 24px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {categoryData.map(c => (
              <tr key={c.id}>
                <td style={{ padding: '12px 24px' }}>
                  <div className="rep-cat-cell">
                    <div className={`rep-cat-icon ${c.color === 'black' ? 'black' : (c.color === 'green' ? 'green' : (c.color === 'red' ? 'red' : 'grey'))}`} style={{ borderRadius: '8px' }}>
                      {getIcon(c.icon)}
                    </div>
                    <span className="rep-cat-name" style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 24px' }}>
                  <span className="rep-cat-name" style={{ fontSize: 14, fontWeight: 700 }}>${c.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </td>
                <td style={{ padding: '12px 24px' }}>
                  <div className="rep-prog-cell">
                    <div className="rep-prog-bar-bg" style={{ height: 6, width: 80, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
                      <div className="rep-prog-bar-fill" style={{ height: '100%', width: `${c.pct}%`, background: c.color === 'black' ? '#111827' : (c.color === 'green' ? '#059669' : (c.color === 'red' ? '#DC2626' : '#CBD5E1')) }} />
                    </div>
                    <span className="rep-prog-pct" style={{ fontSize: 13, fontWeight: 700, marginLeft: 8 }}>{c.pct}%</span>
                  </div>
                </td>
                <td style={{ padding: '12px 24px' }}>
                  <div className={`rep-trend-cell ${getTrendClass(c.trend)}`} style={{ fontWeight: 600 }}>
                    {getTrendIcon(c.trend)} {c.trend}
                  </div>
                </td>
                <td style={{ padding: '12px 24px', textAlign: 'right' }}>
                  <button className="rep-details-btn">Details</button>
                </td>
              </tr>
            ))}
            {categoryData.length === 0 && (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', padding: 24, color: '#9CA3AF'}}>No expense records found for this period.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────── */
