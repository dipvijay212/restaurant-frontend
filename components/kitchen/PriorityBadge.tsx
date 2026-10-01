import React from 'react';
import { Flame } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface PriorityBadgeProps {
  isUrgent?: boolean;
  label?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  isUrgent = false,
  label = 'Rush Ticket',
}) => {
  if (!isUrgent) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-sm animate-pulse">
      <Flame className="w-3 h-3 fill-white" />
      {label}
    </span>
  );
};
