import React from 'react';
import { Snackbar, Alert, Slide, Box, CircularProgress } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';

// Animation for the banner
function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

function SyncBanner({ syncing }) {
  return (
    <Snackbar
      // The 'open' prop controls visibility. Show when 'syncing' is true.
      open={syncing} 
      
      // Position it at the top-center
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      
      // Use our custom SlideTransition for the animation
      TransitionComponent={SlideTransition}
      
      // Add some margin
      sx={{ marginTop: '16px' }}
    >
      <Alert
        variant="filled" 
        severity="info" 
        // Add a spinning icon to show activity
        icon={<CircularProgress size={20} color="inherit" />}
        sx={{ 
          borderRadius: '8px', 
          boxShadow: 6,
          width: '100%' 
        }}
      >
        Syncing offline orders... Please wait.
      </Alert>
    </Snackbar>
  );
}

export default SyncBanner;