import React, { useState } from 'react';

export default function FriendCard({ friend, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false);

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
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {friend.image ? (
          <img src={friend.image} alt={friend.displayName} style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '2px solid var(--green)',
          }} />
        ) : (
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'var(--bg-active)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '700', color: 'var(--green)', fontSize: '16px',
            border: '2px solid var(--green)',
          }}>
            {friend.displayName?.[0]?.toUpperCase()}
          </div>
        )}
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
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
            fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px',
            display: 'flex', alignItems: 'center', gap: '4px',
            overflow: 'hidden',
          }}>
            <span style={{ color: 'var(--green)', fontSize: '9px', flexShrink: 0 }}>▶</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {friend.currentTrack.name}
            </span>
          </div>
        ) : (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>Not listening</div>
        )}
      </div>

      {hovered && (
        <div style={{
          color: 'var(--text-muted)', fontSize: '13px', flexShrink: 0,
        }}>
          ›
        </div>
      )}
    </div>
  );
}
