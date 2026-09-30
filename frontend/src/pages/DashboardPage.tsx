import {
  Users,
  Award,
  DollarSign,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  UserCheck,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { StatusBadge, PaymentMethodBadge } from '../components/common/Badge';
import { api } from '../services/api';
import type { DashboardSummary } from '../types';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  onQuickAction: (action: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onQuickAction }) => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.dashboard.getSummary();
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Loading live dashboard analytics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--accent-rose)' }}>
        Failed to connect to backend analytics. Please ensure the .NET API is running.
      </div>
    );
  }

  const maxRevenue = Math.max(...data.revenueHistory.map((r) => r.revenue), 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, color: 'var(--text-primary)' }}>Operations Dashboard</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            Live metrics, revenue performance, and membership lifecycle tracking.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => onQuickAction('add-member')}
            className="btn btn-primary"
            style={{ fontSize: 13 }}
          >
            <PlusCircle size={16} />
            <span>Add Member</span>
          </button>
          <button
            onClick={() => onQuickAction('attendance-desk')}
            className="btn btn-secondary"
            style={{ fontSize: 13 }}
          >
            <UserCheck size={16} color="var(--accent-amber)" />
            <span>Attendance Desk</span>
          </button>
          <button
            onClick={() => onQuickAction('record-payment')}
            className="btn btn-secondary"
            style={{ fontSize: 13 }}
          >
            <DollarSign size={16} color="var(--accent-emerald)" />
            <span>Record Payment</span>
          </button>
          <button
            onClick={() => onQuickAction('add-workout')}
            className="btn btn-secondary"
            style={{ fontSize: 13 }}
          >
            <Sparkles size={16} color="var(--accent-cyan)" />
            <span>Add Workout</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 16,
        }}
      >
        {/* Total Members */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Total Members</span>
            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 12, color: 'var(--text-primary)' }}>
            {data.totalMembers}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#10b981', marginTop: 8 }}>
            <TrendingUp size={14} />
            <span>{data.activeMembers} currently active</span>
          </div>
        </div>

        {/* Active vs Expired */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Expired / Expiring</span>
            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 12, color: '#f43f5e' }}>
            {data.expiredMembers}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--accent-amber)', marginTop: 8 }}>
            <Clock size={14} />
            <span>{data.expiringSoonMembers} expiring within 7 days</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Total Revenue</span>
            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 12, color: 'var(--text-primary)' }}>
            ${data.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
            <CheckCircle2 size={14} color="#06b6d4" />
            <span>Lifetime collection</span>
          </div>
        </div>

        {/* Current Month Revenue */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>This Month</span>
            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 12, color: '#f59e0b' }}>
            ${data.currentMonthRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
            <span>Current billing cycle</span>
          </div>
        </div>

        {/* Trainers */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Active Trainers</span>
            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Award size={18} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 12, color: 'var(--text-primary)' }}>
            {data.activeTrainers} <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>/ {data.totalTrainers}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#818cf8', marginTop: 8 }}>
            <span>On duty roster</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20 }}>
        {/* Monthly Revenue Bar Chart */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16 }}>Monthly Revenue Collection</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Last 6 months payment volume</p>
            </div>
            <button onClick={() => onNavigate('reports')} className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>
              View Report <ArrowUpRight size={14} />
            </button>
          </div>

          {/* SVG Bar Chart */}
          <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 16, paddingBottom: 24, position: 'relative' }}>
            {data.revenueHistory.map((item) => {
              const heightPct = Math.max(12, Math.round((item.revenue / maxRevenue) * 160));
              return (
                <div
                  key={item.month}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    ${Math.round(item.revenue)}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 44,
                      height: `${heightPct}px`,
                      background: 'linear-gradient(180deg, #10b981, rgba(16, 185, 129, 0.3))',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s ease',
                      boxShadow: '0 4px 12px var(--accent-emerald-glow)',
                    }}
                  />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', position: 'absolute', bottom: 0 }}>
                    {item.month.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Member Status & Plan Distribution */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16 }}>Membership Plan Distribution</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Breakdown by enrolled plan</p>
            </div>
            <button onClick={() => onNavigate('plans')} className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>
              Manage Plans <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data.planDistribution.map((p, idx) => {
              const colors = ['#10b981', '#06b6d4', '#f59e0b', '#818cf8'];
              const color = colors[idx % colors.length];

              return (
                <div key={p.planName}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.planName}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {p.memberCount} members ({p.percentage}%)
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: 8,
                      background: 'rgba(255, 255, 255, 0.06)',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${p.percentage}%`,
                        height: '100%',
                        background: color,
                        borderRadius: 4,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status Breakdown Pills */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
              marginTop: 24,
              paddingTop: 18,
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>{data.statusBreakdown.active}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{data.statusBreakdown.expiringSoon}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expiring Soon</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#f43f5e' }}>{data.statusBreakdown.expired}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expired</div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid for Live Activity Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20 }}>
        {/* Recent Payments */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16 }}>Recent Payments</h3>
            <button onClick={() => onNavigate('payments')} className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>
              All Payments <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPayments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.memberName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.transactionId}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                      ${p.amount.toFixed(2)}
                    </td>
                    <td>
                      <PaymentMethodBadge method={p.paymentMethod} />
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(p.paymentDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Expirations */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16 }}>Upcoming Expirations</h3>
            <button onClick={() => onNavigate('members')} className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>
              Manage Members <ArrowUpRight size={14} />
            </button>
          </div>

          {data.upcomingExpirations.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No memberships expiring within the next 14 days.
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Plan</th>
                    <th>Expiry</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.upcomingExpirations.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.email}</div>
                      </td>
                      <td>{m.membershipPlanName || 'Standard'}</td>
                      <td>
                        <StatusBadge status={m.status} />
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {m.daysRemaining} days left
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => onQuickAction(`renew-member-${m.id}`)}
                          className="btn btn-secondary"
                          style={{ fontSize: 12, padding: '4px 8px', color: 'var(--accent-emerald)' }}
                        >
                          Renew
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
