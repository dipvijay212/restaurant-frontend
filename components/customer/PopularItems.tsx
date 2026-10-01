import React from 'react';
import { MenuItem } from '../../types/menu';
import { Sparkles, Plus, Clock } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../ui/Button';

export interface PopularItemsProps {
  products: MenuItem[];
  onAddToCart: (product: MenuItem) => void;
  onViewDetails?: (product: MenuItem) => void;
}

export const PopularItems: React.FC<PopularItemsProps> = ({
  products,
  onAddToCart,
  onViewDetails,
}) => {
  const populars = products.filter((p) => p.dietaryTags?.includes('chef-special'));
  if (populars.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-1.5 mb-3">
        <div className="p-1 bg-amber-100 text-amber-800 rounded-lg">
          <Sparkles className="w-4 h-4" />
        </div>
        <h2 className="font-extrabold text-stone-900 text-base">Popular & Chef Specials</h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {populars.map((product) => (
          <div
            key={product.id}
            className="w-56 flex-shrink-0 bg-white rounded-2xl p-3 border border-stone-100 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div
                className="relative rounded-xl overflow-hidden mb-2.5 h-32 bg-stone-100 cursor-pointer"
                onClick={() => onViewDetails?.(product)}
              >
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                  Chef Special
                </span>
              </div>

              <h3
                onClick={() => onViewDetails?.(product)}
                className="font-bold text-stone-900 text-xs line-clamp-1 mb-1 cursor-pointer hover:text-amber-600"
              >
                {product.name}
              </h3>
              <p className="text-[11px] text-stone-500 line-clamp-1 mb-3">{product.description}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-50">
              <span className="font-extrabold text-stone-900 text-xs">
                {formatCurrency(product.price)}
              </span>
              <Button
                size="sm"
                disabled={!product.isAvailable}
                onClick={() => onAddToCart(product)}
                className="rounded-xl px-2.5 py-1 text-[11px] font-bold"
              >
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
