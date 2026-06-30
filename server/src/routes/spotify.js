import { Router } from 'express';
import axios from 'axios';

const router = Router();

const requireAuth = (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  next();
};

const spotifyGet = async (url, token, params = {}) => {
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return res.data;
};

const spotifyPost = async (url, token, data = {}, params = {}) => {
  const res = await axios.post(url, data, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    params,
  });
  return res.data;
};

router.get('/search', requireAuth, async (req, res) => {
  const { q, type = 'track', limit = 20, offset = 0 } = req.query;
  if (!q) return res.status(400).json({ error: 'Query required' });

  try {
    const data = await spotifyGet('https://api.spotify.com/v1/search', req.session.user.accessToken, {
      q,
      type,
      limit,
      offset,
      market: req.session.user.country || 'US',
    });
    res.json(data);
  } catch (err) {
    console.error('Search error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/currently-playing', requireAuth, async (req, res) => {
  try {
    const data = await spotifyGet(
      'https://api.spotify.com/v1/me/player/currently-playing',
      req.session.user.accessToken
    );
    res.json(data || {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to get currently playing' });
  }
});

router.get('/player', requireAuth, async (req, res) => {
  try {
    const data = await spotifyGet('https://api.spotify.com/v1/me/player', req.session.user.accessToken);
    res.json(data || {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to get player state' });
  }
});

router.post('/queue', requireAuth, async (req, res) => {
  const { uri } = req.body;
  if (!uri) return res.status(400).json({ error: 'Track URI required' });

  try {
    await axios.post(
      'https://api.spotify.com/v1/me/player/queue',
      null,
      {
        headers: { Authorization: `Bearer ${req.session.user.accessToken}` },
        params: { uri },
      }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Queue error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to add to queue' });
  }
});

router.post('/play', requireAuth, async (req, res) => {
  const { uris, context_uri, offset } = req.body;

  try {
    const body = {};
    if (uris) body.uris = uris;
    if (context_uri) body.context_uri = context_uri;
    if (offset !== undefined) body.offset = offset;

    await axios.put('https://api.spotify.com/v1/me/player/play', body, {
      headers: { Authorization: `Bearer ${req.session.user.accessToken}` },
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Play error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to start playback' });
  }
});

router.post('/pause', requireAuth, async (req, res) => {
  try {
    await axios.put('https://api.spotify.com/v1/me/player/pause', null, {
      headers: { Authorization: `Bearer ${req.session.user.accessToken}` },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to pause' });
  }
});

router.post('/next', requireAuth, async (req, res) => {
  try {
    await axios.post('https://api.spotify.com/v1/me/player/next', null, {
      headers: { Authorization: `Bearer ${req.session.user.accessToken}` },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to skip' });
  }
});

router.get('/token', requireAuth, (req, res) => {
  res.json({
    accessToken: req.session.user.accessToken,
    expiresAt: req.session.user.expiresAt,
  });
});

router.get('/new-releases', requireAuth, async (req, res) => {
  try {
    const data = await spotifyGet(
      'https://api.spotify.com/v1/browse/new-releases',
      req.session.user.accessToken,
      { limit: 20, country: req.session.user.country || 'US' }
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get new releases' });
  }
});

router.get('/featured-playlists', requireAuth, async (req, res) => {
  try {
    const data = await spotifyGet(
      'https://api.spotify.com/v1/browse/featured-playlists',
      req.session.user.accessToken,
      { limit: 10, country: req.session.user.country || 'US' }
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get featured playlists' });
  }
});

export default router;
