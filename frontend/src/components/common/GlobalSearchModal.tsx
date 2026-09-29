import { Search, User as UserIcon, Award, DollarSign, Dumbbell, Calendar, X, ArrowRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { GlobalSearchResult } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search.global(query);
        setResults(res);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const hasAnyResults =
    results &&
    (results.members.length > 0 ||
      results.trainers.length > 0 ||
      results.plans.length > 0 ||
      results.workouts.length > 0 ||
      results.payments.length > 0);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px',
        paddingLeft: 16,
        paddingRight: 16,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: 640,
          background: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <Search size={20} color="var(--accent-emerald)" />
          <input
            autoFocus
            type="text"
            placeholder="Search members, trainers, plans, workouts, payments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: 16,
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
          )}
          <span
            style={{
              padding: '2px 6px',
              fontSize: 11,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--text-muted)',
            }}
          >
            ESC
          </span>
        </div>

        {/* Results Panel */}
        <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '16px 20px' }}>
          {loading && (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Searching live database...
            </div>
          )}

          {!loading && query && !hasAnyResults && (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No matches found for "{query}". Try a different keyword.
            </div>
          )}

          {!query && (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Type to search across the entire gym system in real time.
            </div>
          )}

          {results && hasAnyResults && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Members */}
              {results.members.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-emerald)', marginBottom: 8 }}>
                    Members ({results.members.length})
                  </div>
                  {results.members.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        onNavigate('members');
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <UserIcon size={16} color="var(--accent-emerald)" />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.email} {m.phone ? `• ${m.phone}` : ''}</div>
                        </div>
                      </div>
                      <span className="badge badge-active">{m.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Trainers */}
              {results.trainers.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-cyan)', marginBottom: 8 }}>
                    Trainers ({results.trainers.length})
                  </div>
                  {results.trainers.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        onNavigate('trainers');
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Award size={16} color="var(--accent-cyan)" />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.specialty} • {t.experienceYears} yrs exp</div>
                        </div>
                      </div>
                      <ArrowRight size={14} color="var(--text-muted)" />
                    </div>
                  ))}
                </div>
              )}

              {/* Plans */}
              {results.plans.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-amber)', marginBottom: 8 }}>
                    Membership Plans ({results.plans.length})
                  </div>
                  {results.plans.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onNavigate('plans');
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Calendar size={16} color="var(--accent-amber)" />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{p.planName}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.durationMonths} Months • ${p.price}</div>
                        </div>
                      </div>
                      <span className="badge badge-warning">${p.price}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Workouts */}
              {results.workouts.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-indigo)', marginBottom: 8 }}>
                    Workouts ({results.workouts.length})
                  </div>
                  {results.workouts.map((w) => (
                    <div
                      key={w.id}
                      onClick={() => {
                        onNavigate('workouts');
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Dumbbell size={16} color="var(--accent-indigo)" />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{w.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{w.durationMinutes} mins • {w.difficulty} • Coach: {w.trainerName}</div>
                        </div>
                      </div>
                      <ArrowRight size={14} color="var(--text-muted)" />
                    </div>
                  ))}
                </div>
              )}

              {/* Payments */}
              {results.payments.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#10b981', marginBottom: 8 }}>
                    Payments ({results.payments.length})
                  </div>
                  {results.payments.map((py) => (
                    <div
                      key={py.id}
                      onClick={() => {
                        onNavigate('payments');
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <DollarSign size={16} color="#10b981" />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{py.memberName} (${py.amount})</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{py.transactionId} • {py.paymentMethod}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>+${py.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
