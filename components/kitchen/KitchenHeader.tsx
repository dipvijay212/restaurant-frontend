'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChefHat,
  Flame,
  History,
  ArrowLeft,
  LogOut,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  PlusCircle,
  Filter,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { Button } from '../ui/Button';

export interface KitchenHeaderProps {
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  highContrast?: boolean;
  onToggleHighContrast?: () => void;
  compactMode?: boolean;
  onToggleCompactMode?: () => void;
  onSimulateOrder?: () => void;
}

export const KitchenHeader: React.FC<KitchenHeaderProps> = ({
  soundEnabled = true,
  onToggleSound,
  isFullscreen = false,
  onToggleFullscreen,
  highContrast = false,
  onToggleHighContrast,
  compactMode = false,
  onToggleCompactMode,
  onSimulateOrder,
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
    { label: 'KDS Live Board', href: '/kitchen/orders', icon: Flame },
    { label: 'Order History', href: '/kitchen/history', icon: History },
  ];

  return (
    <header className="bg-stone-950 text-stone-100 border-b border-stone-800 sticky top-0 z-30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
            title="Back to Admin Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-stone-950 rounded-xl font-black">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base leading-none">Kitchen Display System</h1>
              <span className="text-[11px] text-amber-400 font-bold">Chef Station • Live Ticket Feed</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2 ml-4">
            {navs.map((item) => {
              const isActive = pathname === item.href || (pathname === '/kitchen' && item.href === '/kitchen/orders');
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-md'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Quick Action Controls & Sound/Screen Toggles */}
        <div className="flex items-center gap-2">
          {/* Mock Real-time Event Simulator */}
          {onSimulateOrder && (
            <button
              onClick={onSimulateOrder}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95"
              title="Simulate incoming real-time order"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Simulate Order</span>
            </button>
          )}

          {/* Sound Toggle */}
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-xl border transition-all ${
                soundEnabled
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-stone-800 border-stone-700 text-stone-400'
              }`}
              title={soundEnabled ? 'Mute Kitchen Audio Alert' : 'Enable Kitchen Audio Alert'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}

          {/* High Contrast / Dark Mode Toggle */}
          {onToggleHighContrast && (
            <button
              onClick={onToggleHighContrast}
              className={`p-2 rounded-xl border transition-all ${
                highContrast
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-stone-800 border-stone-700 text-stone-400'
              }`}
              title="Toggle High Contrast Kitchen Mode"
            >
              {highContrast ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {/* Compact Layout Toggle */}
          {onToggleCompactMode && (
            <button
              onClick={onToggleCompactMode}
              className={`p-2 rounded-xl border transition-all ${
                compactMode
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-stone-800 border-stone-700 text-stone-400'
              }`}
              title="Toggle Compact Card Grid"
            >
              <Filter className="w-4 h-4" />
            </button>
          )}

          {/* Fullscreen Mode Toggle */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-2 bg-stone-800 text-stone-300 hover:text-white rounded-xl border border-stone-700 transition-all"
              title="Toggle Fullscreen Tablet Mode"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          {/* User Info & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-stone-800 ml-1">
            <div className="hidden lg:block text-right">
              <span className="text-xs font-bold text-stone-200 block">{user?.name || 'Chef Station'}</span>
              <span className="text-[10px] text-amber-400 font-mono font-bold uppercase block">{user?.role || 'KITCHEN'}</span>
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
