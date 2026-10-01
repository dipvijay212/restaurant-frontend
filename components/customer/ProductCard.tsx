import React from 'react';
import { MenuItem } from '../../types/menu';
import { Button } from '../ui/Button';
import { Plus, Clock, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { StatusBadge } from '../ui/StatusBadge';

export interface ProductCardProps {
  product: MenuItem;
  onAddToCart: (product: MenuItem) => void;
  onViewDetails?: (product: MenuItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
}) => {
  const isVeg = product.dietaryTags?.includes('vegetarian') || product.dietaryTags?.includes('vegan');

  return (
    <div
      className={`bg-white rounded-2xl p-4 border transition-all flex gap-4 items-center ${
        !product.isAvailable
          ? 'border-stone-200 bg-stone-50/70 opacity-80'
          : 'border-stone-100 shadow-sm hover:border-amber-300'
      }`}
    >
      {/* Product Image & Badges */}
      <div className="relative flex-shrink-0 cursor-pointer" onClick={() => onViewDetails?.(product)}>
        <img
          src={product.image}
          alt={product.name}
          className="w-24 h-24 rounded-xl object-cover bg-stone-100"
        />

        {/* Veg / Non-Veg Indicator Icon */}
        <div className="absolute top-1.5 left-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-md shadow-sm border border-stone-200">
          <div
            className={`w-3 h-3 rounded-full flex items-center justify-center border ${
              isVeg ? 'border-emerald-600 bg-emerald-500' : 'border-rose-600 bg-rose-500'
            }`}
          />
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3
            onClick={() => onViewDetails?.(product)}
            className="font-bold text-stone-900 text-sm truncate cursor-pointer hover:text-amber-600"
          >
            {product.name}
          </h3>

          {!product.isAvailable ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 flex-shrink-0">
              Sold Out
            </span>
          ) : (
            product.dietaryTags?.includes('chef-special') && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-0.5 flex-shrink-0">
                <Sparkles className="w-2.5 h-2.5" /> Popular
              </span>
            )
          )}
        </div>

        <p className="text-xs text-stone-500 line-clamp-2 mb-2">{product.description}</p>

        {/* Footer: Price, Prep Time, Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-extrabold text-stone-900 text-sm block">
              {formatCurrency(product.price)}
            </span>
            {product.preparationTimeMinutes && (
              <span className="text-[10px] text-stone-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-400" /> {product.preparationTimeMinutes} min
              </span>
            )}
          </div>

          <Button
            size="sm"
            disabled={!product.isAvailable}
            onClick={() => onAddToCart(product)}
            className="rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
};
