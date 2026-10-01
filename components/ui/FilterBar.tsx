import React from 'react';
import { cn } from '../../lib/utils';

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterBarProps {
  options: FilterOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  options,
  selectedValue,
  onChange,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar', className)}>
      {options.map((opt) => {
        const isSelected = selectedValue === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 border',
              isSelected
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            )}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 text-[10px] rounded-full font-bold',
                  isSelected ? 'bg-amber-700 text-amber-100' : 'bg-stone-100 text-stone-500'
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
