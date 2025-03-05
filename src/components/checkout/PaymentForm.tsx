import React, { useState, useEffect } from 'react';
import { useCheckout, PaymentMethod } from '../../contexts/CheckoutContext';
import { CreditCard, Check } from 'lucide-react';

interface CardDetails {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

const PaymentForm: React.FC = () => {
  const { 
    state, 
    loading, 
    error, 
    fetchPaymentMethods, 
    selectPaymentMethod, 
    setStep 
  } = useCheckout();

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  // Fetch payment methods when component mounts
  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    selectPaymentMethod(method);
    // Clear previous errors
    setFormErrors({});
  };

  const handleCardDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\s/g, '')
        .replace(/(.{4})/g, '$1 ')
        .trim()
        .slice(0, 19); // limit to 16 digits + 3 spaces
      
      setCardDetails(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } 
    // Format expiry date
    else if (name === 'expiryDate') {
      const cleanValue = value.replace(/\D/g, '');
      let formattedValue = cleanValue;
      
      if (cleanValue.length > 2) {
        formattedValue = `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}`;
      }
      
      setCardDetails(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    }
    // Regular input for other fields
    else {
      setCardDetails(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate selected payment method
    if (!state.selectedPaymentMethod) {
      errors.paymentMethod = 'Please select a payment method';
      setFormErrors(errors);
      return false;
    }
    
    // If credit card payment method is selected, validate card details
    if (state.selectedPaymentMethod.type === 'credit_card') {
      if (!cardDetails.cardNumber.trim()) {
        errors.cardNumber = 'Card number is required';
      } else if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
        errors.cardNumber = 'Invalid card number';
      }
      
      if (!cardDetails.cardHolder.trim()) {
        errors.cardHolder = 'Cardholder name is required';
      }
      
      if (!cardDetails.expiryDate.trim()) {
        errors.expiryDate = 'Expiration date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
        errors.expiryDate = 'Invalid expiration date (MM/YY)';
      }
      
      if (!cardDetails.cvv.trim()) {
        errors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
        errors.cvv = 'Invalid CVV';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBack = () => {
    setStep('shipping');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Proceed to review
    setStep('review');
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Payment Methods */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Payment Method</h3>
          
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {state.paymentMethods.map((method) => (
                <div
                  key={method._id}
                  className={`border rounded-md p-4 cursor-pointer transition-colors ${
                    state.selectedPaymentMethod?._id === method._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                  onClick={() => handlePaymentMethodChange(method)}
                >
                  <div className="flex items-center">
                    <input
                      id={method._id}
                      type="radio"
                      name="paymentMethod"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={state.selectedPaymentMethod?._id === method._id}
                      onChange={() => handlePaymentMethodChange(method)}
                    />
                    <label htmlFor={method._id} className="ml-3 flex items-center cursor-pointer">
                      {method.type === 'credit_card' ? (
                        <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                      ) : (
                        <Check className="h-5 w-5 text-gray-400 mr-2" />
                      )}
                      <span className="font-medium">{method.name}</span>
                    </label>
                  </div>
                  {method.description && (
                    <p className="mt-2 text-sm text-gray-500 ml-7">{method.description}</p>
                  )}
                </div>
              ))}
              
              {formErrors.paymentMethod && (
                <p className="text-sm text-red-600 mt-1">{formErrors.paymentMethod}</p>
              )}
            </div>
          )}
        </div>
        
        {/* Credit Card Details (shown only if credit card method is selected) */}
        {state.selectedPaymentMethod?.type === 'credit_card' && (
          <div className="mb-8 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Card Details</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                  Card Number
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={handleCardDetailsChange}
                  maxLength={19}
                  className={`mt-1 block w-full border ${
                    formErrors.cardNumber ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {formErrors.cardNumber && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.cardNumber}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  id="cardHolder"
                  name="cardHolder"
                  placeholder="John Doe"
                  value={cardDetails.cardHolder}
                  onChange={handleCardDetailsChange}
                  className={`mt-1 block w-full border ${
                    formErrors.cardHolder ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {formErrors.cardHolder && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.cardHolder}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                    Expiration Date (MM/YY)
                  </label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={cardDetails.expiryDate}
                    onChange={handleCardDetailsChange}
                    maxLength={5}
                    className={`mt-1 block w-full border ${
                      formErrors.expiryDate ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {formErrors.expiryDate && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.expiryDate}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                    CVV
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={handleCardDetailsChange}
                    maxLength={4}
                    className={`mt-1 block w-full border ${
                      formErrors.cvv ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {formErrors.cvv && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.cvv}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Shipping
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Review Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm; 