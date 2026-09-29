import {
  Sparkles,
  Plus,
  Check,
  Edit2,
  Trash2,
  Power,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import type {
  MembershipPlan,
  MembershipPlanCreatePayload,
  MembershipPlanUpdatePayload,
} from '../types';

export const MembershipPlansPage: React.FC = () => {
  const { toast } = useToast();

  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState<MembershipPlanCreatePayload>({
    planName: '',
    description: '',
    price: 49.99,
    durationMonths: 1,
  });

  const [editData, setEditData] = useState<MembershipPlanUpdatePayload>({
    planName: '',
    description: '',
    price: 49.99,
    durationMonths: 1,
    isActive: true,
  });

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await api.plans.getAll();
      setPlans(res);
    } catch (err: any) {
      toast(err.message || 'Failed to load membership plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleOpenEdit = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setEditData({
      planName: plan.planName,
      description: plan.description || '',
      price: plan.price,
      durationMonths: plan.durationMonths,
      isActive: plan.isActive,
    });
    setIsEditOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.plans.create(formData);
      toast('Membership plan created!', 'success');
      setIsAddOpen(false);
      setFormData({
        planName: '',
        description: '',
        price: 49.99,
        durationMonths: 1,
      });
      loadPlans();
    } catch (err: any) {
      toast(err.message || 'Failed to create plan', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setActionLoading(true);
    try {
      await api.plans.update(selectedPlan.id, editData);
      toast('Membership plan updated!', 'success');
      setIsEditOpen(false);
      loadPlans();
    } catch (err: any) {
      toast(err.message || 'Failed to update plan', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (plan: MembershipPlan) => {
    try {
      await api.plans.toggleActive(plan.id);
      toast(`Plan ${!plan.isActive ? 'Activated' : 'Deactivated'}`, 'info');
      loadPlans();
    } catch (err: any) {
      toast(err.message || 'Failed to update plan status', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPlan) return;
    setActionLoading(true);
    try {
      await api.plans.delete(selectedPlan.id);
      toast('Plan processed successfully', 'success');
      setIsDeleteOpen(false);
      loadPlans();
    } catch (err: any) {
      toast(err.message || 'Failed to delete plan', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, color: 'var(--text-primary)' }}>Membership Plans</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>
            Configure recurring subscriptions, term commitments, pricing tiers, and perks.
          </p>
        </div>

        <button onClick={() => setIsAddOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Create Plan</span>
        </button>
      </div>

      {/* Plans Pricing Cards Grid */}
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading plans...
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={28} />}
          title="No Membership Plans Configured"
          description="Create your gym's first membership tier to start registering members."
          actionText="Create Plan"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {plans.map((p) => {
            const monthlyEquiv = (p.price / Math.max(1, p.durationMonths)).toFixed(2);

            return (
              <div
                key={p.id}
                className="glass-card"
                style={{
                  padding: 28,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Active/Inactive badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className={`badge ${p.isActive ? 'badge-active' : 'badge-inactive'}`}>
                    {p.isActive ? 'Available' : 'Archived'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Users size={15} color="var(--accent-emerald)" />
                    <span>{p.activeMembersCount} active members</span>
                  </div>
                </div>

                {/* Plan Title & Pricing */}
                <div>
                  <h3 style={{ fontSize: 22, color: 'var(--text-primary)' }}>{p.planName}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 10 }}>
                    <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent-emerald)' }}>
                      ${p.price.toFixed(2)}
                    </span>
                    <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                      / {p.durationMonths} {p.durationMonths === 1 ? 'Month' : 'Months'}
                    </span>
                  </div>
                  {p.durationMonths > 1 && (
                    <div style={{ fontSize: 12, color: 'var(--accent-cyan)', marginTop: 2 }}>
                      ~${monthlyEquiv} per month effective
                    </div>
                  )}
                </div>

                {/* Description */}
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, minHeight: 48 }}>
                  {p.description || 'Standard facility access plan with full cardio and free weight privileges.'}
                </p>

                {/* Plan Highlights */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Check size={16} color="var(--accent-emerald)" />
                    <span>Full access to gym equipment</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Check size={16} color="var(--accent-emerald)" />
                    <span>Locker room & shower amenities</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Check size={16} color="var(--accent-emerald)" />
                    <span>Mobile app check-in & workout tracking</span>
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 16,
                    marginTop: 'auto',
                    borderTop: '1px solid var(--border-color)',
                  }}
                >
                  <button
                    onClick={() => handleToggleActive(p)}
                    style={{
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: p.isActive ? 'var(--text-muted)' : 'var(--accent-emerald)',
                      cursor: 'pointer',
                    }}
                  >
                    <Power size={14} />
                    <span>{p.isActive ? 'Disable' : 'Enable'}</span>
                  </button>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleOpenEdit(p)} className="btn-icon" title="Edit plan details">
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPlan(p);
                        setIsDeleteOpen(true);
                      }}
                      className="btn-icon"
                      title="Delete or Archive plan"
                      style={{ color: 'var(--accent-rose)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: CREATE PLAN */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Membership Plan">
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Plan Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. VIP Platinum Annual"
              className="form-input"
              value={formData.planName}
              onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Duration (Months) *</label>
              <input
                type="number"
                min="1"
                max="120"
                required
                className="form-input"
                value={formData.durationMonths}
                onChange={(e) => setFormData({ ...formData, durationMonths: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                className="form-input"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Plan Description & Benefits</label>
            <textarea
              rows={3}
              className="form-textarea"
              placeholder="Detail inclusions such as guest passes, personal training sessions, sauna access..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: EDIT PLAN */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Membership Plan">
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Plan Name *</label>
            <input
              type="text"
              required
              className="form-input"
              value={editData.planName}
              onChange={(e) => setEditData({ ...editData, planName: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Duration (Months) *</label>
              <input
                type="number"
                min="1"
                max="120"
                required
                className="form-input"
                value={editData.durationMonths}
                onChange={(e) => setEditData({ ...editData, durationMonths: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                className="form-input"
                value={editData.price}
                onChange={(e) => setEditData({ ...editData, price: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              className="form-textarea"
              value={editData.description || ''}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Active Availability</label>
            <select
              className="form-select"
              value={editData.isActive ? 'true' : 'false'}
              onChange={(e) => setEditData({ ...editData, isActive: e.target.value === 'true' })}
            >
              <option value="true">Active (Members can enroll)</option>
              <option value="false">Archived (Hide from new registrations)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={() => setIsEditOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Save Plan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete / Archive Plan"
        message={`Are you sure you want to remove "${selectedPlan?.planName}"? If members are currently linked to this plan, the system will safely archive it instead of breaking historical references.`}
        confirmText="Confirm Delete"
        isLoading={actionLoading}
      />
    </div>
  );
};
