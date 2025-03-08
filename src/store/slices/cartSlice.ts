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
      state.items = [...action.payload];
      state.summary = calculateSummary(state.items);
      state.isEmpty = state.items.length === 0;
    },
    addCartItem: (state, action: PayloadAction<CartItem>) => {
      const existingItemIndex = state.items.findIndex(item => 
        item.productId === action.payload.productId
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity
        };
        state.items = updatedItems;
      } else {
        state.items = [...state.items, {
          ...action.payload,
          id: action.payload.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }];
      }

      state.summary = calculateSummary(state.items);
      state.isEmpty = false;
      
      console.log('Item added, current items:', JSON.stringify(state.items));
    },
    updateCartItemQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      
      const updatedItems = state.items.map(item => 
        item.id === id ? { ...item, quantity } : item
      );
      
      state.items = updatedItems;
      state.summary = calculateSummary(state.items);
      state.isEmpty = state.items.length === 0;
      
      console.log(`Item ${id} quantity updated to ${quantity}, current items:`, JSON.stringify(state.items));
    },
    removeCartItem: (state, action: PayloadAction<string>) => {
      const idToRemove = action.payload;
      
      const updatedItems = state.items.filter(item => item.id !== idToRemove);
      
      state.items = updatedItems;
      state.summary = calculateSummary(updatedItems);
      state.isEmpty = updatedItems.length === 0;
      
      console.log(`Item ${idToRemove} removed, remaining items: ${updatedItems.length}`, 
        updatedItems.map(i => `${i.id}: ${i.name} (${i.quantity})`));
    },
    clearCart: (state) => {
      state.items = [];
      state.summary = calculateSummary([]);
      state.isEmpty = true;
      
      console.log('Cart cleared');
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