import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';

const icons = {
  queue: '🎵',
  'listen-together': '🎧',
  chat: '💬',
  success: '✅',
  error: '❌',
  info: 'ℹ️',
};

export default function Notifications() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    const timers = state.notifications.map((n) =>
      setTimeout(() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: n.id }), 4000)
    );
    return () => timers.forEach(clearTimeout);
  }, [state.notifications.length]);

  if (state.notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', top: '72px', right: '16px',
      zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: '8px',
      pointerEvents: 'none',
    }}>
      {state.notifications.map((notif) => (
        <div
          key={notif.id}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '12px 16px',
            maxWidth: '320px',
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            boxShadow: 'var(--shadow)',
            animation: 'slide-in 0.25s ease-out',
            pointerEvents: 'auto',
          }}
        >
          <style>{`
            @keyframes slide-in {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
          <span style={{ fontSize: '18px', flexShrink: 0 }}>
            {icons[notif.type] || icons.info}
          </span>
          <span style={{ fontSize: '13px', lineHeight: '1.4', color: 'var(--text-secondary)' }}>
            {notif.message}
          </span>
          <button
            onClick={() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: notif.id })}
            style={{
              background: 'transparent', color: 'var(--text-muted)',
              fontSize: '16px', marginLeft: 'auto', padding: '0 2px', lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
