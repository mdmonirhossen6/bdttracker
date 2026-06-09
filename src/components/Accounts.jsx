import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, ShieldAlert, CreditCard } from 'lucide-react';

export default function Accounts({
  accounts,
  transactions,
  onSaveAccount,
  onDeleteAccount
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('Cash');
  const [openingBalance, setOpeningBalance] = useState('');
  const [error, setError] = useState('');

  const accountTypes = ['Cash', 'Bank Transfer', 'bKash', 'Nagad', 'Rocket', 'Credit Card', 'Debit Card'];

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setName('');
    setType('Cash');
    setOpeningBalance('0');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setOpeningBalance(acc.openingBalance.toString());
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Account Name is required.');
      return;
    }

    // Check unique account name
    const existing = accounts.find(a => a.name.toLowerCase() === name.trim().toLowerCase() && a.id !== (editingAccount?.id || ''));
    if (existing) {
      setError('Account with this name already exists.');
      return;
    }

    const accountData = {
      id: editingAccount ? editingAccount.id : 'acc-' + Date.now(),
      name: name.trim(),
      type,
      openingBalance: parseFloat(openingBalance) || 0,
      active: editingAccount ? editingAccount.active : true
    };

    onSaveAccount(accountData);
    setIsModalOpen(false);
  };

  const handleToggleActive = (acc) => {
    const updated = { ...acc, active: !acc.active };
    onSaveAccount(updated);
  };

  const handleDelete = (id, accName) => {
    // Check if account has transactions
    const count = transactions.filter(t => t.account === accName).length;
    if (count > 0) {
      alert(`Cannot delete account "${accName}" because it is currently linked to ${count} transaction(s). You can toggle it to "Inactive" instead to hide it from data entries.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${accName}"?`)) {
      onDeleteAccount(id);
    }
  };

  // Helper: Format BDT
  const formatBDT = (amount) => {
    return '৳' + Number(amount).toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Calculate dynamic balances and transactions
  const accountsWithBalances = accounts.map(acc => {
    const accTxs = transactions.filter(t => t.account === acc.name);
    const totalIncome = accTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = accTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const currentBalance = acc.openingBalance + totalIncome - totalExpense;

    return {
      ...acc,
      currentBalance,
      txCount: accTxs.length
    };
  });

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">Accounts</h1>
          <p className="page-subtitle">Configure financial wallets and check real-time balances</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} />
            Add Account
          </button>
        </div>
      </div>

      {/* Grid of Accounts */}
      <div className="category-card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {accountsWithBalances.map(acc => (
          <div 
            className="card" 
            key={acc.id} 
            style={{ 
              opacity: acc.active ? 1 : 0.6,
              transition: 'opacity var(--transition-normal)'
            }}
          >
            <div className="account-card-header">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="account-type">{acc.type}</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{acc.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div 
                  className={`account-status-dot ${acc.active ? 'active' : 'inactive'}`} 
                  title={acc.active ? 'Active' : 'Inactive'}
                ></div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {acc.active ? 'Active' : 'Archived'}
                </span>
              </div>
            </div>

            <div style={{ margin: '16px 0' }}>
              <div className="account-balance-label">Current Balance</div>
              <div className={`account-balance-val ${acc.currentBalance < 0 ? 'expense' : ''}`}>
                {formatBDT(acc.currentBalance)}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Opening: <strong style={{ color: 'var(--text-primary)' }}>{formatBDT(acc.openingBalance)}</strong> • <strong style={{ color: 'var(--text-primary)' }}>{acc.txCount}</strong> txs
              </div>
              
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => handleToggleActive(acc)}
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                >
                  {acc.active ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                  className="btn btn-secondary btn-circle btn-sm"
                  onClick={() => handleOpenEdit(acc)}
                  title="Edit Opening Balance"
                >
                  <Edit2 size={12} />
                </button>
                <button 
                  className="btn btn-secondary btn-circle btn-sm"
                  onClick={() => handleDelete(acc.id, acc.name)}
                  style={{ color: 'var(--expense)' }}
                  title="Delete Account"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Account Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h2>{editingAccount ? 'Edit Account' : 'Create Account'}</h2>
              <button className="btn btn-secondary btn-circle btn-sm" onClick={() => setIsModalOpen(false)} style={{ border: 'none' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="toast error" style={{ position: 'static', marginBottom: '16px', width: '100%', animation: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldAlert size={18} />
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="acc-name">Account Name</label>
                  <input
                    id="acc-name"
                    type="text"
                    className="form-control"
                    placeholder="e.g. bKash Personal, Prime Bank, Cash in Hand"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="acc-type">Account Type / Method</label>
                  <select
                    id="acc-type"
                    className="form-control"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                  >
                    {accountTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="acc-opening">Opening Balance (BDT)</label>
                  <input
                    id="acc-opening"
                    type="number"
                    className="form-control"
                    placeholder="e.g. 5000"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    This serves as the starting balance. All transactions added/removed will dynamically scale this balance.
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} />
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
