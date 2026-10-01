'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, Grid, Bell, ShoppingBag, Receipt, ArrowLeft, LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';

export interface StaffHeaderProps {
  pendingRequestsCount?: number;
  readyOrdersCount?: number;
  pendingBillsCount?: number;
}

export const StaffHeader: React.FC<StaffHeaderProps> = ({
  pendingRequestsCount = 0,
  readyOrdersCount = 0,
  pendingBillsCount = 0,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push('/login');
  };

  const navs = [
    { label: 'Overview', href: '/staff', icon: Users, badge: 0 },
    { label: 'Tables', href: '/staff/tables', icon: Grid, badge: 0 },
    {
      label: 'Requests',
      href: '/staff/requests',
      icon: Bell,
      badge: pendingRequestsCount,
      badgeColor: 'bg-amber-500 text-stone-950',
    },
    {
      label: 'Ready Orders',
      href: '/staff/orders',
      icon: ShoppingBag,
      badge: readyOrdersCount,
      badgeColor: 'bg-emerald-500 text-stone-950',
    },
    {
      label: 'Bills',
      href: '/staff/bills',
      icon: Receipt,
      badge: pendingBillsCount,
      badgeColor: 'bg-rose-500 text-white',
    },
  ];

  return (
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
            title="Back to Admin"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-stone-950 rounded-xl font-black">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base leading-none">Waitstaff Portal</h1>
              <span className="text-[11px] text-amber-400 font-bold">Floor Operations Hub</span>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1.5 overflow-x-auto py-1">
            {navs.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all relative ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-md'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                  {item.badge > 0 && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 text-[10px] font-black rounded-full shadow-sm ${
                        item.badgeColor || 'bg-amber-400 text-stone-950'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-stone-800">
            <div className="hidden lg:block text-right">
              <span className="text-xs font-bold text-stone-200 block">{user?.name || 'Waitstaff Member'}</span>
              <span className="text-[10px] text-amber-400 font-mono font-bold uppercase block">{user?.role || 'WAITER'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-stone-400 hover:text-rose-400 rounded-xl hover:bg-stone-800 transition-colors"
              title="Log Out Staff Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
