// ===========================================
// Main Entry Point - React Application
// ===========================================
// 
// WHY THIS FILE?
// This is where React mounts to the DOM. It wraps the app with:
// 1. StrictMode - Highlights potential problems
// 2. QueryClientProvider - React Query for server state
// 3. BrowserRouter - Client-side routing
// 4. ThemeProvider - MUI theming

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import App from './App';
import { theme } from './theme';
import './index.css';

// ===========================================
// React Query Client
// ===========================================
// WHY: Manages server state (API data) with caching, refetching, etc.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // Data is fresh for 5 minutes
      retry: 1,                    // Retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch when tab gains focus
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* React Query Provider - Server state management */}
    <QueryClientProvider client={queryClient}>
      {/* MUI Theme Provider - Consistent styling */}
      <ThemeProvider theme={theme}>
        {/* CssBaseline - Normalize CSS across browsers */}
        <CssBaseline />
        {/* Router - Client-side navigation */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
