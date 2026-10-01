'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '../../../components/shared/PageHeader';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { ErrorState } from '../../../components/shared/ErrorState';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Toast } from '../../../components/ui/Toast';
import { tablesApi } from '../../../lib/api/tables';
import { ordersApi } from '../../../lib/api/orders';
import { requestsApi } from '../../../lib/api/requests';
import { billsApi } from '../../../lib/api/bills';
import { Table, TableArea, TableStatus } from '../../../types/table';
import { Order } from '../../../types/order';
import { ServiceRequest } from '../../../types/notification';
import { Bill } from '../../../types/bill';
import {
  QrCode,
  Users,
  Plus,
  Edit,
  Power,
  Eye,
  RefreshCw,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  Receipt,
  Bell,
  Utensils,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../../lib/utils';

export default function AdminTablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAreaFilter, setActiveAreaFilter] = useState<string>('All');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('All');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Selected Table Context
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  // Form Fields
  const [tableNumberInput, setTableNumberInput] = useState<number>(1);
  const [capacityInput, setCapacityInput] = useState<number>(4);
  const [areaInput, setAreaInput] = useState<TableArea>('Main Dining');
  const [statusInput, setStatusInput] = useState<TableStatus>('AVAILABLE');
  const [submitting, setSubmitting] = useState(false);

  // Table Details Data
  const [detailsOrders, setDetailsOrders] = useState<Order[]>([]);
  const [detailsRequests, setDetailsRequests] = useState<ServiceRequest[]>([]);
  const [detailsBill, setDetailsBill] = useState<Bill | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tablesApi.getTables();
      setTables(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load restaurant floor tables.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // Filter Tables
  const filteredTables = tables.filter((t) => {
    const matchesArea = activeAreaFilter === 'All' || t.area === activeAreaFilter;
    const matchesStatus =
      activeStatusFilter === 'All' || t.status.toUpperCase() === activeStatusFilter.toUpperCase();
    return matchesArea && matchesStatus;
  });

  // Action: Create Table
  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await tablesApi.createTable({
        tableNumber: Number(tableNumberInput),
        capacity: Number(capacityInput),
        area: areaInput,
      });

      setIsCreateModalOpen(false);
      fetchTables();
      setToast({
        title: 'Table Created',
        message: `Table #${tableNumberInput} added to ${areaInput}.`,
        type: 'success',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to create table');
    } finally {
      setSubmitting(false);
    }
  };

  // Action: Open Edit Table Modal
  const openEditModal = (t: Table) => {
    setSelectedTable(t);
    setTableNumberInput(t.tableNumber);
    setCapacityInput(t.capacity);
    setAreaInput(t.area);
    setStatusInput(t.status);
    setIsEditModalOpen(true);
  };

  // Action: Save Edit Table
  const handleSaveEditTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;
    try {
      setSubmitting(true);
      await tablesApi.updateTable(selectedTable.id, {
        tableNumber: Number(tableNumberInput),
        capacity: Number(capacityInput),
        area: areaInput,
        status: statusInput,
      });

      setIsEditModalOpen(false);
      fetchTables();
      setToast({
        title: 'Table Updated',
        message: `Table #${tableNumberInput} configuration updated.`,
        type: 'success',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to update table');
    } finally {
      setSubmitting(false);
    }
  };

  // Action: Toggle Deactivate/Activate Table
  const handleToggleDeactivate = async (t: Table) => {
    try {
      const updated = await tablesApi.toggleTableActiveStatus(t.id);
      fetchTables();
      setToast({
        title: updated.isActive ? 'Table Activated' : 'Table Deactivated',
        message: `Table #${t.tableNumber} is now ${updated.isActive ? 'Active' : 'Inactive'}.`,
        type: updated.isActive ? 'success' : 'info',
      });
    } catch (err) {
      alert('Failed to update table status');
    }
  };

  // Action: Regenerate QR Token
  const handleRegenerateQR = async (t: Table) => {
    try {
      const updated = await tablesApi.regenerateQR(t.id);
      if (selectedTable?.id === t.id) {
        setSelectedTable(updated);
      }
      fetchTables();
      setToast({
        title: 'QR Code Regenerated',
        message: `New QR token generated for Table #${t.tableNumber}.`,
        type: 'success',
      });
    } catch (err) {
      alert('Failed to regenerate QR code');
    }
  };

  // Action: Open View Details Modal
  const openDetailsModal = async (t: Table) => {
    setSelectedTable(t);
    setIsDetailsModalOpen(true);
    setLoadingDetails(true);

    try {
      const [ords, reqs, b] = await Promise.all([
        ordersApi.getOrders(),
        requestsApi.getRequests(),
        billsApi.getSessionBill(t.id, t.tableNumber, t.currentCustomerName || 'Guest'),
      ]);

      const myOrds = ords.filter((o: Order) => o.tableNumber === t.tableNumber);
      const myReqs = reqs.filter((r: ServiceRequest) => r.tableNumber === t.tableNumber);

      setDetailsOrders(myOrds);
      setDetailsRequests(myReqs);
      setDetailsBill(b);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Action: Open QR Preview Modal
  const openQrModal = (t: Table) => {
    setSelectedTable(t);
    setIsQrModalOpen(true);
  };

  // Status Colors Mapping
  const getStatusBadge = (status: TableStatus) => {
    const st = status.toUpperCase();
    switch (st) {
      case 'AVAILABLE':
        return { label: 'AVAILABLE', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'OCCUPIED':
        return { label: 'OCCUPIED', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'WAITING_FOR_SERVICE':
        return { label: 'WAITING FOR SERVICE', color: 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse' };
      case 'BILL_REQUESTED':
        return { label: 'BILL REQUESTED', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'CLEANING':
        return { label: 'CLEANING', color: 'bg-purple-100 text-purple-900 border-purple-200' };
      default:
        return { label: st, color: 'bg-stone-100 text-stone-700 border-stone-200' };
    }
  };

  if (loading) return <LoadingSpinner label="Loading floorplan tables..." />;
  if (error) return <ErrorState message={error} onRetry={fetchTables} />;

  return (
    <div className="space-y-6 pb-12">
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

      {/* Page Header with Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Table Management & Floorplan</h1>
          <p className="text-xs text-stone-500">Manage dining areas, table sessions, and QR code posters</p>
        </div>

        <Button
          onClick={() => {
            setTableNumberInput(tables.length + 1);
            setCapacityInput(4);
            setAreaInput('Main Dining');
            setIsCreateModalOpen(true);
          }}
          variant="primary"
          className="py-2.5 px-4 font-extrabold text-xs rounded-2xl shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Create New Table
        </Button>
      </div>

      {/* Area & Status Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Area Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 text-xs font-bold">
          {['All', 'Main Dining', 'Terrace', 'VIP Section', 'Bar Area'].map((area) => (
            <button
              key={area}
              onClick={() => setActiveAreaFilter(area)}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                activeAreaFilter === area
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-amber-400'
              }`}
            >
              {area}
            </button>
          ))}
        </div>

        {/* Status Filter Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-stone-500">Filter Status:</span>
          <select
            value={activeStatusFilter}
            onChange={(e) => setActiveStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="All">All Statuses ({tables.length})</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="WAITING_FOR_SERVICE">Waiting for Service</option>
            <option value="BILL_REQUESTED">Bill Requested</option>
            <option value="CLEANING">Cleaning</option>
          </select>
        </div>
      </div>

      {/* ---------------- TABLE GRID ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.map((t) => {
          const badge = getStatusBadge(t.status);
          const isOccupied = ['OCCUPIED', 'WAITING_FOR_SERVICE', 'BILL_REQUESTED', 'occupied'].includes(t.status);

          return (
            <div
              key={t.id}
              className={`bg-white rounded-3xl p-5 border shadow-sm transition-all flex flex-col justify-between relative ${
                !t.isActive
                  ? 'opacity-50 border-stone-200 bg-stone-100'
                  : isOccupied
                  ? 'border-amber-300 shadow-amber-100/50'
                  : 'border-stone-200/80 hover:border-amber-400'
              }`}
            >
              <div>
                {/* Header: Table Number & Status Badge */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="font-black text-stone-900 text-lg block">Table #{t.tableNumber}</span>
                    <span className="text-[11px] font-semibold text-stone-400 block">{t.area}</span>
                  </div>

                  <span className={`text-[10px] px-2.5 py-1 rounded-xl font-black border ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Capacity & Session Details */}
                <div className="space-y-1.5 text-xs text-stone-600 mb-4 bg-stone-50 p-3 rounded-2xl border border-stone-100">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Seating Capacity</span>
                    <span className="font-extrabold text-stone-900">{t.capacity} Guests</span>
                  </div>

                  {isOccupied && (
                    <>
                      <div className="flex justify-between pt-1 border-t border-stone-200/60">
                        <span className="text-stone-400">Active Guest</span>
                        <span className="font-bold text-amber-900 truncate max-w-[110px]">
                          {t.currentCustomerName || 'Guest'}
                        </span>
                      </div>

                      {t.currentOrderTotal !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-stone-400">Order Total</span>
                          <span className="font-black text-stone-900">{formatCurrency(t.currentOrderTotal)}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-stone-100 space-y-2">
                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    onClick={() => openDetailsModal(t)}
                    variant="outline"
                    size="sm"
                    className="text-[11px] font-bold py-1.5 rounded-xl border-stone-200"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1 text-amber-600" /> Details
                  </Button>

                  <Button
                    onClick={() => openQrModal(t)}
                    variant="outline"
                    size="sm"
                    className="text-[11px] font-bold py-1.5 rounded-xl border-stone-200"
                  >
                    <QrCode className="w-3.5 h-3.5 mr-1 text-stone-700" /> View QR
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(t)}
                      className="text-stone-500 hover:text-stone-900 font-bold flex items-center"
                    >
                      <Edit className="w-3.5 h-3.5 mr-0.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleToggleDeactivate(t)}
                      className={`font-bold flex items-center ${t.isActive ? 'text-rose-600' : 'text-emerald-600'}`}
                    >
                      <Power className="w-3.5 h-3.5 mr-0.5" /> {t.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>

                  <button
                    onClick={() => handleRegenerateQR(t)}
                    className="text-amber-700 hover:text-amber-900 font-bold flex items-center"
                    title="Regenerate QR Code Token"
                  >
                    <RefreshCw className="w-3 h-3 mr-0.5" /> Token
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------- MODAL 1: CREATE TABLE MODAL ---------------- */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Restaurant Table"
      >
        <form onSubmit={handleCreateTable} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Table Number</label>
            <input
              type="number"
              min={1}
              value={tableNumberInput}
              onChange={(e) => setTableNumberInput(Number(e.target.value))}
              required
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Seating Capacity (Guests)</label>
            <input
              type="number"
              min={1}
              max={20}
              value={capacityInput}
              onChange={(e) => setCapacityInput(Number(e.target.value))}
              required
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Floor Dining Area</label>
            <select
              value={areaInput}
              onChange={(e) => setAreaInput(e.target.value as TableArea)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="Main Dining">Main Dining</option>
              <option value="Terrace">Terrace</option>
              <option value="VIP Section">VIP Section</option>
              <option value="Bar Area">Bar Area</option>
            </select>
          </div>

          <Button type="submit" variant="primary" isLoading={submitting} className="w-full py-3 rounded-2xl font-bold text-xs mt-2">
            Create Table
          </Button>
        </form>
      </Modal>

      {/* ---------------- MODAL 2: EDIT TABLE MODAL ---------------- */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Table #${selectedTable?.tableNumber}`}
      >
        <form onSubmit={handleSaveEditTable} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Table Number</label>
            <input
              type="number"
              min={1}
              value={tableNumberInput}
              onChange={(e) => setTableNumberInput(Number(e.target.value))}
              required
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Seating Capacity</label>
            <input
              type="number"
              min={1}
              max={20}
              value={capacityInput}
              onChange={(e) => setCapacityInput(Number(e.target.value))}
              required
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Floor Dining Area</label>
            <select
              value={areaInput}
              onChange={(e) => setAreaInput(e.target.value as TableArea)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="Main Dining">Main Dining</option>
              <option value="Terrace">Terrace</option>
              <option value="VIP Section">VIP Section</option>
              <option value="Bar Area">Bar Area</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Current Table Status</label>
            <select
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value as TableStatus)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="OCCUPIED">OCCUPIED</option>
              <option value="WAITING_FOR_SERVICE">WAITING_FOR_SERVICE</option>
              <option value="BILL_REQUESTED">BILL_REQUESTED</option>
              <option value="CLEANING">CLEANING</option>
            </select>
          </div>

          <Button type="submit" variant="primary" isLoading={submitting} className="w-full py-3 rounded-2xl font-bold text-xs mt-2">
            Save Table Changes
          </Button>
        </form>
      </Modal>

      {/* ---------------- MODAL 3: TABLE DETAILS MODAL ---------------- */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={`Table #${selectedTable?.tableNumber} Detailed Session Overview`}
      >
        {loadingDetails ? (
          <LoadingSpinner label="Loading session, orders, requests, and bill data..." />
        ) : selectedTable ? (
          <div className="space-y-4 pt-2 text-xs">
            {/* Session Info Card */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-amber-950 text-sm">
                  Active Guest: {selectedTable.currentCustomerName || 'Unassigned / Available'}
                </span>
                <span className="font-mono text-[11px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                  {selectedTable.currentSessionId || 'No Session'}
                </span>
              </div>
              <div className="flex justify-between text-amber-900 text-[11px]">
                <span>Seating Area: {selectedTable.area}</span>
                <span>Seated Since: {selectedTable.occupiedSince ? formatDateTime(selectedTable.occupiedSince) : 'N/A'}</span>
              </div>
            </div>

            {/* Current Session Orders */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 space-y-2">
              <span className="font-bold text-stone-900 uppercase tracking-wider text-[11px] block">
                Current Orders ({detailsOrders.length})
              </span>
              {detailsOrders.length === 0 ? (
                <p className="text-stone-400 italic">No orders placed in current session yet.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {detailsOrders.map((ord) => (
                    <div key={ord.id} className="pb-2 border-b border-stone-100 last:border-0">
                      <div className="flex justify-between font-bold text-stone-900">
                        <span>{ord.orderNumber}</span>
                        <span>{formatCurrency(ord.totalAmount)}</span>
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {ord.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Service Calls */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 space-y-2">
              <span className="font-bold text-stone-900 uppercase tracking-wider text-[11px] block">
                Active Customer Requests ({detailsRequests.length})
              </span>
              {detailsRequests.length === 0 ? (
                <p className="text-stone-400 italic">No pending service calls.</p>
              ) : (
                <div className="space-y-1.5">
                  {detailsRequests.map((req) => (
                    <div key={req.id} className="flex justify-between items-center bg-stone-50 p-2 rounded-xl">
                      <span className="font-bold text-stone-800 uppercase text-[11px]">{req.type}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bill Summary */}
            <div className="bg-stone-900 text-stone-100 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-stone-400 font-medium">Bill Status</span>
                <span className="font-extrabold text-amber-400 uppercase">{detailsBill?.status || 'UNPAID'}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-black pt-2 border-t border-stone-800">
                <span>Total Amount Due</span>
                <span className="text-amber-400">
                  {formatCurrency(detailsBill?.totalAmount || selectedTable.currentOrderTotal || 0)}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* ---------------- MODAL 4: QR PREVIEW MODAL ---------------- */}
      <Modal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title={`Table #${selectedTable?.tableNumber} QR Code Card`}
      >
        {selectedTable && (
          <div className="space-y-4 pt-2 text-center">
            {/* QR Card Poster View */}
            <div className="bg-white border-2 border-amber-500 rounded-3xl p-6 shadow-md max-w-xs mx-auto space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-sm">
                D
              </div>

              <div>
                <h3 className="font-black text-stone-900 text-xl">Demo Restaurant</h3>
                <span className="text-xs font-bold text-amber-700 block">Table #{selectedTable.tableNumber}</span>
                <span className="text-[11px] text-stone-400 block">{selectedTable.area}</span>
              </div>

              {/* QR Image Representation */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex flex-col items-center">
                <div className="w-36 h-36 bg-stone-900 rounded-xl p-3 flex flex-col justify-between items-center text-amber-400">
                  <QrCode className="w-full h-full text-white" />
                </div>
                <span className="text-[10px] font-mono text-stone-500 mt-2 block break-all">
                  Token: {selectedTable.qrToken}
                </span>
              </div>

              <p className="text-[11px] text-stone-600 font-medium">
                Scan QR code using camera to view digital menu & place instant dining orders.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 max-w-xs mx-auto">
              <Link
                href={`/table/${selectedTable.qrToken}`}
                target="_blank"
                className="flex-1 py-3 bg-stone-900 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1 shadow-sm hover:bg-stone-800"
              >
                <ExternalLink className="w-4 h-4" /> Simulate Scan
              </Link>
              <Button
                onClick={() => {
                  window.print();
                }}
                variant="primary"
                className="flex-1 py-3 font-bold text-xs rounded-2xl"
              >
                <Printer className="w-4 h-4 mr-1" /> Print Card
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
