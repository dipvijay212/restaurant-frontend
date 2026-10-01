'use client';

import React from 'react';
import { NotificationHistoryView } from '../../../components/notifications/NotificationHistoryView';

export default function AdminNotificationsPage() {
  return <NotificationHistoryView audience="admin_staff" backHref="/admin" />;
}
