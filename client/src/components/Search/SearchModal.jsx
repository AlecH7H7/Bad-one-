import React, { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { useApp } from '../../context/AppContext.jsx';

const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export default function SearchModal({ target, onClose }) {
  const { addToFriendQueue, addNotification } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const search = useCallback(
    debounce(async (q) => {
      if (!q.trim()) { setResults([]); return; }
      setLoading(true);
      try {
        const res = await axios.get('/api/spotify/search', {
          params: { q, type: 'track', limit: 20 },
          withCredentials: true,
        });
        setResults(res.data.tracks?.items || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350),
    []
  );

  const handleChange = (e) => {
    setQuery(e.target.value);
    search(e.target.value);
  };

  const handleAddQueue = async (track) => {
    if (target?.mode === 'queue' && target?.friend) {
      const friend = target.friend;
      try {
        await axios.post('/api/spotify/queue', { uri: track.uri }, { withCredentials: true });
        addToFriendQueue(friend.id, {
          name: track.name,
          artist: track.artists?.map((a) => a.name).join(', '),
          image: track.album?.images?.[0]?.url,
          uri: track.uri,
        });
        addNotification(`Added "${track.name}" to ${friend.displayName}'s queue!`, 'success');
        onClose();
      } catch (err) {
        const msg = err.response?.data?.error || 'Failed to add to queue';
        addNotification(msg, 'error');
      }
    } else {
      try {
        await axios.post('/api/spotify/queue', { uri: track.uri }, { withCredentials: true });
        addNotification(`Added "${track.name}" to your queue!`, 'success');
      } catch {
        addNotification('Open Spotify on a device first', 'info');
      }
    }
  };

  const handlePlay = async (track) => {
    try {
      await axios.post('/api/spotify/play', { uris: [track.uri] }, { withCredentials: true });
      addNotification(`Playing "${track.name}"`, 'success');
    } catch {
      addNotification('Open Spotify on a device first', 'info');
    }
  };

  const title = target?.mode === 'queue' && target?.friend
    ? `Queue song for ${target.friend.displayName}`
    : 'Search Music';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '80px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: '100%', maxWidth: '600px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        overflow: 'hidden',
        maxHeight: 'calc(100vh - 120px)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          {target?.friend?.image && (
            <img src={target.friend.image} alt="" style={{
              width: '28px', height: '28px', borderRadius: '50%',
              border: '2px solid var(--green)',
            }} />
          )}
          <h2 style={{ fontSize: '15px', fontWeight: '700', flex: 1 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', color: 'var(--text-muted)',
              fontSize: '20px', lineHeight: 1, padding: '4px',
              borderRadius: '6px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'var(--bg-active)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '10px 14px',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={handleChange}
              placeholder="Search songs, artists, albums..."
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: '14px',
              }}
            />
            {loading && (
              <div style={{
                width: '16px', height: '16px',
                border: '2px solid var(--border)',
                borderTopColor: 'var(--green)',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }} />
            )}
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {results.length === 0 && query && !loading && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No results for "{query}"
            </div>
          )}
          {results.length === 0 && !query && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
              Search from 80M+ songs on Spotify
            </div>
          )}
          {results.map((track) => (
            <TrackRow
              key={track.id}
              track={track}
              targetFriend={target?.friend}
              onAddQueue={() => handleAddQueue(track)}
              onPlay={() => handlePlay(track)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TrackRow({ track, targetFriend, onAddQueue, onPlay }) {
  const [hovered, setHovered] = useState(false);
  const image = track.album?.images?.[1]?.url || track.album?.images?.[0]?.url;
  const artist = track.artists?.map((a) => a.name).join(', ');
  const durationMs = track.duration_ms;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '8px 16px',
        background: hovered ? 'var(--bg-hover)' : 'transparent',
        transition: 'background 0.1s',
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {image ? (
          <img src={image} alt="" style={{ width: '44px', height: '44px', borderRadius: '6px' }} />
        ) : (
          <div style={{
            width: '44px', height: '44px', borderRadius: '6px',
            background: 'var(--bg-active)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
          }}>🎵</div>
        )}
        {hovered && (
          <button
            onClick={onPlay}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '18px',
              cursor: 'pointer',
            }}
          >
            ▶
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{
          fontSize: '13px', fontWeight: '600',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {track.name}
        </div>
        <div style={{
          fontSize: '12px', color: 'var(--text-muted)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {artist} · {track.album?.name}
        </div>
      </div>

      <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
        {minutes}:{String(seconds).padStart(2, '0')}
      </span>

      <button
        onClick={onAddQueue}
        style={{
          flexShrink: 0,
          padding: '6px 12px',
          borderRadius: 'var(--radius-xs)',
          background: targetFriend ? 'var(--green-dim)' : 'var(--bg-active)',
          border: targetFriend ? '1px solid rgba(29,185,84,0.4)' : '1px solid var(--border)',
          color: targetFriend ? 'var(--green)' : 'var(--text-secondary)',
          fontSize: '12px', fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.15s',
          opacity: hovered ? 1 : 0.6,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.background = targetFriend ? 'rgba(29,185,84,0.25)' : 'var(--bg-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = hovered ? '1' : '0.6';
          e.currentTarget.style.background = targetFriend ? 'var(--green-dim)' : 'var(--bg-active)';
        }}
      >
        {targetFriend ? `+ ${targetFriend.displayName}'s Queue` : '+ My Queue'}
      </button>
    </div>
  );
}
