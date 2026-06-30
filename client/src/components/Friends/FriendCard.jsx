import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import axios from 'axios';

export default function FriendCard({ friend, isSelected, onClick, onQueueSong, onChat }) {
  const { inviteListenTogether, addNotification } = useApp();
  const [hovered, setHovered] = useState(false);

  const handleListenTogether = async (e) => {
    e.stopPropagation();
    try {
      const res = await axios.get('/api/spotify/currently-playing', { withCredentials: true });
      if (res.data?.item) {
        inviteListenTogether(friend.id, res.data.item.uri, {
          name: res.data.item.name,
          artist: res.data.item.artists?.[0]?.name,
          image: res.data.item.album?.images?.[0]?.url,
          progressMs: res.data.progress_ms,
        });
        addNotification(`Invited ${friend.displayName} to listen together!`, 'success');
      } else {
        addNotification('Play a song first to share it!', 'info');
      }
    } catch {
      addNotification('Failed to get current track', 'error');
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '10px',
        borderRadius: 'var(--radius-sm)',
        background: isSelected ? 'var(--bg-active)' : hovered ? 'var(--bg-hover)' : 'transparent',
        border: isSelected ? '1px solid var(--border)' : '1px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.15s',
        marginBottom: '2px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {friend.image ? (
            <img src={friend.image} alt={friend.displayName} style={{
              width: '38px', height: '38px', borderRadius: '50%',
              border: '2px solid var(--green)',
            }} />
          ) : (
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'var(--bg-active)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '700', color: 'var(--green)', fontSize: '15px',
              border: '2px solid var(--green)',
            }}>
              {friend.displayName?.[0]?.toUpperCase()}
            </div>
          )}
          <div style={{
            position: 'absolute', bottom: '0', right: '0',
            width: '10px', height: '10px', borderRadius: '50%',
            background: 'var(--green)',
            border: '2px solid var(--bg-secondary)',
          }} />
        </div>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{
            fontWeight: '600', fontSize: '13px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {friend.displayName}
          </div>
          {friend.currentTrack && friend.isListening ? (
            <div style={{
              fontSize: '11px', color: 'var(--text-muted)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <span style={{ color: 'var(--green)', fontSize: '9px' }}>▶</span>
              {friend.currentTrack.name} — {friend.currentTrack.artist}
            </div>
          ) : (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Not listening</div>
          )}
          {friend.location && (
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
              📍 {friend.location.city || `${friend.location.lat.toFixed(1)}, ${friend.location.lng.toFixed(1)}`}
            </div>
          )}
        </div>
      </div>

      {(hovered || isSelected) && (
        <div style={{
          display: 'flex', gap: '6px', marginTop: '10px',
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); onQueueSong(); }}
            style={{
              flex: 1, padding: '6px 8px',
              background: 'var(--green-dim)',
              border: '1px solid rgba(29,185,84,0.3)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--green)', fontSize: '11px', fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(29,185,84,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--green-dim)'}
            title="Add song to their queue"
          >
            + Queue
          </button>
          <button
            onClick={handleListenTogether}
            style={{
              flex: 1, padding: '6px 8px',
              background: 'var(--purple-dim)',
              border: '1px solid rgba(155,89,247,0.3)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--purple)', fontSize: '11px', fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(155,89,247,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--purple-dim)'}
            title="Listen together"
          >
            🎧 Together
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onChat(); }}
            style={{
              padding: '6px 8px',
              background: 'var(--bg-active)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-secondary)', fontSize: '11px',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-active)'}
            title="Chat"
          >
            💬
          </button>
        </div>
      )}
    </div>
  );
}
