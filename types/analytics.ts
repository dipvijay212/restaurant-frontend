export interface HourlySales {
  hour: string;
  revenue: number;
  ordersCount: number;
}

export interface CategorySales {
  categoryName: string;
  revenue: number;
  percentage: number;
}

export interface PopularItem {
  id: string;
  name: string;
  category: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface AnalyticsSummary {
  todayRevenue: number;
  revenueGrowth: number;
  todayOrders: number;
  ordersGrowth: number;
  activeTablesCount: number;
  occupancyRate: number;
  averageOrderValue: number;
  averagePrepTimeMinutes: number;
  hourlySales: HourlySales[];
  categorySales: CategorySales[];
  popularItems: PopularItem[];
}
