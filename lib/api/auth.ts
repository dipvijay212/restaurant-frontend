import { AuthenticatedStaff, AuthRole } from '../../store/slices/authSlice';

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

export interface MockStaffAccount {
  email: string;
  password: string;
  name: string;
  role: AuthRole;
  avatarUrl: string;
  phone: string;
}

export const MOCK_STAFF_ACCOUNTS: MockStaffAccount[] = [
  {
    email: 'owner@demorestaurant.com',
    password: 'owner123',
    name: 'Arthur Pendelton',
    role: 'OWNER',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    phone: '+1 (415) 555-0100',
  },
  {
    email: 'manager@demorestaurant.com',
    password: 'manager123',
    name: 'Marco Rossi',
    role: 'MANAGER',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    phone: '+1 (415) 555-9011',
  },
  {
    email: 'kitchen@demorestaurant.com',
    password: 'kitchen123',
    name: 'Giovanni Silva',
    role: 'KITCHEN',
    avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&auto=format&fit=crop&q=80',
    phone: '+1 (415) 555-9012',
  },
  {
    email: 'waiter@demorestaurant.com',
    password: 'waiter123',
    name: 'Emma Watson',
    role: 'WAITER',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    phone: '+1 (415) 555-9013',
  },
  {
    email: 'cashier@demorestaurant.com',
    password: 'cashier123',
    name: 'Jessica Alba',
    role: 'CASHIER',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    phone: '+1 (415) 555-9015',
  },
];

export const authApi = {
  login: async (email: string, password: string): Promise<AuthenticatedStaff> => {
    await delay();

    const normalizedEmail = email.trim().toLowerCase();
    const account = MOCK_STAFF_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === normalizedEmail && acc.password === password
    );

    if (!account) {
      throw new Error('Invalid email or password. Please check your credentials or click a quick demo role button.');
    }

    const authenticatedUser: AuthenticatedStaff = {
      id: `staff-${account.role.toLowerCase()}-${Date.now()}`,
      name: account.name,
      email: account.email,
      role: account.role,
      avatarUrl: account.avatarUrl,
      phone: account.phone,
      token: `mock-jwt-bearer-${account.role}-${Date.now()}`,
    };

    return authenticatedUser;
  },

  logout: async (): Promise<void> => {
    await delay(150);
  },
};
