'use client';

import React, { useState } from 'react';
import { StaffMember } from '../../types/staff';
import { Button } from '../ui/Button';
import { KeyRound, X, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { staffApi } from '../../lib/api/staff';

export interface ResetPasswordModalProps {
  staff: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  staff,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !staff) return null;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateRandom = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let rand = '';
    for (let i = 0; i < 12; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(rand);
    setConfirmPassword(rand);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await staffApi.resetStaffPassword(staff.id, newPassword);
      onSuccess(res.message);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 text-stone-900">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl font-black">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-stone-900 text-lg">Reset Staff Password</h3>
              <p className="text-xs text-stone-500">Update credentials for {staff.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl">
            ⚠️ {error}
          </div>
        )}

        <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 mb-4 text-xs font-semibold text-stone-700 flex justify-between">
          <span>Account: {staff.email}</span>
          <span className="font-black uppercase text-amber-800">{staff.role}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-stone-700">New Password</label>
              <button
                type="button"
                onClick={handleGenerateRandom}
                className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Auto-Generate
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex justify-end gap-2">
            <Button type="button" onClick={onClose} variant="secondary" className="py-2.5 text-xs font-bold">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="py-2.5 px-5 text-xs font-black rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Reset Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
