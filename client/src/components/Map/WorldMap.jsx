import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../../context/AppContext.jsx';
import FriendMapPopup from './FriendMapPopup.jsx';
import { createRoot } from 'react-dom/client';

function createUserIcon(user) {
  const container = document.createElement('div');
  container.className = 'user-marker-container';

  const pulse = document.createElement('div');
  pulse.className = 'user-marker-pulse';

  const avatar = document.createElement('div');
  avatar.className = 'user-marker-avatar';

  if (user.image) {
    const img = document.createElement('img');
    img.src = user.image;
    img.alt = user.displayName;
    avatar.appendChild(img);
  } else {
    const fallback = document.createElement('div');
    fallback.className = 'user-marker-avatar-fallback';
    fallback.textContent = user.displayName?.[0]?.toUpperCase() || '?';
    avatar.appendChild(fallback);
  }

  container.appendChild(pulse);
  container.appendChild(avatar);

  return L.divIcon({
    html: container,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -22],
  });
}

function FriendMarkers({ selectedFriend, onSelectFriend, onQueueForFriend }) {
  const { state } = useApp();
  const markersRef = useRef({});
  const map = useMap();

  useEffect(() => {
    const friends = state.onlineFriends.filter((f) => f.location);

    const existingIds = new Set(Object.keys(markersRef.current));
    const currentIds = new Set(friends.map((f) => f.id));

    existingIds.forEach((id) => {
      if (!currentIds.has(id)) {
        markersRef.current[id]?.remove();
        delete markersRef.current[id];
      }
    });

    friends.forEach((friend) => {
      if (markersRef.current[friend.id]) {
        markersRef.current[friend.id].setLatLng([friend.location.lat, friend.location.lng]);
        markersRef.current[friend.id].setIcon(createUserIcon(friend));
      } else {
        const marker = L.marker([friend.location.lat, friend.location.lng], {
          icon: createUserIcon(friend),
        });

        const popupEl = document.createElement('div');
        const root = createRoot(popupEl);

        const popup = L.popup({ maxWidth: 280, minWidth: 220 });

        const renderPopup = (f) => {
          root.render(
            <FriendMapPopup
              friend={f}
              onQueueForFriend={onQueueForFriend}
              onListenTogether={() => {}}
            />
          );
        };

        renderPopup(friend);
        popup.setContent(popupEl);
        marker.bindPopup(popup);

        marker.on('click', () => {
          onSelectFriend(friend);
          const updated = state.onlineFriends.find((f) => f.id === friend.id) || friend;
          renderPopup(updated);
        });

        marker.addTo(map);
        markersRef.current[friend.id] = marker;
      }
    });
  }, [state.onlineFriends, map]);

  useEffect(() => {
    if (selectedFriend?.location && markersRef.current[selectedFriend.id]) {
      markersRef.current[selectedFriend.id].openPopup();
      map.flyTo([selectedFriend.location.lat, selectedFriend.location.lng], 5, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [selectedFriend?.id]);

  return null;
}

function SelfMarker() {
  const { state } = useApp();
  const markerRef = useRef(null);
  const map = useMap();

  useEffect(() => {
    if (!state.user) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      const loc = [pos.coords.latitude, pos.coords.longitude];

      if (markerRef.current) {
        markerRef.current.setLatLng(loc);
      } else {
        const selfUser = { ...state.user, id: 'self' };
        const icon = L.divIcon({
          html: (() => {
            const c = document.createElement('div');
            c.className = 'user-marker-container';
            const p = document.createElement('div');
            p.className = 'user-marker-pulse';
            p.style.background = 'rgba(155,89,247,0.3)';
            const a = document.createElement('div');
            a.className = 'user-marker-avatar';
            a.style.borderColor = 'var(--purple)';
            a.style.boxShadow = '0 0 0 3px rgba(155,89,247,0.2)';
            if (selfUser.image) {
              const img = document.createElement('img');
              img.src = selfUser.image;
              a.appendChild(img);
            } else {
              const f = document.createElement('div');
              f.className = 'user-marker-avatar-fallback';
              f.style.color = 'var(--purple)';
              f.textContent = selfUser.displayName?.[0]?.toUpperCase() || 'Y';
              a.appendChild(f);
            }
            c.appendChild(p);
            c.appendChild(a);
            return c;
          })(),
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker(loc, { icon }).addTo(map);
        marker.bindTooltip('You', { permanent: false, direction: 'top' });
        markerRef.current = marker;
        map.setView(loc, 4);
      }
    });
  }, [state.user?.id]);

  return null;
}

export default function WorldMap({ selectedFriend, onSelectFriend, onQueueForFriend }) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={2}
      maxZoom={12}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
      attributionControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <SelfMarker />
      <FriendMarkers
        selectedFriend={selectedFriend}
        onSelectFriend={onSelectFriend}
        onQueueForFriend={onQueueForFriend}
      />
    </MapContainer>
  );
}
