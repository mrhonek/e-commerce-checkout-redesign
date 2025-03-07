import React, { useState, useEffect } from 'react';
import { useCheckout, PaymentMethod } from '../../contexts/CheckoutContext';
import { CreditCard, Check, Circle, CheckCircle } from 'lucide-react';

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
    // Auto-select credit card if no payment method is selected
    if (state.paymentMethods.length > 0 && !state.selectedPaymentMethod) {
      const creditCard = state.paymentMethods.find(m => 
        m.type === 'credit_card' || m._id === 'credit_card'
      );
      
      if (creditCard) {
        selectPaymentMethod(creditCard);
        // Force show card form when auto-selecting credit card
        setForceShowCardForm(true);
      }
    }
    
    // Show card form if credit card is selected
    if (state.selectedPaymentMethod?.type === 'credit_card' || 
        state.selectedPaymentMethod?._id === 'credit_card') {
      setForceShowCardForm(true);
    }
  }, [state.paymentMethods, state.selectedPaymentMethod, selectPaymentMethod]);

  // Check if a payment method is selected
  const isPaymentMethodSelected = Boolean(state.selectedPaymentMethod);

  // Check if payment method type is available and fix it if needed
  const paymentMethodType = state.selectedPaymentMethod?.type;
  
  // Fix the card details display condition
  const showCardDetails = state.selectedPaymentMethod && 
    (state.selectedPaymentMethod.type === 'credit_card' || 
     state.selectedPaymentMethod._id === 'credit_card');

  // Use this for conditional rendering
  const shouldShowCardForm = showCardDetails || forceShowCardForm;

  useEffect(() => {
    // If we have a selected payment method that's a credit card, force show the form
    if (state.selectedPaymentMethod) {
      const isCardMethod = 
        state.selectedPaymentMethod.type === 'credit_card' || 
        state.selectedPaymentMethod._id === 'credit_card' ||
        (state.selectedPaymentMethod.name && 
         state.selectedPaymentMethod.name.toLowerCase().includes('card'));
      
      if (isCardMethod) {
        setForceShowCardForm(true);
      }
    }
  }, [state.selectedPaymentMethod]);

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
        // Create a new object to ensure it has the right type
        const fixedMethod = {
          ...creditCardMethod,
          type: 'credit_card' as 'credit_card',
          // Ensure it has an ID
          _id: creditCardMethod._id || creditCardMethod.id || 'credit_card'
        };
        selectPaymentMethod(fixedMethod);
      }
    } catch (err) {
      console.error('Error selecting credit card method:', err);
      // Continue with form display even if selection fails
    }
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    // Check if this is a credit card method and show form if it is
    const isCreditCard = method.type === 'credit_card' || 
                        method._id === 'credit_card' || 
                        method.name?.toLowerCase().includes('card');
    
    if (isCreditCard) {
      setForceShowCardForm(true);
      
      // Make sure it has the correct type
      const fixedMethod = {
        ...method,
        type: 'credit_card' as 'credit_card'
      };
      selectPaymentMethod(fixedMethod);
    } else {
      setForceShowCardForm(false);
      selectPaymentMethod(method);
    }
    
    // Clear previous errors
    setFormErrors({});
  };

  const handleCardDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
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
        // Create a payment method based on card details
        const cardMethod = {
          _id: 'credit_card',
          id: 'credit_card',
          type: 'credit_card' as 'credit_card',
          name: 'Credit / Debit Card',
          description: 'Card ending in ' + cardDetails.cardNumber.slice(-4)
        };
        
        selectPaymentMethod(cardMethod);
        
        // Short delay to allow state to update before continuing
        setTimeout(() => {
          if (validateForm()) {
            setStep('review');
          }
        }, 100);
        
        return;
      } catch (err) {
        // Handle error gracefully
        setFormErrors({
          general: 'There was an error setting up your payment method. Please try again.'
        });
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
      
      {loading || localLoading ? (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {/* Payment Methods - Make the entire div more obviously clickable */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Payment Method</h3>
            
            <div className="space-y-4">
              {state.paymentMethods.map((method) => {
                const isSelected = state.selectedPaymentMethod?._id === method._id;
                const isCreditCard = method.type === 'credit_card' || 
                                    method._id === 'credit_card' || 
                                    (method.name && method.name.toLowerCase().includes('card'));
                
                return (
                  <div 
                    key={method._id} 
                    className={`flex items-center p-4 border rounded cursor-pointer transition-colors
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'}`}
                    onClick={() => handlePaymentMethodChange(method)}
                  >
                    {/* Selected/unselected indicator */}
                    <div className="relative flex items-center justify-center mr-3">
                      {isSelected ? (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    
                    {/* Payment method icon and details */}
                    <div className="flex items-center flex-grow">
                      {isCreditCard ? (
                        <CreditCard className={`h-6 w-6 mr-2 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
                      ) : (
                        <Check className={`h-6 w-6 mr-2 ${isSelected ? 'text-green-500' : 'text-gray-400'}`} />
                      )}
                      <div>
                        <div className="font-medium">{method.name}</div>
                        {method.description && (
                          <div className="text-sm text-gray-500">{method.description}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {formErrors.paymentMethod && (
                <p className="text-sm text-red-600 mt-1">{formErrors.paymentMethod}</p>
              )}
            </div>
          </div>
          
          {/* Card Details Form - shown when credit card is selected */}
          {shouldShowCardForm && (
            <div className="mt-6 border border-gray-200 rounded-md p-4 bg-gray-50">
              <h3 className="text-lg font-medium mb-4">Card Details</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    value={cardDetails.cardNumber}
                    onChange={handleCardDetailsChange}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      formErrors.cardNumber
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
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
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      formErrors.cardHolder
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                  {formErrors.cardHolder && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.cardHolder}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChange={handleCardDetailsChange}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        formErrors.expiryDate
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
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
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        formErrors.cvv
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {formErrors.cvv && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.cvv}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Back
            </button>
            
            <button
              type="submit"
              className={`px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Continue to Review'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PaymentForm; 