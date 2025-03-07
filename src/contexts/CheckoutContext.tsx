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

// Create provider component
export const CheckoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { cart } = useCart();

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
    // If payment methods already exist, don't fetch again
    if (state.paymentMethods.length > 0) {
      return state.paymentMethods;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent hanging if API doesn't respond
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout
      
      const response = await endpoints.payment.getMethods();
      
      clearTimeout(timeoutId);
      
      // Provide default options if none are returned
      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        const defaultPaymentMethods: PaymentMethod[] = [
          {
            _id: 'credit_card',
            type: 'credit_card',
            name: 'Credit / Debit Card',
            description: 'Pay securely with your card'
          },
          {
            _id: 'paypal',
            type: 'paypal',
            name: 'PayPal',
            description: 'Fast and secure checkout with PayPal'
          }
        ];
        dispatch({ type: 'SET_PAYMENT_METHODS', payload: defaultPaymentMethods });
        return defaultPaymentMethods;
      }
      
      dispatch({ type: 'SET_PAYMENT_METHODS', payload: response.data });
      return response.data;
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setError('Failed to load payment methods');
      
      // Provide default payment methods on error
      const defaultPaymentMethods: PaymentMethod[] = [
        {
          _id: 'credit_card',
          type: 'credit_card',
          name: 'Credit / Debit Card',
          description: 'Pay securely with your card'
        },
        {
          _id: 'paypal',
          type: 'paypal',
          name: 'PayPal',
          description: 'Fast and secure checkout with PayPal'
        }
      ];
      dispatch({ type: 'SET_PAYMENT_METHODS', payload: defaultPaymentMethods });
      return defaultPaymentMethods;
    } finally {
      setLoading(false);
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
    if (!state.shippingAddress || !state.billingAddress || !state.selectedShippingOption || !state.paymentIntent) {
      setError('Missing required checkout information');
      return undefined;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const orderData = {
        items: cart.items,
        shipping: {
          address: state.shippingAddress,
          method: state.selectedShippingOption
        },
        billing: {
          address: state.billingAddress,
          paymentIntent: state.paymentIntent
        },
        totals: state.orderSummary
      };
      
      const response = await endpoints.orders.create(orderData);
      const orderId = response.data._id;
      
      dispatch({ type: 'SET_ORDER_ID', payload: orderId });
      dispatch({ type: 'SET_STEP', payload: 'confirmation' });
      
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