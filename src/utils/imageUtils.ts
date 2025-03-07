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
 * Image error handler that uses inline SVG as data URL
 * This provides a reliable fallback that doesn't trigger additional network requests
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, size = 'medium') => {
  // Get the target element
  const img = e.currentTarget;
  
  // Prevent infinite error loops by removing the error handler
  img.onerror = null;
  
  // Set dimensions based on size parameter
  let width, height, fontSize;
  switch (size) {
    case 'small':
      width = 100;
      height = 100;
      fontSize = 12;
      break;
    case 'large':
      width = 600;
      height = 400;
      fontSize = 20;
      break;
    case 'medium':
    default:
      width = 300;
      height = 300;
      fontSize = 16;
  }
  
  // Create a data URL with an SVG placeholder
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect fill="#f0f0f0" width="${width}" height="${height}"/>
      <text fill="#999" font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" text-anchor="middle" x="${width/2}" y="${height/2}">
        Image not available
      </text>
    </svg>
  `;
  
  // Clean up the SVG content (remove newlines and extra spaces)
  const cleanSvg = svgContent.replace(/\s+/g, ' ').trim();
  
  // Encode the SVG for use in a data URL
  const encodedSvg = encodeURIComponent(cleanSvg);
  
  // Set the image source to the data URL
  img.src = `data:image/svg+xml;charset=UTF-8,${encodedSvg}`;
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