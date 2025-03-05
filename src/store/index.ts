import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import checkoutReducer from './slices/checkoutSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    checkout: checkoutReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 