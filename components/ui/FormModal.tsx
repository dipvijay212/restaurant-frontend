'use client';

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  submitText?: string;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitText = 'Save Changes',
  isLoading = false,
  children,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
          <Button type="button" variant="outline" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} size="sm" className="font-bold">
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
