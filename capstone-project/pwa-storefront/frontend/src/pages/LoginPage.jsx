import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// Import new MUI components for a better look
import { 
  Container, TextField, Button, Typography, Box, 
  Paper, // For the glassy effect
  Avatar, // For the lock icon
  CircularProgress, // For loading
  Fade // For animation
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'; // Lock icon

// --- New Styling ---

// This style will center the form on the page
const centerContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh', // Take full screen height
};

// The glassy container style
const paperStyle = {
  padding: '32px', // More space inside
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: '16px', // Rounded corners
  
  // Glassmorphism effect
  background: 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
};

// Lock icon avatar style
const avatarStyle = {
  margin: '8px',
  backgroundColor: 'primary.main', // Blue color
};

// Animated button style
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

function LoginPage() {
  // Your original state variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext); 
  const navigate = useNavigate();
  
  // Added for the "animated button" effect
  const [loading, setLoading] = useState(false); 

  // Your original handleSubmit logic, with 'loading' state and the 'await login' fix
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Start loading animation
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      
      // We MUST 'await' the login function because it is asynchronous
      // (it runs the cart sync)
      await login(res.data); 
      
      navigate('/home'); // Now navigation will work
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Login failed. Please try again.');
    } finally {
      setLoading(false); // Stop loading animation
    }
  };

  return (
    // New themed container
    <Container component="main" maxWidth="xs" sx={centerContainerStyle}>
      <Fade in={true} timeout={1000}>
        <Paper elevation={6} sx={paperStyle}>
          
          <Avatar sx={avatarStyle}>
            <LockOutlinedIcon />
          </Avatar>
          
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          
          {/* Your original form, just with new styling */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            
            {/* Animated Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={buttonStyle}
              disabled={loading} // Disable button while loading
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
            </Button>
            
            <Link to="/signup" style={{ textDecoration: 'none', color: '#1976d2' }}>
              {"Don't have an account? Sign Up"}
            </Link>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
}

export default LoginPage;