import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { endpoints } from '../services/api';
import { CheckCircle, Truck, Calendar } from 'lucide-react';
import { Image } from '../components/ui/Image';

// Updated interface to match the actual API response
interface OrderDetails {
  _id?: string;
  id?: string;
  orderNumber?: string;
  items: Array<{
    _id?: string;
    id?: string;
    productId?: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    email: string;
  };
  shippingMethod?: {
    id: string;
    name: string;
    price: number;
    estimatedDays: string;
  };
  shipping?: {
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
  paymentMethod?: string;
  subtotal?: number;
  tax?: number;
  shippingCost?: number;
  total?: number;
  totals?: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
  status: string;
  createdAt: string;
}

// Helper function to safely get order ID for display
const getOrderDisplayId = (order: OrderDetails): string => {
  // First try orderNumber property
  if (order.orderNumber) {
    return order.orderNumber;
  }
  
  // Then try _id property
  if (order._id) {
    return order._id.substring(0, 8);
  }
  
  // Then try id property
  if (order.id) {
    return order.id.substring(0, 8);
  }
  
  // Fallback to a placeholder
  return 'ORD12345';
};

// Helper function to safely get item key for keys
const getItemKey = (item: any, index: number): string => {
  if (item._id) return item._id;
  if (item.id) return item.id;
  if (item.productId) return item.productId;
  return `item-${index}`;
};

// Helper function to get subtotal
const getSubtotal = (order: OrderDetails): number => {
  if (order.subtotal) return order.subtotal;
  if (order.totals?.subtotal) return order.totals.subtotal;
  return 0;
};

// Helper function to get tax
const getTax = (order: OrderDetails): number => {
  if (order.tax) return order.tax;
  if (order.totals?.tax) return order.totals.tax;
  return 0;
};

// Helper function to get shipping cost
const getShipping = (order: OrderDetails): number => {
  if (order.shippingCost) return order.shippingCost;
  if (order.totals?.shipping) return order.totals.shipping;
  if (order.shippingMethod?.price) return order.shippingMethod.price;
  if (order.shipping?.method?.price) return order.shipping.method.price;
  return 0;
};

// Helper function to get total
const getTotal = (order: OrderDetails): number => {
  if (order.total) return order.total;
  if (order.totals?.total) return order.totals.total;
  return getSubtotal(order) + getTax(order) + getShipping(order);
};

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Format the order date for display
  const orderDate = order?.createdAt 
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) 
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      
      try {
        setLoading(true);
        
        // First try to get order from localStorage (our actual order data)
        const storedOrderData = localStorage.getItem(`order_${orderId}`);
        
        if (storedOrderData) {
          const parsedOrder = JSON.parse(storedOrderData);
          console.log('Using stored order data:', parsedOrder);
          setOrder(parsedOrder);
          setLoading(false);
          return;
        }
        
        // Fallback to API if localStorage doesn't have the data
        console.log('No stored order found, fetching from API...');
        const response = await endpoints.orders.getById(orderId);
        console.log('Order API response:', response.data);
        
        // Handle different response structures
        const orderData = response.data.order || response.data;
        setOrder(orderData);
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

  // Get shipping address from either structure
  const shippingAddress = order.shippingAddress || (order.shipping?.address ? {
    firstName: order.shipping.address.firstName,
    lastName: order.shipping.address.lastName,
    street: order.shipping.address.address1,
    city: order.shipping.address.city,
    state: order.shipping.address.state,
    zipCode: order.shipping.address.postalCode,
    country: order.shipping.address.country,
    email: order.shipping.address.email
  } : null);

  // Get shipping method from either structure
  const shippingMethod = order.shippingMethod || (order.shipping?.method ? {
    id: 'shipping-method',
    name: order.shipping.method.name,
    price: order.shipping.method.price,
    estimatedDays: order.shipping.method.estimatedDelivery
  } : null);

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
            <h2 className="text-xl font-bold">Order #{order && getOrderDisplayId(order)}</h2>
            <p className="text-gray-600">Placed on {orderDate}</p>
          </div>
          
          <div className="border-t border-b py-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">Items</h3>
            {order && order.items.map((item, index) => (
              <div key={getItemKey(item, index)} className="flex justify-between py-2">
                <div className="flex items-start">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded mr-4" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded mr-4 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">No image</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                    {item.productId && item.productId.length > 0 && (
                      <p className="text-gray-500 text-xs">SKU: {item.productId.substring(0, 8)}</p>
                    )}
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
              <span>${getSubtotal(order).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>${getShipping(order).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span>${getTax(order).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>${getTotal(order).toFixed(2)}</span>
            </div>
          </div>
          
          {/* Shipping Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
              {shippingAddress && (
                <address className="not-italic">
                  {shippingAddress.firstName} {shippingAddress.lastName}<br />
                  {shippingAddress.street}<br />
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
                  {shippingAddress.country}
                </address>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Shipping Method</h3>
              {shippingMethod && (
                <div className="flex items-start">
                  <Truck className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">{shippingMethod.name}</p>
                    <p className="text-gray-600 text-sm flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Estimated delivery: {shippingMethod.estimatedDays}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Have questions about your order? Please check our <Link to="/faq" className="text-blue-600 hover:underline">FAQ</Link> or <Link to="/contact" className="text-blue-600 hover:underline">contact us</Link>.
          </p>
          <Link to="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 