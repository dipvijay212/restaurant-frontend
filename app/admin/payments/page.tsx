'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { TableSkeleton } from '../../../components/ui/Skeleton';
import { ErrorState } from '../../../components/shared/ErrorState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useToast } from '../../../components/ui/ToastProvider';
import { paymentsApi } from '../../../lib/api/payments';
import { PaymentTransaction, PaymentStatus, PaymentMethod } from '../../../types/payment';
import { formatCurrency, formatDateTime } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';
import { PaymentDetailModal } from '../../../components/admin/PaymentDetailModal';
import { cashfreeAdapter } from '../../../lib/payment/cashfreeAdapter';
import {
  CreditCard,
  Search,
  Filter,
  Eye,
  RefreshCw,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  QrCode,
  DollarSign,
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const toast = useToast();
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Modals
  const [selectedPaymentForDetail, setSelectedPaymentForDetail] = useState<PaymentTransaction | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentsApi.getPayments();
      setPayments(data);
    } catch (err: any) {
      console.error('Failed to fetch payments:', err);
      setError(err?.message || 'Unable to load payment audit records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: PaymentStatus) => {
    try {
      const updated = await paymentsApi.updatePaymentStatus(id, newStatus);
      setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
      toast.success(`Transaction ${updated.transactionRef || updated.id} set to ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update transaction status');
    }
  };

  const handleRefund = async (id: string, reason?: string) => {
    try {
      const updated = await paymentsApi.refundPayment(id, undefined, reason);
      setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
      toast.success(`Refund processed for ${updated.transactionRef || updated.id}`);
    } catch (err: any) {
      toast.error(err?.message || 'Payment refund failed');
    }
  };

  // Status Badge Styling Helper
  const getStatusBadge = (statusStr: string) => {
    const s = statusStr.toUpperCase();
    switch (s) {
      case 'SUCCESS':
      case 'SUCCESSFUL':
      case 'COMPLETED':
        return { label: 'SUCCESS', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'PROCESSING':
        return { label: 'PROCESSING', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'REFUNDED':
        return { label: 'REFUNDED', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'FAILED':
        return { label: 'FAILED', bg: 'bg-rose-100 text-rose-900 border-rose-300' };
      case 'CANCELLED':
        return { label: 'CANCELLED', bg: 'bg-stone-100 text-stone-700 border-stone-300' };
      default:
        return { label: s, bg: 'bg-stone-100 text-stone-700 border-stone-300' };
    }
  };

  // Filter Logic
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        (p.transactionRef && p.transactionRef.toLowerCase().includes(q)) ||
        p.id.toLowerCase().includes(q) ||
        (p.billNumber && p.billNumber.toLowerCase().includes(q)) ||
        p.billId.toLowerCase().includes(q) ||
        (p.customerName && p.customerName.toLowerCase().includes(q)) ||
        p.tableNumber.toString().includes(q);

      if (!matchSearch) return false;

      // Status Filter Match
      if (statusFilter !== 'all') {
        const stUpper = p.status.toUpperCase();
        if (stUpper !== statusFilter.toUpperCase()) {
          if (statusFilter === 'SUCCESS' && (stUpper === 'COMPLETED' || stUpper === 'SUCCESSFUL')) {
            // match
          } else {
            return false;
          }
        }
      }

      // Payment Method Filter Match
      if (methodFilter !== 'all') {
        const mUpper = p.method.toUpperCase();
        if (!mUpper.includes(methodFilter.toUpperCase())) return false;
      }

      // Date Filter Match
      if (dateFilter !== 'all') {
        const createdDate = new Date(p.createdAt);
        const now = new Date();
        if (dateFilter === 'today') {
          const isToday = createdDate.toDateString() === now.toDateString();
          if (!isToday) return false;
        } else if (dateFilter === 'week') {
          const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 7) return false;
        } else if (dateFilter === 'month') {
          const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 30) return false;
        }
      }

      return true;
    });
  }, [payments, searchQuery, statusFilter, methodFilter, dateFilter]);

  // Financial Stats
  const totalVolume = payments
    .filter((p) => ['SUCCESS', 'SUCCESSFUL', 'COMPLETED', 'completed'].includes(p.status.toUpperCase()))
    .reduce((acc, p) => acc + p.amount, 0);

  const totalRefunds = payments
    .filter((p) => p.status.toUpperCase() === 'REFUNDED')
    .reduce((acc, p) => acc + p.amount, 0);

  const cashfreeConfig = cashfreeAdapter.getEnvironmentConfig();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" /> Payment Gateway & Transactions Audit
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time transaction logs, Cashfree SDK integration adapter, gateway reference IDs, and refunds.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Transactions
        </button>
      </div>

      {/* Cashfree Integration Architecture Banner */}
      <div className="bg-emerald-950 text-white rounded-3xl p-5 border border-emerald-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500 text-stone-950 rounded-2xl font-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-emerald-300">Cashfree PG Gateway Architecture Ready</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-mono font-bold">
                ENV: {cashfreeConfig.environment}
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Frontend SDK adapter active (`lib/payment/cashfreeAdapter.ts`). Zero payment secrets exposed in client code.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-emerald-400 font-mono font-bold block">App ID: {cashfreeConfig.appId}</span>
          <span className="text-[10px] text-emerald-300/70">Client SDK V3 Web Standard</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-stone-400 text-xs font-bold block">Total Settled Volume</span>
          <span className="text-2xl font-black text-emerald-600">{formatCurrency(totalVolume)}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-stone-400 text-xs font-bold block">Total Refunds Issued</span>
          <span className="text-2xl font-black text-purple-600">{formatCurrency(totalRefunds)}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-stone-400 text-xs font-bold block">Successful Txns</span>
          <span className="text-2xl font-black text-stone-900">
            {payments.filter((p) => ['SUCCESS', 'SUCCESSFUL', 'COMPLETED'].includes(p.status.toUpperCase())).length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-stone-400 text-xs font-bold block">Failed / Cancelled</span>
          <span className="text-2xl font-black text-rose-600">
            {payments.filter((p) => ['FAILED', 'CANCELLED'].includes(p.status.toUpperCase())).length}
          </span>
        </div>
      </div>

      {/* Controls & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Transaction ID, Invoice #, Table #, or Guest..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Method Filter & Date Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Method Filter Select */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none"
            >
              <option value="all">All Payment Methods</option>
              <option value="CASHFREE">Cashfree Online</option>
              <option value="CARD">Credit/Debit Card</option>
              <option value="UPI">UPI / QR</option>
              <option value="CASH">Cash at Counter</option>
            </select>

            {/* Date Filter */}
            <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-bold text-stone-600">
              {(['all', 'today', 'week', 'month'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDateFilter(d)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                    dateFilter === d ? 'bg-white text-stone-900 shadow-sm font-extrabold' : ''
                  }`}
                >
                  {d === 'all' ? 'All Time' : d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-stone-100 overflow-x-auto">
          <span className="text-xs font-bold text-stone-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['all', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-xl text-xs font-black capitalize transition-all ${
                statusFilter.toUpperCase() === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List Table */}
      {error ? (
        <ErrorState
          title="Unable to load payments"
          message={error}
          onRetry={fetchPayments}
        />
      ) : loading ? (
        <TableSkeleton rows={8} columns={8} />
      ) : filteredPayments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No transactions found."
          description={
            searchQuery || statusFilter !== 'all' || methodFilter !== 'all' || dateFilter !== 'all'
              ? 'No payment records match the selected filters.'
              : 'Payment transactions will be logged here as guests settle bills.'
          }
          actionLabel={
            searchQuery || statusFilter !== 'all' || methodFilter !== 'all' || dateFilter !== 'all'
              ? 'Clear Filters'
              : undefined
          }
          onAction={
            searchQuery || statusFilter !== 'all' || methodFilter !== 'all' || dateFilter !== 'all'
              ? () => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setMethodFilter('all');
                  setDateFilter('all');
                }
              : undefined
          }
        />
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 text-[11px] font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Invoice / Bill</th>
                  <th className="py-3.5 px-4">Table</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date / Time</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs font-medium text-stone-800">
                {filteredPayments.map((p) => {
                  const badge = getStatusBadge(p.status);

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Transaction ID */}
                      <td className="py-3.5 px-4 font-black font-mono text-emerald-900">
                        {p.transactionRef || p.id}
                      </td>

                      {/* Bill / Invoice */}
                      <td className="py-3.5 px-4 font-bold text-amber-900">
                        {p.billNumber || p.billId}
                      </td>

                      {/* Table */}
                      <td className="py-3.5 px-4 font-extrabold text-stone-900">
                        Table #{p.tableNumber}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 font-bold text-stone-700 uppercase">
                        {p.method}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-black text-stone-900 text-sm">
                        {formatCurrency(p.amount)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Date Time */}
                      <td className="py-3.5 px-4 text-[11px] text-stone-500">
                        {formatDateTime(p.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPaymentForDetail(p)}
                            className="p-1.5 text-stone-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="View Transaction Details & Gateway Logs"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Detail Modal */}
      <PaymentDetailModal
        payment={selectedPaymentForDetail}
        isOpen={!!selectedPaymentForDetail}
        onClose={() => setSelectedPaymentForDetail(null)}
        onUpdateStatus={handleUpdateStatus}
        onRefund={handleRefund}
      />
    </div>
  );
}
