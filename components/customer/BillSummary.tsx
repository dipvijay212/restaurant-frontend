import React from 'react';
import { formatCurrency } from '../../lib/utils';

export interface BillSummaryProps {
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  discountAmount?: number;
  totalAmount: number;
}

export const BillSummary: React.FC<BillSummaryProps> = ({
  subtotal,
  taxAmount,
  serviceCharge,
  discountAmount = 0,
  totalAmount,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-2 text-xs">
      <div className="flex justify-between text-stone-600">
        <span>Subtotal</span>
        <span className="font-semibold text-stone-900">{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-stone-600">
        <span>Tax</span>
        <span className="font-semibold text-stone-900">{formatCurrency(taxAmount)}</span>
      </div>
      <div className="flex justify-between text-stone-600">
        <span>Service Charge</span>
        <span className="font-semibold text-stone-900">{formatCurrency(serviceCharge)}</span>
      </div>
      {discountAmount > 0 && (
        <div className="flex justify-between text-emerald-700">
          <span>Discount</span>
          <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
        </div>
      )}
      <div className="pt-2 border-t border-stone-100 flex justify-between text-sm font-extrabold text-stone-900">
        <span>Total Amount</span>
        <span>{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  );
};
