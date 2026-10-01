'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { requestsApi } from '../../../lib/api/requests';
import { staffApi } from '../../../lib/api/staff';
import { ServiceRequest, RequestStatus, RequestType } from '../../../types/notification';
import { StaffMember } from '../../../types/staff';
import { formatDateTime } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';
import { Toast } from '../../../components/ui/Toast';
import {
  Bell,
  CheckCircle2,
  GlassWater,
  UserCheck,
  Receipt,
  Sparkles,
  UtensilsCrossed,
  HelpCircle,
  Clock,
  AlertTriangle,
  Filter,
  Search,
  PlusCircle,
  XCircle,
  User,
  RefreshCw,
} from 'lucide-react';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [tableFilter, setTableFilter] = useState<string>('all');

  // Toast
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string } | null>(null);

  // Live Timer tick state
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Staff list & Subscribe to Requests
  useEffect(() => {
    async function loadStaff() {
      try {
        const staff = await staffApi.getStaffMembers();
        setStaffList(staff);
      } catch (err) {
        console.error(err);
      }
    }
    loadStaff();

    setLoading(true);
    const unsubscribe = requestsApi.subscribe((updatedReqs) => {
      setRequests(updatedReqs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handlers
  const handleUpdateStatus = async (id: string, newStatus: RequestStatus) => {
    try {
      const updated = await requestsApi.updateRequestStatus(id, newStatus);
      setToastMessage({
        title: `Request ${newStatus.toUpperCase()}`,
        message: `Updated service call for Table #${updated.tableNumber}`,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignStaff = async (id: string, staffName: string) => {
    try {
      const member = staffList.find((s) => s.name === staffName);
      const updated = await requestsApi.updateRequestStatus(
        id,
        'ACCEPTED',
        member?.id,
        staffName || 'Staff Member'
      );
      setToastMessage({
        title: 'Staff Assigned',
        message: `Assigned ${staffName} to Table #${updated.tableNumber}`,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Simulate Incoming Customer Call
  const handleSimulateRequest = async () => {
    const sampleTables = [1, 2, 4, 6, 7, 9, 11];
    const sampleTypes: RequestType[] = ['water', 'waiter', 'cutlery', 'napkins', 'bill', 'other'];
    const sampleMessages: Partial<Record<RequestType, string>> = {
      water: 'Would like extra ice and sparkling water.',
      waiter: 'Need assistance ordering dessert.',
      cutlery: 'Need clean forks and extra napkins.',
      napkins: 'Extra cloth napkins for party.',
      bill: 'Ready for table bill payment.',
      other: 'Special birthday candle request.',
      custom: 'Assistance needed.',
      cleaning: 'Spill cleanup needed.',
    };

    const tableNo = sampleTables[Math.floor(Math.random() * sampleTables.length)];
    const chosenType = sampleTypes[Math.floor(Math.random() * sampleTypes.length)];

    try {
      const created = await requestsApi.createRequest({
        tableNumber: tableNo,
        tableId: `tbl-0${tableNo}`,
        customerName: `Guest Table #${tableNo}`,
        type: chosenType,
        message: sampleMessages[chosenType],
      });

      setToastMessage({
        title: `New Service Request: ${chosenType.toUpperCase()}`,
        message: `Table #${created.tableNumber} requested ${chosenType.toLowerCase()}`,
      });
    } catch (err: any) {
      setToastMessage({
        title: 'Simulation Notice',
        message: err.message || 'Request creation skipped.',
      });
    }
  };

  // Icon Helper
  const getRequestTypeMeta = (typeStr: string) => {
    const t = typeStr.toLowerCase();
    switch (t) {
      case 'water':
        return { label: 'WATER', icon: GlassWater, bg: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'waiter':
        return { label: 'WAITER', icon: UserCheck, bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'cutlery':
        return { label: 'CUTLERY', icon: UtensilsCrossed, bg: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case 'napkin':
      case 'napkins':
        return { label: 'NAPKIN', icon: Sparkles, bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'bill':
        return { label: 'BILL', icon: Receipt, bg: 'bg-rose-100 text-rose-900 border-rose-300' };
      default:
        return { label: t.toUpperCase(), icon: HelpCircle, bg: 'bg-stone-100 text-stone-700 border-stone-300' };
    }
  };

  // Filter Logic
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        r.tableNumber.toString().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        (r.customerName && r.customerName.toLowerCase().includes(q)) ||
        (r.message && r.message.toLowerCase().includes(q));

      if (!matchSearch) return false;

      // Status Filter
      if (statusFilter !== 'all') {
        const stUpper = r.status.toUpperCase();
        if (stUpper !== statusFilter.toUpperCase()) return false;
      }

      // Type Filter
      if (typeFilter !== 'all') {
        const typeUpper = r.type.toUpperCase();
        if (typeUpper !== typeFilter.toUpperCase() && !(typeFilter === 'NAPKIN' && typeUpper === 'NAPKINS')) {
          return false;
        }
      }

      // Table Filter
      if (tableFilter !== 'all' && r.tableNumber.toString() !== tableFilter) {
        return false;
      }

      return true;
    });
  }, [requests, searchQuery, statusFilter, typeFilter, tableFilter]);

  const uniqueTables = Array.from(new Set(requests.map((r) => r.tableNumber))).sort((a, b) => a - b);

  // Statistics
  const pendingCount = requests.filter((r) => r.status.toUpperCase() === 'PENDING').length;
  const acceptedCount = requests.filter((r) => ['ACCEPTED', 'IN_PROGRESS'].includes(r.status.toUpperCase())).length;
  const completedCount = requests.filter((r) => ['COMPLETED', 'FULFILLED'].includes(r.status.toUpperCase())).length;
  const delayedCount = requests.filter((r) => {
    const elapsedSec = Math.floor((nowTimestamp - new Date(r.createdAt).getTime()) / 1000);
    return r.status.toUpperCase() === 'PENDING' && elapsedSec >= 180;
  }).length;

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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-500" /> Customer Service Requests
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time table assistance calls, waiter requests, waiting timers, and staff assignment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateRequest}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            title="Simulate incoming customer service call"
          >
            <PlusCircle className="w-4 h-4" /> Simulate Customer Call
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-stone-400 text-xs font-bold block">Pending Calls</span>
          <span className="text-2xl font-black text-amber-600">{pendingCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-stone-400 text-xs font-bold block">Delayed Calls (&gt;3m)</span>
          <span className={`text-2xl font-black ${delayedCount > 0 ? 'text-rose-600 animate-pulse' : 'text-stone-900'}`}>
            {delayedCount}
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-stone-400 text-xs font-bold block">Accepted / In Progress</span>
          <span className="text-2xl font-black text-blue-600">{acceptedCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-stone-400 text-xs font-bold block">Completed Today</span>
          <span className="text-2xl font-black text-emerald-600">{completedCount}</span>
        </div>
      </div>

      {/* Controls & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Table #, Request Type, or Guest Note..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Table Filter Select */}
          <div className="flex items-center gap-2">
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
          </div>
        </div>

        {/* Status & Request Type Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-100">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-bold text-stone-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            {['all', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-xl text-xs font-black uppercase transition-all ${
                  statusFilter.toUpperCase() === st
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-bold text-stone-400">Type:</span>
            {['all', 'WAITER', 'WATER', 'CUTLERY', 'NAPKIN', 'BILL', 'OTHER'].map((tp) => (
              <button
                key={tp}
                onClick={() => setTypeFilter(tp)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold uppercase transition-all ${
                  typeFilter.toUpperCase() === tp
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {tp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests Feed List Grid */}
      {loading ? (
        <LoadingSpinner label="Connecting to live requests feed..." />
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-stone-500 border border-stone-200 shadow-sm">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-600" />
          <h3 className="font-bold text-stone-900 text-lg">No Active Requests</h3>
          <p className="text-xs text-stone-500">No service calls matching current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((req) => {
            const typeMeta = getRequestTypeMeta(req.type);
            const TypeIcon = typeMeta.icon;

            const createdMs = new Date(req.createdAt).getTime();
            const elapsedSec = Math.max(0, Math.floor((nowTimestamp - createdMs) / 1000));
            const min = Math.floor(elapsedSec / 60);
            const sec = elapsedSec % 60;
            const waitingTimeFormatted = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

            const statusUpper = req.status.toUpperCase();
            const isPending = statusUpper === 'PENDING';
            const isAccepted = statusUpper === 'ACCEPTED' || statusUpper === 'IN_PROGRESS';
            const isCompleted = statusUpper === 'COMPLETED' || statusUpper === 'FULFILLED';
            const isCancelled = statusUpper === 'CANCELLED';

            // Highlight requests waiting too long (>3 minutes)
            const isDelayed = isPending && min >= 3;

            return (
              <div
                key={req.id}
                className={`rounded-2xl p-5 border shadow-sm transition-all flex flex-col justify-between ${
                  isDelayed
                    ? 'bg-rose-50/90 border-rose-500 ring-4 ring-rose-500/30'
                    : isPending
                    ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20'
                    : isAccepted
                    ? 'bg-blue-50/70 border-blue-300'
                    : 'bg-white border-stone-200 opacity-90'
                }`}
              >
                <div>
                  {/* Card Top Row */}
                  <div className="flex justify-between items-start pb-3 border-b border-stone-200/80 mb-3 gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-2xl ${
                          isDelayed
                            ? 'bg-rose-600 text-white animate-bounce'
                            : isPending
                            ? 'bg-amber-500 text-stone-950 animate-pulse'
                            : isAccepted
                            ? 'bg-blue-600 text-white'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-stone-900 text-xl tracking-tight">
                            Table #{req.tableNumber}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${typeMeta.bg}`}
                          >
                            {typeMeta.label}
                          </span>
                        </div>
                        {req.customerName && (
                          <span className="text-xs text-stone-500 block font-medium mt-0.5">
                            Guest: {req.customerName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Waiting Time Ticker */}
                    <div className="text-right flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition-colors ${
                          isDelayed
                            ? 'bg-rose-600 text-white border-rose-700 animate-pulse shadow-md'
                            : isPending
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {waitingTimeFormatted}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {formatDateTime(req.createdAt).split(',')[1] || formatDateTime(req.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Delayed Warning Callout */}
                  {isDelayed && (
                    <div className="mb-3 px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 animate-pulse shadow-sm">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>WAITING TOO LONG (&gt;3m) - URGENT ATTENTION</span>
                    </div>
                  )}

                  {/* Message Note */}
                  {req.message && (
                    <div className="mb-4 p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-800 font-semibold italic">
                      &quot;{req.message}&quot;
                    </div>
                  )}

                  {/* Assigned Staff Selection */}
                  <div className="mb-4 flex items-center justify-between bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 text-xs">
                    <span className="text-stone-500 font-bold flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-stone-400" /> Staff Assigned:
                    </span>
                    <select
                      value={req.assignedStaffName || ''}
                      onChange={(e) => handleAssignStaff(req.id, e.target.value)}
                      className="px-2 py-1 bg-white border border-stone-200 rounded-lg text-xs font-extrabold text-stone-800 focus:outline-none"
                    >
                      <option value="">-- Unassigned --</option>
                      {staffList.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name} ({s.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="pt-3 border-t border-stone-200/80 flex items-center gap-2">
                  {isPending && (
                    <>
                      <Button
                        onClick={() => handleUpdateStatus(req.id, 'ACCEPTED')}
                        variant="primary"
                        className="w-full py-2.5 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 active:scale-95 shadow-sm"
                      >
                        Accept Call
                      </Button>
                      <Button
                        onClick={() => handleUpdateStatus(req.id, 'CANCELLED')}
                        variant="outline"
                        className="py-2.5 px-3 text-xs font-bold rounded-xl text-stone-600 border-stone-300 hover:bg-stone-100"
                      >
                        Cancel
                      </Button>
                    </>
                  )}

                  {isAccepted && (
                    <>
                      <Button
                        onClick={() => handleUpdateStatus(req.id, 'COMPLETED')}
                        variant="success"
                        className="w-full py-2.5 text-xs font-black rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 shadow-sm"
                      >
                        Mark Completed
                      </Button>
                      <Button
                        onClick={() => handleUpdateStatus(req.id, 'CANCELLED')}
                        variant="outline"
                        className="py-2.5 px-3 text-xs font-bold rounded-xl text-stone-600 border-stone-300 hover:bg-stone-100"
                      >
                        Cancel
                      </Button>
                    </>
                  )}

                  {isCompleted && (
                    <div className="w-full py-2 text-center text-xs font-black text-emerald-800 bg-emerald-100 rounded-xl border border-emerald-200 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> COMPLETED
                    </div>
                  )}

                  {isCancelled && (
                    <div className="w-full py-2 text-center text-xs font-black text-stone-500 bg-stone-100 rounded-xl border border-stone-200 flex items-center justify-center gap-1">
                      <XCircle className="w-4 h-4" /> CANCELLED
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
