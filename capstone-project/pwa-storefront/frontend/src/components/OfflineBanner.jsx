import React from 'react';
import { useOnlineStatus } from '../useOnlineStatus'; // Hamara naya hook

const bannerStyle = {
  backgroundColor: '#ff4136', // Red color
  color: 'white',
  padding: '10px',
  textAlign: 'center',
  fontWeight: 'bold',
  position: 'fixed', // Screen par fix rahega
  top: 0,
  left: 0,
  width: '100%',
  zIndex: 1000, // Sabse upar dikhega
};

function OfflineBanner() {
  const isOnline = useOnlineStatus();

  // Agar online hain, toh kuch mat dikhao
  if (isOnline) {
    return null;
  }

  // Agar offline hain, toh banner dikhao
  return (
    <div style={bannerStyle}>
      Offline: You are offline. Changes will be synced when you are back online.
    </div>
  );
}

export default OfflineBanner;