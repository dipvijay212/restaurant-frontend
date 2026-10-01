'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { requestsApi } from '../../lib/api/requests';
import { ordersApi } from '../../lib/api/orders';
import { tablesApi } from '../../lib/api/tables';
import { billsApi } from '../../lib/api/bills';
import { orderSocketService } from '../../lib/api/socketMock';
import { ServiceRequest } from '../../types/notification';
import { Order, OrderStatus } from '../../types/order';
import { Table, TableStatus } from '../../types/table';
import { Bill } from '../../types/bill';
import { RequestCard } from '../../components/staff/RequestCard';
import { StaffOrderCard } from '../../components/staff/StaffOrderCard';
import { TableCard } from '../../components/staff/TableCard';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/ui/Toast';
import { useAppDispatch } from '../../store';
import { updateOrderStatusInStore } from '../../store/slices/ordersSlice';
import { addNotification } from '../../store/slices/notificationsSlice';
import {
  Bell,
  Utensils,
  Grid,
  Receipt,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  Search,
} from 'lucide-react';
import Link from 'next/link';

export default function StaffDashboardPage() {
  const dispatch = useAppDispatch();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'requests' | 'ready_orders' | 'tables' | 'bills'>('requests');
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string } | null>(null);

  // Load initial data for all 4 sections
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [reqData, ordData, tblData, billData] = await Promise.all([
        requestsApi.getRequests(),
        ordersApi.getOrders(),
        tablesApi.getTables(),
        billsApi.getBills(),
      ]);
      setRequests(reqData);
      setOrders(ordData);
      setTables(tblData);
      setBills(billData);
    } catch (err) {
      console.error('Failed to load waitstaff portal data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Subscribe to real-time service requests updates
  useEffect(() => {
    const unsubscribeRequests = requestsApi.subscribe((updatedReqs) => {
      setRequests(updatedReqs);
    });

    const unsubscribeSocket = orderSocketService.subscribeAll((updatedOrder: Order) => {
      setOrders((prev) => {
        const idx = prev.findIndex((o) => o.id === updatedOrder.id);
        if (idx > -1) {
          const updated = [...prev];
          updated[idx] = updatedOrder;
          return updated;
        } else {
          return [updatedOrder, ...prev];
        }
      });
    });

    return () => {
      unsubscribeRequests();
      unsubscribeSocket();
    };
  }, []);

  // Action Handlers
  const handleAcceptRequest = async (id: string) => {
    const updated = await requestsApi.updateRequestStatus(id, 'ACCEPTED', undefined, 'Carlos Waiter');
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    setToastMessage({ title: 'Request Accepted', message: `Accepted service call for Table #${updated.tableNumber}` });
  };

  const handleCompleteRequest = async (id: string) => {
    const updated = await requestsApi.updateRequestStatus(id, 'COMPLETED');
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    setToastMessage({ title: 'Request Completed', message: `Marked completed for Table #${updated.tableNumber}` });
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: OrderStatus) => {
    const updated = await ordersApi.updateOrderStatus(id, newStatus);
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));

    // Emit socket & Redux updates
    orderSocketService.emitOrderUpdate(updated);
    dispatch(updateOrderStatusInStore({ id: updated.id, status: newStatus }));
    dispatch(
      addNotification({
        id: `notif-${Date.now()}`,
        type: 'info',
        title: `Order Served: ${updated.orderNumber}`,
        message: `Order ${updated.orderNumber} served to Table #${updated.tableNumber}`,
        timestamp: new Date().toISOString(),
        read: false,
        orderId: updated.id,
      })
    );

    setToastMessage({ title: 'Order Served!', message: `${updated.orderNumber} delivered to Table #${updated.tableNumber}` });
  };

  const handleUpdateTableStatus = async (id: string, status: TableStatus) => {
    const updated = await tablesApi.updateTableStatus(id, status);
    setTables((prev) => prev.map((t) => (t.id === id ? updated : t)));
    setToastMessage({ title: 'Table Updated', message: `Table #${updated.tableNumber} status set to ${status}` });
  };

  const handleCollectPayment = async (id: string) => {
    const updated = await billsApi.updateBillStatus(id, 'paid');
    setBills((prev) => prev.map((b) => (b.id === id ? updated : b)));
    setToastMessage({ title: 'Payment Collected', message: `Bill ${updated.billNumber} marked settled.` });
  };

  // Derived Actionable Counts
  const pendingRequests = useMemo(() => requests.filter((r) => ['PENDING', 'pending'].includes(r.status)), [requests]);
  const acceptedRequests = useMemo(() => requests.filter((r) => ['ACCEPTED', 'accepted', 'in_progress'].includes(r.status)), [requests]);
  const readyOrders = useMemo(() => orders.filter((o) => o.status === 'ready'), [orders]);
  const unpaidBills = useMemo(() => bills.filter((b) => b.status === 'unpaid'), [bills]);

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

      {/* Header Banner */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-xl border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-amber-500/20 text-amber-400 font-mono font-bold text-xs rounded-full border border-amber-500/30 uppercase tracking-wider mb-2 inline-block">
            Waitstaff Quick Operations Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Floor Operations Command</h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            High-speed floor controls. 1-tap request fulfillment, order delivery, and table billing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={loadDashboardData} variant="outline" className="text-xs font-bold text-white border-stone-700 bg-stone-800 hover:bg-stone-700">
            Refresh Pass
          </Button>
        </div>
      </div>

      {/* 4 Action Priority Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending Customer Calls */}
        <button
          onClick={() => setActiveTab('requests')}
          className={`p-5 rounded-2xl border text-left transition-all shadow-sm ${
            activeTab === 'requests'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/40'
              : 'bg-white border-stone-200 hover:border-amber-300'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="p-2.5 bg-amber-500 text-stone-950 rounded-xl font-bold">
              <Bell className="w-5 h-5" />
            </div>
            {pendingRequests.length > 0 && (
              <span className="px-2.5 py-0.5 bg-amber-500 text-stone-950 font-black text-xs rounded-full animate-bounce">
                {pendingRequests.length} NEW
              </span>
            )}
          </div>
          <span className="text-2xl font-black text-stone-900 block">{pendingRequests.length}</span>
          <span className="text-xs font-extrabold text-amber-900 block">Pending Requests</span>
          <span className="text-[11px] text-stone-500 block mt-0.5">Water, waiter & cutlery calls</span>
        </button>

        {/* Card 2: Ready Food Delivery Pass */}
        <button
          onClick={() => setActiveTab('ready_orders')}
          className={`p-5 rounded-2xl border text-left transition-all shadow-sm ${
            activeTab === 'ready_orders'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/40'
              : 'bg-white border-stone-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl font-bold">
              <Utensils className="w-5 h-5" />
            </div>
            {readyOrders.length > 0 && (
              <span className="px-2.5 py-0.5 bg-emerald-600 text-white font-black text-xs rounded-full animate-pulse">
                {readyOrders.length} READY
              </span>
            )}
          </div>
          <span className="text-2xl font-black text-stone-900 block">{readyOrders.length}</span>
          <span className="text-xs font-extrabold text-emerald-900 block">Food Ready for Pass</span>
          <span className="text-[11px] text-stone-500 block mt-0.5">Kitchen dishes awaiting server</span>
        </button>

        {/* Card 3: Floor Tables */}
        <button
          onClick={() => setActiveTab('tables')}
          className={`p-5 rounded-2xl border text-left transition-all shadow-sm ${
            activeTab === 'tables'
              ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/40'
              : 'bg-white border-stone-200 hover:border-blue-300'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl font-bold">
              <Grid className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 font-bold text-xs rounded-full">
              {tables.length} Total
            </span>
          </div>
          <span className="text-2xl font-black text-stone-900 block">
            {tables.filter((t) => ['OCCUPIED', 'WAITING_FOR_SERVICE', 'BILL_REQUESTED'].includes(t.status)).length}
          </span>
          <span className="text-xs font-extrabold text-blue-900 block">Active Seated Tables</span>
          <span className="text-[11px] text-stone-500 block mt-0.5">Seating & floor status</span>
        </button>

        {/* Card 4: Bills Settlement */}
        <button
          onClick={() => setActiveTab('bills')}
          className={`p-5 rounded-2xl border text-left transition-all shadow-sm ${
            activeTab === 'bills'
              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/40'
              : 'bg-white border-stone-200 hover:border-rose-300'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="p-2.5 bg-rose-600 text-white rounded-xl font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            {unpaidBills.length > 0 && (
              <span className="px-2.5 py-0.5 bg-rose-600 text-white font-black text-xs rounded-full">
                {unpaidBills.length} UNPAID
              </span>
            )}
          </div>
          <span className="text-2xl font-black text-stone-900 block">{unpaidBills.length}</span>
          <span className="text-xs font-extrabold text-rose-900 block">Pending Bills</span>
          <span className="text-[11px] text-stone-500 block mt-0.5">Collect cash/card at table</span>
        </button>
      </div>

      {/* Main Action Tabs View */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
        {/* Tab Navigation Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pb-4 border-b border-stone-200">
          <div className="flex bg-stone-100 p-1.5 rounded-2xl gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeTab === 'requests'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Requests ({requests.filter((r) => r.status !== 'COMPLETED' && r.status !== 'fulfilled').length})</span>
            </button>

            <button
              onClick={() => setActiveTab('ready_orders')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeTab === 'ready_orders'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Ready Orders ({readyOrders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('tables')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeTab === 'tables'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Tables Map ({tables.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('bills')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeTab === 'bills'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Bills ({unpaidBills.length})</span>
            </button>
          </div>

          <Link
            href={`/staff/${activeTab === 'ready_orders' ? 'orders' : activeTab}`}
            className="text-xs font-extrabold text-amber-800 hover:text-amber-900 flex items-center gap-1 justify-end"
          >
            Full Section View <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Tab 1: Service Requests */}
        {activeTab === 'requests' && (
          <div>
            {loading ? (
              <LoadingSpinner label="Loading customer requests..." />
            ) : requests.filter((r) => r.status !== 'COMPLETED' && r.status !== 'fulfilled').length === 0 ? (
              <div className="py-12 text-center text-stone-500 bg-stone-50 rounded-2xl border border-stone-200">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-600" />
                <h3 className="font-bold text-stone-900 text-base">All Service Calls Attended</h3>
                <p className="text-xs text-stone-500">No pending guest requests on the floor.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {requests
                  .filter((r) => r.status !== 'COMPLETED' && r.status !== 'fulfilled')
                  .map((req) => (
                    <RequestCard
                      key={req.id}
                      request={req}
                      onAccept={handleAcceptRequest}
                      onComplete={handleCompleteRequest}
                    />
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Ready Orders Pass */}
        {activeTab === 'ready_orders' && (
          <div>
            {loading ? (
              <LoadingSpinner label="Checking kitchen ready pass..." />
            ) : readyOrders.length === 0 ? (
              <div className="py-12 text-center text-stone-500 bg-stone-50 rounded-2xl border border-stone-200">
                <Utensils className="w-10 h-10 mx-auto mb-2 text-stone-400" />
                <h3 className="font-bold text-stone-900 text-base">No Dishes Awaiting Delivery</h3>
                <p className="text-xs text-stone-500">Kitchen is preparing active orders.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {readyOrders.map((ord) => (
                  <StaffOrderCard
                    key={ord.id}
                    order={ord}
                    onUpdateStatus={handleUpdateOrderStatus}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Tables Floor Map */}
        {activeTab === 'tables' && (
          <div>
            {loading ? (
              <LoadingSpinner label="Loading floor tables..." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tables.map((tbl) => (
                  <TableCard
                    key={tbl.id}
                    table={tbl}
                    onUpdateStatus={handleUpdateTableStatus}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Bills & Settlement */}
        {activeTab === 'bills' && (
          <div>
            {loading ? (
              <LoadingSpinner label="Loading table bills..." />
            ) : (
              <div className="space-y-3">
                {bills.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-extrabold text-stone-900 text-base">{b.billNumber}</span>
                        <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-xs">
                          Table #{b.tableNumber}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            b.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <span className="text-xs text-stone-500 block">Guest: {b.customerName}</span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      <div className="text-right">
                        <span className="font-black text-stone-900 text-lg block">{formatCurrency(b.totalAmount)}</span>
                        <span className="text-[10px] text-stone-400">Subtotal + Tax + Service</span>
                      </div>

                      {b.status !== 'paid' ? (
                        <Button
                          onClick={() => handleCollectPayment(b.id)}
                          variant="primary"
                          className="py-2.5 px-4 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 active:scale-95 shadow-sm"
                        >
                          Collect Cash/Card
                        </Button>
                      ) : (
                        <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl">
                          Settled
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
