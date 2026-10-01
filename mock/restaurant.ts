import { RestaurantConfig } from '../types/restaurant';

export const initialRestaurantData: RestaurantConfig = {
  id: "rest-001",
  name: "Demo Restaurant",
  tagline: "Artisanal Dining & Modern Culinary Experience",
  description: "Welcome to Demo Restaurant, where traditional flavors meet modern presentation. Enjoy hand-picked organic ingredients, artisanal wood-fired pizzas, handcrafted pastas, and signature craft cocktails in a warm, welcoming setting.",
  logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80",
  coverImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80",
  address: "742 Evergreen Terrace",
  city: "San Francisco, CA",
  postalCode: "94107",
  phone: "+1 (415) 890-1234",
  email: "contact@demorestaurant.com",
  website: "https://demorestaurant.com",
  openingHours: {
    mondayToFriday: "11:00 AM - 10:00 PM",
    saturdayToSunday: "10:00 AM - 11:00 PM",
    schedule: [
      { day: 'Monday', openTime: '11:00', closeTime: '22:00', isClosed: false },
      { day: 'Tuesday', openTime: '11:00', closeTime: '22:00', isClosed: false },
      { day: 'Wednesday', openTime: '11:00', closeTime: '22:00', isClosed: false },
      { day: 'Thursday', openTime: '11:00', closeTime: '22:00', isClosed: false },
      { day: 'Friday', openTime: '11:00', closeTime: '23:00', isClosed: false },
      { day: 'Saturday', openTime: '10:00', closeTime: '23:00', isClosed: false },
      { day: 'Sunday', openTime: '10:00', closeTime: '22:00', isClosed: false },
    ],
  },
  currency: "USD",
  currencySymbol: "$",
  taxRate: 8.5,
  serviceChargeRate: 5.0,
  tableCount: 12,

  tax: {
    taxRate: 8.5,
    serviceChargeRate: 5.0,
    gstin: "27AAAAA0000A1Z5",
    taxInclusive: false,
  },

  orderSettings: {
    autoAcceptOrders: false,
    cancellationRules: "Orders can be cancelled within 3 minutes of placement while in PENDING status.",
    cancellationWindowMinutes: 3,
    preparationWarningThresholdMins: 15,
    delayedOrderThresholdMins: 25,
  },

  paymentSettings: {
    payAtCounterEnabled: true,
    onlinePaymentEnabled: true,
  },

  notificationSettings: {
    customerNotifications: true,
    kitchenSound: true,
    staffNotifications: true,
  },

  qrSettings: {
    qrActive: true,
    lastRegeneratedAt: new Date().toISOString(),
    qrSecretToken: "qr_token_sec_892347891234",
  },
};

