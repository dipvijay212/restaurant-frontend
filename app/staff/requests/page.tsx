'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { requestsApi } from '../../../lib/api/requests';
import { ServiceRequest } from '../../../types/notification';
import { RequestCard } from '../../../components/staff/RequestCard';
import { Toast } from '../../../components/ui/Toast';
import { Bell, CheckCircle2, RefreshCw } from 'lucide-react';

export default function StaffRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string } | null>(null);

  // Subscribe to real-time service requests feed
  useEffect(() => {
    setLoading(true);
    const unsubscribe = requestsApi.subscribe((updatedReqs) => {
      setRequests(updatedReqs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      const updated = await requestsApi.updateRequestStatus(id, 'ACCEPTED', undefined, 'Carlos Waiter');
      setToastMessage({ title: 'Request Accepted', message: `Attending to Table #${updated.tableNumber}` });
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const updated = await requestsApi.updateRequestStatus(id, 'COMPLETED');
      setToastMessage({ title: 'Request Completed', message: `Marked fulfilled for Table #${updated.tableNumber}` });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const st = r.status.toUpperCase();
      if (filterTab === 'pending') return st === 'PENDING';
      if (filterTab === 'accepted') return st === 'ACCEPTED' || st === 'IN_PROGRESS';
      if (filterTab === 'completed') return st === 'COMPLETED' || st === 'FULFILLED';
      return true;
    });
  }, [requests, filterTab]);

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
            <Bell className="w-6 h-6 text-amber-500" /> Customer Assistance Requests
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time feed for water, waiter calls, cutlery, and bill requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold">
            {requests.filter((r) => r.status.toUpperCase() === 'PENDING').length} Pending Calls
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-stone-200 gap-1 w-fit shadow-sm">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filterTab === 'all' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          All Requests ({requests.length})
        </button>
        <button
          onClick={() => setFilterTab('pending')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filterTab === 'pending' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Pending ({requests.filter((r) => r.status.toUpperCase() === 'PENDING').length})
        </button>
        <button
          onClick={() => setFilterTab('accepted')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filterTab === 'accepted' ? 'bg-blue-600 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Accepted ({requests.filter((r) => ['ACCEPTED', 'IN_PROGRESS'].includes(r.status.toUpperCase())).length})
        </button>
        <button
          onClick={() => setFilterTab('completed')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filterTab === 'completed' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Completed ({requests.filter((r) => ['COMPLETED', 'FULFILLED'].includes(r.status.toUpperCase())).length})
        </button>
      </div>

      {/* Requests Feed */}
      {loading ? (
        <LoadingSpinner label="Connecting to live requests feed..." />
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-stone-500 border border-stone-200 shadow-sm">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-600" />
          <h3 className="font-bold text-stone-900 text-lg">No Active Requests</h3>
          <p className="text-xs text-stone-500">All customer assistance calls have been fulfilled.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((req) => (
            <RequestCard key={req.id} request={req} onAccept={handleAccept} onComplete={handleComplete} />
          ))}
        </div>
      )}
    </div>
  );
}
