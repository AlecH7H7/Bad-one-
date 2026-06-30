import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';

export default function ChatPanel({ friend, onBack }) {
  const { state, sendChatMessage } = useApp();
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  const messages = state.chatMessages[friend.id] || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    sendChatMessage(friend.id, text);
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      width: '280px',
      flexShrink: 0,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            color: 'var(--text-secondary)',
            padding: '4px',
            borderRadius: '6px',
            fontSize: '18px',
            lineHeight: 1,
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          ←
        </button>
        {friend.image ? (
          <img src={friend.image} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
        ) : (
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'var(--bg-active)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '700', color: 'var(--green)', fontSize: '12px',
          }}>
            {friend.displayName?.[0]?.toUpperCase()}
          </div>
        )}
        <span style={{ fontWeight: '600', fontSize: '13px' }}>{friend.displayName}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', marginTop: '20px' }}>
            Say hi! 👋
          </div>
        ) : (
          messages.map((msg, i) => {
            const isSelf = msg.from === state.user?.id;
            return (
              <div key={i} style={{ display: 'flex', justifyContent: isSelf ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '8px 12px',
                  borderRadius: isSelf ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: isSelf ? 'var(--green)' : 'var(--bg-active)',
                  color: isSelf ? '#000' : 'var(--text-primary)',
                  fontSize: '13px',
                  lineHeight: 1.4,
                }}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{
        padding: '10px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        gap: '8px',
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Message..."
          style={{
            flex: 1,
            background: 'var(--bg-active)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '8px 14px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          style={{
            width: '34px', height: '34px',
            borderRadius: '50%',
            background: input.trim() ? 'var(--green)' : 'var(--bg-active)',
            color: input.trim() ? '#000' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px',
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
