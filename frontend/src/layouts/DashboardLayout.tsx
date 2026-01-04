// ===========================================
// Dashboard Layout - Main Application Layout
// ===========================================
// 
// WHY THIS FILE?
// Provides the main application shell with:
// - Sidebar navigation
// - Top app bar
// - Content area

import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Article as ArticleIcon,
  Category as CategoryIcon,
  People as PeopleIcon,
  Contacts as ContactsIcon,
  Leaderboard as LeaderboardIcon,
  Handshake as HandshakeIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';

const DRAWER_WIDTH = 260;

// ===========================================
// Navigation Menu Structure
// ===========================================
const menuItems = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    title: 'CMS',
    icon: <ArticleIcon />,
    children: [
      { title: 'Posts', path: '/cms/posts', icon: <ArticleIcon /> },
      { title: 'Categories', path: '/cms/categories', icon: <CategoryIcon /> },
    ],
  },
  {
    title: 'CRM',
    icon: <PeopleIcon />,
    children: [
      { title: 'Contacts', path: '/crm/contacts', icon: <ContactsIcon /> },
      { title: 'Leads', path: '/crm/leads', icon: <LeaderboardIcon /> },
      { title: 'Deals', path: '/crm/deals', icon: <HandshakeIcon /> },
    ],
  },
  {
    title: 'ERP',
    icon: <BusinessIcon />,
    children: [
      { title: 'Products', path: '/erp/products', icon: <InventoryIcon /> },
      { title: 'Customers', path: '/erp/customers', icon: <PeopleIcon /> },
      { title: 'Orders', path: '/erp/orders', icon: <ShoppingCartIcon /> },
      { title: 'Invoices', path: '/erp/invoices', icon: <ReceiptIcon /> },
    ],
  },
  {
    title: 'Settings',
    icon: <SettingsIcon />,
    children: [
      { title: 'Users', path: '/settings/users', icon: <PeopleIcon /> },
    ],
  },
];

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Toggle mobile drawer
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Toggle submenu
  const handleMenuToggle = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };
  
  // Handle user menu
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Check if path is active
  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (children: Array<{ path: string }>) =>
    children.some((child) => location.pathname.startsWith(child.path));
  
  // ===========================================
  // Drawer Content
  // ===========================================
  const drawer = (
    <Box>
      {/* Logo */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" fontWeight="bold" color="primary">
          CMS Platform
        </Typography>
      </Box>
      
      <Divider />
      
      {/* Navigation */}
      <List>
        {menuItems.map((item) => (
          <Box key={item.title}>
            {item.children ? (
              // Parent with children
              <>
                <ListItemButton
                  onClick={() => handleMenuToggle(item.title)}
                  selected={isParentActive(item.children)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.title} />
                  {openMenus[item.title] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                
                <Collapse in={openMenus[item.title]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.path}
                        sx={{ pl: 4 }}
                        selected={isActive(child.path)}
                        onClick={() => navigate(child.path)}
                      >
                        <ListItemIcon>{child.icon}</ListItemIcon>
                        <ListItemText primary={child.title} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              // Single item
              <ListItemButton
                selected={isActive(item.path!)}
                onClick={() => navigate(item.path!)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            )}
          </Box>
        ))}
      </List>
    </Box>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {/* Current page title could go here */}
          </Typography>
          
          {/* User Menu */}
          <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem disabled>
              <Typography variant="body2">
                {user?.firstName} {user?.lastName}
              </Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px', // AppBar height
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: 'background.default',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default DashboardLayout;
