import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdminUser {
  _id: string;
  email: string;
  role: 'admin' | 'super_admin';
}

interface AuthState {
  token: string | null;
  admin: AdminUser | null;
}

// Initialize state from localStorage (client-side only)
const getInitialState = (): AuthState => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    return {
      token,
      admin: null,
    };
  }
  return {
    token: null,
    admin: null,
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; admin: AdminUser }>
    ) => {
      state.token = action.payload.token;
      state.admin = action.payload.admin;

      // Persist token to localStorage and cookie
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminToken', action.payload.token);
        // Set cookie for middleware access
        document.cookie = `adminToken=${action.payload.token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
      }
    },
    logout: (state) => {
      state.token = null;
      state.admin = null;

      // Clear token from localStorage and cookie
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
        // Clear cookie
        document.cookie = 'adminToken=; path=/; max-age=0';
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
