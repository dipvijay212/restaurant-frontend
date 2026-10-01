'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { billsApi } from '../../../lib/api/bills';
import { Bill, BillStatus } from '../../../types/bill';
import { formatCurrency, formatDateTime } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';
import { Toast } from '../../../components/ui/Toast';
import { PrintableInvoiceModal } from '../../../components/admin/PrintableInvoiceModal';
import { BillDetailsModal } from '../../../components/admin/BillDetailsModal';
import { GenerateBillModal } from '../../../components/admin/GenerateBillModal';
import {
  Receipt,
  Search,
  Filter,
  Calendar,
  Printer,
  Eye,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function AdminBillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Modals
  const [selectedBillForDetail, setSelectedBillForDetail] = useState<Bill | null>(null);
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<Bill | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string } | null>(null);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const data = await billsApi.getBills();
      setBills(data);
    } catch (err) {
      console.error('Failed to fetch bills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    status: BillStatus,
    paidAmount?: number,
    paymentMethod?: string
  ) => {
    try {
      const updated = await billsApi.updateBillStatus(id, status, paidAmount, paymentMethod);
      setBills((prev) => prev.map((b) => (b.id === id ? updated : b)));
      if (selectedBillForDetail?.id === id) {
        setSelectedBillForDetail(updated);
      }
      setToastMessage({
        title: 'Bill Status Updated',
        message: `${updated.billNumber} set to ${status.toUpperCase()}`,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleBillGenerated = (newBill: Bill) => {
    setBills((prev) => [newBill, ...prev]);
    setToastMessage({
      title: 'Invoice Generated',
      message: `Generated ${newBill.billNumber} for Table #${newBill.tableNumber}`,
    });
  };

  // Filter Logic
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        b.billNumber.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.tableNumber.toString().includes(q);

      if (!matchSearch) return false;

      // Status filter match
      if (statusFilter !== 'all') {
        const stUpper = b.status.toUpperCase();
        if (stUpper !== statusFilter.toUpperCase()) return false;
      }

      // Table filter match
      if (tableFilter !== 'all' && b.tableNumber.toString() !== tableFilter) {
        return false;
      }

      // Date filter match
      if (dateFilter !== 'all') {
        const createdDate = new Date(b.createdAt);
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
  }, [bills, searchQuery, statusFilter, tableFilter, dateFilter]);

  const uniqueTables = Array.from(new Set(bills.map((b) => b.tableNumber))).sort((a, b) => a - b);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-sm">
          <Toast
            type="info"
            title={toastMessage.title}
            message={toastMessage.message}
            onClose={() => setToastMessage(null)}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-500" /> Admin Billing & Invoices
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Dining session bill aggregation, tax calculations, payment status updates, and printable invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsGenerateModalOpen(true)}
            variant="primary"
            className="py-2.5 px-4 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> Generate Table Bill
          </Button>

          <button
            onClick={fetchBills}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
            title="Refresh Invoices"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Controls & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Invoice #, Customer, or Table #..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Table Filter & Date Filter Selects */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Table Filter */}
            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none"
            >
              <option value="all">All Tables</option>
              {uniqueTables.map((tbl) => (
                <option key={tbl} value={tbl.toString()}>
                  Table #{tbl}
                </option>
              ))}
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

        {/* Payment Status Filter Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-stone-100 overflow-x-auto">
          <span className="text-xs font-bold text-stone-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Payment Status:
          </span>
          {['all', 'UNPAID', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-xl text-xs font-black capitalize transition-all ${
                statusFilter.toUpperCase() === st
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bill List Table */}
      {loading ? (
        <LoadingSpinner label="Fetching invoice archives..." />
      ) : filteredBills.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-stone-500 border border-stone-200 shadow-sm">
          <Receipt className="w-12 h-12 mx-auto mb-3 text-stone-400" />
          <h3 className="font-bold text-stone-900 text-lg">No Invoices Found</h3>
          <p className="text-xs text-stone-500">No dining bills matching current search or status filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 text-[11px] font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Table</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Subtotal</th>
                  <th className="py-3.5 px-4">Tax / Disc</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Paid / Rem.</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs font-medium text-stone-800">
                {filteredBills.map((b) => {
                  const statusUpper = b.status.toUpperCase();
                  const isPaid = statusUpper === 'PAID';

                  return (
                    <tr key={b.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-black text-amber-900">{b.billNumber}</td>
                      <td className="py-3.5 px-4 font-extrabold text-stone-900">Table #{b.tableNumber}</td>
                      <td className="py-3.5 px-4 font-semibold text-stone-700">{b.customerName}</td>
                      <td className="py-3.5 px-4 font-bold">{formatCurrency(b.subtotal)}</td>
                      <td className="py-3.5 px-4 text-[11px] text-stone-500">
                        Tax: {formatCurrency(b.taxAmount)}
                        {b.discountAmount > 0 && (
                          <span className="text-emerald-700 block font-bold">Disc: -{formatCurrency(b.discountAmount)}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-black text-stone-900 text-sm">{formatCurrency(b.totalAmount)}</td>
                      <td className="py-3.5 px-4 text-[11px]">
                        <span className="font-bold text-emerald-700 block">Paid: {formatCurrency(b.paidAmount)}</span>
                        <span className={b.remainingAmount > 0 ? 'text-rose-600 font-bold block' : 'text-stone-400 block'}>
                          Rem: {formatCurrency(b.remainingAmount)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 text-[11px] font-black rounded-lg uppercase tracking-wide border ${
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
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-stone-500">{formatDateTime(b.createdAt)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Details Button */}
                          <button
                            onClick={() => setSelectedBillForDetail(b)}
                            className="p-1.5 text-stone-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Inspect Session Breakdown & Change Status"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Print Invoice Button */}
                          <button
                            onClick={() => setSelectedBillForPrint(b)}
                            className="p-1.5 text-stone-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Print Thermal Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* 1-Tap Mark Paid */}
                          {!isPaid && (
                            <Button
                              onClick={() => handleUpdateStatus(b.id, 'PAID', b.totalAmount)}
                              variant="primary"
                              size="sm"
                              className="py-1 px-2.5 text-[10px] font-black bg-amber-500 hover:bg-amber-400 text-stone-950"
                            >
                              Mark Paid
                            </Button>
                          )}
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

      {/* Bill Details Modal */}
      <BillDetailsModal
        bill={selectedBillForDetail}
        isOpen={!!selectedBillForDetail}
        onClose={() => setSelectedBillForDetail(null)}
        onUpdateStatus={handleUpdateStatus}
        onOpenPrintModal={(b) => {
          setSelectedBillForDetail(null);
          setSelectedBillForPrint(b);
        }}
      />

      {/* Printable Invoice Receipt Modal */}
      <PrintableInvoiceModal
        bill={selectedBillForPrint}
        isOpen={!!selectedBillForPrint}
        onClose={() => setSelectedBillForPrint(null)}
      />

      {/* Generate Bill Modal */}
      <GenerateBillModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onBillGenerated={handleBillGenerated}
      />
    </div>
  );
}
