'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { billsApi } from '../../../lib/api/bills';
import { Bill } from '../../../types/bill';
import { formatCurrency, formatDateTime } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';
import { Toast } from '../../../components/ui/Toast';
import { Receipt, CheckCircle2, Clock, RefreshCw } from 'lucide-react';

export default function StaffBillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'unpaid' | 'paid' | 'all'>('unpaid');
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

  const handleCollectPayment = async (id: string) => {
    try {
      const updated = await billsApi.updateBillStatus(id, 'paid');
      setBills((prev) => prev.map((b) => (b.id === id ? updated : b)));
      setToastMessage({ title: 'Payment Collected!', message: `Bill ${updated.billNumber} marked settled.` });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      if (filterTab === 'unpaid') return b.status === 'unpaid' || b.status === 'partially_paid';
      if (filterTab === 'paid') return b.status === 'paid';
      return true;
    });
  }, [bills, filterTab]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-sm">
          <Toast type="info" title={toastMessage.title} message={toastMessage.message} onClose={() => setToastMessage(null)} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-rose-600" /> Table Billing & Payment Settlement
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Process table payments, issue receipts, and settle dining accounts.
          </p>
        </div>

        <button
          onClick={fetchBills}
          className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Bills
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-stone-200 gap-1 w-fit shadow-sm">
        <button
          onClick={() => setFilterTab('unpaid')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${
            filterTab === 'unpaid' ? 'bg-rose-600 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Unpaid Bills ({bills.filter((b) => b.status === 'unpaid' || b.status === 'partially_paid').length})
        </button>
        <button
          onClick={() => setFilterTab('paid')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${
            filterTab === 'paid' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Settled / Paid ({bills.filter((b) => b.status === 'paid').length})
        </button>
        <button
          onClick={() => setFilterTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${
            filterTab === 'all' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          All Bills ({bills.length})
        </button>
      </div>

      {/* Bills List */}
      {loading ? (
        <LoadingSpinner label="Loading billing accounts..." />
      ) : filteredBills.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-stone-500 border border-stone-200 shadow-sm">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-600" />
          <h3 className="font-bold text-stone-900 text-lg">No Pending Table Bills</h3>
          <p className="text-xs text-stone-500">All guest dining bills have been settled.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBills.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-extrabold text-stone-900 text-base">{b.billNumber}</span>
                  <span className="font-bold text-amber-900 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-lg text-xs">
                    Table #{b.tableNumber}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border ${
                      b.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-rose-100 text-rose-900 border-rose-300'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-500 font-medium">
                  <span>Guest: {b.customerName}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" /> Requested {formatDateTime(b.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                <div className="text-right">
                  <span className="font-black text-stone-900 text-xl block">{formatCurrency(b.totalAmount)}</span>
                  <span className="text-[10px] text-stone-400 font-medium">Subtotal {formatCurrency(b.subtotal)} + Tax {formatCurrency(b.taxAmount)}</span>
                </div>

                {b.status !== 'paid' ? (
                  <Button
                    onClick={() => handleCollectPayment(b.id)}
                    variant="primary"
                    className="py-3 px-5 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 active:scale-95 shadow-md"
                  >
                    Collect Cash/Card
                  </Button>
                ) : (
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl">
                    Paid & Settled
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
