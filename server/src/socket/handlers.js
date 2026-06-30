export const onlineUsers = new Map();

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

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

      socket.broadcast.emit('user:online', userData);

      const allUsers = Array.from(onlineUsers.values()).filter((u) => u.id !== user.id);
      socket.emit('users:list', allUsers);

      console.log(`User joined: ${user.displayName} (${user.id})`);
    });

    socket.on('track:update', ({ track, isListening }) => {
      if (!socket.userId) return;

      const user = onlineUsers.get(socket.userId);
      if (!user) return;

      user.currentTrack = track;
      user.isListening = isListening;
      user.lastSeen = Date.now();
      onlineUsers.set(socket.userId, user);

      socket.broadcast.emit('track:updated', {
        userId: socket.userId,
        track,
        isListening,
      });
    });

    socket.on('location:update', ({ location }) => {
      if (!socket.userId) return;

      const user = onlineUsers.get(socket.userId);
      if (!user) return;

      user.location = location;
      onlineUsers.set(socket.userId, user);

      socket.broadcast.emit('location:updated', {
        userId: socket.userId,
        location,
      });
    });

    socket.on('queue:add', ({ targetUserId, track }) => {
      const targetUser = onlineUsers.get(targetUserId);
      if (!targetUser) return;

      const targetSocket = io.sockets.sockets.get(targetUser.socketId);
      if (targetSocket) {
        const sender = onlineUsers.get(socket.userId);
        targetSocket.emit('queue:track-added', {
          track,
          from: {
            id: socket.userId,
            displayName: sender?.displayName || 'Someone',
            image: sender?.image || null,
          },
        });
      }
    });

    socket.on('listen-together:invite', ({ targetUserId, trackUri, trackInfo }) => {
      const targetUser = onlineUsers.get(targetUserId);
      if (!targetUser) return;

      const targetSocket = io.sockets.sockets.get(targetUser.socketId);
      if (targetSocket) {
        const sender = onlineUsers.get(socket.userId);
        targetSocket.emit('listen-together:invited', {
          from: {
            id: socket.userId,
            displayName: sender?.displayName || 'Someone',
            image: sender?.image || null,
          },
          trackUri,
          trackInfo,
        });
      }
    });

    socket.on('listen-together:accept', ({ hostUserId }) => {
      const hostUser = onlineUsers.get(hostUserId);
      if (!hostUser) return;

      const hostSocket = io.sockets.sockets.get(hostUser.socketId);
      if (hostSocket) {
        const accepter = onlineUsers.get(socket.userId);
        hostSocket.emit('listen-together:accepted', {
          user: {
            id: socket.userId,
            displayName: accepter?.displayName || 'Someone',
            image: accepter?.image || null,
          },
        });
      }
    });

    socket.on('chat:message', ({ targetUserId, message }) => {
      const targetUser = onlineUsers.get(targetUserId);
      if (!targetUser) return;

      const targetSocket = io.sockets.sockets.get(targetUser.socketId);
      if (targetSocket) {
        const sender = onlineUsers.get(socket.userId);
        targetSocket.emit('chat:received', {
          from: {
            id: socket.userId,
            displayName: sender?.displayName || 'Someone',
            image: sender?.image || null,
          },
          message,
          timestamp: Date.now(),
        });
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        socket.broadcast.emit('user:offline', { userId: socket.userId });
        console.log(`User disconnected: ${socket.userId}`);
      }
    });
  });
}
