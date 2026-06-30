import { Router } from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3001/api/auth/callback';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'playlist-read-private',
  'user-library-read',
].join(' ');

router.get('/login', (req, res) => {
  const state = uuidv4();
  req.session.oauthState = state;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error || state !== req.session.oauthState) {
    return res.redirect(`${CLIENT_URL}?error=auth_failed`);
  }

  try {
    const tokenRes = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenRes.data;

    const profileRes = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    req.session.user = {
      id: profileRes.data.id,
      displayName: profileRes.data.display_name,
      email: profileRes.data.email,
      image: profileRes.data.images?.[0]?.url || null,
      country: profileRes.data.country,
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + expires_in * 1000,
    };

    res.redirect(`${CLIENT_URL}/dashboard`);
  } catch (err) {
    console.error('Auth callback error:', err.response?.data || err.message);
    res.redirect(`${CLIENT_URL}?error=token_failed`);
  }
});

router.get('/refresh', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const tokenRes = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: req.session.user.refreshToken,
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    req.session.user.accessToken = tokenRes.data.access_token;
    req.session.user.expiresAt = Date.now() + tokenRes.data.expires_in * 1000;

    res.json({ accessToken: req.session.user.accessToken });
  } catch (err) {
    console.error('Refresh error:', err.message);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  const { id, displayName, email, image, country } = req.session.user;
  res.json({ id, displayName, email, image, country });
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

export default router;
