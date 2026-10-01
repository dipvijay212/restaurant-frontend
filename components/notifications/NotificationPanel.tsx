'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  removeNotification, 
  toggleSound 
} from '../../store/slices/notificationsSlice';
import { 
  NotificationAudience, 
  NotificationCategory, 
  SystemAlert 
} from '../../types/notification';
import { mockNotificationEmitter } from '../../lib/socket/mockNotificationEmitter';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  ShoppingBag, 
  BellRing, 
  Receipt, 
  AlertTriangle, 
  CreditCard, 
  CheckCircle, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  Clock,
  ArrowRight
} from 'lucide-react';

export interface NotificationPanelProps {
  audience?: NotificationAudience;
  onClose?: () => void;
}

type TabType = 'all' | 'unread' | 'orders' | 'requests' | 'payments';

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  audience = 'all',
  onClose,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.notifications);
  const soundEnabled = useAppSelector((state) => state.notifications.soundEnabled);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  // Filter notifications based on audience & active tab
  const audienceFiltered = notifications.filter((n) => {
    if (audience === 'all') return true;
    return n.audience === audience || n.audience === 'all';
  });

  const tabFiltered = audienceFiltered.filter((n) => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'orders') return ['new_order', 'order_accepted', 'order_preparing', 'order_ready', 'order_served', 'delayed_order'].includes(n.category || 'general');
    if (activeTab === 'requests') return ['customer_request', 'bill_request'].includes(n.category || 'general');
    if (activeTab === 'payments') return ['payment_received', 'payment_result', 'bill_ready'].includes(n.category || 'general');
    return true;
  });

  const unreadCount = audienceFiltered.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsAsRead(audience));
  };

  const handleItemClick = (notification: SystemAlert) => {
    if (!notification.read) {
      dispatch(markNotificationAsRead(notification.id));
    }

    if (onClose) onClose();

    // Direct navigation depending on category
    if (notification.category === 'new_order' || notification.category === 'delayed_order') {
      router.push('/admin/orders');
    } else if (notification.category === 'customer_request') {
      router.push('/admin/requests');
    } else if (notification.category === 'bill_request' || notification.category === 'bill_ready') {
      router.push('/admin/bills');
    } else if (notification.category === 'payment_received' || notification.category === 'payment_result') {
      router.push('/admin/payments');
    } else if (notification.category?.startsWith('order_')) {
      if (notification.orderId) {
        router.push(`/order/${notification.orderId}`);
      } else {
        router.push('/orders');
      }
    }
  };

  const getCategoryIcon = (category: NotificationCategory, type: string) => {
    switch (category) {
      case 'new_order':
      case 'order_accepted':
      case 'order_preparing':
        return <ShoppingBag className="w-4 h-4 text-amber-600" />;
      case 'order_ready':
      case 'order_served':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'customer_request':
        return <BellRing className="w-4 h-4 text-orange-600" />;
      case 'bill_request':
      case 'bill_ready':
        return <Receipt className="w-4 h-4 text-blue-600" />;
      case 'delayed_order':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'payment_received':
      case 'payment_result':
        return <CreditCard className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-stone-600" />;
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const demoCategories: { label: string; cat: NotificationCategory; target: string }[] = [
    { label: '🔔 New Order (Admin/Staff)', cat: 'new_order', target: 'Admin' },
    { label: '🙋 Customer Request (Admin/Staff)', cat: 'customer_request', target: 'Admin' },
    { label: '🧾 Bill Request (Admin/Staff)', cat: 'bill_request', target: 'Admin' },
    { label: '⚠️ Delayed Order (Admin/Staff)', cat: 'delayed_order', target: 'Admin' },
    { label: '💳 Payment Received (Admin/Staff)', cat: 'payment_received', target: 'Admin' },
    { label: '✅ Order Accepted (Customer)', cat: 'order_accepted', target: 'Customer' },
    { label: '🍳 Order Preparing (Customer)', cat: 'order_preparing', target: 'Customer' },
    { label: '🍽️ Order Ready (Customer)', cat: 'order_ready', target: 'Customer' },
    { label: '🎉 Order Served (Customer)', cat: 'order_served', target: 'Customer' },
    { label: '📄 Bill Ready (Customer)', cat: 'bill_ready', target: 'Customer' },
    { label: '💵 Payment Result (Customer)', cat: 'payment_result', target: 'Customer' },
  ];

  return (
    <div className="flex flex-col max-h-[550px] bg-white rounded-2xl shadow-xl text-stone-800">
      
      {/* Panel Header */}
      <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500 text-white rounded-lg">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-900 leading-tight">Notifications</h3>
            <span className="text-[10px] text-stone-500 font-medium">
              {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Demo Trigger Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="p-1.5 text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
              title="Simulate Real-time Socket Event"
            >
              <Sparkles className="w-3.5 h-3.5" /> Demo Event
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-stone-200 shadow-xl rounded-xl z-50 p-2 text-xs space-y-1 divide-y divide-stone-100 max-h-64 overflow-y-auto">
                <div className="text-[10px] font-bold text-stone-400 px-2 py-1 uppercase">Trigger Socket Event</div>
                {demoCategories.map((item) => (
                  <button
                    key={item.cat}
                    onClick={() => {
                      mockNotificationEmitter.triggerCategory(item.cat);
                      setShowDemoMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-amber-50 text-stone-700 font-medium flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sound Mute/Unmute */}
          <button
            type="button"
            onClick={() => dispatch(toggleSound())}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              soundEnabled ? 'text-amber-600 bg-amber-50' : 'text-stone-400 bg-stone-100'
            }`}
            title={soundEnabled ? 'Sound alerts enabled' : 'Sound alerts muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Mark All Read */}
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="p-1.5 text-stone-600 hover:text-amber-600 hover:bg-stone-100 rounded-lg text-xs font-medium transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}

          {/* Close Panel */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-2 bg-stone-100/60 border-b border-stone-100 overflow-x-auto text-[11px]">
        {(['all', 'unread', 'orders', 'requests', 'payments'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                : 'text-stone-500 hover:text-stone-800 hover:bg-white/50'
            }`}
          >
            {tab}
            {tab === 'unread' && unreadCount > 0 && (
              <span className="ml-1 px-1 bg-rose-500 text-white text-[9px] rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-stone-100 min-h-[200px] max-h-[360px]">
        {tabFiltered.length === 0 ? (
          <div className="p-8 text-center text-stone-400 space-y-2">
            <Bell className="w-8 h-8 mx-auto stroke-1 text-stone-300" />
            <p className="text-xs font-medium">No notifications in this category.</p>
          </div>
        ) : (
          tabFiltered.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleItemClick(notif)}
              className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group hover:bg-amber-50/40 ${
                !notif.read ? 'bg-amber-50/20 font-medium' : 'bg-white opacity-80'
              }`}
            >
              {/* Category Icon */}
              <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                !notif.read ? 'bg-white shadow-sm border border-stone-200' : 'bg-stone-100'
              }`}>
                {getCategoryIcon(notif.category || 'general', notif.type)}
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`text-xs font-bold truncate ${!notif.read ? 'text-stone-900' : 'text-stone-700'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-stone-400 flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-2.5 h-2.5" />
                    {formatRelativeTime(notif.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5 line-clamp-2 leading-snug">
                  {notif.message}
                </p>

                {/* Optional Table/Order Tags */}
                <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold">
                  {notif.tableNumber && (
                    <span className="px-1.5 py-0.5 bg-stone-100 text-stone-700 rounded-md">
                      Table #{notif.tableNumber}
                    </span>
                  )}
                  {notif.orderId && (
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                      #{notif.orderId}
                    </span>
                  )}
                  {notif.amount && (
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                      ${notif.amount.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Unread indicator & remove button */}
              <div className="flex flex-col items-center gap-1 self-center">
                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-200" title="Unread" />
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(removeNotification(notif.id));
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-rose-500 rounded transition-all"
                  title="Remove notification"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Panel Footer */}
      <div className="p-3 border-t border-stone-100 bg-stone-50 flex items-center justify-between text-xs">
        <Link
          href={audience === 'customer' ? '/notifications' : '/admin/notifications'}
          onClick={() => {
            if (onClose) onClose();
          }}
          className="font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 hover:underline text-xs"
        >
          View Notification History <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <span className="text-[10px] text-stone-400 font-mono">Socket.IO Ready</span>
      </div>
    </div>
  );
};
