import React from 'react';
import { useOnlineStatus } from '../useOnlineStatus'; // Your custom hook
import { Snackbar, Alert, Slide } from '@mui/material'; // Import MUI components
import WifiOffIcon from '@mui/icons-material/WifiOff'; // A fitting icon

// This function controls the slide-in/out animation
function SlideTransition(props) {
  // This will make the component slide UP from the bottom
  return <Slide {...props} direction="up" />;
}

function OfflineBanner() {
  const isOnline = useOnlineStatus();

  // We don't need a click handler to close it,
  // it will only close when 'isOnline' becomes true.
  
  return (
    <Snackbar
      // The 'open' prop controls visibility. Show when NOT online.
      open={!isOnline} 
      
      // Position it at the bottom-center
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      
      // Use our custom SlideTransition for the animation
      TransitionComponent={SlideTransition}
      
      // Add some margin to lift it off the edge
      sx={{ marginBottom: '16px' }}
    >
      {/* We use an Alert component inside the Snackbar
        for correct styling (icon, red color, etc.)
      */}
      <Alert
        // 'filled' gives it a solid background
        variant="filled" 
        
        // 'error' severity makes it red
        severity="error" 
        
        // Use the Wi-Fi Off icon
        icon={<WifiOffIcon fontSize="inherit" />}
        
        // Add shadow and rounded corners to make it "pop"
        sx={{ 
          borderRadius: '8px', 
          boxShadow: 6, // Gives it a nice shadow
          width: '100%'   // Make it responsive inside the Snackbar
        }}
      >
        You are currently offline. Changes will be synced when you are back online.
      </Alert>
    </Snackbar>
  );
}

export default OfflineBanner;