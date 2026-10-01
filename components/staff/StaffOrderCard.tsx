'use client';

import React from 'react';
import { Order, OrderStatus } from '../../types/order';
import { Button } from '../ui/Button';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { Utensils, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export interface StaffOrderCardProps {
  order: Order;
  onUpdateStatus?: (id: string, newStatus: OrderStatus) => void;
}

export const StaffOrderCard: React.FC<StaffOrderCardProps> = ({ order, onUpdateStatus }) => {
  const isReady = order.status === 'ready';

  return (
    <div
      className={`rounded-2xl p-5 border shadow-sm transition-all flex flex-col justify-between ${
        isReady
          ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-500/40'
          : 'bg-white border-stone-200'
      }`}
    >
      <div>
        <div className="flex justify-between items-start pb-3 border-b border-stone-200/80 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-stone-900 text-xl">{order.orderNumber}</span>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                  isReady
                    ? 'bg-emerald-600 text-white border-emerald-700 animate-pulse'
                    : 'bg-stone-100 text-stone-700 border-stone-300'
                }`}
              >
                {isReady ? 'FOOD READY FOR DELIVERY' : order.status}
              </span>
            </div>
            <span className="text-xs text-stone-600 font-bold block mt-0.5">
              Table #{order.tableNumber || 'N/A'} • {order.customerName}
            </span>
          </div>

          <div className="text-right">
            <span className="font-black text-stone-900 text-base block">{formatCurrency(order.totalAmount)}</span>
            <span className="text-[10px] text-stone-400 font-medium">{formatDateTime(order.createdAt).split(',')[1] || formatDateTime(order.createdAt)}</span>
          </div>
        </div>

        {/* Ordered Items List */}
        <div className="space-y-2 mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="text-xs font-semibold text-stone-800 pb-1 border-b border-stone-100 last:border-0">
              <div className="flex justify-between">
                <span>
                  <strong className="text-amber-800">{item.quantity}x</strong> {item.menuItem.name}
                </span>
                <span className="text-stone-500">{formatCurrency(item.totalPrice)}</span>
              </div>
              {item.specialInstructions && (
                <p className="text-[11px] text-amber-700 italic mt-0.5">Note: &quot;{item.specialInstructions}&quot;</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-3 border-t border-stone-200/80">
        {isReady && onUpdateStatus ? (
          <Button
            onClick={() => onUpdateStatus(order.id, 'served')}
            variant="success"
            className="w-full py-3 text-xs sm:text-sm font-black rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Utensils className="w-4 h-4" /> MARK SERVED TO TABLE
          </Button>
        ) : (
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Kitchen prep in progress...</span>
            <span className="capitalize text-amber-800 font-bold">{order.status}</span>
          </div>
        )}
      </div>
    </div>
  );
};
