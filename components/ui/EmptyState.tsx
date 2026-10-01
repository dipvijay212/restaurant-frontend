'use client';

import React from 'react';
import { LucideIcon, PackageOpen } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionLoading?: boolean;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  onAction,
  actionLoading = false,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  children,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center bg-white/60 rounded-3xl border border-stone-200/60 my-4', className)}>
      <div className="w-16 h-16 rounded-3xl bg-stone-100 flex items-center justify-center text-stone-400 mb-4 shadow-inner">
        <Icon className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-extrabold text-stone-900 mb-1">{title}</h3>
      {description && <p className="text-xs text-stone-500 max-w-sm mb-5 leading-relaxed">{description}</p>}
      
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              isLoading={actionLoading}
              variant="primary"
              size="sm"
              className="rounded-xl font-bold px-4"
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              onClick={onSecondaryAction}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold px-4 border-stone-200 text-stone-700"
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};
