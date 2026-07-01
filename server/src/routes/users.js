import { Router } from 'express';
import { onlineUsers } from '../socket/handlers.js';

const router = Router();

// In-memory blocks: Map<blockerId, Map<blockedId, expiresAt|null>>
export const blocks = new Map();

const requireAuth = (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  next();
};

const DURATIONS = {
  '2h': 2 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  'forever': null,
};

export function isBlocked(blockerId, targetId) {
  const userBlocks = blocks.get(blockerId);
  if (!userBlocks) return false;
  const expiresAt = userBlocks.get(targetId);
  if (expiresAt === undefined) return false;
  if (expiresAt === null) return true;
  if (Date.now() < expiresAt) return true;
  userBlocks.delete(targetId);
  return false;
}

router.get('/online', requireAuth, (req, res) => {
  const myId = req.session.user.id;
  const users = Array.from(onlineUsers.values())
    .filter((u) => !isBlocked(u.id, myId) && !isBlocked(myId, u.id))
    .map((u) => ({
      id: u.id,
      displayName: u.displayName,
      image: u.image,
      location: u.location,
      currentTrack: u.currentTrack,
      isListening: u.isListening,
      lastSeen: u.lastSeen,
    }));
  res.json(users);
});

router.post('/block', requireAuth, (req, res) => {
  const { blockedId, duration } = req.body;
  const blockerId = req.session.user.id;

  if (!blockedId || !DURATIONS.hasOwnProperty(duration)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  if (!blocks.has(blockerId)) blocks.set(blockerId, new Map());

  const expiresAt = DURATIONS[duration] === null ? null : Date.now() + DURATIONS[duration];
  blocks.get(blockerId).set(blockedId, expiresAt);

  res.json({ success: true, expiresAt });
});

router.delete('/block/:blockedId', requireAuth, (req, res) => {
  const blockerId = req.session.user.id;
  const { blockedId } = req.params;

  blocks.get(blockerId)?.delete(blockedId);
  res.json({ success: true });
});

router.get('/blocks', requireAuth, (req, res) => {
  const myBlocks = blocks.get(req.session.user.id);
  if (!myBlocks) return res.json([]);

  const active = [];
  for (const [blockedId, expiresAt] of myBlocks.entries()) {
    if (expiresAt === null || Date.now() < expiresAt) {
      active.push({ blockedId, expiresAt });
    } else {
      myBlocks.delete(blockedId);
    }
  }
  res.json(active);
});

export default router;
