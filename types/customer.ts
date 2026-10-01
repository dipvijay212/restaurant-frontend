export interface SessionTableInfo {
  id: string;
  tableNumber: number;
  area: string;
  capacity: number;
  token: string;
  isActive: boolean;
}

export interface SessionRestaurantInfo {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  coverImage: string;
  currencySymbol: string;
  taxRate: number;
  serviceChargeRate: number;
  isOpen: boolean;
}

export type CustomerSessionStatus = 'active' | 'inactive' | 'closed' | 'invalid_qr';

export interface CustomerSession {
  sessionId: string | null;
  table: SessionTableInfo | null;
  restaurant: SessionRestaurantInfo | null;
  sessionStatus: CustomerSessionStatus | null;
  customerName: string;
  phone?: string;
  guestCount: number;
  sessionStartTime: string | null;
  currentOrderId: string | null;
  isAuthenticated: boolean;
}

export interface CustomerFeedback {
  id: string;
  orderId?: string;
  tableId?: string;
  customerName: string;
  rating: number; // 1 to 5
  foodRating: number;
  serviceRating: number;
  ambienceRating: number;
  comments: string;
  createdAt: string;
}
