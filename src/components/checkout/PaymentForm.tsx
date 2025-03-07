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
  const [localLoading, setLocalLoading] = useState(false);

  // Fetch payment methods when component mounts - with better error handling
  useEffect(() => {
    let isMounted = true;
    
    const getPaymentMethods = async () => {
      try {
        // Only fetch if no payment methods exist yet
        if (state.paymentMethods.length === 0) {
          setLocalLoading(true);
          const methods = await fetchPaymentMethods();
          
          // If component is still mounted and we have methods, select the first one
          if (isMounted && methods && methods.length > 0 && !state.selectedPaymentMethod) {
            selectPaymentMethod(methods[0]);
          }
        } else if (!state.selectedPaymentMethod && state.paymentMethods.length > 0) {
          // If we already have methods but none selected, select the first one
          selectPaymentMethod(state.paymentMethods[0]);
        }
      } catch (err) {
        console.error('Error in payment methods flow:', err);
        // No need to handle here as fetchPaymentMethods already has default fallbacks
      } finally {
        if (isMounted) {
          setLocalLoading(false);
        }
      }
    };
    
    getPaymentMethods();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [fetchPaymentMethods, selectPaymentMethod, state.paymentMethods, state.selectedPaymentMethod]);

  // Check if a payment method is selected
  const isPaymentMethodSelected = Boolean(state.selectedPaymentMethod);

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    console.log('Payment method selected:', method);  // Debug log
    selectPaymentMethod(method);
    // Clear previous errors
    setFormErrors({});
  };

  const handleCardDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Updating ${name} with value: ${value}`); // Debug log
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const cleaned = value.replace(/\D/g, '');
      const formattedValue = cleaned
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
      const cleaned = value.replace(/\D/g, '');
      let formattedValue = cleaned;
      
      if (cleaned.length > 2) {
        formattedValue = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
      }
      
      setCardDetails(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    }
    // CVV should only be numbers
    else if (name === 'cvv') {
      const cleaned = value.replace(/\D/g, '').slice(0, 4);
      setCardDetails(prev => ({
        ...prev,
        [name]: cleaned
      }));
    }
    // Other fields
    else {
      setCardDetails(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Check if payment method is selected
    if (!state.selectedPaymentMethod) {
      errors.paymentMethod = 'Please select a payment method';
    }
    
    // For credit card payments, validate card details
    if (state.selectedPaymentMethod?.type === 'credit_card') {
      // Card number validation
      if (!cardDetails.cardNumber.trim()) {
        errors.cardNumber = 'Card number is required';
      } else if (!/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/.test(cardDetails.cardNumber)) {
        errors.cardNumber = 'Invalid card number format';
      }
      
      // Card holder validation
      if (!cardDetails.cardHolder.trim()) {
        errors.cardHolder = 'Cardholder name is required';
      }
      
      // Expiry date validation
      if (!cardDetails.expiryDate.trim()) {
        errors.expiryDate = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
        errors.expiryDate = 'Invalid expiry date format';
      }
      
      // CVV validation
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
      // Scroll to the first error
      const firstError = document.querySelector('.text-red-600');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
      
      <form onSubmit={handleSubmit} noValidate>
        {/* Payment Methods - Make the entire div more obviously clickable */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Payment Method</h3>
          
          {localLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {state.paymentMethods.map((method) => (
                <div
                  key={method._id}
                  className={`border rounded-md p-4 cursor-pointer hover:shadow-md transition-all ${
                    state.selectedPaymentMethod?._id === method._id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                  onClick={() => handlePaymentMethodChange(method)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={state.selectedPaymentMethod?._id === method._id}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handlePaymentMethodChange(method);
                    }
                  }}
                >
                  <div className="flex items-center">
                    <input
                      id={method._id}
                      type="radio"
                      name="paymentMethod"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={state.selectedPaymentMethod?._id === method._id}
                      onChange={() => handlePaymentMethodChange(method)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <label htmlFor={method._id} className="ml-3 flex items-center cursor-pointer flex-1">
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
        
        {/* Enhance the navigation buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-between pt-6 border-t">
          <button 
            type="button" 
            onClick={handleBack}
            className="mb-4 sm:mb-0 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Shipping
          </button>
          
          <button
            type="submit"
            disabled={localLoading}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Continue to Review
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm; 