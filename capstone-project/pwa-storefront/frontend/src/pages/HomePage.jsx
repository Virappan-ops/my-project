import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
// MUI components ko import karein
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';

/* Styling ke liye */
const gridStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center', // Cards ko center mein rakhega
  gap: '16px', // Cards ke beech ka gap
  padding: '20px 0', // Grid ke upar/niche spacing
  
  // Simple fade-in animation
  opacity: 1,
  transition: 'opacity 0.5s ease-in',
};

// Loading aur Error ko center mein dikhane ke liye style
const centerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '50vh', // Screen ke beech mein
};

function HomePage() {
  // State variables (ye waise hi rahenge)
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect (ye waisa hi rahega, data fetch karne ke liye)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/products');
        setProducts(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Products are unable to load. It seems the backend server is down.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // --- Render logic (Updated) ---

  if (loading) {
    return (
      // "Loading..." text ki jagah spinner
      <Box sx={centerStyle}>
        <CircularProgress /> 
      </Box>
    );
  }

  if (error) {
    return (
      // Error text ki jagah proper Alert box
      <Box sx={centerStyle}>
        <Alert severity="error" sx={{ width: '80%' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    // Container component page ko center mein rakhta hai aur padding deta hai
    <Container maxWidth="lg"> 
      <Box sx={{ my: 4 }}> {/* my: 4 matlab margin top/bottom */}
        
        <Typography 
          variant="h3" // Bada heading
          component="h1" 
          gutterBottom // Niche thoda margin
          sx={{ fontWeight: 'bold', color: '#111' }}
        >
          Our Products
        </Typography>
        
        <Typography variant="h6" component="p" color="text.secondary" sx={{ mb: 3 }}>
          Explore our latest collection of premium products.
        </Typography>
        
        <Box 
          sx={{
            ...gridStyle,
            opacity: loading ? 0 : 1, // Loading complete hone par fade-in
          }}
        >
          {products.length > 0 ? (
            products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <Typography variant="h6" color="text.secondary">
              No product available at the moment. Please check back later.
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default HomePage;