import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { updateCartItemQuantity, removeCartItem, CartItem, CartSummary, setCartLoading } from '../../store/slices/cartSlice';
import { motion } from 'framer-motion';

export const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(state => state.cart);
  const { items, summary } = cart as { items: CartItem[], summary: CartSummary };
  const { loading, error } = cart as { loading: boolean, error: string | null };

  // Update item quantity
  const handleQuantityChange = (id: string, quantity: number) => {
    // Return early if quantity is invalid
    if (quantity <= 0) {
      console.warn('Attempted to set invalid quantity:', quantity);
      return;
    }

    // Set loading state
    dispatch(setCartLoading(true));
    
    // Log what we're doing
    console.log(`Updating quantity for item ${id} to ${quantity}`);
    
    // Dispatch the action
    dispatch(updateCartItemQuantity({ id, quantity }));
    
    // Reset loading state after a short delay
    setTimeout(() => {
      dispatch(setCartLoading(false));
    }, 300);
  };

  // Remove item from cart
  const handleRemoveItem = (id: string) => {
    // Set loading state
    dispatch(setCartLoading(true));
    
    // Log what we're doing
    console.log(`Removing item with ID: ${id}`);
    
    // Dispatch the remove action
    dispatch(removeCartItem(id));
    
    // Reset loading state after a short delay
    setTimeout(() => {
      dispatch(setCartLoading(false));
    }, 300);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  // Handle empty cart
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Your Cart</h1>
          <p className="mt-4 text-xl text-gray-500">Your cart is currently empty.</p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xl text-gray-500">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Error</h1>
          <p className="mt-4 text-xl text-red-500">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fixed proceed to checkout button for mobile
  const MobileCheckoutButton = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 md:hidden z-10 border-t border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-gray-800">Total:</span>
        <span className="font-bold text-gray-900 text-xl">${summary.total.toFixed(2)}</span>
      </div>
      <Link
        to="/checkout"
        className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
      >
        Proceed to Checkout
      </Link>
    </div>
  );

  return (
    <div className="bg-white pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl md:text-4xl">Shopping Cart</h1>
        <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <motion.div 
            className="lg:col-span-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Cart items */}
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row border-b pb-6">
                  {/* Item image */}
                  <div className="w-full sm:w-24 h-24 mb-4 sm:mb-0 mr-0 sm:mr-4">
                    <img 
                      src={item.image || '/placeholder-product.jpg'} 
                      alt={item.name} 
                      className="h-full w-full object-cover rounded"
                    />
                  </div>
                  
                  {/* Item details */}
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        {(item as any).variant && (
                          <p className="text-sm text-gray-500">
                            {(item as any).variant}
                          </p>
                        )}
                      </div>
                      <div className="text-right mt-2 sm:mt-0">
                        <p className="font-medium text-gray-900">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    {/* Quantity and remove controls */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border rounded">
                        <button 
                          type="button"
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900"
                          onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                          disabled={loading}
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button 
                          type="button"
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={loading}
                        >
                          +
                        </button>
                      </div>
                      <button 
                        type="button"
                        className="text-sm text-red-600 hover:text-red-900"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={loading}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue shopping */}
            <div className="mt-6">
              <Link to="/" className="text-indigo-600 hover:text-indigo-500 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </motion.div>

          {/* Order summary */}
          <div className="mt-16 lg:mt-0 lg:col-span-4">
            <div className="bg-gray-50 rounded-lg py-6 px-6 lg:p-8 sticky top-6">
              <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="text-sm font-medium text-gray-900">${summary.subtotal.toFixed(2)}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Shipping</p>
                  <p className="text-sm font-medium text-gray-900">
                    {summary.shipping === 0 ? 'Free' : `$${summary.shipping.toFixed(2)}`}
                    {summary.subtotal < 50 && summary.shipping > 0 && (
                      <span className="block text-xs text-green-600 mt-1">
                        Add ${(50 - summary.subtotal).toFixed(2)} more for free shipping
                      </span>
                    )}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Tax</p>
                  <p className="text-sm font-medium text-gray-900">${summary.tax.toFixed(2)}</p>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-medium text-gray-900">Order total</p>
                    <p className="text-base font-medium text-gray-900">${summary.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 hidden md:block">
                <Link
                  to="/checkout"
                  className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
                >
                  Proceed to Checkout
                </Link>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>
                  Shipping and taxes calculated at checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fixed mobile checkout button */}
      <MobileCheckoutButton />
    </div>
  );
}; 