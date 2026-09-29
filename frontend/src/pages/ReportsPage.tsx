import {
  TrendingUp,
  Download,
  Printer,
  DollarSign,
  Award,
  AlertTriangle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import type {
  Member,
  MemberGrowthReport,
  RevenueReport,
  TrainerReportItem,
} from '../types';

export const ReportsPage: React.FC = () => {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'revenue' | 'growth' | 'trainers' | 'expired'>('revenue');
  const [loading, setLoading] = useState(true);

  // Reports data
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [growthReport, setGrowthReport] = useState<MemberGrowthReport | null>(null);
  const [trainerReport, setTrainerReport] = useState<TrainerReportItem[]>([]);
  const [expiredMembers, setExpiredMembers] = useState<Member[]>([]);

  // Date filters for revenue
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const loadReport = async () => {
    setLoading(true);
    try {
      if (activeTab === 'revenue') {
        const res = await api.reports.getRevenue({
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        });
        setRevenueReport(res);
      } else if (activeTab === 'growth') {
        const res = await api.reports.getGrowth(6);
        setGrowthReport(res);
      } else if (activeTab === 'trainers') {
        const res = await api.reports.getTrainers();
        setTrainerReport(res);
      } else if (activeTab === 'expired') {
        const res = await api.reports.getExpiredMembers();
        setExpiredMembers(res);
      }
    } catch (err: any) {
      toast(err.message || 'Failed to load report data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [activeTab, fromDate, toDate]);

  // Export CSV helper
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeTab === 'revenue' && revenueReport) {
      csvContent += 'Period,Total Amount,Transactions,Average Transaction\n';
      revenueReport.monthlyBreakdown.forEach((r) => {
        csvContent += `"${r.period}",${r.totalAmount},${r.transactionCount},${r.averageTransaction.toFixed(2)}\n`;
      });
    } else if (activeTab === 'growth' && growthReport) {
      csvContent += 'Month,Joined,Expired\n';
      growthReport.monthlyGrowth.forEach((g) => {
        csvContent += `"${g.month}",${g.joined},${g.expired}\n`;
      });
    } else if (activeTab === 'trainers') {
      csvContent += 'Trainer,Specialty,Assigned Members,Workouts,Status\n';
      trainerReport.forEach((t) => {
        csvContent += `"${t.trainerName}","${t.specialty}",${t.assignedMembersCount},${t.totalWorkoutsCount},"${t.isActive ? 'Active' : 'Inactive'}"\n`;
      });
    } else if (activeTab === 'expired') {
      csvContent += 'Name,Email,Phone,Plan,Expiry Date\n';
      expiredMembers.forEach((m) => {
        csvContent += `"${m.name}","${m.email}","${m.phone || ''}","${m.membershipPlanName || ''}","${new Date(m.expiryDate).toLocaleDateString()}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fitcore_${activeTab}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast('Report exported to CSV successfully!', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, color: 'var(--text-primary)' }}>Business Intelligence & Reports</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>
            Deep-dive financial statements, membership retention cohorts, and trainer performance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => window.print()} className="btn btn-secondary" style={{ fontSize: 13 }}>
            <Printer size={16} />
            <span>Print Report</span>
          </button>
          <button onClick={handleExportCSV} className="btn btn-primary" style={{ fontSize: 13 }}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="glass-card" style={{ padding: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[
          { id: 'revenue', label: 'Revenue Report', icon: DollarSign },
          { id: 'growth', label: 'Member Growth & Retention', icon: TrendingUp },
          { id: 'trainers', label: 'Trainer Performance', icon: Award },
          { id: 'expired', label: 'Expired Members Outreach', icon: AlertTriangle },
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

      {/* Content based on tab */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Generating report analytics...
        </div>
      ) : (
        <>
          {/* TAB 1: REVENUE REPORT */}
          {activeTab === 'revenue' && revenueReport && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Filter */}
              <div className="glass-card" style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Filter by Period:</span>
                <input
                  type="date"
                  className="form-input"
                  style={{ width: 150 }}
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <span style={{ color: 'var(--text-muted)' }}>to</span>
                <input
                  type="date"
                  className="form-input"
                  style={{ width: 150 }}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
                {(fromDate || toDate) && (
                  <button onClick={() => { setFromDate(''); setToDate(''); }} className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
                    Reset
                  </button>
                )}
              </div>

              {/* KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div className="glass-card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Revenue</div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--accent-emerald)', marginTop: 8 }}>
                    ${revenueReport.totalRevenue.toFixed(2)}
                  </div>
                </div>
                <div className="glass-card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Transactions</div>
                  <div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>
                    {revenueReport.totalTransactions}
                  </div>
                </div>
                <div className="glass-card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Average Ticket</div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--accent-cyan)', marginTop: 8 }}>
                    ${revenueReport.averagePayment.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Monthly Breakdown Table */}
              <div className="glass-card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 16, marginBottom: 16 }}>Monthly Financial Breakdown</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Billing Cycle</th>
                        <th>Gross Revenue</th>
                        <th>Transactions</th>
                        <th>Average per Transaction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueReport.monthlyBreakdown.map((item) => (
                        <tr key={item.period}>
                          <td style={{ fontWeight: 600 }}>{item.period}</td>
                          <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>${item.totalAmount.toFixed(2)}</td>
                          <td>{item.transactionCount}</td>
                          <td style={{ color: 'var(--accent-cyan)' }}>${item.averageTransaction.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Methods Distribution */}
              <div className="glass-card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 16, marginBottom: 16 }}>Collection Channels</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  {Object.entries(revenueReport.methodBreakdown).map(([method, amount]) => (
                    <div key={method} style={{ padding: 14, borderRadius: 8, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{method}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, color: 'var(--text-primary)' }}>
                        ${amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEMBER GROWTH */}
          {activeTab === 'growth' && growthReport && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div className="glass-card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Registered</div>
                  <div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>{growthReport.totalMembers}</div>
                </div>
                <div className="glass-card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Retention</div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--accent-emerald)', marginTop: 8 }}>
                    {growthReport.activeMembers}
                  </div>
                </div>
                <div className="glass-card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expired / Churn</div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--accent-rose)', marginTop: 8 }}>
                    {growthReport.expiredMembers}
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 16, marginBottom: 16 }}>Monthly Enrollment vs Expirations</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>New Registrations</th>
                        <th>Expired Memberships</th>
                        <th>Net Delta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {growthReport.monthlyGrowth.map((g) => {
                        const net = g.joined - g.expired;
                        return (
                          <tr key={g.month}>
                            <td style={{ fontWeight: 600 }}>{g.month}</td>
                            <td style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>+{g.joined}</td>
                            <td style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>-{g.expired}</td>
                            <td style={{ fontWeight: 700, color: net >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                              {net >= 0 ? `+${net}` : net}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRAINER PERFORMANCE */}
          {activeTab === 'trainers' && (
            <div className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 16, marginBottom: 16 }}>Coach Workload & Roster Load</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Coach</th>
                      <th>Specialty</th>
                      <th>Direct Members Assigned</th>
                      <th>Published Workouts</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainerReport.map((t) => (
                      <tr key={t.trainerId}>
                        <td style={{ fontWeight: 600 }}>{t.trainerName}</td>
                        <td style={{ color: 'var(--accent-cyan)' }}>{t.specialty}</td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{t.assignedMembersCount} members</td>
                        <td>{t.totalWorkoutsCount} sessions</td>
                        <td>
                          <span className={`badge ${t.isActive ? 'badge-active' : 'badge-inactive'}`}>
                            {t.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: EXPIRED MEMBERS OUTREACH */}
          {activeTab === 'expired' && (
            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16 }}>Expired Memberships Campaign List</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Subscribers whose plans have ended and require re-engagement.
                  </p>
                </div>
              </div>

              {expiredMembers.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                  All members have active subscriptions! No expired members found.
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Member Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Last Plan</th>
                        <th>Expired On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expiredMembers.map((m) => (
                        <tr key={m.id}>
                          <td style={{ fontWeight: 600 }}>{m.name}</td>
                          <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{m.email}</td>
                          <td style={{ fontSize: 13 }}>{m.phone || 'N/A'}</td>
                          <td>{m.membershipPlanName || 'Standard'}</td>
                          <td style={{ color: 'var(--accent-rose)', fontWeight: 600, fontSize: 13 }}>
                            {new Date(m.expiryDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
