'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../../store';
import { logoutUser, AuthRole } from '../../store/slices/authSlice';
import { canAccessPath, getDefaultRouteForRole } from '../../lib/auth/roleGuards';
import { ShieldAlert, Lock, ArrowLeft, LogOut, KeyRound } from 'lucide-react';
import { Button } from '../ui/Button';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: AuthRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Unauthenticated State
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-md max-w-sm w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900">Staff Authentication Required</h2>
            <p className="text-xs text-stone-500 mt-1">
              Please sign in with your staff account credentials to access this portal section.
            </p>
          </div>
          <Link
            href="/login"
            className="block w-full py-3 bg-amber-600 text-white font-bold text-xs rounded-2xl shadow hover:bg-amber-700"
          >
            Go to Staff Login
          </Link>
        </div>
      </div>
    );
  }

  // Check Role Authorization
  const isAuthorized = allowedRoles
    ? allowedRoles.includes(user.role) || user.role === 'OWNER'
    : canAccessPath(user.role, pathname);

  if (!isAuthorized) {
    const defaultRoute = getDefaultRouteForRole(user.role);

    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-md max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-rose-100 text-rose-900 mb-2 inline-block">
              Access Restricted • Role: {user.role}
            </span>
            <h2 className="text-xl font-black text-stone-900">Unauthorized Section</h2>
            <p className="text-xs text-stone-600 mt-1">
              Your staff role (<strong className="text-stone-900">{user.role}</strong>) does not have permission to view or manage this route ({pathname}).
            </p>
          </div>

          <div className="bg-stone-50 rounded-2xl p-4 text-left text-xs space-y-1.5 border border-stone-200">
            <span className="font-bold text-stone-700 block">Staff Session Info:</span>
            <div className="flex justify-between text-stone-600">
              <span>Name</span>
              <span className="font-semibold text-stone-900">{user.name}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Role Privilege</span>
              <span className="font-mono font-bold text-amber-700">{user.role}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => router.push(defaultRoute)}
              variant="primary"
              className="w-full py-3 rounded-2xl text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to My Authorized Dashboard ({user.role})
            </Button>

            <Button
              onClick={() => {
                dispatch(logoutUser());
                router.push('/login');
              }}
              variant="outline"
              className="w-full py-3 rounded-2xl text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              <LogOut className="w-4 h-4 mr-1.5" /> Log Out & Switch Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
