'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerHeader } from '../../components/customer/CustomerHeader';
import { CustomerBottomNav } from '../../components/customer/CustomerBottomNav';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/ui/Toast';
import { useAppSelector } from '../../store';
import { requestsApi } from '../../lib/api/requests';
import { ServiceRequest, RequestType } from '../../types/notification';
import {
  BellRing,
  CheckCircle2,
  GlassWater,
  UserCheck,
  Receipt,
  UtensilsCrossed,
  Sparkles,
  HelpCircle,
  Clock,
  AlertCircle,
  CheckCheck,
  XCircle,
} from 'lucide-react';
import { formatDateTime } from '../../lib/utils';

export default function CustomerRequestsPage() {
  const router = useRouter();
  const session = useAppSelector((state) => state.customerSession);

  const [selectedType, setSelectedType] = useState<RequestType>('waiter');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tableRequests, setTableRequests] = useState<ServiceRequest[]>([]);
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const tableNumber = session.table?.tableNumber || 1;
  const tableId = session.table?.id || 'tbl-01';
  const sessionId = session.sessionId || 'sess-demo-12';

  const requestOptions: { type: RequestType; label: string; description: string; icon: React.FC<{ className?: string }> }[] = [
    { type: 'waiter', label: 'Call Waiter', description: 'Request waiter to table', icon: UserCheck },
    { type: 'water', label: 'Water', description: 'Water bottle or glass refill', icon: GlassWater },
    { type: 'cutlery', label: 'Cutlery', description: 'Forks, spoons, or knives', icon: UtensilsCrossed },
    { type: 'napkins', label: 'Napkins', description: 'Fresh paper or cloth napkins', icon: Sparkles },
    { type: 'bill', label: 'Bill', description: 'Request check or printout', icon: Receipt },
    { type: 'other', label: 'Other', description: 'Custom request or assistance', icon: HelpCircle },
  ];

  // Subscribe to real-time request updates for live status changes
  useEffect(() => {
    const unsubscribe = requestsApi.subscribe((allRequests) => {
      const myTableReqs = allRequests.filter((r) => r.tableId === tableId);
      setTableRequests(myTableReqs);
    });

    return () => {
      unsubscribe();
    };
  }, [tableId]);

  // Check if active duplicate request exists for currently selected option
  const activeDuplicate = tableRequests.find(
    (r) =>
      r.type === selectedType &&
      ['PENDING', 'ACCEPTED', 'pending', 'in_progress'].includes(r.status)
  );

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    if (activeDuplicate) {
      setErrorBanner(`An active request for "${requestOptions.find((o) => o.type === selectedType)?.label}" is already in progress.`);
      return;
    }

    try {
      setSubmitting(true);
      const newReq = await requestsApi.createRequest({
        tableNumber,
        tableId,
        sessionId,
        customerName: session.customerName || 'Guest',
        type: selectedType,
        message: message.trim() || undefined,
      });

      setMessage('');
      setToast({
        title: 'Request Sent',
        message: `Your request for ${requestOptions.find((o) => o.type === selectedType)?.label} has been sent to staff.`,
        type: 'success',
      });
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to send service request.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusDisplay = (req: ServiceRequest) => {
    const st = req.status.toUpperCase();
    const optLabel = requestOptions.find((o) => o.type === req.type)?.label || req.type;

    if (st === 'PENDING') {
      return {
        badge: 'PENDING',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
        icon: Clock,
        iconColor: 'text-amber-600 bg-amber-50',
        title: `${optLabel} requested`,
        description: 'Waiting for staff to receive your request...',
      };
    }

    if (st === 'ACCEPTED' || st === 'IN_PROGRESS') {
      return {
        badge: 'ACCEPTED',
        badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
        icon: CheckCircle2,
        iconColor: 'text-blue-600 bg-blue-50',
        title: 'Staff has received your request.',
        description: req.assignedStaffName ? `${req.assignedStaffName} is on the way.` : 'Staff member is attending to your table.',
      };
    }

    if (st === 'COMPLETED' || st === 'FULFILLED') {
      return {
        badge: 'COMPLETED',
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
        icon: CheckCheck,
        iconColor: 'text-emerald-600 bg-emerald-50',
        title: 'Request completed.',
        description: 'Thank you! Let us know if you need anything else.',
      };
    }

    return {
      badge: st,
      badgeColor: 'bg-stone-100 text-stone-700',
      icon: XCircle,
      iconColor: 'text-stone-400 bg-stone-50',
      title: `${optLabel} ${st.toLowerCase()}`,
      description: 'Request updated.',
    };
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

      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-4 space-y-6">
        {/* Title Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-stone-900">Table Assistance</h1>
            <p className="text-xs text-stone-500">Table #{tableNumber} • Real-time service calls</p>
          </div>
          <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold">
            Table #{tableNumber}
          </span>
        </div>

        {/* Error / Warning Alert */}
        {errorBanner && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-amber-950 text-xs flex gap-3 items-center animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
            <div>
              <span className="font-bold block">Active Request Exists</span>
              <span>{errorBanner}</span>
            </div>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSendRequest} className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-400">
            Select Request Option
          </label>

          <div className="grid grid-cols-2 gap-3">
            {requestOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedType === opt.type;
              const isOptionActive = tableRequests.some(
                (r) =>
                  r.type === opt.type &&
                  ['PENDING', 'ACCEPTED', 'pending', 'in_progress'].includes(r.status)
              );

              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => {
                    setSelectedType(opt.type);
                    setErrorBanner(null);
                  }}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                      : 'bg-white text-stone-800 border-stone-200 hover:border-amber-400'
                  }`}
                >
                  {isOptionActive && (
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-2 rounded-xl ${
                        isSelected ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <span className="font-extrabold text-sm block">{opt.label}</span>
                    <span
                      className={`text-[11px] block ${
                        isSelected ? 'text-amber-100' : 'text-stone-500'
                      }`}
                    >
                      {opt.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Optional Message Field */}
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-1.5">
            <label className="block text-xs font-bold text-stone-700">Optional Message / Note</label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., Cold water without ice, 3 extra forks..."
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Submit Action Button */}
          <Button
            type="submit"
            variant="primary"
            isLoading={submitting}
            disabled={submitting || Boolean(activeDuplicate)}
            className="w-full py-4 rounded-2xl font-extrabold text-sm shadow-md"
          >
            <BellRing className="w-4 h-4 mr-2" />
            {activeDuplicate ? 'Request Already Active' : `Send ${requestOptions.find((o) => o.type === selectedType)?.label} Request`}
          </Button>
        </form>

        {/* Real-Time Table Requests Status Tracker */}
        {tableRequests.length > 0 && (
          <div className="space-y-3 pt-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Your Table Assistance Requests ({tableRequests.length})
            </h2>

            <div className="space-y-3">
              {tableRequests.map((req) => {
                const info = getStatusDisplay(req);
                const StatusIcon = info.icon;

                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex items-start gap-3 transition-all"
                  >
                    <div className={`p-2.5 rounded-2xl ${info.iconColor} flex-shrink-0 mt-0.5`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-stone-900 text-sm">{info.title}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${info.badgeColor}`}>
                          {info.badge}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 mb-1">{info.description}</p>

                      {req.message && (
                        <p className="text-[11px] text-amber-800 italic bg-amber-50 p-2 rounded-xl mb-1">
                          &quot;{req.message}&quot;
                        </p>
                      )}

                      <span className="text-[10px] text-stone-400 block">{formatDateTime(req.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <CustomerBottomNav />
    </div>
  );
}
