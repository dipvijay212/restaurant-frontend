'use client';

import React from 'react';
import { Table, TableStatus } from '../../types/table';
import { StatusBadge } from '../ui/StatusBadge';
import { Users, Clock, CheckCircle2, UserCheck, Sparkles, RefreshCw } from 'lucide-react';
import { formatDateTime } from '../../lib/utils';
import { Button } from '../ui/Button';

export interface TableCardProps {
  table: Table;
  onUpdateStatus?: (id: string, newStatus: TableStatus) => void;
  onViewDetail?: (table: Table) => void;
}

export const TableCard: React.FC<TableCardProps> = ({ table, onUpdateStatus, onViewDetail }) => {
  const isAvailable = table.status === 'AVAILABLE';
  const isOccupied = table.status === 'OCCUPIED' || table.status === 'WAITING_FOR_SERVICE';
  const isBillRequested = table.status === 'BILL_REQUESTED';
  const isCleaning = table.status === 'CLEANING';

  return (
    <div
      className={`rounded-2xl p-5 border shadow-sm transition-all flex flex-col justify-between ${
        isBillRequested
          ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/40'
          : isCleaning
          ? 'bg-blue-50 border-blue-300'
          : isOccupied
          ? 'bg-white border-stone-300'
          : 'bg-emerald-50/60 border-emerald-300'
      }`}
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-black text-stone-900 text-xl tracking-tight">Table #{table.tableNumber}</h3>
            <span className="text-xs text-stone-500 font-medium">
              {table.capacity} Seats • {table.area}
            </span>
          </div>

          <StatusBadge status={table.status} size="sm" />
        </div>

        <div className="space-y-1.5 text-xs text-stone-700 mb-4">
          {table.currentCustomerName ? (
            <div className="p-2 bg-white/80 rounded-xl border border-stone-200 font-semibold text-stone-900">
              👤 Guest: {table.currentCustomerName}
            </div>
          ) : (
            <div className="text-stone-400 italic">No active dining guest</div>
          )}

          {table.occupiedSince && (
            <div className="flex items-center gap-1 text-stone-500 font-medium text-[11px]">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>Seated {formatDateTime(table.occupiedSince).split(',')[1] || formatDateTime(table.occupiedSince)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Fast Touch Actions */}
      <div className="pt-3 border-t border-stone-200/80 flex flex-col gap-2">
        {isAvailable && onUpdateStatus && (
          <Button
            onClick={() => onUpdateStatus(table.id, 'OCCUPIED')}
            variant="primary"
            className="w-full py-2.5 text-xs font-black rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 flex items-center justify-center gap-1"
          >
            <UserCheck className="w-4 h-4" /> SEAT GUESTS
          </Button>
        )}

        {isCleaning && onUpdateStatus && (
          <Button
            onClick={() => onUpdateStatus(table.id, 'AVAILABLE')}
            variant="success"
            className="w-full py-2.5 text-xs font-black rounded-xl bg-blue-600 hover:bg-blue-500 text-white active:scale-95 flex items-center justify-center gap-1"
          >
            <Sparkles className="w-4 h-4" /> MARK CLEANED & READY
          </Button>
        )}

        {isOccupied && onUpdateStatus && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => onUpdateStatus(table.id, 'CLEANING')}
              variant="outline"
              className="py-2 text-[11px] font-bold rounded-xl text-stone-700 border-stone-300 hover:bg-stone-100"
            >
              Clear Table
            </Button>
            {onViewDetail && (
              <Button
                onClick={() => onViewDetail(table)}
                variant="secondary"
                className="py-2 text-[11px] font-bold rounded-xl"
              >
                View Orders
              </Button>
            )}
          </div>
        )}

        {isBillRequested && onUpdateStatus && (
          <Button
            onClick={() => onUpdateStatus(table.id, 'CLEANING')}
            variant="primary"
            className="w-full py-2.5 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 active:scale-95 flex items-center justify-center gap-1"
          >
            <CheckCircle2 className="w-4 h-4" /> SETTLE & CLEAR TABLE
          </Button>
        )}
      </div>
    </div>
  );
};
