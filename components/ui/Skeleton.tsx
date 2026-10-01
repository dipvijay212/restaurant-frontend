import React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  ...props
}) => {
  const variants = {
    text: 'h-4 w-full rounded-md',
    circular: 'w-10 h-10 rounded-full',
    rectangular: 'h-20 w-full rounded-xl',
    card: 'h-40 w-full rounded-2xl',
  };

  return (
    <div
      className={cn('animate-pulse bg-stone-200/80 dark:bg-stone-800', variants[variant], className)}
      {...props}
    />
  );
};
