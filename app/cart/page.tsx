'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerHeader } from '../../components/customer/CustomerHeader';
import { CustomerBottomNav } from '../../components/customer/CustomerBottomNav';
import { CartItem } from '../../components/customer/CartItem';
import { BillSummary } from '../../components/customer/BillSummary';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/ToastProvider';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateQuantity, removeFromCart, setSpecialNotes, clearCart } from '../../store/slices/cartSlice';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { initialRestaurantData } from '../../mock/restaurant';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const cart = useAppSelector((state) => state.cart);
  const session = useAppSelector((state) => state.customerSession);

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const subtotal = cart.items.reduce((acc, item) => acc + item.itemTotal, 0);
  const taxAmount = subtotal * (initialRestaurantData.taxRate / 100);
  const serviceCharge = subtotal * (initialRestaurantData.serviceChargeRate / 100);
  const totalAmount = subtotal + taxAmount + serviceCharge;

  const tableNumber = session.table?.tableNumber || cart.tableNumber;

  const handleConfirmClear = () => {
    dispatch(clearCart());
    setIsClearModalOpen(false);
    toast.info('Cart Cleared', 'All items have been removed from your cart.');
  };

  const handleRemoveItem = (id: string, name: string) => {
    dispatch(removeFromCart(id));
    toast.info('Item Removed', `Removed ${name} from your order.`);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24 md:pb-8 flex flex-col">
      <CustomerHeader />

      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-4">
        <h1 className="text-xl font-bold text-stone-900 mb-4">Your Order Cart</h1>

        {cart.items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Explore our menu and add delicious artisanal dishes to your order."
            actionLabel="Browse Menu"
            onAction={() => router.push('/menu')}
          />
        ) : (
          <div className="space-y-4">
            {/* Table Info Banner */}
            {tableNumber && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-900 font-medium">
                <span>Ordering for Table #{tableNumber}</span>
                <span className="font-bold">{session.customerName}</span>
              </div>
            )}

            {/* Customized Cart Items */}
            <div className="space-y-3">
              {cart.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={(id, q) => dispatch(updateQuantity({ id, quantity: q }))}
                  onRemove={(id) => handleRemoveItem(id, item.productName)}
                />
              ))}
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Kitchen Notes for Entire Order
              </label>
              <textarea
                rows={2}
                placeholder="Allergies, table preferences, special notes..."
                value={cart.specialNotes}
                onChange={(e) => dispatch(setSpecialNotes(e.target.value))}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Bill Summary */}
            <BillSummary
              subtotal={subtotal}
              taxAmount={taxAmount}
              serviceCharge={serviceCharge}
              totalAmount={totalAmount}
            />

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsClearModalOpen(true)}
                className="flex-1 rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Clear Cart
              </Button>
              <Button
                variant="primary"
                onClick={() => router.push('/checkout')}
                className="flex-[2] rounded-xl font-bold py-3"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Clear Cart Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleConfirmClear}
        title="Clear Cart?"
        description="Are you sure you want to remove all items from your order cart? This action cannot be undone."
        confirmText="Yes, Clear Cart"
        variant="danger"
      />

      <CustomerBottomNav />
    </div>
  );
}
