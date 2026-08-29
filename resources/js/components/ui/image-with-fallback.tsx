import React, { useState, useEffect } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&q=80';

export function ImageWithFallback({ fallbackSrc = DEFAULT_FALLBACK, src, alt, style, className, ...rest }: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [didFallback, setDidFallback] = useState(false);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setDidFallback(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!didFallback) {
      setImgSrc(fallbackSrc);
      setDidFallback(true);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt || 'Image'}
      className={className}
      style={style}
      {...rest}
      onError={handleError}
    />
  );
}
