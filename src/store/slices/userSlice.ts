import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ShippingAddress } from './checkoutSlice';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  savedAddresses: ShippingAddress[];
}

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
    },
    addSavedAddress: (state, action: PayloadAction<ShippingAddress>) => {
      if (state.currentUser) {
        state.currentUser.savedAddresses.push(action.payload);
      }
    },
    removeSavedAddress: (state, action: PayloadAction<string>) => {
      if (state.currentUser) {
        // Assuming each address has a unique identifier like email + zipCode
        const addressKey = action.payload;
        state.currentUser.savedAddresses = state.currentUser.savedAddresses.filter(
          address => `${address.email}-${address.zipCode}` !== addressKey
        );
      }
    },
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUserError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
    }
  }
});

export const {
  setUser,
  addSavedAddress,
  removeSavedAddress,
  setUserLoading,
  setUserError,
  logout
} = userSlice.actions;

export default userSlice.reducer; 