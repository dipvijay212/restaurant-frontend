import React from 'react';
import { Button, ButtonProps } from '../ui/Button';
import { LucideIcon } from 'lucide-react';

export interface ServiceActionButtonProps extends ButtonProps {
  icon?: LucideIcon;
  label: string;
}

export const ServiceActionButton: React.FC<ServiceActionButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  className,
  ...props
}) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={`rounded-2xl p-4 flex flex-col items-center justify-center gap-2 h-auto text-xs font-bold border-stone-200 hover:border-amber-400 hover:bg-amber-50 ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-6 h-6 text-amber-600" />}
      <span>{label}</span>
    </Button>
  );
};
