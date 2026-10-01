import { initialTablesData } from '../../mock/tables';
import { initialRestaurantData } from '../../mock/restaurant';
import { SessionTableInfo, SessionRestaurantInfo } from '../../types/customer';

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export interface QRResolutionResult {
  success: boolean;
  status: 'active' | 'inactive' | 'closed' | 'invalid_qr';
  errorReason?: string;
  table?: SessionTableInfo;
  restaurant?: SessionRestaurantInfo;
}

export const qrTokenApi = {
  resolveQRToken: async (token: string): Promise<QRResolutionResult> => {
    await delay();

    if (!token || typeof token !== 'string') {
      return {
        success: false,
        status: 'invalid_qr',
        errorReason: 'Invalid QR token provided.',
      };
    }

    const cleanToken = token.trim().toLowerCase();

    // Match patterns: "table-demo-12", "tbl-12", "table-12", "tbl-01", "12", "table-demo-1"
    let tableNumber: number | null = null;

    if (cleanToken.startsWith('table-demo-')) {
      const numStr = cleanToken.replace('table-demo-', '');
      tableNumber = parseInt(numStr, 10);
    } else if (cleanToken.startsWith('tbl-')) {
      const numStr = cleanToken.replace('tbl-', '');
      tableNumber = parseInt(numStr, 10);
    } else if (cleanToken.startsWith('table-')) {
      const numStr = cleanToken.replace('table-', '');
      tableNumber = parseInt(numStr, 10);
    } else if (!isNaN(parseInt(cleanToken, 10))) {
      tableNumber = parseInt(cleanToken, 10);
    }

    // Find table in mock data
    const foundTable = initialTablesData.find((t) => {
      if (tableNumber !== null && !isNaN(tableNumber)) {
        return t.tableNumber === tableNumber;
      }
      return t.id.toLowerCase() === cleanToken;
    });

    if (!foundTable) {
      return {
        success: false,
        status: 'invalid_qr',
        errorReason: 'This QR code is not registered with Demo Restaurant.',
      };
    }

    // Check inactive table state (e.g. if table is undergoing maintenance or inactive)
    const isTableActive = foundTable.status !== 'reserved' && foundTable.status !== 'needs-cleaning';
    
    // Build restaurant info
    const restaurantInfo: SessionRestaurantInfo = {
      id: initialRestaurantData.id,
      name: initialRestaurantData.name,
      tagline: initialRestaurantData.tagline,
      logo: initialRestaurantData.logo,
      coverImage: initialRestaurantData.coverImage,
      currencySymbol: initialRestaurantData.currencySymbol,
      taxRate: initialRestaurantData.taxRate,
      serviceChargeRate: initialRestaurantData.serviceChargeRate,
      isOpen: true, // Mock open state
    };

    if (!restaurantInfo.isOpen) {
      return {
        success: false,
        status: 'closed',
        errorReason: 'Demo Restaurant is currently closed. Opening hours: ' + initialRestaurantData.openingHours.mondayToFriday,
        restaurant: restaurantInfo,
      };
    }

    const tableInfo: SessionTableInfo = {
      id: foundTable.id,
      tableNumber: foundTable.tableNumber,
      area: foundTable.area,
      capacity: foundTable.capacity,
      token: token,
      isActive: isTableActive,
    };

    if (!isTableActive) {
      return {
        success: false,
        status: 'inactive',
        errorReason: `Table ${foundTable.tableNumber} is currently unavailable (${foundTable.status}).`,
        table: tableInfo,
        restaurant: restaurantInfo,
      };
    }

    return {
      success: true,
      status: 'active',
      table: tableInfo,
      restaurant: restaurantInfo,
    };
  },
};
