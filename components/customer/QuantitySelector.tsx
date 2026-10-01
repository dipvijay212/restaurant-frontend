import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  className?: string;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 99,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-3 bg-stone-100 rounded-xl px-3 py-1.5', className)}>
      <button
        type="button"
        disabled={quantity <= min}
        onClick={onDecrease}
        className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:pointer-events-none"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="text-sm font-extrabold text-stone-900 w-6 text-center">{quantity}</span>
      <button
        type="button"
        disabled={quantity >= max}
        onClick={onIncrease}
        className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:pointer-events-none"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
