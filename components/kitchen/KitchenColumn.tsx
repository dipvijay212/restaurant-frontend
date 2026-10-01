'use client';

import React from 'react';
import { Order, OrderStatus } from '../../types/order';
import { KitchenOrderCard } from './KitchenOrderCard';
import { ChefHat } from 'lucide-react';

export interface KitchenColumnProps {
  id: string;
  title: string;
  count: number;
  orders: Order[];
  onUpdateStatus: (id: string, newStatus: OrderStatus) => void;
  accentColor?: string;
  badgeBg?: string;
  compact?: boolean;
  highContrast?: boolean;
}

export const KitchenColumn: React.FC<KitchenColumnProps> = ({
  title,
  count,
  orders,
  onUpdateStatus,
  accentColor = 'border-amber-500',
  badgeBg = 'bg-amber-500/20 text-amber-400',
  compact = false,
  highContrast = false,
}) => {
  return (
    <div
      className={`flex flex-col h-full rounded-3xl p-4 border transition-colors ${
        highContrast
          ? 'bg-stone-950 border-stone-700'
          : 'bg-stone-900/60 border-stone-800'
      }`}
    >
      {/* Column Header */}
      <div className={`flex items-center justify-between pb-3 border-b-4 ${accentColor} mb-4`}>
        <div className="flex items-center gap-2">
          <h3 className="font-black text-white text-lg tracking-wide uppercase">{title}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full font-black text-xs ${badgeBg} border border-current`}>
          {count} {count === 1 ? 'Ticket' : 'Tickets'}
        </span>
      </div>

      {/* Orders List Container */}
      <div className="space-y-4 overflow-y-auto flex-1 pr-1 min-h-[400px]">
        {orders.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-stone-500 border-2 border-dashed border-stone-800 rounded-2xl p-6 text-center">
            <ChefHat className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs font-bold uppercase tracking-wider">No tickets in this stage</p>
          </div>
        ) : (
          orders.map((ord) => (
            <KitchenOrderCard
              key={ord.id}
              order={ord}
              onUpdateStatus={onUpdateStatus}
              compact={compact}
              highContrast={highContrast}
            />
          ))
        )}
      </div>
    </div>
  );
};
