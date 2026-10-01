'use client';

import React from 'react';
import Link from 'next/link';
import { Utensils, Bell } from 'lucide-react';
import { useAppSelector } from '../../store';

export const Header: React.FC = () => {
  const unreadCount = useAppSelector((state) => state.notifications.unreadCount);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="p-2 bg-amber-600 text-white rounded-xl">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-stone-900 leading-none block">Demo Restaurant</span>
            <span className="text-xs text-stone-500 font-medium">Smart Operations</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button className="p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
