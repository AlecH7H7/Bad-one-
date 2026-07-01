import React, { useState } from 'react';
import WorldMap from '../components/Map/WorldMap.jsx';
import FriendPanel from '../components/Friends/FriendPanel.jsx';
import PlayerBar from '../components/Player/PlayerBar.jsx';
import Header from '../components/UI/Header.jsx';
import FriendSheet from '../components/Friends/FriendSheet.jsx';

export default function Dashboard() {
  const [sheetFriend, setSheetFriend] = useState(null);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--bg-primary)',
      overflow: 'hidden',
    }}>
      <Header />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <FriendPanel onSelectFriend={setSheetFriend} />

        <div style={{ flex: 1, position: 'relative' }}>
          <WorldMap onSelectFriend={setSheetFriend} />
        </div>
      </div>

      <PlayerBar />

      {sheetFriend && (
        <FriendSheet
          friend={sheetFriend}
          onClose={() => setSheetFriend(null)}
        />
      )}
    </div>
  );
}
