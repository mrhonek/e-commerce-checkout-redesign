import React, { useState } from 'react';
import { FALLBACK_IMAGE_BASE64, getSafeImageUrl } from '../../utils/imageUtils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  className?: string;
  fallback?: string;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt = '',
  className = '',
  fallback = FALLBACK_IMAGE_BASE64,
  ...props
}) => {
  const [error, setError] = useState(false);
  
  // Ensure we're using a safe URL
  const safeUrl = error ? fallback : getSafeImageUrl(src);
  
  return (
    <img
      src={safeUrl}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}; 