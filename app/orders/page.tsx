'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CustomerHeader } from '../../components/customer/CustomerHeader';
import { CustomerBottomNav } from '../../components/customer/CustomerBottomNav';
import { OrderListSkeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ordersApi } from '../../lib/api/orders';
import { Order } from '../../types/order';
import { Clock, ChevronRight, ShoppingBag, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { useAppSelector } from '../../store';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const storeOrders = useAppSelector((state) => state.orders.orders);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersApi.getOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Unable to load your orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders, storeOrders]);

  const activeOrders = orders.filter((o) =>
    ['pending', 'accepted', 'preparing', 'ready'].includes(o.status)
  );
  const pastOrders = orders.filter((o) =>
    ['served', 'completed', 'cancelled', 'rejected'].includes(o.status)
  );

  return (
    <div className="min-h-screen bg-stone-50 pb-24 md:pb-8 flex flex-col">
      <CustomerHeader />

      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-stone-900">Your Orders</h1>
          <button
            onClick={loadOrders}
            className="p-2 text-stone-500 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors text-xs font-bold flex items-center gap-1"
            title="Refresh Orders"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <span className="text-xs font-bold text-stone-400">Loading your orders...</span>
            <OrderListSkeleton count={3} />
          </div>
        ) : error ? (
          <ErrorState
            title="Unable to load orders"
            message={error}
            onRetry={loadOrders}
          />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders yet."
            description="Explore our menu and place your first delicious dining order."
            actionLabel="Browse Menu"
            onAction={() => router.push('/menu')}
          />
        ) : (
          <>
            {/* Active Orders Section */}
            {activeOrders.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Active Dining Orders ({activeOrders.length})
                </h2>
                {activeOrders.map((ord) => (
                  <Link
                    key={ord.id}
                    href={`/orders/${ord.id}`}
                    className="block bg-white rounded-2xl p-4 border-2 border-amber-300 shadow-md hover:border-amber-500 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-black text-stone-900 text-base">{ord.orderNumber}</span>
                        <span className="text-xs text-amber-800 font-bold block">Table #{ord.tableNumber}</span>
                        <span className="text-[10px] text-stone-400 block">{formatDateTime(ord.createdAt)}</span>
                      </div>
                      <StatusBadge status={ord.status} />
                    </div>

                    <div className="text-xs text-stone-600 mb-3 line-clamp-1">
                      {ord.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs font-bold text-stone-900">
                      <span>Total: {formatCurrency(ord.totalAmount)}</span>
                      <span className="text-amber-600 flex items-center font-extrabold">
                        Track Real-Time Status <ChevronRight className="w-4 h-4 ml-0.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Past Orders Section */}
            {pastOrders.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Past Orders ({pastOrders.length})
                </h2>
                {pastOrders.map((ord) => (
                  <Link
                    key={ord.id}
                    href={`/orders/${ord.id}`}
                    className="block bg-white rounded-2xl p-4 border border-stone-100 shadow-sm hover:border-stone-300 transition-colors opacity-90"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-stone-900 text-sm">{ord.orderNumber}</span>
                        <span className="text-xs text-stone-400 block">{formatDateTime(ord.createdAt)}</span>
                      </div>
                      <StatusBadge status={ord.status} size="sm" />
                    </div>

                    <div className="text-xs text-stone-500 mb-2 line-clamp-1">
                      {ord.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs font-bold text-stone-700">
                      <span>Total: {formatCurrency(ord.totalAmount)}</span>
                      <span className="text-stone-400 flex items-center">
                        Details <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <CustomerBottomNav />
    </div>
  );
}
