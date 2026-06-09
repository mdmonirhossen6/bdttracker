import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, AlertTriangle, Save, FolderOpen } from 'lucide-react';

export default function Categories({
  categories,
  onSaveCategory,
  onDeleteCategory,
  transactions
}) {
  const [activeTab, setActiveTab] = useState('expense');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [subcatText, setSubcatText] = useState('');
  const [error, setError] = useState('');

  const colors = [
    '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#14b8a6', '#6366f1', '#ec4899', 
    '#475569', '#0284c7', '#059669', '#a1a1aa'
  ];

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setType(activeTab);
    setBudgetLimit('');
    setColor(colors[Math.floor(Math.random() * colors.length)]);
    setSubcatText('');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setBudgetLimit(cat.budgetLimit || '');
    setColor(cat.color || '#3b82f6');
    setSubcatText(cat.subcategoryList ? cat.subcategoryList.join(', ') : '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Category Name is required.');
      return;
    }

    // Check unique category name
    const existing = categories.find(c => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== (editingCategory?.id || ''));
    if (existing) {
      setError('Category with this name already exists.');
      return;
    }

    const subcategoryList = subcatText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const categoryData = {
      id: editingCategory ? editingCategory.id : 'cat-' + Date.now(),
      name: name.trim(),
      type,
      budgetLimit: type === 'expense' ? parseFloat(budgetLimit) || 0 : 0,
      color,
      subcategoryList
    };

    onSaveCategory(categoryData);
    setIsModalOpen(false);
  };

  const handleDelete = (id, catName) => {
    // Check if category is used in transactions
    const count = transactions.filter(t => t.category === catName).length;
    if (count > 0) {
      alert(`Cannot delete category "${catName}" because it is currently linked to ${count} transaction(s). Please edit or delete those transactions first.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete the category "${catName}"?`)) {
      onDeleteCategory(id);
    }
  };

  const formatBDT = (amount) => {
    return '৳' + Number(amount).toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const filteredCategories = categories.filter(c => c.type === activeTab);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle font-sans">Organize transactions and configure budget parameters</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} />
            Add Category
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', gap: '8px' }}>
        <button
          className={`btn ${activeTab === 'expense' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('expense')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, border: 'none' }}
        >
          Expense Categories
        </button>
        <button
          className={`btn ${activeTab === 'income' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('income')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, border: 'none' }}
        >
          Income Categories
        </button>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><FolderOpen size={24} /></div>
            <p className="empty-state-title">No categories configured</p>
            <p className="empty-state-desc">Create {activeTab} categories to categorize your financial records.</p>
          </div>
        </div>
      ) : (
        <div className="category-card-grid">
          {filteredCategories.map(cat => {
            // Count number of transaction items using this category
            const usageCount = transactions.filter(t => t.category === cat.name).length;
            const expenseSum = transactions
              .filter(t => t.category === cat.name && t.type === 'expense')
              .reduce((sum, t) => sum + t.amount, 0);

            return (
              <div className="card" key={cat.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: `5px solid ${cat.color}` }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {cat.name}
                    </h2>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn btn-secondary btn-circle btn-sm" onClick={() => handleOpenEdit(cat)} title="Edit Category">
                        <Edit2 size={12} />
                      </button>
                      <button className="btn btn-secondary btn-circle btn-sm" onClick={() => handleDelete(cat.id, cat.name)} style={{ color: 'var(--expense)' }} title="Delete Category">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {cat.type === 'expense' && cat.budgetLimit > 0 && (
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                      Budget: <span style={{ color: 'var(--text-primary)' }}>{formatBDT(cat.budgetLimit)}</span>
                    </div>
                  )}

                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Linked Transactions: <strong style={{ color: 'var(--text-primary)' }}>{usageCount}</strong>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Subcategories
                  </div>
                  {cat.subcategoryList && cat.subcategoryList.length > 0 ? (
                    <div className="category-badge-list">
                      {cat.subcategoryList.map((sub, i) => (
                        <span className="subcat-pill" key={i}>{sub}</span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>None configured</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Create Category'}</h2>
              <button className="btn btn-secondary btn-circle btn-sm" onClick={() => setIsModalOpen(false)} style={{ border: 'none' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="toast error" style={{ position: 'static', marginBottom: '16px', width: '100%', animation: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={18} />
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="cat-name">Category Name</label>
                  <input
                    id="cat-name"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Utilities, Fuel, Marketing"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category Type</label>
                  <div className="radio-group">
                    <div
                      className={`radio-card ${type === 'expense' ? 'active expense' : ''}`}
                      onClick={() => setType('expense')}
                    >
                      Expense Category
                    </div>
                    <div
                      className={`radio-card ${type === 'income' ? 'active income' : ''}`}
                      onClick={() => setType('income')}
                    >
                      Income Category
                    </div>
                  </div>
                </div>

                {type === 'expense' && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="cat-budget">Monthly Budget Limit (BDT) (Optional)</label>
                    <input
                      id="cat-budget"
                      type="number"
                      className="form-control"
                      placeholder="e.g. 15000 (0 for no limit)"
                      value={budgetLimit}
                      onChange={(e) => setBudgetLimit(e.target.value)}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Visual Label Color</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {colors.map(c => (
                      <div
                        key={c}
                        onClick={() => setColor(c)}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: c,
                          cursor: 'pointer',
                          border: color === c ? '3px solid var(--text-primary)' : '1px solid transparent',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      ></div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      className="form-control"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      style={{ width: '48px', height: '38px', padding: '2px' }}
                    />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Custom HEX Color Picker</span>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="cat-subcats">Subcategories (Comma separated)</label>
                  <textarea
                    id="cat-subcats"
                    className="form-control"
                    placeholder="e.g. Broadband, Grameenphone, GP Recharge"
                    value={subcatText}
                    onChange={(e) => setSubcatText(e.target.value)}
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Enter items separated by commas. These will display as smart presets inside transaction editors.
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} />
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
