import React, { useState } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, X, Download, FileSpreadsheet } from 'lucide-react';

export default function Transactions({
  transactions,
  categories,
  accounts,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onExportCSV
}) {
  // Filters State
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [account, setAccount] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Formatting Helpers
  const formatBDT = (amount) => {
    return '৳' + Number(amount).toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.split('-').reverse().join('/'); // YYYY-MM-DD to DD/MM/YYYY
  };

  // Filter Logic
  const filteredTransactions = transactions.filter(tx => {
    // 1. Search Query
    const query = search.toLowerCase();
    const matchesSearch = 
      tx.title.toLowerCase().includes(query) || 
      (tx.notes && tx.notes.toLowerCase().includes(query)) ||
      tx.category.toLowerCase().includes(query);

    // 2. Type Filter
    const matchesType = type === 'all' || tx.type === type;

    // 3. Category Filter
    const matchesCategory = category === 'all' || tx.category === category;

    // 4. Account Filter
    const matchesAccount = account === 'all' || tx.account === account;

    // 5. Payment Method Filter
    const matchesPaymentMethod = paymentMethod === 'all' || tx.paymentMethod === paymentMethod;

    // 6. Date Range Filter
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && tx.date >= startDate;
    }
    if (endDate) {
      matchesDate = matchesDate && tx.date <= endDate;
    }

    return matchesSearch && matchesType && matchesCategory && matchesAccount && matchesPaymentMethod && matchesDate;
  }).sort((a, b) => new Date(b.date) - new Date(a.date) || new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination Logic
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  // Reset page if filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, type, category, account, paymentMethod, startDate, endDate]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const handleClearFilters = () => {
    setSearch('');
    setType('all');
    setCategory('all');
    setAccount('all');
    setPaymentMethod('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Search, filter, and export transaction logs</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => onExportCSV(filteredTransactions)}>
            <Download size={18} />
            Export CSV
          </button>
          <button className="btn btn-primary" onClick={onAddClick}>
            <Plus size={18} />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="filter-panel">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Search</label>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search title, note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '34px' }}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Type</label>
          <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="income">Income (+)</option>
            <option value="expense">Expense (-)</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Category</label>
          <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Account</label>
          <select className="form-control" value={account} onChange={(e) => setAccount(e.target.value)}>
            <option value="all">All Accounts</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.name}>{acc.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Payment Method</label>
          <select className="form-control" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="all">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="bKash">bKash</option>
            <option value="Nagad">Nagad</option>
            <option value="Rocket">Rocket</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={handleClearFilters}
          style={{ height: '42px', padding: '0 16px' }}
        >
          Reset
        </button>
      </div>

      {/* Transactions Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {paginatedTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">৳</div>
            <p className="empty-state-title">No transactions found</p>
            <p className="empty-state-desc">Try modifying your filter settings or add a new transaction.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title & Notes</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Account</th>
                    <th>Method</th>
                    <th style={{ textAlignment: 'right' }}>Amount</th>
                    <th style={{ textAlignment: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map(tx => {
                    const catColor = categories.find(c => c.name === tx.category)?.color || '#94a3b8';
                    return (
                      <tr key={tx.id}>
                        <td style={{ fontWeight: 500 }}>{formatDate(tx.date)}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tx.title}</span>
                            {tx.subcategory && (
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                Subcategory: {tx.subcategory}
                              </span>
                            )}
                            {tx.notes && (
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                                Note: {tx.notes}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: catColor }}></span>
                            <span>{tx.category}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${tx.type}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td>{tx.account}</td>
                        <td>
                          <span className="subcat-pill">{tx.paymentMethod}</span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>
                          <span className={`amount-text ${tx.type}`}>
                            {tx.type === 'income' ? '+' : '-'}{formatBDT(tx.amount)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              className="btn btn-secondary btn-circle btn-sm"
                              onClick={() => onEditClick(tx)}
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className="btn btn-secondary btn-circle btn-sm"
                              onClick={() => onDeleteClick(tx.id)}
                              style={{ color: 'var(--expense)' }}
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="table-controls" style={{ padding: '16px 24px' }}>
              <span className="pagination-info">
                Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + itemsPerPage, totalItems)}</strong> of <strong>{totalItems}</strong> entries
              </span>
              <div className="pagination-buttons">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '13px', fontWeight: 600 }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
