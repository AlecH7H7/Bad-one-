import React from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Notifications from './components/UI/Notifications.jsx';
import ListenTogetherModal from './components/UI/ListenTogetherModal.jsx';

function AppInner() {
  const { state } = useApp();

  if (state.loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        background: 'var(--bg-primary)',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--green)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Loading Spotify Jam Map...</span>
      </div>
    );
  }

  return (
    <>
      {state.user ? <Dashboard /> : <LoginPage />}
      <Notifications />
      {state.listenTogetherInvite && <ListenTogetherModal />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
