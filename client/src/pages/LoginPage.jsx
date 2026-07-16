import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft, Wallet, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { login as apiLogin, register as apiRegister, googleLogin as apiGoogleLogin } from '../services/api.js';
import '../index.css';

/* ─── Auth helpers ───────────────────────────── */
const getToken = () => localStorage.getItem('wf_token');
const getUser  = () => { try { return JSON.parse(localStorage.getItem('wf_user')); } catch { return null; } };
const saveAuth = (token, user) => {
  localStorage.setItem('wf_token', token);
  localStorage.setItem('wf_user', JSON.stringify(user));
};
const clearAuth = () => {
  localStorage.removeItem('wf_token');
  localStorage.removeItem('wf_user');
  localStorage.removeItem('wf_workspace');
};

/* ─── Constants ──────────────────────────────── */

export default function LoginPage({ onLogin, onBack }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showMockGoogle, setShowMockGoogle] = useState(false);
  const [mockEmail, setMockEmail] = useState('');
  const [mockName, setMockName]   = useState('');

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '123456-dummy.apps.googleusercontent.com';
  const isGoogleConfigured = clientId && clientId !== '123456-dummy.apps.googleusercontent.com' && clientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE' && !clientId.includes('YOUR_GOOGLE_CLIENT_');

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const { data } = await apiGoogleLogin(tokenResponse.access_token);
        saveAuth(data.token, data.user);
        onLogin(data.user);
      } catch (err) {
        setError(err.response?.data?.message || 'Google Login failed.');
      } finally { setLoading(false); }
    },
    onError: () => setError('Google Sign-In was unsuccessful.')
  });

  const handleMockGoogleLogin = async (mEmail, mName) => {
    setShowMockGoogle(false);
    setLoading(true);
    try {
      const mockToken = `mock_google_token_email=${encodeURIComponent(mEmail)}&name=${encodeURIComponent(mName || mEmail.split('@')[0])}`;
      const { data } = await apiGoogleLogin(mockToken);
      saveAuth(data.token, data.user);
      onLogin(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Google Login failed.');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        if (!name || !email || !password) { setError('Please fill in all fields.'); setLoading(false); return; }
        const { data } = await apiRegister({ name, email, password });
        saveAuth(data.token, data.user);
        onLogin(data.user);
      } else {
        if (!email || !password) { setError('Please fill in all fields.'); setLoading(false); return; }
        const { data } = await apiLogin({ email, password });
        saveAuth(data.token, data.user);
        onLogin(data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <header className="login-topbar">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={onBack}>
          <div className="logo-icon"><Wallet size={16} color="#fff" /></div>WalletFlow
        </div>
        <button className="btn btn-outline" onClick={onBack}>Get Started</button>
      </header>
      <div className="login-body">
        <div className="login-card">
          <div className="login-left">
            <img src="/login-bg.jpg" alt="" className="login-left-bg" />
            <div className="login-left-overlay" />
            <div className="login-left-content">
              <div className="login-eyebrow">Precision Liquidity</div>
              <h2>Master your capital flow with surgical precision.</h2>
              <p>Experience the tranquility of perfectly organized enterprise-grade finance management.</p>
            </div>
            <div className="login-security-badge">
              <ShieldCheck size={18} color="#00B27A" />
              <div><strong>Bank-grade 256-bit encryption</strong><span>Your data is secured by industry-leading protocols.</span></div>
            </div>
          </div>
          <div className="login-right">
            <div className="login-form-wrap">
              <h1 className="login-title">{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
              <p className="login-sub">{isRegister ? 'Sign up to start tracking your finances.' : 'Log in to manage your financial portfolio.'}</p>
              {error && <div className="login-error"><AlertCircle size={15} />{error}</div>}
              <form onSubmit={handleSubmit} className="login-form">
                {isRegister && (
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <div className="input-wrap"><User size={16} className="input-icon" /><input id="name" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} /></div>
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrap"><Mail size={16} className="input-icon" /><input id="email" type="email" placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
                </div>
                <div className="form-group">
                  <div className="label-row"><label htmlFor="password">Password</label>{!isRegister && <a href="#" className="forgot-link" onClick={e => { e.preventDefault(); alert('Password reset links will be configured soon.'); }}>Forgot Password?</a>}</div>
                  <div className="input-wrap">
                    <Lock size={16} className="input-icon" />
                    <input id="password" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                    <button type="button" className="eye-btn" onClick={() => setShowPass(v => !v)} tabIndex={-1}>{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                </div>
                <button type="submit" className={`btn btn-dark login-submit ${loading ? 'loading' : ''}`} disabled={loading}>
                  {loading ? <span className="spinner" /> : <>{isRegister ? 'Sign Up' : 'Log In'} <ArrowRight size={16} /></>}
                </button>
              </form>
              <div className="login-divider"><span>Or continue with</span></div>
              <button 
                type="button" 
                className="btn-google" 
                onClick={() => {
                  if (isGoogleConfigured) {
                    googleLogin();
                  } else {
                    setShowMockGoogle(true);
                  }
                }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.8 2.4 30.3 0 24 0 14.8 0 6.9 5.4 3 13.3l7.8 6c1.8-5.4 6.9-9.8 13.2-9.8z"/>
                  <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.9-2.2 5.4-4.7 7l7.3 5.7c4.3-4 6.8-9.9 6.8-16.7z"/>
                  <path fill="#FBBC05" d="M10.8 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7L2.5 13.3A24 24 0 0 0 0 24c0 3.8.9 7.4 2.5 10.7l8.3-6z"/>
                  <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2.2 1.5-5 2.4-8.6 2.4-6.3 0-11.4-4.3-13.2-9.8l-7.8 6C6.9 42.6 14.8 48 24 48z"/>
                </svg>
                Sign in with Google
              </button>
              <p className="login-signup">
                {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                <a href="#" onClick={e => { e.preventDefault(); setIsRegister(!isRegister); setError(''); }}>
                  {isRegister ? 'Log In' : 'Sign Up'}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <footer className="login-footer">
        <div className="logo" style={{ cursor:'pointer' }} onClick={onBack}><div className="logo-icon" style={{ background:'#6b7280' }}><Wallet size={14} color="#fff" /></div>WalletFlow</div>
        <div className="login-footer-links"><a href="#">Privacy Policy</a><a href="#">Terms of Service</a><a href="#">Security</a></div>
        <span>© 2024 WalletFlow Inc. All rights reserved.</span>
      </footer>

      {showMockGoogle && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999, fontFamily: 'Roboto, sans-serif'
        }}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: 400, borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)', padding: 32, boxSizing: 'border-box',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowMockGoogle(false)}
              style={{
                position: 'absolute', top: 16, right: 16, border: 'none',
                background: 'none', cursor: 'pointer', fontSize: 18, color: '#5f6368'
              }}
            >✕</button>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginBottom: 8 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.47-.63-.82-1.37-1.04-2.18z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <h2 style={{ fontSize: 22, fontWeight: 500, margin: '0 0 8px 0', color: '#202124' }}>Sign in with Google</h2>
              <p style={{ fontSize: 14, color: '#5f6368', margin: 0 }}>to continue to WalletFlow</p>
            </div>
            
            <div style={{ borderBottom: '1px solid #dadce0', margin: '20px 0' }}></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                onClick={() => handleMockGoogleLogin('alex@walletflow.com', 'Alex Chen')}
                style={{
                  display: 'flex', alignItems: 'center', padding: '12px 16px',
                  border: '1px solid #dadce0', borderRadius: 4, background: '#fff',
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s',
                  width: '100%'
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: '#f1f3f4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginRight: 12, fontWeight: 'bold', color: '#1a73e8'
                }}>A</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#3c4043' }}>Alex Chen</div>
                  <div style={{ fontSize: 12, color: '#5f6368' }}>alex@walletflow.com</div>
                </div>
              </button>

              <button 
                onClick={() => handleMockGoogleLogin('aishwinjindal907@gmail.com', 'Aishwin Jindal')}
                style={{
                  display: 'flex', alignItems: 'center', padding: '12px 16px',
                  border: '1px solid #dadce0', borderRadius: 4, background: '#fff',
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s',
                  width: '100%'
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: '#e6f4ea',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginRight: 12, fontWeight: 'bold', color: '#137333'
                }}>AJ</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#3c4043' }}>Aishwin Jindal</div>
                  <div style={{ fontSize: 12, color: '#5f6368' }}>aishwinjindal907@gmail.com</div>
                </div>
              </button>

              <button 
                onClick={() => handleMockGoogleLogin('aishcoder@gmail.com', 'Aishcoder')}
                style={{
                  display: 'flex', alignItems: 'center', padding: '12px 16px',
                  border: '1px solid #dadce0', borderRadius: 4, background: '#fff',
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s',
                  width: '100%'
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: '#feebec',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginRight: 12, fontWeight: 'bold', color: '#c5221f'
                }}>AC</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#3c4043' }}>Aishcoder</div>
                  <div style={{ fontSize: 12, color: '#5f6368' }}>aishcoder@gmail.com</div>
                </div>
              </button>
              
              <div style={{ borderBottom: '1px solid #f1f3f4', margin: '8px 0' }}></div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#5f6368' }}>Or Enter Custom Gmail Account:</label>
                <input 
                  type="email" 
                  placeholder="name@gmail.com" 
                  value={mockEmail}
                  onChange={e => setMockEmail(e.target.value)}
                  style={{
                    padding: 10, border: '1px solid #dadce0', borderRadius: 4,
                    fontSize: 14, outline: 'none'
                  }}
                />
                <input 
                  type="text" 
                  placeholder="Your Name (Optional)" 
                  value={mockName}
                  onChange={e => setMockName(e.target.value)}
                  style={{
                    padding: 10, border: '1px solid #dadce0', borderRadius: 4,
                    fontSize: 14, outline: 'none'
                  }}
                />
                <button 
                  onClick={() => {
                    if (mockEmail) {
                      handleMockGoogleLogin(mockEmail, mockName);
                    } else {
                      alert('Please enter a mock email!');
                    }
                  }}
                  style={{
                    padding: '10px 16px', background: '#1a73e8', color: '#fff',
                    border: 'none', borderRadius: 4, cursor: 'pointer',
                    fontSize: 14, fontWeight: 500, marginTop: 4
                  }}
                >
                  Sign in with this account
                </button>
              </div>
            </div>
            
            <p style={{ fontSize: 11, color: '#5f6368', textAlign: 'center', marginTop: 24, lineHeight: '1.4' }}>
              This is a simulated Google Auth portal. Setup <code>VITE_GOOGLE_CLIENT_ID</code> in <code>client/.env</code> to connect real Google accounts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
