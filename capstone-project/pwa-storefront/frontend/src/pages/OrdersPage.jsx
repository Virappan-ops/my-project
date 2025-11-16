import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  // Chip, // --- HATA DIYA GAYA ---
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Fade,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // ... (fetchOrders, manualSync, aur useEffect logic mein koi badlaav nahi) ...
  // 📦 Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/orders");
      // Sort orders by date, newest first
      const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("⚠️ Unable to fetch orders. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Trigger sync manually
  const manualSync = async () => {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;

      if ("sync" in reg) {
        setSyncing(true);
        try {
          await reg.sync.register("sync-new-order");
          alert("🔄 Manual sync triggered! Orders will sync soon.");
        } catch (err) {
          console.error("Error registering sync:", err);
          alert("⚠️ Could not trigger sync.");
          setSyncing(false);
        }
      } else {
        alert("⚠️ Background Sync not supported in your browser.");
      }
    } else {
      alert("❌ Service Worker not registered!");
    }
  };

  useEffect(() => {
    fetchOrders();

    // 🔊 Listen for SW messages (sync start & complete)
    const handleSWMessage = (event) => {
      if (event.data?.type === "SYNC_START") {
        setSyncing(true);
      }
      if (event.data?.type === "SYNC_COMPLETE") {
        setSyncing(false);
        fetchOrders(); // Refresh orders after sync
      }
    };
    
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleSWMessage);
    }

    // 🔄 When user comes back online, trigger sync
    window.addEventListener("online", manualSync);
    
    return () => {
      window.removeEventListener("online", manualSync);
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleSWMessage);
      }
    };
  }, []);
  
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* --- STYLED TITLE --- */}
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ fontWeight: 700, letterSpacing: '0.5px' }}
        >
          My Orders
        </Typography>

        {syncing && (
          <Alert severity="info" sx={{ mb: 2 }}>
            🔄 Syncing orders... Please wait
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="outlined"
          onClick={manualSync}
          sx={{ mb: 3 }} // Thoda zyaada margin
          disabled={syncing}
        >
          🔁 Refresh / Sync Orders
        </Button>

        {orders.length === 0 ? (
          <Alert
            severity="info"
            icon={<ReceiptLongIcon />}
            sx={{
              // Glassmorphism alert (jo pehle se tha)
              background: "rgba(255,255,255,0.25)",
              backdropFilter: "blur(8px)",
            }}
          >
            You have no orders yet. Try placing one!
          </Alert>
        ) : (
          <Fade in={true} timeout={500}>
            <Box>
              {orders.map((order) => (
                // --- PREMIUM ACCORDION (CARD) STYLE ---
                <Accordion 
                  key={order._id} 
                  sx={{ 
                    mb: 2.5, // Zyaada space
                    borderRadius: '12px !important', // Soft corners
                    boxShadow: (theme) => theme.shadows[1], // Soft shadow
                    bgcolor: 'background.paper',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      boxShadow: (theme) => theme.shadows[4] // Halki lift
                    },
                    '&:before': { 
                      display: 'none' // MUI ki default border line hata di
                    }
                  }}
                >
                  {/* --- PREMIUM ACCORDION SUMMARY --- */}
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {/* Left Side: ID aur Date */}
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Order #{order._id.slice(-6)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                        {new Date(order.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    
                    {/* Right Side: Total Price (Upar la diya) */}
                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        ${order.totalAmount.toFixed(2)}
                      </Typography>
                    </Box>
                    
                    {/* --- CHIP HATA DIYA GAYA --- */}
                    
                  </AccordionSummary>
                  
                  {/* --- PREMIUM ACCORDION DETAILS --- */}
                  <AccordionDetails sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 3, pb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Items in this order:
                    </Typography>
                    <List sx={{ width: '100%' }}>
                      {order.items.map((item) => (
                        <ListItem key={item.productId} sx={{ py: 1.5, px: 0 }}>
                          <ListItemAvatar>
                            <Avatar
                              variant="rounded"
                              src={item.imageUrl}
                              sx={{ width: 56, height: 56, mr: 2, borderRadius: '8px' }} // Soft image corner
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {item.name}
                              </Typography>
                            }
                            secondary={`Quantity: ${item.quantity} | Unit Price: $${item.price.toFixed(2)}`}
                          />
                          {/* Item ka total price */}
                          <Typography variant="body1" sx={{ fontWeight: 600, ml: 2, color: 'text.secondary' }}>
                            ${(item.quantity * item.price).toFixed(2)}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                    {/* Total yahan se hata diya, kyunki ab woh summary mein hai */}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Fade>
        )}
      </Box>
    </Container>
  );
};

export default OrdersPage;