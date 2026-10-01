import React from 'react';
import { Spinner } from '../ui/Spinner';

export const LoadingSpinner: React.FC<{ label?: string }> = ({ label = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[250px] p-8">
      <Spinner size="lg" />
      <span className="mt-4 text-sm font-medium text-stone-500">{label}</span>
    </div>
  );
};
