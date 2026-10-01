import React from 'react';
import { CartItem as CartItemType } from '../../store/slices/cartSlice';
import { QuantitySelector } from './QuantitySelector';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-bold text-stone-900 text-sm">{item.productName || item.menuItem.name}</h4>

          {/* Selected Variant */}
          {item.selectedVariant && (
            <span className="inline-block text-[11px] font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 mt-1">
              Variant: {item.selectedVariant.variant.name}
              {item.selectedVariant.variant.priceModifier > 0 && ` (+${formatCurrency(item.selectedVariant.variant.priceModifier)})`}
            </span>
          )}

          {/* Selected Add-ons */}
          {item.selectedAddons && item.selectedAddons.length > 0 && (
            <div className="text-[11px] text-stone-600 font-medium mt-1">
              <span className="font-semibold text-stone-700">Add-ons: </span>
              {item.selectedAddons.map((a) => `${a.addon.name} (+${formatCurrency(a.addon.price)})`).join(', ')}
            </div>
          )}

          {/* Special Instructions */}
          {item.specialInstructions && (
            <p className="text-[11px] text-amber-700 italic mt-1 bg-amber-50/50 px-2 py-1 rounded-md border border-amber-100">
              Note: &quot;{item.specialInstructions}&quot;
            </p>
          )}
        </div>

        <button
          onClick={() => onRemove(item.id)}
          className="text-stone-400 hover:text-rose-600 p-1 rounded-lg"
          title="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
        <div>
          <span className="font-extrabold text-stone-900 text-sm block">
            {formatCurrency(item.itemTotal)}
          </span>
          <span className="text-[10px] text-stone-400">{formatCurrency(item.unitPrice)} each</span>
        </div>

        <QuantitySelector
          quantity={item.quantity}
          onIncrease={() => onUpdateQuantity(item.id, item.quantity + 1)}
          onDecrease={() => onUpdateQuantity(item.id, item.quantity - 1)}
        />
      </div>
    </div>
  );
};
