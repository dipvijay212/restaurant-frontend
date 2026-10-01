import { RestaurantConfig } from '../types/restaurant';

export const initialRestaurantData: RestaurantConfig = {
  id: "rest-001",
  name: "Demo Restaurant",
  tagline: "Artisanal Dining & Modern Culinary Experience",
  description: "Welcome to Demo Restaurant, where traditional flavors meet modern presentation. Enjoy hand-picked organic ingredients, artisanal wood-fired pizzas, handcrafted pastas, and signature craft cocktails in a warm, welcoming setting.",
  logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80",
  coverImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80",
  address: "742 Evergreen Terrace",
  city: "San Francisco, CA",
  postalCode: "94107",
  phone: "+1 (415) 890-1234",
  email: "contact@demorestaurant.com",
  website: "https://demorestaurant.com",
  openingHours: {
    mondayToFriday: "11:00 AM - 10:00 PM",
    saturdayToSunday: "10:00 AM - 11:00 PM",
  },
  currency: "USD",
  currencySymbol: "$",
  taxRate: 8.5,
  serviceChargeRate: 5.0,
  tableCount: 12,
};
