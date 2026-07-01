import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import axios from 'axios';

export default function Header() {
  const { state, dispatch } = useApp();
  const { user, onlineFriends } = state;

  const handleLogout = async () => {
    await axios.post('/api/auth/logout', {}, { withCredentials: true });
    dispatch({ type: 'SET_USER', payload: null });
    window.location.href = '/';
  };

  return (
    <header style={{
      height: '56px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: '16px',
      flexShrink: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '30px', height: '30px',
          borderRadius: '9px',
          background: 'linear-gradient(135deg, var(--green), var(--purple))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '15px',
          boxShadow: '0 2px 8px rgba(29,185,84,0.3)',
        }}>
          🎵
        </div>
        <span style={{ fontWeight: '700', fontSize: '16px', letterSpacing: '-0.3px' }}>Spotify Jam Map</span>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '4px 10px',
          background: 'var(--green-dim)',
          borderRadius: '50px',
          border: '1px solid rgba(29,185,84,0.3)',
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--green)',
            animation: 'pulse-dot 2s ease-in-out infinite',
          }} />
          <style>{`@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
          <span style={{ color: 'var(--green)', fontSize: '12px', fontWeight: '600' }}>
            {onlineFriends.length} online
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user?.image ? (
            <img src={user.image} alt={user.displayName} style={{
              width: '30px', height: '30px', borderRadius: '50%',
              border: '2px solid var(--border)',
            }} />
          ) : (
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'var(--bg-active)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: '600', color: 'var(--green)',
              border: '2px solid var(--border)',
            }}>
              {user?.displayName?.[0]?.toUpperCase()}
            </div>
          )}
          <span style={{
            fontSize: '13px', color: 'var(--text-secondary)',
            maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {user?.displayName}
          </span>
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            color: 'var(--text-muted)',
            padding: '6px 10px',
            borderRadius: 'var(--radius-xs)',
            fontSize: '12px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
