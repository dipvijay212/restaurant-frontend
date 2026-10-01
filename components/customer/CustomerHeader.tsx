'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, BellRing } from 'lucide-react';
import { useAppSelector } from '../../store';

export const CustomerHeader: React.FC = () => {
  const cartItems = useAppSelector((state) => state.cart.items);
  const session = useAppSelector((state) => state.customerSession);
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const tableNumber = session.table?.tableNumber;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/menu" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            D
          </div>
          <div>
            <span className="font-bold text-stone-900 text-sm block">Demo Restaurant</span>
            {tableNumber && (
              <span className="text-xs text-amber-700 font-semibold">Table #{tableNumber}</span>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/requests"
            className="p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
            title="Call Waiter / Service Request"
          >
            <BellRing className="w-5 h-5" />
          </Link>

          <Link
            href="/cart"
            className="relative p-2 text-stone-800 hover:text-amber-600 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm">
                {totalQuantity}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
