import React from 'react';
import { ProductAddonGroup, ProductAddon } from '../../types/menu';
import { formatCurrency } from '../../lib/utils';
import { Check } from 'lucide-react';

export interface AddonSelectorProps {
  groups: ProductAddonGroup[];
  selectedAddons: ProductAddon[];
  onToggleAddon: (addon: ProductAddon) => void;
}

export const AddonSelector: React.FC<AddonSelectorProps> = ({
  groups,
  selectedAddons,
  onToggleAddon,
}) => {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.id} className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-stone-900 text-xs">{group.name}</h4>
            <span className="text-[10px] text-stone-400 font-medium">Optional • Multiple choice</span>
          </div>

          <div className="space-y-2">
            {group.addons.map((addon) => {
              const isSelected = selectedAddons.some((sa) => sa.id === addon.id);

              return (
                <div
                  key={addon.id}
                  onClick={() => addon.isAvailable && onToggleAddon(addon)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-xs'
                      : 'bg-white border-stone-200 text-stone-800 hover:border-amber-300'
                  } ${!addon.isAvailable && 'opacity-50 pointer-events-none'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-amber-600 border-amber-600 text-white' : 'border-stone-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs">{addon.name}</span>
                  </div>

                  <span className="text-xs font-semibold text-stone-700">
                    +{formatCurrency(addon.price)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
