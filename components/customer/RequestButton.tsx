import React from 'react';
import { BellRing } from 'lucide-react';
import { Button, ButtonProps } from '../ui/Button';

export interface RequestButtonProps extends ButtonProps {
  label?: string;
}

export const RequestButton: React.FC<RequestButtonProps> = ({
  label = 'Call Waiter',
  onClick,
  className,
  ...props
}) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={`rounded-2xl text-xs font-bold border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 ${className}`}
      {...props}
    >
      <BellRing className="w-4 h-4 mr-1.5 text-amber-600" />
      {label}
    </Button>
  );
};
