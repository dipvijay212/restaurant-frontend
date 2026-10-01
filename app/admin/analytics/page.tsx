'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { analyticsApi } from '../../../lib/api/analytics';
import { AnalyticsSummary } from '../../../types/analytics';
import { DollarSign, TrendingUp, ShoppingBag, Clock } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await analyticsApi.getAnalyticsSummary();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !analytics) return <LoadingSpinner label="Compiling sales & operational analytics..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics & Revenue Intelligence" subtitle="Performance metrics, popular dishes, and hourly sales breakdown." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Daily Sales" value={formatCurrency(analytics.todayRevenue)} change={`+${analytics.revenueGrowth}%`} icon={DollarSign} />
        <StatCard title="Total Orders" value={analytics.todayOrders} change={`+${analytics.ordersGrowth}%`} icon={ShoppingBag} />
        <StatCard title="Average Check" value={formatCurrency(analytics.averageOrderValue)} icon={TrendingUp} />
        <StatCard title="Prep Speed" value={`${analytics.averagePrepTimeMinutes} min`} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
          <h3 className="font-bold text-stone-900 text-base mb-4">Category Revenue Breakdown</h3>
          <div className="space-y-3">
            {analytics.categorySales.map((cat) => (
              <div key={cat.categoryName} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-700">{cat.categoryName}</span>
                  <span className="text-stone-900">{formatCurrency(cat.revenue)} ({cat.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-600 rounded-full" style={{ width: `${cat.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Items */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
          <h3 className="font-bold text-stone-900 text-base mb-4">Top Performing Menu Items</h3>
          <div className="space-y-3">
            {analytics.popularItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs pb-2 border-b border-stone-100 last:border-0">
                <div>
                  <span className="font-bold text-stone-900 block">{item.name}</span>
                  <span className="text-stone-400">{item.category}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-stone-900 block">{formatCurrency(item.totalRevenue)}</span>
                  <span className="text-stone-500">{item.totalQuantity} orders</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
