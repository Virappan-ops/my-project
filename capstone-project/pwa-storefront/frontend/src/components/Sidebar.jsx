import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; // <-- 1. Import ThemeContext
import { useNavigate } from 'react-router-dom';
import { 
  AppBar, Toolbar, IconButton, Typography, Drawer, 
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, 
  Divider, 
  Badge 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LogoutIcon from '@mui/icons-material/Logout';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
// --- 2. Naye Icons ---
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Dark mode
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Light mode

function Sidebar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const { user, logout } = useContext(AuthContext); 
  const { mode, toggleTheme } = useContext(ThemeContext); // <-- 3. Context se mode aur toggle lein
  const navigate = useNavigate();

  const cartCount = user?.cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/home' },
    { 
      text: 'Cart', 
      icon: (
        <Badge badgeContent={cartCount} color="error">
          <ShoppingCartIcon />
        </Badge>
      ), 
      path: '/cart' 
    },
    { text: 'My Orders', icon: <ReceiptLongIcon />, path: '/orders' },
  ];

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
          
          {/* --- 4. Title ko 'flexGrow' diya taaki icon right mein push ho --- */}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            PWA Storefront
          </Typography>

          {/* --- 5. THEME TOGGLE BUTTON (TOP BAR) --- */}
          <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          {/* ------------------------------------ */}

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
          // onClick={toggleDrawer(false)} <-- Yahan se hataya
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                {/* --- 6. UX Fix: Click karne par drawer band ho --- */}
                <ListItemButton onClick={() => {
                  navigate(item.path);
                  toggleDrawer(false)(); // Drawer ko band karein
                }}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Box sx={{ flexGrow: 1 }} /> 
          <Divider /> 
          
          <List>
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
                secondary={user?.email}
                secondaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 'bold' }}
              />
            </ListItem>
            
            <ListItem disablePadding>
              {/* --- 7. UX Fix: Logout par bhi drawer band ho --- */}
              <ListItemButton onClick={() => {
                handleLogout();
                toggleDrawer(false)(); // Drawer ko band karein
              }}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default Sidebar;