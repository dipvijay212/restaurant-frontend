'use client';

import React, { useState } from 'react';
import { PaymentTransaction, PaymentStatus } from '../../types/payment';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { CreditCard, X, ShieldCheck, AlertCircle, RefreshCw, RotateCcw, CheckCircle2, Copy } from 'lucide-react';

export interface PaymentDetailModalProps {
  payment: PaymentTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: PaymentStatus) => Promise<void>;
  onRefund: (id: string, reason?: string) => Promise<void>;
}

export const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  payment,
  isOpen,
  onClose,
  onUpdateStatus,
  onRefund,
}) => {
  if (!isOpen || !payment) return null;

  const [status, setStatus] = useState<PaymentStatus>(payment.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [isConfirmRefundOpen, setIsConfirmRefundOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [showRefundInput, setShowRefundInput] = useState(false);
  const [copied, setCopied] = useState(false);

  const statusUpper = payment.status.toUpperCase();

  const handleCopyRef = () => {
    navigator.clipboard.writeText(payment.transactionRef || payment.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveStatus = async () => {
    try {
      setIsUpdating(true);
      await onUpdateStatus(payment.id, status);
      onClose();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProcessRefund = async () => {
    try {
      setIsRefunding(true);
      await onRefund(payment.id, refundReason || 'Admin requested refund');
      onClose();
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 text-stone-900 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl font-black">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-stone-900 text-xl font-mono">{payment.transactionRef || payment.id}</h3>
                <button
                  onClick={handleCopyRef}
                  className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
                  title="Copy Transaction ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copied && <span className="text-[10px] font-bold text-emerald-600">Copied!</span>}
              </div>
              <p className="text-xs text-stone-500 font-medium">Payment Transaction Audit Log</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs mb-6">
          <div>
            <span className="text-stone-400 font-medium block">Invoice / Bill:</span>
            <strong className="text-amber-900 font-black">{payment.billNumber || payment.billId}</strong>
          </div>

          <div>
            <span className="text-stone-400 font-medium block">Table Number:</span>
            <strong className="text-stone-900 font-black">Table #{payment.tableNumber}</strong>
          </div>

          <div>
            <span className="text-stone-400 font-medium block">Guest Name:</span>
            <strong className="text-stone-900 font-bold">{payment.customerName || 'Dining Guest'}</strong>
          </div>

          <div>
            <span className="text-stone-400 font-medium block">Transaction Amount:</span>
            <strong className="text-stone-900 font-black text-sm">{formatCurrency(payment.amount)}</strong>
          </div>

          <div>
            <span className="text-stone-400 font-medium block">Payment Method:</span>
            <strong className="text-emerald-800 font-extrabold uppercase">{payment.method}</strong>
          </div>

          <div>
            <span className="text-stone-400 font-medium block">Timestamp:</span>
            <strong className="text-stone-700 font-medium">{formatDateTime(payment.createdAt)}</strong>
          </div>
        </div>

        {/* Gateway Metadata */}
        <div className="space-y-2 mb-6">
          <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400">Payment Gateway Response Logs</h4>

          <div className="bg-stone-900 text-stone-200 p-4 rounded-2xl font-mono text-xs space-y-1.5 border border-stone-800">
            <div className="flex justify-between">
              <span className="text-stone-400">Gateway SDK:</span>
              <span className="text-emerald-400 font-bold">{payment.gatewayName || 'Cashfree Payment Adapter'}</span>
            </div>
            {payment.gatewayOrderId && (
              <div className="flex justify-between">
                <span className="text-stone-400">CF Order ID:</span>
                <span>{payment.gatewayOrderId}</span>
              </div>
            )}
            {payment.gatewayPaymentId && (
              <div className="flex justify-between">
                <span className="text-stone-400">CF Payment ID:</span>
                <span>{payment.gatewayPaymentId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone-400">Verification Status:</span>
              <span
                className={`font-bold ${
                  statusUpper === 'SUCCESS' || statusUpper === 'COMPLETED'
                    ? 'text-emerald-400'
                    : statusUpper === 'REFUNDED'
                    ? 'text-purple-400'
                    : statusUpper === 'FAILED'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}
              >
                {statusUpper}
              </span>
            </div>
            {payment.errorMessage && (
              <div className="pt-2 border-t border-stone-800 text-rose-300 text-[11px]">
                Note: {payment.errorMessage}
              </div>
            )}
          </div>
        </div>

        {/* Change Status & Issue Refund Section */}
        <div className="space-y-3 pb-6 border-b border-stone-200 mb-6">
          <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400">Update Transaction Status</h4>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(['SUCCESS', 'PROCESSING', 'FAILED', 'CANCELLED', 'REFUNDED'] as PaymentStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => setStatus(st)}
                className={`py-2 px-2 text-[11px] font-black rounded-xl border transition-all ${
                  status.toUpperCase() === st
                    ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-md ring-2 ring-amber-400/40'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Refund Trigger Input */}
          {showRefundInput ? (
            <div className="pt-3 p-3 bg-purple-50 rounded-2xl border border-purple-200 space-y-2">
              <label className="block text-xs font-bold text-purple-950">Refund Reason</label>
              <input
                type="text"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Reason for issuing full refund..."
                className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl text-xs text-stone-900 focus:outline-none"
              />
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  onClick={() => setShowRefundInput(false)}
                  variant="secondary"
                  className="py-1.5 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsConfirmRefundOpen(true)}
                  className="py-1.5 px-4 text-xs font-black rounded-xl bg-purple-600 hover:bg-purple-500 text-white"
                >
                  Confirm Issue Refund
                </Button>
              </div>
            </div>
          ) : (
            statusUpper === 'SUCCESS' && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowRefundInput(true)}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Issue Gateway Refund ({formatCurrency(payment.amount)})
                </button>
              </div>
            )
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2">
          <Button onClick={onClose} variant="secondary" className="py-2.5 text-xs font-bold">
            Close
          </Button>
          <Button
            onClick={handleSaveStatus}
            variant="primary"
            isLoading={isUpdating}
            className="py-2.5 px-5 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950"
          >
            Save Transaction Status
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog: Issue Refund */}
      <ConfirmDialog
        isOpen={isConfirmRefundOpen}
        onClose={() => setIsConfirmRefundOpen(false)}
        onConfirm={async () => {
          await handleProcessRefund();
          setIsConfirmRefundOpen(false);
        }}
        title={`Issue Refund of ${formatCurrency(payment.amount)}?`}
        description={`Are you sure you want to refund ${formatCurrency(payment.amount)} for transaction ${payment.transactionRef || payment.id}? This will reverse the charge on Cashfree gateway.`}
        confirmText="Issue Refund"
        variant="danger"
        isLoading={isRefunding}
      />
    </div>
  );
};
