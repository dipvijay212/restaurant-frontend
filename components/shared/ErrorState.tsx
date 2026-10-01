import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading data.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[250px] p-8 text-center bg-rose-50/50 rounded-2xl border border-rose-100 my-4">
      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-stone-900">{title}</h3>
      <p className="text-sm text-stone-600 mt-1 max-w-md">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-4">
          Try Again
        </Button>
      )}
    </div>
  );
};
