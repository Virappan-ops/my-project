import React, { useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { addOrUpdateCartItem } from '../utils/db';
import { useOnlineStatus } from '../useOnlineStatus';
import { Box, Typography } from '@mui/material'; // Styling ke liye MUI components ka istemal karenge

// --- NAYI STYLING ---

// 1. Glassy Card Style
const cardStyle = {
  display: 'flex', // Flexbox layout
  flexDirection: 'column', // Items ko vertically stack karega
  width: '280px', // Card ki width fix kar di
  margin: '16px',
  borderRadius: '16px',
  
  // Glassmorphism effect
  background: 'rgba(255, 255, 255, 0.25)', // Halka white background
  backdropFilter: 'blur(10px)', // Piche ke content ko blur karega
  border: '1px solid rgba(255, 255, 255, 0.18)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)', // Halka shadow
  
  overflow: 'hidden', // Image ko corner radius dega
  textAlign: 'left',
};

// 2. Image Style
const imgStyle = {
  width: '100%',
  height: '200px', // Sabhi images ki height fix kar di
  objectFit: 'cover', // Image stretch nahi hogi, crop ho jayegi
};

// 3. Content Area Style (Text ke liye)
const contentStyle = {
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1, // Ye content ko poori bachi hui jagah dega
};

// 4. Animated Button Style
const buttonStyle = {
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  padding: '12px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
  marginTop: 'auto', // --- YE HAI ALIGNMENT KA FIX ---
                     // Ye button ko hamesha card ke bottom mein push kar dega
  width: '100%',
  fontSize: '1rem',
  fontWeight: 'bold',
  transition: 'all 0.3s ease', // Animation
  
  // Hover effect (jab mouse upar laayein)
  ':hover': {
    backgroundColor: '#0056b3',
    transform: 'scale(1.02)', // Halka sa bada hoga
  },
};

// --- COMPONENT ---

function ProductCard({ product }) {
  const { token, user, setUser } = useContext(AuthContext);
  const isOnline = useOnlineStatus();

  const handleAddToCart = async () => {
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
    // Hum styling ke liye normal 'div' ki jagah MUI ka 'Box' component use kar rahe hain
    <Box sx={cardStyle}>
      <img src={product.imageUrl} alt={product.name} style={imgStyle} />
      
      <Box sx={contentStyle}>
        <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold' }}>
          {product.name}
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#333', 
            minHeight: '40px', // --- ALIGNMENT FIX ---
                               // Description ke liye min height, taaki 1 line wale bhi jagah lein
            margin: '8px 0' 
          }}
        >
          {product.description}
        </Typography>
        
        <Typography variant="h6" component="h4" sx={{ fontWeight: 'bold', margin: '8px 0' }}>
          ${product.price}
        </Typography>
        
        <Typography variant="body2" sx={{ color: '#555', marginBottom: '16px' }}>
          In Stock: {product.stock}
        </Typography>
        
        {/* Button ko humne 'Box' se wrap kiya taaki ':hover' kaam kare */}
        <Box
          component="button"
          sx={buttonStyle}
          onClick={handleAddToCart}
          // Hover effect ko support karne ke liye
          onMouseOver={e => e.currentTarget.style.backgroundColor = buttonStyle[':hover'].backgroundColor}
          onMouseOut={e => e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor}
        >
          Add to Cart
        </Box>
      </Box>
    </Box>
  );
}

export default ProductCard;