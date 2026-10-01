'use client';

import React, { useEffect, useState } from 'react';
import { ordersApi } from '../../../lib/api/orders';
import { Order } from '../../../types/order';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { ErrorState } from '../../../components/shared/ErrorState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatCurrency, formatDateTime } from '../../../lib/utils';
import { KitchenHeader } from '../../../components/kitchen/KitchenHeader';
import { Search, CheckCircle2, History, Utensils, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function KitchenHistoryPage() {
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersApi.getOrders();
      setCompletedOrders(data.filter((o) => ['served', 'completed'].includes(o.status)));
    } catch (err: any) {
      console.error('Failed to load kitchen history:', err);
      setError(err?.message || 'Unable to load kitchen order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filtered = completedOrders.filter((ord) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      ord.orderNumber.toLowerCase().includes(q) ||
      (ord.tableNumber && ord.tableNumber.toString().includes(q)) ||
      ord.customerName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      <KitchenHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/kitchen/orders" className="text-stone-400 hover:text-white p-1 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <History className="w-6 h-6 text-amber-500" /> Kitchen Order History
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-1 pl-8">
              Archived view of fulfilled and served tickets for this dining shift.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold">
              {completedOrders.length} Fulfilled Tickets
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search completed ticket # or Table #..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {error ? (
          <ErrorState
            title="Failed to Load History"
            message={error}
            onRetry={loadHistory}
          />
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-stone-900 rounded-2xl p-5 border border-stone-800 space-y-4">
                <div className="flex justify-between items-start pb-3 border-b border-stone-800">
                  <div className="space-y-1.5">
                    <Skeleton className="h-6 w-24 bg-stone-800" />
                    <Skeleton className="h-3 w-36 bg-stone-800" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-lg bg-stone-800" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-stone-800" />
                  <Skeleton className="h-4 w-3/4 bg-stone-800" />
                </div>
                <div className="pt-3 border-t border-stone-800 flex justify-between">
                  <Skeleton className="h-3 w-24 bg-stone-800" />
                  <Skeleton className="h-4 w-16 bg-stone-800" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title={searchQuery ? "No Matching Orders Found" : "No Fulfilled Tickets Found"}
            description={searchQuery ? "Try searching for a different order number or table." : "No served orders recorded yet for this shift."}
            actionLabel={searchQuery ? "Clear Search" : undefined}
            onAction={searchQuery ? () => setSearchQuery('') : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ord) => (
              <div
                key={ord.id}
                className="bg-stone-900 rounded-2xl p-5 border border-stone-800 flex flex-col justify-between shadow-lg hover:border-stone-700 transition-colors"
              >
                <div>
                  <div className="flex justify-between items-start pb-3 border-b border-stone-800 mb-3">
                    <div>
                      <span className="font-black text-amber-400 text-xl">{ord.orderNumber}</span>
                      <span className="text-xs text-stone-400 block mt-0.5">
                        {ord.tableNumber ? `Table #${ord.tableNumber}` : 'Takeaway'} • {ord.customerName}
                      </span>
                    </div>

                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-extrabold uppercase">
                      {ord.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {ord.items.map((item) => (
                      <div key={item.id} className="text-xs font-semibold text-stone-200 flex justify-between">
                        <span>
                          {item.quantity}x {item.menuItem.name}
                        </span>
                        <span className="text-stone-400">{formatCurrency(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-800 flex justify-between items-center text-[11px] text-stone-500">
                  <span>Ordered: {formatDateTime(ord.createdAt)}</span>
                  <span className="font-bold text-stone-300">{formatCurrency(ord.totalAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
