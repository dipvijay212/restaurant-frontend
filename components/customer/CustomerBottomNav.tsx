'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UtensilsCrossed, ShoppingBag, Clock, Receipt, BellRing } from 'lucide-react';
import { useAppSelector } from '../../store';

export const CustomerBottomNav: React.FC = () => {
  const pathname = usePathname();
  const cartItems = useAppSelector((state) => state.cart.items);
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { label: 'Menu', href: '/menu', icon: UtensilsCrossed },
    { label: 'Cart', href: '/cart', icon: ShoppingBag, badge: totalQuantity > 0 ? totalQuantity : undefined },
    { label: 'Orders', href: '/orders', icon: Clock },
    { label: 'Service', href: '/requests', icon: BellRing },
    { label: 'Bill', href: '/bill', icon: Receipt },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 py-2 px-4 md:hidden">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/menu' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                isActive ? 'text-amber-600 font-bold' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
