'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { OrderListSkeleton } from '../../../components/ui/Skeleton';
import { ErrorState } from '../../../components/shared/ErrorState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ordersApi } from '../../../lib/api/orders';
import { orderSocketService } from '../../../lib/api/socketMock';
import { Order, OrderStatus } from '../../../types/order';
import { StaffOrderCard } from '../../../components/staff/StaffOrderCard';
import { Toast } from '../../../components/ui/Toast';
import { useAppDispatch } from '../../../store';
import { updateOrderStatusInStore } from '../../../store/slices/ordersSlice';
import { addNotification } from '../../../store/slices/notificationsSlice';
import { Utensils, CheckCircle2, RefreshCw } from 'lucide-react';

export default function StaffOrdersPage() {
  const dispatch = useAppDispatch();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'ready' | 'all'>('ready');
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string } | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersApi.getOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Unable to load orders pass.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const unsubscribe = orderSocketService.subscribeAll((updatedOrder: Order) => {
      setOrders((prev) => {
        const idx = prev.findIndex((o) => o.id === updatedOrder.id);
        if (idx > -1) {
          const updated = [...prev];
          updated[idx] = updatedOrder;
          return updated;
        } else {
          return [updatedOrder, ...prev];
        }
      });
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: OrderStatus) => {
    try {
      const updated = await ordersApi.updateOrderStatus(id, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));

      // Broadcast socket & Redux store updates
      orderSocketService.emitOrderUpdate(updated);
      dispatch(updateOrderStatusInStore({ id: updated.id, status: newStatus }));
      dispatch(
        addNotification({
          id: `notif-${Date.now()}`,
          type: 'info',
          title: `Dish Delivered: ${updated.orderNumber}`,
          message: `Order ${updated.orderNumber} served to Table #${updated.tableNumber}`,
          timestamp: new Date().toISOString(),
          read: false,
          orderId: updated.id,
        })
      );

      setToastMessage({ title: 'Order Served!', message: `${updated.orderNumber} delivered to Table #${updated.tableNumber}` });
    } catch (err) {
      setToastMessage({ title: 'Update Failed', message: 'Failed to update order status.' });
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (['served', 'completed', 'cancelled', 'rejected'].includes(o.status)) {
        return false;
      }
      if (filterTab === 'ready') {
        return o.status === 'ready';
      }
      return true;
    });
  }, [orders, filterTab]);

  const readyCount = useMemo(() => orders.filter((o) => o.status === 'ready').length, [orders]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-sm">
          <Toast type="info" title={toastMessage.title} message={toastMessage.message} onClose={() => setToastMessage(null)} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Utensils className="w-6 h-6 text-emerald-600" /> Food Pass & Order Delivery
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Deliver ready food items from the kitchen pass to table guests.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Pass
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-stone-200 gap-1 w-fit shadow-sm">
        <button
          onClick={() => setFilterTab('ready')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${
            filterTab === 'ready' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Food Ready for Delivery ({readyCount})
        </button>
        <button
          onClick={() => setFilterTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${
            filterTab === 'all' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          All Active Floor Orders ({orders.filter((o) => !['served', 'completed', 'cancelled', 'rejected'].includes(o.status)).length})
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          <span className="text-xs font-bold text-stone-400">Checking kitchen food pass...</span>
          <OrderListSkeleton count={4} />
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to load orders pass"
          message={error}
          onRetry={fetchOrders}
        />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No Orders Awaiting Delivery"
          description="All prepared kitchen dishes have been served to table guests."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((ord) => (
            <StaffOrderCard key={ord.id} order={ord} onUpdateStatus={handleUpdateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}
