'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CustomerHeader } from '../../components/customer/CustomerHeader';
import { CustomerBottomNav } from '../../components/customer/CustomerBottomNav';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorState } from '../../components/shared/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeleton';
import { billsApi } from '../../lib/api/bills';
import { ordersApi } from '../../lib/api/orders';
import { requestsApi } from '../../lib/api/requests';
import { paymentsApi } from '../../lib/api/payments';
import { Bill } from '../../types/bill';
import { Order } from '../../types/order';
import { PaymentMethod, PaymentStatus } from '../../types/payment';
import { useAppSelector } from '../../store';
import {
  Receipt,
  CreditCard,
  CheckCircle2,
  XCircle,
  Building2,
  BellRing,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  QrCode,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../lib/utils';

export default function BillPage() {
  const session = useAppSelector((state) => state.customerSession);
  const tableNumber = session.table?.tableNumber || 12;
  const tableId = session.table?.id || 'tbl-12';
  const customerName = session.customerName || 'Guest';

  const [bill, setBill] = useState<Bill | null>(null);
  const [sessionOrders, setSessionOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment UI state machine
  const [selectedMethod, setSelectedMethod] = useState<'counter' | 'online'>('online');
  const [onlineType, setOnlineType] = useState<PaymentMethod>('upi');
  const [paymentState, setPaymentState] = useState<PaymentStatus>('unpaid');
  const [paymentTxnRef, setPaymentTxnRef] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [requestingBill, setRequestingBill] = useState(false);

  const loadBillAndOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const [b, orders] = await Promise.all([
        billsApi.getSessionBill(tableId, tableNumber, customerName),
        ordersApi.getOrders(),
      ]);
      setBill(b);

      if (b.status === 'paid') {
        setPaymentState('successful');
        setPaymentTxnRef('CF-TXN-84920194');
      }

      const myOrders = orders.filter((o: Order) => o.tableNumber === tableNumber);
      setSessionOrders(myOrders);
    } catch (err: any) {
      setError(err.message || 'Unable to load bill.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillAndOrders();
  }, [tableId, tableNumber, customerName]);

  // Request Waiter to Bring Bill
  const handleRequestBillStaff = async () => {
    try {
      setRequestingBill(true);
      await requestsApi.createRequest({
        tableNumber,
        tableId,
        customerName,
        type: 'bill',
        message: 'Customer requested physical bill printed at table.',
      });
      setToast({
        title: 'Bill Requested',
        message: `Waitstaff notified to bring bill to Table #${tableNumber}.`,
        type: 'success',
      });
    } catch (err: any) {
      setToast({
        title: 'Request Active',
        message: err.message || 'Bill request already in progress.',
        type: 'info',
      });
    } finally {
      setRequestingBill(false);
    }
  };

  /**
   * Execute Payment Gateway flow (Mock or Cashfree adapter ready)
   */
  const handleInitiatePayment = async (simulateOutcome: 'success' | 'failed' | 'cancelled' = 'success') => {
    if (!bill) return;

    try {
      setPaymentState('processing');
      setErrorMessage(null);

      const resp = await paymentsApi.processPayment(
        {
          billId: bill.id,
          orderId: bill.orderId,
          tableNumber,
          amount: bill.totalAmount,
          method: selectedMethod === 'counter' ? 'counter' : onlineType,
          customerName,
        },
        simulateOutcome
      );

      // Rule: Do NOT claim payment succeeded unless gateway explicitly returns success
      if (resp.success && resp.status === 'successful') {
        setPaymentState('successful');
        setPaymentTxnRef(resp.transactionRef || 'CF-TXN-SUCCESS');
        setBill((prev) => (prev ? { ...prev, status: 'paid', paidAmount: prev.totalAmount, remainingAmount: 0 } : null));
        setToast({
          title: 'Payment Successful',
          message: `Transaction ${resp.transactionRef} confirmed.`,
          type: 'success',
        });
      } else if (resp.status === 'cancelled') {
        setPaymentState('cancelled');
        setErrorMessage(resp.errorMessage || 'Payment transaction was cancelled.');
        setToast({
          title: 'Payment Cancelled',
          message: 'Transaction cancelled by user.',
          type: 'info',
        });
      } else {
        setPaymentState('failed');
        setErrorMessage(resp.errorMessage || 'Payment transaction failed.');
        setToast({
          title: 'Payment failed.',
          message: resp.errorMessage || 'Unable to process transaction. Your account has not been charged.',
          type: 'error',
        });
      }
    } catch (err: any) {
      setPaymentState('failed');
      setErrorMessage(err.message || 'Payment service error occurred.');
      setToast({
        title: 'Payment failed.',
        message: err.message || 'Payment service error occurred.',
        type: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24 md:pb-8 flex flex-col">
      <CustomerHeader />

      {toast && (
        <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-900">Session Bill & Checkout</h1>
            <p className="text-xs text-stone-500">Table #{tableNumber} • Itemized dining summary</p>
          </div>
          <Button
            onClick={handleRequestBillStaff}
            isLoading={requestingBill}
            variant="outline"
            size="sm"
            className="text-xs font-bold border-amber-300 text-amber-900 bg-amber-50"
          >
            <BellRing className="w-3.5 h-3.5 mr-1 text-amber-600" /> Print Bill
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <span className="text-xs font-bold text-stone-400">Calculating dining session bill...</span>
            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-stone-100">
                <Skeleton className="h-5 w-28 rounded" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
                <Skeleton className="h-4 w-4/6 rounded" />
              </div>
              <div className="pt-4 border-t border-stone-100 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-24 rounded" />
                  <Skeleton className="h-6 w-24 rounded" />
                </div>
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        ) : error ? (
          <ErrorState
            title="Unable to load bill"
            message={error}
            onRetry={loadBillAndOrders}
          />
        ) : !bill ? (
          <EmptyState
            icon={Receipt}
            title="No active bill found"
            description="Place an order to view itemized breakdown and payment options."
          />
        ) : (
          <div className="space-y-4">
            {/* ----------------- STATE 1: PAYMENT SUCCESSFUL ----------------- */}
            {paymentState === 'successful' && (
              <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-lg text-center space-y-4 animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-xl font-black mb-0.5">Payment Successful</h2>
                  <p className="text-xs text-emerald-100 font-medium">
                    Your payment has been processed and verified by the gateway.
                  </p>
                </div>

                <div className="bg-emerald-700/60 rounded-2xl p-4 text-left text-xs space-y-2 border border-emerald-500/50">
                  <div className="flex justify-between">
                    <span className="text-emerald-200">Transaction Reference</span>
                    <span className="font-mono font-bold">{paymentTxnRef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-200">Amount Paid</span>
                    <span className="font-bold">{formatCurrency(bill.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-200">Payment Method</span>
                    <span className="font-bold capitalize">{selectedMethod === 'counter' ? 'Paid at Counter' : onlineType.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-200">Date & Time</span>
                    <span className="font-medium">{formatDateTime(new Date().toISOString())}</span>
                  </div>
                </div>

                <Link
                  href="/orders"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-white text-emerald-800 rounded-2xl font-bold text-xs shadow-md hover:bg-emerald-50"
                >
                  View Order Status <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* ----------------- STATE 2: PAYMENT PROCESSING ----------------- */}
            {paymentState === 'processing' && (
              <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm text-center space-y-4 my-6 animate-in fade-in">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="w-16 h-16 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin" />
                  <CreditCard className="w-6 h-6 text-amber-600 absolute inset-0 m-auto" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base">Payment Processing...</h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
                    Communicating with secure payment gateway. Please do not close or refresh this page.
                  </p>
                </div>
              </div>
            )}

            {/* ----------------- STATE 3: PAYMENT FAILED ----------------- */}
            {paymentState === 'failed' && (
              <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-center space-y-4 animate-in fade-in">
                <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-rose-900 text-base mb-1">Payment Failed</h3>
                  <p className="text-xs text-rose-700">
                    {errorMessage || 'Unable to process transaction. Your account has not been charged.'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleInitiatePayment('success')}
                    variant="primary"
                    className="flex-1 py-3 text-xs font-bold rounded-2xl bg-rose-600 hover:bg-rose-700"
                  >
                    <RefreshCw className="w-4 h-4 mr-1.5" /> Retry Payment
                  </Button>
                  <Button
                    onClick={() => setPaymentState('unpaid')}
                    variant="outline"
                    className="flex-1 py-3 text-xs font-bold rounded-2xl text-stone-700"
                  >
                    Change Method
                  </Button>
                </div>
              </div>
            )}

            {/* ----------------- STATE 4: PAYMENT CANCELLED ----------------- */}
            {paymentState === 'cancelled' && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-center space-y-4 animate-in fade-in">
                <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <XCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-amber-900 text-base mb-1">Payment Cancelled</h3>
                  <p className="text-xs text-amber-800">
                    You cancelled the payment transaction. Select a payment option below when ready.
                  </p>
                </div>
                <Button
                  onClick={() => setPaymentState('unpaid')}
                  variant="primary"
                  className="w-full py-3 text-xs font-bold rounded-2xl"
                >
                  Return to Bill & Payment Options
                </Button>
              </div>
            )}

            {/* ----------------- BILL SUMMARY (Always Visible) ----------------- */}
            <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm space-y-4">
              {/* Header Info */}
              <div className="flex justify-between items-start pb-3 border-b border-stone-100">
                <div>
                  <h2 className="font-black text-stone-900 text-base">{bill.billNumber}</h2>
                  <span className="text-[11px] text-stone-400 block">{formatDateTime(bill.createdAt)}</span>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-xl font-bold uppercase ${
                    bill.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {bill.status}
                </span>
              </div>

              {/* Orders in this session */}
              {sessionOrders.length > 0 && (
                <div className="bg-stone-50 rounded-2xl p-3 text-xs space-y-1">
                  <span className="font-bold text-stone-600 block text-[11px] uppercase tracking-wider">
                    Session Orders ({sessionOrders.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {sessionOrders.map((ord) => (
                      <span key={ord.id} className="px-2 py-0.5 rounded-lg bg-white border border-stone-200 text-stone-700 font-semibold text-[11px]">
                        {ord.orderNumber} ({formatCurrency(ord.totalAmount)})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Itemized Items */}
              <div className="space-y-2.5 py-1">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Itemized Items</span>
                {bill.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <span className="text-stone-800 font-semibold">
                      <span className="text-amber-800 font-extrabold">{item.quantity}x </span>
                      {item.name}
                    </span>
                    <span className="font-extrabold text-stone-900">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>

              {/* Financial Calculation breakdown */}
              <div className="pt-3 border-t border-stone-100 space-y-2 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">{formatCurrency(bill.subtotal)}</span>
                </div>

                {bill.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="font-bold">-{formatCurrency(bill.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Tax (GST/VAT)</span>
                  <span className="font-semibold text-stone-900">{formatCurrency(bill.taxAmount)}</span>
                </div>

                {bill.serviceCharge > 0 && (
                  <div className="flex justify-between">
                    <span>Service Charge</span>
                    <span className="font-semibold text-stone-900">{formatCurrency(bill.serviceCharge)}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-black text-stone-900 pt-3 border-t border-stone-100">
                  <span>Grand Total</span>
                  <span className="text-amber-700">{formatCurrency(bill.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* ----------------- PAYMENT METHOD SELECTION & GATEWAY FLOW ----------------- */}
            {paymentState === 'unpaid' && (
              <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm space-y-4">
                <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-stone-400">
                  Select Payment Option
                </h3>

                {/* Option 1: Pay at Counter vs Option 2: Online Payment */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('online')}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      selectedMethod === 'online'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                        : 'bg-white text-stone-800 border-stone-200 hover:border-amber-400'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 mb-2" />
                    <div>
                      <span className="font-extrabold text-sm block">Online Payment</span>
                      <span className={`text-[11px] block ${selectedMethod === 'online' ? 'text-amber-100' : 'text-stone-500'}`}>
                        UPI, Card, NetBanking
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('counter')}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      selectedMethod === 'counter'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                        : 'bg-white text-stone-800 border-stone-200 hover:border-amber-400'
                    }`}
                  >
                    <Building2 className="w-5 h-5 mb-2" />
                    <div>
                      <span className="font-extrabold text-sm block">Pay at Counter</span>
                      <span className={`text-[11px] block ${selectedMethod === 'counter' ? 'text-amber-100' : 'text-stone-500'}`}>
                        Cash or Card at desk
                      </span>
                    </div>
                  </button>
                </div>

                {/* Online Sub-options */}
                {selectedMethod === 'online' && (
                  <div className="bg-stone-50 rounded-2xl p-3 space-y-2 border border-stone-200/60">
                    <span className="text-[11px] font-bold text-stone-600 block">Online Payment Method</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { type: 'upi', label: 'UPI / QR' },
                        { type: 'card', label: 'Credit/Debit' },
                        { type: 'apple_pay', label: 'NetBanking' },
                      ].map((m) => (
                        <button
                          key={m.type}
                          type="button"
                          onClick={() => setOnlineType(m.type as PaymentMethod)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition-all ${
                            onlineType === m.type
                              ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                              : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {/* Simulation Controls for testing gateway outcomes */}
                    <div className="pt-2 border-t border-stone-200 text-[10px] text-stone-500 space-y-1">
                      <span className="font-semibold block text-stone-600">Gateway Test Outcomes:</span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleInitiatePayment('success')}
                          className="px-2 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg hover:bg-emerald-200"
                        >
                          Simulate Success
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInitiatePayment('failed')}
                          className="px-2 py-1 bg-rose-100 text-rose-800 font-bold rounded-lg hover:bg-rose-200"
                        >
                          Simulate Failure
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInitiatePayment('cancelled')}
                          className="px-2 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg hover:bg-amber-200"
                        >
                          Simulate Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Counter Notice */}
                {selectedMethod === 'counter' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-950 text-xs flex gap-3 items-center">
                    <Building2 className="w-5 h-5 flex-shrink-0 text-amber-600" />
                    <div>
                      <span className="font-bold block">Pay Cash or Card to Waitstaff</span>
                      <span>Please present your table number #{tableNumber} at the billing counter or to your waiter.</span>
                    </div>
                  </div>
                )}

                {/* Primary CTA */}
                <Button
                  onClick={() =>
                    selectedMethod === 'counter'
                      ? handleRequestBillStaff()
                      : handleInitiatePayment('success')
                  }
                  variant="primary"
                  className="w-full py-4 text-base font-extrabold rounded-2xl shadow-lg"
                >
                  {selectedMethod === 'counter' ? (
                    <>
                      <BellRing className="w-5 h-5 mr-2" /> Call Staff to Collect Bill
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 mr-2" /> Pay {formatCurrency(bill.totalAmount)} Online
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      <CustomerBottomNav />
    </div>
  );
}
