'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ToastProps {
  id?: string;
  type?: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className,
}) => {
  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  };

  const styles = {
    success: 'bg-emerald-900 text-white border-emerald-800',
    error: 'bg-rose-900 text-white border-rose-800',
    info: 'bg-stone-900 text-white border-stone-800',
  };

  const Icon = icons[type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-2xl shadow-xl border w-full max-w-sm transition-all duration-300 animate-in slide-in-from-bottom-5',
        styles[type],
        className
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm leading-tight">{title}</h4>
        {message && <p className="text-xs text-stone-300 mt-0.5">{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 text-stone-400 hover:text-white rounded-lg">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
