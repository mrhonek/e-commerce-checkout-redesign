import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { clearCart, CartItem, CartSummary } from '../../store/slices/cartSlice';
import { setOrderId, resetCheckout, CheckoutStep } from '../../store/slices/checkoutSlice';
import { CheckoutStepper } from '../../components/checkout/CheckoutStepper';
import { ShippingForm } from '../../components/checkout/ShippingForm';
import { PaymentForm } from '../../components/checkout/PaymentForm';
import { OrderReview } from '../../components/checkout/OrderReview';
import { OrderConfirmation } from '../../components/checkout/OrderConfirmation';
import { AnimatedStep } from '../../components/animations/AnimatedStep';

export const CheckoutPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const checkout = useAppSelector(state => state.checkout);
  const cart = useAppSelector(state => state.cart);
  
  // Destructure with proper type assertions
  const { currentStep, shippingAddress, billingAddress, paymentMethod } = checkout;
  const { items, summary } = cart as { items: CartItem[], summary: CartSummary };
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setLocalOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [animationDirection, setAnimationDirection] = useState<'forward' | 'backward'>('forward');
  const [previousStep, setPreviousStep] = useState<CheckoutStep>('shipping');

  // Track step changes to determine animation direction
  useEffect(() => {
    if (currentStep === 'shipping') {
      setAnimationDirection('backward');
    } else if (currentStep === 'review' || (currentStep === 'payment' && previousStep === 'shipping')) {
      setAnimationDirection('forward');
    } else if (currentStep === 'payment' && previousStep === 'review') {
      setAnimationDirection('backward');
    }
    
    setPreviousStep(currentStep);
  }, [currentStep, previousStep]);

  // Handle placing the order
  const handlePlaceOrder = async () => {
    if (!shippingAddress || !paymentMethod) {
      setError('Missing required information. Please complete all checkout steps.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate API call to process order
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a random order ID
      const generatedOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Update local state and Redux store
      setLocalOrderId(generatedOrderId);
      dispatch(setOrderId(generatedOrderId));
      dispatch(clearCart());
      setOrderComplete(true);
    } catch (err) {
      setError('An error occurred while processing your order. Please try again.');
      console.error('Order processing error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle starting a new order
  const handleNewOrder = () => {
    dispatch(resetCheckout());
    setOrderComplete(false);
    setLocalOrderId(null);
    setError(null);
  };

  // If there are no items in the cart, show an empty cart message
  if (items.length === 0 && !orderComplete) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">
            Add some items to your cart before proceeding to checkout.
          </p>
          <a
            href="/"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {orderComplete && orderId ? (
        <OrderConfirmation orderId={orderId} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <CheckoutStepper className="mb-8" />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                  {error}
                </div>
              )}

              <div className="mt-8 relative overflow-hidden">
                <AnimatedStep 
                  isActive={currentStep === 'shipping'} 
                  direction={animationDirection}
                >
                  <ShippingForm />
                </AnimatedStep>
                
                <AnimatedStep 
                  isActive={currentStep === 'payment'} 
                  direction={animationDirection}
                >
                  <PaymentForm />
                </AnimatedStep>
                
                <AnimatedStep 
                  isActive={currentStep === 'review'} 
                  direction={animationDirection}
                >
                  <OrderReview onPlaceOrder={handlePlaceOrder} isLoading={isSubmitting} />
                </AnimatedStep>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-6">
              <h2 className="text-lg font-medium mb-4">Order Summary</h2>

              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex">
                        <span className="text-gray-500 mr-1">{item.quantity}x</span>
                        <span className="font-medium truncate max-w-[200px]">{item.name}</span>
                      </div>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${summary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>${summary.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span>${summary.tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between font-semibold text-lg mt-4 pt-4 border-t border-gray-200">
                <span>Total</span>
                <span>${summary.total.toFixed(2)}</span>
              </div>

              <div className="mt-6 text-sm text-gray-500">
                <div className="flex items-center mb-2">
                  <svg
                    className="w-4 h-4 mr-1 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Secure Checkout
                </div>
                <p>Your payment information is processed securely.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 