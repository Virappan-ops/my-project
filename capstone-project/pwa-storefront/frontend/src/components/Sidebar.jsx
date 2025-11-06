import React, { useState, useContext } from 'react'; // 'useContext' add karein
import { AuthContext } from '../context/AuthContext'; // 'AuthContext' ko import karein
import { useNavigate } from 'react-router-dom';
import { 
  AppBar, Toolbar, IconButton, Typography, Drawer, 
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, 
  Divider, // Divider (line) add karein
  Badge // Badge component ko import karein
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LogoutIcon from '@mui/icons-material/Logout';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

function Sidebar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // --- NAYA CODE ---
  // AuthContext se user aur logout function lein
  const { user, logout } = useContext(AuthContext); 
  const navigate = useNavigate();

  // Cart mein total items (quantity) calculate karein
  const cartCount = user?.cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  // -----------------

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleLogout = () => {
    logout();
  };

  // --- NAYA CODE (Menu Items) ---
  // Menu items ki list, taaki cart icon update ho sake
  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/home' },
    { 
      text: 'Cart', 
      // Cart Icon ko Badge ke saath wrap karein
      icon: (
        <Badge badgeContent={cartCount} color="error">
          <ShoppingCartIcon />
        </Badge>
      ), 
      path: '/cart' 
    },
    { text: 'My Orders', icon: <ReceiptLongIcon />, path: '/orders' },
    // Hum yahan 'My Orders' bhi add karenge
  ];
  // -----------------------------

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            PWA Storefront
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <Box
          sx={{ width: 250, display: 'flex', flexDirection: 'column', height: '100%' }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          {/* Top Links (Home, Cart) */}
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton onClick={() => navigate(item.path)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {/* Spacer (taaki footer niche push ho jaaye) */}
          <Box sx={{ flexGrow: 1 }} /> 

          {/* --- NAYA CODE (Footer) --- */}
          {/* Divider line */}
          <Divider /> 
          
          <List>
            {/* User Email Item */}
            <ListItem 
              sx={{ 
                color: 'text.secondary', 
                paddingTop: '8px', 
                paddingBottom: '0px' 
              }}
            >
              <ListItemText
                primaryTypographyProps={{ fontSize: '0.9rem', fontStyle: 'italic' }}
                primary="Logged in as:"
                secondary={user?.email} // User context se email dikhayein
                secondaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 'bold' }}
              />
            </ListItem>
            
            {/* Logout Button */}
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
          {/* ------------------------ */}
        </Box>
      </Drawer>
    </>
  );
}

export default Sidebar;