import {
  Dumbbell,
  Search,
  Plus,
  Clock,
  Flame,
  Target,
  User as UserIcon,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DifficultyBadge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import type {
  Trainer,
  Workout,
  WorkoutCreatePayload,
  WorkoutUpdatePayload,
} from '../types';

export const WorkoutsPage: React.FC = () => {
  const { toast } = useToast();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [trainerFilter, setTrainerFilter] = useState<number | undefined>(undefined);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState<WorkoutCreatePayload>({
    title: '',
    description: '',
    durationMinutes: 45,
    difficulty: 'Beginner',
    caloriesBurned: 350,
    targetMuscle: '',
    trainerId: 1,
  });

  const [editData, setEditData] = useState<WorkoutUpdatePayload>({
    title: '',
    description: '',
    durationMinutes: 45,
    difficulty: 'Beginner',
    caloriesBurned: 350,
    targetMuscle: '',
    trainerId: 1,
    isActive: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [workoutsRes, trainersRes] = await Promise.all([
        api.workouts.getAll({ search, difficulty: difficultyFilter, trainerId: trainerFilter }),
        api.trainers.getAll({ activeOnly: true }),
      ]);
      setWorkouts(workoutsRes);
      setTrainers(trainersRes);
      if (trainersRes.length > 0 && formData.trainerId === 1 && !trainersRes.some(t => t.id === 1)) {
        setFormData((prev) => ({ ...prev, trainerId: trainersRes[0].id }));
      }
    } catch (err: any) {
      toast(err.message || 'Failed to load workouts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, difficultyFilter, trainerFilter]);

  const handleOpenDetail = (workout: Workout) => {
    setSelectedWorkout(workout);
    setIsDetailOpen(true);
  };

  const handleOpenEdit = (workout: Workout) => {
    setSelectedWorkout(workout);
    setEditData({
      title: workout.title,
      description: workout.description || '',
      durationMinutes: workout.durationMinutes,
      difficulty: workout.difficulty,
      caloriesBurned: workout.caloriesBurned,
      targetMuscle: workout.targetMuscle || '',
      trainerId: workout.trainerId,
      isActive: workout.isActive,
    });
    setIsEditOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.workouts.create(formData);
      toast('Workout routine published!', 'success');
      setIsAddOpen(false);
      setFormData({
        title: '',
        description: '',
        durationMinutes: 45,
        difficulty: 'Beginner',
        caloriesBurned: 350,
        targetMuscle: '',
        trainerId: trainers[0]?.id || 1,
      });
      loadData();
    } catch (err: any) {
      toast(err.message || 'Failed to create workout', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkout) return;
    setActionLoading(true);
    try {
      await api.workouts.update(selectedWorkout.id, editData);
      toast('Workout routine updated!', 'success');
      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      toast(err.message || 'Failed to update workout', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedWorkout) return;
    setActionLoading(true);
    try {
      await api.workouts.delete(selectedWorkout.id);
      toast('Workout removed successfully', 'success');
      setIsDeleteOpen(false);
      loadData();
    } catch (err: any) {
      toast(err.message || 'Failed to delete workout', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, color: 'var(--text-primary)' }}>Workout Management</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>
            Curate training routines, exercise programs, muscle targeting, and coaching assignments.
          </p>
        </div>

        <button onClick={() => setIsAddOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Workout</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="glass-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Difficulty Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['ALL', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: difficultyFilter === diff ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.04)',
                color: difficultyFilter === diff ? '#ffffff' : 'var(--text-secondary)',
                border: difficultyFilter === diff ? '1px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                transition: 'all 0.15s ease',
              }}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Search & Trainer Filter */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <input
              type="text"
              placeholder="Search by title, target muscle, description..."
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
          </div>

          <select
            className="form-select"
            style={{ width: 220 }}
            value={trainerFilter || ''}
            onChange={(e) => setTrainerFilter(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">All Coaches / Trainers</option>
            {trainers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.specialty})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Workouts Grid */}
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading workouts...
        </div>
      ) : workouts.length === 0 ? (
        <EmptyState
          icon={<Dumbbell size={28} />}
          title="No Workouts Found"
          description="No workouts match the current criteria. Create a workout session to build out class schedules."
          actionText="Add Workout"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {workouts.map((w) => (
            <div key={w.id} className="glass-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <DifficultyBadge difficulty={w.difficulty} />
                <span className={`badge ${w.isActive ? 'badge-active' : 'badge-inactive'}`}>
                  {w.isActive ? 'Active' : 'Archived'}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 style={{ fontSize: 18, color: 'var(--text-primary)' }}>{w.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5, minHeight: 40 }}>
                  {w.description || 'Custom coach-led workout regimen focused on physical conditioning.'}
                </p>
              </div>

              {/* Workout Details Pill */}
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 11 }}>
                    <Clock size={12} />
                    <span>Duration</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{w.durationMinutes}m</div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 11 }}>
                    <Flame size={12} color="#f43f5e" />
                    <span>Burn</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f43f5e', marginTop: 4 }}>{w.caloriesBurned} cal</div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 11 }}>
                    <Target size={12} color="var(--accent-cyan)" />
                    <span>Focus</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-cyan)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {w.targetMuscle || 'Full Body'}
                  </div>
                </div>
              </div>

              {/* Coach Attribution */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                <UserIcon size={15} color="var(--accent-emerald)" />
                <span>Coach: <strong style={{ color: 'var(--text-primary)' }}>{w.trainerName}</strong></span>
              </div>

              {/* Card Footer Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 8,
                  paddingTop: 12,
                  marginTop: 'auto',
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                <button onClick={() => handleOpenDetail(w)} className="btn-icon" title="View details">
                  <Eye size={15} />
                </button>
                <button onClick={() => handleOpenEdit(w)} className="btn-icon" title="Edit workout">
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => {
                    setSelectedWorkout(w);
                    setIsDeleteOpen(true);
                  }}
                  className="btn-icon"
                  title="Delete workout"
                  style={{ color: 'var(--accent-rose)' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: ADD WORKOUT */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Publish New Workout Plan">
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Workout Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Full Body Metabolic Conditioning"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Difficulty Level *</label>
              <select
                className="form-select"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Coach *</label>
              <select
                className="form-select"
                required
                value={formData.trainerId}
                onChange={(e) => setFormData({ ...formData, trainerId: Number(e.target.value) })}
              >
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.specialty})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Duration (Mins) *</label>
              <input
                type="number"
                min="5"
                max="360"
                required
                className="form-input"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Est. Calories Burned</label>
              <input
                type="number"
                min="0"
                max="5000"
                className="form-input"
                value={formData.caloriesBurned}
                onChange={(e) => setFormData({ ...formData, caloriesBurned: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Muscle</label>
              <input
                type="text"
                placeholder="Core, Glutes, Chest..."
                className="form-input"
                value={formData.targetMuscle || ''}
                onChange={(e) => setFormData({ ...formData, targetMuscle: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Session Description & Instructions</label>
            <textarea
              rows={3}
              className="form-textarea"
              placeholder="Outline warm-ups, sets, reps, and cooldown guidance..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Publishing...' : 'Add Workout'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: EDIT WORKOUT */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Workout Session">
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              required
              className="form-input"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Difficulty Level</label>
              <select
                className="form-select"
                value={editData.difficulty}
                onChange={(e) => setEditData({ ...editData, difficulty: e.target.value })}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Coach</label>
              <select
                className="form-select"
                value={editData.trainerId}
                onChange={(e) => setEditData({ ...editData, trainerId: Number(e.target.value) })}
              >
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Duration (Mins)</label>
              <input
                type="number"
                min="5"
                max="360"
                className="form-input"
                value={editData.durationMinutes}
                onChange={(e) => setEditData({ ...editData, durationMinutes: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Calories</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={editData.caloriesBurned}
                onChange={(e) => setEditData({ ...editData, caloriesBurned: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Muscle</label>
              <input
                type="text"
                className="form-input"
                value={editData.targetMuscle || ''}
                onChange={(e) => setEditData({ ...editData, targetMuscle: e.target.value })}
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
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={editData.isActive ? 'true' : 'false'}
              onChange={(e) => setEditData({ ...editData, isActive: e.target.value === 'true' })}
            >
              <option value="true">Active Routine</option>
              <option value="false">Archived Routine</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={() => setIsEditOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Save Workout'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: VIEW WORKOUT DETAILS */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedWorkout?.title || 'Workout Details'}
        subtitle={`Led by Coach ${selectedWorkout?.trainerName}`}
      >
        {selectedWorkout && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <DifficultyBadge difficulty={selectedWorkout.difficulty} />
              <span className={`badge ${selectedWorkout.isActive ? 'badge-active' : 'badge-inactive'}`}>
                {selectedWorkout.isActive ? 'Active' : 'Archived'}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
                padding: 16,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Session Length</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{selectedWorkout.durationMinutes} Mins</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Est. Calorie Output</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#f43f5e', marginTop: 4 }}>
                  {selectedWorkout.caloriesBurned} kcal
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Focus Group</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-cyan)', marginTop: 4 }}>
                  {selectedWorkout.targetMuscle || 'Full Body'}
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                Description & Plan Instructions
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {selectedWorkout.description || 'No additional instructions provided for this workout session.'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Workout"
        message={`Are you sure you want to remove routine "${selectedWorkout?.title}"?`}
        confirmText="Delete Workout"
        isLoading={actionLoading}
      />
    </div>
  );
};
