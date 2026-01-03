// ===========================================
// Auth Store - Global Authentication State
// ===========================================
// 
// WHY ZUSTAND?
// - Simple, lightweight state management (no boilerplate like Redux)
// - Built-in persistence support
// - TypeScript-first design
// - Works great with React hooks
//
// This store manages:
// - User data
// - JWT tokens
// - Login/Logout state

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ===========================================
// Types
// ===========================================
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

// ===========================================
// Store Definition
// ===========================================
export const useAuthStore = create<AuthState>()(
  // persist middleware saves state to localStorage
  persist(
    (set) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      
      // Set user data
      setUser: (user) => set({ user }),
      
      // Set tokens (used by refresh)
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      
      // Login - set user and tokens
      login: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),
      
      // Logout - clear everything
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage', // localStorage key
      // Only persist these fields (not functions)
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
