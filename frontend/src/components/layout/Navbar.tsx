import {
  Bell,
  Search,
  Menu,
  Moon,
  Sun,
  Plus,
  User as UserIcon,
  Check,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { NotificationItem } from '../../types';

interface NavbarProps {
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
  onQuickAction: (action: string) => void;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileSidebar,
  onOpenSearch,
  onQuickAction,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isQuickOpen, setIsQuickOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);

  // Load unread count and notifications
  const loadNotifications = async () => {
    try {
      const res = await api.notifications.getRecent(6);
      setNotifications(res);
      const countRes = await api.notifications.getUnreadCount();
      setUnreadCount(countRes.unreadCount);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) {
        setIsQuickOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header
      style={{
        height: 68,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-blur)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left: Mobile hamburger & Search bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={onOpenMobileSidebar}
          className="btn-icon mobile-menu-btn"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Global Search trigger bar */}
        <div
          onClick={onOpenSearch}
          className="nav-search-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 14px',
            cursor: 'pointer',
            width: 280,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--text-muted)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
        >
          <Search size={16} color="var(--text-muted)" />
          <span style={{ fontSize: 13, color: 'var(--text-muted)', flex: 1 }}>
            Search anything...
          </span>
          <span
            style={{
              padding: '2px 6px',
              fontSize: 11,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            /
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Quick Action "+ New" Button */}
        <div ref={quickRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsQuickOpen(!isQuickOpen)}
            className="btn btn-primary"
            style={{ padding: '8px 14px', fontSize: 13 }}
          >
            <Plus size={16} />
            <span>New</span>
          </button>

          {isQuickOpen && (
            <div
              className="glass-card animate-fade-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 200,
                padding: '8px 0',
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                zIndex: 50,
              }}
            >
              {[
                { label: 'Register Member', action: 'add-member' },
                { label: 'Attendance Desk', action: 'attendance-desk' },
                { label: 'Record Payment', action: 'record-payment' },
                { label: 'Add Workout', action: 'add-workout' },
                { label: 'Add Trainer', action: 'add-trainer' },
                { label: 'Create Plan', action: 'add-plan' },
              ].map((item) => (
                <div
                  key={item.action}
                  onClick={() => {
                    onQuickAction(item.action);
                    setIsQuickOpen(false);
                  }}
                  style={{
                    padding: '9px 16px',
                    fontSize: 13,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button onClick={toggleTheme} className="btn-icon" title="Toggle theme">
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notification Bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="btn-icon"
            style={{ position: 'relative' }}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--accent-rose)',
                  boxShadow: '0 0 8px var(--accent-rose)',
                }}
              />
            )}
          </button>

          {isNotifOpen && (
            <div
              className="glass-card animate-fade-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 340,
                padding: 0,
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.6)',
                zIndex: 50,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14 }}>Notifications ({unreadCount})</div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      fontSize: 12,
                      color: 'var(--accent-emerald)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Check size={14} /> Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '12px 18px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: n.isRead ? 'transparent' : 'rgba(16, 185, 129, 0.05)',
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        {new Date(n.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div
          onClick={() => onNavigate('settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-input)',
          }}
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserIcon size={16} />
            </div>
          )}
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.fullName?.split(' ')[0] || 'User'}
          </span>
        </div>
      </div>
    </header>
  );
};
