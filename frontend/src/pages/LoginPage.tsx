import { Lock, User as UserIcon, Zap, Shield, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { toast } = useToast();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.auth.login({
        usernameOrEmail,
        password,
        rememberMe,
      });
      login(res);
      toast(`Welcome back, ${res.user.fullName}!`, 'success');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
      toast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (u: string, p: string) => {
    setUsernameOrEmail(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: 'radial-gradient(circle at 50% 20%, #172554, #0a0e17 80%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background visual accents */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '15%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.08)',
          filter: 'blur(120px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '15%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(6, 182, 212, 0.08)',
          filter: 'blur(120px)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: 460,
          padding: '40px 36px',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Brand Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
              marginBottom: 16,
            }}
          >
            <Zap size={28} color="#ffffff" fill="#ffffff" />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
            FITCORE
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Commercial Gym & Fitness Management Platform
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#f43f5e',
              fontSize: 13,
              marginBottom: 20,
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username or Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 38 }}
                placeholder="admin or admin@gymfitness.com"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
              />
              <UserIcon
                size={18}
                style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Password</label>
              <button
                type="button"
                onClick={() => toast('Please contact club system administrator to reset credentials.', 'info')}
                style={{ fontSize: 12, color: 'var(--accent-emerald)', cursor: 'pointer' }}
              >
                Forgot?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: 38 }}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock
                size={18}
                style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: 'var(--accent-emerald)', cursor: 'pointer' }}
            />
            <label htmlFor="rememberMe" style={{ fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Keep me signed in for 30 days
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px 0', fontSize: 15 }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        {/* Demo Fast Login Pills */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12, letterSpacing: '0.05em' }}>
            Quick Demo Logins (Click to Autofill):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleDemoFill('admin', 'Admin@123')}
              className="btn btn-secondary"
              style={{ padding: '8px 4px', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}
            >
              <Shield size={16} color="var(--accent-rose)" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('staff', 'Staff@123')}
              className="btn btn-secondary"
              style={{ padding: '8px 4px', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}
            >
              <UserIcon size={16} color="var(--accent-cyan)" />
              <span>Staff</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('trainer', 'Trainer@123')}
              className="btn btn-secondary"
              style={{ padding: '8px 4px', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}
            >
              <Sparkles size={16} color="var(--accent-amber)" />
              <span>Trainer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
