'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { ErrorState } from '../../../components/shared/ErrorState';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Toast } from '../../../components/ui/Toast';
import { menuApi } from '../../../lib/api/menu';
import { Category, MenuItem, ProductVariant, ProductAddon } from '../../../types/menu';
import { formatCurrency } from '../../../lib/utils';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  BookOpen,
  Layers,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  Power,
  UtensilsCrossed,
  Tag,
  Clock,
  Search,
  Filter,
  DollarSign,
} from 'lucide-react';

type MenuTab = 'categories' | 'products' | 'variants' | 'addons';

export default function AdminMenuPage() {
  const [activeTab, setActiveTab] = useState<MenuTab>('products');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<{ product: MenuItem; variant?: ProductVariant } | null>(null);

  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<{ product: MenuItem; addon?: ProductAddon } | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'product' | 'category'; id: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields - Category
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catIcon, setCatIcon] = useState('UtensilsCrossed');
  const [catIsActive, setCatIsActive] = useState(true);

  // Form Fields - Product
  const [prodName, setProdName] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(10);
  const [prodCategoryId, setProdCategoryId] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodFoodType, setProdFoodType] = useState<'veg' | 'non-veg' | 'egg'>('veg');
  const [prodPrepTime, setProdPrepTime] = useState<number>(15);
  const [prodIsAvailable, setProdIsAvailable] = useState(true);
  const [prodIsActive, setProdIsActive] = useState(true);

  // Form Fields - Variant / Add-on
  const [varName, setVarName] = useState('');
  const [varPrice, setVarPrice] = useState<number>(0);
  const [varIsAvailable, setVarIsAvailable] = useState(true);

  const [addonName, setAddonName] = useState('');
  const [addonPrice, setAddonPrice] = useState<number>(25);
  const [addonIsAvailable, setAddonIsAvailable] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cats, prods] = await Promise.all([
        menuApi.getCategories(),
        menuApi.getProducts(selectedCategoryFilter, searchQuery),
      ]);
      setCategories(cats);
      setProducts(prods);
      if (cats.length > 0 && !prodCategoryId) {
        setProdCategoryId(cats[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load menu data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategoryFilter]);

  // ---------------- CATEGORY ACTIONS ----------------
  const openCreateCategoryModal = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDescription('');
    setCatIcon('UtensilsCrossed');
    setCatIsActive(true);
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDescription(cat.description);
    setCatIcon(cat.iconName || 'UtensilsCrossed');
    setCatIsActive(cat.isActive);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    try {
      setSubmitting(true);
      if (editingCategory) {
        await menuApi.updateCategory(editingCategory.id, {
          name: catName.trim(),
          description: catDescription.trim(),
          iconName: catIcon,
          isActive: catIsActive,
        });
        setToast({ title: 'Category Updated', message: `${catName} category saved.`, type: 'success' });
      } else {
        await menuApi.createCategory({
          name: catName.trim(),
          description: catDescription.trim(),
          iconName: catIcon,
          displayOrder: categories.length + 1,
          isActive: catIsActive,
        });
        setToast({ title: 'Category Created', message: `${catName} category added.`, type: 'success' });
      }
      setIsCategoryModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleCategoryActive = async (id: string) => {
    await menuApi.toggleCategoryActive(id);
    loadData();
  };

  const handleReorderCategory = async (id: string, dir: 'up' | 'down') => {
    await menuApi.reorderCategory(id, dir);
    loadData();
  };

  // ---------------- PRODUCT ACTIONS ----------------
  const openCreateProductModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDescription('');
    setProdPrice(12.99);
    setProdCategoryId(categories[0]?.id || 'cat-starters');
    setProdImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80');
    setProdFoodType('veg');
    setProdPrepTime(15);
    setProdIsAvailable(true);
    setProdIsActive(true);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: MenuItem) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdDescription(prod.description);
    setProdPrice(prod.price);
    setProdCategoryId(prod.categoryId);
    setProdImage(prod.image);
    setProdFoodType(prod.foodType || 'veg');
    setProdPrepTime(prod.preparationTimeMinutes);
    setProdIsAvailable(prod.isAvailable);
    setProdIsActive(prod.isActive !== undefined ? prod.isActive : true);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    try {
      setSubmitting(true);
      const payload = {
        name: prodName.trim(),
        description: prodDescription.trim(),
        price: Number(prodPrice),
        categoryId: prodCategoryId,
        image: prodImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        foodType: prodFoodType,
        preparationTimeMinutes: Number(prodPrepTime),
        isAvailable: prodIsAvailable,
        isActive: prodIsActive,
        dietaryTags: [prodFoodType === 'veg' ? 'vegetarian' : 'chef-special'] as any,
      };

      if (editingProduct) {
        await menuApi.updateProduct(editingProduct.id, payload);
        setToast({ title: 'Product Updated', message: `${prodName} details saved.`, type: 'success' });
      } else {
        await menuApi.createProduct(payload as any);
        setToast({ title: 'Product Created', message: `${prodName} added to menu.`, type: 'success' });
      }
      setIsProductModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleProductAvailability = async (id: string) => {
    await menuApi.toggleProductAvailability(id);
    loadData();
  };

  const handleDuplicateProduct = async (id: string) => {
    try {
      const dup = await menuApi.duplicateProduct(id);
      loadData();
      setToast({ title: 'Product Duplicated', message: `Created copy "${dup.name}".`, type: 'success' });
    } catch (err) {
      alert('Failed to duplicate product.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setSubmitting(true);
      if (deleteConfirm.type === 'product') {
        await menuApi.deleteProduct(deleteConfirm.id);
        setToast({ title: 'Product Deleted', message: `Removed ${deleteConfirm.name}.`, type: 'success' });
      } else {
        await menuApi.deleteCategory(deleteConfirm.id);
        setToast({ title: 'Category Deleted', message: `Removed ${deleteConfirm.name}.`, type: 'success' });
      }
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      alert('Failed to delete item.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- VARIANT ACTIONS ----------------
  const handleSaveVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariant || !varName.trim()) return;

    const prod = editingVariant.product;
    const groups = prod.variantGroups ? [...prod.variantGroups] : [];
    let mainGroup = groups[0] ? { ...groups[0] } : { id: 'vg-default', name: 'Portion Size', required: true, variants: [] };

    const newVar: ProductVariant = {
      id: editingVariant.variant?.id || `var-${Date.now()}`,
      name: varName.trim(),
      priceModifier: Number(varPrice),
      isAvailable: varIsAvailable,
    };

    const existingIdx = mainGroup.variants.findIndex((v) => v.id === newVar.id);
    if (existingIdx > -1) {
      mainGroup.variants[existingIdx] = newVar;
    } else {
      mainGroup.variants.push(newVar);
    }

    groups[0] = mainGroup;
    await menuApi.updateProduct(prod.id, { variantGroups: groups });
    setIsVariantModalOpen(false);
    loadData();
    setToast({ title: 'Variant Saved', message: `Saved variant "${varName}".`, type: 'success' });
  };

  const handleDeleteVariant = async (prod: MenuItem, variantId: string) => {
    if (!prod.variantGroups || prod.variantGroups.length === 0) return;
    const groups = [...prod.variantGroups];
    groups[0] = {
      ...groups[0],
      variants: groups[0].variants.filter((v) => v.id !== variantId),
    };
    await menuApi.updateProduct(prod.id, { variantGroups: groups });
    loadData();
    setToast({ title: 'Variant Removed', message: 'Variant deleted.', type: 'info' });
  };

  // ---------------- ADD-ON ACTIONS ----------------
  const handleSaveAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddon || !addonName.trim()) return;

    const prod = editingAddon.product;
    const groups = prod.addonGroups ? [...prod.addonGroups] : [];
    let mainGroup = groups[0] ? { ...groups[0] } : { id: 'ag-default', name: 'Custom Extras', required: false, addons: [] };

    const newAddon: ProductAddon = {
      id: editingAddon.addon?.id || `add-${Date.now()}`,
      name: addonName.trim(),
      price: Number(addonPrice),
      isAvailable: addonIsAvailable,
    };

    const existingIdx = mainGroup.addons.findIndex((a) => a.id === newAddon.id);
    if (existingIdx > -1) {
      mainGroup.addons[existingIdx] = newAddon;
    } else {
      mainGroup.addons.push(newAddon);
    }

    groups[0] = mainGroup;
    await menuApi.updateProduct(prod.id, { addonGroups: groups });
    setIsAddonModalOpen(false);
    loadData();
    setToast({ title: 'Add-on Saved', message: `Saved add-on "${addonName}".`, type: 'success' });
  };

  const handleDeleteAddon = async (prod: MenuItem, addonId: string) => {
    if (!prod.addonGroups || prod.addonGroups.length === 0) return;
    const groups = [...prod.addonGroups];
    groups[0] = {
      ...groups[0],
      addons: groups[0].addons.filter((a) => a.id !== addonId),
    };
    await menuApi.updateProduct(prod.id, { addonGroups: groups });
    loadData();
    setToast({ title: 'Add-on Removed', message: 'Add-on deleted.', type: 'info' });
  };

  if (loading) return <LoadingSpinner label="Loading menu items & categories..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6 pb-12">
      {toast && (
        <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Restaurant Menu Management"
        subtitle="Configure dish catalog, pricing, availability toggles, categories, variants & add-ons."
        action={
          activeTab === 'categories' ? (
            <Button onClick={openCreateCategoryModal} variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add Category
            </Button>
          ) : (
            <Button onClick={openCreateProductModal} variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add New Dish
            </Button>
          )
        }
      />

      {/* Section Tabs Navigation */}
      <div className="bg-white rounded-2xl p-2 border border-stone-200/80 shadow-sm flex flex-wrap gap-2">
        {[
          { id: 'products', label: 'Products', count: products.length, icon: UtensilsCrossed },
          { id: 'categories', label: 'Categories', count: categories.length, icon: Layers },
          { id: 'variants', label: 'Variants', count: 'Options', icon: Tag },
          { id: 'addons', label: 'Add-ons', count: 'Extras', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as MenuTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                isActive
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-stone-50 text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ---------------- SECTION 1: CATEGORIES MANAGEMENT ---------------- */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-stone-100">
            <div>
              <h2 className="font-extrabold text-stone-900 text-lg">Menu Categories ({categories.length})</h2>
              <p className="text-xs text-stone-500">Reorder, enable/disable, or create new menu sections</p>
            </div>
            <Button onClick={openCreateCategoryModal} variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add Category
            </Button>
          </div>

          <div className="divide-y divide-stone-100">
            {categories.map((cat, idx) => (
              <div key={cat.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 font-extrabold text-xs flex items-center justify-center">
                    #{cat.displayOrder}
                  </div>
                  <div>
                    <span className="font-extrabold text-stone-900 text-sm block">{cat.name}</span>
                    <span className="text-xs text-stone-500 block max-w-md line-clamp-1">{cat.description}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Reorder Buttons */}
                  <button
                    onClick={() => handleReorderCategory(cat.id, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 text-stone-400 hover:text-stone-900 disabled:opacity-30 rounded-lg hover:bg-stone-100"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReorderCategory(cat.id, 'down')}
                    disabled={idx === categories.length - 1}
                    className="p-1.5 text-stone-400 hover:text-stone-900 disabled:opacity-30 rounded-lg hover:bg-stone-100"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  {/* Active Toggle */}
                  <button
                    onClick={() => handleToggleCategoryActive(cat.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      cat.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {cat.isActive ? 'Active' : 'Disabled'}
                  </button>

                  <button
                    onClick={() => openEditCategoryModal(cat)}
                    className="p-2 text-stone-500 hover:text-stone-900 rounded-xl hover:bg-stone-100"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirm({ type: 'category', id: cat.id, name: cat.name })}
                    className="p-2 text-rose-500 hover:text-rose-700 rounded-xl hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- SECTION 2: PRODUCTS MANAGEMENT ---------------- */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Category & Search Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-stone-500">Category Filter:</span>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Categories ({products.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-400 text-[11px] uppercase tracking-wider font-extrabold">
                  <tr>
                    <th className="py-3.5 px-4">Dish</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Food Type</th>
                    <th className="py-3.5 px-4">Prep Time</th>
                    <th className="py-3.5 px-4">Availability</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {products.map((p) => {
                    const catObj = categories.find((c) => c.id === p.categoryId);

                    return (
                      <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3.5 px-4 flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-11 h-11 rounded-xl object-cover bg-stone-100 flex-shrink-0" />
                          <div>
                            <span className="font-extrabold text-stone-900 text-sm block">{p.name}</span>
                            <span className="text-[11px] text-stone-500 line-clamp-1 max-w-xs">{p.description}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-stone-700">{catObj?.name || p.categoryId}</td>
                        <td className="py-3.5 px-4 font-black text-stone-900 text-sm">{formatCurrency(p.price)}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              p.foodType === 'veg'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.foodType === 'egg'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {p.foodType || 'veg'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-stone-600">{p.preparationTimeMinutes} min</td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleProductAvailability(p.id)}
                            className={`px-3 py-1 rounded-xl font-bold transition-all ${
                              p.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {p.isAvailable ? 'In Stock' : 'Sold Out'}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => handleDuplicateProduct(p.id)}
                            className="p-1.5 text-stone-400 hover:text-amber-700 rounded-lg hover:bg-amber-50"
                            title="Duplicate Dish"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                            title="Edit Dish"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'product', id: p.id, name: p.name })}
                            className="p-1.5 text-rose-400 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                            title="Delete Dish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SECTION 3: VARIANTS MANAGEMENT ---------------- */}
      {activeTab === 'variants' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-stone-100">
            <div>
              <h2 className="font-extrabold text-stone-900 text-lg">Product Variants Management</h2>
              <p className="text-xs text-stone-500">Configure size options (Small, Medium, Large) and price modifiers</p>
            </div>
          </div>

          <div className="space-y-6">
            {products.map((p) => {
              const mainGroup = p.variantGroups && p.variantGroups[0];
              const variants = mainGroup?.variants || [];

              return (
                <div key={p.id} className="bg-stone-50 rounded-2xl p-4 border border-stone-200/70 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-9 h-9 rounded-xl object-cover bg-white" />
                      <div>
                        <span className="font-extrabold text-stone-900 text-sm block">{p.name}</span>
                        <span className="text-[11px] text-stone-500">Base Price: {formatCurrency(p.price)}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setEditingVariant({ product: p });
                        setVarName('');
                        setVarPrice(0);
                        setVarIsAvailable(true);
                        setIsVariantModalOpen(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold rounded-xl"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Variant
                    </Button>
                  </div>

                  {variants.length === 0 ? (
                    <p className="text-[11px] text-stone-400 italic">No variants configured for this dish.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {variants.map((v) => (
                        <div key={v.id} className="bg-white p-3 rounded-xl border border-stone-200 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-stone-900 block">{v.name}</span>
                            <span className="text-[11px] text-amber-800 font-semibold">
                              {v.priceModifier >= 0 ? `+${formatCurrency(v.priceModifier)}` : formatCurrency(v.priceModifier)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingVariant({ product: p, variant: v });
                                setVarName(v.name);
                                setVarPrice(v.priceModifier);
                                setVarIsAvailable(v.isAvailable);
                                setIsVariantModalOpen(true);
                              }}
                              className="p-1 text-stone-400 hover:text-stone-900"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteVariant(p, v.id)}
                              className="p-1 text-rose-400 hover:text-rose-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- SECTION 4: ADD-ONS MANAGEMENT ---------------- */}
      {activeTab === 'addons' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-stone-100">
            <div>
              <h2 className="font-extrabold text-stone-900 text-lg">Product Add-ons Management</h2>
              <p className="text-xs text-stone-500">Configure extra toppings (Extra Cheese, Paneer, Sauces)</p>
            </div>
          </div>

          <div className="space-y-6">
            {products.map((p) => {
              const mainGroup = p.addonGroups && p.addonGroups[0];
              const addons = mainGroup?.addons || [];

              return (
                <div key={p.id} className="bg-stone-50 rounded-2xl p-4 border border-stone-200/70 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-9 h-9 rounded-xl object-cover bg-white" />
                      <div>
                        <span className="font-extrabold text-stone-900 text-sm block">{p.name}</span>
                        <span className="text-[11px] text-stone-500">Base Price: {formatCurrency(p.price)}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setEditingAddon({ product: p });
                        setAddonName('');
                        setAddonPrice(25);
                        setAddonIsAvailable(true);
                        setIsAddonModalOpen(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold rounded-xl"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Add-on
                    </Button>
                  </div>

                  {addons.length === 0 ? (
                    <p className="text-[11px] text-stone-400 italic">No add-ons configured for this dish.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {addons.map((a) => (
                        <div key={a.id} className="bg-white p-3 rounded-xl border border-stone-200 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-stone-900 block">{a.name}</span>
                            <span className="text-[11px] text-amber-800 font-semibold">+{formatCurrency(a.price)}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingAddon({ product: p, addon: a });
                                setAddonName(a.name);
                                setAddonPrice(a.price);
                                setAddonIsAvailable(a.isAvailable);
                                setIsAddonModalOpen(true);
                              }}
                              className="p-1 text-stone-400 hover:text-stone-900"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddon(p, a.id)}
                              className="p-1 text-rose-400 hover:text-rose-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- MODAL 1: CATEGORY MODAL ---------------- */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSaveCategory} className="space-y-4 pt-2 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Category Name</label>
            <input
              type="text"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="e.g., Starters, Main Course, Breads..."
              required
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={catDescription}
              onChange={(e) => setCatDescription(e.target.value)}
              placeholder="Crispy bites and artisanal starters..."
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="catActiveCheck"
              checked={catIsActive}
              onChange={(e) => setCatIsActive(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
            />
            <label htmlFor="catActiveCheck" className="font-bold text-stone-700">
              Active & Visible on Customer Menu
            </label>
          </div>

          <Button type="submit" variant="primary" isLoading={submitting} className="w-full py-3 rounded-2xl font-bold text-xs">
            Save Category
          </Button>
        </form>
      </Modal>

      {/* ---------------- MODAL 2: PRODUCT MODAL ---------------- */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Edit Dish Product' : 'Add New Menu Dish'}
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 pt-2 text-xs max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Dish Name</label>
            <input
              type="text"
              value={prodName}
              onChange={(e) => setProdName(e.target.value)}
              placeholder="e.g. Truffle Mushroom Risotto"
              required
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Category</label>
              <select
                value={prodCategoryId}
                onChange={(e) => setProdCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Price ({formatCurrency(0).slice(0, 1)})</label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={prodPrice}
                onChange={(e) => setProdPrice(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Short Description</label>
            <textarea
              rows={2}
              value={prodDescription}
              onChange={(e) => setProdDescription(e.target.value)}
              placeholder="Arborio rice, wild forest mushrooms, truffle oil, and aged parmesan."
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Food Type</label>
              <select
                value={prodFoodType}
                onChange={(e) => setProdFoodType(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="veg">Vegetarian (Veg)</option>
                <option value="non-veg">Non-Vegetarian (Non-Veg)</option>
                <option value="egg">Contains Egg</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Prep Time (Mins)</label>
              <input
                type="number"
                min={1}
                value={prodPrepTime}
                onChange={(e) => setProdPrepTime(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Image URL</label>
            <input
              type="text"
              value={prodImage}
              onChange={(e) => setProdImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex gap-4 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="prodAvailCheck"
                checked={prodIsAvailable}
                onChange={(e) => setProdIsAvailable(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <label htmlFor="prodAvailCheck" className="font-bold text-stone-700">
                In Stock & Available
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="prodActiveCheck"
                checked={prodIsActive}
                onChange={(e) => setProdIsActive(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <label htmlFor="prodActiveCheck" className="font-bold text-stone-700">
                Active on Menu
              </label>
            </div>
          </div>

          <Button type="submit" variant="primary" isLoading={submitting} className="w-full py-3 rounded-2xl font-bold text-xs mt-2">
            Save Dish
          </Button>
        </form>
      </Modal>

      {/* ---------------- MODAL 3: VARIANT MODAL ---------------- */}
      <Modal
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        title="Configure Product Variant"
      >
        <form onSubmit={handleSaveVariant} className="space-y-4 pt-2 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Variant Name</label>
            <input
              type="text"
              value={varName}
              onChange={(e) => setVarName(e.target.value)}
              placeholder="e.g. Small, Medium, Large, Half, Full"
              required
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Price Modifier ({formatCurrency(0).slice(0, 1)})</label>
            <input
              type="number"
              step="0.01"
              value={varPrice}
              onChange={(e) => setVarPrice(Number(e.target.value))}
              placeholder="e.g. 0 for Base, 40 for Medium"
              required
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="varAvailCheck"
              checked={varIsAvailable}
              onChange={(e) => setVarIsAvailable(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
            />
            <label htmlFor="varAvailCheck" className="font-bold text-stone-700">
              Active & Available
            </label>
          </div>

          <Button type="submit" variant="primary" className="w-full py-3 rounded-2xl font-bold text-xs">
            Save Variant Option
          </Button>
        </form>
      </Modal>

      {/* ---------------- MODAL 4: ADD-ON MODAL ---------------- */}
      <Modal
        isOpen={isAddonModalOpen}
        onClose={() => setIsAddonModalOpen(false)}
        title="Configure Product Add-on Extra"
      >
        <form onSubmit={handleSaveAddon} className="space-y-4 pt-2 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Add-on Name</label>
            <input
              type="text"
              value={addonName}
              onChange={(e) => setAddonName(e.target.value)}
              placeholder="e.g. Extra Cheese, Extra Paneer, Extra Sauce"
              required
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Add-on Extra Price ({formatCurrency(0).slice(0, 1)})</label>
            <input
              type="number"
              step="0.01"
              min={0}
              value={addonPrice}
              onChange={(e) => setAddonPrice(Number(e.target.value))}
              required
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="addonAvailCheck"
              checked={addonIsAvailable}
              onChange={(e) => setAddonIsAvailable(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
            />
            <label htmlFor="addonAvailCheck" className="font-bold text-stone-700">
              Active & Available
            </label>
          </div>

          <Button type="submit" variant="primary" className="w-full py-3 rounded-2xl font-bold text-xs">
            Save Add-on Extra
          </Button>
        </form>
      </Modal>

      {/* ---------------- CONFIRM DELETE DIALOG ---------------- */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteConfirm?.type === 'product' ? 'Dish' : 'Category'}?`}
        description={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        variant="danger"
        isLoading={submitting}
      />
    </div>
  );
}
