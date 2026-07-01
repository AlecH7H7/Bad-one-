import { isBlocked } from '../routes/users.js';

export const onlineUsers = new Map();

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('user:join', ({ user, location }) => {
      const userData = {
        id: user.id,
        socketId: socket.id,
        displayName: user.displayName,
        image: user.image,
        location: location || null,
        currentTrack: null,
        isListening: false,
        lastSeen: Date.now(),
      };

      onlineUsers.set(user.id, userData);
      socket.userId = user.id;

      for (const [id, peer] of onlineUsers.entries()) {
        if (id === user.id) continue;
        if (isBlocked(id, user.id) || isBlocked(user.id, id)) continue;
        const peerSocket = io.sockets.sockets.get(peer.socketId);
        peerSocket?.emit('user:online', userData);
        socket.emit('user:online', peer);
      }
    });

    socket.on('track:update', ({ track, isListening }) => {
      if (!socket.userId) return;
      const user = onlineUsers.get(socket.userId);
      if (!user) return;

      user.currentTrack = track;
      user.isListening = isListening;
      user.lastSeen = Date.now();
      onlineUsers.set(socket.userId, user);

      for (const [id, peer] of onlineUsers.entries()) {
        if (id === socket.userId) continue;
        if (isBlocked(id, socket.userId) || isBlocked(socket.userId, id)) continue;
        const peerSocket = io.sockets.sockets.get(peer.socketId);
        peerSocket?.emit('track:updated', { userId: socket.userId, track, isListening });
      }
    });

    socket.on('location:update', ({ location }) => {
      if (!socket.userId) return;
      const user = onlineUsers.get(socket.userId);
      if (!user) return;

      user.location = location;
      onlineUsers.set(socket.userId, user);

      for (const [id, peer] of onlineUsers.entries()) {
        if (id === socket.userId) continue;
        if (isBlocked(id, socket.userId) || isBlocked(socket.userId, id)) continue;
        const peerSocket = io.sockets.sockets.get(peer.socketId);
        peerSocket?.emit('location:updated', { userId: socket.userId, location });
      }
    });

    socket.on('queue:add', ({ targetUserId, track }) => {
      if (!socket.userId) return;
      if (isBlocked(targetUserId, socket.userId)) return;

      const targetUser = onlineUsers.get(targetUserId);
      if (!targetUser) return;

      const targetSocket = io.sockets.sockets.get(targetUser.socketId);
      const sender = onlineUsers.get(socket.userId);
      targetSocket?.emit('queue:track-added', {
        track,
        from: { id: socket.userId, displayName: sender?.displayName || 'Someone', image: sender?.image || null },
      });
    });

    socket.on('listen-together:invite', ({ targetUserId, trackUri, trackInfo }) => {
      if (!socket.userId) return;
      if (isBlocked(targetUserId, socket.userId)) return;

      const targetUser = onlineUsers.get(targetUserId);
      if (!targetUser) return;

      const targetSocket = io.sockets.sockets.get(targetUser.socketId);
      const sender = onlineUsers.get(socket.userId);
      targetSocket?.emit('listen-together:invited', {
        from: { id: socket.userId, displayName: sender?.displayName || 'Someone', image: sender?.image || null },
        trackUri,
        trackInfo,
      });
    });

    socket.on('listen-together:accept', ({ hostUserId }) => {
      const hostUser = onlineUsers.get(hostUserId);
      if (!hostUser) return;

      const hostSocket = io.sockets.sockets.get(hostUser.socketId);
      const accepter = onlineUsers.get(socket.userId);
      hostSocket?.emit('listen-together:accepted', {
        user: { id: socket.userId, displayName: accepter?.displayName || 'Someone', image: accepter?.image || null },
      });
    });

    socket.on('chat:message', ({ targetUserId, message }) => {
      if (!socket.userId) return;
      if (isBlocked(targetUserId, socket.userId)) return;

      const targetUser = onlineUsers.get(targetUserId);
      if (!targetUser) return;

      const targetSocket = io.sockets.sockets.get(targetUser.socketId);
      const sender = onlineUsers.get(socket.userId);
      targetSocket?.emit('chat:received', {
        from: { id: socket.userId, displayName: sender?.displayName || 'Someone', image: sender?.image || null },
        message,
        timestamp: Date.now(),
      });
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        for (const [id, peer] of onlineUsers.entries()) {
          if (isBlocked(id, socket.userId) || isBlocked(socket.userId, id)) continue;
          const peerSocket = io.sockets.sockets.get(peer.socketId);
          peerSocket?.emit('user:offline', { userId: socket.userId });
        }
      }
    });
  });
}
