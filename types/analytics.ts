export interface DailySalesData {
  date: string;
  dayLabel: string;
  revenue: number;
  ordersCount: number;
}

export interface HourlySalesData {
  hour: string;
  revenue: number;
  ordersCount: number;
}

export interface CategorySalesData {
  categoryName: string;
  revenue: number;
  ordersCount: number;
  percentage: number;
}

export interface ProductPerformance {
  id: string;
  name: string;
  category: string;
  quantitySold: number;
  revenue: number;
  price: number;
  totalRevenue?: number;
  totalQuantity?: number;
}

export interface TablePerformance {
  tableNumber: number;
  sessionCount: number;
  averageDurationMinutes: number;
  totalRevenue: number;
  occupancyRate: number;
}

export interface AnalyticsSummary {
  // Overview
  totalRevenue: number;
  todayRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  todayOrders: number;
  ordersGrowth: number;
  averageOrderValue: number;
  averagePrepTimeMinutes: number;
  averageTableTimeMinutes: number;
  cancelledOrdersCount: number;
  cancelledOrdersPercentage: number;

  // Operations
  averageOrderToKitchenMinutes: number;
  averageOccupancyRatePercentage: number;
  occupancyRate: number;
  delayedOrdersCount: number;
  delayedOrdersPercentage: number;

  // Sales Data
  dailySales: DailySalesData[];
  hourlySales: HourlySalesData[];
  categorySales: CategorySalesData[];

  // Products Data
  bestSellingProducts: ProductPerformance[];
  popularItems: ProductPerformance[];
  lowSellingProducts: ProductPerformance[];

  // Tables Data
  tablePerformance: TablePerformance[];
}
