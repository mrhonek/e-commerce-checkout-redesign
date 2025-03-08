import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { endpoints } from '../services/api';
import { processCartItems } from '../utils/imageUtils';

// Define types
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
}

interface CartContextType {
  cart: Cart;
  loading: boolean;
  error: string | null;
  addToCart: (product: { _id: string; name: string; price: number; image?: string }, quantity: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  calculateCartTotals: (items: CartItem[]) => { subtotal: number; totalItems: number };
}

// Create the context with a default value
const CartContext = createContext<CartContextType | undefined>(undefined);

// Custom hook to use the cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Cart provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State
  const [cart, setCart] = useState<Cart>({ items: [], subtotal: 0, totalItems: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate cart totals helper function
  const calculateCartTotals = (items: CartItem[]) => {
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    return { subtotal, totalItems };
  };

  // Fetch cart on component mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await endpoints.cart.get();
        const cartData = response.data;
        
        // Process images to handle placeholders
        const processedItems = processCartItems(cartData.items);
        
        const totals = calculateCartTotals(processedItems);
        
        setCart({
          items: processedItems.map((item: { id?: string; _id?: string; productId?: string }) => ({
            ...item,
            id: item.id || item._id || `item-${Date.now()}`, // Ensure we always have an id
            productId: item.productId || '' // Ensure we always have a productId (even if empty)
          })),
          ...totals
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError('Failed to load cart');
        // Initialize empty cart if there's an error
        setCart({ items: [], subtotal: 0, totalItems: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Add item to cart
  const addToCart = async (product: { _id: string; name: string; price: number; image?: string }, quantity: number) => {
    try {
      setLoading(true);
      const response = await endpoints.cart.add({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image
      });
      
      const cartData = response.data;
      
      // Process images to handle placeholders
      const processedItems = processCartItems(cartData.items);
      
      const totals = calculateCartTotals(processedItems);
      
      setCart({
        items: processedItems.map((item: { id?: string; _id?: string; productId?: string }) => ({
          ...item,
          id: item.id || item._id || `item-${Date.now()}`, // Ensure we always have an id
          productId: item.productId || '' // Ensure we always have a productId (even if empty)
        })),
        ...totals
      });
      setError(null);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      setLoading(true);
      const response = await endpoints.cart.update(itemId, { quantity });
      
      const cartData = response.data;
      
      // Process images to handle placeholders
      const processedItems = processCartItems(cartData.items);
      
      const totals = calculateCartTotals(processedItems);
      
      setCart({
        items: processedItems.map((item: { id?: string; _id?: string; productId?: string }) => ({
          ...item,
          id: item.id || item._id || `item-${Date.now()}`, // Ensure we always have an id
          productId: item.productId || '' // Ensure we always have a productId (even if empty)
        })),
        ...totals
      });
      setError(null);
    } catch (err) {
      console.error('Error updating cart item:', err);
      setError('Failed to update cart item');
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId: string) => {
    try {
      setLoading(true);
      
      // First update the local state to give immediate feedback
      const updatedItems = cart.items.filter(item => item.id !== itemId);
      const isEmpty = updatedItems.length === 0;
      
      // Update local cart state with filtered items
      setCart(prev => ({
        ...prev,
        items: updatedItems,
        totalItems: updatedItems.reduce((count, item) => count + item.quantity, 0),
        subtotal: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        isEmpty: isEmpty // Explicitly set isEmpty based on items array length
      }));
      
      // Make the API call to reflect changes on the server
      const response = await endpoints.cart.remove(itemId);
      
      // Process the server response
      const cartData = response.data;
      const processedItems = processCartItems(cartData.items);
      const totals = calculateCartTotals(processedItems);
      
      // Update with server response
      setCart({
        items: processedItems.map((item: any) => ({
          ...item,
          id: item.id || item._id || `item-${Date.now()}`,
          productId: item.productId || ''
        })),
        ...totals,
        isEmpty: processedItems.length === 0 // Ensure isEmpty is set correctly based on server response
      });
      
      setError(null);
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError('Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setLoading(true);
      await endpoints.cart.clear();
      setCart({ items: [], subtotal: 0, totalItems: 0 });
      setError(null);
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  // Provide the context value
  const contextValue: CartContextType = {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    calculateCartTotals
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 