import { useState, useEffect } from 'react';

// This hook correctly detects the browser's online/offline status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    // Add browser event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // Runs once
  return isOnline;
}