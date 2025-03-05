import { ShippingAddress } from '../store/slices/checkoutSlice';

// Define the address components returned by Google Places API
export interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface GooglePlaceResult {
  address_components: GoogleAddressComponent[];
  formatted_address: string;
}

// Parse Google Place result into our ShippingAddress format
export const parseGoogleAddress = (place: GooglePlaceResult): Partial<ShippingAddress> => {
  const addressComponents = place.address_components;
  
  // Initialize address data
  const addressData: Partial<ShippingAddress> = {
    address: place.formatted_address,
  };
  
  // Extract address components
  addressComponents.forEach(component => {
    const types = component.types;
    
    if (types.includes('postal_code')) {
      addressData.zipCode = component.long_name;
    } else if (types.includes('country')) {
      addressData.country = component.short_name;
    } else if (types.includes('administrative_area_level_1')) {
      addressData.state = component.short_name;
    } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
      addressData.city = component.long_name;
    }
  });
  
  return addressData;
};

// Initialize Google Places Autocomplete
export const initGooglePlacesAutocomplete = (
  inputRef: React.RefObject<HTMLInputElement>, 
  onAddressSelect: (address: Partial<ShippingAddress>) => void
): void => {
  if (!inputRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
    console.error('Google Maps JavaScript API not loaded or input not available');
    return;
  }
  
  const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
    types: ['address'],
    fields: ['address_components', 'formatted_address'],
  });
  
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    
    if (place && place.address_components) {
      const addressData = parseGoogleAddress(place);
      onAddressSelect(addressData);
    }
  });
};

// Add type definitions for the Google Maps JavaScript API
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: { types: string[]; fields: string[] }
          ) => {
            addListener: (event: string, callback: () => void) => void;
            getPlace: () => GooglePlaceResult;
          };
        };
      };
    };
  }
} 