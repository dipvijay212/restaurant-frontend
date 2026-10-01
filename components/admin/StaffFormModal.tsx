'use client';

import React, { useState, useEffect } from 'react';
import { StaffMember, StaffRole, StaffStatus } from '../../types/staff';
import { Button } from '../ui/Button';
import { X, User, Shield, Mail, Phone, Lock, CheckCircle2 } from 'lucide-react';

export interface StaffFormModalProps {
  staff: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
  staff,
  isOpen,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const isEditing = !!staff;

  const [name, setName] = useState(staff?.name || '');
  const [email, setEmail] = useState(staff?.email || '');
  const [phone, setPhone] = useState(staff?.phone || '');
  const [role, setRole] = useState<StaffRole>(staff?.role || 'WAITER');
  const [status, setStatus] = useState<StaffStatus>(staff?.status || 'ACTIVE');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (staff) {
      setName(staff.name);
      setEmail(staff.email);
      setPhone(staff.phone);
      setRole(staff.role);
      setStatus(staff.status || 'ACTIVE');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setRole('WAITER');
      setStatus('ACTIVE');
      setPassword('');
    }
  }, [staff, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit({
        name,
        email,
        phone,
        role: role.toUpperCase() as StaffRole,
        status,
        ...(password ? { password } : {}),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 my-8 text-stone-900">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-stone-950 rounded-2xl font-black">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-stone-900 text-xl">
                {isEditing ? 'Edit Staff Member' : 'Create New Staff Member'}
              </h3>
              <p className="text-xs text-stone-500">
                {isEditing ? 'Update profile and system access credentials.' : 'Add a new employee to your restaurant roster.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Marcus Aurelius"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@restaurant.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">System Role</label>
              <select
                value={role.toUpperCase()}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-black text-stone-900 focus:outline-none focus:border-amber-500 uppercase"
              >
                <option value="OWNER">OWNER</option>
                <option value="MANAGER">MANAGER</option>
                <option value="KITCHEN">KITCHEN</option>
                <option value="WAITER">WAITER</option>
                <option value="CASHIER">CASHIER</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Account Status</label>
              <select
                value={status.toUpperCase()}
                onChange={(e) => setStatus(e.target.value as StaffStatus)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-black text-stone-900 focus:outline-none focus:border-amber-500 uppercase"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="ON_LEAVE">ON LEAVE</option>
              </select>
            </div>
          </div>

          {!isEditing && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Initial Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set initial login password"
                  required={!isEditing}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-stone-200 flex justify-end gap-2">
            <Button type="button" onClick={onClose} variant="secondary" className="py-2.5 text-xs font-bold">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="py-2.5 px-5 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950"
            >
              {isEditing ? 'Save Staff Changes' : 'Create Staff Member'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
