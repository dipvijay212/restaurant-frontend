import { AnalyticsSummary } from '../types/analytics';

export const initialAnalyticsData: AnalyticsSummary = {
  todayRevenue: 2845.50,
  revenueGrowth: 14.2,
  todayOrders: 42,
  ordersGrowth: 8.5,
  activeTablesCount: 4,
  occupancyRate: 33.3,
  averageOrderValue: 67.75,
  averagePrepTimeMinutes: 14.5,
  hourlySales: [
    { hour: '11:00 AM', revenue: 180.00, ordersCount: 3 },
    { hour: '12:00 PM', revenue: 420.50, ordersCount: 7 },
    { hour: '01:00 PM', revenue: 650.00, ordersCount: 11 },
    { hour: '02:00 PM', revenue: 380.00, ordersCount: 6 },
    { hour: '03:00 PM', revenue: 210.00, ordersCount: 4 },
    { hour: '04:00 PM', revenue: 195.00, ordersCount: 3 },
    { hour: '05:00 PM', revenue: 310.00, ordersCount: 5 },
    { hour: '06:00 PM', revenue: 500.00, ordersCount: 8 },
  ],
  categorySales: [
    { categoryName: 'Chef Mains', revenue: 1120.00, percentage: 39.4 },
    { categoryName: 'Wood-Fired Pizzas', revenue: 780.00, percentage: 27.4 },
    { categoryName: 'Craft Cocktails', revenue: 490.00, percentage: 17.2 },
    { categoryName: 'Appetizers & Starters', revenue: 315.50, percentage: 11.1 },
    { categoryName: 'Decadent Desserts', revenue: 140.00, percentage: 4.9 },
  ],
  popularItems: [
    { id: 'prod-04', name: 'Prime Ribeye Steak (12oz)', category: 'Chef Mains', totalQuantity: 18, totalRevenue: 792.00 },
    { id: 'prod-07', name: 'Classic Margherita D.O.P.', category: 'Wood-Fired Pizzas', totalQuantity: 24, totalRevenue: 480.00 },
    { id: 'prod-01', name: 'Truffle & Burrata Crostini', category: 'Appetizers & Starters', totalQuantity: 15, totalRevenue: 247.50 },
    { id: 'prod-10', name: 'Smoked Bourbon Old Fashioned', category: 'Craft Cocktails', totalQuantity: 22, totalRevenue: 374.00 },
  ]
};
