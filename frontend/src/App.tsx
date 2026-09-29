import React, { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { MembersPage } from './pages/MembersPage';
import { MembershipPlansPage } from './pages/MembershipPlansPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TrainersPage } from './pages/TrainersPage';
import { WorkoutsPage } from './pages/WorkoutsPage';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [initialRenewId, setInitialRenewId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--text-secondary)',
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        Initializing FITCORE Gym Management System...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleQuickAction = (action: string) => {
    if (action === 'add-member') {
      setCurrentPage('members');
    } else if (action === 'record-payment') {
      setCurrentPage('payments');
    } else if (action === 'add-workout') {
      setCurrentPage('workouts');
    } else if (action === 'add-trainer') {
      setCurrentPage('trainers');
    } else if (action === 'add-plan') {
      setCurrentPage('plans');
    } else if (action.startsWith('renew-member-')) {
      const id = Number(action.replace('renew-member-', ''));
      setInitialRenewId(id);
      setCurrentPage('members');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} onQuickAction={handleQuickAction} />;
      case 'members':
        return (
          <MembersPage
            initialRenewId={initialRenewId}
            onClearInitialRenew={() => setInitialRenewId(null)}
          />
        );
      case 'trainers':
        return <TrainersPage />;
      case 'plans':
        return <MembershipPlansPage />;
      case 'workouts':
        return <WorkoutsPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={setCurrentPage} onQuickAction={handleQuickAction} />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onQuickAction={handleQuickAction}
    >
      {renderPage()}
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
