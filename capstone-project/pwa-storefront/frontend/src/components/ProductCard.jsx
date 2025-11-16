import React, { useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { addOrUpdateCartItem } from '../utils/db';
import { useOnlineStatus } from '../useOnlineStatus';
import { Box, Typography } from '@mui/material';

// --- STYLING (Sab naya hai) ---

const cardStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '300px', // Thoda chauda
  margin: '16px',
  borderRadius: '12px', // Thoda kam round
  
  // Solid, theme-aware background
  bgcolor: 'background.paper', 
  
  // Subtle, theme-aware shadow
  boxShadow: (theme) => theme.shadows[3],
  
  overflow: 'hidden', // Image zoom ko contain karne ke liye
  textAlign: 'left',
  
  // Premium Hover Effects
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)', // Halki lift
    boxShadow: (theme) => theme.shadows[6], // Shadow badhegi
    // Image ko zoom karein (neeche dekhein)
    '& .product-image': {
      transform: 'scale(1.1)',
    }
  },
};

const imageContainerStyle = {
  width: '100%',
  height: '220px',
  overflow: 'hidden', // Image ko crop karega
};

const imgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.4s ease-in-out', // Zoom animation
};

const contentStyle = {
  padding: '24px', // Zyaada spacing
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
};

// --- COMPONENT ---

function ProductCard({ product }) {
  const { token, user, setUser } = useContext(AuthContext);
  const isOnline = useOnlineStatus();

  const handleAddToCart = async () => {
    // ... (logic mein koi change nahi)
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
      {/* Image Container (Zoom ke liye) */}
      <Box sx={imageContainerStyle}>
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          style={imgStyle}
          className="product-image" // Hover target ke liye
        />
      </Box>
      
      <Box sx={contentStyle}>
        <Typography 
          variant="h6" // Title thoda chhota
          component="h3" 
          sx={{ 
            fontWeight: 600, 
            color: 'text.primary',
            letterSpacing: '0.5px' // "Luxury" touch
          }}
        >
          {product.name}
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            minHeight: '40px',
            margin: '8px 0' 
          }}
        >
          {product.description}
        </Typography>
        
        <Typography 
          variant="h5" // Price ko prominent banaya
          component="h4" 
          sx={{ 
            fontWeight: 700, 
            my: 1.5, // Vertical spacing
            color: 'text.primary'
          }}
        >
          ${product.price.toFixed(2)}
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            marginBottom: '24px' // Button se pehle zyaada space
          }}
        >
          In Stock: {product.stock}
        </Typography>
        
        {/* --- NAYA PREMIUM BUTTON --- */}
        <Box
          component="button"
          onClick={handleAddToCart}
          sx={{
            // High-contrast, theme-aware colors
            bgcolor: (theme) => (theme.palette.mode === 'light' ? '#111' : '#fff'),
            color: (theme) => (theme.palette.mode === 'light' ? '#fff' : '#000'),
            
            border: 'none',
            padding: '14px 16px', // Thoda tall button
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: 'auto', 
            width: '100%',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            letterSpacing: '1px', // "Luxury" touch
            textTransform: 'uppercase', // "Luxury" touch
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