import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MenuItem, ProductVariant, ProductAddon } from '../../types/menu';

export interface CartVariantInfo {
  groupId: string;
  groupName: string;
  variant: ProductVariant;
}

export interface CartAddonInfo {
  groupId: string;
  groupName: string;
  addon: ProductAddon;
}

export interface CartItem {
  id: string; // Unique cart item signature hash
  productId: string;
  productName: string;
  menuItem: MenuItem;
  quantity: number;
  selectedVariant?: CartVariantInfo;
  selectedAddons: CartAddonInfo[];
  unitPrice: number;
  itemTotal: number;
  specialInstructions: string;
}

interface CartState {
  items: CartItem[];
  tableId: string | null;
  tableNumber: number | null;
  specialNotes: string;
}

const initialState: CartState = {
  items: [],
  tableId: null,
  tableNumber: null,
  specialNotes: '',
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartTable: (state, action: PayloadAction<{ tableId: string | null; tableNumber: number | null }>) => {
      state.tableId = action.payload.tableId;
      state.tableNumber = action.payload.tableNumber;
    },
    
    addToCartCustomized: (
      state,
      action: PayloadAction<{
        menuItem: MenuItem;
        quantity: number;
        selectedVariant?: CartVariantInfo;
        selectedAddons?: CartAddonInfo[];
        specialInstructions?: string;
      }>
    ) => {
      const { menuItem, quantity, selectedVariant, selectedAddons = [], specialInstructions = '' } = action.payload;

      // 1. Calculate Unit Price: Base Price + Variant Modifier + Sum(Add-ons)
      const variantCost = selectedVariant ? selectedVariant.variant.priceModifier : 0;
      const addonsCost = selectedAddons.reduce((acc, a) => acc + a.addon.price, 0);
      const unitPrice = menuItem.price + variantCost + addonsCost;

      // 2. Generate unique cart item ID signature
      const variantKey = selectedVariant ? `${selectedVariant.groupId}:${selectedVariant.variant.id}` : 'no-var';
      const addonsKey = selectedAddons.map((a) => `${a.groupId}:${a.addon.id}`).sort().join(',');
      const instructionsKey = specialInstructions.trim().toLowerCase();

      const cartItemId = `${menuItem.id}__var[${variantKey}]__add[${addonsKey}]__notes[${instructionsKey}]`;

      // 3. Prevent duplicate entries by checking if exact configuration already exists
      const existingIndex = state.items.findIndex((item) => item.id === cartItemId);

      if (existingIndex > -1) {
        state.items[existingIndex].quantity += quantity;
        state.items[existingIndex].itemTotal = state.items[existingIndex].quantity * unitPrice;
      } else {
        state.items.push({
          id: cartItemId,
          productId: menuItem.id,
          productName: menuItem.name,
          menuItem,
          quantity,
          selectedVariant,
          selectedAddons,
          unitPrice,
          itemTotal: quantity * unitPrice,
          specialInstructions: specialInstructions.trim(),
        });
      }
    },

    // Legacy quick add handler
    addToCart: (
      state,
      action: PayloadAction<{
        menuItem: MenuItem;
        quantity: number;
        specialInstructions?: string;
      }>
    ) => {
      const { menuItem, quantity, specialInstructions = '' } = action.payload;
      const unitPrice = menuItem.price;
      const cartItemId = `${menuItem.id}__var[no-var]__add[]__notes[${specialInstructions.trim().toLowerCase()}]`;

      const existingIndex = state.items.findIndex((item) => item.id === cartItemId);

      if (existingIndex > -1) {
        state.items[existingIndex].quantity += quantity;
        state.items[existingIndex].itemTotal = state.items[existingIndex].quantity * unitPrice;
      } else {
        state.items.push({
          id: cartItemId,
          productId: menuItem.id,
          productName: menuItem.name,
          menuItem,
          quantity,
          selectedAddons: [],
          unitPrice,
          itemTotal: quantity * unitPrice,
          specialInstructions: specialInstructions.trim(),
        });
      }
    },

    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const index = state.items.findIndex((item) => item.id === id);
      if (index > -1) {
        if (quantity <= 0) {
          state.items.splice(index, 1);
        } else {
          const item = state.items[index];
          item.quantity = quantity;
          item.itemTotal = quantity * item.unitPrice;
        }
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    setSpecialNotes: (state, action: PayloadAction<string>) => {
      state.specialNotes = action.payload;
    },

    clearCart: (state) => {
      state.items = [];
      state.specialNotes = '';
    },
  },
});

export const {
  setCartTable,
  addToCartCustomized,
  addToCart,
  updateQuantity,
  removeFromCart,
  setSpecialNotes,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
