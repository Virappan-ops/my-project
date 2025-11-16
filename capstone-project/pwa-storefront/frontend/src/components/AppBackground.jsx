// src/components/AppBackground.js
import React from 'react';
import { GlobalStyles } from '@mui/material';

// --- Theme-aware colors ---
const lightColors = {
  bg: '#f0f2f5', // Light grey BG
  color1: 'hsla(210, 60%, 70%, 0.3)', // Light blue
  color2: 'hsla(340, 60%, 70%, 0.3)', // Light pink
  color3: 'hsla(190, 60%, 70%, 0.3)', // Light cyan
};

const darkColors = {
  bg: '#121212', // Dark BG
  color1: 'hsla(210, 60%, 40%, 0.4)', // Deeper blue
  color2: 'hsla(340, 60%, 40%, 0.4)', // Deeper pink
  color3: 'hsla(190, 60%, 40%, 0.4)', // Deeper cyan
};

const AppBackground = () => (
  <GlobalStyles
    styles={(theme) => {
      // Yahan check hota hai ki 'light' hai ya 'dark'
      const colors = theme.palette.mode === 'light' ? lightColors : darkColors;
      
      return {
        'body, #root': {
          backgroundColor: colors.bg,
          // Yeh 3 gradients milkar "mesh" effect banate hain
          backgroundImage: `
            radial-gradient(at 0% 0%, ${colors.color1} 0px, transparent 50%),
            radial-gradient(at 100% 100%, ${colors.color2} 0px, transparent 50%),
            radial-gradient(at 0% 100%, ${colors.color3} 0px, transparent 50%)
          `,
          minHeight: '100vh',
          width: '100%',
          transition: 'background-color 0.3s ease, background-image 0.3s ease',
        }
      };
    }}
  />
);

export default AppBackground;