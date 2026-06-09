import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

export default function TransactionFormModal({
  isOpen,
  onClose,
  onSave,
  categories,
  accounts,
  editingTransaction
}) {
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [accountName, setAccountName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  
  const [errors, setErrors] = useState({});

  // Effect to load editing transaction if present
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type || 'expense');
      setDate(editingTransaction.date || new Date().toISOString().split('T')[0]);
      setTitle(editingTransaction.title || '');
      setCategoryName(editingTransaction.category || '');
      setSubcategory(editingTransaction.subcategory || '');
      setAccountName(editingTransaction.account || '');
      setPaymentMethod(editingTransaction.paymentMethod || 'Cash');
      setAmount(editingTransaction.amount || '');
      setNotes(editingTransaction.notes || '');
    } else {
      // Set defaults for new transaction
      setType('expense');
      setDate(new Date().toISOString().split('T')[0]);
      setTitle('');
      
      const expCats = categories.filter(c => c.type === 'expense');
      setCategoryName(expCats.length > 0 ? expCats[0].name : '');
      
      setSubcategory('');
      
      const actAccs = accounts.filter(a => a.active);
      setAccountName(actAccs.length > 0 ? actAccs[0].name : '');
      
      setPaymentMethod('Cash');
      setAmount('');
      setNotes('');
    }
    setErrors({});
  }, [editingTransaction, isOpen, categories, accounts]);

  // Adjust category list when type changes
  useEffect(() => {
    if (!editingTransaction) {
      const filteredCats = categories.filter(c => c.type === type);
      if (filteredCats.length > 0) {
        setCategoryName(filteredCats[0].name);
      } else {
        setCategoryName('');
      }
    }
  }, [type, categories]);

  // Adjust subcategories when category changes
  const activeCategoryObj = categories.find(c => c.name === categoryName);
  const subcategoryList = activeCategoryObj ? activeCategoryObj.subcategoryList : [];

  useEffect(() => {
    if (!editingTransaction && subcategoryList.length > 0) {
      setSubcategory(subcategoryList[0]);
    }
  }, [categoryName]);

  if (!isOpen) return null;

  const validate = () => {
    const tempErrors = {};
    if (!title.trim()) tempErrors.title = 'Title is required';
    if (!date) tempErrors.date = 'Date is required';
    if (!categoryName) tempErrors.category = 'Category is required';
    if (!accountName) tempErrors.account = 'Account is required';
    if (!paymentMethod) tempErrors.paymentMethod = 'Payment Method is required';
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      tempErrors.amount = 'Amount must be a positive number';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const transactionData = {
      id: editingTransaction ? editingTransaction.id : 'tx-' + Date.now(),
      date,
      title: title.trim(),
      type,
      category: categoryName,
      subcategory: subcategory || 'Others',
      account: accountName,
      paymentMethod,
      amount: parseFloat(amount),
      notes: notes.trim(),
      createdAt: editingTransaction ? editingTransaction.createdAt : new Date().toISOString()
    };

    onSave(transactionData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '18px' }}>
            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button 
            className="btn btn-secondary btn-circle btn-sm" 
            onClick={onClose}
            style={{ border: 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            {/* Type selector */}
            <div className="form-group">
              <label className="form-label">Transaction Type</label>
              <div className="radio-group">
                <div 
                  className={`radio-card ${type === 'expense' ? 'active expense' : ''}`}
                  onClick={() => setType('expense')}
                >
                  Expense (-)
                </div>
                <div 
                  className={`radio-card ${type === 'income' ? 'active income' : ''}`}
                  onClick={() => setType('income')}
                >
                  Income (+)
                </div>
              </div>
            </div>

            {/* Date & Title */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="tx-date">Date</label>
                <input
                  id="tx-date"
                  type="date"
                  className={`form-control ${errors.date ? 'error' : ''}`}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
                {errors.date && <span style={{ fontSize: '11px', color: 'var(--expense)' }}>{errors.date}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="tx-amount">Amount (BDT)</label>
                <input
                  id="tx-amount"
                  type="number"
                  step="any"
                  className="form-control"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                {errors.amount && <span style={{ fontSize: '11px', color: 'var(--expense)' }}>{errors.amount}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tx-title">Title / Payee</label>
              <input
                id="tx-title"
                type="text"
                className="form-control"
                placeholder="e.g. Rice & Vegetables, Internet Bill, Salary Credit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              {errors.title && <span style={{ fontSize: '11px', color: 'var(--expense)' }}>{errors.title}</span>}
            </div>

            {/* Category & Subcategory */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="tx-category">Category</label>
                <select
                  id="tx-category"
                  className="form-control"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Category</option>
                  {categories.filter(c => c.type === type).map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="tx-subcategory">Subcategory</label>
                {subcategoryList.length > 0 ? (
                  <select
                    id="tx-subcategory"
                    className="form-control"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                  >
                    {subcategoryList.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                    <option value="Others">Others</option>
                  </select>
                ) : (
                  <input
                    id="tx-subcategory"
                    type="text"
                    className="form-control"
                    placeholder="e.g. GP, Rent, Bazar"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                  />
                )}
              </div>
            </div>

            {/* Account & Payment Method */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="tx-account">Account</label>
                <select
                  id="tx-account"
                  className="form-control"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Account</option>
                  {accounts.filter(a => a.active).map(acc => (
                    <option key={acc.id} value={acc.name}>{acc.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="tx-method">Payment Method</label>
                <select
                  id="tx-method"
                  className="form-control"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="tx-notes">Notes / Description (Optional)</label>
              <textarea
                id="tx-notes"
                className="form-control"
                placeholder="Add shopping items details, transfer details, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={18} />
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
