import React, { useState, useEffect } from 'react';
import { useCheckout, ShippingAddress, ShippingOption } from '../../contexts/CheckoutContext';

const ShippingForm: React.FC = () => {
  const { 
    state, 
    loading, 
    setShippingAddress, 
    setSameAddressForBilling, 
    fetchShippingOptions, 
    selectShippingOption, 
    setStep 
  } = useCheckout();

  const [formData, setFormData] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    email: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load saved shipping address if available
  useEffect(() => {
    if (state.shippingAddress) {
      setFormData(state.shippingAddress);
    }
    
    // Fetch shipping options when component mounts
    fetchShippingOptions();
  }, [state.shippingAddress, fetchShippingOptions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleShippingOptionChange = async (option: ShippingOption) => {
    await selectShippingOption(option);
  };

  const handleSameAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSameAddressForBilling(e.target.checked);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const requiredFields: (keyof ShippingAddress)[] = [
      'firstName', 'lastName', 'address1', 'city', 'state', 'postalCode', 'country', 'email'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    // Postal code validation (simple example - would be country-dependent in a real app)
    if (formData.postalCode && !/^[0-9]{5}(-[0-9]{4})?$/.test(formData.postalCode)) {
      errors.postalCode = 'Invalid postal code format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check if shipping option is selected
    if (!state.selectedShippingOption) {
      setFormErrors(prev => ({
        ...prev,
        shippingOption: 'Please select a shipping option'
      }));
      return;
    }

    // Save shipping address and proceed to payment
    setShippingAddress(formData);
    setStep('payment');
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Name Fields */}
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 mb-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`mt-1 block w-full border ${
                formErrors.firstName ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {formErrors.firstName && <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`mt-1 block w-full border ${
                formErrors.lastName ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {formErrors.lastName && <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 mb-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 block w-full border ${
                formErrors.email ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone (optional)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Address Fields */}
        <div className="space-y-6 mb-6">
          <div>
            <label htmlFor="address1" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="address1"
              name="address1"
              value={formData.address1}
              onChange={handleChange}
              className={`mt-1 block w-full border ${
                formErrors.address1 ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {formErrors.address1 && <p className="mt-1 text-sm text-red-600">{formErrors.address1}</p>}
          </div>

          <div>
            <label htmlFor="address2" className="block text-sm font-medium text-gray-700">
              Apartment, suite, etc. (optional)
            </label>
            <input
              type="text"
              id="address2"
              name="address2"
              value={formData.address2}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  formErrors.city ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {formErrors.city && <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>}
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State / Province
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  formErrors.state ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {formErrors.state && <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>}
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                Postal code
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  formErrors.postalCode ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {formErrors.postalCode && <p className="mt-1 text-sm text-red-600">{formErrors.postalCode}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={`mt-1 block w-full border ${
                formErrors.country ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            >
              <option value="">Select country</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="Mexico">Mexico</option>
              {/* Add more countries as needed */}
            </select>
            {formErrors.country && <p className="mt-1 text-sm text-red-600">{formErrors.country}</p>}
          </div>
        </div>

        {/* Shipping Options */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Method</h3>
          
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {state.shippingOptions.map((option) => (
                <div key={option._id} className="flex items-center">
                  <input
                    id={option._id}
                    name="shippingOption"
                    type="radio"
                    checked={state.selectedShippingOption?._id === option._id}
                    onChange={() => handleShippingOptionChange(option)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor={option._id} className="ml-3 flex flex-col">
                    <span className="block text-sm font-medium text-gray-900">
                      {option.name} - ${option.price.toFixed(2)}
                    </span>
                    <span className="block text-sm text-gray-500">
                      {option.estimatedDelivery}
                    </span>
                  </label>
                </div>
              ))}
              
              {formErrors.shippingOption && (
                <p className="mt-1 text-sm text-red-600">{formErrors.shippingOption}</p>
              )}
            </div>
          )}
        </div>

        {/* Same Billing Address Checkbox */}
        <div className="mb-6">
          <div className="flex items-center">
            <input
              id="same-address"
              name="sameAddress"
              type="checkbox"
              checked={state.useSameAddressForBilling}
              onChange={handleSameAddressChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="same-address" className="ml-2 block text-sm text-gray-900">
              Use same address for billing
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Continue to Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShippingForm; 