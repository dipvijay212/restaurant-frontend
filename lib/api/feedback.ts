import { CustomerFeedback } from '../../types/feedback';

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

let feedbackState: CustomerFeedback[] = [
  {
    id: 'fb-101',
    tableId: 'tbl-05',
    tableNumber: 5,
    sessionId: 'sess-prev-05',
    customerName: 'Alex Rivera',
    foodRating: 5,
    serviceRating: 4,
    orderingRating: 5,
    overallRating: 4.7,
    comments: 'The truffle risotto was exquisite! Quick QR ordering experience.',
    createdAt: '2026-10-01T14:30:00Z',
  },
];

export const feedbackApi = {
  getFeedbackForSession: async (sessionId: string): Promise<CustomerFeedback | null> => {
    await delay();
    const fb = feedbackState.find((f) => f.sessionId === sessionId);
    return fb ? { ...fb } : null;
  },

  getAllFeedback: async (): Promise<CustomerFeedback[]> => {
    await delay();
    return [...feedbackState];
  },

  submitFeedback: async (
    data: Omit<CustomerFeedback, 'id' | 'createdAt' | 'overallRating'>
  ): Promise<CustomerFeedback> => {
    await delay();

    // Check for duplicate feedback in the same session
    const existing = feedbackState.find((f) => f.sessionId === data.sessionId);
    if (existing) {
      throw new Error('Feedback has already been submitted for this dining session.');
    }

    const overallRating = Number(
      ((data.foodRating + data.serviceRating + data.orderingRating) / 3).toFixed(1)
    );

    const newFeedback: CustomerFeedback = {
      ...data,
      id: `fb-${Date.now()}`,
      overallRating,
      createdAt: new Date().toISOString(),
    };

    feedbackState.unshift(newFeedback);
    return newFeedback;
  },
};
