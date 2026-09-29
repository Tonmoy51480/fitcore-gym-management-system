import {
  User as UserIcon,
  Shield,
  Sliders,
  Lock,
  Save,
  CheckCircle2,
} from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [loading, setLoading] = useState(false);

  // Profile form
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Gym Preferences
  const [clubName, setClubName] = useState(() => localStorage.getItem('fitcore_club_name') || localStorage.getItem('aura_club_name') || 'FITCORE Downtown Club');
  const [currency, setCurrency] = useState(() => localStorage.getItem('fitcore_currency') || localStorage.getItem('aura_currency') || 'USD ($)');
  const [warningDays, setWarningDays] = useState(() => localStorage.getItem('fitcore_warning_days') || localStorage.getItem('aura_warning_days') || '7');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await api.auth.updateProfile({
        fullName,
        email,
        phone,
        avatarUrl,
      });
      updateUser(updated);
      toast('Profile updated successfully!', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast('New password must be at least 6 characters.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('New passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.auth.changePassword({ currentPassword, newPassword });
      toast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast(err.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('fitcore_club_name', clubName);
    localStorage.setItem('fitcore_currency', currency);
    localStorage.setItem('fitcore_warning_days', warningDays);
    localStorage.setItem('aura_club_name', clubName);
    localStorage.setItem('aura_currency', currency);
    localStorage.setItem('aura_warning_days', warningDays);
    toast('Club preferences saved!', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 960 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 26, color: 'var(--text-primary)' }}>Account & System Settings</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>
          Personalize user profile, manage security credentials, and club preferences.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="glass-card" style={{ padding: 10, display: 'flex', gap: 8 }}>
        {[
          { id: 'profile', label: 'My Profile', icon: UserIcon },
          { id: 'security', label: 'Security & Password', icon: Shield },
          { id: 'preferences', label: 'Club Configuration', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: isActive ? 'var(--accent-emerald)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--accent-emerald)' : '1px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div className="glass-card" style={{ padding: 28 }}>
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Avatar header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingBottom: 20, borderBottom: '1px solid var(--border-color)' }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-emerald)' }}
                />
              ) : (
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    fontWeight: 800,
                    color: 'var(--accent-emerald)',
                  }}
                >
                  {fullName?.charAt(0) || 'U'}
                </div>
              )}

              <div>
                <h3 style={{ fontSize: 18, color: 'var(--text-primary)' }}>{user?.fullName}</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                  <span className="badge badge-active">{user?.role}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>@{user?.username}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Profile Image URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://images.unsplash.com/..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Save size={16} />
                <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: SECURITY */}
      {activeTab === 'security' && (
        <div className="glass-card" style={{ padding: 28 }}>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 500 }}>
            <h3 style={{ fontSize: 18, marginBottom: 4 }}>Change Password</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Ensure your account is protected with a strong, unique password.
            </p>

            <div className="form-group">
              <label className="form-label">Current Password *</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password *</label>
              <input
                type="password"
                required
                minLength={6}
                className="form-input"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password *</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Lock size={16} />
                <span>{loading ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className="glass-card" style={{ padding: 28 }}>
          <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 560 }}>
            <h3 style={{ fontSize: 18, marginBottom: 4 }}>Gym Facility Preferences</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Configure club branch branding, warning thresholds, and local currency display.
            </p>

            <div className="form-group">
              <label className="form-label">Facility / Club Name</label>
              <input
                type="text"
                className="form-input"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Primary Currency</label>
                <select
                  className="form-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                  <option value="CAD ($)">CAD ($)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Expiration Warning (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  className="form-input"
                  value={warningDays}
                  onChange={(e) => setWarningDays(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 8 }}>
              <button type="submit" className="btn btn-primary">
                <CheckCircle2 size={16} />
                <span>Save Preferences</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
