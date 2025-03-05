import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

interface OrderConfirmationProps {
  orderId: string;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ orderId }) => {
  const checkout = useAppSelector(state => state.checkout);
  const { shippingAddress } = checkout;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>
      
      <h1 className="text-center text-2xl font-bold text-gray-800 mb-2">
        Thank You for Your Order!
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Your order has been received and is being processed.
      </p>
      
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-sm font-semibold text-gray-600 uppercase">Order Number</h2>
            <p className="text-lg font-medium">{orderId}</p>
          </div>
          
          <div>
            <h2 className="text-sm font-semibold text-gray-600 uppercase">Order Date</h2>
            <p className="text-lg font-medium">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Order Details</h2>
        <p className="text-gray-600">
          A confirmation email has been sent to{' '}
          <span className="font-medium">{shippingAddress?.email}</span>.
        </p>
        <p className="text-gray-600 mt-2">
          You can track your order status in your account dashboard.
        </p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <h2 className="text-lg font-semibold mb-3">Shipping Information</h2>
        {shippingAddress && (
          <div className="text-gray-600">
            <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
            <p>{shippingAddress.address}</p>
            <p>
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
            </p>
            <p>{shippingAddress.country}</p>
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
        <Link
          to="/account/orders"
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-center"
        >
          View Order Status
        </Link>
        <Link
          to="/"
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-center"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}; 