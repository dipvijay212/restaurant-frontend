'use client';

import React, { useEffect, useState } from 'react';
import { ServiceRequest, RequestStatus } from '../../types/notification';
import { Button } from '../ui/Button';
import {
  Bell,
  CheckCircle2,
  GlassWater,
  UserCheck,
  Receipt,
  Sparkles,
  UtensilsCrossed,
  HelpCircle,
  Clock,
  Check,
} from 'lucide-react';
import { formatDateTime } from '../../lib/utils';

export interface RequestCardProps {
  request: ServiceRequest;
  onAccept?: (id: string) => void;
  onComplete?: (id: string) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, onAccept, onComplete }) => {
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    const createdMs = new Date(request.createdAt).getTime();
    const updateElapsed = () => {
      const diff = Math.max(0, Math.floor((Date.now() - createdMs) / 1000));
      setElapsedSec(diff);
    };
    updateElapsed();
    const timer = setInterval(updateElapsed, 1000);
    return () => clearInterval(timer);
  }, [request.createdAt]);

  const min = Math.floor(elapsedSec / 60);
  const sec = elapsedSec % 60;
  const timerText = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

  const icons: Record<string, any> = {
    water: GlassWater,
    waiter: UserCheck,
    cutlery: UtensilsCrossed,
    napkins: Sparkles,
    bill: Receipt,
    other: HelpCircle,
    cleaning: Sparkles,
    custom: Bell,
  };

  const Icon = icons[request.type] || Bell;

  const statusUpper = request.status.toUpperCase();
  const isPending = statusUpper === 'PENDING';
  const isAccepted = statusUpper === 'ACCEPTED' || statusUpper === 'IN_PROGRESS';
  const isCompleted = statusUpper === 'COMPLETED' || statusUpper === 'FULFILLED';

  return (
    <div
      className={`rounded-2xl p-5 border shadow-sm transition-all flex flex-col justify-between ${
        isPending
          ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30'
          : isAccepted
          ? 'bg-blue-50/70 border-blue-300'
          : 'bg-stone-50 border-stone-200 opacity-80'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl ${
                isPending
                  ? 'bg-amber-500 text-white animate-pulse'
                  : isAccepted
                  ? 'bg-blue-600 text-white'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-stone-900 text-lg">Table #{request.tableNumber}</span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                    isPending
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : isAccepted
                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}
                >
                  {request.type}
                </span>
              </div>
              <span className="text-xs text-stone-500 block font-medium">
                {request.customerName ? `Guest: ${request.customerName}` : 'Dining Session'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${
                min >= 5
                  ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                  : 'bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {timerText}
            </span>
            <span className="text-[10px] text-stone-400 block mt-1">{formatDateTime(request.createdAt).split(',')[1] || formatDateTime(request.createdAt)}</span>
          </div>
        </div>

        {request.message && (
          <div className="mb-4 p-2.5 bg-white rounded-xl border border-stone-200 text-xs text-stone-800 font-semibold italic">
            &quot;{request.message}&quot;
          </div>
        )}
      </div>

      {/* Touch Action Buttons */}
      <div className="pt-3 border-t border-stone-200/80 flex items-center gap-2">
        {isPending && (
          <Button
            onClick={() => onAccept?.(request.id)}
            variant="primary"
            className="w-full py-3 text-xs sm:text-sm font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" /> ACCEPT REQUEST
          </Button>
        )}

        {isAccepted && (
          <Button
            onClick={() => onComplete?.(request.id)}
            variant="success"
            className="w-full py-3 text-xs sm:text-sm font-black rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" /> MARK COMPLETED
          </Button>
        )}

        {isCompleted && (
          <div className="w-full py-2.5 text-center text-xs font-bold text-emerald-700 bg-emerald-100/80 rounded-xl border border-emerald-200 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Request Completed
          </div>
        )}
      </div>
    </div>
  );
};
