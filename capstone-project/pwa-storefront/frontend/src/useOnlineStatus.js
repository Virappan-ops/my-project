import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  // 'navigator.onLine' se current status lein
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Event listener add karein jab status badle
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    // Event listeners ko window par lagayein
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup: Jab component hate toh listeners ko bhi hatayein
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // [] - Ye sirf ek baar component mount hone par chalega

  return isOnline;
}