export type DietaryTag = 'vegan' | 'vegetarian' | 'gluten-free' | 'chef-special' | 'spicy' | 'contains-nuts';

export interface ProductVariant {
  id: string;
  name: string;
  priceModifier: number; // e.g. 0 for Regular, 40 for Medium, 80 for Large
  isAvailable: boolean;
}

export interface ProductVariantGroup {
  id: string;
  name: string;
  required: boolean;
  variants: ProductVariant[];
}

export interface ProductAddon {
  id: string;
  name: string;
  price: number; // e.g. 40 for Extra Cheese, 60 for Extra Paneer
  isAvailable: boolean;
}

export interface ProductAddonGroup {
  id: string;
  name: string;
  required: boolean;
  maxSelections?: number;
  addons: ProductAddon[];
}

// Legacy alias for compatibility
export interface ProductOption {
  id: string;
  name: string;
  priceModifier: number;
  isAvailable: boolean;
}

export interface ProductOptionGroup {
  id: string;
  name: string;
  required: boolean;
  minSelections?: number;
  maxSelections?: number;
  options: ProductOption[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  iconName: string;
  displayOrder: number;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  foodType?: 'veg' | 'non-veg' | 'egg';
  isAvailable: boolean;
  isActive?: boolean;
  preparationTimeMinutes: number;
  calories?: number;
  dietaryTags: DietaryTag[];
  variantGroups?: ProductVariantGroup[];
  addonGroups?: ProductAddonGroup[];
  optionGroups?: ProductOptionGroup[];
  createdAt: string;
  updatedAt: string;
}
