import React from 'react';
import { Button, ButtonProps } from '../ui/Button';

export interface KitchenStatusButtonProps extends ButtonProps {
  status: 'pending' | 'preparing' | 'ready' | 'served';
}

export const KitchenStatusButton: React.FC<KitchenStatusButtonProps> = ({
  status,
  onClick,
  className,
  ...props
}) => {
  const configs = {
    pending: { label: 'Start Prep', variant: 'primary' as const },
    preparing: { label: 'Mark Ready', variant: 'success' as const },
    ready: { label: 'Mark Served', variant: 'secondary' as const },
    served: { label: 'Completed', variant: 'outline' as const },
  };

  const config = configs[status];

  return (
    <Button
      variant={config.variant}
      onClick={onClick}
      className={`w-full py-3 text-sm font-extrabold rounded-xl ${className}`}
      {...props}
    >
      {config.label}
    </Button>
  );
};
