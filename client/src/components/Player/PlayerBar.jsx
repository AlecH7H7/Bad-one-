import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useApp } from '../../context/AppContext.jsx';

const fmt = (ms) => {
  if (!ms) return '0:00';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export default function PlayerBar() {
  const { state, dispatch, emitTrackUpdate, addNotification } = useApp();
  const [track, setTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const intervalRef = useRef(null);
  const lastTrackId = useRef(null);

  const fetchPlayer = useCallback(async () => {
    if (!state.user) return;
    try {
      const res = await axios.get('/api/spotify/player', { withCredentials: true });
      const data = res.data;
      if (data?.item) {
        const t = {
          id: data.item.id,
          uri: data.item.uri,
          name: data.item.name,
          artist: data.item.artists?.map((a) => a.name).join(', '),
          album: data.item.album?.name,
          image: data.item.album?.images?.[0]?.url,
          duration: data.item.duration_ms,
        };
        setTrack(t);
        setIsPlaying(data.is_playing);
        setProgress(data.progress_ms || 0);
        setDuration(data.item.duration_ms);

        if (data.item.id !== lastTrackId.current) {
          lastTrackId.current = data.item.id;
          emitTrackUpdate(t, data.is_playing);
          dispatch({ type: 'SET_CURRENT_TRACK', payload: t });
        }
      } else {
        setTrack(null);
        setIsPlaying(false);
        if (lastTrackId.current) {
          lastTrackId.current = null;
          emitTrackUpdate(null, false);
        }
      }
    } catch {
      // Player may not be active
    }
  }, [state.user?.id]);

  useEffect(() => {
    if (!state.user) return;
    fetchPlayer();
    const id = setInterval(fetchPlayer, 5000);
    return () => clearInterval(id);
  }, [fetchPlayer]);

  useEffect(() => {
    if (isPlaying && duration > 0) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => Math.min(p + 1000, duration));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, duration]);

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await axios.post('/api/spotify/pause', {}, { withCredentials: true });
        setIsPlaying(false);
        emitTrackUpdate(track, false);
      } else {
        await axios.post('/api/spotify/play', {}, { withCredentials: true });
        setIsPlaying(true);
        emitTrackUpdate(track, true);
      }
    } catch {
      addNotification('Open Spotify on a device first', 'info');
    }
  };

  const handleNext = async () => {
    try {
      await axios.post('/api/spotify/next', {}, { withCredentials: true });
      setTimeout(fetchPlayer, 800);
    } catch {
      addNotification('No active Spotify device found', 'info');
    }
  };

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  if (!state.user) return null;

  return (
    <div style={{
      height: '76px',
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: '20px',
      flexShrink: 0,
      zIndex: 100,
    }}>
      <div style={{ width: '240px', display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
        {track ? (
          <>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {track.image ? (
                <img src={track.image} alt="" style={{
                  width: '48px', height: '48px', borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                }} />
              ) : (
                <div style={{
                  width: '48px', height: '48px', borderRadius: '8px',
                  background: 'var(--bg-active)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px',
                }}>
                  🎵
                </div>
              )}
              {isPlaying && (
                <div style={{
                  position: 'absolute', bottom: '3px', right: '3px',
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: 'var(--green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    display: 'flex', gap: '1.5px', alignItems: 'flex-end',
                    height: '8px',
                  }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{
                        width: '2px',
                        background: '#000',
                        borderRadius: '1px',
                        animation: `eq-bar ${0.6 + i * 0.15}s ease-in-out infinite alternate`,
                        animationDelay: `${i * 0.1}s`,
                      }} />
                    ))}
                    <style>{`
                      @keyframes eq-bar {
                        from { height: 2px; }
                        to { height: 7px; }
                      }
                    `}</style>
                  </div>
                </div>
              )}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: '13px', fontWeight: '600',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {track.name}
              </div>
              <div style={{
                fontSize: '11px', color: 'var(--text-muted)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {track.artist}
              </div>
            </div>
          </>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Open Spotify to start playing
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={handlePlayPause}
            disabled={!track}
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: track ? 'var(--text-primary)' : 'var(--bg-active)',
              color: track ? '#000' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { if (track) { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.background = '#fff'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; if (track) e.currentTarget.style.background = 'var(--text-primary)'; }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            onClick={handleNext}
            disabled={!track}
            style={{
              background: 'transparent',
              color: track ? 'var(--text-secondary)' : 'var(--text-muted)',
              fontSize: '18px',
              padding: '4px',
            }}
            onMouseEnter={(e) => { if (track) e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { if (track) e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            ⏭
          </button>
        </div>

        <div style={{ width: '100%', maxWidth: '500px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', width: '32px', textAlign: 'right' }}>
            {fmt(progress)}
          </span>
          <div style={{
            flex: 1, height: '3px', background: 'var(--bg-active)',
            borderRadius: '2px', overflow: 'hidden',
            cursor: 'pointer',
          }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'var(--green)',
              borderRadius: '2px',
              transition: 'width 0.5s linear',
            }} />
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', width: '32px' }}>
            {fmt(duration)}
          </span>
        </div>
      </div>

      <div style={{ width: '140px', display: 'flex', align: 'center', gap: '8px', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '14px' }}>🔊</span>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          style={{ width: '80px', accentColor: 'var(--green)', cursor: 'pointer' }}
        />
      </div>
    </div>
  );
}
