'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  ChefHat,
  Grid,
  BookOpen,
  Users,
  Bell,
  Receipt,
  CreditCard,
  BarChart3,
  Settings,
  Utensils,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { toggleSidebar } from '../../store/slices/adminUiSlice';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.adminUi.sidebarOpen);

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Kitchen', href: '/admin/kitchen', icon: ChefHat },
    { label: 'Tables', href: '/admin/tables', icon: Grid },
    { label: 'Menu', href: '/admin/menu', icon: BookOpen },
    { label: 'Staff', href: '/admin/staff', icon: Users },
    { label: 'Requests', href: '/admin/requests', icon: Bell },
    { label: 'Bills', href: '/admin/bills', icon: Receipt },
    { label: 'Payments', href: '/admin/payments', icon: CreditCard },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => dispatch(toggleSidebar())}
          className="fixed inset-0 z-30 bg-stone-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-stone-900 text-stone-300 transition-all duration-300 flex flex-col border-r border-stone-800 ${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'
        }`}
      >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-stone-800">
        <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 bg-amber-600 text-white rounded-xl flex-shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
          {sidebarOpen && (
            <div className="truncate">
              <span className="font-bold text-white text-sm block truncate">Demo Admin</span>
              <span className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase block">Operations</span>
            </div>
          )}
        </Link>
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors hidden md:block"
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                isActive
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
              }`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Back to Portal Hub */}
      <div className="p-3 border-t border-stone-800">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white hover:bg-stone-800 transition-colors ${
            !sidebarOpen && 'justify-center'
          }`}
        >
          <Utensils className="w-4 h-4 flex-shrink-0 text-amber-500" />
          {sidebarOpen && <span>Exit to App Hub</span>}
        </Link>
      </div>
    </aside>
    </>
  );
};
