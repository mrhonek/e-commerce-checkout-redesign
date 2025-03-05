import * as yup from 'yup';

// Common validation patterns
const PHONE_REGEX = /^(\+\d{1,3})?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const CARD_NUMBER_REGEX = /^(\d{4}\s?){3}\d{4}$/;
const CARD_EXPIRY_REGEX = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
const CVV_REGEX = /^[0-9]{3,4}$/;
const ZIP_CODE_REGEX = /^\d{5}(-\d{4})?$/;

// Shipping address schema
export const shippingAddressSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zipCode: yup
    .string()
    .required('ZIP code is required')
    .matches(ZIP_CODE_REGEX, 'Invalid ZIP code format'),
  country: yup.string().required('Country is required'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(PHONE_REGEX, 'Invalid phone number format'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format'),
});

// Payment method schema
export const paymentMethodSchema = yup.object({
  type: yup.string().oneOf(['credit_card', 'paypal', 'apple_pay']).required('Payment type is required'),
  cardholderName: yup.string().when('type', {
    is: 'credit_card',
    then: (schema) => schema.required('Cardholder name is required'),
    otherwise: (schema) => schema.optional(),
  }),
  cardNumber: yup.string().when('type', {
    is: 'credit_card',
    then: (schema) => schema.required('Card number is required').matches(CARD_NUMBER_REGEX, 'Invalid card number format'),
    otherwise: (schema) => schema.optional(),
  }),
  expiryDate: yup.string().when('type', {
    is: 'credit_card',
    then: (schema) => schema.required('Expiration date is required').matches(CARD_EXPIRY_REGEX, 'Invalid expiration date format (MM/YY)'),
    otherwise: (schema) => schema.optional(),
  }),
  cvv: yup.string().when('type', {
    is: 'credit_card',
    then: (schema) => schema.required('CVV is required').matches(CVV_REGEX, 'Invalid CVV format'),
    otherwise: (schema) => schema.optional(),
  }),
});

// Full checkout schema
export const checkoutSchema = yup.object({
  shippingAddress: shippingAddressSchema,
  billingAddress: yup.lazy((value) => (value ? shippingAddressSchema : yup.mixed().notRequired())),
  paymentMethod: paymentMethodSchema,
}); 