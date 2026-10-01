import { initialAnalyticsData } from '../../mock/analytics';
import { AnalyticsSummary } from '../../types/analytics';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const analyticsApi = {
  getAnalyticsSummary: async (): Promise<AnalyticsSummary> => {
    await delay();
    return { ...initialAnalyticsData };
  },
};
