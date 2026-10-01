import React from 'react';
import Link from 'next/link';
import { Utensils, ChefHat, Users, ShieldCheck, QrCode, ArrowRight } from 'lucide-react';
import { initialRestaurantData } from '../mock/restaurant';

export default function SystemPortalPage() {
  const restaurant = initialRestaurantData;

  const interfaces = [
    {
      title: 'Customer Dining Experience',
      description: 'Mobile-first QR menu, instant table ordering, live order tracking & digital billing.',
      href: '/menu',
      tableDemoHref: '/table/tbl-01',
      icon: Utensils,
      color: 'bg-amber-500 text-white',
      border: 'border-amber-200 hover:border-amber-400',
      tag: 'Mobile First',
    },
    {
      title: 'Admin & Manager Console',
      description: 'Comprehensive operations, order monitoring, menu management, staff control & analytics.',
      href: '/admin',
      icon: ShieldCheck,
      color: 'bg-stone-900 text-white',
      border: 'border-stone-200 hover:border-stone-400',
      tag: 'Desktop & Tablet',
    },
    {
      title: 'Kitchen Display System (KDS)',
      description: 'Real-time order tickets, prep status toggles, timers and ticket fulfillment history.',
      href: '/kitchen',
      icon: ChefHat,
      color: 'bg-rose-600 text-white',
      border: 'border-rose-200 hover:border-rose-400',
      tag: 'Kitchen Display',
    },
    {
      title: 'Waitstaff Floor Portal',
      description: 'Live table floorplan, service request notifications, guest assistance & instant bill call.',
      href: '/staff',
      icon: Users,
      color: 'bg-indigo-600 text-white',
      border: 'border-indigo-200 hover:border-indigo-400',
      tag: 'Waitstaff Mobile/Tablet',
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Hero Section */}
      <div className="bg-stone-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Utensils className="w-3.5 h-3.5" /> Single Restaurant Operations System
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            {restaurant.name}
          </h1>
          <p className="text-stone-300 text-lg max-w-2xl mx-auto font-light mb-8">
            {restaurant.tagline}. {restaurant.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-stone-400">
            <span>📍 {restaurant.address}, {restaurant.city}</span>
            <span>📞 {restaurant.phone}</span>
            <span>🕒 {restaurant.openingHours.mondayToFriday}</span>
          </div>
        </div>
      </div>

      {/* Main Portals Grid */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Select Operating Mode</h2>
            <p className="text-sm text-stone-500">Choose an interface role or sign in as staff</p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold shadow hover:bg-amber-700 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" /> Staff Authentication Login
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {interfaces.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.href}
                className={`bg-white rounded-2xl p-6 border ${item.border} shadow-sm transition-all hover:shadow-md flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${item.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-stone-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-stone-600 mb-6">{item.description}</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-stone-100">
                  <Link
                    href={item.href}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
                  >
                    <span>Launch {item.title.split(' ')[0]} Interface</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {item.tableDemoHref && (
                    <Link
                      href={item.tableDemoHref}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200 hover:bg-amber-100 transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" /> Simulate Table #1 QR Scan
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-500">
        <div className="max-w-5xl mx-auto px-4">
          <p>© 2026 {restaurant.name} — Smart Restaurant System Architecture Base</p>
        </div>
      </footer>
    </div>
  );
}
