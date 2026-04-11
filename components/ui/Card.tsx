import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  shadow?: boolean;
}

export function Card({ children, className, padding = 'md', shadow = true }: CardProps) {
  const paddings = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' };

  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border border-gray-100',
        shadow && 'shadow-sm',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
