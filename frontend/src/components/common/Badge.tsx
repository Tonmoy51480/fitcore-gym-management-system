import React from 'react';

interface BadgeProps {
  status: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status }) => {
  const norm = status?.toLowerCase() || '';

  if (norm.includes('active')) {
    return <span className="badge badge-active">Active</span>;
  }
  if (norm.includes('expiring')) {
    return <span className="badge badge-warning">Expiring Soon</span>;
  }
  if (norm.includes('expired')) {
    return <span className="badge badge-expired">Expired</span>;
  }
  return <span className="badge badge-inactive">{status || 'Inactive'}</span>;
};

export const DifficultyBadge: React.FC<{ difficulty: string }> = ({ difficulty }) => {
  const norm = difficulty?.toLowerCase() || '';

  if (norm === 'beginner') {
    return <span className="badge badge-active">Beginner</span>;
  }
  if (norm === 'intermediate') {
    return <span className="badge badge-cyan">Intermediate</span>;
  }
  if (norm === 'advanced') {
    return <span className="badge badge-expired">Advanced</span>;
  }
  return <span className="badge badge-indigo">{difficulty}</span>;
};

export const PaymentMethodBadge: React.FC<{ method: string }> = ({ method }) => {
  return <span className="badge badge-indigo">{method || 'Cash'}</span>;
};
