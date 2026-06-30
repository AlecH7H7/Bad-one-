import { Router } from 'express';
import { onlineUsers } from '../socket/handlers.js';

const router = Router();

const requireAuth = (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  next();
};

router.get('/online', requireAuth, (_req, res) => {
  const users = Array.from(onlineUsers.values()).map((u) => ({
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

export default router;
