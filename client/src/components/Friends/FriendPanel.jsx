import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import FriendCard from './FriendCard.jsx';
import ChatPanel from './ChatPanel.jsx';

export default function FriendPanel({ selectedFriend, onSelectFriend, onQueueForFriend }) {
  const { state } = useApp();
  const [chatFriend, setChatFriend] = useState(null);

  if (chatFriend) {
    return (
      <ChatPanel
        friend={chatFriend}
        onBack={() => setChatFriend(null)}
      />
    );
  }

  return (
    <div style={{
      width: '280px',
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
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌍</div>
            <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
              No friends online yet.<br />Share SoundBridge with friends to see them on the map!
            </div>
          </div>
        ) : (
          state.onlineFriends.map((friend) => (
            <FriendCard
              key={friend.id}
              friend={friend}
              isSelected={selectedFriend?.id === friend.id}
              onClick={() => onSelectFriend(friend)}
              onQueueSong={() => onQueueForFriend(friend)}
              onChat={() => setChatFriend(friend)}
            />
          ))
        )}
      </div>
    </div>
  );
}
