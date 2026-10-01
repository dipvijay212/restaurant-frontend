'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { ErrorState } from '../../../components/shared/ErrorState';
import { Modal } from '../../../components/ui/Modal';
import { TableSkeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { useToast } from '../../../components/ui/ToastProvider';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { ordersApi } from '../../../lib/api/orders';
import { tablesApi } from '../../../lib/api/tables';
import { Order, OrderItem, OrderStatus } from '../../../types/order';
import { Table } from '../../../types/table';
import { formatCurrency, formatDateTime } from '../../../lib/utils';
import {
  ShoppingBag,
  Search,
  Filter,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChefHat,
  Sparkles,
  Utensils,
  Award,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

const DELAY_THRESHOLD_MINUTES = 15;

export default function AdminOrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [statusTab, setStatusTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTableFilter, setSelectedTableFilter] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');

  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Destructive Action Confirmation State
  const [actionToConfirm, setActionToConfirm] = useState<{
    orderId: string;
    orderNumber: string;
    nextStatus: OrderStatus;
    actionLabel: string;
  } | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchOrdersAndTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ords, tbls] = await Promise.all([
        ordersApi.getOrders(),
        tablesApi.getTables(),
      ]);
      setOrders(ords);
      setTables(tbls);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndTables();
  }, []);

  // Filter Logic
  const filteredOrders = orders.filter((o) => {
    // Status tab filter
    const normalizedStatus = o.status.toUpperCase();
    if (statusTab !== 'ALL' && normalizedStatus !== statusTab) {
      return false;
    }

    // Table filter
    if (selectedTableFilter !== 'all' && o.tableNumber !== Number(selectedTableFilter)) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchCustomer = o.customerName.toLowerCase().includes(q);
      const matchDish = o.items.some((i) => i.menuItem.name.toLowerCase().includes(q));
      if (!matchNum && !matchCustomer && !matchDish) return false;
    }

    return true;
  });

  // Calculate if order is delayed
  const isOrderDelayed = (order: Order) => {
    const st = order.status.toUpperCase();
    if (['READY', 'SERVED', 'COMPLETED', 'CANCELLED', 'REJECTED'].includes(st)) {
      return false;
    }
    const createdMs = new Date(order.createdAt).getTime();
    const elapsedMinutes = (Date.now() - createdMs) / (1000 * 60);
    return elapsedMinutes >= DELAY_THRESHOLD_MINUTES;
  };

  // Status transition validity rules
  const getValidNextStatuses = (currentStatus: OrderStatus) => {
    const st = currentStatus.toUpperCase();
    switch (st) {
      case 'PENDING':
        return [
          { status: 'ACCEPTED', label: 'Accept Order', variant: 'primary', icon: CheckCircle2 },
          { status: 'REJECTED', label: 'Reject Order', variant: 'danger', icon: XCircle },
        ];
      case 'ACCEPTED':
        return [
          { status: 'PREPARING', label: 'Start Preparing', variant: 'primary', icon: ChefHat },
          { status: 'CANCELLED', label: 'Cancel Order', variant: 'danger', icon: XCircle },
        ];
      case 'PREPARING':
        return [
          { status: 'READY', label: 'Mark Ready', variant: 'primary', icon: Sparkles },
        ];
      case 'READY':
        return [
          { status: 'SERVED', label: 'Serve to Table', variant: 'primary', icon: Utensils },
        ];
      case 'SERVED':
        return [
          { status: 'COMPLETED', label: 'Complete Order', variant: 'success', icon: Award },
        ];
      default:
        return [];
    }
  };

  const handleInitiateStatusUpdate = (orderId: string, orderNumber: string, nextStatus: OrderStatus, actionLabel: string) => {
    if (nextStatus === 'REJECTED' || nextStatus === 'CANCELLED') {
      setActionToConfirm({ orderId, orderNumber, nextStatus, actionLabel });
      setIsConfirmOpen(true);
      return;
    }
    executeStatusUpdate(orderId, nextStatus, actionLabel);
  };

  const executeStatusUpdate = async (orderId: string, nextStatus: OrderStatus, actionLabel: string) => {
    try {
      setUpdatingOrderId(orderId);
      const updated = await ordersApi.updateOrderStatus(orderId, nextStatus, `Staff action: ${actionLabel}`);
      fetchOrdersAndTables();

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }

      toast.success(`Order ${updated.orderNumber} is now ${nextStatus.toUpperCase()}.`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
      setIsConfirmOpen(false);
      setActionToConfirm(null);
    }
  };

  const openOrderDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  if (error) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader
          title="Order Management Console"
          subtitle="Live dining order queue, status transitions, table filters, and delayed order alerts."
        />
        <ErrorState
          title="Failed to Load Orders"
          message={error}
          onRetry={fetchOrdersAndTables}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader
          title="Order Management Console"
          subtitle="Live dining order queue, status transitions, table filters, and delayed order alerts."
        />
        <TableSkeleton rows={8} columns={7} />
      </div>
    );
  }

  const statusTabsList = [
    { key: 'ALL', label: 'All Orders' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'PREPARING', label: 'Preparing' },
    { key: 'READY', label: 'Ready' },
    { key: 'SERVED', label: 'Served' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' },
    { key: 'REJECTED', label: 'Rejected' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Order Management Console"
        subtitle="Live dining order queue, status transitions, table filters, and delayed order alerts."
      />

      {/* Filter Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-sm space-y-4">
        {/* Status Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-stone-100">
          {statusTabsList.map((tab) => {
            const count =
              tab.key === 'ALL'
                ? orders.length
                : orders.filter((o) => o.status.toUpperCase() === tab.key).length;
            const isActive = statusTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setStatusTab(tab.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-50 text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${isActive ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Order #, guest, or dish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Table Filter */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-500 flex-shrink-0">Table:</span>
            <select
              value={selectedTableFilter}
              onChange={(e) => setSelectedTableFilter(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Tables</option>
              {tables.map((t) => (
                <option key={t.id} value={t.tableNumber}>
                  Table #{t.tableNumber} ({t.area})
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-500 flex-shrink-0">Date:</span>
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
            </select>
          </div>
        </div>
      </div>

      {/* ---------------- ORDERS LIST TABLE ---------------- */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-400 text-[11px] uppercase tracking-wider font-extrabold">
              <tr>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Table</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items Summary</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4">
                    <EmptyState
                      icon={ShoppingBag}
                      title={orders.length === 0 ? "No orders yet." : "No orders match your filter"}
                      description={
                        orders.length === 0
                          ? "Incoming customer orders placed from table QR codes will appear here automatically."
                          : "Try resetting your search query or switching the status filter tab."
                      }
                      actionLabel={orders.length > 0 ? "Reset Filters" : undefined}
                      onAction={
                        orders.length > 0
                          ? () => {
                              setStatusTab('ALL');
                              setSearchQuery('');
                              setSelectedTableFilter('all');
                              setSelectedDateFilter('all');
                            }
                          : undefined
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const delayed = isOrderDelayed(ord);
                  const validNext = getValidNextStatuses(ord.status);

                  return (
                    <tr
                      key={ord.id}
                      className={`transition-colors ${
                        delayed ? 'bg-amber-50/70 hover:bg-amber-100/50' : 'hover:bg-stone-50/70'
                      }`}
                    >
                      {/* Order # */}
                      <td className="py-3.5 px-4 font-black text-stone-900">
                        <div className="flex items-center gap-2">
                          <span>{ord.orderNumber}</span>
                          {delayed && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[9px] uppercase animate-pulse flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" /> Delayed
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Table */}
                      <td className="py-3.5 px-4 font-extrabold text-stone-800">Table #{ord.tableNumber || 'N/A'}</td>

                      {/* Customer */}
                      <td className="py-3.5 px-4 font-medium text-stone-700">{ord.customerName}</td>

                      {/* Items Summary */}
                      <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">
                        {ord.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-black text-stone-900 text-sm">{formatCurrency(ord.totalAmount)}</td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={ord.status} size="sm" />
                      </td>

                      {/* Valid Actions Only */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Next State Quick Transition Action Buttons */}
                          {validNext.map((act) => {
                            const Icon = act.icon;
                            return (
                              <Button
                                key={act.status}
                                onClick={() => handleInitiateStatusUpdate(ord.id, ord.orderNumber, act.status as OrderStatus, act.label)}
                                variant={act.variant as any}
                                size="sm"
                                isLoading={updatingOrderId === ord.id}
                                className="text-[11px] py-1 px-2.5 font-extrabold rounded-xl"
                              >
                                <Icon className="w-3 h-3 mr-1" /> {act.label}
                              </Button>
                            );
                          })}

                          <Button
                            onClick={() => openOrderDetailModal(ord)}
                            variant="outline"
                            size="sm"
                            className="text-[11px] py-1 px-2.5 font-bold rounded-xl border-stone-200"
                          >
                            <Eye className="w-3 h-3 mr-1 text-amber-600" /> View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- ORDER DETAIL MODAL ---------------- */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Order ${selectedOrder?.orderNumber} Details`}
      >
        {selectedOrder && (
          <div className="space-y-4 pt-2 text-xs">
            {/* Delayed Alert Banner */}
            {isOrderDelayed(selectedOrder) && (
              <div className="bg-rose-50 border border-rose-300 rounded-2xl p-3 text-rose-900 flex items-center gap-2 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>Delayed Order: Kitchen preparation time has exceeded 15 minutes.</span>
              </div>
            )}

            {/* Header Summary */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-stone-900 mb-0.5">{selectedOrder.orderNumber}</h3>
                <span className="text-[11px] text-amber-900 font-bold block">
                  Table #{selectedOrder.tableNumber} • Guest: {selectedOrder.customerName}
                </span>
                <span className="text-[10px] text-stone-400 block font-mono">
                  Session ID: {selectedOrder.sessionId || `sess-${selectedOrder.tableNumber}`}
                </span>
                <span className="text-[10px] text-stone-400 block">{formatDateTime(selectedOrder.createdAt)}</span>
              </div>
              <StatusBadge status={selectedOrder.status} />
            </div>

            {/* Itemized Items, Variants, Addons, Special Instructions */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 space-y-3">
              <span className="font-bold text-stone-900 uppercase tracking-wider text-[11px] block">
                Ordered Dishes ({selectedOrder.items.reduce((acc, i) => acc + i.quantity, 0)})
              </span>

              <div className="space-y-3">
                {selectedOrder.items.map((item: OrderItem) => (
                  <div key={item.id} className="pb-3 border-b border-stone-100 last:border-0 space-y-0.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-extrabold text-stone-900">
                        <span className="text-amber-800">{item.quantity}x </span>
                        {item.menuItem.name}
                      </span>
                      <span className="font-bold text-stone-900">{formatCurrency(item.totalPrice)}</span>
                    </div>

                    {/* Options / Variants / Addons */}
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <div className="text-[11px] text-stone-500 pl-4 border-l-2 border-stone-200">
                        Add-ons / Variants: {item.selectedOptions.map((o) => o.option.name).join(', ')}
                      </div>
                    )}

                    {/* Special Instructions */}
                    {item.specialInstructions && (
                      <p className="text-[11px] text-amber-800 italic bg-amber-50 p-2 rounded-xl">
                        Note: &quot;{item.specialInstructions}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Financial Breakdown */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-1.5 text-stone-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900">{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discountAmount && selectedOrder.discountAmount > 0 ? (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span className="font-bold">-{formatCurrency(selectedOrder.discountAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-bold text-stone-900">{formatCurrency(selectedOrder.taxAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Charge</span>
                <span className="font-bold text-stone-900">{formatCurrency(selectedOrder.serviceCharge)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-200">
                <span>Grand Total</span>
                <span className="text-amber-700">{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Status History Timeline */}
            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-stone-200 space-y-2">
                <span className="font-bold text-stone-900 uppercase tracking-wider text-[11px] block">
                  Status History Timeline
                </span>
                <div className="space-y-2">
                  {selectedOrder.statusHistory.map((h, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] border-b border-stone-50 pb-1.5 last:border-0">
                      <span className="font-bold text-stone-800 uppercase">{h.status}</span>
                      <span className="text-stone-400">{formatDateTime(h.timestamp)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Valid State Action Buttons */}
            {getValidNextStatuses(selectedOrder.status).length > 0 && (
              <div className="pt-2 flex gap-2">
                {getValidNextStatuses(selectedOrder.status).map((act) => {
                  const Icon = act.icon;
                  return (
                    <Button
                      key={act.status}
                      onClick={() => handleInitiateStatusUpdate(selectedOrder.id, selectedOrder.orderNumber, act.status as OrderStatus, act.label)}
                      variant={act.variant as any}
                      isLoading={updatingOrderId === selectedOrder.id}
                      className="flex-1 py-3 font-extrabold text-xs rounded-2xl shadow-sm"
                    >
                      <Icon className="w-4 h-4 mr-1.5" /> {act.label}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog: Order Cancellation / Rejection */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setActionToConfirm(null);
        }}
        onConfirm={() => {
          if (actionToConfirm) {
            executeStatusUpdate(
              actionToConfirm.orderId,
              actionToConfirm.nextStatus,
              actionToConfirm.actionLabel
            );
          }
        }}
        title={`${actionToConfirm?.actionLabel} ${actionToConfirm?.orderNumber}?`}
        description={`Are you sure you want to mark order ${actionToConfirm?.orderNumber} as ${actionToConfirm?.nextStatus}? This is a destructive action and cannot be undone.`}
        confirmText={actionToConfirm?.actionLabel || 'Confirm'}
        variant="danger"
        isLoading={Boolean(updatingOrderId)}
      />
    </div>
  );
}
