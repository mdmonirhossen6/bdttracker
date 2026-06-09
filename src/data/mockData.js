export const initialCategories = [
  { id: 'cat-1', name: 'Salary', type: 'income', subcategoryList: ['Main Job', 'Freelance', 'Bonus'], budgetLimit: 0, color: '#10b981' },
  { id: 'cat-2', name: 'Business Income', type: 'income', subcategoryList: ['Sales', 'Consultancy'], budgetLimit: 0, color: '#059669' },
  { id: 'cat-3', name: 'Rent', type: 'expense', subcategoryList: ['House Rent', 'Office Rent', 'Garage'], budgetLimit: 25000, color: '#3b82f6' },
  { id: 'cat-4', name: 'Utilities', type: 'expense', subcategoryList: ['Electricity', 'Water', 'Gas', 'Wasa'], budgetLimit: 8000, color: '#f59e0b' },
  { id: 'cat-5', name: 'Grocery', type: 'expense', subcategoryList: ['Bazar', 'Superstore', 'Daily Needs'], budgetLimit: 15000, color: '#ef4444' },
  { id: 'cat-6', name: 'Food & Dining', type: 'expense', subcategoryList: ['Restaurant', 'Food Delivery', 'Tea & Snacks'], budgetLimit: 8000, color: '#14b8a6' },
  { id: 'cat-7', name: 'Transport', type: 'expense', subcategoryList: ['Rickshaw', 'Uber/Pathao', 'Bus', 'Train'], budgetLimit: 5000, color: '#8b5cf6' },
  { id: 'cat-8', name: 'Internet & Mobile', type: 'expense', subcategoryList: ['Broadband', 'Grameenphone', 'bKash Recharge', 'Nagad Recharge'], budgetLimit: 3000, color: '#06b6d4' },
  { id: 'cat-9', name: 'Medical & Health', type: 'expense', subcategoryList: ['Medicine', 'Doctor Fee', 'Diagnostic'], budgetLimit: 5000, color: '#f43f5e' },
  { id: 'cat-10', name: 'Shopping', type: 'expense', subcategoryList: ['Clothing', 'Electronics', 'Footwear'], budgetLimit: 12000, color: '#ec4899' },
  { id: 'cat-11', name: 'Tuition & Education', type: 'expense', subcategoryList: ['School Fees', 'Coaching', 'Books'], budgetLimit: 10000, color: '#6366f1' },
  { id: 'cat-12', name: 'Loan Payment', type: 'expense', subcategoryList: ['Home Loan', 'Personal Loan'], budgetLimit: 15000, color: '#475569' },
  { id: 'cat-13', name: 'Investment', type: 'expense', subcategoryList: ['Share Market', 'DPS', 'Sanchayapatra'], budgetLimit: 20000, color: '#0284c7' },
  { id: 'cat-14', name: 'Miscellaneous', type: 'expense', subcategoryList: ['Charity', 'Gifts', 'Others'], budgetLimit: 5000, color: '#a1a1aa' }
];

export const initialAccounts = [
  { id: 'acc-1', name: 'Cash', type: 'Cash', openingBalance: 10000, currentBalance: 8500, active: true },
  { id: 'acc-2', name: 'Bank Account', type: 'Bank Transfer', openingBalance: 150000, currentBalance: 182300, active: true },
  { id: 'acc-3', name: 'bKash Personal', type: 'bKash', openingBalance: 15000, currentBalance: 12400, active: true },
  { id: 'acc-4', name: 'Nagad Wallet', type: 'Nagad', openingBalance: 5000, currentBalance: 4200, active: true },
  { id: 'acc-5', name: 'Rocket Wallet', type: 'Rocket', openingBalance: 2000, currentBalance: 1800, active: true },
  { id: 'acc-6', name: 'Credit Card', type: 'Credit Card', openingBalance: 0, currentBalance: -4500, active: true }
];

// Seed standard transactions with modern dynamic dates to ensure the dashboard charts and reports render nicely relative to "current date"
// The dates are stored as YYYY-MM-DD
const today = new Date();
const formatDate = (daysAgo) => {
  const d = new Date();
  d.setDate(today.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const initialTransactions = [
  {
    id: 'tx-1',
    date: formatDate(0),
    title: 'Monthly House Rent',
    type: 'expense',
    category: 'Rent',
    subcategory: 'House Rent',
    account: 'Bank Account',
    paymentMethod: 'Bank Transfer',
    amount: 22000,
    notes: 'Paid house rent for June',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-2',
    date: formatDate(1),
    title: 'Salary Credit',
    type: 'income',
    category: 'Salary',
    subcategory: 'Main Job',
    account: 'Bank Account',
    paymentMethod: 'Bank Transfer',
    amount: 85000,
    notes: 'Monthly salary from company',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-3',
    date: formatDate(2),
    title: 'Weekly Grocery Bazar',
    type: 'expense',
    category: 'Grocery',
    subcategory: 'Bazar',
    account: 'Cash',
    paymentMethod: 'Cash',
    amount: 3200,
    notes: 'Kacha Bazar from Karwan Bazar',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-4',
    date: formatDate(2),
    title: 'Mobile Recharge',
    type: 'expense',
    category: 'Internet & Mobile',
    subcategory: 'Grameenphone',
    account: 'bKash Personal',
    paymentMethod: 'bKash',
    amount: 500,
    notes: 'Internet package buy',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-5',
    date: formatDate(4),
    title: 'Dinner at Pizza Express',
    type: 'expense',
    category: 'Food & Dining',
    subcategory: 'Restaurant',
    account: 'Credit Card',
    paymentMethod: 'Credit Card',
    amount: 2450,
    notes: 'Family dinner',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-6',
    date: formatDate(5),
    title: 'Freelance UI Design',
    type: 'income',
    category: 'Salary',
    subcategory: 'Freelance',
    account: 'bKash Personal',
    paymentMethod: 'bKash',
    amount: 18000,
    notes: 'Client payment for website design',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-7',
    date: formatDate(7),
    title: 'Pathao Rides Weekly',
    type: 'expense',
    category: 'Transport',
    subcategory: 'Uber/Pathao',
    account: 'Nagad Wallet',
    paymentMethod: 'Nagad',
    amount: 1200,
    notes: 'Office commute',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-8',
    date: formatDate(8),
    title: 'Monthly Internet Bill',
    type: 'expense',
    category: 'Internet & Mobile',
    subcategory: 'Broadband',
    account: 'bKash Personal',
    paymentMethod: 'bKash',
    amount: 1000,
    notes: 'Dot Internet monthly charge',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-9',
    date: formatDate(10),
    title: 'Electricity Bill (DESCO)',
    type: 'expense',
    category: 'Utilities',
    subcategory: 'Electricity',
    account: 'Nagad Wallet',
    paymentMethod: 'Nagad',
    amount: 4500,
    notes: 'May bill',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-10',
    date: formatDate(12),
    title: 'Sanchayapatra Investment',
    type: 'expense',
    category: 'Investment',
    subcategory: 'Sanchayapatra',
    account: 'Bank Account',
    paymentMethod: 'Bank Transfer',
    amount: 15000,
    notes: 'Monthly post office sanchayapatra buy',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-11',
    date: formatDate(15),
    title: 'Medical Checkup & Medicine',
    type: 'expense',
    category: 'Medical & Health',
    subcategory: 'Medicine',
    account: 'Cash',
    paymentMethod: 'Cash',
    amount: 1850,
    notes: 'Bought insulin and BP checkup',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-12',
    date: formatDate(20),
    title: 'New Panjabi for Event',
    type: 'expense',
    category: 'Shopping',
    subcategory: 'Clothing',
    account: 'Credit Card',
    paymentMethod: 'Credit Card',
    amount: 4200,
    notes: 'Bought from Aarong',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-13',
    date: formatDate(25),
    title: 'Interest Credit',
    type: 'income',
    category: 'Business Income',
    subcategory: 'Consultancy',
    account: 'Bank Account',
    paymentMethod: 'Bank Transfer',
    amount: 5000,
    notes: 'Consulting bank interest',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-14',
    date: formatDate(28),
    title: 'Rickshaw Fares',
    type: 'expense',
    category: 'Transport',
    subcategory: 'Rickshaw',
    account: 'Cash',
    paymentMethod: 'Cash',
    amount: 650,
    notes: 'Local travel bazar/office',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-15',
    date: formatDate(35),
    title: 'Previous Month Rent',
    type: 'expense',
    category: 'Rent',
    subcategory: 'House Rent',
    account: 'Bank Account',
    paymentMethod: 'Bank Transfer',
    amount: 22000,
    notes: 'May Rent payment',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-16',
    date: formatDate(36),
    title: 'Previous Salary Credit',
    type: 'income',
    category: 'Salary',
    subcategory: 'Main Job',
    account: 'Bank Account',
    paymentMethod: 'Bank Transfer',
    amount: 85000,
    notes: 'May Salary',
    createdAt: new Date().toISOString()
  }
];

export const loadData = (key, defaults) => {
  const data = localStorage.getItem(`bdt_tracker_${key}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse storage key: ' + key, e);
    }
  }
  return defaults;
};

export const saveData = (key, data) => {
  localStorage.setItem(`bdt_tracker_${key}`, JSON.stringify(data));
};
