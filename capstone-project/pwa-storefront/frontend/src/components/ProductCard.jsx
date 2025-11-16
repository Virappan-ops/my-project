// src/components/ProductCard.jsx
import React, { useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { addOrUpdateCartItem } from '../utils/db';
import { useOnlineStatus } from '../useOnlineStatus';
import { Box, Typography } from '@mui/material';

// --- STYLING ---

const cardStyle = {
  display: 'flex',
  flexDirection: 'column',
  // --- YAHAN BADLAAV KIYA GAYA HAI ---
  width: '360px', // Pehle 300px tha, ab bada kar diya
  // --- BADLAAV KHATAM ---
  margin: '16px',
  borderRadius: '16px', 
  
  // Glassy Effect (Pehle jaisa)
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
  
  overflow: 'hidden',
  textAlign: 'left',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)', 
    boxShadow: (theme) => 
      theme.palette.mode === 'light' 
        ? '0 8px 40px rgba(0, 0, 0, 0.15)' 
        : '0 8px 40px rgba(0, 0, 0, 0.6)', 
    '& .product-image': {
      transform: 'scale(1.1)',
    }
  },
};

// ... (Baaki styles waise hi hain) ...
const imageContainerStyle = {
  width: '100%',
  height: '220px',
  overflow: 'hidden', 
};

const imgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.4s ease-in-out', 
};

const contentStyle = {
  padding: '24px', 
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
};


// --- COMPONENT (Conditional Video/Image ke saath) ---

function ProductCard({ product }) {
  const { token, user, setUser } = useContext(AuthContext);
  const isOnline = useOnlineStatus();

  const handleAddToCart = async () => {
    // ... (Aapka logic, ismein koi badlaav nahi) ...
    const itemToAdd = {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl 
    };

    if (token && isOnline) {
      try {
        const res = await axios.post('/api/cart/add', itemToAdd);
        setUser({ ...user, cart: res.data });
        await addOrUpdateCartItem(itemToAdd);
        alert(`"${product.name}" Added to Cart (Synced)`);
      } catch (err) {
        console.error("Server cart update failed:", err);
        await addOrUpdateCartItem(itemToAdd);
        alert(`"${product.name}" Added to Cart (Offline)`);
      }
    } else {
      try {
        await addOrUpdateCartItem(itemToAdd);
        alert(`"${product.name}" Added to Cart (Offline/Guest)`);
      } catch (err) {
        console.error("Error in adding to Local cart:", err);
      }
    }
  };

  return (
    <Box sx={cardStyle}>
      <Box sx={imageContainerStyle}>
        
        {product.videoUrl ? (
          <video 
            src={product.videoUrl} 
            style={imgStyle}
            className="product-image" 
            autoPlay
            loop 
            muted 
            playsInline
          />
        ) : (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            style={imgStyle}
            className="product-image"
          />
        )}
        
      </Box>
      
      <Box sx={contentStyle}>
        {/* ... (Baaki saara content waise ka waisa) ... */}
        <Typography 
          variant="h6" 
          component="h3" 
          sx={{ fontWeight: 600, color: 'text.primary', letterSpacing: '0.5px' }}
        >
          {product.name}
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ color: 'text.secondary', minHeight: '40px', margin: '8px 0' }}
        >
          {product.description}
        </Typography>
        
        <Typography 
          variant="h5" 
          component="h4" 
          sx={{ fontWeight: 700, my: 1.5, color: 'text.primary' }}
        >
          ${product.price.toFixed(2)}
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ color: 'text.secondary', marginBottom: '24px' }}
        >
          In Stock: {product.stock}
        </Typography>
        
        <Box
          component="button"
          onClick={handleAddToCart}
          sx={{
            bgcolor: (theme) => (theme.palette.mode === 'light' ? '#111' : '#fff'),
            color: (theme) => (theme.palette.mode === 'light' ? '#fff' : '#000'),
            border: 'none',
            padding: '14px 16px', 
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: 'auto', 
            width: '100%',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            letterSpacing: '1px',
            textTransform: 'uppercase', 
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: (theme) => (theme.palette.mode === 'light' ? '#333' : '#eee'),
              transform: 'scale(1.02)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            },
          }}
        >
          Add to Cart
        </Box>
      </Box>
    </Box>
  );
}

export default ProductCard;