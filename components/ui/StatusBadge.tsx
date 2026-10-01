import React from 'react';
import { getStatusMeta } from '../../lib/constants/status';
import { cn } from '../../lib/utils';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
  showDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showDot = true,
  size = 'md',
  className,
  ...props
}) => {
  const meta = getStatusMeta(status);

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-semibold rounded-md',
    md: 'text-xs px-2.5 py-1 font-bold rounded-lg',
    lg: 'text-sm px-3.5 py-1.5 font-extrabold rounded-xl',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border capitalize transition-colors',
        meta.bg,
        meta.text,
        meta.border,
        sizes[size],
        className
      )}
      {...props}
    >
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', meta.dot)} />}
      <span>{meta.label}</span>
    </span>
  );
};
