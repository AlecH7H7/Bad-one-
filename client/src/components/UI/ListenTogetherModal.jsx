import React from 'react';
import axios from 'axios';
import { useApp } from '../../context/AppContext.jsx';

export default function ListenTogetherModal() {
  const { state, dispatch, acceptListenTogether, addNotification } = useApp();
  const invite = state.listenTogetherInvite;

  if (!invite) return null;

  const handleAccept = async () => {
    try {
      if (invite.trackUri) {
        await axios.post('/api/spotify/play', {
          uris: [invite.trackUri],
        }, { withCredentials: true });
      }
      acceptListenTogether(invite.from.id);
      addNotification(`Now listening with ${invite.from.displayName}!`, 'success');
    } catch {
      addNotification('Open Spotify on a device to sync', 'info');
      acceptListenTogether(invite.from.id);
    }
  };

  const handleDecline = () => {
    dispatch({ type: 'SET_LISTEN_TOGETHER_INVITE', payload: null });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '28px',
        maxWidth: '340px',
        width: '100%',
        textAlign: 'center',
        boxShadow: 'var(--shadow)',
        animation: 'pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}>
        <style>{`
          @keyframes pop-in {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>

        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎧</div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          {invite.from.image ? (
            <img src={invite.from.image} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
          ) : null}
          <span style={{ fontWeight: '700', fontSize: '16px' }}>{invite.from.displayName}</span>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
          wants to listen together
        </p>

        {invite.trackInfo && (
          <div style={{
            background: 'var(--bg-active)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            display: 'flex', gap: '12px', alignItems: 'center',
            marginBottom: '20px', textAlign: 'left',
          }}>
            {invite.trackInfo.image && (
              <img src={invite.trackInfo.image} alt="" style={{ width: '44px', height: '44px', borderRadius: '6px' }} />
            )}
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>{invite.trackInfo.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{invite.trackInfo.artist}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleDecline}
            style={{
              flex: 1, padding: '12px',
              background: 'var(--bg-active)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              fontWeight: '600', fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-active)'}
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            style={{
              flex: 1, padding: '12px',
              background: 'var(--green)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              color: '#000',
              fontWeight: '700', fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: '0 4px 16px rgba(29,185,84,0.3)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--green-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--green)'}
          >
            Join 🎵
          </button>
        </div>
      </div>
    </div>
  );
}
