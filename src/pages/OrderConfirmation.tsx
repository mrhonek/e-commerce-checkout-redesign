import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { endpoints } from '../services/api';
import { CheckCircle } from 'lucide-react';

interface OrderDetails {
  _id: string;
  items: Array<{
    _id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  shipping: {
    address: {
      firstName: string;
      lastName: string;
      address1: string;
      address2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      email: string;
    };
    method: {
      name: string;
      price: number;
      estimatedDelivery: string;
    };
  };
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
  status: string;
  createdAt: string;
}

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      
      try {
        setLoading(true);
        const response = await endpoints.orders.getById(orderId);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || 'Order not found'}</p>
        </div>
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Format the date
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        <div className="bg-green-50 text-green-800 rounded-lg p-6 mb-8 text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
        </div>
        
        {/* Order Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Order #{order._id.substring(0, 8)}</h2>
            <p className="text-gray-600">Placed on {orderDate}</p>
          </div>
          
          <div className="border-t border-b py-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">Items</h3>
            {order.items.map((item) => (
              <div key={item._id} className="flex justify-between py-2">
                <div className="flex items-start">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded mr-4" />
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
          
          {/* Totals */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>${order.totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>${order.totals.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span>${order.totals.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total</span>
              <span>${order.totals.total.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Shipping Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
              <address className="not-italic text-gray-600">
                {order.shipping.address.firstName} {order.shipping.address.lastName}<br />
                {order.shipping.address.address1}<br />
                {order.shipping.address.address2 && <>{order.shipping.address.address2}<br /></>}
                {order.shipping.address.city}, {order.shipping.address.state} {order.shipping.address.postalCode}<br />
                {order.shipping.address.country}
              </address>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Shipping Method</h3>
              <p className="text-gray-600">{order.shipping.method.name}</p>
              <p className="text-gray-600">Estimated delivery: {order.shipping.method.estimatedDelivery}</p>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="flex justify-center space-x-4">
          <Link
            to="/orders"
            className="px-6 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition duration-300"
          >
            View All Orders
          </Link>
          <Link
            to="/"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 