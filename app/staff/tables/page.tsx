'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { TableGridSkeleton } from '../../../components/ui/Skeleton';
import { ErrorState } from '../../../components/shared/ErrorState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { tablesApi } from '../../../lib/api/tables';
import { Table, TableStatus } from '../../../types/table';
import { TableCard } from '../../../components/staff/TableCard';
import { Toast } from '../../../components/ui/Toast';
import { Grid, Filter, RefreshCw } from 'lucide-react';

export default function StaffTablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string } | null>(null);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tablesApi.getTables();
      setTables(data);
    } catch (err: any) {
      setError(err.message || 'Unable to load tables.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleUpdateStatus = async (id: string, status: TableStatus) => {
    try {
      const updated = await tablesApi.updateTableStatus(id, status);
      setTables((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setToastMessage({ title: 'Table Updated', message: `Table #${updated.tableNumber} status set to ${status}` });
    } catch (err) {
      setToastMessage({ title: 'Update Failed', message: 'Failed to update table status.' });
    }
  };

  const filtered = tables.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (areaFilter !== 'all' && t.area !== areaFilter) return false;
    return true;
  });

  const areas = Array.from(new Set(tables.map((t) => t.area).filter(Boolean)));

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
            <Grid className="w-6 h-6 text-amber-600" /> Floor Table Status
          </h1>
          <p className="text-xs text-stone-500 mt-1">Live floor seating map and guest table management.</p>
        </div>

        <button
          onClick={fetchTables}
          className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Map
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-stone-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['all', 'AVAILABLE', 'OCCUPIED', 'WAITING_FOR_SERVICE', 'BILL_REQUESTED', 'CLEANING'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st.replaceAll('_', ' ')}
            </button>
          ))}
        </div>

        {areas.length > 0 && (
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="px-3 py-1.5 bg-stone-100 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none"
          >
            <option value="all">All Areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="space-y-4">
          <span className="text-xs font-bold text-stone-400">Loading floor seating map...</span>
          <TableGridSkeleton count={8} />
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to load tables."
          message={error}
          onRetry={fetchTables}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Grid}
          title="No tables found."
          description="No tables match your selected floor area and status filters."
          actionLabel="Reset Filters"
          onAction={() => {
            setStatusFilter('all');
            setAreaFilter('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((t) => (
            <TableCard key={t.id} table={t} onUpdateStatus={handleUpdateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}
