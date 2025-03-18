'use client';

import * as React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: string;
}

export function Avatar({
  src,
  alt = 'Avatar',
  size = 'md',
  fallback,
  className,
  ...props
}: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden bg-muted/30 backdrop-blur-sm flex items-center justify-center font-medium text-foreground border border-border/40 shadow-sm',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
} 