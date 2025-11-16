// src/pages/HomePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  Grid,
  Fade // <-- Naya import animation ke liye
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const HomePage = () => {
  // --- States (Inmein koi badlaav nahi) ---
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // --- Data Fetching (Ismein koi badlaav nahi) ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/products'); 
        setAllProducts(res.data);
        const uniqueCategories = [...new Set(res.data.map(p => p.category))];
        setCategories(['all', ...uniqueCategories]);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("⚠️ Products load nahi ho paaye. Baad mein try karein.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- Filtering Logic (Ismein koi badlaav nahi) ---
  const filteredProducts = useMemo(() => {
    let products = allProducts;
    if (selectedCategory !== 'all') {
      products = products.filter(p => p.category === selectedCategory);
    }
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(lowerSearchTerm) ||
        p.description.toLowerCase().includes(lowerSearchTerm)
      );
    }
    return products;
  }, [allProducts, searchTerm, selectedCategory]);

  // --- Event Handlers (Inmein koi badlaav nahi) ---
  const handleCategoryChange = (event, newCategory) => {
    if (newCategory !== null) { 
      setSelectedCategory(newCategory);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // --- Loading/Error states (Inmein koi badlaav nahi) ---
  if (loading) {
    // ... (loading logic) ...
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    // ... (error logic) ...
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      </Container>
    );
  }

  // --- NAYA PREMIUM LAYOUT RENDER ---
  return (
    <Box> 
      
      {/* ===== 1. NAYA GLASSY HERO SECTION ===== */}
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '40vh', 
          width: '95%', // Poori width se thoda kam
          margin: '2.5% auto', // Center mein
          p: 3,
          textAlign: 'center',
          mb: 5,
          
          // --- YAHAN BADLAAV KIYA GAYA HAI ---
          // Pehle 'grey.100' tha, ab poora glassy effect
          bgcolor: 'transparent', 
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)', 
          border: (theme) => 
            theme.palette.mode === 'light' 
              ? '1px solid rgba(255, 255, 255, 0.4)'
              : '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: (theme) => 
            theme.palette.mode === 'light' 
              ? '0 4px 30px rgba(0, 0, 0, 0.1)'
              : '0 4px 30px rgba(0, 0, 0, 0.4)',
          borderRadius: '24px', // "Curve border"
          // --- BADLAAV KHATAM ---
        }}
      >
        <Typography 
          variant="h2" 
          gutterBottom 
          sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '1px' }}
        >
          Find Your Style
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ mb: 4, maxWidth: '600px' }}
        >
          Browse our exclusive collection of products, curated just for you.
        </Typography>
        
        <TextField
          variant="outlined"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: { 
              borderRadius: '25px', 
              maxWidth: '500px',
              bgcolor: 'background.paper',
              boxShadow: 1
            }
          }}
          sx={{ width: '100%', maxWidth: '500px' }}
        />
      </Box>

      {/* Container ab Hero ke neeche shuru hoga */}
      <Container maxWidth="xl" sx={{ py: 2 }}>
        
        {/* ===== 2. CATEGORY FILTER BAR (Pehle jaisa) ===== */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            width: '100%', 
            mb: 5,
            overflowX: 'auto',
            pb: 1
          }}
        >
          <ToggleButtonGroup
            value={selectedCategory}
            exclusive
            onChange={handleCategoryChange}
            aria-label="product categories"
          >
            {categories.map((category) => (
              <ToggleButton 
                key={category} 
                value={category} 
                sx={{ 
                  textTransform: 'capitalize', 
                  fontWeight: 600, 
                  px: 3,
                  borderRadius: '20px !important',
                  border: 'none',
                  mx: 0.5
                }}
              >
                {category}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* ===== 3. NAYA PRODUCTS GRID (ANIMATED) ===== */}
        
        {filteredProducts.length > 0 ? (
          // --- YAHAN BADLAAV KIYA GAYA HAI ---
          <Grid 
            container 
            spacing={2} 
            justifyContent="center" // Grid ko center mein rakhega
            // Yeh key badalne se category change par animation restart hoga
            key={selectedCategory} 
          >
            {filteredProducts.map((product, index) => (
              // 3 items: lg={4} (12/4=3)
              // Tablet par 2 items: md={6} (12/6=2)
              // Mobile par 1 item: xs={12}
              <Grid item key={product._id} xs={12} sm={6} md={6} lg={4}>
                {/* Fade animation har item par */}
                <Fade in={true} timeout={500 + index * 100}> 
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    {/* Card ka size ab 360px hai */}
                    <ProductCard product={product} />
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
          // --- BADLAAV KHATAM ---
        ) : (
          // Jab koi product match na ho
          <Alert severity="info" sx={{ mt: 4, width: '100%' }}>
            😕 No products found matching your criteria.
          </Alert>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;