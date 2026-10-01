'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { qrTokenApi, QRResolutionResult } from '../../../lib/api/qr';
import { useAppDispatch } from '../../../store';
import { initializeSession } from '../../../store/slices/customerSessionSlice';
import { setCartTable } from '../../../store/slices/cartSlice';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { Button } from '../../../components/ui/Button';
import {
  Utensils,
  QrCode,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export default function QRTableLandingPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Accept token parameter (e.g. table-demo-12, tbl-01, etc.)
  const token = (params.token || params.tableId) as string;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<QRResolutionResult | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [guestCount, setGuestCount] = useState(2);

  const resolveQR = async () => {
    try {
      setLoading(true);
      const res = await qrTokenApi.resolveQRToken(token);
      setResult(res);
    } catch (err) {
      setResult({
        success: false,
        status: 'invalid_qr',
        errorReason: 'Failed to communicate with QR resolution service.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      resolveQR();
    }
  }, [token]);

  const handleStartDining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!result || !result.success || !result.table || !result.restaurant) return;

    const name = customerName.trim() || 'Guest';

    // 1. Initialize Redux Customer Session state & store in localStorage
    dispatch(
      initializeSession({
        table: result.table,
        restaurant: result.restaurant,
        status: 'active',
        customerName: name,
        guestCount,
      })
    );

    // 2. Set cart table binding
    dispatch(
      setCartTable({
        tableId: result.table.id,
        tableNumber: result.table.tableNumber,
      })
    );

    // 3. Navigate to /menu
    router.push('/menu');
  };

  // State 1: Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-3xl p-8 border border-stone-100 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-600/10 text-amber-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <QrCode className="w-8 h-8" />
          </div>
          <LoadingSpinner label="Resolving Table QR Code..." />
          <p className="text-xs text-stone-400 mt-2">Connecting to Demo Restaurant system...</p>
        </div>
      </div>
    );
  }

  // State 2: Invalid QR Code State
  if (!result || result.status === 'invalid_qr') {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-100 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 mb-2">Invalid QR Code</h1>
          <p className="text-sm text-stone-600 mb-6 max-w-xs mx-auto">
            {result?.errorReason || 'This table QR code is not recognized by Demo Restaurant.'}
          </p>
          <div className="space-y-3">
            <Button onClick={resolveQR} variant="outline" className="w-full py-3 rounded-2xl">
              Try Scanning Again
            </Button>
            <Button onClick={() => router.push('/menu')} variant="ghost" className="w-full text-xs text-stone-500">
              Continue to Menu as Guest
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Restaurant Closed State
  if (result.status === 'closed') {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-100 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 mb-1">{result.restaurant?.name}</h1>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-4">Currently Closed</span>
          <p className="text-xs text-stone-600 mb-6 bg-stone-50 p-4 rounded-2xl border border-stone-100">
            {result.errorReason}
          </p>
          <Button onClick={() => router.push('/')} variant="secondary" className="w-full py-3 rounded-2xl font-bold">
            Return to App Portal
          </Button>
        </div>
      </div>
    );
  }

  // State 4: Inactive / Unavailable Table State
  if (result.status === 'inactive') {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-100 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold text-stone-900 mb-1">Table {result.table?.tableNumber} Unavailable</h1>
          <p className="text-xs text-stone-600 mb-6">
            {result.errorReason || 'This table is currently reserved or undergoing maintenance.'}
          </p>
          <div className="space-y-3">
            <Button onClick={() => router.push('/requests')} variant="primary" className="w-full py-3 rounded-2xl font-bold">
              Ask Staff for Seating Assistance
            </Button>
            <Button onClick={() => router.push('/menu')} variant="outline" className="w-full py-3 rounded-2xl text-xs">
              Browse Menu Only
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // State 5: Successful Table Landing Screen
  const table = result.table!;
  const restaurant = result.restaurant!;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-100 shadow-xl text-center relative overflow-hidden">
        {/* Cover Glow Header */}
        <div className="h-28 w-full bg-gradient-to-r from-amber-600 to-amber-700 absolute top-0 left-0" />

        <div className="relative z-10 pt-4">
          <img
            src={restaurant.logo}
            alt={restaurant.name}
            className="w-20 h-20 rounded-2xl border-4 border-white object-cover shadow-md mx-auto mb-3 bg-white"
          />

          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Welcome to {restaurant.name}
          </h1>
          <p className="text-xs text-stone-500 font-medium mb-6">{restaurant.tagline}</p>

          {/* Table Identification Card */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-center gap-3 text-amber-900">
            <div className="p-2.5 bg-amber-600 text-white rounded-xl shadow-sm">
              <Utensils className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-xs font-semibold text-amber-700 block uppercase tracking-wider">Seated At</span>
              <span className="text-2xl font-black text-amber-950 leading-none">Table {table.tableNumber}</span>
              <span className="text-[11px] text-amber-800 block mt-0.5">{table.area} Area • Up to {table.capacity} Guests</span>
            </div>
          </div>

          {/* Dining Initialization Form */}
          <form onSubmit={handleStartDining} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Your Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Party Size</label>
              <select
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" variant="primary" className="w-full py-3.5 text-base rounded-2xl font-extrabold shadow-md mt-2">
              View Menu <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <p className="text-[11px] text-stone-400 mt-6">
            No app download or user account required. Instant dining session.
          </p>
        </div>
      </div>
    </div>
  );
}
