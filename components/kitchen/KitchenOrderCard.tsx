'use client';

import React from 'react';
import { Order, OrderStatus } from '../../types/order';
import { KitchenTimer } from './KitchenTimer';
import { PriorityBadge } from './PriorityBadge';
import { Button } from '../ui/Button';
import { formatDateTime } from '../../lib/utils';
import { ChefHat, Flame, CheckCircle2, Clock, AlertTriangle, User, Utensils } from 'lucide-react';

export interface KitchenOrderCardProps {
  order: Order;
  onUpdateStatus: (id: string, newStatus: OrderStatus) => void;
  compact?: boolean;
  highContrast?: boolean;
}

export const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({
  order,
  onUpdateStatus,
  compact = false,
  highContrast = false,
}) => {
  // Determine elapsed time and delayed state (>15 min)
  const createdMs = new Date(order.createdAt).getTime();
  const elapsedMinutes = Math.floor((Date.now() - createdMs) / (1000 * 60));
  const isDelayed = elapsedMinutes >= 15 && !['ready', 'served', 'completed', 'cancelled', 'rejected'].includes(order.status);

  // Derive priority (Urgent / Rush / Normal)
  const isUrgent =
    order.specialNotes?.toLowerCase().includes('vip') ||
    order.items.some((i) => i.specialInstructions && i.specialInstructions.length > 0) ||
    order.items.some((i) => i.menuItem.name.toLowerCase().includes('chef'));

  // Action config based on current status
  const getActionButton = () => {
    switch (order.status) {
      case 'pending':
        return (
          <Button
            onClick={() => onUpdateStatus(order.id, 'accepted')}
            variant="primary"
            className="w-full py-3.5 text-sm sm:text-base font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <ChefHat className="w-5 h-5" /> ACCEPT TICKET
          </Button>
        );
      case 'accepted':
        return (
          <Button
            onClick={() => onUpdateStatus(order.id, 'preparing')}
            variant="primary"
            className="w-full py-3.5 text-sm sm:text-base font-black rounded-xl bg-orange-600 hover:bg-orange-500 text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Flame className="w-5 h-5 fill-white" /> START PREPARING
          </Button>
        );
      case 'preparing':
        return (
          <Button
            onClick={() => onUpdateStatus(order.id, 'ready')}
            variant="success"
            className="w-full py-3.5 text-sm sm:text-base font-black rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" /> MARK READY
          </Button>
        );
      case 'ready':
        return (
          <Button
            onClick={() => onUpdateStatus(order.id, 'served')}
            variant="secondary"
            className="w-full py-3.5 text-sm sm:text-base font-black rounded-xl bg-stone-700 hover:bg-stone-600 text-stone-100 shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Utensils className="w-5 h-5" /> MARK SERVED
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`rounded-2xl flex flex-col justify-between transition-all duration-200 shadow-xl border-2 ${
        isDelayed
          ? 'bg-rose-950/90 border-rose-500 ring-4 ring-rose-500/30'
          : highContrast
          ? 'bg-black border-amber-400 text-white'
          : 'bg-stone-900 border-stone-800 text-stone-100'
      } ${compact ? 'p-3.5' : 'p-5'}`}
    >
      <div>
        {/* Ticket Header */}
        <div className="flex justify-between items-start pb-3 border-b border-stone-800/80 mb-3 gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-amber-400 text-2xl tracking-tight">{order.orderNumber}</span>
              <PriorityBadge isUrgent={isUrgent} label={isUrgent ? 'RUSH / VIP' : undefined} />
              {isDelayed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-600 text-white font-extrabold text-[10px] uppercase tracking-wider animate-bounce">
                  <AlertTriangle className="w-3 h-3" /> DELAYED
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 mt-1">
              <span className="px-2 py-0.5 rounded bg-stone-800 text-white font-bold">
                {order.tableNumber ? `Table #${order.tableNumber}` : 'Takeaway'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-stone-500" /> {order.customerName}
              </span>
            </div>
          </div>

          <div className="text-right flex flex-col items-end gap-1">
            <KitchenTimer createdAt={order.createdAt} delayedThresholdMinutes={15} />
            <span className="text-[10px] text-stone-500 font-mono font-bold">{formatDateTime(order.createdAt).split(',')[1] || formatDateTime(order.createdAt)}</span>
          </div>
        </div>

        {/* Global Special Notes */}
        {order.specialNotes && (
          <div className="mb-3 px-3 py-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-bold flex items-start gap-2">
            <span className="bg-amber-500 text-black px-1.5 py-0.5 rounded text-[10px] font-black uppercase">NOTE</span>
            <span>{order.specialNotes}</span>
          </div>
        )}

        {/* Order Items List */}
        <div className={`space-y-3 ${compact ? 'mb-2' : 'mb-4'}`}>
          {order.items.map((item) => {
            const hasVariants = item.selectedOptions && item.selectedOptions.length > 0;
            const hasInstructions = !!item.specialInstructions;

            return (
              <div key={item.id} className="pb-2.5 border-b border-stone-800/60 last:border-0 text-sm">
                <div className="flex justify-between items-start font-extrabold leading-tight text-white text-base">
                  <div className="flex items-start gap-2">
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-lg font-black text-sm border border-amber-500/30">
                      {item.quantity}x
                    </span>
                    <span>{item.menuItem.name}</span>
                  </div>
                </div>

                {/* Variants & Add-ons */}
                {hasVariants && (
                  <div className="mt-1 pl-7 space-y-0.5">
                    {item.selectedOptions!.map((opt, idx) => {
                      const extraPrice = opt.option.priceModifier ?? (opt.option as any).price ?? 0;
                      return (
                        <div key={idx} className="text-xs text-stone-300 font-medium flex items-center gap-1">
                          <span className="text-amber-400 font-bold">• {opt.groupName}:</span> {opt.option.name}
                          {extraPrice > 0 && <span className="text-stone-400 text-[10px]">(+${extraPrice.toFixed(2)})</span>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Special Instructions (Highlighted Callout) */}
                {hasInstructions && (
                  <div className="mt-1.5 pl-7">
                    <div className="p-2 bg-amber-950/80 border border-amber-600/60 rounded-lg text-amber-300 text-xs font-bold italic">
                      ⚠️ Note: &quot;{item.specialInstructions}&quot;
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Large Touch Action Button */}
      <div className="pt-3 border-t border-stone-800/80">{getActionButton()}</div>
    </div>
  );
};
