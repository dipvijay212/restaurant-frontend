'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useAppSelector } from '../../store';
import { NotificationAudience } from '../../types/notification';
import { NotificationPanel } from './NotificationPanel';
import { initializeNotificationSocketListeners } from '../../lib/socket/notificationsSocket';

export interface NotificationBellProps {
  audience?: NotificationAudience;
  className?: string;
}

let socketInitialized = false;

export const NotificationBell: React.FC<NotificationBellProps> = ({
  audience = 'all',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socketInitialized) {
      initializeNotificationSocketListeners();
      socketInitialized = true;
    }
  }, []);

  const notifications = useAppSelector((state) => state.notifications.notifications);
  
  // Calculate unread count filtered by audience
  const filteredUnreadCount = notifications.filter((n) => {
    if (n.read) return false;
    if (audience === 'all') return true;
    return n.audience === audience || n.audience === 'all';
  }).length;

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        title="Notifications Center"
        aria-label="Toggle notifications"
      >
        <Bell className="w-5 h-5 text-stone-700 hover:text-amber-600 transition-colors" />
        {filteredUnreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-rose-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white shadow-md animate-pulse">
            {filteredUnreadCount > 99 ? '99+' : filteredUnreadCount}
          </span>
        )}
      </button>

      {/* Notification Flyout Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 shadow-2xl rounded-2xl bg-white border border-stone-200 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <NotificationPanel audience={audience} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
};
