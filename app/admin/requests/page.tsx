'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { requestsApi } from '../../../lib/api/requests';
import { ServiceRequest } from '../../../types/notification';
import { Bell, CheckCircle2 } from 'lucide-react';
import { formatDateTime } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await requestsApi.getRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleFulfill = async (id: string) => {
    await requestsApi.updateRequestStatus(id, 'fulfilled');
    fetchRequests();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Table Service Requests" subtitle="Customer requests for water, waiters, bills, and assistance." />

      {loading ? (
        <LoadingSpinner label="Loading service requests..." />
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-stone-500 border border-stone-200">
          <Bell className="w-12 h-12 mx-auto mb-2 text-stone-300" />
          <h3 className="font-bold text-stone-900">No Pending Service Requests</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-extrabold text-stone-900 text-base">Table #{r.tableNumber}</span>
                  <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                    {r.type}
                  </span>
                </div>
                {r.customerName && <span className="text-xs text-stone-500 block mb-2">{r.customerName}</span>}
                {r.message && <p className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100">{r.message}</p>}
                <span className="text-[10px] text-stone-400 block mt-2">{formatDateTime(r.createdAt)}</span>
              </div>

              {r.status !== 'fulfilled' ? (
                <Button onClick={() => handleFulfill(r.id)} variant="success" size="sm">
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Complete
                </Button>
              ) : (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl">Fulfilled</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
