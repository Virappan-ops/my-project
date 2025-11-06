import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Box, CircularProgress, Alert, Accordion, 
  AccordionSummary, AccordionDetails, Chip, List, ListItem, 
  ListItemAvatar, Avatar, ListItemText, Fade 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

// Styling
const centerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '50vh',
};

const glassyAccordionStyle = {
  marginBottom: '16px',
  borderRadius: '16px !important', // Important zaroori hai Accordion ko override karne ke liye
  background: 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
};

const productAvatarStyle = {
  width: 60, 
  height: 60, 
  mr: 2, 
  background: '#eee',
  borderRadius: '8px'
};

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/orders'); // Naya API route call karein
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Errors fetching orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <Box sx={centerStyle}><CircularProgress /></Box>;
  }

  if (error) {
    return <Box sx={centerStyle}><Alert severity="error">{error}</Alert></Box>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          My Orders
        </Typography>

        {orders.length === 0 ? (
          <Alert severity="info" icon={<ReceiptLongIcon />} sx={{ ...glassyAccordionStyle, padding: '24px' }}>
            You have no orders yet. Start shopping to place your first order!
          </Alert>
        ) : (
          <Fade in={true} timeout={500}>
            <Box>
              {orders.map((order, index) => (
                <Accordion 
                  key={order._id} 
                  sx={glassyAccordionStyle} 
                  defaultExpanded={index === 0} // Pehla order khula rakhein
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', pr: 2 }}>
                      <Box>
                        <Typography sx={{ fontWeight: 'bold' }}>Order ID: {order._id.slice(-6)}</Typography> {/* Sirf aakhri 6 digit */}
                        <Typography variant="body2" color="text.secondary">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        ${order.totalAmount.toFixed(2)}
                      </Typography>
                      <Chip 
                        label={order.status} 
                        color={order.status === 'Pending' ? 'warning' : 'success'} 
                        size="small"
                      />
                    </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
                    <Typography variant="h6" gutterBottom>Order Details</Typography>
                    <List>
                      {order.items.map(item => (
                        <ListItem key={item.productId}>
                          <ListItemAvatar>
                            <Avatar 
                              variant="rounded" 
                              src={item.imageUrl} 
                              sx={productAvatarStyle}
                            />
                          </ListItemAvatar>
                          <ListItemText 
                            primary={<Typography sx={{ fontWeight: 'bold' }}>{item.name}</Typography>}
                            secondary={`Quantity: ${item.quantity} | Price: $${item.price.toFixed(2)}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Fade>
        )}
      </Box>
    </Container>
  );
}

export default OrdersPage;