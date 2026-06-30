import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const AppContext = createContext(null);

const initialState = {
  user: null,
  loading: true,
  onlineFriends: [],
  currentTrack: null,
  isPlaying: false,
  notifications: [],
  listenTogetherInvite: null,
  chatMessages: {},
  socket: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_FRIENDS':
      return { ...state, onlineFriends: action.payload };
    case 'ADD_FRIEND':
      return { ...state, onlineFriends: [...state.onlineFriends, action.payload] };
    case 'REMOVE_FRIEND':
      return { ...state, onlineFriends: state.onlineFriends.filter((f) => f.id !== action.payload) };
    case 'UPDATE_FRIEND_TRACK':
      return {
        ...state,
        onlineFriends: state.onlineFriends.map((f) =>
          f.id === action.payload.userId
            ? { ...f, currentTrack: action.payload.track, isListening: action.payload.isListening }
            : f
        ),
      };
    case 'UPDATE_FRIEND_LOCATION':
      return {
        ...state,
        onlineFriends: state.onlineFriends.map((f) =>
          f.id === action.payload.userId ? { ...f, location: action.payload.location } : f
        ),
      };
    case 'SET_CURRENT_TRACK':
      return { ...state, currentTrack: action.payload };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications].slice(0, 10) };
    case 'REMOVE_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter((n) => n.id !== action.payload) };
    case 'SET_LISTEN_TOGETHER_INVITE':
      return { ...state, listenTogetherInvite: action.payload };
    case 'ADD_CHAT_MESSAGE':
      const { userId, message } = action.payload;
      return {
        ...state,
        chatMessages: {
          ...state.chatMessages,
          [userId]: [...(state.chatMessages[userId] || []), message],
        },
      };
    case 'SET_SOCKET':
      return { ...state, socket: action.payload };
    default:
      return state;
  }
}

let notifId = 0;

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const socketRef = useRef(null);

  useEffect(() => {
    axios
      .get('/api/auth/me', { withCredentials: true })
      .then((res) => dispatch({ type: 'SET_USER', payload: res.data }))
      .catch(() => dispatch({ type: 'SET_LOADING', payload: false }));
  }, []);

  useEffect(() => {
    if (!state.user) return;

    const socket = io(import.meta.env.VITE_SERVER_URL || '', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;
    dispatch({ type: 'SET_SOCKET', payload: socket });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        socket.emit('user:join', { user: state.user, location });
        socket.emit('location:update', { location });
      },
      () => {
        socket.emit('user:join', { user: state.user, location: null });
      }
    );

    socket.on('users:list', (users) => dispatch({ type: 'SET_FRIENDS', payload: users }));
    socket.on('user:online', (user) => dispatch({ type: 'ADD_FRIEND', payload: user }));
    socket.on('user:offline', ({ userId }) => dispatch({ type: 'REMOVE_FRIEND', payload: userId }));
    socket.on('track:updated', (data) => dispatch({ type: 'UPDATE_FRIEND_TRACK', payload: data }));
    socket.on('location:updated', (data) => dispatch({ type: 'UPDATE_FRIEND_LOCATION', payload: data }));

    socket.on('queue:track-added', ({ track, from }) => {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: ++notifId,
          type: 'queue',
          message: `${from.displayName} added "${track.name}" to your queue!`,
          track,
          from,
        },
      });
    });

    socket.on('listen-together:invited', (data) => {
      dispatch({ type: 'SET_LISTEN_TOGETHER_INVITE', payload: data });
    });

    socket.on('listen-together:accepted', ({ user }) => {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: ++notifId,
          type: 'listen-together',
          message: `${user.displayName} joined your listening session!`,
          user,
        },
      });
    });

    socket.on('chat:received', ({ from, message, timestamp }) => {
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        payload: { userId: from.id, message: { text: message, from: from.id, timestamp } },
      });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: ++notifId,
          type: 'chat',
          message: `${from.displayName}: ${message}`,
          from,
        },
      });
    });

    return () => socket.disconnect();
  }, [state.user?.id]);

  const addNotification = (msg, type = 'info') => {
    const id = ++notifId;
    dispatch({ type: 'ADD_NOTIFICATION', payload: { id, type, message: msg } });
    setTimeout(() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }), 4000);
  };

  const emitTrackUpdate = (track, isListening) => {
    socketRef.current?.emit('track:update', { track, isListening });
  };

  const addToFriendQueue = (targetUserId, track) => {
    socketRef.current?.emit('queue:add', { targetUserId, track });
  };

  const inviteListenTogether = (targetUserId, trackUri, trackInfo) => {
    socketRef.current?.emit('listen-together:invite', { targetUserId, trackUri, trackInfo });
  };

  const acceptListenTogether = (hostUserId) => {
    socketRef.current?.emit('listen-together:accept', { hostUserId });
    dispatch({ type: 'SET_LISTEN_TOGETHER_INVITE', payload: null });
  };

  const sendChatMessage = (targetUserId, message) => {
    socketRef.current?.emit('chat:message', { targetUserId, message });
    dispatch({
      type: 'ADD_CHAT_MESSAGE',
      payload: { userId: targetUserId, message: { text: message, from: state.user.id, timestamp: Date.now() } },
    });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        addNotification,
        emitTrackUpdate,
        addToFriendQueue,
        inviteListenTogether,
        acceptListenTogether,
        sendChatMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
