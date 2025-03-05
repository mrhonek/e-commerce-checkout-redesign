import React, { useState } from 'react';

interface CheckoutFormProps {
  onSubmit: (formData: FormData) => void;
}

interface FormData {
  // Shipping information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  // Payment information
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCVC: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: ''
  });
  
  const [activeSection, setActiveSection] = useState<'shipping' | 'payment'>('shipping');
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name as keyof FormData]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name as keyof FormData];
        return updated;
      });
    }
  };

  const validateShippingSection = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePaymentSection = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.cardName.trim()) newErrors.cardName = 'Name on card is required';
    
    // Basic card number validation (16 digits)
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
    
    // Basic expiry validation (MM/YY)
    if (!formData.cardExpiry.trim()) {
      newErrors.cardExpiry = 'Expiration date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
      newErrors.cardExpiry = 'Use format MM/YY';
    }
    
    // Basic CVC validation (3-4 digits)
    if (!formData.cardCVC.trim()) {
      newErrors.cardCVC = 'CVC is required';
    } else if (!/^\d{3,4}$/.test(formData.cardCVC)) {
      newErrors.cardCVC = 'CVC must be 3-4 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShippingSection()) {
      setActiveSection('payment');
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePaymentSection()) {
      onSubmit(formData);
    }
  };

  const handleBackToShipping = () => {
    setActiveSection('shipping');
    window.scrollTo(0, 0);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-4 text-center font-medium ${
            activeSection === 'shipping'
              ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500'
          }`}
          onClick={() => activeSection === 'payment' && handleBackToShipping()}
        >
          1. Shipping
        </button>
        <button
          className={`flex-1 py-4 text-center font-medium ${
            activeSection === 'payment'
              ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500'
          }`}
          disabled={activeSection === 'shipping'}
        >
          2. Payment
        </button>
      </div>

      {activeSection === 'shipping' ? (
        <form onSubmit={handleContinueToPayment} className="p-6">
          <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name*
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full border ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                } rounded-md p-2`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name*
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full border ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                } rounded-md p-2`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } rounded-md p-2`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number*
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full border ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                } rounded-md p-2`}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Street Address*
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`w-full border ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              } rounded-md p-2`}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City*
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full border ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                } rounded-md p-2`}
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State*
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`w-full border ${
                  errors.state ? 'border-red-500' : 'border-gray-300'
                } rounded-md p-2`}
              />
              {errors.state && (
                <p className="text-red-500 text-sm mt-1">{errors.state}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code*
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className={`w-full border ${
                  errors.zipCode ? 'border-red-500' : 'border-gray-300'
                } rounded-md p-2`}
              />
              {errors.zipCode && (
                <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country*
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="AU">Australia</option>
              </select>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Continue to Payment
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-xl font-semibold mb-6">Payment Information</h2>
          
          <div className="mb-6">
            <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
              Name on Card*
            </label>
            <input
              type="text"
              id="cardName"
              name="cardName"
              value={formData.cardName}
              onChange={handleChange}
              className={`w-full border ${
                errors.cardName ? 'border-red-500' : 'border-gray-300'
              } rounded-md p-2`}
            />
            {errors.cardName && (
              <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Card Number*
            </label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              placeholder="XXXX XXXX XXXX XXXX"
              className={`w-full border ${
                errors.cardNumber ? 'border-red-500' : 'border-gray-300'
              } rounded-md p-2`}
            />
            {errors.cardNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date*
              </label>
              <input
                type="text"
                id="cardExpiry"
                name="cardExpiry"
                value={formData.cardExpiry}
                onChange={handleChange}
                placeholder="MM/YY"
                className={`w-full border ${
                  errors.cardExpiry ? 'border-red-500' : 'border-gray-300'
                } rounded-md p-2`}
              />
              {errors.cardExpiry && (
                <p className="text-red-500 text-sm mt-1">{errors.cardExpiry}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="cardCVC" className="block text-sm font-medium text-gray-700 mb-1">
                CVC*
              </label>
              <input
                type="text"
                id="cardCVC"
                name="cardCVC"
                value={formData.cardCVC}
                onChange={handleChange}
                placeholder="XXX"
                className={`w-full border ${
                  errors.cardCVC ? 'border-red-500' : 'border-gray-300'
                } rounded-md p-2`}
              />
              {errors.cardCVC && (
                <p className="text-red-500 text-sm mt-1">{errors.cardCVC}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={handleBackToShipping}
              className="text-indigo-600 hover:text-indigo-500"
            >
              ← Back to Shipping
            </button>
            
            <button
              type="submit"
              className="bg-indigo-600 text-white py-3 px-6 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Place Order
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CheckoutForm; 