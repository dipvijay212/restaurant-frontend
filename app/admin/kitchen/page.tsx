'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { ordersApi } from '../../../lib/api/orders';
import { Order } from '../../../types/order';
import { Button } from '../../../components/ui/Button';
import { Clock, ChefHat, CheckCircle2 } from 'lucide-react';
import { formatDateTime } from '../../../lib/utils';

export default function AdminKitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getOrders();
      setOrders(data.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOrders();
  }, []);

  const handleUpdateStatus = async (id: string, status: any) => {
    await ordersApi.updateOrderStatus(id, status);
    fetchActiveOrders();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Kitchen KDS Monitor" subtitle="Real-time ticket queue for food preparation." />

      {loading ? (
        <LoadingSpinner label="Connecting to kitchen feed..." />
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-stone-500 border border-stone-200">
          <ChefHat className="w-12 h-12 mx-auto mb-2 text-stone-300" />
          <h3 className="font-bold text-stone-900">Kitchen Queue Clean</h3>
          <p className="text-xs">No active food preparation tickets right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((ord) => (
            <div key={ord.id} className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center pb-3 border-b border-stone-100 mb-3">
                  <div>
                    <span className="font-extrabold text-stone-900 text-lg">{ord.orderNumber}</span>
                    <span className="text-xs text-stone-400 block">{formatDateTime(ord.createdAt)}</span>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-xl">
                    Table #{ord.tableNumber}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {ord.items.map((item) => (
                    <div key={item.id} className="text-xs flex justify-between font-medium">
                      <span className="font-bold text-stone-900">{item.quantity}x {item.menuItem.name}</span>
                      {item.specialInstructions && (
                        <span className="text-[10px] text-amber-700 italic block">{item.specialInstructions}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex gap-2">
                {ord.status === 'pending' && (
                  <Button onClick={() => handleUpdateStatus(ord.id, 'preparing')} variant="primary" size="sm" className="w-full">
                    Start Prep
                  </Button>
                )}
                {ord.status === 'preparing' && (
                  <Button onClick={() => handleUpdateStatus(ord.id, 'ready')} variant="success" size="sm" className="w-full">
                    Mark Ready
                  </Button>
                )}
                {ord.status === 'ready' && (
                  <Button onClick={() => handleUpdateStatus(ord.id, 'served')} variant="secondary" size="sm" className="w-full">
                    Mark Served
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
