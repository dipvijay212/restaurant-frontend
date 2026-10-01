'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { staffApi } from '../../../lib/api/staff';
import { StaffMember, StaffRole, StaffStatus } from '../../../types/staff';
import { Button } from '../../../components/ui/Button';
import { Toast } from '../../../components/ui/Toast';
import { StaffFormModal } from '../../../components/admin/StaffFormModal';
import { ResetPasswordModal } from '../../../components/admin/ResetPasswordModal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  KeyRound,
  Edit2,
  Power,
  CheckCircle2,
  Crown,
  ChefHat,
  Receipt,
  Clock,
  Mail,
  Phone,
  RefreshCw,
} from 'lucide-react';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<StaffMember | null>(null);
  const [selectedStaffForReset, setSelectedStaffForReset] = useState<StaffMember | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string } | null>(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getStaffMembers();
      setStaff(data);
    } catch (err) {
      console.error('Failed to fetch staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Handlers
  const handleCreateStaff = () => {
    setSelectedStaffForEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditStaff = (member: StaffMember) => {
    setSelectedStaffForEdit(member);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    if (selectedStaffForEdit) {
      const updated = await staffApi.updateStaffMember(selectedStaffForEdit.id, formData);
      setStaff((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setToastMessage({ title: 'Staff Updated', message: `Updated profile for ${updated.name}` });
    } else {
      const created = await staffApi.createStaffMember(formData);
      setStaff((prev) => [created, ...prev]);
      setToastMessage({ title: 'Staff Created', message: `Added ${created.name} (${created.role}) to staff roster.` });
    }
  };

  const handleToggleStatus = async (member: StaffMember) => {
    const nextStatus: StaffStatus = member.status.toUpperCase() === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated = await staffApi.toggleStaffStatus(member.id, nextStatus);
    setStaff((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setToastMessage({
      title: 'Status Updated',
      message: `${updated.name} set to ${nextStatus}`,
    });
  };

  const handleRoleChange = async (member: StaffMember, newRole: StaffRole) => {
    const updated = await staffApi.updateStaffMember(member.id, { role: newRole });
    setStaff((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setToastMessage({ title: 'Role Updated', message: `${updated.name} role changed to ${newRole.toUpperCase()}` });
  };

  // Role Badge Styling Helper
  const getRoleBadge = (roleStr: string) => {
    const r = roleStr.toUpperCase();
    switch (r) {
      case 'OWNER':
        return {
          label: 'OWNER',
          bg: 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/30',
          icon: Crown,
        };
      case 'MANAGER':
        return { label: 'MANAGER', bg: 'bg-blue-100 text-blue-900 border-blue-300', icon: Shield };
      case 'KITCHEN':
      case 'CHEF':
        return { label: 'KITCHEN', bg: 'bg-orange-100 text-orange-900 border-orange-300', icon: ChefHat };
      case 'WAITER':
        return { label: 'WAITER', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: Users };
      case 'CASHIER':
        return { label: 'CASHIER', bg: 'bg-purple-100 text-purple-900 border-purple-300', icon: Receipt };
      default:
        return { label: r, bg: 'bg-stone-100 text-stone-700 border-stone-300', icon: Shield };
    }
  };

  // Filter Logic
  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q);

      if (!matchSearch) return false;

      // Role Filter
      if (roleFilter !== 'all') {
        if (s.role.toUpperCase() !== roleFilter.toUpperCase()) return false;
      }

      // Status Filter
      if (statusFilter !== 'all') {
        if (s.status.toUpperCase() !== statusFilter.toUpperCase()) return false;
      }

      return true;
    });
  }, [staff, searchQuery, roleFilter, statusFilter]);

  // Statistics
  const totalCount = staff.length;
  const activeCount = staff.filter((s) => s.status.toUpperCase() === 'ACTIVE').length;
  const ownerCount = staff.filter((s) => s.role.toUpperCase() === 'OWNER').length;
  const managerCount = staff.filter((s) => s.role.toUpperCase() === 'MANAGER').length;
  const kitchenCount = staff.filter((s) => ['KITCHEN', 'CHEF'].includes(s.role.toUpperCase())).length;
  const waiterCount = staff.filter((s) => s.role.toUpperCase() === 'WAITER').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-sm">
          <Toast
            type="info"
            title={toastMessage.title}
            message={toastMessage.message}
            onClose={() => setToastMessage(null)}
          />
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" /> Staff & Employee Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Employee roster, role permissions, account activation, and password resets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleCreateStaff}
            variant="primary"
            className="py-2.5 px-4 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="w-4 h-4" /> Add Staff Member
          </Button>

          <button
            onClick={fetchStaff}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
            title="Refresh Staff Roster"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Role Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-stone-400 text-xs font-bold block">Total Staff</span>
          <span className="text-2xl font-black text-stone-900">{totalCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-stone-400 text-xs font-bold block">Active Staff</span>
          <span className="text-2xl font-black text-emerald-600">{activeCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-stone-400 text-xs font-bold block">Managers</span>
          <span className="text-2xl font-black text-blue-600">{managerCount + ownerCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-stone-400 text-xs font-bold block">Kitchen Chefs</span>
          <span className="text-2xl font-black text-orange-600">{kitchenCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-stone-400 text-xs font-bold block">Waitstaff & Cashiers</span>
          <span className="text-2xl font-black text-amber-600">{waiterCount}</span>
        </div>
      </div>

      {/* Controls & Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Staff Name, Email, Phone, or Role..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            {['all', 'ACTIVE', 'INACTIVE', 'ON_LEAVE'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-xl text-xs font-black uppercase transition-all ${
                  statusFilter.toUpperCase() === st
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-stone-100 overflow-x-auto">
          <span className="text-xs font-bold text-stone-400 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Role:
          </span>
          {['all', 'OWNER', 'MANAGER', 'KITCHEN', 'WAITER', 'CASHIER'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-xl text-xs font-black uppercase transition-all ${
                roleFilter.toUpperCase() === r
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Staff List Table View */}
      {loading ? (
        <LoadingSpinner label="Loading staff roster..." />
      ) : filteredStaff.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-stone-500 border border-stone-200 shadow-sm">
          <Users className="w-12 h-12 mx-auto mb-3 text-stone-400" />
          <h3 className="font-bold text-stone-900 text-lg">No Staff Members Found</h3>
          <p className="text-xs text-stone-500">No staff members matching current filter criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 text-[11px] font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Last Active</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs font-medium text-stone-800">
                {filteredStaff.map((member) => {
                  const roleMeta = getRoleBadge(member.role);
                  const RoleIcon = roleMeta.icon;
                  const isActive = member.status.toUpperCase() === 'ACTIVE';

                  return (
                    <tr key={member.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4 font-bold text-stone-900">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              member.avatarUrl ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                            }
                            alt={member.name}
                            className="w-9 h-9 rounded-xl object-cover border border-stone-200 bg-stone-100"
                          />
                          <div>
                            <span className="font-extrabold text-stone-900 block">{member.name}</span>
                            <span className="text-[10px] text-stone-400 block font-mono">ID: {member.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-semibold text-stone-700">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-stone-400" />
                          {member.email}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 font-semibold text-stone-700">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          {member.phone}
                        </span>
                      </td>

                      {/* Role Selector & Badge */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase border tracking-wider flex items-center gap-1 ${roleMeta.bg}`}
                          >
                            <RoleIcon className="w-3 h-3" />
                            {roleMeta.label}
                          </span>

                          <select
                            value={member.role.toUpperCase()}
                            onChange={(e) => handleRoleChange(member, e.target.value as StaffRole)}
                            className="px-2 py-0.5 bg-stone-50 border border-stone-200 rounded-lg text-[10px] font-bold text-stone-700 hover:border-stone-400 cursor-pointer"
                            title="Reassign Role"
                          >
                            <option value="OWNER">OWNER</option>
                            <option value="MANAGER">MANAGER</option>
                            <option value="KITCHEN">KITCHEN</option>
                            <option value="WAITER">WAITER</option>
                            <option value="CASHIER">CASHIER</option>
                          </select>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg uppercase tracking-wider border ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : member.status.toUpperCase() === 'ON_LEAVE'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-stone-100 text-stone-600 border-stone-300'
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 px-4 text-[11px] text-stone-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {member.lastActive || 'Recently'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Action */}
                          <button
                            onClick={() => handleEditStaff(member)}
                            className="p-1.5 text-stone-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit Staff Member"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Reset Password UI */}
                          <button
                            onClick={() => setSelectedStaffForReset(member)}
                            className="p-1.5 text-stone-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Reset Password UI"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Deactivate / Activate Status Toggle */}
                          <button
                            onClick={() => handleToggleStatus(member)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isActive
                                ? 'text-stone-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={isActive ? 'Deactivate Staff Account' : 'Activate Staff Account'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff Form Modal (Create / Edit) */}
      <StaffFormModal
        staff={selectedStaffForEdit}
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedStaffForEdit(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* Password Reset Modal */}
      <ResetPasswordModal
        staff={selectedStaffForReset}
        isOpen={!!selectedStaffForReset}
        onClose={() => setSelectedStaffForReset(null)}
        onSuccess={(msg) => setToastMessage({ title: 'Password Reset', message: msg })}
      />
    </div>
  );
}
