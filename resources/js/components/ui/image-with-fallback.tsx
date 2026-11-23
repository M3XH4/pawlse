import React, { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  showSkeleton?: boolean;
}

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&q=80';

export function ImageWithFallback({
  fallbackSrc = DEFAULT_FALLBACK,
  showSkeleton = true,
  src,
  alt,
  style,
  className,
  loading = 'lazy',
  decoding = 'async',
  onLoad,
  onError,
  ...rest
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [didFallback, setDidFallback] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setDidFallback(false);
    setIsLoaded(false);
  }, [src, fallbackSrc]);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [imgSrc]);

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(event);
  };

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (!didFallback) {
      setImgSrc(fallbackSrc);
      setDidFallback(true);
    } else {
      setIsLoaded(true);
    }
    onError?.(event);
  };

  const hasFullWidth = typeof className === 'string' && /\bw-full\b/.test(className);
  const hasFullHeight = typeof className === 'string' && /\bh-full\b/.test(className);

  return (
    <span
      className={cn(
        'relative inline-block overflow-hidden align-middle',
        hasFullWidth && 'block w-full',
        hasFullHeight && 'h-full',
      )}
    >
      {showSkeleton && !isLoaded && (
        <Skeleton
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full rounded-none"
        />
      )}
      <img
        ref={imgRef}
        src={imgSrc}
        alt={alt || 'Image'}
        loading={loading}
        decoding={decoding}
        className={cn(
          className,
          showSkeleton && 'transition-opacity duration-300',
          showSkeleton && !isLoaded ? 'opacity-0' : 'opacity-100',
        )}
        style={style}
        {...rest}
        onLoad={handleLoad}
        onError={handleError}
      />
    </span>
  );
}
