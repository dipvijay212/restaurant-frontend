import { initialStaffData } from '../../mock/staff';
import { StaffMember, StaffShiftStatus } from '../../types/staff';

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

  updateShiftStatus: async (id: string, shiftStatus: StaffShiftStatus): Promise<StaffMember> => {
    await delay();
    const index = staffState.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Staff member not found');

    staffState[index] = { ...staffState[index], shiftStatus };
    return { ...staffState[index] };
  },

  assignTables: async (id: string, tables: number[]): Promise<StaffMember> => {
    await delay();
    const index = staffState.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Staff member not found');

    staffState[index] = { ...staffState[index], assignedTables: tables };
    return { ...staffState[index] };
  },

  createStaffMember: async (staffData: Omit<StaffMember, 'id' | 'joinedDate'>): Promise<StaffMember> => {
    await delay();
    const newStaff: StaffMember = {
      ...staffData,
      id: `stf-${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    staffState.push(newStaff);
    return newStaff;
  },
};
