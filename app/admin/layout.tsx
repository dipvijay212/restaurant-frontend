'use client';

import React from 'react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { useAppSelector } from '../../store';

import { RoleGuard } from '../../components/shared/RoleGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useAppSelector((state) => state.adminUi.sidebarOpen);

  return (
    <RoleGuard>
      <div className="min-h-screen bg-stone-100 flex">
        <AdminSidebar />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
          <AdminHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}
