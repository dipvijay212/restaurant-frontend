import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from './Card';
import { cn } from '../../lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: LucideIcon;
  description?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  description,
  className,
}) => {
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-stone-500">{title}</span>
        {Icon && (
          <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-stone-900">{value}</span>
        {change && (
          <span
            className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            )}
          >
            {change}
          </span>
        )}
      </div>
      {description && <p className="mt-1 text-xs text-stone-400">{description}</p>}
    </Card>
  );
};
