'use client';

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  message?: string;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  description,
  message,
  confirmText,
  confirmLabel,
  cancelText,
  cancelLabel,
  variant = 'danger',
  isLoading = false,
}) => {
  const handleClose = onCancel || onClose || (() => {});
  const desc = description || message || '';
  const confirmBtnText = confirmLabel || confirmText || 'Confirm';
  const cancelBtnText = cancelLabel || cancelText || 'Cancel';

  const icons = {
    danger: AlertTriangle,
    warning: AlertCircle,
    primary: HelpCircle,
  };

  const iconStyles = {
    danger: 'bg-rose-100 text-rose-600',
    warning: 'bg-amber-100 text-amber-600',
    primary: 'bg-blue-100 text-blue-600',
  };

  const Icon = icons[variant] || AlertTriangle;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
      <div className="flex flex-col items-center text-center p-2">
        <div className={`w-14 h-14 rounded-2xl ${iconStyles[variant]} flex items-center justify-center mb-3.5 shadow-sm`}>
          <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-extrabold text-stone-900 mb-1.5">{title}</h3>
        {desc && <p className="text-xs text-stone-500 mb-6 max-w-xs leading-relaxed">{desc}</p>}

        <div className="flex items-center gap-3 w-full">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 rounded-xl font-bold py-2.5 border-stone-200 text-stone-700"
          >
            {cancelBtnText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1 rounded-xl font-extrabold py-2.5 shadow-sm"
          >
            {confirmBtnText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
