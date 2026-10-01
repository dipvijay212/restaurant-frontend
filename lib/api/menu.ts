import { initialCategoriesData } from '../../mock/categories';
import { initialProductsData } from '../../mock/products';
import { Category, MenuItem } from '../../types/menu';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

let categoriesState: Category[] = [...initialCategoriesData];
let productsState: MenuItem[] = [...initialProductsData];

export const menuApi = {
  getCategories: async (): Promise<Category[]> => {
    await delay();
    return [...categoriesState].sort((a, b) => a.displayOrder - b.displayOrder);
  },

  createCategory: async (data: Omit<Category, 'id'>): Promise<Category> => {
    await delay();
    const newCategory: Category = {
      ...data,
      id: `cat-${Date.now()}`,
      displayOrder: data.displayOrder || categoriesState.length + 1,
      isActive: data.isActive !== undefined ? data.isActive : true,
    };
    categoriesState.push(newCategory);
    return newCategory;
  },

  updateCategory: async (id: string, updates: Partial<Category>): Promise<Category> => {
    await delay();
    const index = categoriesState.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Category not found');
    categoriesState[index] = { ...categoriesState[index], ...updates };
    return categoriesState[index];
  },

  deleteCategory: async (id: string): Promise<boolean> => {
    await delay();
    const initialLength = categoriesState.length;
    categoriesState = categoriesState.filter((c) => c.id !== id);
    // Also remove associated products
    productsState = productsState.filter((p) => p.categoryId !== id);
    return categoriesState.length < initialLength;
  },

  toggleCategoryActive: async (id: string): Promise<Category> => {
    await delay();
    const index = categoriesState.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Category not found');
    categoriesState[index].isActive = !categoriesState[index].isActive;
    return categoriesState[index];
  },

  reorderCategory: async (id: string, direction: 'up' | 'down'): Promise<Category[]> => {
    await delay();
    const sorted = [...categoriesState].sort((a, b) => a.displayOrder - b.displayOrder);
    const index = sorted.findIndex((c) => c.id === id);
    if (index === -1) return sorted;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < sorted.length) {
      const tempOrder = sorted[index].displayOrder;
      sorted[index].displayOrder = sorted[targetIndex].displayOrder;
      sorted[targetIndex].displayOrder = tempOrder;
    }

    categoriesState = sorted;
    return [...categoriesState].sort((a, b) => a.displayOrder - b.displayOrder);
  },

  getProducts: async (categoryId?: string, searchQuery?: string): Promise<MenuItem[]> => {
    await delay();
    let result = [...productsState];
    if (categoryId && categoryId !== 'all') {
      result = result.filter((p) => p.categoryId === categoryId);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    return result;
  },

  getProductById: async (id: string): Promise<MenuItem | null> => {
    await delay();
    const product = productsState.find((p) => p.id === id);
    return product ? { ...product } : null;
  },

  createProduct: async (product: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> => {
    await delay();
    const newProduct: MenuItem = {
      ...product,
      id: `prod-${Date.now()}`,
      isActive: product.isActive !== undefined ? product.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    productsState.unshift(newProduct);
    return newProduct;
  },

  updateProduct: async (id: string, updates: Partial<MenuItem>): Promise<MenuItem> => {
    await delay();
    const index = productsState.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Product not found');
    
    const updatedProduct = {
      ...productsState[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    productsState[index] = updatedProduct;
    return updatedProduct;
  },

  duplicateProduct: async (id: string): Promise<MenuItem> => {
    await delay();
    const source = productsState.find((p) => p.id === id);
    if (!source) throw new Error('Source product not found for duplication');

    const duplicated: MenuItem = {
      ...source,
      id: `prod-${Date.now()}`,
      name: `${source.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    productsState.unshift(duplicated);
    return duplicated;
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    await delay();
    const initialLength = productsState.length;
    productsState = productsState.filter((p) => p.id !== id);
    return productsState.length < initialLength;
  },

  toggleProductAvailability: async (id: string): Promise<MenuItem> => {
    await delay();
    const index = productsState.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Product not found');
    productsState[index].isAvailable = !productsState[index].isAvailable;
    return productsState[index];
  },
};
