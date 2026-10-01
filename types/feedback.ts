export interface CustomerFeedback {
  id: string;
  tableId: string;
  tableNumber: number;
  sessionId: string;
  customerName?: string;
  foodRating: number; // 1-5
  serviceRating: number; // 1-5
  orderingRating: number; // 1-5
  overallRating: number; // 1-5
  comments?: string;
  createdAt: string;
}
