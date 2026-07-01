import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../../context/AppContext.jsx';

function createUserIcon(user, isSelf = false) {
  const color = isSelf ? 'var(--purple)' : 'var(--green)';
  const pulseColor = isSelf ? 'rgba(155,89,247,0.35)' : 'rgba(29,185,84,0.35)';
  const borderColor = isSelf ? '#9b59f7' : '#1DB954';

  const container = document.createElement('div');
  container.style.cssText = 'position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;';

  const pulse = document.createElement('div');
  pulse.style.cssText = `position:absolute;inset:-6px;border-radius:50%;background:${pulseColor};animation:map-pulse 2s ease-out infinite;`;
  container.appendChild(pulse);

  const ring = document.createElement('div');
  ring.style.cssText = `position:absolute;inset:-3px;border-radius:50%;border:2px solid ${borderColor};opacity:0.4;`;
  container.appendChild(ring);

  const avatar = document.createElement('div');
  avatar.style.cssText = `width:44px;height:44px;border-radius:50%;border:2.5px solid ${borderColor};overflow:hidden;position:relative;z-index:1;background:#1e1e2a;box-shadow:0 2px 12px rgba(0,0,0,0.5);`;

  if (user.image) {
    const img = document.createElement('img');
    img.src = user.image;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
    avatar.appendChild(img);
  } else {
    const fallback = document.createElement('div');
    fallback.style.cssText = `width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:${borderColor};background:#252535;`;
    fallback.textContent = user.displayName?.[0]?.toUpperCase() || '?';
    avatar.appendChild(fallback);
  }
  container.appendChild(avatar);

  if (!isSelf && user.isListening) {
    const eq = document.createElement('div');
    eq.style.cssText = 'position:absolute;bottom:-2px;right:-2px;width:16px;height:16px;border-radius:50%;background:#1DB954;border:2px solid #0a0a0f;display:flex;align-items:center;justify-content:center;gap:1.5px;padding:2px;';
    for (let i = 0; i < 3; i++) {
      const bar = document.createElement('div');
      bar.style.cssText = `width:2px;border-radius:1px;background:#000;animation:eq-m ${0.5 + i * 0.15}s ease-in-out infinite alternate;animation-delay:${i * 0.1}s;`;
      eq.appendChild(bar);
    }
    container.appendChild(eq);
  }

  const style = document.createElement('style');
  style.textContent = `
    @keyframes map-pulse { 0%{transform:scale(0.85);opacity:0.8} 100%{transform:scale(2);opacity:0} }
    @keyframes eq-m { from{height:2px} to{height:8px} }
  `;
  document.head.appendChild(style);

  return L.divIcon({
    html: container,
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

function FriendMarkers({ onSelectFriend }) {
  const { state } = useApp();
  const markersRef = useRef({});
  const map = useMap();

  useEffect(() => {
    const friends = state.onlineFriends.filter((f) => f.location);
    const currentIds = new Set(friends.map((f) => f.id));

    Object.keys(markersRef.current).forEach((id) => {
      if (!currentIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    friends.forEach((friend) => {
      const latlng = [friend.location.lat, friend.location.lng];

      if (markersRef.current[friend.id]) {
        markersRef.current[friend.id].setLatLng(latlng);
        markersRef.current[friend.id].setIcon(createUserIcon(friend));
      } else {
        const marker = L.marker(latlng, {
          icon: createUserIcon(friend),
          title: friend.displayName,
        }).addTo(map);

        marker.on('click', () => onSelectFriend(friend));
        markersRef.current[friend.id] = marker;
      }
    });
  }, [state.onlineFriends]);

  return null;
}

function SelfMarker() {
  const { state } = useApp();
  const markerRef = useRef(null);
  const map = useMap();

  useEffect(() => {
    if (!state.user) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const latlng = [pos.coords.latitude, pos.coords.longitude];
      if (markerRef.current) {
        markerRef.current.setLatLng(latlng);
      } else {
        const marker = L.marker(latlng, {
          icon: createUserIcon(state.user, true),
          zIndexOffset: 1000,
        }).addTo(map);
        marker.bindTooltip('You', { permanent: false, direction: 'top', offset: [0, -28] });
        markerRef.current = marker;
        map.setView(latlng, 4, { animate: true });
      }
    });
  }, [state.user?.id]);

  return null;
}

export default function WorldMap({ onSelectFriend }) {
  return (
    <MapContainer
      center={[25, 15]}
      zoom={2}
      minZoom={2}
      maxZoom={14}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <SelfMarker />
      <FriendMarkers onSelectFriend={onSelectFriend} />
    </MapContainer>
  );
}
