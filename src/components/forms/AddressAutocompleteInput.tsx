import React, { useRef, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FieldError } from 'react-hook-form';
import { ShippingAddress } from '../../store/slices/checkoutSlice';
import { initGooglePlacesAutocomplete } from '../../utils/addressAutoComplete';

type ShippingAddressKey = keyof ShippingAddress;

interface AddressAutocompleteInputProps {
  name: ShippingAddressKey;
  label: string;
  required?: boolean;
  error?: FieldError;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}

export const AddressAutocompleteInput: React.FC<AddressAutocompleteInputProps> = ({
  name,
  label,
  required = false,
  error,
  placeholder = 'Enter your address',
  autoComplete = 'off',
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setValue, setFocus, register, formState } = useFormContext<ShippingAddress>();
  
  // Register the input with React Hook Form
  const { ref, ...rest } = register(name);
  
  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      initGooglePlacesAutocomplete(inputRef, (addressData) => {
        // Update form fields with the selected address data
        if (addressData.address) setValue('address', addressData.address);
        if (addressData.city) setValue('city', addressData.city);
        if (addressData.state) setValue('state', addressData.state);
        if (addressData.zipCode) setValue('zipCode', addressData.zipCode);
        if (addressData.country) setValue('country', addressData.country);
        
        // Focus on the next field after address (usually city)
        setTimeout(() => {
          setFocus('city');
        }, 100);
      });
    }
  }, [setValue, setFocus]);
  
  return (
    <div className={`${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        {...rest}
        ref={(e) => {
          ref(e); // Pass to react-hook-form
          if (inputRef) (inputRef as any).current = e; // Pass to our ref for Google Places
        }}
        type="text"
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`mt-1 block w-full px-3 py-2 border ${
          error ? 'border-red-300' : 'border-gray-300'
        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${name}-error`}>
          {error.message}
        </p>
      )}
    </div>
  );
}; 