import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import axios from 'axios';

export default function FriendMapPopup({ friend, onQueueForFriend }) {
  const { inviteListenTogether, addNotification } = useApp();

  const handleListenTogether = async () => {
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
        addNotification('Play a song first to invite to listen together', 'info');
      }
    } catch {
      addNotification('Could not get current track', 'error');
    }
  };

  return (
    <div style={{ padding: '14px', minWidth: '200px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
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
            fontWeight: '700', color: 'var(--green)', fontSize: '16px',
            border: '2px solid var(--green)',
          }}>
            {friend.displayName?.[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <div style={{ fontWeight: '600', fontSize: '14px' }}>{friend.displayName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)' }} />
            <span style={{ color: 'var(--green)', fontSize: '11px', fontWeight: '500' }}>Online</span>
          </div>
        </div>
      </div>

      {friend.currentTrack && friend.isListening ? (
        <div style={{
          background: 'var(--bg-active)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px',
          marginBottom: '12px',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
        }}>
          {friend.currentTrack.image && (
            <img src={friend.currentTrack.image} alt="" style={{
              width: '40px', height: '40px', borderRadius: '6px', flexShrink: 0,
            }} />
          )}
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              fontSize: '12px', fontWeight: '600',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {friend.currentTrack.name}
            </div>
            <div style={{
              fontSize: '11px', color: 'var(--text-muted)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {friend.currentTrack.artist}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          color: 'var(--text-muted)', fontSize: '12px', marginBottom: '12px', fontStyle: 'italic',
        }}>
          Not listening right now
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onQueueForFriend(friend)}
          style={{
            flex: 1,
            padding: '8px',
            background: 'var(--green-dim)',
            border: '1px solid rgba(29,185,84,0.3)',
            borderRadius: 'var(--radius-xs)',
            color: 'var(--green)',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(29,185,84,0.25)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--green-dim)'}
        >
          + Queue
        </button>
        <button
          onClick={handleListenTogether}
          style={{
            flex: 1,
            padding: '8px',
            background: 'var(--purple-dim)',
            border: '1px solid rgba(155,89,247,0.3)',
            borderRadius: 'var(--radius-xs)',
            color: 'var(--purple)',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(155,89,247,0.25)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--purple-dim)'}
        >
          🎧 Together
        </button>
      </div>
    </div>
  );
}
