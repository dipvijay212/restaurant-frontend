'use client';

import React, { useState } from 'react';
import { Bill, BillStatus } from '../../types/bill';
import { Button } from '../ui/Button';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { Receipt, X, Printer, CheckCircle2, AlertTriangle, RefreshCw, CreditCard } from 'lucide-react';

export interface BillDetailsModalProps {
  bill: Bill | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: BillStatus, paidAmount?: number, paymentMethod?: string) => void;
  onOpenPrintModal: (bill: Bill) => void;
}

export const BillDetailsModal: React.FC<BillDetailsModalProps> = ({
  bill,
  isOpen,
  onClose,
  onUpdateStatus,
  onOpenPrintModal,
}) => {
  if (!isOpen || !bill) return null;

  const [selectedStatus, setSelectedStatus] = useState<BillStatus>(bill.status);
  const [paymentMethod, setPaymentMethod] = useState<string>(bill.paymentMethod || 'Cash');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleApplyStatusChange = async () => {
    try {
      setIsUpdating(true);
      const paid = selectedStatus.toUpperCase() === 'PAID' ? bill.totalAmount : bill.paidAmount;
      await onUpdateStatus(bill.id, selectedStatus, paid, paymentMethod);
      onClose();
    } finally {
      setIsUpdating(false);
    }
  };

  const statusUpper = bill.status.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-stone-950 rounded-2xl font-black">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-stone-900 text-xl">{bill.billNumber}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-stone-100 text-stone-800">
                  Table #{bill.tableNumber}
                </span>
              </div>
              <span className="text-xs text-stone-500 font-medium">
                Guest: {bill.customerName} • {formatDateTime(bill.createdAt)}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aggregated Orders Item Breakdown */}
        <div className="space-y-4 mb-6">
          <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400">
            Session Aggregated Order Items ({bill.items.length})
          </h4>

          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2.5 max-h-60 overflow-y-auto">
            {bill.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-xs border-b border-stone-200/60 pb-2 last:border-0">
                <div>
                  <span className="font-extrabold text-stone-900">{item.quantity}x </span>
                  <span className="font-bold text-stone-800">{item.name}</span>
                  {item.notes && <p className="text-[11px] text-amber-700 italic mt-0.5">Note: {item.notes}</p>}
                </div>
                <div className="text-right">
                  <span className="font-black text-stone-900">{formatCurrency(item.total)}</span>
                  <span className="text-[10px] text-stone-400 block">@ {formatCurrency(item.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6 space-y-2 text-xs">
          <div className="flex justify-between text-stone-700">
            <span>Subtotal</span>
            <span className="font-bold">{formatCurrency(bill.subtotal)}</span>
          </div>
          {bill.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount</span>
              <span className="font-bold">-{formatCurrency(bill.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-stone-700">
            <span>Tax (5%)</span>
            <span className="font-bold">{formatCurrency(bill.taxAmount)}</span>
          </div>
          <div className="flex justify-between text-stone-700">
            <span>Service Charge (5%)</span>
            <span className="font-bold">{formatCurrency(bill.serviceCharge)}</span>
          </div>
          <div className="flex justify-between text-base font-black text-stone-900 border-t border-amber-500/30 pt-2 mt-1">
            <span>Total Bill Amount</span>
            <span>{formatCurrency(bill.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-xs text-emerald-800 font-extrabold pt-1">
            <span>Paid Amount</span>
            <span>{formatCurrency(bill.paidAmount)}</span>
          </div>
          <div className="flex justify-between text-xs text-rose-800 font-extrabold">
            <span>Remaining Amount</span>
            <span>{formatCurrency(bill.remainingAmount)}</span>
          </div>
        </div>

        {/* Payment Status Control Section */}
        <div className="space-y-3 pb-6 border-b border-stone-200 mb-6">
          <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400">Update Payment Status</h4>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(['UNPAID', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED'] as BillStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`py-2 px-2 text-xs font-black rounded-xl border transition-all ${
                  selectedStatus.toUpperCase() === st
                    ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-md ring-2 ring-amber-400/40'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-3">
            <span className="text-xs font-bold text-stone-600 flex items-center gap-1">
              <CreditCard className="w-4 h-4 text-stone-400" /> Method:
            </span>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="px-3 py-1.5 bg-stone-100 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none"
            >
              <option value="Cash">Cash at Counter</option>
              <option value="Card Reader">Credit/Debit Card</option>
              <option value="UPI / QR">UPI / QR Code</option>
              <option value="Online Payment">Online Payment Gateway</option>
            </select>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between gap-3">
          <Button
            onClick={() => onOpenPrintModal(bill)}
            variant="outline"
            className="py-2.5 px-4 text-xs font-bold text-stone-800 border-stone-300 hover:bg-stone-100 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print Receipt
          </Button>

          <div className="flex items-center gap-2">
            <Button onClick={onClose} variant="secondary" className="py-2.5 text-xs font-bold">
              Cancel
            </Button>
            <Button
              onClick={handleApplyStatusChange}
              variant="primary"
              isLoading={isUpdating}
              className="py-2.5 px-5 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950"
            >
              Save Payment Status
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
