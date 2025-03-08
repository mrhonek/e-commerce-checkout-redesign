import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Add a function to clear any lingering cart data in localStorage
const clearLocalCartData = () => {
  // Clear all cart-related items from localStorage
  const localStorageKeys = Object.keys(localStorage);
  localStorageKeys.forEach(key => {
    if (key.startsWith('cart') || key.includes('cart') || key.includes('Cart')) {
      localStorage.removeItem(key);
      console.log(`Removed localStorage item: ${key}`);
    }
  });
  
  // Also clear session storage just in case
  const sessionStorageKeys = Object.keys(sessionStorage);
  sessionStorageKeys.forEach(key => {
    if (key.startsWith('cart') || key.includes('cart') || key.includes('Cart')) {
      sessionStorage.removeItem(key);
      console.log(`Removed sessionStorage item: ${key}`);
    }
  });

  console.log('All local cart data cleared');
};

// Execute the clear function when this file is loaded
clearLocalCartData();

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

// Create a pure function for deeply cloning the cart state
const cloneState = (state: CartState): CartState => {
  return {
    items: state.items.map(item => ({ ...item })),
    summary: { ...state.summary },
    loading: state.loading,
    error: state.error,
    isEmpty: state.isEmpty
  };
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      // Create a deep clone of the payload to avoid mutation issues
      const clonedItems = action.payload.map(item => ({ ...item }));
      
      // Replace the entire items array
      state.items = clonedItems;
      
      // Recalculate summary
      state.summary = calculateSummary(clonedItems);
      
      // Update isEmpty flag
      state.isEmpty = clonedItems.length === 0;
      
      console.log('Cart set to:', clonedItems.length, 'items');
    },
    
    addCartItem: (state, action: PayloadAction<CartItem>) => {
      // Create a new item object with a guaranteed unique ID
      const newItem = { 
        ...action.payload,
        id: action.payload.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      };
      
      // Check if item already exists by productId
      const existingItemIndex = state.items.findIndex(item => 
        item.productId === newItem.productId
      );
      
      // Clone the current items array
      const updatedItems = [...state.items.map(item => ({ ...item }))];
      
      if (existingItemIndex >= 0) {
        // Update existing item's quantity
        updatedItems[existingItemIndex].quantity += newItem.quantity;
      } else {
        // Add new item to array
        updatedItems.push(newItem);
      }
      
      // Update state
      state.items = updatedItems;
      state.summary = calculateSummary(updatedItems);
      state.isEmpty = false;
      
      console.log('Item added, cart now has:', updatedItems.length, 'items');
    },
    
    updateCartItemQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      
      // Only proceed if quantity is valid
      if (quantity <= 0) {
        console.warn('Invalid quantity update attempted:', quantity);
        return;
      }
      
      // Find the item
      const itemIndex = state.items.findIndex(item => item.id === id);
      
      // Exit if item not found
      if (itemIndex === -1) {
        console.warn('Item not found for quantity update:', id);
        return;
      }
      
      // Clone the items array and update the quantity
      const updatedItems = state.items.map((item, index) => 
        index === itemIndex 
          ? { ...item, quantity } 
          : { ...item }
      );
      
      // Update state
      state.items = updatedItems;
      state.summary = calculateSummary(updatedItems);
      state.isEmpty = updatedItems.length === 0;
      
      console.log(`Item ${id} quantity updated to ${quantity}`);
    },
    
    removeCartItem: (state, action: PayloadAction<string>) => {
      const idToRemove = action.payload;
      
      // Find the item to be removed
      const itemIndex = state.items.findIndex(item => item.id === idToRemove);
      
      // Exit if item not found
      if (itemIndex === -1) {
        console.warn('Item not found for removal:', idToRemove);
        return;
      }
      
      // Remove the item by filtering the array
      const updatedItems = state.items
        .filter(item => item.id !== idToRemove)
        .map(item => ({ ...item })); // Clone remaining items
      
      // Update state
      state.items = updatedItems;
      state.summary = calculateSummary(updatedItems);
      state.isEmpty = updatedItems.length === 0;
      
      console.log(`Item ${idToRemove} removed, remaining:`, updatedItems.length);
    },
    
    clearCart: (state) => {
      // Reset to empty state
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