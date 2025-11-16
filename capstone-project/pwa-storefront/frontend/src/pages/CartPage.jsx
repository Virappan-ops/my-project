// src/pages/CartPage.jsx
// YEH AAPKA CODE HAI AUR YEH SAHI HAI
import React, { useState, useEffect, useContext } from 'react';
import { getCartItems, removeCartItem, clearCart, addToSyncQueue } from '../utils/db';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useOnlineStatus } from '../useOnlineStatus';

import { 
  Container, Typography, Box, CircularProgress, Alert, List, ListItem, 
  ListItemAvatar, Avatar, ListItemText, IconButton, Button, Paper, 
  Fade, Grid, Divider 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import RemoveShoppingCartOutlinedIcon from '@mui/icons-material/RemoveShoppingCartOutlined';

// --- Styling ---
const centerStyle = { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', textAlign: 'center' };
const glassyItemStyle = { marginBottom: '16px', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.1)', transition: 'transform 0.3s ease' };
const summaryBoxStyle = { ...glassyItemStyle, padding: '24px', position: 'sticky', top: '100px' };
const animatedCheckoutBtn = { padding: '12px 20px', fontSize: '1rem', fontWeight: 'bold', marginTop: '20px', transition: 'all 0.3s ease' };

function CartPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user, setUser, loading: authLoading } = useContext(AuthContext);
  const isOnline = useOnlineStatus(); 

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart logic
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (isOnline && token) {
        setItems(user?.cart || []); // If online, use synced context data
      } else {
        try {
          // If offline, read from local DB
          const dbItems = await getCartItems();
          setItems(dbItems || []);
        } catch (err) {
          console.error("Error loading local cart:", err);
          setItems([]);
        }
      }
      setLoading(false);
    };
    if (!authLoading) loadCart();
  }, [location, isOnline, authLoading, user, token]);

  // Remove item logic
  const handleRemove = async (productId) => {
    const newCart = items.filter(item => item.productId !== productId);
    setItems(newCart); 

    if (token && isOnline) {
      try {
        const res = await axios.delete(`/api/cart/remove/${productId}`);
        setUser({ ...user, cart: res.data });
        await removeCartItem(productId);
      } catch (err) {
        console.error("Error removing from server cart:", err);
      }
    } else {
      await removeCartItem(productId); // Offline removal
    }
  };

  // Checkout logic
  const handleCheckout = async () => {
    if (!items || items.length === 0) return;
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderData = {
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl || ''
      })),
      totalAmount: total.toFixed(2),
    };

    if (isOnline) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.post('/api/orders/checkout', orderData, config);
        alert(response.data.message || 'Order placed successfully!');
        await clearCart();
        if (token) {
          await axios.post('/api/cart/update', { cart: [] }, config);
          setUser({ ...user, cart: [] });
        }
        navigate('/home');
      } catch (err) {
        console.error("Online checkout failed, falling back to queue:", err);
        await queueCheckout(orderData); // Fallback to queue
      }
    } else {
      await queueCheckout(orderData);
    }
  };

  // Queue checkout logic (Correct)
  const queueCheckout = async (orderData) => {
    const action = {
      type: 'checkout',
      payload: orderData,
      timestamp: Date.now(),
      token: token || null 
    };

    try {
      await addToSyncQueue(action);
      console.log('Order queued in IndexedDB');
      
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const swRegistration = await navigator.serviceWorker.ready;
        await swRegistration.sync.register('sync-new-order');
ag
        console.log('Background sync registered: sync-new-order');
      }
    } catch (err) {
      console.error('Failed to queue order:', err);
    }

    alert("You are currently offline. Your order will be placed as soon as you are back online!");
    await clearCart();
    navigate('/home');
  };

  // Render logic
  if (loading || authLoading) {
    return (
      <Box sx={centerStyle}><CircularProgress /></Box>
    );
  }

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Your Cart
        </Typography>

        {(!items || items.length === 0) ? (
          <Fade in timeout={500}>
            <Paper sx={{ ...glassyItemStyle, ...centerStyle, padding: '48px' }}>
              <RemoveShoppingCartOutlinedIcon sx={{ fontSize: '80px', color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Your Cart is Empty
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                Looks like you haven't added anything yet.
              </Typography>
              <Button variant="contained" size="large" onClick={() => navigate('/home')}>
                Start Shopping
              </Button>
            </Paper>
          </Fade>
        ) : (
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <List>
                {items.map(item => (
                  <Fade in timeout={500} key={item.productId}>
                    <ListItem component={Paper} sx={glassyItemStyle}>
                      <ListItemAvatar>
                        <Avatar variant="rounded" src={item.imageUrl} sx={{ width: 64, height: 64, mr: 2 }} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography variant="h6" sx={{ fontWeight: 'bold' }}>{item.name}</Typography>}
                        secondary={`Quantity: ${item.quantity} | Total: $${(item.price * item.quantity).toFixed(2)}`}
                      />
                      <IconButton edge="end" aria-label="delete" onClick={() => handleRemove(item.productId)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </ListItem>
                  </Fade>
                ))}
              </List>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper sx={summaryBoxStyle}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Order Summary
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h5" sx={{ mt: 2, mb: 3, fontWeight: 'bold' }}>
                  Total: ${total.toFixed(2)}
                </Typography>
                <Button variant="contained" color="success" fullWidth onClick={handleCheckout} sx={animatedCheckoutBtn} disabled={items.length === 0}>
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