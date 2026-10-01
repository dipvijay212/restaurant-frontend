import React from 'react';
import { ProductVariantGroup, ProductVariant } from '../../types/menu';
import { formatCurrency } from '../../lib/utils';
import { Check } from 'lucide-react';

export interface VariantSelectorProps {
  group: ProductVariantGroup;
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  group,
  selectedVariant,
  onSelectVariant,
}) => {
  return (
    <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-stone-900 text-xs">{group.name}</h4>
        {group.required ? (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-900 uppercase">
            Required
          </span>
        ) : (
          <span className="text-[10px] text-stone-400 font-medium">Optional</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {group.variants.map((v) => {
          const isSelected = selectedVariant?.id === v.id;

          return (
            <button
              key={v.id}
              type="button"
              disabled={!v.isAvailable}
              onClick={() => onSelectVariant(v)}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                isSelected
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm font-bold'
                  : 'bg-white text-stone-800 border-stone-200 hover:border-amber-300'
              } ${!v.isAvailable && 'opacity-50 pointer-events-none'}`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-white bg-white text-amber-600' : 'border-stone-300'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="text-xs">{v.name}</span>
              </div>

              {v.priceModifier > 0 && (
                <span className={`text-xs ${isSelected ? 'text-amber-100' : 'text-stone-500 font-medium'}`}>
                  +{formatCurrency(v.priceModifier)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
