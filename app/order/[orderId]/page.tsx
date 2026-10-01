'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CustomerHeader } from '../../../components/customer/CustomerHeader';
import { CustomerBottomNav } from '../../../components/customer/CustomerBottomNav';
import { OrderStatusTimeline } from '../../../components/customer/OrderStatusTimeline';
import { BillSummary } from '../../../components/customer/BillSummary';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { ErrorState } from '../../../components/shared/ErrorState';
import { Button } from '../../../components/ui/Button';
import { Toast } from '../../../components/ui/Toast';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Skeleton } from '../../../components/ui/Skeleton';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ordersApi } from '../../../lib/api/orders';
import { orderSocketService } from '../../../lib/api/socketMock';
import { Order, OrderItem, OrderStatus } from '../../../types/order';
import { useAppDispatch } from '../../../store';
import { updateOrderStatusInStore } from '../../../store/slices/ordersSlice';
import { addNotification } from '../../../store/slices/notificationsSlice';
import { Clock, Receipt, XCircle, ChevronLeft } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../../lib/utils';
import Link from 'next/link';

// Configurable delay threshold in minutes (e.g., 15 min)
const DELAY_THRESHOLD_MINUTES = 15;

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string } | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Calculate if order is taking longer than expected
  const isDelayed = React.useMemo(() => {
    if (!order) return false;
    if (['ready', 'served', 'completed', 'cancelled', 'rejected'].includes(order.status)) {
      return false;
    }
    const createdTime = new Date(order.createdAt).getTime();
    const nowTime = new Date().getTime();
    const elapsedMinutes = (nowTime - createdTime) / (1000 * 60);
    return elapsedMinutes >= DELAY_THRESHOLD_MINUTES;
  }, [order]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersApi.getOrderById(orderId);
      if (data) {
        setOrder(data);
        orderSocketService.startSimulation(data);
      } else {
        setError('Order not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  // Subscribe to Socket.IO real-time event simulation
  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = orderSocketService.subscribe(orderId, (updatedOrder: Order) => {
      setOrder((prev: Order | null) => {
        if (prev && prev.status !== updatedOrder.status) {
          // Trigger Redux store updates
          dispatch(updateOrderStatusInStore({ id: updatedOrder.id, status: updatedOrder.status }));
          dispatch(
            addNotification({
              id: `notif-${Date.now()}`,
              type: 'info',
              title: `Order Status: ${updatedOrder.status.toUpperCase()}`,
              message: `Your order ${updatedOrder.orderNumber} status is now ${updatedOrder.status}.`,
              timestamp: new Date().toISOString(),
              read: false,
              orderId: updatedOrder.id,
            })
          );

          // Show real-time notification toast
          setToastMessage({
            title: `Order Status Updated: ${updatedOrder.status.toUpperCase()}`,
            message: `Your order ${updatedOrder.orderNumber} is now ${updatedOrder.status}.`,
          });
        }
        return updatedOrder;
      });
    });

    return () => {
      unsubscribe();
    };
  }, [orderId, dispatch]);

  // Handle Order Cancellation (Allowed ONLY when status === 'pending')
  const canCancel = order?.status === 'pending';

  const handleConfirmCancel = async () => {
    if (!order || !canCancel) return;
    try {
      setCancelling(true);
      const updated = await ordersApi.updateOrderStatus(order.id, 'cancelled');
      setOrder(updated);
      dispatch(updateOrderStatusInStore({ id: updated.id, status: 'cancelled' }));
      setIsCancelModalOpen(false);
      setToastMessage({
        title: 'Order Cancelled',
        message: `Order ${order.orderNumber} has been cancelled.`,
      });
    } catch (err: any) {
      setToastMessage({
        title: 'Cancellation Failed',
        message: err.message || 'Failed to cancel order. Please ask waitstaff for assistance.',
      });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 pb-24 md:pb-8 flex flex-col">
        <CustomerHeader />
        <main className="flex-1 max-w-md mx-auto w-full px-4 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <Skeleton className="h-7 w-28 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
              <Skeleton className="h-6 w-20 rounded-xl" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm space-y-4">
            <Skeleton className="h-4 w-32 rounded" />
            <div className="flex justify-between items-center px-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-1 flex-1 mx-2 rounded" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-1 flex-1 mx-2 rounded" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm space-y-3">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="pt-3 border-t border-stone-100 flex justify-between">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-5 w-20 rounded" />
            </div>
          </div>
        </main>
        <CustomerBottomNav />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-stone-50 pb-24 md:pb-8 flex flex-col">
        <CustomerHeader />
        <main className="flex-1 max-w-md mx-auto w-full px-4 pt-4">
          <ErrorState
            title="Unable to load order"
            message={error || 'We could not find the requested dining order.'}
            onRetry={loadOrder}
          />
        </main>
        <CustomerBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-24 md:pb-8 flex flex-col">
      <CustomerHeader />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto">
          <Toast
            type="info"
            title={toastMessage.title}
            message={toastMessage.message}
            onClose={() => setToastMessage(null)}
          />
        </div>
      )}

      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-4">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/orders" className="inline-flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-stone-900">
            <ChevronLeft className="w-4 h-4" /> All Orders
          </Link>
          <StatusBadge status={order.status} />
        </div>

        {/* Delayed Order Banner */}
        {isDelayed && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-4 text-amber-950 text-xs flex gap-3 items-center animate-in fade-in">
            <Clock className="w-6 h-6 flex-shrink-0 text-amber-600" />
            <div>
              <span className="font-extrabold block text-sm">Your order is taking longer than expected.</span>
              <span>Our kitchen team is working hard to prepare your fresh meal. Thank you for your patience!</span>
            </div>
          </div>
        )}

        {/* Order Header Summary Card */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm mb-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-2xl font-black text-stone-900">{order.orderNumber}</h1>
              <span className="text-xs text-stone-400 block">{formatDateTime(order.createdAt)}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-amber-100 text-amber-900 block mb-1">
                Table #{order.tableNumber}
              </span>
              <span className="text-[11px] text-stone-500 font-medium capitalize">{order.orderType}</span>
            </div>
          </div>
        </div>

        {/* Live Status Timeline */}
        <OrderStatusTimeline status={order.status} className="mb-4" />

        {/* Ordered Items List */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm mb-4">
          <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-stone-400 mb-3">
            Items Ordered ({order.items.reduce((acc: number, i: OrderItem) => acc + i.quantity, 0)})
          </h3>

          <div className="space-y-3 mb-4">
            {order.items.map((item: OrderItem) => (
              <div key={item.id} className="pb-3 border-b border-stone-50 last:border-0">
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <span className="font-extrabold text-stone-900">{item.quantity}x </span>
                    <span className="text-stone-800 font-bold">{item.menuItem.name}</span>
                  </div>
                  <span className="font-extrabold text-stone-900">{formatCurrency(item.totalPrice)}</span>
                </div>

                {item.selectedOptions && item.selectedOptions.length > 0 && (
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    Options: {item.selectedOptions.map((o) => o.option.name).join(', ')}
                  </div>
                )}

                {item.specialInstructions && (
                  <p className="text-[11px] text-amber-700 italic mt-0.5">
                    Note: &quot;{item.specialInstructions}&quot;
                  </p>
                )}
              </div>
            ))}
          </div>

          <BillSummary
            subtotal={order.subtotal}
            taxAmount={order.taxAmount}
            serviceCharge={order.serviceCharge}
            totalAmount={order.totalAmount}
          />
        </div>

        {/* Actions & Cancellation */}
        <div className="space-y-3">
          <Button onClick={() => router.push('/bill')} variant="primary" className="w-full py-3.5 rounded-2xl font-bold">
            <Receipt className="w-4 h-4 mr-2" /> View Bill & Settle Payment
          </Button>

          {canCancel ? (
            <Button
              onClick={() => setIsCancelModalOpen(true)}
              variant="outline"
              className="w-full py-3 rounded-2xl text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              <XCircle className="w-4 h-4 mr-1.5" /> Cancel Order
            </Button>
          ) : (
            !['cancelled', 'rejected', 'completed', 'served'].includes(order.status) && (
              <p className="text-[11px] text-center text-stone-400 italic">
                Orders in preparation cannot be cancelled online. Please ask waitstaff for assistance.
              </p>
            )
          )}
        </div>
      </main>

      {/* Order Cancellation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Order?"
        description={`Are you sure you want to cancel ${order.orderNumber}? This action cannot be undone.`}
        confirmText="Yes, Cancel Order"
        variant="danger"
        isLoading={cancelling}
      />

      <CustomerBottomNav />
    </div>
  );
}
