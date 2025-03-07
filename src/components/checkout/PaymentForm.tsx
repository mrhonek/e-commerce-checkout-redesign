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
  const [forceShowCardForm, setForceShowCardForm] = useState(false);

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

  // Add better rendering and forced selection for credit card
  useEffect(() => {
    // Debug full objects to see what's in the payment methods
    console.log('Full payment methods:', JSON.stringify(state.paymentMethods));
    
    // Auto-select credit card if no payment method is selected
    if (state.paymentMethods.length > 0 && !state.selectedPaymentMethod) {
      const creditCard = state.paymentMethods.find(m => 
        m.type === 'credit_card' || m._id === 'credit_card'
      );
      
      if (creditCard) {
        console.log('Auto-selecting credit card:', creditCard);
        selectPaymentMethod(creditCard);
      } else {
        console.warn('No credit card payment method found in:', state.paymentMethods);
      }
    }
  }, [state.paymentMethods, state.selectedPaymentMethod, selectPaymentMethod]);

  // Check if a payment method is selected
  const isPaymentMethodSelected = Boolean(state.selectedPaymentMethod);

  // Add debug logging for payment method
  console.log('Selected payment method:', state.selectedPaymentMethod);
  console.log('Payment methods:', state.paymentMethods);

  // Check if payment method type is available and fix it if needed
  const paymentMethodType = state.selectedPaymentMethod?.type;
  console.log('Payment method type:', paymentMethodType);
  
  // Fix the card details display condition
  const showCardDetails = state.selectedPaymentMethod && 
    (state.selectedPaymentMethod.type === 'credit_card' || 
     state.selectedPaymentMethod._id === 'credit_card');

  // Use this for conditional rendering
  const shouldShowCardForm = showCardDetails || forceShowCardForm;

  // Handle credit card selection specifically with a more robust approach
  const selectCreditCard = () => {
    // Force show card form regardless of payment method type
    setForceShowCardForm(true);
    
    try {
      // Try all possible combinations to find credit card payment method
      let creditCardMethod = state.paymentMethods.find(m => 
        m.type === 'credit_card'
      );
      
      if (!creditCardMethod) {
        creditCardMethod = state.paymentMethods.find(m => 
          m._id === 'credit_card' || m.id === 'credit_card'
        );
      }
      
      if (!creditCardMethod) {
        creditCardMethod = state.paymentMethods.find(m => {
          // Safe access to properties with optional chaining
          return (m._id?.toLowerCase()?.includes('card') || 
                  m.id?.toLowerCase()?.includes('card') || 
                  m.name?.toLowerCase()?.includes('card') || false);
        });
      }
      
      // As a last resort, just take the first method and force its type
      if (!creditCardMethod && state.paymentMethods.length > 0) {
        creditCardMethod = {
          ...state.paymentMethods[0],
          type: 'credit_card' as 'credit_card'
        };
      }
      
      if (creditCardMethod) {
        console.log('Selecting credit card method with override:', creditCardMethod);
        // Create a new object to ensure it has the right type
        const fixedMethod = {
          ...creditCardMethod,
          type: 'credit_card' as 'credit_card',
          // Ensure it has an ID
          _id: creditCardMethod._id || creditCardMethod.id || 'credit_card'
        };
        selectPaymentMethod(fixedMethod);
      } else {
        console.error('No payment methods available');
      }
    } catch (err) {
      console.error('Error selecting credit card method:', err);
      // Continue with form display even if selection fails
    }
  };

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
    
    // Skip payment method validation if we're in force mode
    if (!forceShowCardForm) {
      // Check if payment method is selected
      if (!state.selectedPaymentMethod) {
        errors.paymentMethod = 'Please select a payment method';
      }
    }
    
    // Always validate card details if card form is shown
    if (shouldShowCardForm) {
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
    
    // If we're in force mode but don't have a credit card payment method selected, create one
    if (forceShowCardForm && (!state.selectedPaymentMethod || state.selectedPaymentMethod.type !== 'credit_card')) {
      try {
        // Create a synthetic payment method
        const syntheticMethod = {
          _id: 'credit_card',
          id: 'credit_card',
          type: 'credit_card' as 'credit_card',
          name: 'Credit / Debit Card',
          description: 'Card ending in ' + cardDetails.cardNumber.slice(-4)
        };
        
        console.log('Creating synthetic payment method:', syntheticMethod);
        selectPaymentMethod(syntheticMethod);
        
        // Short delay to allow state to update before continuing
        setTimeout(() => {
          if (validateForm()) {
            setStep('review');
          }
        }, 100);
        
        return;
      } catch (err) {
        console.error('Error creating synthetic payment method:', err);
      }
    }
    
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
      
      {/* Debug info - ALWAYS show this regardless of environment */}
      <div className="bg-yellow-50 p-3 rounded mb-4 text-sm">
        <p><strong>Having trouble seeing card form?</strong> Try the button below:</p>
        <button 
          type="button" 
          onClick={selectCreditCard}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700"
        >
          Click here to show Credit Card Form
        </button>
        <div className="mt-2 text-xs">
          <div><strong>Selected method:</strong> {state.selectedPaymentMethod?._id}</div>
          <div><strong>Type:</strong> {state.selectedPaymentMethod?.type}</div>
          <div><strong>Show card details:</strong> {shouldShowCardForm ? 'Yes' : 'No'}</div>
          <div><strong>Force mode:</strong> {forceShowCardForm ? 'Active' : 'Inactive'}</div>
        </div>
      </div>
      
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
                  {/* Debug and helper button */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-2 text-xs text-gray-500">
                      ID: {method._id}, Type: {method.type}
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePaymentMethodChange(method);
                        }}
                        className="ml-2 bg-gray-200 px-2 py-1 rounded text-xs"
                      >
                        Force select
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Emergency credit card selection button */}
              <button 
                type="button" 
                onClick={selectCreditCard}
                className="mt-4 bg-blue-100 text-blue-700 px-4 py-2 rounded text-sm font-medium hover:bg-blue-200"
              >
                Select Credit Card Payment
              </button>
              
              {formErrors.paymentMethod && (
                <p className="text-sm text-red-600 mt-1">{formErrors.paymentMethod}</p>
              )}
            </div>
          )}
        </div>
        
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 p-2 text-xs rounded mb-4">
            <div><strong>Selected method:</strong> {state.selectedPaymentMethod?._id}</div>
            <div><strong>Type:</strong> {state.selectedPaymentMethod?.type}</div>
            <div><strong>Show card details:</strong> {showCardDetails ? 'Yes' : 'No'}</div>
          </div>
        )}
        
        {/* Credit Card Details (modified condition) */}
        {shouldShowCardForm && (
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