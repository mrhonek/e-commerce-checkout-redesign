import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentMethod {
  type: 'credit_card' | 'paypal' | 'apple_pay';
  cardNumber?: string;
  cardholderName?: string;
  expiryDate?: string;
  cvv?: string;
}

export type CheckoutStep = 'shipping' | 'billing' | 'payment' | 'review';

interface CheckoutState {
  currentStep: CheckoutStep;
  shippingAddress: ShippingAddress | null;
  billingAddress: ShippingAddress | null;
  sameAsShipping: boolean;
  paymentMethod: PaymentMethod | null;
  orderId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: CheckoutState = {
  currentStep: 'shipping',
  shippingAddress: null,
  billingAddress: null,
  sameAsShipping: true,
  paymentMethod: null,
  orderId: null,
  loading: false,
  error: null,
};

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<CheckoutStep>) => {
      state.currentStep = action.payload;
    },
    setShippingAddress: (state, action: PayloadAction<ShippingAddress>) => {
      state.shippingAddress = action.payload;
      
      // If sameAsShipping is true, update billing address as well
      if (state.sameAsShipping) {
        state.billingAddress = action.payload;
      }
    },
    setBillingAddress: (state, action: PayloadAction<ShippingAddress>) => {
      state.billingAddress = action.payload;
    },
    setSameAsShipping: (state, action: PayloadAction<boolean>) => {
      state.sameAsShipping = action.payload;
      
      // If true, copy shipping address to billing address
      if (action.payload && state.shippingAddress) {
        state.billingAddress = state.shippingAddress;
      }
    },
    setPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.paymentMethod = action.payload;
    },
    setOrderId: (state, action: PayloadAction<string>) => {
      state.orderId = action.payload;
    },
    setCheckoutLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCheckoutError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetCheckout: (state) => {
      state.currentStep = 'shipping';
      state.shippingAddress = null;
      state.billingAddress = null;
      state.sameAsShipping = true;
      state.paymentMethod = null;
      state.orderId = null;
      state.error = null;
    }
  }
});

export const {
  setCurrentStep,
  setShippingAddress,
  setBillingAddress,
  setSameAsShipping,
  setPaymentMethod,
  setOrderId,
  setCheckoutLoading,
  setCheckoutError,
  resetCheckout
} = checkoutSlice.actions;

export default checkoutSlice.reducer; 