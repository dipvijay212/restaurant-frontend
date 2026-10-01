'use client';

import React from 'react';
import { NotificationHistoryView } from '../../components/notifications/NotificationHistoryView';
import { CustomerHeader } from '../../components/customer/CustomerHeader';

export default function CustomerNotificationsPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <CustomerHeader />
      <main className="p-4 sm:p-6 max-w-4xl mx-auto">
        <NotificationHistoryView audience="customer" backHref="/menu" />
      </main>
    </div>
  );
}
