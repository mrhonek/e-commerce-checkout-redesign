// Credit card regex patterns for different card types
const CARD_PATTERNS = {
  visa: /^4/,
  mastercard: /^5[1-5]/,
  amex: /^3[47]/,
  discover: /^6(?:011|5)/,
  diners: /^3(?:0[0-5]|[68])/,
  jcb: /^(?:2131|1800|35)/
};

export type CardType = keyof typeof CARD_PATTERNS | 'unknown';

// Detect credit card type based on number
export const detectCardType = (cardNumber: string): CardType => {
  // Remove spaces and dashes
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');
  
  if (!cleanNumber) return 'unknown';
  
  // Check patterns
  for (const [type, pattern] of Object.entries(CARD_PATTERNS)) {
    if (pattern.test(cleanNumber)) {
      return type as CardType;
    }
  }
  
  return 'unknown';
};

// Format credit card number with spaces for readability
export const formatCreditCardNumber = (value: string): string => {
  if (!value) return '';
  
  // Remove all non-digit characters
  const cleanValue = value.replace(/\D/g, '');
  
  // Determine card type and apply formatting accordingly
  const cardType = detectCardType(cleanValue);
  
  // For American Express, format is XXXX XXXXXX XXXXX
  if (cardType === 'amex') {
    const parts = [
      cleanValue.substring(0, 4),
      cleanValue.substring(4, 10),
      cleanValue.substring(10, 15)
    ];
    return parts.filter(part => part !== '').join(' ');
  }
  
  // For other cards, format is XXXX XXXX XXXX XXXX
  const parts = [];
  for (let i = 0; i < cleanValue.length; i += 4) {
    parts.push(cleanValue.substring(i, i + 4));
  }
  return parts.join(' ');
};

// Validate a credit card number using Luhn's algorithm
export const validateCreditCardNumber = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\s+/g, '');
  
  if (!/^\d+$/.test(cleanNumber)) return false;
  
  let sum = 0;
  let shouldDouble = false;
  
  // Loop through values starting from the rightmost digit
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return (sum % 10) === 0;
};

// Format expiry date as MM/YY
export const formatExpiryDate = (value: string): string => {
  if (!value) return '';
  
  const cleanValue = value.replace(/\D/g, '');
  
  if (cleanValue.length <= 2) {
    return cleanValue;
  }
  
  const month = cleanValue.substring(0, 2);
  const year = cleanValue.substring(2, 4);
  
  return `${month}/${year}`;
};

// Get the maximum length for a credit card number based on type
export const getMaxCardNumberLength = (cardType: CardType): number => {
  switch (cardType) {
    case 'amex':
      return 15;
    case 'diners':
      return 14;
    default:
      return 16;
  }
}; 