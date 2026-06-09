import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Tag, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Trash2,
  AlertTriangle,
  ChevronRight,
  PieChart as PieIcon,
  BarChart3 as BarIcon,
  Activity as LineIcon,
  Briefcase
} from 'lucide-react';

export default function Dashboard({ 
  transactions, 
  categories, 
  accounts, 
  onAddTransactionClick, 
  onDeleteTransaction, 
  onNavigate 
}) {
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0); // 0 = current, -1 = prev

  // Get current date context
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Helper: Format amount to BDT
  const formatBDT = (amount) => {
    return '৳' + Number(amount).toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Helper: Get Month Name
  const getMonthName = (monthIdx) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[(monthIdx + 12) % 12];
  };

  // Dynamic calculations
  // 1. Overall Totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // 2. Current Month transactions & spend
  const thisMonthTxs = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  const thisMonthSpend = thisMonthTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const thisMonthIncome = thisMonthTxs
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // 3. Top Expense Category for current month
  const categorySums = {};
  thisMonthTxs.filter(t => t.type === 'expense').forEach(t => {
    categorySums[t.category] = (categorySums[t.category] || 0) + t.amount;
  });

  let topCategory = 'None';
  let topCategoryAmount = 0;
  Object.keys(categorySums).forEach(cat => {
    if (categorySums[cat] > topCategoryAmount) {
      topCategory = cat;
      topCategoryAmount = categorySums[cat];
    }
  });

  // 4. Largest Transaction this month
  const largestTxThisMonth = thisMonthTxs
    .filter(t => t.type === 'expense')
    .reduce((max, t) => (t.amount > max ? t.amount : max), 0);

  // --- CHART 1: DONUT CHART (Expense by Category This Month) ---
  const expenseCategories = categories.filter(c => c.type === 'expense');
  const categoryData = expenseCategories.map(cat => {
    const amount = categorySums[cat.name] || 0;
    return {
      name: cat.name,
      amount,
      color: cat.color,
    };
  }).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

  const totalCategoryExpenses = categoryData.reduce((sum, c) => sum + c.amount, 0);
  
  // Calculate percentages
  const donutData = categoryData.map(c => ({
    ...c,
    percentage: totalCategoryExpenses > 0 ? Math.round((c.amount / totalCategoryExpenses) * 100) : 0
  }));

  // Render SVG Donut
  let accumulatedPercent = 0;
  const donutSegments = donutData.map((cat, idx) => {
    const percent = cat.percentage;
    if (percent === 0) return null;
    const strokeDasharray = `${percent} ${100 - percent}`;
    const strokeDashoffset = -accumulatedPercent;
    accumulatedPercent += percent;

    return (
      <circle
        key={cat.name}
        cx="21"
        cy="21"
        r="15.9154943"
        fill="transparent"
        stroke={cat.color}
        strokeWidth="6"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
      />
    );
  }).filter(Boolean);

  // --- CHART 2: BAR CHART (Last 6 Months Income vs Expense) ---
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(now.getMonth() - i);
    last6Months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: `${getMonthName(d.getMonth()).slice(0, 3)} ${d.getFullYear().toString().slice(-2)}`,
      income: 0,
      expense: 0
    });
  }

  // Aggregate monthly values
  transactions.forEach(t => {
    const tDate = new Date(t.date);
    const tYear = tDate.getFullYear();
    const tMonth = tDate.getMonth();
    
    const mMatch = last6Months.find(m => m.year === tYear && m.month === tMonth);
    if (mMatch) {
      if (t.type === 'income') mMatch.income += t.amount;
      if (t.type === 'expense') mMatch.expense += t.amount;
    }
  });

  const maxVal = Math.max(...last6Months.map(m => Math.max(m.income, m.expense)), 10000);

  // --- CHART 3: LINE CHART (Current Month Spending Trend) ---
  // Generate daily points for the line chart
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dailySpending = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, amount: 0 }));

  thisMonthTxs.filter(t => t.type === 'expense').forEach(t => {
    const day = new Date(t.date).getDate();
    if (day <= daysInMonth) {
      dailySpending[day - 1].amount += t.amount;
    }
  });

  // Calculate cumulative spending for smooth curve
  let cumulative = 0;
  const cumulativeSpending = dailySpending.map(d => {
    cumulative += d.amount;
    return { day: d.day, amount: cumulative };
  });

  const maxCumulative = Math.max(...cumulativeSpending.map(d => d.amount), 5000);

  // Generate SVG Path
  const chartWidth = 500;
  const chartHeight = 120;
  const paddingX = 20;
  const paddingY = 10;
  const graphWidth = chartWidth - paddingX * 2;
  const graphHeight = chartHeight - paddingY * 2;

  let pathData = '';
  let areaData = '';

  if (cumulativeSpending.length > 0) {
    const points = cumulativeSpending.map(d => {
      const x = paddingX + ((d.day - 1) / (daysInMonth - 1)) * graphWidth;
      const y = paddingY + graphHeight - (d.amount / maxCumulative) * graphHeight;
      return { x, y };
    });

    pathData = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    areaData = `${pathData} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;
  }

  // --- BUDGTE PROGRESS WIDGET ---
  const budgetWidgets = categories
    .filter(c => c.type === 'expense' && c.budgetLimit > 0)
    .map(cat => {
      const spent = categorySums[cat.name] || 0;
      const limit = cat.budgetLimit;
      const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      
      let statusColor = 'var(--primary)';
      if (percent >= 100) {
        statusColor = 'var(--expense)';
      } else if (percent >= 80) {
        statusColor = 'var(--warning)';
      }

      return {
        id: cat.id,
        name: cat.name,
        spent,
        limit,
        percent,
        color: statusColor
      };
    })
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 4);

  // --- RECENT TRANSACTIONS ---
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date) || new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">Assalamu Alaikum, Shakib</h1>
          <p className="page-subtitle">Here is your financial status overview in BDT</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={onAddTransactionClick}>
            <Plus size={18} />
            Quick Add
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="card kpi-card">
          <div className="kpi-icon-container" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
            <Briefcase size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Net Balance</div>
            <div className="kpi-value">{formatBDT(netBalance)}</div>
            <div className="kpi-trend">
              <span style={{ color: netBalance >= 0 ? 'var(--income)' : 'var(--expense)', fontWeight: 600 }}>
                {netBalance >= 0 ? 'Surplus' : 'Deficit'}
              </span>
            </div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-container" style={{ backgroundColor: 'var(--income-light)', color: 'var(--income)' }}>
            <TrendingUp size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Total Income</div>
            <div className="kpi-value income">{formatBDT(totalIncome)}</div>
            <div className="kpi-trend text-muted">All time record</div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-container" style={{ backgroundColor: 'var(--expense-light)', color: 'var(--expense)' }}>
            <TrendingDown size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Total Expenses</div>
            <div className="kpi-value expense">{formatBDT(totalExpense)}</div>
            <div className="kpi-trend text-muted">All time record</div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-container" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}>
            <Calendar size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Spend This Month</div>
            <div className="kpi-value">{formatBDT(thisMonthSpend)}</div>
            <div className="kpi-trend">
              <span style={{ color: 'var(--text-secondary)' }}>Budget usage: </span>
              <span style={{ fontWeight: 600 }}>{formatBDT(thisMonthIncome)} In</span>
            </div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-container" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)' }}>
            <Tag size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Top Spend Category</div>
            <div className="kpi-value" style={{ fontSize: '18px', padding: '3px 0' }}>{topCategory}</div>
            <div className="kpi-trend text-muted">
              <span>Spent: {formatBDT(topCategoryAmount)}</span>
            </div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-container" style={{ backgroundColor: 'var(--expense-light)', color: 'var(--expense)' }}>
            <ArrowDownLeft size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Largest Spend (Month)</div>
            <div className="kpi-value expense">{formatBDT(largestTxThisMonth)}</div>
            <div className="kpi-trend text-muted">Single bill limit</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Income vs Expense Bar Chart */}
        <div className="card">
          <div className="card-title">
            <span>Income vs Expense (Last 6 Months)</span>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', fontWeight: 500 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--primary)', borderRadius: '2px' }}></span>
                <span>Income</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--expense)', borderRadius: '2px' }}></span>
                <span>Expense</span>
              </div>
            </div>
          </div>

          <div className="chart-container">
            {last6Months.map((m, idx) => {
              const incomeHeight = maxVal > 0 ? (m.income / maxVal) * 80 : 0;
              const expenseHeight = maxVal > 0 ? (m.expense / maxVal) * 80 : 0;

              return (
                <div className="bar-chart-bar-wrapper" key={idx}>
                  <div className="bar-chart-double-bars">
                    <div 
                      className="bar-chart-bar income" 
                      style={{ height: `${incomeHeight}%` }}
                    >
                      <div className="bar-chart-tooltip">
                        Income: {formatBDT(m.income)}
                      </div>
                    </div>
                    <div 
                      className="bar-chart-bar expense" 
                      style={{ height: `${expenseHeight}%` }}
                    >
                      <div className="bar-chart-tooltip">
                        Expense: {formatBDT(m.expense)}
                      </div>
                    </div>
                  </div>
                  <div className="bar-chart-label">{m.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense Category Pie/Donut Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-title">
            <span>Expense Breakup (This Month)</span>
            <PieIcon size={16} className="text-muted" />
          </div>

          {donutData.length === 0 ? (
            <div className="empty-state" style={{ flex: 1, padding: '24px 0' }}>
              <div className="empty-state-icon"><PieIcon size={24} /></div>
              <p className="empty-state-title" style={{ fontSize: '14px' }}>No expense data</p>
              <p className="empty-state-desc" style={{ fontSize: '11px' }}>Add monthly expenses to see dynamic breakup.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
                <svg width="160" height="160" viewBox="0 0 42 42" className="donut-chart-svg">
                  <circle cx="21" cy="21" r="15.9154943" fill="transparent" stroke="var(--bg-tertiary)" strokeWidth="6" />
                  {donutSegments}
                  <g className="chart-center-text">
                    <text x="50%" y="47%" dominantBaseline="middle" textAnchor="middle" fill="var(--text-primary)" style={{ fontSize: '3px', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>
                      Spent
                    </text>
                    <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="var(--text-secondary)" style={{ fontSize: '2px', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
                      {formatBDT(totalCategoryExpenses)}
                    </text>
                  </g>
                </svg>
              </div>

              <div className="chart-legend">
                {donutData.map((cat, index) => (
                  <div className="legend-item" key={index}>
                    <div className="legend-label-group">
                      <span className="legend-color-dot" style={{ backgroundColor: cat.color }}></span>
                      <span style={{ color: 'var(--text-secondary)' }}>{cat.name}</span>
                    </div>
                    <div className="legend-value">
                      <span>{cat.percentage}%</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                        ({formatBDT(cat.amount)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cumulative Spending & Details Row */}
      <div className="charts-grid" style={{ gridTemplateColumns: '1.2fr 1.8fr', marginBottom: '24px' }}>
        {/* Spending Trend Chart */}
        <div className="card">
          <div className="card-title">
            <span>Daily Cumulative Spending (Current Month)</span>
            <LineIcon size={16} className="text-muted" />
          </div>

          <div style={{ position: 'relative', height: '170px', marginTop: '20px' }}>
            {pathData ? (
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="100%" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="line-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--expense)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--expense)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal grid lines */}
                <line x1="20" y1="10" x2="480" y2="10" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="20" y1="65" x2="480" y2="65" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="20" y1="110" x2="480" y2="110" stroke="var(--border-color)" strokeWidth="1" />
                
                {/* Area fill */}
                <path d={areaData} fill="url(#line-grad)" />
                {/* Trend line */}
                <path d={pathData} fill="none" stroke="var(--expense)" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Label helper */}
                <text x="25" y="18" fill="var(--text-muted)" style={{ fontSize: '9px', fontWeight: 600 }}>
                  Max: {formatBDT(maxCumulative)}
                </text>
                <text x="25" y="105" fill="var(--text-muted)" style={{ fontSize: '9px', fontWeight: 600 }}>
                  Start of Month
                </text>
                <text x="410" y="105" fill="var(--text-muted)" style={{ fontSize: '9px', fontWeight: 600 }} textAnchor="start">
                  End of Month
                </text>
              </svg>
            ) : (
              <div className="empty-state" style={{ height: '100%', padding: 0 }}>
                <p className="empty-state-title" style={{ fontSize: '13px' }}>No spending logged</p>
              </div>
            )}
          </div>
        </div>

        {/* Budget Status Widget */}
        <div className="card">
          <div className="card-title">
            <span>Active Budgets Utilization</span>
            <a href="#budgets" onClick={(e) => { e.preventDefault(); onNavigate('budgets'); }} style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              All Budgets <ChevronRight size={14} />
            </a>
          </div>

          <div style={{ marginTop: '10px' }}>
            {budgetWidgets.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <p className="empty-state-title" style={{ fontSize: '14px' }}>No categories budgeted</p>
                <p className="empty-state-desc" style={{ fontSize: '11px' }}>Set limits on expense categories to monitor progress here.</p>
                <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('budgets')} style={{ marginTop: '12px' }}>
                  Set Budget Now
                </button>
              </div>
            ) : (
              budgetWidgets.map(widget => (
                <div className="budget-widget-item" key={widget.id}>
                  <div className="budget-widget-header">
                    <span style={{ color: 'var(--text-primary)' }}>{widget.name}</span>
                    <span style={{ color: widget.percent >= 100 ? 'var(--expense)' : 'var(--text-secondary)' }}>
                      {formatBDT(widget.spent)} / {formatBDT(widget.limit)} ({widget.percent}%)
                    </span>
                  </div>
                  <div className="budget-bar-bg">
                    <div 
                      className="budget-bar-fill" 
                      style={{ 
                        width: `${Math.min(widget.percent, 100)}%`, 
                        backgroundColor: widget.color 
                      }}
                    ></div>
                  </div>
                  {widget.percent >= 100 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--expense)', fontSize: '10px', marginTop: '4px', fontWeight: 600 }}>
                      <AlertTriangle size={12} />
                      <span>Warning: Budget Limit Exceeded!</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Bottom Row: Recent Transactions */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: '20px' }}>
          <span>Recent Transactions</span>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('transactions')}>
            View All Transactions
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">৳</div>
            <p className="empty-state-title">No transactions logged yet</p>
            <p className="empty-state-desc">Click "Quick Add" to log your first income or expense transaction.</p>
          </div>
        ) : (
          <div className="recent-tx-list">
            {recentTransactions.map(tx => {
              const catColor = categories.find(c => c.name === tx.category)?.color || '#94a3b8';
              
              return (
                <div className="recent-tx-item" key={tx.id}>
                  <div className="recent-tx-left">
                    <div className="category-icon-bg" style={{ backgroundColor: catColor }}>
                      {tx.category.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="recent-tx-info">
                      <span className="recent-tx-title">{tx.title}</span>
                      <span className="recent-tx-meta">
                        {tx.date.split('-').reverse().join('/')} • {tx.account} • {tx.paymentMethod}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span className={`amount-text ${tx.type}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatBDT(tx.amount)}
                    </span>
                    <button 
                      className="btn btn-secondary btn-circle btn-sm"
                      onClick={() => onDeleteTransaction(tx.id)}
                      style={{ color: 'var(--expense)' }}
                      title="Delete Transaction"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
