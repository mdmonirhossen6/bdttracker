import React, { useState } from 'react';
import { LogIn, Lock, Mail, User, Briefcase, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

export default function Login({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Sign In / Sign Up Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper: Retrieve all registered users
  const getRegisteredUsers = () => {
    const defaultUser = {
      id: 'user-demo',
      name: 'Shakib Al Hasan',
      email: 'demo@bdttracker.com',
      password: 'demo123',
      business: 'Shakib Tech Enterprise'
    };
    
    const stored = localStorage.getItem('bdt_tracker_registered_users');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse registered users', e);
      }
    }
    // Return array with default seed user
    return [defaultUser];
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const users = getRegisteredUsers();
      const matchedUser = users.find(
        u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
      );

      if (matchedUser) {
        onLogin({
          id: matchedUser.id,
          name: matchedUser.name,
          email: matchedUser.email,
          business: matchedUser.business
        });
      } else {
        setError('Invalid email or password. Use demo credentials or sign up.');
      }
    }, 600);
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const users = getRegisteredUsers();
      
      // Check if email already exists
      const exists = users.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (exists) {
        setError('An account with this email already exists.');
        return;
      }

      // Create new user object
      const newUser = {
        id: 'user-' + Date.now(),
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        business: businessName.trim() || 'Personal Finance'
      };

      // Save to list
      const updatedUsers = [...users, newUser];
      localStorage.setItem('bdt_tracker_registered_users', JSON.stringify(updatedUsers));
      
      setSuccess('Account created successfully! Logging you in...');
      
      setTimeout(() => {
        onLogin({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          business: newUser.business
        });
      }, 1000);

    }, 800);
  };

  const handleDemoLogin = () => {
    const users = getRegisteredUsers();
    const demoUser = users.find(u => u.email === 'demo@bdttracker.com') || {
      id: 'user-demo',
      name: 'Shakib Al Hasan',
      email: 'demo@bdttracker.com',
      password: 'demo123',
      business: 'Shakib Tech Enterprise'
    };

    onLogin({
      id: demoUser.id,
      name: demoUser.name,
      email: demoUser.email,
      business: demoUser.business
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">৳</div>
          <h1 className="login-title">BDT Expense Tracker</h1>
          <p className="login-subtitle">
            {isSignUp ? 'Create your personal or business ledger account' : 'Manage your personal and business finances'}
          </p>
        </div>

        {/* Display Status Messages */}
        {error && (
          <div className="toast error" style={{ position: 'static', marginBottom: '20px', width: '100%', animation: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="toast success" style={{ position: 'static', marginBottom: '20px', width: '100%', animation: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} />
              <span>{success}</span>
            </div>
          </div>
        )}

        {/* SIGN IN VIEW */}
        {!isSignUp && (
          <form onSubmit={handleSignIn}>
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

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
              <a 
                href="#signup" 
                onClick={(e) => { e.preventDefault(); setError(''); setSuccess(''); setIsSignUp(true); }}
                style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}
              >
                Sign Up
              </a>
            </div>
          </form>
        )}

        {/* SIGN UP VIEW */}
        {isSignUp && (
          <form onSubmit={handleSignUp}>
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="fullName"
                  type="text"
                  className="form-control"
                  placeholder="Shakib Al Hasan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="businessName">Business / Ledger Name (Optional)</label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="businessName"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Shakib Tech Enterprise, Personal"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="su-email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="su-email"
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

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="su-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="su-password"
                    type="password"
                    className="form-control"
                    placeholder="Min 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="confirmPassword"
                    type="password"
                    className="form-control"
                    placeholder="Retype"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px', height: '44px' }}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight size={18} />}
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
              <a 
                href="#signin" 
                onClick={(e) => { e.preventDefault(); setError(''); setSuccess(''); setIsSignUp(false); }}
                style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}
              >
                Sign In
              </a>
            </div>
          </form>
        )}

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
