import React from 'react';
import { StaffHeader } from '../../components/staff/StaffHeader';
import { RoleGuard } from '../../components/shared/RoleGuard';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard>
      <div className="min-h-screen bg-stone-100 flex flex-col">
        <StaffHeader />
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </RoleGuard>
  );
}
