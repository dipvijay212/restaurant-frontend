import { initialRestaurantData } from '../../mock/restaurant';
import { RestaurantConfig } from '../../types/restaurant';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

let restaurantState: RestaurantConfig = { ...initialRestaurantData };

export const restaurantApi = {
  getRestaurantInfo: async (): Promise<RestaurantConfig> => {
    await delay();
    return { ...restaurantState };
  },

  updateRestaurantInfo: async (updates: Partial<RestaurantConfig>): Promise<RestaurantConfig> => {
    await delay();
    restaurantState = { ...restaurantState, ...updates };
    return { ...restaurantState };
  },
};
