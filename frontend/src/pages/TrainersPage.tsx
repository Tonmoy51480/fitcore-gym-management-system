import {
  Award,
  Search,
  Plus,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Power,
  Eye,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import type {
  Trainer,
  TrainerCreatePayload,
  TrainerDetail,
  TrainerUpdatePayload,
} from '../types';

export const TrainersPage: React.FC = () => {
  const { toast } = useToast();

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeOnly, setActiveOnly] = useState<boolean | undefined>(undefined);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [trainerDetail, setTrainerDetail] = useState<TrainerDetail | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState<TrainerCreatePayload>({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    experienceYears: 1,
  });

  const [editData, setEditData] = useState<TrainerUpdatePayload>({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    experienceYears: 1,
    isActive: true,
  });

  const loadTrainers = async () => {
    setLoading(true);
    try {
      const res = await api.trainers.getAll({ search, activeOnly });
      setTrainers(res);
    } catch (err: any) {
      toast(err.message || 'Failed to load trainers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainers();
  }, [search, activeOnly]);

  const handleOpenDetail = async (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    try {
      const detail = await api.trainers.getById(trainer.id);
      setTrainerDetail(detail);
      setIsDetailOpen(true);
    } catch (err: any) {
      toast(err.message || 'Failed to load trainer details', 'error');
    }
  };

  const handleOpenEdit = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setEditData({
      name: trainer.name,
      email: trainer.email || '',
      phone: trainer.phone || '',
      specialty: trainer.specialty,
      experienceYears: trainer.experienceYears,
      isActive: trainer.isActive,
    });
    setIsEditOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.trainers.create(formData);
      toast('Trainer registered successfully!', 'success');
      setIsAddOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialty: '',
        experienceYears: 1,
      });
      loadTrainers();
    } catch (err: any) {
      toast(err.message || 'Failed to add trainer', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainer) return;
    setActionLoading(true);
    try {
      await api.trainers.update(selectedTrainer.id, editData);
      toast('Trainer profile updated!', 'success');
      setIsEditOpen(false);
      loadTrainers();
    } catch (err: any) {
      toast(err.message || 'Failed to update trainer', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (trainer: Trainer) => {
    try {
      await api.trainers.toggleActive(trainer.id);
      toast(`Trainer status switched to ${!trainer.isActive ? 'Active' : 'Inactive'}`, 'info');
      loadTrainers();
    } catch (err: any) {
      toast(err.message || 'Failed to update trainer status', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTrainer) return;
    setActionLoading(true);
    try {
      await api.trainers.delete(selectedTrainer.id);
      toast('Trainer removed from system', 'success');
      setIsDeleteOpen(false);
      loadTrainers();
    } catch (err: any) {
      toast(err.message || 'Failed to delete trainer', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, color: 'var(--text-primary)' }}>Trainer Management</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>
            Manage fitness coaches, specialties, workload, and assigned workout plans.
          </p>
        </div>

        <button onClick={() => setIsAddOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Trainer</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="glass-card" style={{ padding: 16, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <input
            type="text"
            placeholder="Search by trainer name, specialty, or email..."
            className="form-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setActiveOnly(undefined)}
            className="btn btn-secondary"
            style={{
              fontSize: 13,
              background: activeOnly === undefined ? 'var(--accent-emerald)' : undefined,
              color: activeOnly === undefined ? '#ffffff' : undefined,
            }}
          >
            All Trainers
          </button>
          <button
            onClick={() => setActiveOnly(true)}
            className="btn btn-secondary"
            style={{
              fontSize: 13,
              background: activeOnly === true ? 'var(--accent-emerald)' : undefined,
              color: activeOnly === true ? '#ffffff' : undefined,
            }}
          >
            Active Only
          </button>
        </div>
      </div>

      {/* Trainer Cards Grid */}
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading trainers...
        </div>
      ) : trainers.length === 0 ? (
        <EmptyState
          icon={<Award size={28} />}
          title="No Trainers Found"
          description="No trainers match your filter criteria. Register coaches to start building workout rosters."
          actionText="Add Trainer"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {trainers.map((t) => (
            <div key={t.id} className="glass-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(99, 102, 241, 0.2))',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      color: 'var(--accent-cyan)',
                      fontSize: 18,
                    }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 17, color: 'var(--text-primary)' }}>{t.name}</h3>
                    <div style={{ fontSize: 13, color: 'var(--accent-cyan)', fontWeight: 600 }}>{t.specialty}</div>
                  </div>
                </div>

                <span className={`badge ${t.isActive ? 'badge-active' : 'badge-inactive'}`}>
                  {t.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Contact info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                {t.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Mail size={14} color="var(--text-muted)" />
                    <span>{t.email}</span>
                  </div>
                )}
                {t.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Phone size={14} color="var(--text-muted)" />
                    <span>{t.phone}</span>
                  </div>
                )}
              </div>

              {/* Stats pill */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 8,
                  padding: '12px 10px',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Experience</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{t.experienceYears} yrs</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Workouts</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-cyan)', marginTop: 2 }}>
                    {t.workoutCount}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Members</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-emerald)', marginTop: 2 }}>
                    {t.memberCount}
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 12,
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                <button
                  onClick={() => handleToggleActive(t)}
                  style={{
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: t.isActive ? 'var(--text-muted)' : 'var(--accent-emerald)',
                    cursor: 'pointer',
                  }}
                >
                  <Power size={14} />
                  <span>{t.isActive ? 'Deactivate' : 'Activate'}</span>
                </button>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleOpenDetail(t)} className="btn-icon" title="View assigned roster">
                    <Eye size={15} />
                  </button>
                  <button onClick={() => handleOpenEdit(t)} className="btn-icon" title="Edit trainer">
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTrainer(t);
                      setIsDeleteOpen(true);
                    }}
                    className="btn-icon"
                    title="Delete trainer"
                    style={{ color: 'var(--accent-rose)' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: ADD TRAINER */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Trainer">
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              required
              placeholder="Elena Rostova"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="elena@gymfitness.com"
                className="form-input"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                placeholder="+1 (555) 901-2345"
                className="form-input"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Specialty *</label>
              <input
                type="text"
                required
                placeholder="Pilates, Powerlifting, HIIT..."
                className="form-input"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Experience (Years) *</label>
              <input
                type="number"
                min="0"
                max="50"
                required
                className="form-input"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Add Trainer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: EDIT TRAINER */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Trainer Profile">
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              required
              className="form-input"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={editData.email || ''}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-input"
                value={editData.phone || ''}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Specialty *</label>
              <input
                type="text"
                required
                className="form-input"
                value={editData.specialty}
                onChange={(e) => setEditData({ ...editData, specialty: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Experience (Years)</label>
              <input
                type="number"
                min="0"
                max="50"
                className="form-input"
                value={editData.experienceYears}
                onChange={(e) => setEditData({ ...editData, experienceYears: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Active Status</label>
            <select
              className="form-select"
              value={editData.isActive ? 'true' : 'false'}
              onChange={(e) => setEditData({ ...editData, isActive: e.target.value === 'true' })}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={() => setIsEditOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: TRAINER DETAILS */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={trainerDetail?.name || 'Trainer Profile'}
        subtitle={`${trainerDetail?.specialty} • ${trainerDetail?.experienceYears} years experience`}
        maxWidth="740px"
      >
        {trainerDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Workouts section */}
            <div>
              <h4 style={{ fontSize: 15, marginBottom: 10, color: 'var(--text-primary)' }}>
                Assigned Workouts ({trainerDetail.workouts.length})
              </h4>
              {trainerDetail.workouts.length === 0 ? (
                <div style={{ padding: 14, color: 'var(--text-muted)', fontSize: 13, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8 }}>
                  No workouts currently assigned to this coach.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                  {trainerDetail.workouts.map((w) => (
                    <div
                      key={w.id}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{w.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        {w.durationMinutes} mins • {w.difficulty} • {w.caloriesBurned} cal
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assigned members section */}
            <div>
              <h4 style={{ fontSize: 15, marginBottom: 10, color: 'var(--text-primary)' }}>
                Directly Mentored Members ({trainerDetail.assignedMembers.length})
              </h4>
              {trainerDetail.assignedMembers.length === 0 ? (
                <div style={{ padding: 14, color: 'var(--text-muted)', fontSize: 13, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8 }}>
                  No members currently assigned for 1-on-1 coaching.
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Expires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trainerDetail.assignedMembers.map((m) => (
                        <tr key={m.id}>
                          <td style={{ fontWeight: 600 }}>{m.name}</td>
                          <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{m.email}</td>
                          <td><span className="badge badge-active">{m.status}</span></td>
                          <td style={{ fontSize: 13 }}>{new Date(m.expiryDate).toLocaleDateString()}</td>
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

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Trainer"
        message={`Are you sure you want to delete coach ${selectedTrainer?.name}? All workout sessions tied to this coach will be orphaned or removed.`}
        confirmText="Delete Coach"
        isLoading={actionLoading}
      />
    </div>
  );
};
