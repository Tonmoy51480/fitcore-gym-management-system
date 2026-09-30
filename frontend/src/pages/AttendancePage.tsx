import {
  Clock,
  LogIn,
  LogOut,
  RefreshCw,
  Search,
  UserCheck,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import type { AttendanceRecord, Member } from '../types';

export const AttendancePage: React.FC = () => {
  const { toast } = useToast();

  const [activeRecords, setActiveRecords] = useState<AttendanceRecord[]>([]);
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Active tab: 'active' | 'today'
  const [activeTab, setActiveTab] = useState<'active' | 'today'>('active');
  const [search, setSearch] = useState('');

  // Check-In Modal
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | ''>('');
  const [checkInNotes, setCheckInNotes] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [activeData, todayData, membersData] = await Promise.all([
        api.attendance.getActive(),
        api.attendance.getToday(),
        api.members.getAll({ status: 'Active' }),
      ]);
      setActiveRecords(activeData);
      setTodayRecords(todayData);
      setMembers(membersData);
    } catch {
      toast('Failed to load attendance data from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh active roster every 30 seconds
    const interval = setInterval(() => {
      api.attendance.getActive().then(setActiveRecords).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      toast('Please select an active member to check in', 'warning');
      return;
    }

    try {
      setActionLoading(true);
      const record = await api.attendance.checkIn({
        memberId: Number(selectedMemberId),
        notes: checkInNotes.trim() || undefined,
      });
      toast(`Successfully checked in ${record.memberName}!`, 'success');
      setIsCheckInOpen(false);
      setSelectedMemberId('');
      setCheckInNotes('');
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Check-in failed';
      toast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async (memberId: number, memberName: string) => {
    try {
      setActionLoading(true);
      const record = await api.attendance.checkOut({
        memberId,
        notes: 'Front desk checkout',
      });
      toast(`Checked out ${memberName} (${record.durationMinutes ?? 0} mins logged)`, 'info');
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout failed';
      toast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const activeFiltered = activeRecords.filter((r) =>
    r.memberName.toLowerCase().includes(search.toLowerCase()) ||
    r.memberEmail.toLowerCase().includes(search.toLowerCase())
  );

  const todayFiltered = todayRecords.filter((r) =>
    r.memberName.toLowerCase().includes(search.toLowerCase()) ||
    r.memberEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Facility Attendance Desk
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: 14 }}>
            Monitor live gym occupants, scan check-ins, and review visit duration logs
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={loadData}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setIsCheckInOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <LogIn size={18} />
            Check In Member
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        {/* Active Occupants Card */}
        <div
          className="card"
          style={{
            padding: 20,
            borderLeft: '4px solid var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
            }}
          >
            <Users size={26} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Currently Inside Gym
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {activeRecords.length}
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--accent-primary)',
                  boxShadow: '0 0 10px var(--accent-primary)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Today's Check-ins */}
        <div
          className="card"
          style={{
            padding: 20,
            borderLeft: '4px solid #3b82f6',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
            }}
          >
            <UserCheck size={26} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Today's Total Check-Ins
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>
              {todayRecords.length}
            </div>
          </div>
        </div>

        {/* Active Members Total */}
        <div
          className="card"
          style={{
            padding: 20,
            borderLeft: '4px solid #8b5cf6',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8b5cf6',
            }}
          >
            <Clock size={26} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Active Membership Pool
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>
              {members.length}
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Tabs & Search */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setActiveTab('active')}
            className={`btn ${activeTab === 'active' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: 14 }}
          >
            Inside Facility ({activeRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('today')}
            className={`btn ${activeTab === 'today' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: 14 }}
          >
            Today's Log ({todayRecords.length})
          </button>
        </div>

        <div style={{ position: 'relative', width: 280 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search attendees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: 36, width: '100%', fontSize: 14 }}
          />
        </div>
      </div>

      {/* Main Roster Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            Syncing facility attendance status...
          </div>
        ) : activeTab === 'active' ? (
          activeFiltered.length === 0 ? (
            <EmptyState
              title="No Members Currently Inside"
              description={search ? "No active attendees matched your search query." : "The gym floor is currently empty. Use the 'Check In Member' button to record arrivals."}
              icon={<Users size={32} />}
              actionText="Check In Member"
              onAction={() => setIsCheckInOpen(true)}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Membership Plan</th>
                    <th>Check-In Time</th>
                    <th>Session Notes</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeFiltered.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: '50%',
                              background: 'var(--accent-glow)',
                              color: 'var(--accent-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 14,
                            }}
                          >
                            {record.memberName.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {record.memberName}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {record.memberEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: '#60a5fa',
                          }}
                        >
                          {record.membershipPlanName || 'General Access'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                          <Clock size={14} />
                          {formatTime(record.checkInTime)}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                        {record.notes || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleCheckOut(record.memberId, record.memberName)}
                          disabled={actionLoading}
                          className="btn"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 12px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <LogOut size={14} />
                          Check Out
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          todayFiltered.length === 0 ? (
            <EmptyState
              title="No Visits Recorded Today"
              description="No check-ins have been logged for today's facility hours yet."
              icon={<Clock size={32} />}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Membership Plan</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayFiltered.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {record.memberName}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {record.memberEmail}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: '#60a5fa',
                          }}
                        >
                          {record.membershipPlanName || 'General Access'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {formatTime(record.checkInTime)}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {record.checkOutTime ? formatTime(record.checkOutTime) : '—'}
                      </td>
                      <td>
                        {record.durationMinutes !== undefined && record.durationMinutes !== null ? (
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {record.durationMinutes} mins
                          </span>
                        ) : (
                          <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                            In Progress
                          </span>
                        )}
                      </td>
                      <td>
                        {record.isActive ? (
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: 4,
                              background: 'rgba(16, 185, 129, 0.2)',
                              color: 'var(--accent-primary)',
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            Active Now
                          </span>
                        ) : (
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: 4,
                              background: 'rgba(255, 255, 255, 0.08)',
                              color: 'var(--text-secondary)',
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Check-In Modal */}
      <Modal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        title="Check In Member to Facility"
      >
        <form onSubmit={handleCheckIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
              Select Active Member *
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value ? Number(e.target.value) : '')}
              required
              className="input"
              style={{ width: '100%', fontSize: 14 }}
            >
              <option value="">-- Choose member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.membershipPlanName || 'Standard'} - Exp: {new Date(m.expiryDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
              Session Remarks / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Card check, leg day, personal training session"
              value={checkInNotes}
              onChange={(e) => setCheckInNotes(e.target.value)}
              className="input"
              style={{ width: '100%', fontSize: 14 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setIsCheckInOpen(false)}
              className="btn btn-secondary"
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={actionLoading}
            >
              {actionLoading ? 'Verifying...' : 'Authorize Entry'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
