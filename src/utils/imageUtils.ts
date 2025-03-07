// Fallback image as base64 for small footprint (a simple gray image)
export const FALLBACK_IMAGE_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAABmJLR0QA/wD/AP+gvaeTAAAASUlEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA5gBi9QABT9zRHQAAAABJRU5ErkJggg==';

/**
 * Safely get an image URL with fallback
 * @param url Original image URL
 * @returns Safe image URL with fallback
 */
export const getSafeImageUrl = (url?: string): string => {
  // If no URL provided, return fallback
  if (!url) return FALLBACK_IMAGE_BASE64;
  
  // If URL contains placeholder.com, return fallback
  if (url.includes('placeholder.com')) return FALLBACK_IMAGE_BASE64;
  
  // Otherwise return the original URL
  return url;
};

/**
 * Image component with built-in error handling
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
  event.currentTarget.src = FALLBACK_IMAGE_BASE64;
  event.currentTarget.onerror = null; // Prevent infinite error loop
};

/**
 * Process cart items to ensure all image URLs are safe
 * @param items Cart items to process
 * @returns Cart items with safe image URLs
 */
export const processCartItems = <T extends { image?: string }>(items: T[]): T[] => {
  return items.map(item => ({
    ...item,
    image: getSafeImageUrl(item.image)
  }));
}; 