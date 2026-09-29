import {
  Users,
  Search,
  Plus,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { StatusBadge, PaymentMethodBadge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import type {
  Member,
  MemberCreatePayload,
  MemberDetail,
  MemberRenewPayload,
  MemberUpdatePayload,
  MembershipPlan,
  Trainer,
} from '../types';

interface MembersPageProps {
  initialRenewId?: number | null;
  onClearInitialRenew?: () => void;
}

export const MembersPage: React.FC<MembersPageProps> = ({ initialRenewId, onClearInitialRenew }) => {
  const { toast } = useToast();

  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [planFilter, setPlanFilter] = useState<number | undefined>(undefined);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<MemberDetail | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState<MemberCreatePayload>({
    name: '',
    email: '',
    phone: '',
    emergencyContact: '',
    membershipPlanId: undefined,
    planMonths: 1,
    assignedTrainerId: undefined,
    initialPaymentAmount: 0,
    paymentMethod: 'Cash',
  });

  const [editData, setEditData] = useState<MemberUpdatePayload>({
    name: '',
    email: '',
    phone: '',
    emergencyContact: '',
    membershipPlanId: undefined,
    assignedTrainerId: undefined,
    status: 'Active',
  });

  const [renewData, setRenewData] = useState<MemberRenewPayload>({
    membershipPlanId: undefined,
    additionalMonths: 1,
    paymentAmount: 49.99,
    paymentMethod: 'Cash',
    notes: 'Membership renewal',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersRes, plansRes, trainersRes] = await Promise.all([
        api.members.getAll({ search, status: statusFilter, planId: planFilter }),
        api.plans.getAll({ activeOnly: true }),
        api.trainers.getAll({ activeOnly: true }),
      ]);
      setMembers(membersRes);
      setPlans(plansRes);
      setTrainers(trainersRes);
    } catch (err: any) {
      toast(err.message || 'Failed to load members', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter, planFilter]);

  // Handle auto-open renewal if navigated from dashboard
  useEffect(() => {
    if (initialRenewId) {
      const target = members.find((m) => m.id === initialRenewId);
      if (target) {
        handleOpenRenew(target);
      }
      onClearInitialRenew?.();
    }
  }, [initialRenewId, members]);

  // View Details
  const handleOpenDetail = async (member: Member) => {
    setSelectedMember(member);
    try {
      const detail = await api.members.getById(member.id);
      setSelectedMemberDetail(detail);
      setIsDetailOpen(true);
    } catch (err: any) {
      toast(err.message || 'Failed to load member details', 'error');
    }
  };

  // Open Edit
  const handleOpenEdit = (member: Member) => {
    setSelectedMember(member);
    setEditData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      emergencyContact: member.emergencyContact || '',
      membershipPlanId: member.membershipPlanId,
      assignedTrainerId: member.assignedTrainerId,
      status: member.status,
    });
    setIsEditOpen(true);
  };

  // Open Renew
  const handleOpenRenew = (member: Member) => {
    setSelectedMember(member);
    const plan = plans.find((p) => p.id === member.membershipPlanId) || plans[0];
    setRenewData({
      membershipPlanId: plan?.id,
      additionalMonths: plan?.durationMonths || 1,
      paymentAmount: plan?.price || 49.99,
      paymentMethod: 'Cash',
      notes: `Renewal for ${member.name}`,
    });
    setIsRenewOpen(true);
  };

  // Submit Add
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.members.create(formData);
      toast('Member registered successfully!', 'success');
      setIsAddOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        emergencyContact: '',
        membershipPlanId: undefined,
        planMonths: 1,
        assignedTrainerId: undefined,
        initialPaymentAmount: 0,
        paymentMethod: 'Cash',
      });
      loadData();
    } catch (err: any) {
      toast(err.message || 'Failed to add member', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setActionLoading(true);
    try {
      await api.members.update(selectedMember.id, editData);
      toast('Member updated successfully!', 'success');
      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      toast(err.message || 'Failed to update member', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Renew
  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setActionLoading(true);
    try {
      await api.members.renew(selectedMember.id, renewData);
      toast(`Membership renewed for ${selectedMember.name}!`, 'success');
      setIsRenewOpen(false);
      if (isDetailOpen) {
        const updatedDetail = await api.members.getById(selectedMember.id);
        setSelectedMemberDetail(updatedDetail);
      }
      loadData();
    } catch (err: any) {
      toast(err.message || 'Failed to renew membership', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete
  const handleDeleteConfirm = async () => {
    if (!selectedMember) return;
    setActionLoading(true);
    try {
      await api.members.delete(selectedMember.id);
      toast('Member removed successfully', 'success');
      setIsDeleteOpen(false);
      loadData();
    } catch (err: any) {
      toast(err.message || 'Failed to delete member', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, color: 'var(--text-primary)' }}>Member Management</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>
            Manage gym subscribers, monitor expiration warnings, and process renewals.
          </p>
        </div>

        <button onClick={() => setIsAddOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Register Member</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['ALL', 'Active', 'Expiring Soon', 'Expired', 'Inactive'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: statusFilter === st ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.04)',
                color: statusFilter === st ? '#ffffff' : 'var(--text-secondary)',
                border: statusFilter === st ? '1px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                transition: 'all 0.15s ease',
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search & Plan Dropdown */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
          </div>

          <select
            className="form-select"
            style={{ width: 200 }}
            value={planFilter || ''}
            onChange={(e) => setPlanFilter(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">All Membership Plans</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.planName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Members Table */}
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading members...
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title="No Members Found"
          description="There are no members matching the selected filters. Add a new member to get started."
          actionText="Register Member"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Plan</th>
                <th>Assigned Coach</th>
                <th>Join Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Total Paid</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.email}</div>
                    {m.phone && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.phone}</div>}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{m.membershipPlanName || 'Custom'}</span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-secondary)' }}>{m.assignedTrainerName || 'None'}</span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {new Date(m.joinDate).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {new Date(m.expiryDate).toLocaleDateString()}
                    </div>
                    {m.daysRemaining > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.daysRemaining} days left</div>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={m.status} />
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    ${m.totalPaid.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button
                        onClick={() => handleOpenDetail(m)}
                        className="btn-icon"
                        title="View profile & payment history"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => handleOpenRenew(m)}
                        className="btn-icon"
                        title="Renew membership"
                        style={{ color: 'var(--accent-emerald)' }}
                      >
                        <RefreshCw size={15} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="btn-icon"
                        title="Edit member"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMember(m);
                          setIsDeleteOpen(true);
                        }}
                        className="btn-icon"
                        title="Delete member"
                        style={{ color: 'var(--accent-rose)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: ADD MEMBER */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Member">
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="Liam Gallagher"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                required
                placeholder="liam.g@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+1 (555) 123-4567"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Emergency Contact</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contact Name & Phone"
                value={formData.emergencyContact || ''}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Membership Plan</label>
              <select
                className="form-select"
                value={formData.membershipPlanId || ''}
                onChange={(e) => {
                  const pId = e.target.value ? Number(e.target.value) : undefined;
                  const chosen = plans.find((p) => p.id === pId);
                  setFormData({
                    ...formData,
                    membershipPlanId: pId,
                    planMonths: chosen?.durationMonths || 1,
                    initialPaymentAmount: chosen?.price || 0,
                  });
                }}
              >
                <option value="">Select Plan...</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.planName} ({p.durationMonths} mo - ${p.price})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Personal Trainer</label>
              <select
                className="form-select"
                value={formData.assignedTrainerId || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    assignedTrainerId: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              >
                <option value="">No Assigned Trainer</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.specialty})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Initial Payment Fields */}
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: 12 }}>
              Initial Registration Fee / Payment
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Payment Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  value={formData.initialPaymentAmount}
                  onChange={(e) => setFormData({ ...formData, initialPaymentAmount: Number(e.target.value) })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Payment Method</label>
                <select
                  className="form-select"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Mobile Banking">Mobile Banking</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Register Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: MEMBER DETAILS & PAYMENT HISTORY */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedMemberDetail?.name || 'Member Details'}
        subtitle="Membership profile and transaction history"
        maxWidth="740px"
      >
        {selectedMemberDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Quick summary stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 12,
                padding: 16,
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 10,
                border: '1px solid var(--border-color)',
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</div>
                <div style={{ marginTop: 4 }}><StatusBadge status={selectedMemberDetail.status} /></div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Plan</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>
                  {selectedMemberDetail.membershipPlanName || 'Custom'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expires</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>
                  {new Date(selectedMemberDetail.expiryDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Paid</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-emerald)', marginTop: 4 }}>
                  ${selectedMemberDetail.totalPaid.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Profile info details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 14 }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Email: </span>
                <span style={{ fontWeight: 600 }}>{selectedMemberDetail.email}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Phone: </span>
                <span style={{ fontWeight: 600 }}>{selectedMemberDetail.phone || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Emergency Contact: </span>
                <span style={{ fontWeight: 600 }}>{selectedMemberDetail.emergencyContact || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Trainer: </span>
                <span style={{ fontWeight: 600 }}>{selectedMemberDetail.assignedTrainerName || 'None'}</span>
              </div>
            </div>

            {/* Payment history */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h4 style={{ fontSize: 15 }}>Payment History ({selectedMemberDetail.payments.length})</h4>
                <button
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleOpenRenew(selectedMemberDetail);
                  }}
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontSize: 12 }}
                >
                  <RefreshCw size={14} /> Renew Membership
                </button>
              </div>

              {selectedMemberDetail.payments.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No payment records found for this member.
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Txn ID</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMemberDetail.payments.map((p) => (
                        <tr key={p.id}>
                          <td style={{ fontSize: 13 }}>{new Date(p.paymentDate).toLocaleDateString()}</td>
                          <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>${p.amount.toFixed(2)}</td>
                          <td><PaymentMethodBadge method={p.paymentMethod} /></td>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.transactionId}</td>
                          <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 3: EDIT MEMBER */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Member Profile">
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                required
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                required
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-input"
                value={editData.phone || ''}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Emergency Contact</label>
              <input
                type="text"
                className="form-input"
                value={editData.emergencyContact || ''}
                onChange={(e) => setEditData({ ...editData, emergencyContact: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Assigned Plan</label>
              <select
                className="form-select"
                value={editData.membershipPlanId || ''}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    membershipPlanId: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              >
                <option value="">No Plan</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.planName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Trainer</label>
              <select
                className="form-select"
                value={editData.assignedTrainerId || ''}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    assignedTrainerId: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              >
                <option value="">None</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Status Override</label>
            <select
              className="form-select"
              value={editData.status || 'Active'}
              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={() => setIsEditOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: RENEW MEMBERSHIP */}
      <Modal isOpen={isRenewOpen} onClose={() => setIsRenewOpen(false)} title="Renew Membership">
        <form onSubmit={handleRenewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 12, borderRadius: 8, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-emerald)' }}>
              Renewing membership for: {selectedMember?.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Current Expiry: {selectedMember ? new Date(selectedMember.expiryDate).toLocaleDateString() : ''}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Select Renewal Plan</label>
            <select
              className="form-select"
              value={renewData.membershipPlanId || ''}
              onChange={(e) => {
                const pId = e.target.value ? Number(e.target.value) : undefined;
                const chosen = plans.find((p) => p.id === pId);
                setRenewData({
                  ...renewData,
                  membershipPlanId: pId,
                  additionalMonths: chosen?.durationMonths || 1,
                  paymentAmount: chosen?.price || 49.99,
                });
              }}
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.planName} (+{p.durationMonths} months - ${p.price})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Months to Extend</label>
              <input
                type="number"
                min="1"
                max="60"
                className="form-input"
                required
                value={renewData.additionalMonths}
                onChange={(e) => setRenewData({ ...renewData, additionalMonths: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                required
                value={renewData.paymentAmount}
                onChange={(e) => setRenewData({ ...renewData, paymentAmount: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select
              className="form-select"
              value={renewData.paymentMethod}
              onChange={(e) => setRenewData({ ...renewData, paymentMethod: e.target.value })}
            >
              <option value="Cash">Cash</option>
              <option value="Card">Credit / Debit Card</option>
              <option value="Mobile Banking">Mobile Banking</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={() => setIsRenewOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Processing...' : 'Confirm Renewal & Payment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Member"
        message={`Are you sure you want to remove member ${selectedMember?.name}? This action cannot be undone.`}
        confirmText="Delete Member"
        isLoading={actionLoading}
      />
    </div>
  );
};
