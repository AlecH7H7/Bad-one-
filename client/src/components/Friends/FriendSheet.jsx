import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useApp } from '../../context/AppContext.jsx';
import SwipeableTrack from './SwipeableTrack.jsx';
import BlockModal from './BlockModal.jsx';

const debounce = (fn, ms) => {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
};

export default function FriendSheet({ friend, onClose }) {
  const { addToFriendQueue, addNotification, state } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const inputRef = useRef(null);
  const sheetRef = useRef(null);

  const isBlocked = state.blockedUsers?.includes(friend.id);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    setTimeout(() => inputRef.current?.focus(), 320);
  }, []);

  const close = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const search = useRef(debounce(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await axios.get('/api/spotify/search', {
        params: { q, type: 'track', limit: 25 },
        withCredentials: true,
      });
      setResults(res.data.tracks?.items || []);
    } catch { setResults([]); }
    finally { setSearching(false); }
  }, 350)).current;

  const handleQuery = (e) => {
    setQuery(e.target.value);
    search(e.target.value);
  };

  const handleQueue = async (track) => {
    try {
      await axios.post('/api/spotify/queue', { uri: track.uri }, { withCredentials: true });
      addToFriendQueue(friend.id, {
        name: track.name,
        artist: track.artists?.map((a) => a.name).join(', '),
        image: track.album?.images?.[0]?.url,
        uri: track.uri,
      });
      addNotification(`🎵 "${track.name}" added to ${friend.displayName}'s queue!`, 'queue');
    } catch {
      addNotification('Open Spotify on a device first', 'info');
    }
  };

  return (
    <>
      <div
        onClick={close}
        style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.28s ease',
        }}
      />

      <div
        ref={sheetRef}
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: visible ? 'translate(-50%, 0)' : 'translate(-50%, 100%)',
          width: '100%',
          maxWidth: '480px',
          zIndex: 600,
          background: 'var(--bg-card)',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
          transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <div style={{
          padding: '12px 16px 0',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '36px', height: '4px',
            borderRadius: '2px',
            background: 'var(--border)',
          }} />
        </div>

        <div style={{
          padding: '16px 20px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ position: 'relative' }}>
            {friend.image ? (
              <img src={friend.image} alt={friend.displayName} style={{
                width: '52px', height: '52px', borderRadius: '50%',
                border: '2.5px solid var(--green)',
              }} />
            ) : (
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'var(--bg-active)',
                border: '2.5px solid var(--green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '700', fontSize: '20px', color: 'var(--green)',
              }}>
                {friend.displayName?.[0]?.toUpperCase()}
              </div>
            )}
            <div style={{
              position: 'absolute', bottom: 1, right: 1,
              width: '12px', height: '12px', borderRadius: '50%',
              background: 'var(--green)',
              border: '2px solid var(--bg-card)',
            }} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>{friend.displayName}</div>
            {friend.currentTrack && friend.isListening ? (
              <div style={{
                fontSize: '12px', color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px',
              }}>
                <EqBars />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                  {friend.currentTrack.name} — {friend.currentTrack.artist}
                </span>
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Not listening right now</div>
            )}
          </div>

          <button
            onClick={() => setBlockOpen(true)}
            title="Block options"
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '8px',
              fontSize: '20px',
              lineHeight: 1,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            ⋯
          </button>
        </div>

        <div style={{ padding: '14px 16px 10px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'var(--bg-active)',
            border: '1px solid var(--border)',
            borderRadius: '50px',
            padding: '10px 16px',
            transition: 'border-color 0.15s',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={handleQuery}
              placeholder={`Search a song to send to ${friend.displayName}...`}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: '14px',
              }}
            />
            {searching && <Spinner />}
            {query && !searching && (
              <button
                onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
                style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1 }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingBottom: '12px' }}>
          {!query && (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎵</div>
              <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
                Search any song from Spotify's catalog.<br />
                <strong style={{ color: 'var(--green)' }}>Swipe left</strong> on a result to add it to {friend.displayName}'s queue.
              </div>
            </div>
          )}
          {query && !searching && results.length === 0 && (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No results for "{query}"
            </div>
          )}
          {results.map((track) => (
            <SwipeableTrack
              key={track.id}
              track={track}
              friendName={friend.displayName}
              onQueue={() => handleQueue(track)}
            />
          ))}
        </div>
      </div>

      {blockOpen && (
        <BlockModal
          friend={friend}
          onClose={() => setBlockOpen(false)}
          onBlocked={() => { setBlockOpen(false); close(); }}
        />
      )}
    </>
  );
}

function EqBars() {
  return (
    <div style={{ display: 'flex', gap: '1.5px', alignItems: 'flex-end', height: '12px' }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: '2.5px', borderRadius: '1px',
          background: 'var(--green)',
          animation: `eq ${0.55 + i * 0.15}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.12}s`,
        }} />
      ))}
      <style>{`@keyframes eq { from { height: 3px } to { height: 10px } }`}</style>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: '14px', height: '14px',
      border: '2px solid var(--border)',
      borderTopColor: 'var(--green)',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      flexShrink: 0,
    }} />
  );
}
