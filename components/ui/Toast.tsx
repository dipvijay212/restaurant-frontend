'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ToastProps {
  id?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
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
    warning: AlertTriangle,
    info: Info,
  };

  const iconColors = {
    success: 'text-emerald-400',
    error: 'text-rose-400',
    warning: 'text-amber-400',
    info: 'text-amber-400',
  };

  const styles = {
    success: 'bg-emerald-950 text-white border-emerald-700/60 shadow-2xl shadow-emerald-950/40',
    error: 'bg-rose-950 text-white border-rose-700/60 shadow-2xl shadow-rose-950/40',
    warning: 'bg-amber-950 text-white border-amber-700/60 shadow-2xl shadow-amber-950/40',
    info: 'bg-stone-900 text-white border-stone-700/80 shadow-2xl shadow-stone-950/40',
  };

  const Icon = icons[type] || Info;
  const iconColor = iconColors[type] || 'text-stone-300';

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md w-full max-w-sm transition-all duration-300 animate-in slide-in-from-top-4 fade-in-0',
        styles[type],
        className
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconColor)} />
      <div className="flex-1 min-w-0">
        <h4 className="font-extrabold text-sm leading-tight text-white">{title}</h4>
        {message && <p className="text-xs text-stone-300 mt-1 leading-snug">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close notification"
          className="p-1 text-stone-400 hover:text-white rounded-lg transition-colors -mr-1 -mt-1"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
