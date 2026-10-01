'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Bell, Search, User, LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { toggleSidebar, setSearchQuery } from '../../store/slices/adminUiSlice';
import { logoutUser } from '../../store/slices/authSlice';

export const AdminHeader: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector((state) => state.adminUi.searchQuery);
  const unreadCount = useAppSelector((state) => state.notifications.unreadCount);
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-stone-200 h-16 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search orders, dishes, tables..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
          )}
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-stone-200">
          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
          <div className="hidden sm:block">
            <span className="text-xs font-bold text-stone-900 block">{user?.name || 'Staff User'}</span>
            <span className="text-[10px] text-amber-800 font-mono font-extrabold uppercase block">{user?.role || 'STAFF'}</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-stone-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors ml-1"
            title="Log Out Staff Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
