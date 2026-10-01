'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorState } from '../../components/shared/ErrorState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { analyticsApi } from '../../lib/api/analytics';
import { ordersApi } from '../../lib/api/orders';
import { tablesApi } from '../../lib/api/tables';
import { requestsApi } from '../../lib/api/requests';
import { AnalyticsSummary } from '../../types/analytics';
import { Order } from '../../types/order';
import { Table } from '../../types/table';
import { ServiceRequest } from '../../types/notification';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  ArrowRight,
  Flame,
  Receipt,
  Bell,
  CheckCircle2,
  Activity,
  Award,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../lib/utils';

import { StatGridSkeleton, TableSkeleton, Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/ToastProvider';

export default function AdminDashboardPage() {
  const toast = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, ords, tbls, reqs] = await Promise.all([
        analyticsApi.getAnalyticsSummary(),
        ordersApi.getOrders(),
        tablesApi.getTables(),
        requestsApi.getRequests(),
      ]);

      setAnalytics(data);
      setRecentOrders(ords);
      setTables(tbls);
      setRequests(reqs);
    } catch (err: any) {
      setError(err.message || 'Failed to load operations dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFulfillRequest = async (id: string) => {
    try {
      setFulfillingId(id);
      await requestsApi.updateRequestStatus(id, 'COMPLETED');
      const updated = await requestsApi.getRequests();
      setRequests(updated);
      toast.success('Service request marked as fulfilled.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to fulfill request.');
    } finally {
      setFulfillingId(null);
    }
  };

  if (error || (!loading && !analytics)) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader
          title="Admin Operations Dashboard"
          subtitle="Real-time single restaurant command center, live order queue & dining floor metrics."
        />
        <ErrorState
          title="Unable to load dashboard"
          message={error || 'Failed to load operations metrics.'}
          onRetry={loadData}
        />
      </div>
    );
  }

  if (loading || !analytics) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader
          title="Admin Operations Dashboard"
          subtitle="Real-time single restaurant command center, live order queue & dining floor metrics."
        />
        <StatGridSkeleton count={6} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
              <Skeleton className="h-6 w-36" />
              <TableSkeleton rows={5} columns={6} />
            </div>
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
              <Skeleton className="h-6 w-44" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-20 rounded-2xl" />
            </div>
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
              <Skeleton className="h-6 w-44" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter metrics
  const activeTablesList = tables.filter((t) => t.status === 'occupied');
  const pendingOrdersCount = recentOrders.filter((o) => ['pending', 'accepted', 'preparing'].includes(o.status)).length;
  const pendingRequestsList = requests.filter((r) => ['PENDING', 'pending'].includes(r.status));

  // Activity Feed Mock Logs
  const activityLogs = [
    { id: 'act-1', text: 'Order #1042 accepted by kitchen', time: '2 mins ago', type: 'order' },
    { id: 'act-2', text: 'Table #12 requested Water refill', time: '5 mins ago', type: 'request' },
    { id: 'act-3', text: 'Bill INV-0094 paid via Online UPI', time: '8 mins ago', type: 'payment' },
    { id: 'act-4', text: 'Order #1041 marked READY by Chef Giovanni', time: '12 mins ago', type: 'kitchen' },
    { id: 'act-5', text: 'Guest seated at Table #04', time: '15 mins ago', type: 'table' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Shell Header */}
      <PageHeader
        title="Admin Operations Dashboard"
        subtitle="Real-time single restaurant command center, live order queue & dining floor metrics."
      />

      {/* ---------------- 6 STAT CARDS GRID ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Today's Revenue */}
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(analytics.todayRevenue)}
          change={`+${analytics.revenueGrowth}%`}
          isPositive={analytics.revenueGrowth > 0}
          icon={DollarSign}
        />

        {/* Card 2: Today's Orders */}
        <StatCard
          title="Today's Orders"
          value={analytics.todayOrders}
          change={`+${analytics.ordersGrowth}%`}
          isPositive={analytics.ordersGrowth > 0}
          icon={ShoppingBag}
        />

        {/* Card 3: Active Tables */}
        <StatCard
          title="Active Tables"
          value={`${activeTablesList.length} / ${tables.length}`}
          description={`Occupancy: ${analytics.occupancyRate}%`}
          icon={Users}
        />

        {/* Card 4: Pending Orders */}
        <StatCard
          title="Pending Orders"
          value={`${pendingOrdersCount} Active`}
          description="In kitchen prep queue"
          icon={Flame}
        />

        {/* Card 5: Average Order Value */}
        <StatCard
          title="Avg Order Value"
          value={formatCurrency(analytics.averageOrderValue)}
          description="Per table ticket"
          icon={Receipt}
        />

        {/* Card 6: Average Preparation Time */}
        <StatCard
          title="Avg Prep Time"
          value={`${analytics.averagePrepTimeMinutes} min`}
          description="Kitchen dispatch speed"
          icon={Clock}
        />
      </div>

      {/* ---------------- MAIN TWO-COLUMN LAYOUT ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Recent Orders & Active Tables (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 1: RECENT ORDERS */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-stone-900 text-lg">Recent Orders</h2>
                <p className="text-xs text-stone-500">Live order status and fulfillment tracking</p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200"
              >
                View All Orders <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="No orders yet."
                description="Live incoming customer orders will appear here automatically."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 text-[11px] uppercase tracking-wider font-extrabold">
                      <th className="pb-3 px-2">Order #</th>
                      <th className="pb-3 px-2">Table</th>
                      <th className="pb-3 px-2">Customer</th>
                      <th className="pb-3 px-2">Total</th>
                      <th className="pb-3 px-2">Status</th>
                      <th className="pb-3 px-2">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-xs">
                    {recentOrders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3.5 px-2 font-black text-stone-900">{ord.orderNumber}</td>
                        <td className="py-3.5 px-2 font-semibold text-stone-700">Table #{ord.tableNumber}</td>
                        <td className="py-3.5 px-2 text-stone-600 font-medium">{ord.customerName}</td>
                        <td className="py-3.5 px-2 font-bold text-stone-900">{formatCurrency(ord.totalAmount)}</td>
                        <td className="py-3.5 px-2">
                          <StatusBadge status={ord.status} size="sm" />
                        </td>
                        <td className="py-3.5 px-2 text-stone-400 text-[11px]">{formatDateTime(ord.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SECTION 2: ACTIVE TABLES */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-stone-900 text-lg">Active Tables Overview</h2>
                <p className="text-xs text-stone-500">{activeTablesList.length} occupied dining tables</p>
              </div>
              <Link
                href="/admin/tables"
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200"
              >
                Floor Map <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {tables.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No tables found."
                description="Configure dining tables in the Floor Map settings."
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tables.slice(0, 6).map((tbl) => {
                  const isOccupied = tbl.status === 'occupied';

                  return (
                    <div
                      key={tbl.id}
                      className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                        isOccupied
                          ? 'bg-amber-50/60 border-amber-300'
                          : 'bg-stone-50 border-stone-200 opacity-75'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-stone-900 text-sm">Table #{tbl.tableNumber}</span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            isOccupied ? 'bg-amber-200 text-amber-900' : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {tbl.status}
                        </span>
                      </div>

                      {isOccupied ? (
                        <div>
                          <span className="text-[11px] text-amber-900 font-bold block truncate">
                            {tbl.currentCustomerName || 'Guest'}
                          </span>
                          <span className="text-[10px] text-stone-500 block">
                            {tbl.capacity} Seats • {tbl.currentOrderTotal ? formatCurrency(tbl.currentOrderTotal) : 'Active'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-stone-400 block">{tbl.capacity} Seats • Clean</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Pending Requests, Popular Products, Order Activity Feed */}
        <div className="space-y-6">
          {/* SECTION 3: PENDING REQUESTS */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-600" /> Pending Requests
                </h2>
                <p className="text-xs text-stone-500">{pendingRequestsList.length} calls waiting</p>
              </div>
              <Link href="/admin/requests" className="text-xs font-bold text-amber-600">
                All Requests
              </Link>
            </div>

            {pendingRequestsList.length === 0 ? (
              <div className="bg-stone-50 rounded-2xl p-4 text-center text-xs text-stone-500 border border-stone-100">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                No pending customer requests.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {pendingRequestsList.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-stone-900 block">
                        Table #{req.tableNumber} • <span className="uppercase text-amber-900">{req.type}</span>
                      </span>
                      {req.message && <p className="text-[11px] text-stone-600 line-clamp-1">&quot;{req.message}&quot;</p>}
                    </div>
                    <Button
                      onClick={() => handleFulfillRequest(req.id)}
                      isLoading={fulfillingId === req.id}
                      variant="success"
                      size="sm"
                      className="text-[11px] px-2.5 py-1 font-bold rounded-xl flex-shrink-0"
                    >
                      Fulfill
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 4: POPULAR PRODUCTS */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" /> Top Popular Products
              </h2>
              <Link href="/admin/menu" className="text-xs font-bold text-amber-600">
                Menu
              </Link>
            </div>

            <div className="space-y-3">
              {analytics.popularItems.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between text-xs pb-2 border-b border-stone-100 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[11px] flex items-center justify-center flex-shrink-0">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-stone-900 block">{item.name}</span>
                      <span className="text-[10px] text-stone-400 block">{item.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-stone-900 block">{formatCurrency(item.totalRevenue || item.revenue)}</span>
                    <span className="text-[10px] text-amber-800 font-medium block">{item.totalQuantity || item.quantitySold} sold</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: ORDER ACTIVITY FEED */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
            <h2 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-600" /> Live Order Activity
            </h2>

            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-stone-800 font-medium block">{log.text}</span>
                    <span className="text-[10px] text-stone-400 block">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
