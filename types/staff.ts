export type StaffRole = 'manager' | 'waiter' | 'chef' | 'cashier';
export type StaffShiftStatus = 'on_duty' | 'off_duty' | 'on_break';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  email: string;
  phone: string;
  shiftStatus: StaffShiftStatus;
  avatarUrl: string;
  assignedTables?: number[];
  joinedDate: string;
}
