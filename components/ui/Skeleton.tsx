'use client';

import React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  ...props
}) => {
  const variants = {
    text: 'h-4 w-full rounded-md',
    circular: 'w-10 h-10 rounded-full',
    rectangular: 'h-20 w-full rounded-xl',
    card: 'h-40 w-full rounded-2xl',
  };

  return (
    <div
      className={cn('animate-pulse bg-stone-200/80 dark:bg-stone-800', variants[variant], className)}
      {...props}
    />
  );
};

// ---------------- SPECIALIZED SKELETON PREVIEWS ----------------

export const ProductCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-2xl p-3 border border-stone-100 shadow-sm flex flex-col justify-between space-y-3', className)}>
    <div className="space-y-2">
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="flex justify-between items-center pt-1">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-6 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-2/3 rounded" />
    </div>
    <div className="flex items-center justify-between pt-2 border-t border-stone-50">
      <Skeleton className="h-5 w-16 rounded" />
      <Skeleton className="h-8 w-20 rounded-xl" />
    </div>
  </div>
);

export const ProductGridSkeleton: React.FC<{ count?: number; className?: string }> = ({ count = 6, className }) => (
  <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const TableCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm space-y-3', className)}>
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <Skeleton className="h-5 w-20 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
      <Skeleton className="h-6 w-20 rounded-xl" />
    </div>
    <div className="bg-stone-50 p-3 rounded-2xl space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-3 w-12 rounded" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
    </div>
    <div className="pt-2 flex gap-1.5">
      <Skeleton className="h-8 flex-1 rounded-xl" />
      <Skeleton className="h-8 flex-1 rounded-xl" />
    </div>
  </div>
);

export const TableGridSkeleton: React.FC<{ count?: number; className?: string }> = ({ count = 8, className }) => (
  <div className={cn('grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <TableCardSkeleton key={i} />
    ))}
  </div>
);

export const OrderCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-3', className)}>
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <Skeleton className="h-5 w-24 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    <Skeleton className="h-3.5 w-4/5 rounded" />
    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
      <Skeleton className="h-4 w-24 rounded" />
      <Skeleton className="h-4 w-28 rounded" />
    </div>
  </div>
);

export const OrderListSkeleton: React.FC<{ count?: number; className?: string }> = ({ count = 4, className }) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <OrderCardSkeleton key={i} />
    ))}
  </div>
);

export const StatCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm space-y-2', className)}>
    <div className="flex justify-between items-center">
      <Skeleton className="h-3.5 w-24 rounded" />
      <Skeleton className="h-8 w-8 rounded-xl" />
    </div>
    <Skeleton className="h-7 w-28 rounded" />
    <Skeleton className="h-3 w-32 rounded" />
  </div>
);

export const StatGridSkeleton: React.FC<{ count?: number; className?: string }> = ({ count = 6, className }) => (
  <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <StatCardSkeleton key={i} />
    ))}
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; columns?: number; className?: string }> = ({
  rows = 5,
  columns = 6,
  className,
}) => (
  <div className={cn('bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden', className)}>
    <div className="p-4 border-b border-stone-100 flex justify-between items-center">
      <Skeleton className="h-4 w-32 rounded" />
      <Skeleton className="h-8 w-48 rounded-xl" />
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-stone-50 border-b border-stone-200">
          <tr>
            {Array.from({ length: columns }).map((_, c) => (
              <th key={c} className="py-3 px-4">
                <Skeleton className="h-3 w-20 rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} className="py-3.5 px-4">
                  <Skeleton className={cn('h-3.5 rounded', c === 0 ? 'w-24' : c === columns - 1 ? 'w-16 ml-auto' : 'w-20')} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const KdsColumnSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex flex-col h-full rounded-3xl p-4 border border-stone-800 bg-stone-900/60 space-y-4 min-h-[480px]', className)}>
    <div className="flex justify-between items-center pb-3 border-b-4 border-stone-700">
      <Skeleton className="h-6 w-28 rounded bg-stone-800" />
      <Skeleton className="h-6 w-16 rounded-full bg-stone-800" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
          <div className="flex justify-between items-start">
            <Skeleton className="h-5 w-20 rounded bg-stone-800" />
            <Skeleton className="h-4 w-16 rounded bg-stone-800" />
          </div>
          <Skeleton className="h-3.5 w-3/4 rounded bg-stone-800" />
          <Skeleton className="h-3.5 w-1/2 rounded bg-stone-800" />
          <div className="pt-2 flex justify-between items-center border-t border-stone-800">
            <Skeleton className="h-3 w-16 rounded bg-stone-800" />
            <Skeleton className="h-7 w-24 rounded-xl bg-stone-800" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const RequestsListSkeleton: React.FC<{ count?: number; className?: string }> = ({ count = 4, className }) => (
  <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Skeleton className="w-10 h-10 rounded-2xl" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded" />
        </div>
        <Skeleton className="h-3 w-full rounded" />
        <div className="pt-2 flex gap-2 border-t border-stone-50">
          <Skeleton className="h-8 flex-1 rounded-xl" />
          <Skeleton className="h-8 flex-1 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

export const SettingsSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-6', className)}>
    <div className="flex gap-2 border-b border-stone-200 pb-3 overflow-x-auto">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-28 rounded-xl flex-shrink-0" />
      ))}
    </div>
    <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-6">
      <Skeleton className="h-6 w-48 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      <div className="flex justify-end pt-4 border-t border-stone-100">
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
    </div>
  </div>
);
