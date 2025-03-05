import React, { useEffect, useState } from 'react';
import { Order, CartItem } from '../../services/api';

const OrderConfirmationPage: React.FC = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        
        // In a real app, we would get the order ID from the URL or state
        // For this example, we'll mock the order data
        const mockOrder: Order = {
          id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
          items: [
            {
              id: '1',
              productId: 'p1',
              name: 'Wireless Headphones',
              price: 129.99,
              quantity: 1,
              image: 'https://via.placeholder.com/150'
            },
            {
              id: '2',
              productId: 'p2',
              name: 'Smartphone Case',
              price: 24.99,
              quantity: 2,
              image: 'https://via.placeholder.com/150'
            }
          ],
          shippingAddress: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '(555) 123-4567',
            address: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345',
            country: 'US'
          },
          paymentMethod: 'Credit Card',
          subtotal: 179.97,
          tax: 14.40,
          shipping: 0,
          total: 194.37,
          status: 'processing',
          createdAt: new Date().toISOString()
        };
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setOrder(mockOrder);
        setError(null);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Could not load your order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-100 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-red-600 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-yellow-100 p-4 rounded-md">
          <p className="text-yellow-700">Order not found.</p>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-green-50 p-6 rounded-t-lg">
          <div className="flex items-center">
            <svg
              className="w-10 h-10 text-green-500 mr-4"
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
            <div>
              <h1 className="text-2xl font-bold text-green-600">Thank you for your order!</h1>
              <p className="text-green-600">
                Order #{order.id} has been confirmed and is being processed.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-b-lg p-6 border-t-0">
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <p className="text-gray-600 mb-2">Order Date: {formattedDate}</p>
            <p className="text-gray-600 mb-2">Order Status: <span className="font-medium capitalize">{order.status}</span></p>
            
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="font-medium mb-3">Items</h3>
              <div className="space-y-4">
                {order.items.map((item: CartItem) => (
                  <div key={item.id} className="flex justify-between">
                    <div className="flex items-center">
                      {item.image && (
                        <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded-md mr-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-center object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-lg font-semibold mb-3">Shipping Information</h2>
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="mt-2">{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.email}</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Payment Summary</h2>
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium mb-2">Payment Method: {order.paymentMethod}</p>
                
                <div className="space-y-1 border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between">
                    <p>Subtotal:</p>
                    <p>${order.subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Tax:</p>
                    <p>${order.tax.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Shipping:</p>
                    <p>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</p>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-gray-200 mt-2">
                    <p>Total:</p>
                    <p>${order.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between border-t border-gray-200 pt-6">
            <button
              onClick={() => {
                // In a real app, this would navigate to the order tracking page
                alert('Navigate to order tracking page');
              }}
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
            >
              Track Order
            </button>
            
            <button
              onClick={() => {
                // In a real app, this would navigate to the home page
                window.location.href = '/';
              }}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage; 