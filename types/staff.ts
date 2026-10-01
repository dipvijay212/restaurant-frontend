export type StaffRole =
  | 'OWNER'
  | 'MANAGER'
  | 'KITCHEN'
  | 'WAITER'
  | 'CASHIER'
  | 'owner'
  | 'manager'
  | 'kitchen'
  | 'waiter'
  | 'cashier'
  | 'chef';

export type StaffStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'ON_LEAVE'
  | 'ON_DUTY'
  | 'active'
  | 'inactive'
  | 'on_leave'
  | 'on_duty';

export type StaffShiftStatus = 'on_duty' | 'off_duty' | 'on_break';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  email: string;
  phone: string;
  status: StaffStatus;
  shiftStatus?: StaffShiftStatus;
  avatarUrl?: string;
  assignedTables?: number[];
  joinedDate: string;
  lastActive: string;
  notes?: string;
}
