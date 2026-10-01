'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { restaurantApi } from '../../../lib/api/restaurant';
import { RestaurantConfig, DaySchedule } from '../../../types/restaurant';
import { Button } from '../../../components/ui/Button';
import { 
  Save, 
  Store, 
  Clock, 
  Receipt, 
  ShoppingBag, 
  CreditCard, 
  Bell, 
  QrCode, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Upload,
  Sparkles,
  Info,
  ShieldCheck
} from 'lucide-react';

type SectionId = 'info' | 'hours' | 'tax' | 'orders' | 'payments' | 'notifications' | 'qr';

export default function AdminSettingsPage() {
  const [restaurant, setRestaurant] = useState<RestaurantConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regeneratingQR, setRegeneratingQR] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>('info');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await restaurantApi.getRestaurantInfo();
        setRestaurant(data);
      } catch (err) {
        console.error('Failed to load restaurant settings:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!restaurant) return;
    try {
      setSaving(true);
      const updated = await restaurantApi.updateRestaurantInfo(restaurant);
      setRestaurant(updated);
      showToast('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateQR = async () => {
    if (!restaurant) return;
    const confirmRegen = window.confirm(
      'Are you sure you want to regenerate all QR code tokens? Existing physical tabletop QR codes will need to be re-printed.'
    );
    if (!confirmRegen) return;

    try {
      setRegeneratingQR(true);
      const res = await restaurantApi.regenerateQRCodes();
      if (res.success) {
        setRestaurant({
          ...restaurant,
          qrSettings: {
            ...restaurant.qrSettings,
            qrSecretToken: res.newToken,
            lastRegeneratedAt: res.regeneratedAt,
          }
        });
        showToast('QR Code security tokens successfully regenerated!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to regenerate QR codes');
    } finally {
      setRegeneratingQR(false);
    }
  };

  const handleDayScheduleChange = (index: number, field: keyof DaySchedule, value: any) => {
    if (!restaurant) return;
    const newSchedule = [...restaurant.openingHours.schedule];
    newSchedule[index] = {
      ...newSchedule[index],
      [field]: value
    };
    setRestaurant({
      ...restaurant,
      openingHours: {
        ...restaurant.openingHours,
        schedule: newSchedule,
      }
    });
  };

  if (loading || !restaurant) {
    return <LoadingSpinner label="Loading restaurant settings..." />;
  }

  const sections = [
    { id: 'info', name: 'Restaurant Information', icon: Store, desc: 'Name, logo, address, contact details' },
    { id: 'hours', name: 'Opening Hours', icon: Clock, desc: 'Weekly schedule & operating times' },
    { id: 'tax', name: 'Tax Settings', icon: Receipt, desc: 'GSTIN, tax rate & service charges' },
    { id: 'orders', name: 'Order Settings', icon: ShoppingBag, desc: 'Acceptance, cancellation & delay thresholds' },
    { id: 'payments', name: 'Payment Settings', icon: CreditCard, desc: 'Counter pay & online payment toggles' },
    { id: 'notifications', name: 'Notification Settings', icon: Bell, desc: 'Customer, kitchen & staff alerts' },
    { id: 'qr', name: 'QR Settings', icon: QrCode, desc: 'Table QR active status & security tokens' },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-stone-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="Restaurant Settings" 
          subtitle="Manage restaurant identity, operations, tax, payment gateways, and QR parameters."
        />
        <Button
          type="button"
          onClick={() => handleSave()}
          variant="primary"
          isLoading={saving}
          className="px-6 py-2.5 font-bold rounded-xl shadow-lg shadow-amber-500/20 self-start md:self-auto"
        >
          <Save className="w-4 h-4 mr-2" /> Save All Settings
        </Button>
      </div>

      {/* Navigation Layout: Left Sidebar + Right Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-white rounded-2xl border border-stone-200 p-2 shadow-sm sticky top-6">
            <div className="p-3 border-b border-stone-100 mb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Settings Navigation</h3>
            </div>
            <nav className="space-y-1">
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id as SectionId)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200 shadow-sm'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900 font-medium'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs">{sec.name}</div>
                      <div className="text-[10px] text-stone-400 line-clamp-1 font-normal">{sec.desc}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Form Content */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Section 1: Restaurant Information */}
          {activeSection === 'info' && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Restaurant Information</h2>
                  <p className="text-xs text-stone-500">Basic business details visible on customer digital menu and receipts.</p>
                </div>
              </div>

              {/* Logo & Cover Image Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-2">Restaurant Logo</label>
                  <div className="flex items-center gap-4">
                    <img 
                      src={restaurant.logo} 
                      alt="Logo Preview" 
                      className="w-20 h-20 rounded-2xl border-2 border-stone-200 object-cover shadow-sm bg-stone-50"
                    />
                    <div className="space-y-2 flex-1">
                      <input 
                        type="text" 
                        value={restaurant.logo}
                        onChange={(e) => setRestaurant({ ...restaurant, logo: e.target.value })}
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-amber-500"
                        placeholder="Logo Image URL"
                      />
                      <p className="text-[10px] text-stone-400">Direct image link (SVG, PNG, JPEG)</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-2">Menu Header Cover Image</label>
                  <div className="flex items-center gap-4">
                    <img 
                      src={restaurant.coverImage} 
                      alt="Cover Preview" 
                      className="w-28 h-20 rounded-2xl border border-stone-200 object-cover shadow-sm bg-stone-50"
                    />
                    <div className="space-y-2 flex-1">
                      <input 
                        type="text" 
                        value={restaurant.coverImage}
                        onChange={(e) => setRestaurant({ ...restaurant, coverImage: e.target.value })}
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-amber-500"
                        placeholder="Cover Image URL"
                      />
                      <p className="text-[10px] text-stone-400">Cover banner image URL</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Restaurant Name *</label>
                  <input
                    type="text"
                    value={restaurant.name}
                    onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    value={restaurant.phone}
                    onChange={(e) => setRestaurant({ ...restaurant, phone: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Tagline & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={restaurant.tagline}
                    onChange={(e) => setRestaurant({ ...restaurant, tagline: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={restaurant.email}
                    onChange={(e) => setRestaurant({ ...restaurant, email: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  value={restaurant.address}
                  onChange={(e) => setRestaurant({ ...restaurant, address: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500"
                  required
                />
              </div>

              {/* City & Postal Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={restaurant.city}
                    onChange={(e) => setRestaurant({ ...restaurant, city: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={restaurant.postalCode}
                    onChange={(e) => setRestaurant({ ...restaurant, postalCode: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Short Description</label>
                <textarea
                  rows={3}
                  value={restaurant.description}
                  onChange={(e) => setRestaurant({ ...restaurant, description: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end">
                <Button type="button" onClick={() => handleSave()} isLoading={saving} className="px-5 py-2">
                  <Save className="w-4 h-4 mr-2" /> Save Restaurant Info
                </Button>
              </div>
            </div>
          )}

          {/* Section 2: Opening Hours */}
          {activeSection === 'hours' && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Opening Hours</h2>
                  <p className="text-xs text-stone-500">Configure daily operating times and weekly rest days.</p>
                </div>
              </div>

              {/* Summary Strings for customer UI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Weekday Hours Summary</label>
                  <input
                    type="text"
                    value={restaurant.openingHours.mondayToFriday}
                    onChange={(e) => setRestaurant({
                      ...restaurant,
                      openingHours: { ...restaurant.openingHours, mondayToFriday: e.target.value }
                    })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500"
                    placeholder="e.g. 11:00 AM - 10:00 PM"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Weekend Hours Summary</label>
                  <input
                    type="text"
                    value={restaurant.openingHours.saturdayToSunday}
                    onChange={(e) => setRestaurant({
                      ...restaurant,
                      openingHours: { ...restaurant.openingHours, saturdayToSunday: e.target.value }
                    })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500"
                    placeholder="e.g. 10:00 AM - 11:00 PM"
                  />
                </div>
              </div>

              {/* Detailed Daily Schedule Table */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Daily Schedule Breakdown</h3>
                <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-100">
                  {restaurant.openingHours.schedule.map((sch, idx) => (
                    <div key={sch.day} className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${sch.isClosed ? 'bg-stone-50/70' : 'bg-white'}`}>
                      <div className="flex items-center gap-3 w-32">
                        <input
                          type="checkbox"
                          id={`closed-${sch.day}`}
                          checked={!sch.isClosed}
                          onChange={(e) => handleDayScheduleChange(idx, 'isClosed', !e.target.checked)}
                          className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                        />
                        <label htmlFor={`closed-${sch.day}`} className={`text-xs font-bold ${sch.isClosed ? 'text-stone-400 line-through' : 'text-stone-800'}`}>
                          {sch.day}
                        </label>
                      </div>

                      {sch.isClosed ? (
                        <span className="text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 self-start sm:self-auto">
                          CLOSED ALL DAY
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={sch.openTime}
                            onChange={(e) => handleDayScheduleChange(idx, 'openTime', e.target.value)}
                            className="p-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700"
                          />
                          <span className="text-xs text-stone-400 font-bold">TO</span>
                          <input
                            type="time"
                            value={sch.closeTime}
                            onChange={(e) => handleDayScheduleChange(idx, 'closeTime', e.target.value)}
                            className="p-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end">
                <Button type="button" onClick={() => handleSave()} isLoading={saving} className="px-5 py-2">
                  <Save className="w-4 h-4 mr-2" /> Save Opening Hours
                </Button>
              </div>
            </div>
          )}

          {/* Section 3: Tax Settings */}
          {activeSection === 'tax' && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Tax & Registration</h2>
                  <p className="text-xs text-stone-500">Configure sales tax (GST/VAT), service charge percentage, and invoice tax policy.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">GSTIN / Tax ID Number</label>
                  <input
                    type="text"
                    value={restaurant.tax.gstin}
                    onChange={(e) => setRestaurant({
                      ...restaurant,
                      tax: { ...restaurant.tax, gstin: e.target.value }
                    })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500 font-mono"
                    placeholder="e.g. 27AAAAA0000A1Z5"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Printed on official customer bills & invoices.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Currency Code & Symbol</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={restaurant.currencySymbol}
                      onChange={(e) => setRestaurant({ ...restaurant, currencySymbol: e.target.value })}
                      className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500 font-bold"
                      placeholder="Symbol ($ / ₹)"
                    />
                    <input
                      type="text"
                      value={restaurant.currency}
                      onChange={(e) => setRestaurant({ ...restaurant, currency: e.target.value })}
                      className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500"
                      placeholder="Code (USD / INR)"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Sales Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={restaurant.tax.taxRate}
                    onChange={(e) => setRestaurant({
                      ...restaurant,
                      taxRate: Number(e.target.value),
                      tax: { ...restaurant.tax, taxRate: Number(e.target.value) }
                    })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Service Charge (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={restaurant.tax.serviceChargeRate}
                    onChange={(e) => setRestaurant({
                      ...restaurant,
                      serviceChargeRate: Number(e.target.value),
                      tax: { ...restaurant.tax, serviceChargeRate: Number(e.target.value) }
                    })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500 font-bold"
                  />
                </div>
              </div>

              {/* Tax Inclusion Toggle */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Tax Inclusive Menu Pricing</h4>
                  <p className="text-[11px] text-stone-500">If enabled, prices displayed on digital menu already include tax.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={restaurant.tax.taxInclusive}
                    onChange={(e) => setRestaurant({
                      ...restaurant,
                      tax: { ...restaurant.tax, taxInclusive: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end">
                <Button type="button" onClick={() => handleSave()} isLoading={saving} className="px-5 py-2">
                  <Save className="w-4 h-4 mr-2" /> Save Tax Settings
                </Button>
              </div>
            </div>
          )}

          {/* Section 4: Order Settings */}
          {activeSection === 'orders' && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Order Settings</h2>
                  <p className="text-xs text-stone-500">Configure order acceptance mode, cancellation rules, and kitchen alert thresholds.</p>
                </div>
              </div>

              {/* Order Acceptance Mode */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700">Order Acceptance Mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRestaurant({
                      ...restaurant,
                      orderSettings: { ...restaurant.orderSettings, autoAcceptOrders: false }
                    })}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      !restaurant.orderSettings.autoAcceptOrders
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100/50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mt-0.5 ${!restaurant.orderSettings.autoAcceptOrders ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-600'}`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900">Manual Acceptance</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">Kitchen staff must manually accept each incoming customer order.</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRestaurant({
                      ...restaurant,
                      orderSettings: { ...restaurant.orderSettings, autoAcceptOrders: true }
                    })}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      restaurant.orderSettings.autoAcceptOrders
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100/50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mt-0.5 ${restaurant.orderSettings.autoAcceptOrders ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-600'}`}>
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900">Auto Acceptance</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">Orders are automatically routed directly to kitchen prep boards.</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Thresholds */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Cancellation Grace Period (Mins)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={restaurant.orderSettings.cancellationWindowMinutes}
                    onChange={(e) => setRestaurant({
                      ...restaurant,
                      orderSettings: { ...restaurant.orderSettings, cancellationWindowMinutes: Number(e.target.value) }
                    })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500 font-bold"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Time customer has to cancel PENDING orders.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Preparation Warning Threshold (Mins)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={restaurant.orderSettings.preparationWarningThresholdMins}
                    onChange={(e) => setRestaurant({
                      ...restaurant,
                      orderSettings: { ...restaurant.orderSettings, preparationWarningThresholdMins: Number(e.target.value) }
                    })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500 font-bold"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Yellow warning badge on Kitchen KDS cards.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Delayed Order Threshold (Mins)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={restaurant.orderSettings.delayedOrderThresholdMins}
                    onChange={(e) => setRestaurant({
                      ...restaurant,
                      orderSettings: { ...restaurant.orderSettings, delayedOrderThresholdMins: Number(e.target.value) }
                    })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500 font-bold"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Red alert badge & delayed counter trigger.</p>
                </div>
              </div>

              {/* Cancellation Policy Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Cancellation Rules Policy Text</label>
                <textarea
                  rows={3}
                  value={restaurant.orderSettings.cancellationRules}
                  onChange={(e) => setRestaurant({
                    ...restaurant,
                    orderSettings: { ...restaurant.orderSettings, cancellationRules: e.target.value }
                  })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500"
                  placeholder="Cancellation rules policy displayed to customer during checkout."
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end">
                <Button type="button" onClick={() => handleSave()} isLoading={saving} className="px-5 py-2">
                  <Save className="w-4 h-4 mr-2" /> Save Order Settings
                </Button>
              </div>
            </div>
          )}

          {/* Section 5: Payment Settings */}
          {activeSection === 'payments' && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Payment Settings</h2>
                  <p className="text-xs text-stone-500">Enable or disable counter pay and online checkout integration methods.</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Pay at Counter Toggle */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">Pay at Counter Enabled</h4>
                      <p className="text-[11px] text-stone-500">Allow customers to pay cash or card directly to cashier upon dining completion.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restaurant.paymentSettings.payAtCounterEnabled}
                      onChange={(e) => setRestaurant({
                        ...restaurant,
                        paymentSettings: { ...restaurant.paymentSettings, payAtCounterEnabled: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {/* Online Payment Enabled */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">Online Payment Enabled</h4>
                      <p className="text-[11px] text-stone-500">Allow customers to pay instantly via UPI, Cards, NetBanking via Cashfree Gateway.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restaurant.paymentSettings.onlinePaymentEnabled}
                      onChange={(e) => setRestaurant({
                        ...restaurant,
                        paymentSettings: { ...restaurant.paymentSettings, onlinePaymentEnabled: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>

              {/* Security Banner */}
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <span className="font-bold">Gateway Credentials Notice:</span> Payment secrets (App ID / Secret Keys) are securely retrieved from server environment variables (`CASHFREE_APP_ID`) and never stored in plain text frontend code.
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end">
                <Button type="button" onClick={() => handleSave()} isLoading={saving} className="px-5 py-2">
                  <Save className="w-4 h-4 mr-2" /> Save Payment Settings
                </Button>
              </div>
            </div>
          )}

          {/* Section 6: Notification Settings */}
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Notification Settings</h2>
                  <p className="text-xs text-stone-500">Toggle sound alerts, staff notifications, and customer status updates.</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Kitchen Sound */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">Kitchen Chime Sound Alert</h4>
                    <p className="text-[11px] text-stone-500">Play an audible chime when new orders or items arrive on the Kitchen Display System (KDS).</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restaurant.notificationSettings.kitchenSound}
                      onChange={(e) => setRestaurant({
                        ...restaurant,
                        notificationSettings: { ...restaurant.notificationSettings, kitchenSound: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {/* Customer Notifications */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">Customer Order Tracking Alerts</h4>
                    <p className="text-[11px] text-stone-500">Send automatic order status update popups to active customer table sessions.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restaurant.notificationSettings.customerNotifications}
                      onChange={(e) => setRestaurant({
                        ...restaurant,
                        notificationSettings: { ...restaurant.notificationSettings, customerNotifications: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {/* Staff Notifications */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">Staff Service Request Alerts</h4>
                    <p className="text-[11px] text-stone-500">Trigger immediate sound and visual banners on waiter tablets when table requests arrive.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restaurant.notificationSettings.staffNotifications}
                      onChange={(e) => setRestaurant({
                        ...restaurant,
                        notificationSettings: { ...restaurant.notificationSettings, staffNotifications: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end">
                <Button type="button" onClick={() => handleSave()} isLoading={saving} className="px-5 py-2">
                  <Save className="w-4 h-4 mr-2" /> Save Notification Settings
                </Button>
              </div>
            </div>
          )}

          {/* Section 7: QR Settings */}
          {activeSection === 'qr' && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">QR Code Settings</h2>
                  <p className="text-xs text-stone-500">Manage table QR code ordering state and regenerate security tokens.</p>
                </div>
              </div>

              {/* Active/Inactive Toggle */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-stone-900">QR Code Ordering System</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      restaurant.qrSettings.qrActive 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-stone-200 text-stone-600'
                    }`}>
                      {restaurant.qrSettings.qrActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    When inactive, scanning table QR codes will display a maintenance message instead of opening the menu.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={restaurant.qrSettings.qrActive}
                    onChange={(e) => setRestaurant({
                      ...restaurant,
                      qrSettings: { ...restaurant.qrSettings, qrActive: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Security & Token Info */}
              <div className="p-5 bg-stone-900 text-white rounded-2xl space-y-4 shadow-inner">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-amber-400">QR Code Security Secret</h4>
                    <p className="text-[11px] text-stone-400">Tokens are embedded in table QR URLs to prevent unauthorized ordering.</p>
                  </div>
                  <div className="p-2 bg-stone-800 text-stone-300 rounded-xl">
                    <QrCode className="w-5 h-5" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Current Secret Token</span>
                    <span className="font-mono text-stone-200 font-semibold truncate block mt-0.5">{restaurant.qrSettings.qrSecretToken}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Last Regenerated</span>
                    <span className="text-stone-300 font-medium block mt-0.5">
                      {new Date(restaurant.qrSettings.lastRegeneratedAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-amber-300">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Regenerating will invalidate old tabletop printed codes.</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRegenerateQR}
                    isLoading={regeneratingQR}
                    className="bg-stone-800 border-stone-700 text-white hover:bg-stone-700 text-xs py-2 px-4"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-2" /> Regenerate QR Codes
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end">
                <Button type="button" onClick={() => handleSave()} isLoading={saving} className="px-5 py-2">
                  <Save className="w-4 h-4 mr-2" /> Save QR Settings
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
