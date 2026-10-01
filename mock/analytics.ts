import { AnalyticsSummary } from '../types/analytics';

const bestSellers = [
  { id: 'prod-04', name: 'Prime Ribeye Steak (12oz)', category: 'Chef Mains', quantitySold: 54, revenue: 2376.00, price: 44.00, totalQuantity: 54, totalRevenue: 2376.00 },
  { id: 'prod-07', name: 'Margherita D.O.P. Pizza', category: 'Wood-Fired Pizzas', quantitySold: 72, revenue: 1440.00, price: 20.00, totalQuantity: 72, totalRevenue: 1440.00 },
  { id: 'prod-01', name: 'Truffle & Burrata Crostini', category: 'Appetizers', quantitySold: 65, revenue: 1072.50, price: 16.50, totalQuantity: 65, totalRevenue: 1072.50 },
  { id: 'prod-10', name: 'Smoked Bourbon Old Fashioned', category: 'Craft Cocktails', quantitySold: 88, revenue: 1496.00, price: 17.00, totalQuantity: 88, totalRevenue: 1496.00 },
  { id: 'prod-02', name: 'Wild Mushroom Risotto', category: 'Chef Mains', quantitySold: 42, revenue: 1092.00, price: 26.00, totalQuantity: 42, totalRevenue: 1092.00 },
];

export const initialAnalyticsData: AnalyticsSummary = {
  // Overview
  totalRevenue: 14845.50,
  todayRevenue: 2845.00,
  revenueGrowth: 14.8,
  totalOrders: 248,
  todayOrders: 48,
  ordersGrowth: 9.2,
  averageOrderValue: 59.86,
  averagePrepTimeMinutes: 13.8,
  averageTableTimeMinutes: 44.2,
  cancelledOrdersCount: 6,
  cancelledOrdersPercentage: 2.4,

  // Operations
  averageOrderToKitchenMinutes: 1.8,
  averageOccupancyRatePercentage: 78.5,
  occupancyRate: 78.5,
  delayedOrdersCount: 8,
  delayedOrdersPercentage: 3.2,

  // Sales Data (Last 7 Days)
  dailySales: [
    { date: '2026-09-25', dayLabel: 'Fri', revenue: 1950.00, ordersCount: 32 },
    { date: '2026-09-26', dayLabel: 'Sat', revenue: 2680.50, ordersCount: 45 },
    { date: '2026-09-27', dayLabel: 'Sun', revenue: 2410.00, ordersCount: 40 },
    { date: '2026-09-28', dayLabel: 'Mon', revenue: 1420.00, ordersCount: 24 },
    { date: '2026-09-29', dayLabel: 'Tue', revenue: 1650.00, ordersCount: 28 },
    { date: '2026-09-30', dayLabel: 'Wed', revenue: 1890.00, ordersCount: 31 },
    { date: '2026-10-01', dayLabel: 'Thu', revenue: 2845.00, ordersCount: 48 },
  ],

  // Hourly Sales Volume (11:00 - 22:00)
  hourlySales: [
    { hour: '11:00 AM', revenue: 280.00, ordersCount: 5 },
    { hour: '12:00 PM', revenue: 640.50, ordersCount: 11 },
    { hour: '01:00 PM', revenue: 980.00, ordersCount: 16 },
    { hour: '02:00 PM', revenue: 520.00, ordersCount: 9 },
    { hour: '03:00 PM', revenue: 310.00, ordersCount: 5 },
    { hour: '04:00 PM', revenue: 290.00, ordersCount: 4 },
    { hour: '05:00 PM', revenue: 480.00, ordersCount: 8 },
    { hour: '06:00 PM', revenue: 890.00, ordersCount: 14 },
    { hour: '07:00 PM', revenue: 1250.00, ordersCount: 21 },
    { hour: '08:00 PM', revenue: 1420.00, ordersCount: 23 },
    { hour: '09:00 PM', revenue: 950.00, ordersCount: 15 },
    { hour: '10:00 PM', revenue: 420.00, ordersCount: 7 },
  ],

  // Category Sales Performance
  categorySales: [
    { categoryName: 'Chef Signature Mains', revenue: 5850.00, ordersCount: 112, percentage: 39.4 },
    { categoryName: 'Wood-Fired Pizzas', revenue: 4067.00, ordersCount: 98, percentage: 27.4 },
    { categoryName: 'Craft Cocktails & Beverages', revenue: 2553.00, ordersCount: 145, percentage: 17.2 },
    { categoryName: 'Appetizers & Starters', revenue: 1647.00, ordersCount: 84, percentage: 11.1 },
    { categoryName: 'Decadent Desserts', revenue: 728.50, ordersCount: 42, percentage: 4.9 },
  ],

  // Products Data
  bestSellingProducts: bestSellers,
  popularItems: bestSellers,

  lowSellingProducts: [
    { id: 'prod-18', name: 'Steamed Edamame Bowl', category: 'Appetizers', quantitySold: 4, revenue: 28.00, price: 7.00, totalQuantity: 4, totalRevenue: 28.00 },
    { id: 'prod-22', name: 'Sparkling Mineral Water (Small)', category: 'Beverages', quantitySold: 6, revenue: 24.00, price: 4.00, totalQuantity: 6, totalRevenue: 24.00 },
    { id: 'prod-15', name: 'Vegan Cauliflower Wings', category: 'Appetizers', quantitySold: 7, revenue: 84.00, price: 12.00, totalQuantity: 7, totalRevenue: 84.00 },
    { id: 'prod-29', name: 'Artisan Herbal Tea Blend', category: 'Beverages', quantitySold: 8, revenue: 40.00, price: 5.00, totalQuantity: 8, totalRevenue: 40.00 },
  ],

  // Tables Performance Ranking
  tablePerformance: [
    { tableNumber: 1, sessionCount: 42, averageDurationMinutes: 48.5, totalRevenue: 2840.00, occupancyRate: 85.2 },
    { tableNumber: 5, sessionCount: 38, averageDurationMinutes: 42.0, totalRevenue: 2450.50, occupancyRate: 78.4 },
    { tableNumber: 3, sessionCount: 35, averageDurationMinutes: 45.0, totalRevenue: 2180.00, occupancyRate: 74.0 },
    { tableNumber: 10, sessionCount: 32, averageDurationMinutes: 52.0, totalRevenue: 2620.00, occupancyRate: 82.1 },
    { tableNumber: 8, sessionCount: 28, averageDurationMinutes: 38.5, totalRevenue: 1740.00, occupancyRate: 68.5 },
    { tableNumber: 2, sessionCount: 26, averageDurationMinutes: 41.0, totalRevenue: 1520.00, occupancyRate: 64.2 },
    { tableNumber: 4, sessionCount: 24, averageDurationMinutes: 36.0, totalRevenue: 1495.00, occupancyRate: 62.0 },
  ],
};
