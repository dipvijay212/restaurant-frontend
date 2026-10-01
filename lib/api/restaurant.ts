import { initialRestaurantData } from '../../mock/restaurant';
import { RestaurantConfig } from '../../types/restaurant';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

let restaurantState: RestaurantConfig = { ...initialRestaurantData };

export const restaurantApi = {
  getRestaurantInfo: async (): Promise<RestaurantConfig> => {
    await delay();
    return JSON.parse(JSON.stringify(restaurantState));
  },

  updateRestaurantInfo: async (updates: Partial<RestaurantConfig>): Promise<RestaurantConfig> => {
    await delay();
    restaurantState = {
      ...restaurantState,
      ...updates,
      tax: updates.tax ? { ...restaurantState.tax, ...updates.tax } : restaurantState.tax,
      orderSettings: updates.orderSettings ? { ...restaurantState.orderSettings, ...updates.orderSettings } : restaurantState.orderSettings,
      paymentSettings: updates.paymentSettings ? { ...restaurantState.paymentSettings, ...updates.paymentSettings } : restaurantState.paymentSettings,
      notificationSettings: updates.notificationSettings ? { ...restaurantState.notificationSettings, ...updates.notificationSettings } : restaurantState.notificationSettings,
      qrSettings: updates.qrSettings ? { ...restaurantState.qrSettings, ...updates.qrSettings } : restaurantState.qrSettings,
    };
    // Sync top level tax properties for backwards compatibility
    if (updates.tax) {
      restaurantState.taxRate = updates.tax.taxRate;
      restaurantState.serviceChargeRate = updates.tax.serviceChargeRate;
    }
    return JSON.parse(JSON.stringify(restaurantState));
  },

  regenerateQRCodes: async (): Promise<{ success: boolean; newToken: string; regeneratedAt: string }> => {
    await delay(300);
    const newToken = `qr_token_sec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const regeneratedAt = new Date().toISOString();
    restaurantState.qrSettings = {
      ...restaurantState.qrSettings,
      qrSecretToken: newToken,
      lastRegeneratedAt: regeneratedAt,
    };
    return {
      success: true,
      newToken,
      regeneratedAt,
    };
  },
};

