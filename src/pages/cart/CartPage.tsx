import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { updateCartItemQuantity, removeCartItem, CartItem, CartSummary } from '../../store/slices/cartSlice';
import { motion } from 'framer-motion';

export const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(state => state.cart);
  const { items, summary } = cart as { items: CartItem[], summary: CartSummary };
  const { loading, error } = cart as { loading: boolean, error: string | null };

  // Update item quantity
  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch(updateCartItemQuantity({ id, quantity }));
  };

  // Remove item from cart
  const handleRemoveItem = (id: string) => {
    dispatch(removeCartItem(id));
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
            <div className="border-t border-b border-gray-200 divide-y divide-gray-200">
              {items.map((item) => (
                <motion.div 
                  key={item.id} 
                  className="py-6 sm:flex"
                  variants={itemVariants}
                >
                  <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-md overflow-hidden sm:w-32 sm:h-32 mx-auto sm:mx-0">
                    <img
                      src={item.image || 'https://via.placeholder.com/150'}
                      alt={item.name}
                      className="w-full h-full object-center object-cover"
                    />
                  </div>

                  <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <h2 className="text-lg font-medium text-gray-900 text-center sm:text-left">
                        {item.name}
                      </h2>
                      <p className="text-lg font-medium text-gray-900 text-center sm:text-right mt-2 sm:mt-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 text-center sm:text-left">${item.price.toFixed(2)} each</p>
                    
                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between sm:justify-start gap-4">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50"
                          aria-label="Decrease quantity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="px-4 py-2 text-gray-700">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          aria-label="Increase quantity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-indigo-600 hover:text-indigo-500 focus:outline-none flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
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