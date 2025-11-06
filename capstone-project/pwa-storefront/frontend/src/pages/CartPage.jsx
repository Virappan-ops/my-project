import React, { useState, useEffect, useContext } from 'react';
import { getCartItems, removeCartItem, clearCart, addToSyncQueue } from '../utils/db';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // AuthContext
import { useOnlineStatus } from '../useOnlineStatus'; // Online Status

// --- Material-UI Imports ---
import { 
  Container, Typography, Box, CircularProgress, Alert, List, ListItem, 
  ListItemAvatar, Avatar, ListItemText, IconButton, Button, Paper, Fade, Grid 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';

// --- Styling ---
const centerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '50vh',
};

// Naya Glassy Item Style
const glassyItemStyle = {
  marginBottom: '16px',
  padding: '16px',
  borderRadius: '16px',
  background: 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)'
  }
};

// Summary Box Style
const summaryBoxStyle = {
  ...glassyItemStyle,
  padding: '24px',
  position: 'sticky', // Ye scroll karne par bhi wahi rahega
  top: '100px', // AppBar ke niche se
};

// Animated Checkout Button Style
const animatedCheckoutBtn = {
  padding: '12px 20px',
  fontSize: '1rem',
  fontWeight: 'bold',
  marginTop: '20px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.03)',
    backgroundColor: 'success.dark' // Darker green on hover
  }
};

// --- Component ---

function CartPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // --- YE LOGIC BHI ADD KAREIN ---
  // Ye server cart se remove/checkout ko handle karega
  const { token, user, setUser } = useContext(AuthContext);
  const isOnline = useOnlineStatus();
  // ------------------------------

  // --- LOGIC FUNCTIONS (Aapke Puraane Code Se) ---

  const loadCart = async () => {
    setLoading(true);
    try {
      const cartItems = await getCartItems();
      setItems(cartItems || []);
    } catch (err) {
      console.error("Error loading cart:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [location]);

  // --- REMOVE HANDLER (Updated) ---
  const handleRemove = async (productId) => {
    if (token && isOnline) {
      // Scenario 1: User Logged-in hai aur Online hai
      try {
        const res = await axios.delete(`/api/cart/remove/${productId}`);
        setUser({ ...user, cart: res.data }); // Auth context ko update karein
        await removeCartItem(productId); // Local DB se bhi remove karein
      } catch (err) {
        console.error("Error removing from server cart:", err);
      }
    } else {
      // Scenario 2: User Offline hai ya Guest hai
      await removeCartItem(productId);
    }
    
    alert('Item removed!');
    loadCart(); // UI ko refresh karein
  };

  // --- CHECKOUT LOGIC (Aapka Puraana Code) ---
  const handleCheckout = async () => {
    if (!items || items.length === 0) return;

    const total = (items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Order data mein 'imageUrl' ko bhi include karein
    const orderData = {
      items: items.map(item => ({ // <-- Yahan 'items' ko map karein
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl || '' // <-- Yahan imageUrl add karein (agar hai)
      })),
      totalAmount: total.toFixed(2),
    };
    if (navigator.onLine) {
      try {
        const response = await axios.post('/api/orders/checkout', orderData);
        alert(response.data.message);
        await clearCart();
        
        // Server cart bhi clear karein agar user logged in hai
        if (token) {
          await axios.post('/api/cart/update', { cart: [] });
          setUser({ ...user, cart: [] });
        }
        
        navigate('/home');
      } catch (err) {
        console.error("Online checkout failed:", err);
        await queueCheckout(orderData);
      }
    } else {
      await queueCheckout(orderData);
    }
  };

  const queueCheckout = async (orderData) => {
    const action = { type: 'checkout', payload: orderData, timestamp: Date.now() };
    await addToSyncQueue(action);
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const swRegistration = await navigator.serviceWorker.ready;
      await swRegistration.sync.register('sync-new-order');
    }
    alert("You are currently offline. Your order will be placed as soon as you are back online!");
    await clearCart();
    navigate('/home');
  };
  // --- (Yahan tak saara logic same hai) ---


  // --- NAYA RENDER LOGIC ---

  if (loading) {
    return (
      <Box sx={centerStyle}>
        <CircularProgress />
      </Box>
    );
  }

  const total = (items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}> {/* my: 4 matlab margin top/bottom */}
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Your Cart
        </Typography>

        {(!items || items.length === 0) ? (
          <Alert severity="info" icon={<ShoppingCartCheckoutIcon />} sx={{ ...glassyItemStyle, justifyContent: 'center' }}>
            Your cart is empty. Start adding some products!
          </Alert>
        ) : (
          // Cart ko 2 columns mein baant denge
          <Grid container spacing={4}>
            
            {/* Column 1: Cart Items List */}
            <Grid item xs={12} md={7}>
              <List>
                {items.map(item => (
                  <Fade in={true} timeout={500} key={item.productId}>
                    <ListItem component={Paper} sx={glassyItemStyle}>
                      <ListItemAvatar>
                        <Avatar 
                          variant="rounded" 
                          src={item.imageUrl} // <-- Image yahan istemal ho rahi hai
                          sx={{ width: 64, height: 64, mr: 2, background: '#eee' }} 
                        />
                      </ListItemAvatar>
                      <ListItemText 
                        primary={<Typography variant="h6" sx={{ fontWeight: 'bold' }}>{item.name}</Typography>}
                        secondary={`Quantity: ${item.quantity} | Total: $${(item.price * item.quantity).toFixed(2)}`}
                      />
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => handleRemove(item.productId)}
                        title="Remove Item"
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </ListItem>
                  </Fade>
                ))}
              </List>
            </Grid>

            {/* Column 2: Summary Box */}
            <Grid item xs={12} md={5}>
              <Paper sx={summaryBoxStyle}>
                <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Order Summary
                </Typography>
                <Typography variant="h5" sx={{ mt: 2, mb: 3 }}>
                  Total: ${total.toFixed(2)}
                </Typography>
                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth
                  onClick={handleCheckout}
                  sx={animatedCheckoutBtn}
                >
                  Proceed to Checkout
                </Button>
              </Paper>
            </Grid>

          </Grid>
        )}
      </Box>
    </Container>
  );
}

export default CartPage;