import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CartSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

interface CartState {
  items: CartItem[];
  summary: CartSummary;
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
}

const initialState: CartState = {
  items: [],
  summary: {
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0
  },
  loading: false,
  error: null,
  isEmpty: true
};

// Helper function to recalculate summary
const calculateSummary = (items: CartItem[]): CartSummary => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% tax rate
  const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
  const total = subtotal + tax + shipping;

  return {
    subtotal,
    tax,
    shipping,
    total
  };
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.summary = calculateSummary(action.payload);
      state.isEmpty = action.payload.length === 0;
    },
    addCartItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => item.productId === action.payload.productId);
      
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      
      state.summary = calculateSummary(state.items);
      state.isEmpty = false;
    },
    updateCartItemQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      
      if (item) {
        item.quantity = quantity;
        state.summary = calculateSummary(state.items);
      }
    },
    removeCartItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.summary = calculateSummary(state.items);
      state.isEmpty = state.items.length === 0;
      console.log('Item removed, remaining items:', state.items.length);
    },
    clearCart: (state) => {
      state.items = [];
      state.summary = calculateSummary([]);
      state.isEmpty = true;
    },
    setCartLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCartError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const {
  setCartItems,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  setCartLoading,
  setCartError
} = cartSlice.actions;

export default cartSlice.reducer; 