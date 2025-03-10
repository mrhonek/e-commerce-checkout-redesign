import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckout } from '../contexts/CheckoutContext';
import { useCart } from '../contexts/CartContext';
import ShippingForm from '../components/checkout/ShippingForm';
import PaymentForm from '../components/checkout/PaymentForm';
import OrderReview from '../components/checkout/OrderReview';
import CheckoutSteps from '../components/checkout/CheckoutSteps';
import { Image } from '../components/ui/Image';

// Product image component which is now redundant - we'll use the Image component instead
const ProductImage = ({ item }: { item: any }) => {
  return <Image src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md" />;
};

const Checkout: React.FC = () => {
  const { state, loading, error, setStep } = useCheckout();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);

  // Add a loading timeout to ensure we don't hang indefinitely
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (loading) {
      timeoutId = setTimeout(() => {
        setTimeoutOccurred(true);
      }, 8000); // 8 second timeout
    } else {
      setTimeoutOccurred(false);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading]);

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart.items.length, navigate]);

  // Set the active step content based on the current step
  const renderStepContent = () => {
    switch (state.step) {
      case 'shipping':
        return <ShippingForm />;
      case 'payment':
        return <PaymentForm />;
      case 'review':
        return <OrderReview />;
      default:
        return <ShippingForm />;
    }
  };

  // Handle navigation when the checkout is complete
  useEffect(() => {
    if (state.step === 'confirmation' && state.orderId) {
      navigate(`/order-confirmation/${state.orderId}`);
    }
  }, [state.step, state.orderId, navigate]);

  // Show loading state
  if (loading && !timeoutOccurred) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // If loading takes too long, show a helpful message
  if (timeoutOccurred) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Taking longer than expected...</h2>
          <p className="mb-4">We're having trouble loading the checkout page. You can:</p>
          <ul className="list-disc list-inside mb-6 text-left inline-block">
            <li className="mb-2">Refresh the page and try again</li>
            <li className="mb-2">Check your internet connection</li>
            <li className="mb-2">Continue shopping and try again later</li>
          </ul>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Return to Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Checkout Steps Progress */}
      <CheckoutSteps currentStep={state.step} />
      
      {/* Main Content */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {renderStepContent()}
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="border-b pb-4 mb-4">
              <p className="text-gray-600 mb-2">Items ({cart.totalItems})</p>
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between mb-2 items-center">
                  <div className="flex items-center">
                    <ProductImage item={item} />
                    <span className="text-sm ml-2">{item.name} × {item.quantity}</span>
                  </div>
                  <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${state.orderSummary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {state.selectedShippingOption ? `$${state.orderSummary.shipping.toFixed(2)}` : 'To be calculated'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${state.orderSummary.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">${state.orderSummary.total.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Shipping Address Summary (if available) */}
            {state.step !== 'shipping' && state.shippingAddress && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h3>
                <address className="text-sm text-gray-600 not-italic">
                  {state.shippingAddress.firstName} {state.shippingAddress.lastName}<br />
                  {state.shippingAddress.address1}<br />
                  {state.shippingAddress.address2 && <>{state.shippingAddress.address2}<br /></>}
                  {state.shippingAddress.city}, {state.shippingAddress.state} {state.shippingAddress.postalCode}<br />
                  {state.shippingAddress.country}
                </address>
              </div>
            )}
            
            {/* Shipping Method Summary (if available) */}
            {state.step !== 'shipping' && state.selectedShippingOption && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Shipping Method</h3>
                <p className="text-sm text-gray-600">
                  {state.selectedShippingOption.name} ({state.selectedShippingOption.estimatedDelivery})
                </p>
              </div>
            )}
            
            {/* Payment Method Summary (if available) */}
            {state.step === 'review' && state.selectedPaymentMethod && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Payment Method</h3>
                <p className="text-sm text-gray-600">
                  {state.selectedPaymentMethod.name}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 