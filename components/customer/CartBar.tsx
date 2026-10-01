import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export interface CartBarProps {
  itemCount: number;
  totalAmount: number;
  href?: string;
}

export const CartBar: React.FC<CartBarProps> = ({
  itemCount,
  totalAmount,
  href = '/cart',
}) => {
  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-30 px-4 max-w-md mx-auto md:bottom-6">
      <Link
        href={href}
        className="flex items-center justify-between bg-stone-900 text-white rounded-2xl p-4 shadow-xl border border-stone-800 hover:bg-amber-600 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
            {itemCount}
          </div>
          <div>
            <span className="text-xs font-semibold text-stone-300 block">View Cart</span>
            <span className="text-sm font-extrabold text-white">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-400">
          <span>Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </Link>
    </div>
  );
};
