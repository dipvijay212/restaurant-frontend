'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { RequestsListSkeleton } from '../../../components/ui/Skeleton';
import { ErrorState } from '../../../components/shared/ErrorState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { requestsApi } from '../../../lib/api/requests';
import { ServiceRequest } from '../../../types/notification';
import { RequestCard } from '../../../components/staff/RequestCard';
import { Toast } from '../../../components/ui/Toast';
import { Bell, CheckCircle2, RefreshCw } from 'lucide-react';

export default function StaffRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string; type?: 'success' | 'error' | 'info' } | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await requestsApi.getRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Unable to load customer requests.');
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time service requests feed
  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const unsubscribe = requestsApi.subscribe((updatedReqs) => {
        setRequests(updatedReqs);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (err: any) {
      setError(err.message || 'Unable to connect to live requests feed.');
      setLoading(false);
    }
  }, []);

  const handleAccept = async (id: string) => {
    try {
      const updated = await requestsApi.updateRequestStatus(id, 'ACCEPTED', undefined, 'Carlos Waiter');
      setToastMessage({ title: 'Request Accepted', message: `Attending to Table #${updated.tableNumber}`, type: 'success' });
    } catch (err) {
      setToastMessage({ title: 'Action Failed', message: 'Failed to accept request.', type: 'error' });
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const updated = await requestsApi.updateRequestStatus(id, 'COMPLETED');
      setToastMessage({ title: 'Request Completed', message: `Marked fulfilled for Table #${updated.tableNumber}`, type: 'success' });
    } catch (err) {
      setToastMessage({ title: 'Action Failed', message: 'Failed to complete request.', type: 'error' });
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
          <Toast type={toastMessage.type || 'info'} title={toastMessage.title} message={toastMessage.message} onClose={() => setToastMessage(null)} />
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
          <button
            onClick={fetchRequests}
            className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
            title="Refresh Requests"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
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
        <div className="space-y-4">
          <span className="text-xs font-bold text-stone-400">Connecting to live requests feed...</span>
          <RequestsListSkeleton count={6} />
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to load customer requests"
          message={error}
          onRetry={fetchRequests}
        />
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No Active Requests"
          description="All customer assistance calls have been fulfilled."
        />
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
