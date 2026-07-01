import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import FriendCard from './FriendCard.jsx';

export default function FriendPanel({ onSelectFriend }) {
  const { state } = useApp();

  return (
    <div style={{
      width: '260px',
      flexShrink: 0,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontWeight: '600', fontSize: '13px' }}>Friends Online</span>
        <span style={{
          background: 'var(--green-dim)',
          color: 'var(--green)',
          fontSize: '11px',
          fontWeight: '700',
          padding: '2px 8px',
          borderRadius: '50px',
          border: '1px solid rgba(29,185,84,0.3)',
        }}>
          {state.onlineFriends.length}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {state.onlineFriends.length === 0 ? (
          <div style={{
            padding: '32px 16px',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🌍</div>
            <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
              No friends online yet. Share Spotify Jam Map with friends to see them on the map!
            </div>
          </div>
        ) : (
          state.onlineFriends.map((friend) => (
            <FriendCard
              key={friend.id}
              friend={friend}
              onClick={() => onSelectFriend(friend)}
            />
          ))
        )}
      </div>

      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border-subtle)',
        color: 'var(--text-muted)',
        fontSize: '11px',
        textAlign: 'center',
      }}>
        Tap a friend or their pin on the map
      </div>
    </div>
  );
}
