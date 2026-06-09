import React, { useState } from 'react';
import { Percent, Edit2, AlertTriangle, CheckCircle, ShieldAlert, Save, X, Info } from 'lucide-react';

export default function Budgets({
  categories,
  transactions,
  onSaveCategory // to update budget limit
}) {
  const [editingCategory, setEditingCategory] = useState(null);
  const [newLimit, setNewLimit] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Time boundaries (current month)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Filter current month transactions
  const currentMonthExpenses = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'expense' && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  // Calculate spent per category this month
  const categorySpentMap = {};
  currentMonthExpenses.forEach(tx => {
    categorySpentMap[tx.category] = (categorySpentMap[tx.category] || 0) + tx.amount;
  });

  // Budget calculations
  const budgetedCategories = categories.filter(c => c.type === 'expense' && c.budgetLimit > 0);
  
  const totalBudgeted = budgetedCategories.reduce((sum, c) => sum + c.budgetLimit, 0);
  const totalSpent = budgetedCategories.reduce((sum, c) => {
    return sum + (categorySpentMap[c.name] || 0);
  }, 0);

  const remainingBudget = totalBudgeted - totalSpent;
  const overallPercent = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  // Format helper
  const formatBDT = (amount) => {
    const isNegative = amount < 0;
    const absVal = Math.abs(amount);
    const formatted = '৳' + absVal.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return isNegative ? '-' + formatted : formatted;
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setNewLimit(cat.budgetLimit.toString());
    setIsModalOpen(true);
  };

  const handleSaveBudget = (e) => {
    e.preventDefault();
    if (!editingCategory) return;

    const limitVal = parseFloat(newLimit);
    if (isNaN(limitVal) || limitVal < 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    const updatedCategory = {
      ...editingCategory,
      budgetLimit: limitVal
    };

    onSaveCategory(updatedCategory);
    setIsModalOpen(false);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">Monthly Budgets</h1>
          <p className="page-subtitle">Set category-wise budget caps to monitor spending velocity</p>
        </div>
      </div>

      {/* KPI summaries */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="card kpi-card">
          <div className="kpi-icon-container" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
            <Percent size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Total Budgeted</div>
            <div className="kpi-value">{formatBDT(totalBudgeted)}</div>
            <div className="kpi-trend text-muted">Across all categories</div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-container" style={{ backgroundColor: 'var(--expense-light)', color: 'var(--expense)' }}>
            <AlertTriangle size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Total Spent (This Month)</div>
            <div className="kpi-value expense">{formatBDT(totalSpent)}</div>
            <div className="kpi-trend text-muted">Budget categories only</div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-container" style={{ backgroundColor: remainingBudget >= 0 ? 'var(--income-light)' : 'var(--expense-light)', color: remainingBudget >= 0 ? 'var(--income)' : 'var(--expense)' }}>
            <CheckCircle size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Remaining Balance</div>
            <div className={`kpi-value ${remainingBudget < 0 ? 'expense' : 'income'}`}>
              {formatBDT(remainingBudget)}
            </div>
            <div className="kpi-trend text-muted">
              {remainingBudget >= 0 ? 'Within safety margins' : 'Deficit limit crossed'}
            </div>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-container" style={{ backgroundColor: overallPercent >= 100 ? 'var(--expense-light)' : overallPercent >= 80 ? 'var(--warning-light)' : 'var(--income-light)', color: overallPercent >= 100 ? 'var(--expense)' : overallPercent >= 80 ? 'var(--warning)' : 'var(--income)' }}>
            <Info size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Budget Burn Rate</div>
            <div className="kpi-value">{overallPercent}%</div>
            <div className="kpi-trend text-muted">Monthly exhaustion</div>
          </div>
        </div>
      </div>

      {/* Main Budget Grid */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Category Wise Budgets ({new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })})</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {categories.filter(c => c.type === 'expense').map(cat => {
            const spent = categorySpentMap[cat.name] || 0;
            const limit = cat.budgetLimit;
            const hasLimit = limit > 0;
            const percent = hasLimit ? Math.round((spent / limit) * 100) : 0;
            
            // Progress Bar Color
            let barColor = 'var(--primary)';
            if (percent >= 100) {
              barColor = 'var(--expense)';
            } else if (percent >= 80) {
              barColor = 'var(--warning)';
            }

            return (
              <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: cat.color }}></span>
                    <span style={{ fontWeight: 700, fontSize: '15px' }}>{cat.name}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700 }}>{formatBDT(spent)}</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {hasLimit ? ` / ${formatBDT(limit)}` : ' / No Limit'}
                      </span>
                    </div>

                    <button 
                      className="btn btn-secondary btn-circle btn-sm"
                      onClick={() => handleOpenEdit(cat)}
                      title="Update Budget Limit"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                </div>

                {hasLimit ? (
                  <>
                    <div className="budget-bar-bg" style={{ height: '10px' }}>
                      <div 
                        className="budget-bar-fill" 
                        style={{ 
                          width: `${Math.min(percent, 100)}%`, 
                          backgroundColor: barColor 
                        }}
                      ></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Utilization: {percent}%
                      </span>
                      {percent >= 100 ? (
                        <span style={{ fontSize: '11px', color: 'var(--expense)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={12} /> Exceeded by {formatBDT(spent - limit)}
                        </span>
                      ) : percent >= 80 ? (
                        <span style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={12} /> Close to limit
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--income)', fontWeight: 600 }}>
                          Safe: {formatBDT(limit - spent)} remaining
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No budget limit set. Click the edit button to configure a monthly limit.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Set Category Budget Limit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Set Category Budget</h2>
              <button className="btn btn-secondary btn-circle btn-sm" onClick={() => setIsModalOpen(false)} style={{ border: 'none' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBudget}>
              <div className="modal-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: editingCategory?.color }}></span>
                  <span style={{ fontWeight: 700 }}>{editingCategory?.name}</span>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="budget-limit">Monthly Limit (BDT)</label>
                  <input
                    id="budget-limit"
                    type="number"
                    className="form-control"
                    placeholder="e.g. 10000"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                    Enter 0 to disable budget tracking for this category.
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} />
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
