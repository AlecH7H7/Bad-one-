import React, { useState } from 'react';
import axios from 'axios';
import { useApp } from '../../context/AppContext.jsx';

const DURATIONS = [
  { label: '2 hours', value: '2h', ms: 2 * 60 * 60 * 1000, icon: '⏱' },
  { label: '24 hours', value: '24h', ms: 24 * 60 * 60 * 1000, icon: '🌙' },
  { label: '7 days', value: '7d', ms: 7 * 24 * 60 * 60 * 1000, icon: '📅' },
  { label: 'Forever', value: 'forever', ms: null, icon: '🚫' },
];

export default function BlockModal({ friend, onClose, onBlocked }) {
  const { dispatch, addNotification } = useApp();
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBlock = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await axios.post('/api/users/block', {
        blockedId: friend.id,
        duration: selected.value,
      }, { withCredentials: true });

      dispatch({ type: 'BLOCK_USER', payload: friend.id });
      addNotification(`Blocked ${friend.displayName} for ${selected.label.toLowerCase()}`, 'info');
      onBlocked();
    } catch {
      addNotification('Failed to block user', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 700,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '28px 24px',
        maxWidth: '360px',
        width: '100%',
        boxShadow: '0 16px 60px rgba(0,0,0,0.6)',
        animation: 'pop-in 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}>
        <style>{`@keyframes pop-in { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>

        {!confirming ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🚫</div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '6px' }}>
                Block {friend.displayName}?
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5 }}>
                They won't see your location, add songs to your queue, or message you. Choose how long:
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setSelected(d)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: selected?.value === d.value ? 'rgba(239,68,68,0.15)' : 'var(--bg-active)',
                    border: selected?.value === d.value ? '1px solid rgba(239,68,68,0.5)' : '1px solid var(--border)',
                    color: selected?.value === d.value ? '#ef4444' : 'var(--text-primary)',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (selected?.value !== d.value) {
                      e.currentTarget.style.background = 'var(--bg-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selected?.value !== d.value) {
                      e.currentTarget.style.background = 'var(--bg-active)';
                    }
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{d.icon}</span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{d.label}</div>
                    {d.value !== 'forever' && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                        Auto-unblocks after {d.label.toLowerCase()}
                      </div>
                    )}
                    {d.value === 'forever' && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                        Until you manually unblock them
                      </div>
                    )}
                  </div>
                  {selected?.value === d.value && (
                    <span style={{ marginLeft: 'auto', color: '#ef4444' }}>✓</span>
                  )}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: '13px',
                  borderRadius: '12px',
                  background: 'var(--bg-active)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-active)'}
              >
                Cancel
              </button>
              <button
                onClick={() => selected && setConfirming(true)}
                disabled={!selected}
                style={{
                  flex: 1, padding: '13px',
                  borderRadius: '12px',
                  background: selected ? '#ef4444' : 'var(--bg-active)',
                  border: 'none',
                  color: selected ? '#fff' : 'var(--text-muted)',
                  fontWeight: '700', fontSize: '14px',
                  cursor: selected ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s',
                  opacity: selected ? 1 : 0.5,
                }}
                onMouseEnter={(e) => { if (selected) e.currentTarget.style.background = '#dc2626'; }}
                onMouseLeave={(e) => { if (selected) e.currentTarget.style.background = '#ef4444'; }}
              >
                Block
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>⚠️</div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>
                Are you sure?
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5 }}>
                Block <strong style={{ color: 'var(--text-primary)' }}>{friend.displayName}</strong> for{' '}
                <strong style={{ color: '#ef4444' }}>{selected.label.toLowerCase()}</strong>?
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setConfirming(false)}
                style={{
                  flex: 1, padding: '13px',
                  borderRadius: '12px',
                  background: 'var(--bg-active)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                }}
              >
                Go back
              </button>
              <button
                onClick={handleBlock}
                disabled={loading}
                style={{
                  flex: 1, padding: '13px',
                  borderRadius: '12px',
                  background: '#ef4444',
                  border: 'none',
                  color: '#fff',
                  fontWeight: '700', fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {loading ? <Spinner /> : null}
                Yes, block
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: '14px', height: '14px',
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
    }} />
  );
}
