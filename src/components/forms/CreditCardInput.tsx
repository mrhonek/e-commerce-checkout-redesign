import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FieldError } from 'react-hook-form';
import {
  detectCardType,
  formatCreditCardNumber,
  validateCreditCardNumber,
  CardType,
  getMaxCardNumberLength
} from '../../utils/creditCardUtils';

interface CreditCardInputProps {
  name: string;
  label: string;
  required?: boolean;
  error?: FieldError;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}

export const CreditCardInput: React.FC<CreditCardInputProps> = ({
  name,
  label,
  required = false,
  error,
  placeholder = '0000 0000 0000 0000',
  autoComplete = 'cc-number',
  className = '',
}) => {
  const { register, setValue, watch } = useFormContext();
  const [cardType, setCardType] = useState<CardType>('unknown');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  
  // Get current card number value
  const cardNumber = watch(name);
  
  useEffect(() => {
    if (cardNumber) {
      const type = detectCardType(cardNumber);
      setCardType(type);
      
      // Only validate if there's a reasonable number of digits
      const cleanNumber = cardNumber.replace(/\s+/g, '');
      if (cleanNumber.length > 12) {
        setIsValid(validateCreditCardNumber(cardNumber));
      } else {
        setIsValid(null);
      }
    } else {
      setCardType('unknown');
      setIsValid(null);
    }
  }, [cardNumber]);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCreditCardNumber(e.target.value);
    setValue(name, formattedValue);
  };
  
  // Get card logo based on type
  const getCardLogo = () => {
    if (cardType === 'visa') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className="h-6 w-auto text-blue-600">
          <path fill="currentColor" d="M470.1 231.3s7.6 37.2 9.3 45H446c3.3-8.9 16-43.5 16-43.5-.2.3 3.3-9.1 5.3-14.9l2.8 13.4zM576 80v352c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V80c0-26.5 21.5-48 48-48h480c26.5 0 48 21.5 48 48zM152.5 331.2L215.7 176h-42.5l-39.3 106-4.3-21.5-14-71.4c-2.3-9.9-9.4-12.7-18.2-13.1H32.7l-.7 3.1c15.8 4 29.9 9.8 42.2 17.1l35.8 135h42.5zm94.4.2L272.1 176h-40.2l-25.1 155.4h40.1zm139.9-50.8c.2-17.7-10.6-31.2-33.7-42.3-14.1-7.1-22.7-11.9-22.7-19.2.2-6.6 7.3-13.4 23.1-13.4 13.1-.3 22.7 2.8 29.9 5.9l3.6 1.7 5.5-33.6c-7.9-3.1-20.5-6.6-36-6.6-39.7 0-67.6 21.2-67.8 51.4-.3 22.3 20 34.7 35.2 42.2 15.5 7.6 20.8 12.6 20.8 19.3-.2 10.4-12.6 15.2-24.1 15.2-16 0-24.6-2.5-37.7-8.3l-5.3-2.5-5.6 34.9c9.4 4.3 26.8 8.1 44.8 8.3 42.2.1 69.7-20.8 70-53zM528 331.4L495.6 176h-31.1c-9.6 0-16.9 2.8-21 12.9l-59.7 142.5H426s6.9-19.2 8.4-23.3H486c1.2 5.5 4.8 23.3 4.8 23.3H528z"/>
        </svg>
      );
    } else if (cardType === 'mastercard') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className="h-6 w-auto">
          <path fill="#FF5F00" d="M492.4 220.8c0 54.2-44 98.2-98.2 98.2-54.2 0-98.2-44-98.2-98.2 0-54.2 44-98.2 98.2-98.2 54.2 0 98.2 44 98.2 98.2z"/>
          <path fill="#EB001B" d="M492.4 220.8c0 54.2-44 98.2-98.2 98.2-54.2 0-98.2-44-98.2-98.2 0-54.2 44-98.2 98.2-98.2 54.2 0 98.2 44 98.2 98.2z"/>
          <path fill="#F79E1B" d="M296 220.8c0 54.2-44 98.2-98.2 98.2-54.2 0-98.2-44-98.2-98.2 0-54.2 44-98.2 98.2-98.2 54.2 0 98.2 44 98.2 98.2z"/>
        </svg>
      );
    } else if (cardType === 'amex') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className="h-6 w-auto text-blue-400">
          <path fill="currentColor" d="M48 480C21.49 480 0 458.5 0 432V80C0 53.49 21.49 32 48 32H528C554.5 32 576 53.49 576 80V82.43H500.5L483.5 130L466.6 82.43H369.4V145.6L341.3 82.43H262.7L181 267.1H246.8V430.9H450.5L482.4 395.8L514.3 430.9H576V432C576 458.5 554.5 480 528 480H48zM482.9 364L440.5 312.5L398.4 364H333.9V149.7L302.2 364H256.6L224.9 149.7V364H157.9L139.6 319.2H67.43L49.16 364H0V348.3L101.9 145.6H160.4L256.6 348.3V145.6H324.2L367.6 291.4L410.9 145.6H478.6V348.3H482.9V364zM576 348.3H529.6L493.9 303.6L458.2 348.3H359.9V145.6H426.7V289.7L480.1 221.1H480.6L534 289.7V145.6H576V348.3zM103.5 297.8H125.7L114.6 263.8L103.5 297.8z"/>
        </svg>
      );
    } else if (cardType === 'discover') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className="h-6 w-auto text-orange-600">
          <path fill="currentColor" d="M520.4 196.1c0-7.9-5.5-12.1-15.6-12.1h-4.9v24.9h4.7c10.3 0 15.8-4.4 15.8-12.8zM528 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h480c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-44.1 138.9c22.6 0 52.9 16.9 52.9 49.4 0 25.4-18.1 42.3-43.3 42.3h-22.2V170.9h12.6zm-98.3 0h30.8l34.4 87.4h-29.6l-5.5-15.5h-35.6l-5.5 15.5h-28.1l39.1-87.4zm-20.2 70.6l-11-31.4-10.7 31.4h21.7zM255.5 170.9h43v17.3h-25.4v17.8h24.3v16.6h-24.3v19.1h27.2v16.6h-44.8V170.9zm-38.1 0h-20.9v87.4h20.4c42.1 0 36.3-87.4 .5-87.4zm-37.3 0h-31.4v17.3h12.9v70.1h18.5V170.9zm-68.2 17.3h13.9v70.1h18.5V188.2h13.9v-17.3H85.6v17.3zm7.8-41.9c43.9 0 43.9 64 0 64-43.9 0-43.9-64 0-64z"/>
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className="h-6 w-auto text-gray-400">
          <path fill="currentColor" d="M64 32C28.7 32 0 60.7 0 96v320c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM96 160c0-17.7 14.3-32 32-32h64c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H128c-17.7 0-32-14.3-32-32V160z"/>
        </svg>
      );
    }
  };
  
  return (
    <div className={`${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          id={name}
          {...register(name)}
          type="text"
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={handleChange}
          maxLength={cardType === 'amex' ? 17 : 19} // Includes spaces
          className={`mt-1 block w-full px-3 py-2 pl-10 border ${
            error ? 'border-red-300' : 
            isValid === true ? 'border-green-300' :
            'border-gray-300'
          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10`}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          {getCardLogo()}
        </div>
        {isValid !== null && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isValid ? (
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${name}-error`}>
          {error.message}
        </p>
      )}
    </div>
  );
}; 