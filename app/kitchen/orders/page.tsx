'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ordersApi } from '../../../lib/api/orders';
import { orderSocketService } from '../../../lib/api/socketMock';
import { Order, OrderStatus } from '../../../types/order';
import { KitchenColumn } from '../../../components/kitchen/KitchenColumn';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { KitchenHeader } from '../../../components/kitchen/KitchenHeader';
import { playKitchenChime } from '../../../lib/utils/sound';
import { useAppDispatch } from '../../../store';
import { updateOrderStatusInStore, addOrder } from '../../../store/slices/ordersSlice';
import { addNotification } from '../../../store/slices/notificationsSlice';
import { Flame, Search, Filter, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import { Toast } from '../../../components/ui/Toast';

export default function KitchenOrdersPage() {
  const dispatch = useAppDispatch();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Layout & View State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [delayedOnly, setDelayedOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'dine-in' | 'takeaway'>('all');

  // Toast alert
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string } | null>(null);

  // Load initial orders
  const fetchActiveTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch active tickets:', err);
    } fontFinally: {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveTickets();
  }, [fetchActiveTickets]);

  // Real-time socket event listener for ALL order updates across system
  useEffect(() => {
    const unsubscribe = orderSocketService.subscribeAll((updatedOrder: Order) => {
      setOrders((prevOrders) => {
        const index = prevOrders.findIndex((o) => o.id === updatedOrder.id);
        if (index > -1) {
          const newOrders = [...prevOrders];
          newOrders[index] = updatedOrder;
          return newOrders;
        } else {
          // New order arrived!
          if (soundEnabled) {
            playKitchenChime('new_order');
          }
          setToastMessage({
            title: `New Order Received: ${updatedOrder.orderNumber}`,
            message: `Table #${updatedOrder.tableNumber || 'N/A'} placed a new order.`,
          });
          return [updatedOrder, ...prevOrders];
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, [soundEnabled]);

  // Handle Order Status Transition from KDS Board
  const handleUpdateStatus = async (id: string, newStatus: OrderStatus) => {
    try {
      const updated = await ordersApi.updateOrderStatus(id, newStatus);

      // 1. Update local KDS board state
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));

      // 2. Broadcast via socket to customer tracking & admin
      orderSocketService.emitOrderUpdate(updated);

      // 3. Update Redux store for global app state
      dispatch(updateOrderStatusInStore({ id: updated.id, status: newStatus }));

      // 4. Dispatch System Notification
      dispatch(
        addNotification({
          id: `notif-${Date.now()}`,
          type: 'info',
          title: `Kitchen Status: ${newStatus.toUpperCase()}`,
          message: `Order ${updated.orderNumber} moved to ${newStatus.toUpperCase()}`,
          timestamp: new Date().toISOString(),
          read: false,
          orderId: updated.id,
        })
      );

      // 5. Sound chime
      if (soundEnabled) {
        playKitchenChime('status_change');
      }

      setToastMessage({
        title: `Order Updated: ${updated.orderNumber}`,
        message: `Status updated to ${newStatus.toUpperCase()}`,
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Simulate incoming new order in real-time
  const handleSimulateNewOrder = async () => {
    const tableNo = Math.floor(Math.random() * 12) + 1;
    const sampleItems = [
      { name: 'Truffle Mushroom Burger', price: 18.5, variants: 'Gluten Free Bun', instructions: 'Extra crispy fries' },
      { name: 'Margherita Pizza', price: 16.0, variants: 'Extra Cheese', instructions: '' },
      { name: 'Spicy Chicken Wings', price: 14.0, variants: 'Extra Hot', instructions: 'Ranch on side' },
      { name: 'Iced Matcha Latte', price: 6.5, variants: 'Oat Milk', instructions: 'Less ice' },
    ];
    const itemIdx = Math.floor(Math.random() * sampleItems.length);
    const chosen = sampleItems[itemIdx];

    const newOrderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'> = {
      tableNumber: tableNo,
      customerName: `Guest Table #${tableNo}`,
      orderType: Math.random() > 0.3 ? 'dine-in' : 'takeaway',
      items: [
        {
          id: `item-${Date.now()}`,
          menuItem: {
            id: `m-${itemIdx}`,
            categoryId: 'c1',
            name: chosen.name,
            description: 'Chef signature dish',
            price: chosen.price,
            image: '/images/burger.jpg',
            foodType: 'non-veg',
            isAvailable: true,
            isActive: true,
            preparationTimeMinutes: 15,
            dietaryTags: ['chef-special'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          quantity: Math.floor(Math.random() * 2) + 1,
          unitPrice: chosen.price,
          totalPrice: chosen.price,
          specialInstructions: chosen.instructions,
          selectedOptions: chosen.variants
            ? [{ groupId: 'g1', groupName: 'Customization', option: { id: 'o1', name: chosen.variants, priceModifier: 1.5, isAvailable: true } }]
            : [],
          status: 'pending',
        },
      ],
      subtotal: chosen.price,
      taxAmount: chosen.price * 0.1,
      serviceCharge: chosen.price * 0.05,
      totalAmount: chosen.price * 1.15,
      status: 'pending',
      paymentStatus: 'unpaid',
      specialNotes: Math.random() > 0.5 ? 'VIP Table Request' : undefined,
      estimatedTimeMinutes: 15,
    };

    const created = await ordersApi.createOrder(newOrderData);
    setOrders((prev) => [created, ...prev]);
    orderSocketService.emitOrderUpdate(created);
    dispatch(addOrder(created));

    if (soundEnabled) {
      playKitchenChime('new_order');
    }

    setToastMessage({
      title: `Simulated Order: ${created.orderNumber}`,
      message: `Table #${created.tableNumber} order submitted!`,
    });
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Exclude served / completed / cancelled from active board
      if (['served', 'completed', 'cancelled', 'rejected'].includes(ord.status)) {
        return false;
      }

      // Search match
      const query = searchQuery.toLowerCase();
      const matchSearch =
        !query ||
        ord.orderNumber.toLowerCase().includes(query) ||
        (ord.tableNumber && ord.tableNumber.toString().includes(query)) ||
        ord.customerName.toLowerCase().includes(query) ||
        ord.items.some((i) => i.menuItem.name.toLowerCase().includes(query));

      if (!matchSearch) return false;

      // Priority match
      if (priorityOnly) {
        const isPriority =
          ord.specialNotes?.toLowerCase().includes('vip') ||
          ord.items.some((i) => !!i.specialInstructions);
        if (!isPriority) return false;
      }

      // Delayed match (>15m)
      if (delayedOnly) {
        const createdMs = new Date(ord.createdAt).getTime();
        const elapsedMin = Math.floor((Date.now() - createdMs) / (1000 * 60));
        if (elapsedMin < 15) return false;
      }

      // Order type match
      if (typeFilter !== 'all' && ord.orderType !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [orders, searchQuery, priorityOnly, delayedOnly, typeFilter]);

  // Column Categorization
  // Column 1: NEW (status === 'pending' || status === 'accepted')
  const newOrders = useMemo(() => {
    return filteredOrders.filter((o) => ['pending', 'accepted'].includes(o.status));
  }, [filteredOrders]);

  // Column 2: PREPARING (status === 'preparing')
  const preparingOrders = useMemo(() => {
    return filteredOrders.filter((o) => o.status === 'preparing');
  }, [filteredOrders]);

  // Column 3: READY (status === 'ready')
  const readyOrders = useMemo(() => {
    return filteredOrders.filter((o) => o.status === 'ready');
  }, [filteredOrders]);

  return (
    <div className={`min-h-screen flex flex-col ${highContrast ? 'bg-black text-white' : 'bg-stone-950 text-stone-100'}`}>
      {/* KDS Header with Toolbar Controls */}
      <KitchenHeader
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        compactMode={compactMode}
        onToggleCompactMode={() => setCompactMode(!compactMode)}
        onSimulateOrder={handleSimulateNewOrder}
      />

      {/* Floating Notification Toast */}
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

      {/* Main KDS Board Content */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto flex flex-col gap-4">
        {/* Controls & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-900/80 p-3 rounded-2xl border border-stone-800">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by Order # or Table #..."
              className="w-full pl-10 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Quick Filter Toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setPriorityOnly(!priorityOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                priorityOnly
                  ? 'bg-rose-600 border-rose-500 text-white shadow-md'
                  : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> Rush / VIP Only
            </button>

            <button
              onClick={() => setDelayedOnly(!delayedOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                delayedOnly
                  ? 'bg-rose-950 border-rose-600 text-rose-300 ring-2 ring-rose-500/50'
                  : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Delayed (&gt;15m)
            </button>

            {/* Type Filter */}
            <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs font-bold text-stone-400">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${typeFilter === 'all' ? 'bg-stone-800 text-white' : ''}`}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter('dine-in')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${typeFilter === 'dine-in' ? 'bg-stone-800 text-white' : ''}`}
              >
                Dine-in
              </button>
              <button
                onClick={() => setTypeFilter('takeaway')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${typeFilter === 'takeaway' ? 'bg-stone-800 text-white' : ''}`}
              >
                Takeaway
              </button>
            </div>

            <button
              onClick={fetchActiveTickets}
              className="p-2 bg-stone-950 border border-stone-800 hover:bg-stone-800 text-stone-300 rounded-xl transition-colors"
              title="Refresh Tickets"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3-Column KDS Board Grid */}
        {loading ? (
          <div className="py-20">
            <LoadingSpinner label="Connecting to kitchen display feed..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 items-start">
            {/* Column 1: NEW */}
            <KitchenColumn
              id="new-col"
              title="NEW"
              count={newOrders.length}
              orders={newOrders}
              onUpdateStatus={handleUpdateStatus}
              accentColor="border-amber-500"
              badgeBg="bg-amber-500/20 text-amber-400 border-amber-500/30"
              compact={compactMode}
              highContrast={highContrast}
            />

            {/* Column 2: PREPARING */}
            <KitchenColumn
              id="preparing-col"
              title="PREPARING"
              count={preparingOrders.length}
              orders={preparingOrders}
              onUpdateStatus={handleUpdateStatus}
              accentColor="border-orange-500"
              badgeBg="bg-orange-500/20 text-orange-400 border-orange-500/30"
              compact={compactMode}
              highContrast={highContrast}
            />

            {/* Column 3: READY */}
            <KitchenColumn
              id="ready-col"
              title="READY"
              count={readyOrders.length}
              orders={readyOrders}
              onUpdateStatus={handleUpdateStatus}
              accentColor="border-emerald-500"
              badgeBg="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              compact={compactMode}
              highContrast={highContrast}
            />
          </div>
        )}
      </main>
    </div>
  );
}
