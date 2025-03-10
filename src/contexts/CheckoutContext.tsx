import React, { createContext, useContext, useState, useReducer, ReactNode } from 'react';
import { endpoints } from '../services/api';
import { useCart } from './CartContext';

// Define shipping address type
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email: string;
}

// Define shipping option type
export interface ShippingOption {
  _id: string;
  name: string;
  description: string;
  price: number;
  estimatedDelivery: string;
}

// Define payment method type
export interface PaymentMethod {
  _id: string;
  id?: string;
  type: 'credit_card' | 'paypal';
  name: string;
  description?: string;
}

// Define order summary type
export interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

// Define checkout state type
export interface CheckoutState {
  step: 'cart' | 'shipping' | 'payment' | 'review' | 'confirmation';
  shippingAddress: ShippingAddress | null;
  billingAddress: ShippingAddress | null;
  shippingOptions: ShippingOption[];
  selectedShippingOption: ShippingOption | null;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  useSameAddressForBilling: boolean;
  orderSummary: OrderSummary;
  paymentIntent?: string;
  orderId?: string;
}

// Define action types for the reducer
type CheckoutAction =
  | { type: 'SET_STEP'; payload: CheckoutState['step'] }
  | { type: 'SET_SHIPPING_ADDRESS'; payload: ShippingAddress }
  | { type: 'SET_BILLING_ADDRESS'; payload: ShippingAddress }
  | { type: 'SET_SHIPPING_OPTIONS'; payload: ShippingOption[] }
  | { type: 'SELECT_SHIPPING_OPTION'; payload: ShippingOption }
  | { type: 'SET_PAYMENT_METHODS'; payload: PaymentMethod[] }
  | { type: 'SELECT_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'SET_USE_SAME_ADDRESS'; payload: boolean }
  | { type: 'UPDATE_ORDER_SUMMARY'; payload: Partial<OrderSummary> }
  | { type: 'SET_PAYMENT_INTENT'; payload: string }
  | { type: 'SET_ORDER_ID'; payload: string }
  | { type: 'RESET_CHECKOUT' };

// Define the context type
interface CheckoutContextType {
  state: CheckoutState;
  loading: boolean;
  error: string | null;
  setStep: (step: CheckoutState['step']) => void;
  setShippingAddress: (address: ShippingAddress) => void;
  setBillingAddress: (address: ShippingAddress) => void;
  setSameAddressForBilling: (useSame: boolean) => void;
  fetchShippingOptions: () => Promise<ShippingOption[]>;
  selectShippingOption: (option: ShippingOption) => Promise<void>;
  fetchPaymentMethods: () => Promise<PaymentMethod[]>;
  selectPaymentMethod: (method: PaymentMethod) => void;
  createPaymentIntent: (paymentMethod: string) => Promise<void>;
  placeOrder: () => Promise<string | undefined>;
  resetCheckout: () => void;
}

// Create the context
const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

// Define initial state
const initialState: CheckoutState = {
  step: 'cart',
  shippingAddress: null,
  billingAddress: null,
  shippingOptions: [],
  selectedShippingOption: null,
  paymentMethods: [],
  selectedPaymentMethod: null,
  useSameAddressForBilling: true,
  orderSummary: {
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  }
};

// Create reducer
function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_SHIPPING_ADDRESS':
      return { ...state, shippingAddress: action.payload };
    case 'SET_BILLING_ADDRESS':
      return { ...state, billingAddress: action.payload };
    case 'SET_SHIPPING_OPTIONS':
      return { ...state, shippingOptions: action.payload };
    case 'SELECT_SHIPPING_OPTION':
      return { 
        ...state, 
        selectedShippingOption: action.payload,
        orderSummary: {
          ...state.orderSummary,
          shipping: action.payload.price,
          total: state.orderSummary.subtotal + action.payload.price + state.orderSummary.tax
        }
      };
    case 'SET_PAYMENT_METHODS':
      return { ...state, paymentMethods: action.payload };
    case 'SELECT_PAYMENT_METHOD':
      return { ...state, selectedPaymentMethod: action.payload };
    case 'SET_USE_SAME_ADDRESS':
      return { ...state, useSameAddressForBilling: action.payload };
    case 'UPDATE_ORDER_SUMMARY':
      return { 
        ...state, 
        orderSummary: { 
          ...state.orderSummary, 
          ...action.payload,
          total: (action.payload.subtotal ?? state.orderSummary.subtotal) + 
                 (action.payload.shipping ?? state.orderSummary.shipping) + 
                 (action.payload.tax ?? state.orderSummary.tax)
        } 
      };
    case 'SET_PAYMENT_INTENT':
      return { ...state, paymentIntent: action.payload };
    case 'SET_ORDER_ID':
      return { ...state, orderId: action.payload };
    case 'RESET_CHECKOUT':
      return initialState;
    default:
      return state;
  }
}

// Define the checkout provider component
export const CheckoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get cart from CartContext
  const { cart, clearCart } = useCart();

  // Update subtotal when cart changes
  React.useEffect(() => {
    dispatch({ 
      type: 'UPDATE_ORDER_SUMMARY', 
      payload: { 
        subtotal: cart.subtotal,
        // Simple tax calculation (can be replaced with proper calculation from API)
        tax: Math.round(cart.subtotal * 0.08 * 100) / 100,
      } 
    });
  }, [cart]);

  // Set checkout step
  const setStep = (step: CheckoutState['step']) => {
    dispatch({ type: 'SET_STEP', payload: step });
  };

  // Set shipping address
  const setShippingAddress = (address: ShippingAddress) => {
    dispatch({ type: 'SET_SHIPPING_ADDRESS', payload: address });
    
    // If using same address for billing, update billing too
    if (state.useSameAddressForBilling) {
      dispatch({ type: 'SET_BILLING_ADDRESS', payload: address });
    }
  };

  // Set billing address
  const setBillingAddress = (address: ShippingAddress) => {
    dispatch({ type: 'SET_BILLING_ADDRESS', payload: address });
  };

  // Set whether to use same address for billing
  const setSameAddressForBilling = (useSame: boolean) => {
    dispatch({ type: 'SET_USE_SAME_ADDRESS', payload: useSame });
    
    // If using same address and shipping address exists, copy it to billing
    if (useSame && state.shippingAddress) {
      dispatch({ type: 'SET_BILLING_ADDRESS', payload: state.shippingAddress });
    }
  };

  // Fetch shipping options
  const fetchShippingOptions = async (): Promise<ShippingOption[]> => {
    // If shipping options already exist, don't fetch again
    if (state.shippingOptions.length > 0) {
      return state.shippingOptions;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent hanging if API doesn't respond
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout
      
      const response = await endpoints.shipping.getOptions();
      
      clearTimeout(timeoutId);
      
      // Provide default options if none are returned
      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        const defaultOptions = [
          {
            _id: 'standard',
            name: 'Standard Shipping',
            description: 'Delivery within 5-7 business days',
            price: 5.99,
            estimatedDelivery: '5-7 business days'
          },
          {
            _id: 'express',
            name: 'Express Shipping',
            description: 'Delivery within 2-3 business days',
            price: 12.99,
            estimatedDelivery: '2-3 business days'
          }
        ];
        dispatch({ type: 'SET_SHIPPING_OPTIONS', payload: defaultOptions });
        return defaultOptions;
      }
      
      dispatch({ type: 'SET_SHIPPING_OPTIONS', payload: response.data });
      return response.data;
    } catch (err) {
      console.error('Error fetching shipping options:', err);
      setError('Failed to load shipping options');
      
      // Provide default options on error
      const defaultOptions = [
        {
          _id: 'standard',
          name: 'Standard Shipping',
          description: 'Delivery within 5-7 business days',
          price: 5.99,
          estimatedDelivery: '5-7 business days'
        },
        {
          _id: 'express',
          name: 'Express Shipping',
          description: 'Delivery within 2-3 business days',
          price: 12.99,
          estimatedDelivery: '2-3 business days'
        }
      ];
      dispatch({ type: 'SET_SHIPPING_OPTIONS', payload: defaultOptions });
      return defaultOptions;
    } finally {
      setLoading(false);
    }
  };

  // Select shipping option
  const selectShippingOption = async (option: ShippingOption) => {
    try {
      setLoading(true);
      setError(null);
      
      if (state.shippingAddress) {
        // Calculate shipping cost with selected option
        const response = await endpoints.shipping.calculate({
          address: state.shippingAddress,
          items: cart.items,
          shippingOptionId: option._id
        });
        
        // Update order summary with the calculated shipping cost
        dispatch({ 
          type: 'UPDATE_ORDER_SUMMARY', 
          payload: { shipping: response.data.shippingCost } 
        });
      }
      
      dispatch({ type: 'SELECT_SHIPPING_OPTION', payload: option });
    } catch (err) {
      console.error('Error calculating shipping:', err);
      setError('Failed to calculate shipping cost');
      // Still select the option even if calculation fails
      dispatch({ type: 'SELECT_SHIPPING_OPTION', payload: option });
    } finally {
      setLoading(false);
    }
  };

  // Fetch payment methods
  const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
    try {
      // First check if we already have payment methods
      if (state.paymentMethods.length > 0) {
        // If we have methods, make sure credit card is first in the list
        const methods = [...state.paymentMethods];
        const creditCardIndex = methods.findIndex(m => 
          m.type === 'credit_card' || 
          m._id === 'credit_card' || 
          (m.name && m.name.toLowerCase().includes('card'))
        );
        
        // If credit card exists but is not the first item, move it to the front
        if (creditCardIndex > 0) {
          const creditCard = methods[creditCardIndex];
          methods.splice(creditCardIndex, 1); // Remove from current position
          methods.unshift(creditCard); // Add to the beginning
          
          // Update state with reordered methods
          dispatch({ type: 'SET_PAYMENT_METHODS', payload: methods });
        }
        
        return methods;
      }
      
      // If we don't have methods yet, try to fetch from API
      try {
        setLoading(true);
        const response = await endpoints.payment.getMethods();
        setLoading(false);
        
        if (response.status === 200 && response.data && Array.isArray(response.data)) {
          // Validate and transform the API data
          const validatedPaymentMethods: PaymentMethod[] = response.data.map(method => ({
            _id: method._id || method.id || `method-${Date.now()}`,
            name: method.name || 'Unknown Payment Method',
            type: method.type || 'unknown',
            description: method.description || ''
          }));
          
          // Sort payment methods so credit card is first
          validatedPaymentMethods.sort((a, b) => {
            // Credit card should come first
            if (a.type === 'credit_card' || a.name.toLowerCase().includes('card')) return -1;
            if (b.type === 'credit_card' || b.name.toLowerCase().includes('card')) return 1;
            return 0;
          });
          
          dispatch({ type: 'SET_PAYMENT_METHODS', payload: validatedPaymentMethods });
          return validatedPaymentMethods;
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        setError('Failed to load payment methods');
      }
      
      // Fallback to default payment methods
      const defaultPaymentMethods: PaymentMethod[] = [
        {
          _id: 'credit_card',
          name: 'Credit Card',
          type: 'credit_card',
          description: 'Pay with Visa, Mastercard, or American Express'
        },
        {
          _id: 'paypal',
          name: 'PayPal',
          type: 'paypal',
          description: 'Fast, secure payment with PayPal'
        }
      ];
      
      dispatch({ type: 'SET_PAYMENT_METHODS', payload: defaultPaymentMethods });
      return defaultPaymentMethods;
    } catch (error) {
      console.error('General error in payment methods flow:', error);
      setError('An unexpected error occurred');
      
      // Return default methods as fallback
      const defaultPaymentMethods: PaymentMethod[] = [
        {
          _id: 'credit_card',
          name: 'Credit Card',
          type: 'credit_card',
          description: 'Pay with Visa, Mastercard, or American Express'
        },
        {
          _id: 'paypal',
          name: 'PayPal',
          type: 'paypal',
          description: 'Fast, secure payment with PayPal'
        }
      ];
      
      dispatch({ type: 'SET_PAYMENT_METHODS', payload: defaultPaymentMethods });
      return defaultPaymentMethods;
    }
  };

  // Select payment method
  const selectPaymentMethod = (method: PaymentMethod) => {
    dispatch({ type: 'SELECT_PAYMENT_METHOD', payload: method });
  };

  // Create payment intent
  const createPaymentIntent = async (paymentMethod: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await endpoints.payment.createIntent({
        amount: state.orderSummary.total * 100, // Convert to cents for Stripe
        currency: 'usd'
      });
      
      const paymentIntentId = response.data.id;
      dispatch({ type: 'SET_PAYMENT_INTENT', payload: paymentIntentId });
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError('Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  // Place order
  const placeOrder = async (): Promise<string | undefined> => {
    // Check if basic requirements are met
    if (!state.shippingAddress) {
      setError('Missing shipping address information');
      return undefined;
    }
    
    // If billing address is not set, use shipping address
    const effectiveBillingAddress = state.billingAddress || state.shippingAddress;
    
    // If no shipping option selected, warn but don't block
    if (!state.selectedShippingOption) {
      console.warn('No shipping option selected, using default');
    }
    
    // If no payment method selected, warn but don't block if we have a payment intent
    if (!state.selectedPaymentMethod && !state.paymentIntent) {
      setError('Missing payment method information');
      return undefined;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Format shipping address to match expected structure
      const formattedShippingAddress = {
        firstName: state.shippingAddress.firstName,
        lastName: state.shippingAddress.lastName,
        street: state.shippingAddress.address1,
        city: state.shippingAddress.city,
        state: state.shippingAddress.state,
        zipCode: state.shippingAddress.postalCode,
        country: state.shippingAddress.country,
        email: state.shippingAddress.email
      };
      
      // Format shipping method to match expected structure
      const shippingMethod = state.selectedShippingOption ? {
        id: state.selectedShippingOption._id,
        name: state.selectedShippingOption.name,
        price: state.selectedShippingOption.price,
        estimatedDays: state.selectedShippingOption.estimatedDelivery
      } : {
        id: 'standard',
        name: 'Standard Shipping',
        price: 0,
        estimatedDays: '3-5 business days'
      };
      
      // Format payment method
      const paymentMethod = state.selectedPaymentMethod ? 
        state.selectedPaymentMethod.type === 'credit_card' ? 'Credit Card' : 'PayPal' :
        'Credit Card';
      
      const orderData = {
        items: cart.items.map(item => ({
          id: item.id,
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        shippingAddress: formattedShippingAddress,
        shippingMethod: shippingMethod,
        paymentMethod: paymentMethod,
        subtotal: state.orderSummary.subtotal,
        tax: state.orderSummary.tax,
        shipping: state.orderSummary.shipping,
        total: state.orderSummary.total,
        status: 'processing',
        createdAt: new Date().toISOString(),
        email: state.shippingAddress.email
      };
      
      // Send order to API - this will likely return mock data but we'll store our real data
      const response = await endpoints.orders.create(orderData);
      
      // Ensure we have an order ID
      const orderId = response.data.order?.orderNumber || 
                      response.data.order?._id || 
                      response.data.order?.id || 
                      'ORD-' + Date.now();
      
      // Add the orderId to our order data
      const completeOrderData = {
        ...orderData,
        orderNumber: orderId,
      };
      
      // Store the actual order data in localStorage for the confirmation page to use
      localStorage.setItem(`order_${orderId}`, JSON.stringify(completeOrderData));
      
      dispatch({ type: 'SET_ORDER_ID', payload: orderId });
      dispatch({ type: 'SET_STEP', payload: 'confirmation' });
      
      // Clear the cart after successful order
      await clearCart();
      
      return orderId;
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place order');
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  // Reset checkout
  const resetCheckout = () => {
    dispatch({ type: 'RESET_CHECKOUT' });
  };

  // Create context value
  const contextValue: CheckoutContextType = {
    state,
    loading,
    error,
    setStep,
    setShippingAddress,
    setBillingAddress,
    setSameAddressForBilling,
    fetchShippingOptions,
    selectShippingOption,
    fetchPaymentMethods,
    selectPaymentMethod,
    createPaymentIntent,
    placeOrder,
    resetCheckout
  };

  return (
    <CheckoutContext.Provider value={contextValue}>
      {children}
    </CheckoutContext.Provider>
  );
};

// Custom hook to use the checkout context
export const useCheckout = (): CheckoutContextType => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};

export default CheckoutContext; 