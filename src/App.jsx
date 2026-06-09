import React, { useState, useEffect } from 'react';
import { 
  initialTransactions, 
  initialCategories, 
  initialAccounts, 
  loadData, 
  saveData 
} from './data/mockData';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import TransactionFormModal from './components/TransactionFormModal';
import Categories from './components/Categories';
import Accounts from './components/Accounts';
import Budgets from './components/Budgets';
import Reports from './components/Reports';

import { 
  LayoutDashboard, 
  Receipt, 
  FolderTree, 
  Wallet, 
  PiggyBank, 
  FileBarChart2, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  CheckCircle,
  AlertTriangle,
  Heart
} from 'lucide-react';

import './App.css';

export default function App() {
  // Global States
  const [user, setUser] = useState(() => loadData('user', null));
  const [theme, setTheme] = useState(() => loadData('theme', 'light'));
  const [activeTab, setActiveTab] = useState(() => loadData('active_tab', 'dashboard'));

  // User-scoped data loading
  const [transactions, setTransactions] = useState(() => {
    const activeUser = loadData('user', null);
    const userId = activeUser ? activeUser.id : 'user-demo';
    return loadData(`transactions_${userId}`, initialTransactions);
  });
  const [categories, setCategories] = useState(() => {
    const activeUser = loadData('user', null);
    const userId = activeUser ? activeUser.id : 'user-demo';
    return loadData(`categories_${userId}`, initialCategories);
  });
  const [accounts, setAccounts] = useState(() => {
    const activeUser = loadData('user', null);
    const userId = activeUser ? activeUser.id : 'user-demo';
    return loadData(`accounts_${userId}`, initialAccounts);
  });
  
  // Modal States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  // Mobile Nav Sidebar Toggle state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toast State
  const [toasts, setToasts] = useState([]);

  // Apply theme on load and change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveData('theme', theme);
  }, [theme]);

  // Persist user and sync their state
  useEffect(() => {
    saveData('user', user);
    if (user) {
      const userId = user.id;
      setTransactions(loadData(`transactions_${userId}`, initialTransactions));
      setCategories(loadData(`categories_${userId}`, initialCategories));
      setAccounts(loadData(`accounts_${userId}`, initialAccounts));
    }
  }, [user]);

  useEffect(() => {
    saveData('active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      saveData(`transactions_${user.id}`, transactions);
    }
  }, [transactions, user]);

  useEffect(() => {
    if (user) {
      saveData(`categories_${user.id}`, categories);
    }
  }, [categories, user]);

  useEffect(() => {
    if (user) {
      saveData(`accounts_${user.id}`, accounts);
    }
  }, [accounts, user]);

  // Toast Helper
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Auth Handlers
  const handleLogin = (userData) => {
    setUser(userData);
    addToast(`Assalamu Alaikum, ${userData.name}! Logged in successfully.`, 'success');
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      setUser(null);
      localStorage.removeItem('bdt_tracker_user');
      addToast("Logged out successfully.", 'info');
    }
  };

  // Transaction CRUD Handlers
  const handleSaveTransaction = (tx) => {
    const isEdit = transactions.some(t => t.id === tx.id);
    
    // Check if the budget for this category will be exceeded (only for expenses)
    if (tx.type === 'expense') {
      const catObj = categories.find(c => c.name === tx.category);
      if (catObj && catObj.budgetLimit > 0) {
        // Calculate current month's expenses for this category
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        
        // Sum expenses (exclude the old transaction if we are editing)
        const currentSpent = transactions
          .filter(t => {
            const d = new Date(t.date);
            return t.type === 'expense' && 
                   t.category === tx.category && 
                   d.getFullYear() === year && 
                   d.getMonth() === month &&
                   t.id !== tx.id;
          })
          .reduce((sum, t) => sum + t.amount, 0);

        if (currentSpent + tx.amount > catObj.budgetLimit) {
          addToast(`Budget warning: ${tx.category} has exceeded its monthly limit of ৳${catObj.budgetLimit.toLocaleString('en-BD')}`, 'warning');
        }
      }
    }

    if (isEdit) {
      setTransactions(prev => prev.map(t => t.id === tx.id ? tx : t));
      addToast("Transaction updated successfully!");
    } else {
      setTransactions(prev => [tx, ...prev]);
      addToast("Transaction logged successfully!");
    }

    setIsTxModalOpen(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    addToast("Transaction deleted successfully.", 'error');
    setDeleteConfirmId(null);
  };

  // Category Handlers
  const handleSaveCategory = (cat) => {
    const isEdit = categories.some(c => c.id === cat.id);
    if (isEdit) {
      setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
      addToast(`Category "${cat.name}" updated successfully.`);
    } else {
      setCategories(prev => [...prev, cat]);
      addToast(`Category "${cat.name}" created successfully.`);
    }
  };

  const handleDeleteCategory = (id) => {
    const catToDelete = categories.find(c => c.id === id);
    setCategories(prev => prev.filter(c => c.id !== id));
    addToast(`Category "${catToDelete?.name}" deleted.`, 'error');
  };

  // Account Handlers
  const handleSaveAccount = (acc) => {
    const isEdit = accounts.some(a => a.id === acc.id);
    if (isEdit) {
      setAccounts(prev => prev.map(a => a.id === acc.id ? acc : a));
      addToast(`Account "${acc.name}" updated.`);
    } else {
      setAccounts(prev => [...prev, acc]);
      addToast(`Account "${acc.name}" created.`);
    }
  };

  const handleDeleteAccount = (id) => {
    const accToDelete = accounts.find(a => a.id === id);
    setAccounts(prev => prev.filter(a => a.id !== id));
    addToast(`Account "${accToDelete?.name}" deleted.`, 'error');
  };

  // Export CSV Helper (used in Transactions & Reports)
  const handleExportCSV = (txList) => {
    const headers = ['Date', 'Title', 'Type', 'Category', 'Subcategory', 'Account', 'Payment Method', 'Amount', 'Notes'];
    const rows = txList.map(t => [
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
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bdt_transactions_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("CSV export initiated.");
  };

  // Render View Selector
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            transactions={transactions} 
            categories={categories}
            accounts={accounts}
            onAddTransactionClick={() => {
              setEditingTransaction(null);
              setIsTxModalOpen(true);
            }}
            onDeleteTransaction={(id) => setDeleteConfirmId(id)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'transactions':
        return (
          <Transactions
            transactions={transactions}
            categories={categories}
            accounts={accounts}
            onAddClick={() => {
              setEditingTransaction(null);
              setIsTxModalOpen(true);
            }}
            onEditClick={(tx) => {
              setEditingTransaction(tx);
              setIsTxModalOpen(true);
            }}
            onDeleteClick={(id) => setDeleteConfirmId(id)}
            onExportCSV={handleExportCSV}
          />
        );
      case 'categories':
        return (
          <Categories
            categories={categories}
            transactions={transactions}
            onSaveCategory={handleSaveCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        );
      case 'accounts':
        return (
          <Accounts
            accounts={accounts}
            transactions={transactions}
            onSaveAccount={handleSaveAccount}
            onDeleteAccount={handleDeleteAccount}
          />
        );
      case 'budgets':
        return (
          <Budgets
            categories={categories}
            transactions={transactions}
            onSaveCategory={handleSaveCategory}
          />
        );
      case 'reports':
        return (
          <Reports
            transactions={transactions}
            categories={categories}
            accounts={accounts}
          />
        );
      default:
        return <div className="card">Page not found.</div>;
    }
  };

  // If not logged in, render the login view
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Sidebar Menu Items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'transactions', label: 'Transactions', icon: <Receipt size={18} /> },
    { id: 'categories', label: 'Categories', icon: <FolderTree size={18} /> },
    { id: 'accounts', label: 'Accounts', icon: <Wallet size={18} /> },
    { id: 'budgets', label: 'Budgets', icon: <PiggyBank size={18} /> },
    { id: 'reports', label: 'Reports', icon: <FileBarChart2 size={18} /> },
  ];

  return (
    <div className="app-container">
      {/* Sidebar - Desktop */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">৳</div>
          <div>
            <div className="brand-name">BDT Tracker</div>
            <div className="brand-beta">Local mock</div>
          </div>
        </div>
        <nav className="sidebar-menu">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        
        {/* User Card */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.business}</div>
          </div>
          <button 
            className="btn btn-secondary btn-circle btn-sm"
            onClick={handleLogout}
            title="Log Out"
            style={{ border: 'none' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Layout Wrap */}
      <div className="main-content">
        {/* Top Navbar */}
        <header className="top-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="theme-toggle-btn" 
              onClick={() => setMobileMenuOpen(prev => !prev)}
              style={{ display: 'none' }} /* shown on mobile */
              className="theme-toggle-btn mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }}>
              {menuItems.find(i => i.id === activeTab)?.label}
            </h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Theme Toggle */}
            <button 
              className="theme-toggle-btn"
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            
            {/* Short User Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => addToast("User profile details: Shakib Al Hasan. Local Account.")}>
              <div className="user-avatar" style={{ width: '36px', height: '36px', fontSize: '14px' }}>
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="user-name" style={{ display: 'inline', fontSize: '13px', fontWeight: 600 }}>
                {user.name}
              </span>
            </div>
          </div>
        </header>

        {/* Mobile Nav Sidebar Draw Overlay */}
        {mobileMenuOpen && (
          <div 
            style={{ position: 'fixed', top: 'var(--header-height)', left: 0, width: '100%', height: 'calc(100vh - var(--header-height))', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 90 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <div 
              style={{ width: '240px', height: '100%', backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', padding: '16px' }}
              onClick={(e) => e.stopPropagation()}
            >
              {menuItems.map(item => (
                <button
                  key={item.id}
                  className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', marginBottom: '8px' }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              <button
                className="sidebar-item"
                onClick={handleLogout}
                style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', color: 'var(--expense)', marginTop: 'auto' }}
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Page Body content */}
        <main className="page-body">
          {renderActiveView()}
        </main>
        
        {/* Footer */}
        <footer style={{ textAlign: 'center', padding: '24px', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)' }}>
          Made with <Heart size={10} style={{ color: 'var(--expense)', fill: 'var(--expense)' }} /> for Bangladeshi Finance Management. BDT Tracker &copy; 2026.
        </footer>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-nav">
        {menuItems.slice(0, 5).map(item => (
          <button
            key={item.id}
            className={`mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Global Form Modal for Add/Edit Transaction */}
      <TransactionFormModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        accounts={accounts}
        editingTransaction={editingTransaction}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="dialog-content">
              <div className="dialog-icon">
                <AlertTriangle size={32} />
              </div>
              <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Confirm Deletion</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Are you sure you want to delete this transaction record? This action is permanent and cannot be undone.
              </p>
              <div className="dialog-buttons">
                <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={() => handleDeleteTransaction(deleteConfirmId)}>
                  Delete Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications rendering */}
      <div className="toast-container">
        {toasts.map(t => (
          <div className={`toast ${t.type}`} key={t.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <CheckCircle size={18} />
              <span>{t.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
