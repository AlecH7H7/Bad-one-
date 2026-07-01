import React, { useRef, useState } from 'react';

const THRESHOLD = 110;

export default function SwipeableTrack({ track, friendName, onQueue }) {
  const [offset, setOffset] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [queued, setQueued] = useState(false);
  const startX = useRef(null);
  const isDragging = useRef(false);
  const rowRef = useRef(null);

  const image = track.album?.images?.[1]?.url || track.album?.images?.[0]?.url;
  const artist = track.artists?.map((a) => a.name).join(', ');
  const mins = Math.floor(track.duration_ms / 60000);
  const secs = String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0');

  const revealPct = Math.min(Math.abs(offset) / THRESHOLD, 1);

  const triggerQueue = async () => {
    setAnimating(true);
    setOffset(-THRESHOLD * 1.5);
    await new Promise((r) => setTimeout(r, 180));
    await onQueue();
    setQueued(true);
    setOffset(0);
    setAnimating(false);
    setTimeout(() => setQueued(false), 2000);
  };

  const onPointerDown = (e) => {
    startX.current = e.clientX ?? e.touches?.[0]?.clientX;
    isDragging.current = true;
  };

  const onPointerMove = (e) => {
    if (!isDragging.current || startX.current == null) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const delta = clientX - startX.current;
    if (delta > 0) { setOffset(0); return; }
    setOffset(Math.max(delta, -THRESHOLD * 1.6));
  };

  const onPointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (offset <= -THRESHOLD) {
      triggerQueue();
    } else {
      setAnimating(true);
      setOffset(0);
      setTimeout(() => setAnimating(false), 250);
    }
    startX.current = null;
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', userSelect: 'none' }}>
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0,
        width: `${Math.max(Math.abs(offset), 0)}px`,
        background: queued ? 'var(--green)' : `rgba(29, 185, 84, ${0.3 + revealPct * 0.7})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '6px',
        transition: animating ? 'width 0.25s ease, background 0.2s' : 'background 0.1s',
        minWidth: offset < -20 ? '60px' : '0',
        overflow: 'hidden',
      }}>
        {Math.abs(offset) > 30 && (
          <>
            <span style={{ fontSize: revealPct > 0.7 ? '20px' : '16px', transition: 'font-size 0.15s' }}>
              {queued ? '✓' : '➕'}
            </span>
            {revealPct > 0.5 && (
              <span style={{
                color: '#fff', fontSize: '11px', fontWeight: '700',
                whiteSpace: 'nowrap', opacity: (revealPct - 0.5) * 2,
              }}>
                {queued ? 'Queued!' : 'Queue'}
              </span>
            )}
          </>
        )}
      </div>

      <div
        ref={rowRef}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '10px 20px',
          transform: `translateX(${offset}px)`,
          transition: animating ? 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)' : 'none',
          background: queued ? 'rgba(29,185,84,0.08)' : 'var(--bg-card)',
          cursor: 'grab',
          WebkitUserSelect: 'none',
        }}
      >
        {image ? (
          <img src={image} alt="" style={{
            width: '46px', height: '46px', borderRadius: '8px',
            flexShrink: 0, pointerEvents: 'none',
          }} />
        ) : (
          <div style={{
            width: '46px', height: '46px', borderRadius: '8px',
            background: 'var(--bg-active)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', flexShrink: 0,
          }}>🎵</div>
        )}

        <div style={{ flex: 1, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{
            fontWeight: '600', fontSize: '13px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            color: queued ? 'var(--green)' : 'var(--text-primary)',
          }}>
            {track.name}
          </div>
          <div style={{
            fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {artist} · {track.album?.name}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, pointerEvents: 'none' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{mins}:{secs}</span>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            color: 'var(--text-muted)', fontSize: '10px',
            opacity: 0.5,
          }}>
            <span>←</span>
            <span style={{ fontSize: '8px', marginTop: '-2px' }}>swipe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
