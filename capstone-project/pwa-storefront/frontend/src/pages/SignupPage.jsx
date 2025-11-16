import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
// Import new MUI components
import { 
  Container, TextField, Button, Typography, Box,
  Paper, // For the glassy effect
  Avatar, // For the icon
  CircularProgress, // For loading
  Fade // For animation
} from '@mui/material';
// A different icon for "Sign Up"
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';

// --- New Styling ---

// This style will center the form on the page
const centerContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh', // Take full screen height
};

// The glassy container style (same as login)
const paperStyle = {
  padding: '32px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: '16px',
  
  // Glassmorphism effect
  background: 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
};

// Icon avatar style
const avatarStyle = {
  margin: '8px',
  backgroundColor: 'secondary.main', // Different color (e.g., purple)
};

// Animated button style (same as login)
const buttonStyle = {
  marginTop: '24px',
  marginBottom: '16px',
  padding: '12px',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.03)',
    backgroundColor: 'primary.dark'
  }
};

// --- Component ---

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Start loading
    try {
      await axios.post('/api/auth/register', { email, password });
      alert('Registration successful! Please login.');
      navigate('/login'); // Navigate to login page after successful registration
    } catch (err) {
      // Handle errors from the server
      setError(err.response?.data?.message || err.response?.data || 'Signup failed. Please try again.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={centerContainerStyle}>
      <Fade in={true} timeout={1000}>
        <Paper elevation={6} sx={paperStyle}>
          
          <Avatar sx={avatarStyle}>
            <PersonAddAltOutlinedIcon />
          </Avatar>
          
          <Typography component="h1" variant="h5">
            Sign Up
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={buttonStyle}
              disabled={loading} // Disable button while loading
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
            </Button>
            
            <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
              {"Already have an account? Sign in"}
            </Link>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
}

export default SignupPage;