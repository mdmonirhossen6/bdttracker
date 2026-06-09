import React, { useState } from 'react';
import { Download, Printer, Calendar, BarChart3, TrendingUp, DollarSign, Percent } from 'lucide-react';

export default function Reports({
  transactions,
  categories,
  accounts
}) {
  const [reportType, setReportType] = useState('monthly'); // monthly, yearly
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const years = [2026, 2025, 2024];
  const months = [
    { label: 'January', val: 0 },
    { label: 'February', val: 1 },
    { label: 'March', val: 2 },
    { label: 'April', val: 3 },
    { label: 'May', val: 4 },
    { label: 'June', val: 5 },
    { label: 'July', val: 6 },
    { label: 'August', val: 7 },
    { label: 'September', val: 8 },
    { label: 'October', val: 9 },
    { label: 'November', val: 10 },
    { label: 'December', val: 11 },
  ];

  // Helper: Format BDT
  const formatBDT = (amount) => {
    return '৳' + Number(amount).toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Filter transactions based on selection
  const filteredTxs = transactions.filter(t => {
    const d = new Date(t.date);
    const yMatches = d.getFullYear() === Number(selectedYear);
    const mMatches = reportType === 'yearly' || d.getMonth() === Number(selectedMonth);
    return yMatches && mMatches;
  });

  // Calculate Metrics
  const incomeTxs = filteredTxs.filter(t => t.type === 'income');
  const expenseTxs = filteredTxs.filter(t => t.type === 'expense');

  const periodIncome = incomeTxs.reduce((sum, t) => sum + t.amount, 0);
  const periodExpense = expenseTxs.reduce((sum, t) => sum + t.amount, 0);
  const periodNet = periodIncome - periodExpense;
  const savingsRate = periodIncome > 0 ? Math.round(((periodIncome - periodExpense) / periodIncome) * 100) : 0;

  // Category Summaries
  const categorySummary = {};
  expenseTxs.forEach(t => {
    categorySummary[t.category] = (categorySummary[t.category] || 0) + t.amount;
  });

  const categoryReportData = Object.keys(categorySummary).map(catName => {
    const amount = categorySummary[catName];
    const catObj = categories.find(c => c.name === catName);
    const color = catObj ? catObj.color : '#94a3b8';
    const txCount = expenseTxs.filter(t => t.category === catName).length;
    
    return {
      name: catName,
      amount,
      color,
      txCount,
      percent: periodExpense > 0 ? Math.round((amount / periodExpense) * 100) : 0
    };
  }).sort((a, b) => b.amount - a.amount);

  // Account Summaries
  const accountSummary = {};
  accounts.forEach(acc => {
    accountSummary[acc.name] = { inflow: 0, outflow: 0, net: 0, txCount: 0 };
  });

  filteredTxs.forEach(tx => {
    if (!accountSummary[tx.account]) {
      accountSummary[tx.account] = { inflow: 0, outflow: 0, net: 0, txCount: 0 };
    }
    accountSummary[tx.account].txCount += 1;
    if (tx.type === 'income') {
      accountSummary[tx.account].inflow += tx.amount;
    } else {
      accountSummary[tx.account].outflow += tx.amount;
    }
  });

  const accountReportData = Object.keys(accountSummary).map(accName => {
    const summary = accountSummary[accName];
    const accObj = accounts.find(a => a.name === accName);
    const type = accObj ? accObj.type : 'Cash';
    
    return {
      name: accName,
      type,
      inflow: summary.inflow,
      outflow: summary.outflow,
      net: summary.inflow - summary.outflow,
      txCount: summary.txCount
    };
  }).filter(a => a.txCount > 0);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Title', 'Type', 'Category', 'Subcategory', 'Account', 'Payment Method', 'Amount', 'Notes'];
    const rows = filteredTxs.map(t => [
      t.date.split('-').reverse().join('/'),
      t.title,
      t.type,
      t.category,
      t.subcategory,
      t.account,
      t.paymentMethod,
      t.amount,
      t.notes || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const periodLabel = reportType === 'yearly' ? `${selectedYear}` : `${months[selectedMonth].label}_${selectedYear}`;
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bdt_expense_report_${periodLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF (Print popup styling)
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    
    const periodLabel = reportType === 'yearly' 
      ? `Yearly Report: ${selectedYear}` 
      : `Monthly Report: ${months[selectedMonth].label} ${selectedYear}`;

    const categoryRows = categoryReportData.map(c => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: 600;">${c.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${c.txCount}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; font-weight: 700;">৳${c.amount.toLocaleString('en-BD')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${c.percent}%</td>
      </tr>
    `).join('');

    const accountRows = accountReportData.map(a => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: 600;">${a.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; color: #10b981;">৳${a.inflow.toLocaleString('en-BD')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; color: #ef4444;">৳${a.outflow.toLocaleString('en-BD')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; font-weight: 700;">৳${a.net.toLocaleString('en-BD')}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <title>BDT Tracker Statement</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 40px; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
            .brand { font-size: 26px; font-weight: 800; color: #10b981; }
            .title { font-size: 18px; color: #555; text-align: right; }
            .kpi-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .kpi-card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; background-color: #fafafa; }
            .kpi-label { font-size: 11px; color: #777; font-weight: 600; text-transform: uppercase; }
            .kpi-val { font-size: 18px; font-weight: 700; margin-top: 5px; }
            .section { margin-bottom: 40px; }
            .section-title { font-size: 16px; font-weight: 700; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 15px; text-transform: uppercase; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #f1f5f9; padding: 10px; font-size: 12px; font-weight: 700; text-align: left; border-bottom: 1px solid #ddd; }
            td { font-size: 13px; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">BDT TRACKER</div>
              <div style="font-size: 12px; color: #666; margin-top: 4px;">Bangladesh Expense Statement</div>
            </div>
            <div class="title">
              <strong>${periodLabel}</strong><br/>
              <span style="font-size: 12px; color: #888;">Generated on: ${new Date().toLocaleDateString('en-GB')}</span>
            </div>
          </div>

          <div class="kpi-container">
            <div class="kpi-card">
              <div class="kpi-label">Period Income</div>
              <div class="kpi-val" style="color: #10b981;">৳${periodIncome.toLocaleString('en-BD')}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Period Expenses</div>
              <div class="kpi-val" style="color: #ef4444;">৳${periodExpense.toLocaleString('en-BD')}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Net cashflow</div>
              <div class="kpi-val" style="color: ${periodNet >= 0 ? '#10b981' : '#ef4444'};">৳${periodNet.toLocaleString('en-BD')}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Savings Rate</div>
              <div class="kpi-val">${savingsRate}%</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Expense Breakup By Category</div>
            <table>
              <thead>
                <tr>
                  <th style="text-align: left;">Category</th>
                  <th style="text-align: center;">Transactions</th>
                  <th style="text-align: right;">Amount Spent</th>
                  <th style="text-align: right;">% of Total Expenses</th>
                </tr>
              </thead>
              <tbody>
                ${categoryRows || '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #888;">No expense records logged in this period.</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Account Performance Ledger</div>
            <table>
              <thead>
                <tr>
                  <th style="text-align: left;">Wallet / Account</th>
                  <th style="text-align: right;">Inflow (+)</th>
                  <th style="text-align: right;">Outflow (-)</th>
                  <th style="text-align: right;">Net Change</th>
                </tr>
              </thead>
              <tbody>
                ${accountRows || '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #888;">No account transactions in this period.</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="footer">
            This statement was generated automatically by BDT Tracker. Subject to manual audit.
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">Financial Reports</h1>
          <p className="page-subtitle">Compile account ledgers and category statements</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={18} />
            Export CSV
          </button>
          <button className="btn btn-primary" onClick={handleExportPDF}>
            <Printer size={18} />
            Download Statement
          </button>
        </div>
      </div>

      {/* Report selectors */}
      <div className="filter-panel" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Report Period Type</label>
          <div className="radio-group">
            <div
              className={`radio-card ${reportType === 'monthly' ? 'active expense' : ''}`}
              onClick={() => setReportType('monthly')}
              style={{ padding: '8px' }}
            >
              Monthly
            </div>
            <div
              className={`radio-card ${reportType === 'yearly' ? 'active income' : ''}`}
              onClick={() => setReportType('yearly')}
              style={{ padding: '8px' }}
            >
              Yearly
            </div>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Year</label>
          <select 
            className="form-control" 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {reportType === 'monthly' && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Month</label>
            <select 
              className="form-control" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map(m => (
                <option key={m.val} value={m.val}>{m.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Key Metric Summaries */}
      <div className="kpi-grid">
        <div className="card kpi-card">
          <div className="kpi-icon-container" style={{ backgroundColor: 'var(--income-light)', color: 'var(--income)' }}>
            <TrendingUp size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Inflow (Incomes)</div>
            <div className="kpi-value income">{formatBDT(periodIncome)}</div>
            <div className="kpi-trend text-muted">{incomeTxs.length} transaction entries</div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-container" style={{ backgroundColor: 'var(--expense-light)', color: 'var(--expense)' }}>
            <BarChart3 size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Outflow (Expenses)</div>
            <div className="kpi-value expense">{formatBDT(periodExpense)}</div>
            <div className="kpi-trend text-muted">{expenseTxs.length} transaction entries</div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-container" style={{ backgroundColor: periodNet >= 0 ? 'var(--income-light)' : 'var(--expense-light)', color: periodNet >= 0 ? 'var(--income)' : 'var(--expense)' }}>
            <DollarSign size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Period Net Balance</div>
            <div className={`kpi-value ${periodNet < 0 ? 'expense' : 'income'}`}>
              {formatBDT(periodNet)}
            </div>
            <div className="kpi-trend text-muted">Savings vs Cost ratio</div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-container" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
            <Percent size={22} className="accent" />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Savings Rate</div>
            <div className="kpi-value">{savingsRate}%</div>
            <div className="kpi-trend text-muted">Retained cash percentage</div>
          </div>
        </div>
      </div>

      {/* Report Breakdowns grid */}
      <div className="charts-grid" style={{ gridTemplateColumns: '1.2fr 1.8fr' }}>
        {/* Category Breakdown */}
        <div className="card" style={{ padding: '24px 0 0 0' }}>
          <h2 style={{ fontSize: '18px', padding: '0 24px 16px 24px', borderBottom: '1px solid var(--border-color)' }}>
            Expenses by Category
          </h2>
          
          <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
            {categoryReportData.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 24px' }}>
                <p className="empty-state-title">No expenses found</p>
                <p className="empty-state-desc">No transactions matching this period criteria.</p>
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th style={{ textAlignment: 'center' }}>Entries</th>
                    <th style={{ textAlignment: 'right' }}>Spent</th>
                    <th style={{ textAlignment: 'right' }}>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryReportData.map(c => (
                    <tr key={c.name}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.color }}></span>
                          <span>{c.name}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>{c.txCount}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatBDT(c.amount)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>{c.percent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Account Performance */}
        <div className="card" style={{ padding: '24px 0 0 0' }}>
          <h2 style={{ fontSize: '18px', padding: '0 24px 16px 24px', borderBottom: '1px solid var(--border-color)' }}>
            Account Performance Ledger
          </h2>

          <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
            {accountReportData.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 24px' }}>
                <p className="empty-state-title">No account activities</p>
                <p className="empty-state-desc">Choose another reporting timeline.</p>
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Account Name</th>
                    <th>Type</th>
                    <th style={{ textAlignment: 'right' }}>Total Inflow (+)</th>
                    <th style={{ textAlignment: 'right' }}>Total Outflow (-)</th>
                    <th style={{ textAlignment: 'right' }}>Net Change</th>
                  </tr>
                </thead>
                <tbody>
                  {accountReportData.map(a => (
                    <tr key={a.name}>
                      <td style={{ fontWeight: 600 }}>{a.name}</td>
                      <td><span className="subcat-pill">{a.type}</span></td>
                      <td style={{ textAlign: 'right', color: 'var(--income)', fontWeight: 600 }}>{formatBDT(a.inflow)}</td>
                      <td style={{ textAlign: 'right', color: 'var(--expense)', fontWeight: 600 }}>{formatBDT(a.outflow)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: a.net >= 0 ? 'var(--income)' : 'var(--expense)' }}>
                        {a.net >= 0 ? '+' : ''}{formatBDT(a.net)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
