'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: string;
  onRetry?: () => void | Promise<void>;
  isRetrying?: boolean;
  variant?: 'card' | 'inline' | 'fullscreen';
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  error,
  onRetry,
  isRetrying = false,
  variant = 'card',
  className,
}) => {
  const displayMessage = error || message || 'An unexpected error occurred while loading data.';

  if (variant === 'inline') {
    return (
      <div
        role="alert"
        className={cn(
          'flex items-center justify-between gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900',
          className
        )}
      >
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <div>
            <span className="font-bold block">{title}</span>
            {displayMessage && <span className="text-rose-700">{displayMessage}</span>}
          </div>
        </div>
        {onRetry && (
          <Button
            onClick={onRetry}
            isLoading={isRetrying}
            variant="outline"
            size="sm"
            className="border-rose-300 text-rose-800 hover:bg-rose-100 flex-shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center bg-rose-50/60 rounded-3xl border border-rose-200/80 my-4 shadow-sm',
        variant === 'fullscreen' ? 'min-h-[50vh]' : 'min-h-[220px]',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mb-3.5 shadow-sm">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-base font-extrabold text-stone-900">{title}</h3>
      <p className="text-xs text-stone-600 mt-1 max-w-sm leading-relaxed">{displayMessage}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          isLoading={isRetrying}
          variant="outline"
          size="sm"
          className="mt-4 rounded-xl font-bold border-rose-200 text-rose-700 hover:bg-rose-100/70"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Try Again
        </Button>
      )}
    </div>
  );
};
