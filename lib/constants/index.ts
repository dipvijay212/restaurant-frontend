export const RESTAURANT_ID = 'rest-001';
export const RESTAURANT_NAME = 'Demo Restaurant';

export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  preparing: { label: 'Preparing', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  ready: { label: 'Ready', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  served: { label: 'Served', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  completed: { label: 'Completed', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  cancelled: { label: 'Cancelled', color: 'bg-rose-100 text-rose-800 border-rose-300' },
};

export const TABLE_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  available: { label: 'Available', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  occupied: { label: 'Occupied', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  reserved: { label: 'Reserved', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  'needs-cleaning': { label: 'Needs Cleaning', color: 'bg-purple-100 text-purple-800 border-purple-300' },
};
