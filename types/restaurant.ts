export interface DaySchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  openTime: string; // e.g. "10:00"
  closeTime: string; // e.g. "22:00"
  isClosed: boolean;
}

export interface OperatingHours {
  mondayToFriday: string;
  saturdayToSunday: string;
  schedule: DaySchedule[];
}

export interface TaxSettings {
  taxRate: number; // percentage, e.g. 5.0
  serviceChargeRate: number; // percentage, e.g. 2.5
  gstin: string; // GSTIN / Tax Registration Number
  taxInclusive: boolean; // prices include tax
}

export interface OrderSettings {
  autoAcceptOrders: boolean; // order acceptance: auto or manual
  cancellationRules: string; // policy text for cancellation
  cancellationWindowMinutes: number; // grace time in mins before prep
  preparationWarningThresholdMins: number; // preparation warning threshold in mins
  delayedOrderThresholdMins: number; // delayed order threshold in mins
}

export interface PaymentSettings {
  payAtCounterEnabled: boolean; // pay at counter toggle
  onlinePaymentEnabled: boolean; // online payment toggle
}

export interface NotificationSettings {
  customerNotifications: boolean; // customer SMS/Email alerts
  kitchenSound: boolean; // kitchen audio chime on new orders
  staffNotifications: boolean; // staff app push notifications
}

export interface QRSettings {
  qrActive: boolean; // QR system active status
  lastRegeneratedAt: string; // timestamp of last QR regeneration
  qrSecretToken: string; // secret token for table QR hashing
}

export interface RestaurantConfig {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logo: string;
  coverImage: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  openingHours: OperatingHours;
  currency: string;
  currencySymbol: string;
  taxRate: number; // percentage, e.g. 8.5
  serviceChargeRate: number; // percentage, e.g. 5.0
  tableCount: number;

  tax: TaxSettings;
  orderSettings: OrderSettings;
  paymentSettings: PaymentSettings;
  notificationSettings: NotificationSettings;
  qrSettings: QRSettings;
}

