'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerHeader } from '../../components/customer/CustomerHeader';
import { CustomerBottomNav } from '../../components/customer/CustomerBottomNav';
import { BillSummary } from '../../components/customer/BillSummary';
import { Button } from '../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../store';
import { clearCart } from '../../store/slices/cartSlice';
import { setCurrentOrderId, updateGuestInfo } from '../../store/slices/customerSessionSlice';
import { ordersApi } from '../../lib/api/orders';
import { CheckCircle2, Utensils, AlertTriangle, Building2, QrCode } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { initialRestaurantData } from '../../mock/restaurant';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);
  const session = useAppSelector((state) => state.customerSession);

  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [customerName, setCustomerName] = useState(session.customerName || 'Guest');
  const [customerPhone, setCustomerPhone] = useState(session.phone || '');
  const [generalNotes, setGeneralNotes] = useState(cart.specialNotes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const restaurantName = session.restaurant?.name || initialRestaurantData.name;
  const tableNumber = session.table?.tableNumber || cart.tableNumber || 1;
  const tableId = session.table?.id || cart.tableId || 'tbl-01';

  const subtotal = cart.items.reduce((acc, item) => acc + item.itemTotal, 0);
  const taxAmount = subtotal * (initialRestaurantData.taxRate / 100);
  const serviceCharge = subtotal * (initialRestaurantData.serviceChargeRate / 100);
  const totalAmount = subtotal + taxAmount + serviceCharge;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Pre-submission validation
    if (cart.items.length === 0) {
      setErrorMessage('Your cart is empty. Please add dishes before placing an order.');
      return;
    }

    if (isSubmitting) return; // Prevent double submission

    try {
      setIsSubmitting(true);

      // Save customer guest info to session
      dispatch(updateGuestInfo({ customerName: customerName.trim() || 'Guest', phone: customerPhone.trim() }));

      // Send to mock order service
      const newOrder = await ordersApi.createOrder({
        tableId,
        tableNumber,
        customerName: customerName.trim() || 'Guest',
        customerPhone: customerPhone.trim() || undefined,
        orderType,
        items: cart.items.map((ci) => ({
          id: `oi-${Date.now()}-${Math.random().toString().slice(2, 6)}`,
          menuItem: ci.menuItem,
          quantity: ci.quantity,
          unitPrice: ci.unitPrice,
          totalPrice: ci.itemTotal,
          selectedOptions: ci.selectedAddons.map((a) => ({
            groupId: a.groupId,
            groupName: a.groupName,
            option: { id: a.addon.id, name: a.addon.name, priceModifier: a.addon.price, isAvailable: true },
          })),
          specialInstructions: ci.specialInstructions,
          status: 'pending',
        })),
        subtotal,
        taxAmount,
        serviceCharge,
        totalAmount,
        status: 'pending',
        paymentStatus: 'unpaid',
        specialNotes: generalNotes.trim(),
        estimatedTimeMinutes: 20,
      });

      // Successful placement: set order ID, clear cart, and navigate to tracking page
      dispatch(setCurrentOrderId(newOrder.id));
      dispatch(clearCart());
      router.push(`/orders/${newOrder.id}`);
    } catch (err: any) {
      // Submission failure: cart remains completely intact
      setErrorMessage('Unable to place your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24 md:pb-8 flex flex-col">
      <CustomerHeader />

      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-4">
        <h1 className="text-xl font-bold text-stone-900 mb-4">Checkout & Confirm</h1>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-4 text-rose-900 text-xs flex gap-3 items-center animate-in fade-in">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <div>
              <span className="font-bold block">Order Error</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="space-y-4">
          {/* Restaurant & Table Info Card */}
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-stone-900 text-sm block">{restaurantName}</span>
                <span className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5" /> Table #{tableNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Order Summary Itemized Preview */}
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-3">
            <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-stone-400">
              Order Summary ({cart.items.reduce((acc, i) => acc + i.quantity, 0)} Items)
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-xs border-b border-stone-50 pb-2 last:border-0">
                  <div>
                    <span className="font-bold text-stone-900">{item.quantity}x </span>
                    <span className="text-stone-800 font-medium">{item.productName}</span>
                    {item.selectedVariant && (
                      <span className="block text-[10px] text-amber-800">
                        {item.selectedVariant.variant.name}
                      </span>
                    )}
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <span className="block text-[10px] text-stone-500">
                        Add-ons: {item.selectedAddons.map((a) => a.addon.name).join(', ')}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-stone-900 flex-shrink-0">{formatCurrency(item.itemTotal)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guest Optional Details Form */}
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-3">
            <h3 className="font-bold text-stone-900 text-sm">Guest Contact Info</h3>
            <div>
              <label className="block text-xs text-stone-600 mb-1">Your Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-600 mb-1">Phone Number (Optional)</label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-600 mb-1">General Order Notes (Optional)</label>
              <textarea
                rows={2}
                placeholder="Bring water first, extra napkins, table location..."
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Payment Method Notice */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 text-xs flex gap-3 items-center">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <div>
              <span className="font-bold block">No Account Required • Pay After Dining</span>
              <span>Your order goes straight to the kitchen. Pay cash or card at table when done.</span>
            </div>
          </div>

          {/* Bill Summary */}
          <BillSummary
            subtotal={subtotal}
            taxAmount={taxAmount}
            serviceCharge={serviceCharge}
            totalAmount={totalAmount}
          />

          {/* Submit CTA Button */}
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={cart.items.length === 0 || isSubmitting}
            className="w-full py-4 text-base font-extrabold rounded-2xl shadow-lg"
          >
            <Utensils className="w-5 h-5 mr-2" /> Place Order ({formatCurrency(totalAmount)})
          </Button>
        </form>
      </main>

      <CustomerBottomNav />
    </div>
  );
}
