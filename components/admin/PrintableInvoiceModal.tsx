'use client';

import React from 'react';
import { Bill } from '../../types/bill';
import { Button } from '../ui/Button';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { Printer, X, Receipt, CheckCircle2, AlertCircle } from 'lucide-react';

export interface PrintableInvoiceModalProps {
  bill: Bill | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableInvoiceModal: React.FC<PrintableInvoiceModalProps> = ({
  bill,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const statusUpper = bill.status.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white text-stone-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95">
        {/* Header Actions (Hidden on Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-600" />
            <h3 className="font-black text-stone-900 text-lg">Printable Invoice View</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              variant="primary"
              className="py-2 px-4 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print Invoice
            </Button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt Container */}
        <div id="printable-receipt" className="space-y-5 text-stone-900 font-sans text-xs">
          {/* Restaurant Header */}
          <div className="text-center border-b border-stone-300 pb-4">
            <h2 className="text-xl font-black uppercase tracking-tight">DEMO GOURMET BISTRO</h2>
            <p className="text-[11px] text-stone-500 font-medium">123 Culinary Boulevard, Suite 400</p>
            <p className="text-[11px] text-stone-500 font-medium">GSTIN: 27AAAAA0000A1Z5 • Tel: +1 (555) 019-2834</p>
            <div className="mt-2 inline-block px-3 py-1 bg-stone-100 rounded-full font-mono text-[11px] font-bold">
              OFFICIAL TAX INVOICE
            </div>
          </div>

          {/* Bill Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200 text-[11px]">
            <div>
              <span className="text-stone-400 font-medium block">Invoice #:</span>
              <strong className="text-stone-900 font-black">{bill.billNumber}</strong>
            </div>
            <div className="text-right">
              <span className="text-stone-400 font-medium block">Table Number:</span>
              <strong className="text-stone-900 font-black">Table #{bill.tableNumber}</strong>
            </div>
            <div>
              <span className="text-stone-400 font-medium block">Guest Name:</span>
              <strong className="text-stone-900 font-bold">{bill.customerName}</strong>
            </div>
            <div className="text-right">
              <span className="text-stone-400 font-medium block">Date & Time:</span>
              <strong className="text-stone-900 font-medium">{formatDateTime(bill.createdAt)}</strong>
            </div>
          </div>

          {/* Payment Status Stamp */}
          <div className="flex justify-between items-center py-1">
            <span className="text-stone-500 font-bold uppercase text-[10px]">Payment Status</span>
            <span
              className={`px-3 py-0.5 rounded-full font-black text-xs uppercase tracking-wider border ${
                statusUpper === 'PAID'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : statusUpper === 'PROCESSING'
                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                  : statusUpper === 'REFUNDED'
                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                  : statusUpper === 'FAILED'
                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}
            >
              {statusUpper}
            </span>
          </div>

          {/* Aggregated Items Table */}
          <div className="border-t border-b border-stone-300 py-3">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-200 text-[10px] text-stone-500 font-bold uppercase">
                  <th className="pb-1">Item Description</th>
                  <th className="pb-1 text-center">Qty</th>
                  <th className="pb-1 text-right">Price</th>
                  <th className="pb-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-[11px]">
                {bill.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-1.5 font-bold text-stone-900">
                      {item.name}
                      {item.notes && <p className="text-[10px] text-stone-500 font-normal italic">({item.notes})</p>}
                    </td>
                    <td className="py-1.5 text-center font-bold">{item.quantity}</td>
                    <td className="py-1.5 text-right text-stone-600">{formatCurrency(item.price)}</td>
                    <td className="py-1.5 text-right font-black text-stone-900">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotal, Tax, Total Financial Breakdown */}
          <div className="space-y-1.5 text-xs text-stone-700 pt-1">
            <div className="flex justify-between">
              <span className="text-stone-500">Subtotal:</span>
              <span className="font-bold">{formatCurrency(bill.subtotal)}</span>
            </div>

            {bill.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount / Promo:</span>
                <span className="font-bold">-{formatCurrency(bill.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-stone-500">Tax (GST 5%):</span>
              <span className="font-bold">{formatCurrency(bill.taxAmount)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-500">Service Charge (5%):</span>
              <span className="font-bold">{formatCurrency(bill.serviceCharge)}</span>
            </div>

            {bill.tipAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-stone-500">Staff Tip:</span>
                <span className="font-bold">{formatCurrency(bill.tipAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-black text-stone-900 border-t-2 border-stone-900 pt-2 mt-2">
              <span>TOTAL AMOUNT:</span>
              <span>{formatCurrency(bill.totalAmount)}</span>
            </div>

            <div className="flex justify-between text-xs text-stone-600 font-semibold pt-1">
              <span>Amount Paid ({bill.paymentMethod || 'Counter'}):</span>
              <span className="text-emerald-700 font-extrabold">{formatCurrency(bill.paidAmount)}</span>
            </div>

            <div className="flex justify-between text-xs font-bold pt-0.5">
              <span>Remaining Balance:</span>
              <span className={bill.remainingAmount > 0 ? 'text-rose-600' : 'text-stone-500'}>
                {formatCurrency(bill.remainingAmount)}
              </span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-4 border-t border-dashed border-stone-300 text-[10px] text-stone-500 space-y-1">
            <p className="font-bold text-stone-800">Thank you for dining with us!</p>
            <p>Please visit again • Wifi Code: GourmetGuest2026</p>
          </div>
        </div>
      </div>
    </div>
  );
};
