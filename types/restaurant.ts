export interface OperatingHours {
  mondayToFriday: string;
  saturdayToSunday: string;
}

export interface RestaurantConfig {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logo: string;
  coverImage: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  openingHours: OperatingHours;
  currency: string;
  currencySymbol: string;
  taxRate: number; // percentage, e.g. 8.5
  serviceChargeRate: number; // percentage, e.g. 5.0
  tableCount: number;
}
