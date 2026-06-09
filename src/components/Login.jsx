import React, { useState } from 'react';
import { LogIn, Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('demo@bdttracker.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    // Simulate API Auth
    setTimeout(() => {
      setLoading(false);
      if (email === 'demo@bdttracker.com' && password === 'demo123') {
        onLogin({
          name: 'Shakib Al Hasan',
          email: 'demo@bdttracker.com',
          business: 'Shakib Tech Enterprise'
        });
      } else {
        setError('Invalid email or password. Use the demo credentials.');
      }
    }, 800);
  };

  const handleDemoLogin = () => {
    setEmail('demo@bdttracker.com');
    setPassword('demo123');
    onLogin({
      name: 'Shakib Al Hasan',
      email: 'demo@bdttracker.com',
      business: 'Shakib Tech Enterprise'
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">৳</div>
          <h1 className="login-title">BDT Expense Tracker</h1>
          <p className="login-subtitle">Manage your personal and business finances</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="toast error" style={{ position: 'static', marginBottom: '20px', width: '100%', animation: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label className="form-label" htmlFor="password" style={{ margin: 0 }}>Password</label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Demo password recovery link clicked! In a production system, this sends an OTP to your email."); }} style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>
                Forgot Password?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', height: '44px' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'}
            {!loading && <LogIn size={18} />}
          </button>
        </form>

        <div className="demo-login-box">
          <h2 className="demo-login-title">Quick Demo Access</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '12px' }}>
            Click below to instantly access the dashboard with pre-loaded Bangladeshi transactions, accounts, and budgets.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDemoLogin}
            style={{ width: '100%', fontSize: '13px' }}
          >
            Log In as Demo User
          </button>
        </div>
      </div>
    </div>
  );
}
