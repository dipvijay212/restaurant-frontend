import React from 'react';
import { KitchenHeader } from '../../components/kitchen/KitchenHeader';
import { RoleGuard } from '../../components/shared/RoleGuard';

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard>
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
        <KitchenHeader />
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </RoleGuard>
  );
}
