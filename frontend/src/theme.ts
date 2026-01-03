// ===========================================
// MUI Theme Configuration
// ===========================================
// 
// WHY THIS FILE?
// Defines the visual design system for the entire application:
// - Colors (primary, secondary, etc.)
// - Typography (fonts, sizes)
// - Spacing
// - Component overrides
//
// MUI uses a theme object to ensure consistency across all components.

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  // ===========================================
  // Color Palette
  // ===========================================
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',      // Blue - professional, trustworthy
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#9c27b0',      // Purple - creative, modern
      light: '#ba68c8',
      dark: '#7b1fa2',
      contrastText: '#fff',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ed6c02',
    },
    info: {
      main: '#0288d1',
    },
    success: {
      main: '#2e7d32',
    },
    background: {
      default: '#f5f5f5',   // Light gray background
      paper: '#ffffff',
    },
  },
  
  // ===========================================
  // Typography
  // ===========================================
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  
  // ===========================================
  // Shape
  // ===========================================
  shape: {
    borderRadius: 8,        // Rounded corners
  },
  
  // ===========================================
  // Component Overrides
  // ===========================================
  components: {
    // Button customization
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',  // Don't uppercase button text
          fontWeight: 500,
        },
      },
      defaultProps: {
        disableElevation: true,   // Flat buttons by default
      },
    },
    // Card customization
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    // TextField customization
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    // Table customization
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5f5f5',
        },
      },
    },
  },
});
