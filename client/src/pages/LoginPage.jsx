import React from 'react';

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 20% 50%, rgba(29,185,84,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(155,89,247,0.08) 0%, transparent 60%), var(--bg-primary)',
      padding: '24px',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '420px',
        width: '100%',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, var(--green), var(--purple))',
          margin: '0 auto 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          boxShadow: '0 8px 32px rgba(29,185,84,0.3)',
        }}>
          🎵
        </div>

        <h1 style={{
          fontSize: '36px',
          fontWeight: '700',
          letterSpacing: '-1px',
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          SoundBridge
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '16px',
          lineHeight: '1.6',
          marginBottom: '40px',
        }}>
          See where your friends are listening around the world. Add songs to their queue. Listen together in real time.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          marginBottom: '40px',
        }}>
          {[
            { emoji: '🌍', label: 'World Map', desc: 'See friends live' },
            { emoji: '🎶', label: 'Queue Songs', desc: 'Add to their queue' },
            { emoji: '🎧', label: 'Listen Together', desc: 'Sync in real time' },
          ].map((f) => (
            <div key={f.label} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '16px 12px',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>{f.emoji}</div>
              <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '2px' }}>{f.label}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{f.desc}</div>
            </div>
          ))}
        </div>

        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '50px',
            background: 'var(--green)',
            color: '#000',
            fontWeight: '700',
            fontSize: '15px',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.2s',
            boxShadow: '0 4px 20px rgba(29,185,84,0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--green-hover)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(29,185,84,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--green)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(29,185,84,0.3)';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Continue with Spotify
        </button>

        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '20px' }}>
          A Spotify Premium account is required for playback control
        </p>
      </div>
    </div>
  );
}
