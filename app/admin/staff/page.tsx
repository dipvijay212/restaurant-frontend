'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { staffApi } from '../../../lib/api/staff';
import { StaffMember } from '../../../types/staff';
import { Button } from '../../../components/ui/Button';
import { UserPlus } from 'lucide-react';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getStaffMembers();
      setStaff(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleShiftChange = async (id: string, status: any) => {
    await staffApi.updateShiftStatus(id, status);
    fetchStaff();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff & Employee Management"
        subtitle="Roster, roles, table assignments, and duty status."
        action={
          <Button variant="primary" size="sm">
            <UserPlus className="w-4 h-4 mr-1" /> Add Staff Member
          </Button>
        }
      />

      {loading ? (
        <LoadingSpinner label="Loading staff roster..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex items-center gap-4">
              <img src={s.avatarUrl} alt={s.name} className="w-14 h-14 rounded-2xl object-cover bg-stone-100" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-stone-900 text-sm truncate">{s.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase bg-stone-100 text-stone-700">
                    {s.role}
                  </span>
                </div>
                <span className="text-xs text-stone-500 block">{s.phone}</span>

                <div className="mt-3 flex items-center justify-between">
                  <select
                    value={s.shiftStatus}
                    onChange={(e) => handleShiftChange(s.id, e.target.value)}
                    className="px-2 py-1 text-xs bg-stone-50 border border-stone-200 rounded-lg font-semibold"
                  >
                    <option value="on_duty">On Duty</option>
                    <option value="on_break">On Break</option>
                    <option value="off_duty">Off Duty</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
