'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { restaurantApi } from '../../../lib/api/restaurant';
import { RestaurantConfig } from '../../../types/restaurant';
import { Button } from '../../../components/ui/Button';
import { Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [restaurant, setRestaurant] = useState<RestaurantConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await restaurantApi.getRestaurantInfo();
        setRestaurant(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    try {
      setSaving(true);
      await restaurantApi.updateRestaurantInfo(restaurant);
      alert('Restaurant settings saved successfully!');
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !restaurant) return <LoadingSpinner label="Loading restaurant configuration..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Single Restaurant Settings" subtitle="Configure business details, tax rates, service charges, and working hours." />

      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-6 max-w-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Restaurant Name</label>
            <input
              type="text"
              value={restaurant.name}
              onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Tagline</label>
            <input
              type="text"
              value={restaurant.tagline}
              onChange={(e) => setRestaurant({ ...restaurant, tagline: e.target.value })}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Currency Symbol</label>
            <input
              type="text"
              value={restaurant.currencySymbol}
              onChange={(e) => setRestaurant({ ...restaurant, currencySymbol: e.target.value })}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Tax Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={restaurant.taxRate}
              onChange={(e) => setRestaurant({ ...restaurant, taxRate: Number(e.target.value) })}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Service Charge (%)</label>
            <input
              type="number"
              step="0.1"
              value={restaurant.serviceChargeRate}
              onChange={(e) => setRestaurant({ ...restaurant, serviceChargeRate: Number(e.target.value) })}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Address</label>
          <input
            type="text"
            value={restaurant.address}
            onChange={(e) => setRestaurant({ ...restaurant, address: e.target.value })}
            className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-amber-500"
          />
        </div>

        <Button type="submit" variant="primary" isLoading={saving} className="px-6 py-2.5 font-bold rounded-xl">
          <Save className="w-4 h-4 mr-2" /> Save Configuration
        </Button>
      </form>
    </div>
  );
}
