import React from 'react';
import { useCheckout } from '../../contexts/CheckoutContext';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/formatters';

const OrderReview: React.FC = () => {
  const { state, loading, error, placeOrder, setStep } = useCheckout();
  const { cart } = useCart();

  // Calculate tax (assuming tax is 8.5% of subtotal)
  const taxRate = 0.085;
  const calculatedTax = cart.subtotal * taxRate;
  
  // Calculate total
  const total = cart.subtotal + (state.selectedShippingOption?.price || 0) + calculatedTax;

  const handleBack = () => {
    setStep('payment');
  };

  const handleSubmitOrder = async () => {
    await placeOrder();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const { shippingAddress, selectedShippingOption, selectedPaymentMethod } = state;

  // Ensure we have all required data before showing the review
  if (!shippingAddress || !selectedShippingOption || !selectedPaymentMethod || !cart.items.length) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div>
            <p className="text-sm text-yellow-700">
              Please complete all previous steps before reviewing your order.
            </p>
            <button
              onClick={() => shippingAddress ? setStep('payment') : setStep('shipping')}
              className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-600"
            >
              Go back to {shippingAddress ? 'payment' : 'shipping'} step
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Review Your Order</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
        
        <div className="divide-y divide-gray-200">
          {/* Order Items */}
          <div className="py-4">
            <h4 className="text-md font-medium mb-2">Items ({cart.totalItems})</h4>
            <ul className="space-y-3">
              {cart.items.map((item) => (
                <li key={item.productId} className="flex justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-10 h-10 overflow-hidden rounded-md flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Cost Summary */}
          <div className="py-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-sm font-medium">{formatCurrency(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Shipping</span>
              <span className="text-sm font-medium">
                {formatCurrency(selectedShippingOption.price)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Tax</span>
              <span className="text-sm font-medium">{formatCurrency(calculatedTax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold mt-4">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Shipping Information */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h4>
              <div className="text-sm text-gray-600">
                <p className="font-medium">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                <p>{shippingAddress.address1}</p>
                {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
                <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                <p>{shippingAddress.country}</p>
                <p className="mt-1">{shippingAddress.phone}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Shipping Method</h4>
              <div className="text-sm text-gray-600">
                <p className="font-medium">{selectedShippingOption.name}</p>
                <p>{selectedShippingOption.description}</p>
                <p className="font-medium mt-1">{formatCurrency(selectedShippingOption.price)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Information */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Method</h4>
          <div className="text-sm text-gray-600">
            <p className="font-medium">{selectedPaymentMethod.name}</p>
            {selectedPaymentMethod.type === 'credit_card' && selectedPaymentMethod.cardDetails && (
              <p>Card ending in {selectedPaymentMethod.cardDetails.last4 || '****'}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Payment
        </button>
        
        <button
          type="button"
          onClick={handleSubmitOrder}
          disabled={loading}
          className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default OrderReview; 