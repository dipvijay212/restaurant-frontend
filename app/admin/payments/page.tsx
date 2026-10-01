'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { paymentsApi } from '../../../lib/api/payments';
import { Payment } from '../../../types/payment';
import { formatCurrency, formatDateTime } from '../../../lib/utils';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      try {
        setLoading(true);
        const data = await paymentsApi.getPayments();
        setPayments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Payment Transactions" subtitle="Payment methods, transaction references, and settlement logs." />

      {loading ? (
        <LoadingSpinner label="Loading transaction logs..." />
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 text-xs font-semibold uppercase">
                <tr>
                  <th className="py-3.5 px-4">Transaction Ref</th>
                  <th className="py-3.5 px-4">Table</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/50">
                    <td className="py-3.5 px-4 font-bold font-mono text-stone-900">{p.transactionRef || p.id}</td>
                    <td className="py-3.5 px-4">Table #{p.tableNumber}</td>
                    <td className="py-3.5 px-4 font-semibold uppercase text-xs text-amber-700">{p.method}</td>
                    <td className="py-3.5 px-4 font-extrabold">{formatCurrency(p.amount)}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800 uppercase">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-stone-500">{formatDateTime(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
