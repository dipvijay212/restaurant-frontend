import React from 'react';
import { OrderStatus } from '../../types/order';
import { Clock, CheckCircle2, ChefHat, Sparkles, Utensils, Award, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface OrderStatusTimelineProps {
  status: OrderStatus;
  className?: string;
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ status, className }) => {
  const isCancelled = (status as string) === 'cancelled' || (status as string) === 'rejected';

  if (isCancelled) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center text-rose-900">
        <XCircle className="w-8 h-8 text-rose-600 mx-auto mb-1" />
        <h4 className="font-bold text-sm capitalize">Order {status}</h4>
        <p className="text-xs text-rose-700">This order has been {status} and will not be prepared.</p>
      </div>
    );
  }

  const steps = [
    { key: 'pending', label: 'Order Received', icon: Clock },
    { key: 'accepted', label: 'Restaurant Accepted', icon: CheckCircle2 },
    { key: 'preparing', label: 'Preparing', icon: ChefHat },
    { key: 'ready', label: 'Ready', icon: Sparkles },
    { key: 'served', label: 'Served', icon: Utensils },
    { key: 'completed', label: 'Completed', icon: Award },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className={cn('bg-white rounded-2xl p-5 border border-stone-100 shadow-sm', className)}>
      <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-4 text-stone-400">
        Live Status Timeline
      </h3>

      <div className="space-y-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isPassed = idx < currentStepIndex || status === 'completed';
          const isCurrent = idx === currentStepIndex && status !== 'completed';
          const isUpcoming = idx > currentStepIndex && status !== 'completed';

          return (
            <div key={step.key} className="flex items-center gap-3">
              {/* Timeline Indicator */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isPassed
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-amber-600 text-white ring-4 ring-amber-100 animate-pulse'
                    : 'bg-stone-100 text-stone-400 border border-stone-200'
                }`}
              >
                {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>

              {/* Status Label */}
              <div className="flex-1">
                <span
                  className={`text-xs font-extrabold block ${
                    isPassed
                      ? 'text-emerald-900'
                      : isCurrent
                      ? 'text-amber-900'
                      : 'text-stone-400'
                  }`}
                >
                  {isPassed && '✓ '}
                  {isCurrent && '● '}
                  {isUpcoming && '○ '}
                  {step.label}
                </span>
                {isCurrent && (
                  <span className="text-[10px] text-amber-700 font-medium block">
                    Kitchen is currently processing this stage
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
