'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { analyticsApi } from '../../../lib/api/analytics';
import { AnalyticsSummary } from '../../../types/analytics';
import { formatCurrency } from '../../../lib/utils';
import { StatGridSkeleton, Skeleton } from '../../../components/ui/Skeleton';
import { ErrorState } from '../../../components/shared/ErrorState';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  XCircle,
  BarChart3,
  Utensils,
  Grid,
  Zap,
  Flame,
  Award,
  Layers,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsApi.getAnalyticsSummary();
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setError(err?.message || 'Unable to load restaurant analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <PageHeader
          title="Restaurant Analytics & Performance"
          subtitle="Actual sales, operational efficiency, menu engineering, and table turnover metrics."
        />
        <StatGridSkeleton count={6} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-60 w-full rounded-2xl" />
          <Skeleton className="h-60 w-full rounded-2xl" />
          <Skeleton className="h-60 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <PageHeader
          title="Restaurant Analytics & Performance"
          subtitle="Actual sales, operational efficiency, menu engineering, and table turnover metrics."
        />
        <ErrorState
          error={error || 'Unable to load analytics data.'}
          onRetry={loadAnalytics}
        />
      </div>
    );
  }

  // Max values for chart scaling
  const maxDailyRevenue = Math.max(...analytics.dailySales.map((d) => d.revenue));
  const maxDailyOrders = Math.max(...analytics.dailySales.map((d) => d.ordersCount));
  const maxHourlyOrders = Math.max(...analytics.hourlySales.map((h) => h.ordersCount));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <PageHeader
          title="Restaurant Analytics & Performance"
          subtitle="Actual sales, operational efficiency, menu engineering, and table turnover metrics."
        />
        <button
          onClick={loadAnalytics}
          className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors self-start md:self-center"
          title="Refresh Analytics"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* SECTION 1: OVERVIEW */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
          <BarChart3 className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-black text-stone-900 uppercase tracking-wide">1. Key Overview Metrics</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Revenue */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <span className="text-stone-400 text-xs font-bold block">Total Revenue</span>
            <div className="mt-2">
              <span className="text-xl font-black text-stone-900 block">{formatCurrency(analytics.totalRevenue)}</span>
              <span className="text-[11px] text-emerald-600 font-extrabold flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +{analytics.revenueGrowth}%
              </span>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <span className="text-stone-400 text-xs font-bold block">Total Orders</span>
            <div className="mt-2">
              <span className="text-xl font-black text-stone-900 block">{analytics.totalOrders}</span>
              <span className="text-[11px] text-emerald-600 font-extrabold flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +{analytics.ordersGrowth}%
              </span>
            </div>
          </div>

          {/* AOV */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <span className="text-stone-400 text-xs font-bold block">Avg Order Value</span>
            <div className="mt-2">
              <span className="text-xl font-black text-stone-900 block">
                {formatCurrency(analytics.averageOrderValue)}
              </span>
              <span className="text-[10px] text-stone-400 font-medium">Per Ticket</span>
            </div>
          </div>

          {/* Avg Prep Time */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <span className="text-stone-400 text-xs font-bold block">Avg Prep Time</span>
            <div className="mt-2">
              <span className="text-xl font-black text-stone-900 block">{analytics.averagePrepTimeMinutes}m</span>
              <span className="text-[10px] text-stone-400 font-medium">Kitchen Speed</span>
            </div>
          </div>

          {/* Avg Table Time */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <span className="text-stone-400 text-xs font-bold block">Avg Table Time</span>
            <div className="mt-2">
              <span className="text-xl font-black text-stone-900 block">{analytics.averageTableTimeMinutes}m</span>
              <span className="text-[10px] text-stone-400 font-medium">Dining Duration</span>
            </div>
          </div>

          {/* Cancelled Orders */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <span className="text-stone-400 text-xs font-bold block">Cancelled Orders</span>
            <div className="mt-2">
              <span className="text-xl font-black text-rose-600 block">{analytics.cancelledOrdersCount}</span>
              <span className="text-[10px] text-rose-500 font-extrabold">
                {analytics.cancelledOrdersPercentage}% of total
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SALES CHARTS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-black text-stone-900 uppercase tracking-wide">2. Sales & Revenue Charts</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Revenue Chart */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">Daily Revenue</h3>
                <span className="text-xs text-stone-400">Last 7 days sales trajectory</span>
              </div>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                Revenue ($)
              </span>
            </div>

            <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2 border-b border-stone-200">
              {analytics.dailySales.map((d, i) => {
                const heightPercent = Math.round((d.revenue / maxDailyRevenue) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-extrabold text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      ${Math.round(d.revenue)}
                    </span>
                    <div
                      className="w-full bg-amber-500 hover:bg-amber-400 rounded-t-lg transition-all"
                      style={{ height: `${Math.max(15, heightPercent)}%` }}
                    />
                    <span className="text-[11px] font-bold text-stone-500 mt-1">{d.dayLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Orders Chart */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">Daily Orders Volume</h3>
                <span className="text-xs text-stone-400">Last 7 days ticket count</span>
              </div>
              <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                Orders (#)
              </span>
            </div>

            <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2 border-b border-stone-200">
              {analytics.dailySales.map((d, i) => {
                const heightPercent = Math.round((d.ordersCount / maxDailyOrders) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-extrabold text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.ordersCount}
                    </span>
                    <div
                      className="w-full bg-blue-600 hover:bg-blue-500 rounded-t-lg transition-all"
                      style={{ height: `${Math.max(15, heightPercent)}%` }}
                    />
                    <span className="text-[11px] font-bold text-stone-500 mt-1">{d.dayLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hourly Order Volume Chart */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">Hourly Peak Volume</h3>
                <span className="text-xs text-stone-400">Order distribution (11:00 - 22:00)</span>
              </div>
              <span className="text-xs font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                Peak Hours
              </span>
            </div>

            <div className="h-48 flex items-end justify-between gap-1 pt-4 px-1 border-b border-stone-200 overflow-x-auto">
              {analytics.hourlySales.map((h, i) => {
                const heightPercent = Math.round((h.ordersCount / maxHourlyOrders) * 100);
                return (
                  <div key={i} className="flex-1 min-w-[20px] flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[9px] font-bold text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {h.ordersCount}
                    </span>
                    <div
                      className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-t border-t border-indigo-400 transition-all"
                      style={{ height: `${Math.max(12, heightPercent)}%` }}
                    />
                    <span className="text-[9px] font-semibold text-stone-400 rotate-45 sm:rotate-0 mt-1">
                      {h.hour.split(':')[0]}h
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: PRODUCTS & CATEGORIES */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
          <Utensils className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-black text-stone-900 uppercase tracking-wide">3. Products & Menu Category Sales</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Best Selling Products */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-stone-900 text-base">Best-Selling Products</h3>
              </div>
              <span className="text-xs font-bold text-stone-400">By Quantity</span>
            </div>

            <div className="space-y-3">
              {analytics.bestSellingProducts.map((p, idx) => (
                <div key={p.id} className="flex items-center justify-between text-xs pb-2.5 border-b border-stone-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-black flex items-center justify-center text-[11px]">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-extrabold text-stone-900 block">{p.name}</span>
                      <span className="text-stone-400 text-[11px]">{p.category}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-stone-900 block">{formatCurrency(p.revenue)}</span>
                    <span className="text-stone-500 font-bold">{p.quantitySold} sold</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Selling Products */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h3 className="font-extrabold text-stone-900 text-base">Low-Selling Products</h3>
              </div>
              <span className="text-xs font-bold text-stone-400">Menu Target</span>
            </div>

            <div className="space-y-3">
              {analytics.lowSellingProducts.map((p, idx) => (
                <div key={p.id} className="flex items-center justify-between text-xs pb-2.5 border-b border-stone-100 last:border-0">
                  <div>
                    <span className="font-extrabold text-stone-900 block">{p.name}</span>
                    <span className="text-stone-400 text-[11px]">{p.category} • {formatCurrency(p.price)}</span>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-rose-600 block">{p.quantitySold} sold</span>
                    <span className="text-stone-400 text-[10px]">{formatCurrency(p.revenue)} total</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-stone-900 text-base">Category Performance</h3>
              </div>
              <span className="text-xs font-bold text-stone-400">Share %</span>
            </div>

            <div className="space-y-3">
              {analytics.categorySales.map((cat) => (
                <div key={cat.categoryName} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-stone-800">{cat.categoryName}</span>
                    <span className="text-stone-900">
                      {formatCurrency(cat.revenue)} <span className="text-stone-400">({cat.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: OPERATIONS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
          <Zap className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-black text-stone-900 uppercase tracking-wide">4. Kitchen & Operational Efficiency</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Order-to-Kitchen Time */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
            <span className="text-stone-400 text-xs font-bold block">Avg Order-to-Kitchen</span>
            <span className="text-2xl font-black text-stone-900 block">{analytics.averageOrderToKitchenMinutes} min</span>
            <span className="text-[11px] text-stone-500 font-medium">Customer to chef handoff</span>
          </div>

          {/* Prep Time */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
            <span className="text-stone-400 text-xs font-bold block">Avg Preparation Time</span>
            <span className="text-2xl font-black text-orange-600 block">{analytics.averagePrepTimeMinutes} min</span>
            <span className="text-[11px] text-stone-500 font-medium">Kitchen cooking speed</span>
          </div>

          {/* Table Occupancy */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
            <span className="text-stone-400 text-xs font-bold block">Avg Table Occupancy</span>
            <span className="text-2xl font-black text-emerald-600 block">{analytics.averageOccupancyRatePercentage}%</span>
            <span className="text-[11px] text-stone-500 font-medium">Floor capacity utilization</span>
          </div>

          {/* Delayed Orders */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
            <span className="text-stone-400 text-xs font-bold block">Delayed Orders (&gt;15m)</span>
            <span className="text-2xl font-black text-rose-600 block">{analytics.delayedOrdersCount}</span>
            <span className="text-[11px] text-rose-500 font-extrabold">{analytics.delayedOrdersPercentage}% of total orders</span>
          </div>
        </div>
      </section>

      {/* SECTION 5: TABLES PERFORMANCE */}
      <section className="space-y-4 pb-8">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
          <Grid className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-black text-stone-900 uppercase tracking-wide">5. Table Utilization & Revenue</h2>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 text-[11px] font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Table #</th>
                  <th className="py-3.5 px-4">Session Count</th>
                  <th className="py-3.5 px-4">Avg Table Time</th>
                  <th className="py-3.5 px-4">Occupancy Rate</th>
                  <th className="py-3.5 px-4 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs font-medium text-stone-800">
                {analytics.tablePerformance.map((tbl) => (
                  <tr key={tbl.tableNumber} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-black text-stone-900">Table #{tbl.tableNumber}</td>
                    <td className="py-3.5 px-4 font-bold">{tbl.sessionCount} sessions</td>
                    <td className="py-3.5 px-4 text-stone-600">{tbl.averageDurationMinutes} mins</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 text-[11px] font-black rounded-lg bg-purple-100 text-purple-900">
                        {tbl.occupancyRate}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-stone-900 text-sm">
                      {formatCurrency(tbl.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
