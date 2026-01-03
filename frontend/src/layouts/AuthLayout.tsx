// ===========================================
// Auth Layout - Wrapper for Login/Register
// ===========================================
// 
// WHY THIS FILE?
// Provides a consistent layout for authentication pages.
// Centered card with branding.

import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';

function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 2,
          }}
        >
          {/* Logo/Branding */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
              CMS Platform
            </Typography>
            <Typography variant="body2" color="text.secondary">
              CMS • CRM • ERP
            </Typography>
          </Box>
          
          {/* Page Content (Login or Register form) */}
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
}

export default AuthLayout;
