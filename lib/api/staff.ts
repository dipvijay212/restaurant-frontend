import { initialStaffData } from '../../mock/staff';
import { StaffMember, StaffShiftStatus, StaffStatus, StaffRole } from '../../types/staff';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

let staffState: StaffMember[] = [...initialStaffData];

export const staffApi = {
  getStaffMembers: async (): Promise<StaffMember[]> => {
    await delay();
    return [...staffState];
  },

  getStaffById: async (id: string): Promise<StaffMember | null> => {
    await delay();
    const member = staffState.find((s) => s.id === id);
    return member ? { ...member } : null;
  },

  createStaffMember: async (
    staffData: Omit<StaffMember, 'id' | 'joinedDate' | 'lastActive'> & { password?: string }
  ): Promise<StaffMember> => {
    await delay();
    const newStaff: StaffMember = {
      id: `stf-${Date.now()}`,
      name: staffData.name,
      email: staffData.email,
      phone: staffData.phone,
      role: staffData.role,
      status: staffData.status || 'ACTIVE',
      shiftStatus: staffData.shiftStatus || 'on_duty',
      avatarUrl:
        staffData.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: 'Just now',
    };
    staffState.unshift(newStaff);
    return newStaff;
  },

  updateStaffMember: async (id: string, updates: Partial<StaffMember>): Promise<StaffMember> => {
    await delay();
    const index = staffState.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Staff member not found');

    const updated = {
      ...staffState[index],
      ...updates,
      lastActive: 'Just now',
    };
    staffState[index] = updated;
    return updated;
  },

  toggleStaffStatus: async (id: string, newStatus: StaffStatus): Promise<StaffMember> => {
    await delay();
    const index = staffState.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Staff member not found');

    const updated = {
      ...staffState[index],
      status: newStatus,
      shiftStatus: newStatus === 'INACTIVE' ? ('off_duty' as const) : staffState[index].shiftStatus,
      lastActive: 'Just now',
    };
    staffState[index] = updated;
    return updated;
  },

  resetStaffPassword: async (id: string, newPassword?: string): Promise<{ success: boolean; message: string }> => {
    await delay();
    const member = staffState.find((s) => s.id === id);
    if (!member) throw new Error('Staff member not found');

    return {
      success: true,
      message: `Password successfully updated for ${member.name} (${member.email}).`,
    };
  },

  updateShiftStatus: async (id: string, shiftStatus: StaffShiftStatus): Promise<StaffMember> => {
    await delay();
    const index = staffState.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Staff member not found');

    staffState[index] = { ...staffState[index], shiftStatus, lastActive: 'Just now' };
    return { ...staffState[index] };
  },

  assignTables: async (id: string, tables: number[]): Promise<StaffMember> => {
    await delay();
    const index = staffState.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Staff member not found');

    staffState[index] = { ...staffState[index], assignedTables: tables };
    return { ...staffState[index] };
  },
};
