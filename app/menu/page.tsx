'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { CustomerHeader } from '../../components/customer/CustomerHeader';
import { CustomerBottomNav } from '../../components/customer/CustomerBottomNav';
import { RestaurantHeader } from '../../components/customer/RestaurantHeader';
import { CategoryTabs } from '../../components/customer/CategoryTabs';
import { PopularItems } from '../../components/customer/PopularItems';
import { ProductGrid } from '../../components/customer/ProductGrid';
import { ProductDetailSheet } from '../../components/customer/ProductDetailSheet';
import { CartBar } from '../../components/customer/CartBar';
import { SearchInput } from '../../components/ui/SearchInput';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorState } from '../../components/shared/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { menuApi } from '../../lib/api/menu';
import { restaurantApi } from '../../lib/api/restaurant';
import { Category, MenuItem } from '../../types/menu';
import { RestaurantConfig } from '../../types/restaurant';
import { useAppDispatch, useAppSelector } from '../../store';
import { addToCart } from '../../store/slices/cartSlice';
import { UtensilsCrossed } from 'lucide-react';
import { ProductGridSkeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/ToastProvider';

export default function MenuPage() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const cartItems = useAppSelector((state) => state.cart.items);

  const [restaurant, setRestaurant] = useState<RestaurantConfig | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<MenuItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductForSheet, setSelectedProductForSheet] = useState<MenuItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMenuData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [restInfo, cats, prods] = await Promise.all([
        restaurantApi.getRestaurantInfo(),
        menuApi.getCategories(),
        menuApi.getProducts(),
      ]);
      setRestaurant(restInfo);
      setCategories(cats);
      setAllProducts(prods);
    } catch (err: any) {
      setError(err.message || 'Unable to load menu items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuData();
  }, []);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Category match
      if (selectedCategoryId && product.categoryId !== selectedCategoryId) {
        return false;
      }
      // Search match (name, description, category ID)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesCategory = product.categoryId.toLowerCase().includes(q);
        return matchesName || matchesDesc || matchesCategory;
      }
      return true;
    });
  }, [allProducts, selectedCategoryId, searchQuery]);

  // Cart calculations for sticky bar
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cartItems.reduce((acc, item) => acc + item.itemTotal, 0);

  const handleAddToCart = (product: MenuItem) => {
    if (!product.isAvailable) return;

    // If product has variants or add-ons, open sheet for customization; otherwise quick add
    if (
      (product.variantGroups && product.variantGroups.length > 0) ||
      (product.addonGroups && product.addonGroups.length > 0)
    ) {
      setSelectedProductForSheet(product);
    } else {
      dispatch(addToCart({ menuItem: product, quantity: 1 }));
      toast.success('Added to Order', `${product.name} added to your cart.`);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-28 md:pb-12 flex flex-col">
      <CustomerHeader />

      {/* Restaurant Header */}
      {restaurant && <RestaurantHeader restaurant={restaurant} />}

      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-4">
        {/* Search Bar */}
        <div className="mb-4">
          <SearchInput
            placeholder="Search by dish name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="mb-4">
          <CategoryTabs
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) => setSelectedCategoryId(id)}
          />
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-400">Loading dishes...</span>
            </div>
            <ProductGridSkeleton count={6} />
          </div>
        ) : error ? (
          <ErrorState title="Unable to load menu items" message={error} onRetry={loadMenuData} />
        ) : (
          <>
            {/* Popular & Chef Specials Row (Only shown when not searching) */}
            {!searchQuery && !selectedCategoryId && (
              <PopularItems
                products={allProducts}
                onAddToCart={handleAddToCart}
                onViewDetails={(prod) => setSelectedProductForSheet(prod)}
              />
            )}

            {/* Main Product Listing */}
            {filteredProducts.length === 0 ? (
              <EmptyState
                icon={UtensilsCrossed}
                title="No products found."
                description="Try searching for another dish or clear your active filters."
                actionLabel="Reset Search & Filters"
                onAction={() => {
                  setSearchQuery('');
                  setSelectedCategoryId(null);
                }}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-stone-900 text-sm">
                    {selectedCategoryId
                      ? categories.find((c) => c.id === selectedCategoryId)?.name || 'Dishes'
                      : 'All Menu Items'}
                  </h2>
                  <span className="text-xs text-stone-400 font-medium">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <ProductGrid
                  products={filteredProducts}
                  onAddToCart={handleAddToCart}
                  onViewDetails={(prod) => setSelectedProductForSheet(prod)}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Product Detail & Addon Customization Sheet */}
      <ProductDetailSheet
        isOpen={!!selectedProductForSheet}
        onClose={() => setSelectedProductForSheet(null)}
        product={selectedProductForSheet}
      />

      {/* Sticky Bottom Cart Bar */}
      <CartBar itemCount={totalItemCount} totalAmount={totalAmount} href="/cart" />

      {/* Mobile Bottom Navigation */}
      <CustomerBottomNav />
    </div>
  );
}
