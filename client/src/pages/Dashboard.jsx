import React, { useState } from 'react';
import WorldMap from '../components/Map/WorldMap.jsx';
import FriendPanel from '../components/Friends/FriendPanel.jsx';
import PlayerBar from '../components/Player/PlayerBar.jsx';
import SearchModal from '../components/Search/SearchModal.jsx';
import Header from '../components/UI/Header.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function Dashboard() {
  const { state } = useApp();
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTarget, setSearchTarget] = useState(null);

  const openQueueSearch = (friend) => {
    setSearchTarget({ friend, mode: 'queue' });
    setSearchOpen(true);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--bg-primary)',
      overflow: 'hidden',
    }}>
      <Header onSearchClick={() => { setSearchTarget(null); setSearchOpen(true); }} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <FriendPanel
          selectedFriend={selectedFriend}
          onSelectFriend={setSelectedFriend}
          onQueueForFriend={openQueueSearch}
        />

        <div style={{ flex: 1, position: 'relative' }}>
          <WorldMap
            selectedFriend={selectedFriend}
            onSelectFriend={setSelectedFriend}
            onQueueForFriend={openQueueSearch}
          />
        </div>
      </div>

      <PlayerBar />

      {searchOpen && (
        <SearchModal
          target={searchTarget}
          onClose={() => { setSearchOpen(false); setSearchTarget(null); }}
        />
      )}
    </div>
  );
}
