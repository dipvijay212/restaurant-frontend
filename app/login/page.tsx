'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../store';
import { setAuthenticatedUser, AuthRole } from '../../store/slices/authSlice';
import { authApi, MOCK_STAFF_ACCOUNTS } from '../../lib/api/auth';
import { getDefaultRouteForRole } from '../../lib/auth/roleGuards';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/ui/Toast';
import {
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  Building2,
  ChefHat,
  UserCheck,
  Receipt,
  Crown,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Form submit handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    // Validation
    if (!email.trim()) {
      setErrorBanner('Please enter your staff email address.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setErrorBanner('Please enter a valid email address format.');
      return;
    }
    if (!password) {
      setErrorBanner('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      const authenticatedStaff = await authApi.login(email, password);

      // Save to Redux store & localStorage session
      dispatch(setAuthenticatedUser(authenticatedStaff));

      setToast({
        title: 'Authentication Successful',
        message: `Welcome back, ${authenticatedStaff.name} (${authenticatedStaff.role})!`,
        type: 'success',
      });

      // Redirect to role portal
      const targetRoute = getDefaultRouteForRole(authenticatedStaff.role);
      setTimeout(() => {
        router.push(targetRoute);
      }, 500);
    } catch (err: any) {
      setErrorBanner(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Role Switcher Handler
  const handleQuickDemoLogin = async (role: AuthRole) => {
    const acc = MOCK_STAFF_ACCOUNTS.find((a) => a.role === role);
    if (!acc) return;

    setEmail(acc.email);
    setPassword(acc.password);
    setErrorBanner(null);

    try {
      setLoading(true);
      const authenticatedStaff = await authApi.login(acc.email, acc.password);
      dispatch(setAuthenticatedUser(authenticatedStaff));

      setToast({
        title: `Logged in as ${role}`,
        message: `Signed in as ${authenticatedStaff.name}. Navigating...`,
        type: 'success',
      });

      const targetRoute = getDefaultRouteForRole(role);
      setTimeout(() => {
        router.push(targetRoute);
      }, 400);
    } catch (err: any) {
      setErrorBanner('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  const roleIcons = {
    OWNER: Crown,
    MANAGER: Building2,
    KITCHEN: ChefHat,
    WAITER: UserCheck,
    CASHIER: Receipt,
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {toast && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black text-2xl shadow-lg mx-auto mb-2">
          D
        </div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">Staff Portal Login</h1>
        <p className="text-xs text-stone-500 font-medium">
          Demo Restaurant Single-Location Operations System
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-stone-200/80 space-y-6">
          {/* Currently Logged In Session Indicator if active */}
          {currentUser && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" /> Currently Signed In
                </span>
                <span className="font-mono font-extrabold text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-amber-800">
                You are logged in as <strong>{currentUser.name}</strong> ({currentUser.email}).
              </p>
              <Button
                onClick={() => router.push(getDefaultRouteForRole(currentUser.role))}
                variant="primary"
                size="sm"
                className="w-full text-xs font-bold py-2 rounded-xl mt-1"
              >
                Continue to My Portal <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          )}

          {/* Validation or Authentication Error Banner */}
          {errorBanner && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-900 text-xs flex gap-3 items-center animate-in fade-in">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <div>
                <span className="font-bold block">Authentication Error</span>
                <span>{errorBanner}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Staff Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. manager@demorestaurant.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              disabled={loading}
              className="w-full py-3.5 text-xs font-extrabold rounded-2xl shadow-md"
            >
              Sign In to Staff Portal
            </Button>
          </form>

          {/* Quick Role Demo Login Preset Switchers */}
          <div className="pt-4 border-t border-stone-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400">
                Quick Demo Role Sign-In
              </span>
              <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Preset Credentials
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {MOCK_STAFF_ACCOUNTS.map((acc) => {
                const Icon = roleIcons[acc.role] || ShieldCheck;

                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickDemoLogin(acc.role)}
                    disabled={loading}
                    className="p-2.5 rounded-xl border border-stone-200 hover:border-amber-500 bg-stone-50 hover:bg-amber-50 text-left flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-stone-900 text-xs block group-hover:text-amber-900">
                          {acc.name}
                        </span>
                        <span className="text-[10px] text-stone-500 block">
                          {acc.email} • <strong className="text-amber-800 font-mono">{acc.role}</strong>
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
