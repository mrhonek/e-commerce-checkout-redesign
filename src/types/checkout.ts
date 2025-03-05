// Shipping address form data
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
}

// Payment method form data
export interface PaymentMethod {
  cardholderName: string;
  cardNumber: string;
  cardExpiry: string;
  cvv: string;
  sameAsShipping: boolean;
  billingAddress?: ShippingAddress | null;
}

// Full checkout form data
export interface CheckoutFormData {
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
}

// Cart item data
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// Cart summary data
export interface CartSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

// Order data
export interface Order {
  id: string;
  items: CartItem[];
  summary: CartSummary;
  shippingAddress: ShippingAddress;
  paymentMethod: Omit<PaymentMethod, 'cvv'>; // Never store CVV
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
} 