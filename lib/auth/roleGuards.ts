import { AuthRole } from '../../store/slices/authSlice';

export interface RoutePermission {
  pathPrefix: string;
  allowedRoles: AuthRole[];
  label: string;
}

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  {
    pathPrefix: '/admin/analytics',
    allowedRoles: ['OWNER', 'MANAGER'],
    label: 'Financial Analytics',
  },
  {
    pathPrefix: '/admin/settings',
    allowedRoles: ['OWNER'],
    label: 'Owner System Settings',
  },
  {
    pathPrefix: '/admin/staff',
    allowedRoles: ['OWNER', 'MANAGER'],
    label: 'Staff Management',
  },
  {
    pathPrefix: '/admin/payments',
    allowedRoles: ['OWNER', 'MANAGER', 'CASHIER'],
    label: 'Payments & Revenue',
  },
  {
    pathPrefix: '/admin/bills',
    allowedRoles: ['OWNER', 'MANAGER', 'CASHIER'],
    label: 'Billing Management',
  },
  {
    pathPrefix: '/admin/menu',
    allowedRoles: ['OWNER', 'MANAGER'],
    label: 'Menu Management',
  },
  {
    pathPrefix: '/admin/tables',
    allowedRoles: ['OWNER', 'MANAGER'],
    label: 'Floor Plan & Tables',
  },
  {
    pathPrefix: '/admin',
    allowedRoles: ['OWNER', 'MANAGER'],
    label: 'Admin Portal',
  },
  {
    pathPrefix: '/kitchen',
    allowedRoles: ['OWNER', 'MANAGER', 'KITCHEN'],
    label: 'Kitchen Display System (KDS)',
  },
  {
    pathPrefix: '/staff/bills',
    allowedRoles: ['OWNER', 'MANAGER', 'WAITER', 'CASHIER'],
    label: 'Staff Bills',
  },
  {
    pathPrefix: '/staff',
    allowedRoles: ['OWNER', 'MANAGER', 'WAITER', 'CASHIER'],
    label: 'Staff Operations',
  },
];

/**
 * Evaluates whether a role is authorized to view a specific pathname.
 */
export function canAccessPath(role: AuthRole, path: string): boolean {
  if (role === 'OWNER') return true; // OWNER has universal access

  // Match most specific route permission rule first
  const rule = ROUTE_PERMISSIONS.find((p) => path.startsWith(p.pathPrefix));
  if (!rule) return true; // Public route

  return rule.allowedRoles.includes(role);
}

/**
 * Returns default landing route based on staff role.
 */
export function getDefaultRouteForRole(role: AuthRole): string {
  switch (role) {
    case 'OWNER':
    case 'MANAGER':
      return '/admin';
    case 'KITCHEN':
      return '/kitchen';
    case 'WAITER':
      return '/staff';
    case 'CASHIER':
      return '/staff/bills';
    default:
      return '/admin';
  }
}
