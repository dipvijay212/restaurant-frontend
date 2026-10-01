'use client';

import React, { useState } from 'react';
import { Bill } from '../../types/bill';
import { Button } from '../ui/Button';
import { FormInput } from '../ui/FormInput';
import { billsApi } from '../../lib/api/bills';
import { PlusCircle, X, Receipt, Calculator } from 'lucide-react';

export interface GenerateBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBillGenerated: (newBill: Bill) => void;
}

export const GenerateBillModal: React.FC<GenerateBillModalProps> = ({
  isOpen,
  onClose,
  onBillGenerated,
}) => {
  if (!isOpen) return null;

  const [tableNumber, setTableNumber] = useState<number>(1);
  const [customerName, setCustomerName] = useState('Guest Dining');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const generated = await billsApi.generateBillForTable(
        Number(tableNumber),
        customerName,
        Number(discountAmount),
        Number(tipAmount)
      );
      onBillGenerated(generated);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500 text-stone-950 rounded-xl font-black">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-stone-900 text-lg">Generate Table Bill</h3>
              <p className="text-xs text-stone-500">Consolidate dining session orders into an invoice.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Table Number"
            type="number"
            min={1}
            value={tableNumber}
            onChange={(e) => setTableNumber(Number(e.target.value))}
            required
          />

          <FormInput
            label="Guest Customer Name"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Discount ($)"
              type="number"
              min={0}
              step="0.01"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(Number(e.target.value))}
            />

            <FormInput
              label="Tip ($)"
              type="number"
              min={0}
              step="0.01"
              value={tipAmount}
              onChange={(e) => setTipAmount(Number(e.target.value))}
            />
          </div>

          <div className="pt-4 border-t border-stone-200 flex justify-end gap-2">
            <Button type="button" onClick={onClose} variant="secondary" className="py-2.5 text-xs font-bold">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="py-2.5 px-5 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950"
            >
              Generate Consolidated Invoice
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
