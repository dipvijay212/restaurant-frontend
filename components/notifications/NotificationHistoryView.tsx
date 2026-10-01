'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  removeNotification, 
  clearNotifications 
} from '../../store/slices/notificationsSlice';
import { SystemAlert, NotificationAudience, NotificationCategory } from '../../types/notification';
import { PageHeader } from '../shared/PageHeader';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '../ui/ToastProvider';
import { mockNotificationEmitter } from '../../lib/socket/mockNotificationEmitter';
import { 
  Bell, 
  Search, 
  Filter, 
  CheckCheck, 
  Trash2, 
  ShoppingBag, 
  BellRing, 
  Receipt, 
  AlertTriangle, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  X,
  ArrowLeft
} from 'lucide-react';

export interface NotificationHistoryViewProps {
  audience?: NotificationAudience;
  backHref?: string;
}

export const NotificationHistoryView: React.FC<NotificationHistoryViewProps> = ({
  audience = 'all',
  backHref = '/admin',
}) => {
  const router = useRouter();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.notifications);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialogs
  const [isClearHistoryConfirmOpen, setIsClearHistoryConfirmOpen] = useState(false);
  const [isDeleteSelectedConfirmOpen, setIsDeleteSelectedConfirmOpen] = useState(false);

  // Filter by audience
  const audienceFiltered = notifications.filter((n) => {
    if (audience === 'all') return true;
    return n.audience === audience || n.audience === 'all';
  });

  // Filter by search, status, and category
  const filtered = audienceFiltered.filter((n) => {
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.orderId && n.orderId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (n.tableNumber && n.tableNumber.toString().includes(searchQuery));

    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'unread' ? !n.read : n.read;

    const matchesCategory = 
      categoryFilter === 'all' ? true : n.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const unreadCount = audienceFiltered.filter((n) => !n.read).length;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map((n) => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleMarkSelectedRead = () => {
    selectedIds.forEach((id) => dispatch(markNotificationAsRead(id)));
    toast.success(`Marked ${selectedIds.length} notification(s) as read.`);
    setSelectedIds([]);
  };

  const executeDeleteSelected = () => {
    const count = selectedIds.length;
    selectedIds.forEach((id) => dispatch(removeNotification(id)));
    toast.success(`Deleted ${count} notification(s).`);
    setSelectedIds([]);
    setIsDeleteSelectedConfirmOpen(false);
  };

  const executeClearHistory = () => {
    dispatch(clearNotifications(audience));
    toast.success('Notification history cleared.');
    setSelectedIds([]);
    setIsClearHistoryConfirmOpen(false);
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'new_order':
      case 'order_accepted':
      case 'order_preparing':
        return <ShoppingBag className="w-5 h-5 text-amber-600" />;
      case 'order_ready':
      case 'order_served':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'customer_request':
        return <BellRing className="w-5 h-5 text-orange-600" />;
      case 'bill_request':
      case 'bill_ready':
        return <Receipt className="w-5 h-5 text-blue-600" />;
      case 'delayed_order':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'payment_received':
      case 'payment_result':
        return <CreditCard className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-stone-600" />;
    }
  };

  const categoriesList = [
    { value: 'all', label: 'All Categories' },
    { value: 'new_order', label: 'New Orders' },
    { value: 'customer_request', label: 'Customer Requests' },
    { value: 'bill_request', label: 'Bill Requests' },
    { value: 'delayed_order', label: 'Delayed Orders' },
    { value: 'payment_received', label: 'Payments Received' },
    { value: 'order_accepted', label: 'Orders Accepted' },
    { value: 'order_preparing', label: 'Orders Preparing' },
    { value: 'order_ready', label: 'Orders Ready' },
    { value: 'order_served', label: 'Orders Served' },
    { value: 'bill_ready', label: 'Bills Ready' },
    { value: 'payment_result', label: 'Payment Results' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="p-2.5 text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <PageHeader 
            title="Notification History Center" 
            subtitle="View, search, filter, and manage all real-time system alerts and event logs."
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => dispatch(markAllNotificationsAsRead(audience))}
            className="text-xs font-bold py-2"
          >
            <CheckCheck className="w-4 h-4 mr-1.5" /> Mark All as Read
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setIsClearHistoryConfirmOpen(true)}
            className="text-xs font-bold py-2 border-rose-200 text-rose-700 hover:bg-rose-50"
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Clear History
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search notifications by title, order #, table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-stone-700"
            >
              <option value="all">All Read Statuses</option>
              <option value="unread">Unread Only ({unreadCount})</option>
              <option value="read">Read Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-stone-700"
            >
              {categoriesList.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Selected Batch Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between animate-in fade-in">
            <span className="text-xs font-bold text-amber-900">
              {selectedIds.length} notification(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkSelectedRead}
                className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors shadow-sm"
              >
                Mark Selected as Read
              </button>
              <button
                onClick={() => setIsDeleteSelectedConfirmOpen(true)}
                className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notifications Table / List */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        
        {/* Table Header */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedIds.length > 0 && selectedIds.length === filtered.length}
              onChange={handleSelectAll}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
            />
            <span>Notification Logs ({filtered.length})</span>
          </div>
          <span>Date & Time</span>
        </div>

        {/* List Content */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No matching notifications"
            description="No notifications were found matching your current search or status filters."
            actionLabel={
              searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Clear Filters'
                : undefined
            }
            onAction={
              searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                ? () => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setCategoryFilter('all');
                  }
                : undefined
            }
          />
        ) : (
          <div className="divide-y divide-stone-100">
            {filtered.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-amber-50/30 ${
                  !notif.read ? 'bg-amber-50/15' : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(notif.id)}
                    onChange={() => handleToggleSelect(notif.id)}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 mt-1"
                  />

                  <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl flex-shrink-0">
                    {getCategoryIcon(notif.category || 'general')}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-bold ${!notif.read ? 'text-stone-900' : 'text-stone-700'}`}>
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="px-2 py-0.5 bg-amber-500 text-white font-extrabold text-[10px] rounded-full">
                          NEW
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-600 font-mono text-[10px] rounded-full uppercase">
                        {(notif.category || 'general').replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      {notif.tableNumber && (
                        <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                          Table #{notif.tableNumber}
                        </span>
                      )}
                      {notif.orderId && (
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                          Order #{notif.orderId}
                        </span>
                      )}
                      {notif.amount && (
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          ${notif.amount.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
                  <div className="text-right text-xs text-stone-400 font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(notif.timestamp).toLocaleString()}
                  </div>

                  <div className="flex items-center gap-1">
                    {!notif.read ? (
                      <button
                        onClick={() => dispatch(markNotificationAsRead(notif.id))}
                        className="p-1.5 text-stone-400 hover:text-amber-600 rounded-lg hover:bg-stone-100 transition-colors"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="p-1.5 text-emerald-500" title="Read">
                        <CheckCircle className="w-4 h-4" />
                      </span>
                    )}

                    <button
                      onClick={() => {
                        dispatch(removeNotification(notif.id));
                        toast.success('Notification removed.');
                      }}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Confirm Clear History Dialog */}
      <ConfirmDialog
        isOpen={isClearHistoryConfirmOpen}
        title="Clear All Notifications"
        message="Are you sure you want to permanently clear all notifications in history? This action cannot be undone."
        confirmLabel="Clear All"
        cancelLabel="Keep History"
        variant="danger"
        onCancel={() => setIsClearHistoryConfirmOpen(false)}
        onConfirm={executeClearHistory}
      />

      {/* Confirm Delete Selected Dialog */}
      <ConfirmDialog
        isOpen={isDeleteSelectedConfirmOpen}
        title="Delete Selected Notifications"
        message={`Are you sure you want to permanently delete the ${selectedIds.length} selected notification(s)?`}
        confirmLabel="Delete Selected"
        cancelLabel="Cancel"
        variant="danger"
        onCancel={() => setIsDeleteSelectedConfirmOpen(false)}
        onConfirm={executeDeleteSelected}
      />
    </div>
  );
};
