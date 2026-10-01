'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem, ProductVariant, ProductAddon } from '../../types/menu';
import { Drawer } from '../ui/Drawer';
import { QuantitySelector } from './QuantitySelector';
import { VariantSelector } from './VariantSelector';
import { AddonSelector } from './AddonSelector';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/utils';
import { useToast } from '../ui/ToastProvider';
import { useAppDispatch } from '../../store';
import { addToCartCustomized, CartVariantInfo, CartAddonInfo } from '../../store/slices/cartSlice';
import { MessageSquare, Clock, Sparkles } from 'lucide-react';

export interface ProductDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  product: MenuItem | null;
}

export const ProductDetailSheet: React.FC<ProductDetailSheetProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<ProductAddon[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Reset state whenever product changes
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedAddons([]);
      setSpecialInstructions('');

      // Auto-select first variant if required variant group exists
      if (product.variantGroups && product.variantGroups.length > 0) {
        const firstGroup = product.variantGroups[0];
        if (firstGroup.variants && firstGroup.variants.length > 0) {
          const defaultVariant = firstGroup.variants.find((v) => v.isAvailable) || firstGroup.variants[0];
          setSelectedVariant(defaultVariant);
        } else {
          setSelectedVariant(null);
        }
      } else {
        setSelectedVariant(null);
      }
    }
  }, [product]);

  if (!product) return null;

  // Variant price modifier
  const variantModifier = selectedVariant ? selectedVariant.priceModifier : 0;

  // Addons total
  const addonsTotal = selectedAddons.reduce((acc, a) => acc + a.price, 0);

  // Unit price & total calculation: (Base + Variant + Addons) * Quantity
  const unitPrice = product.price + variantModifier + addonsTotal;
  const totalPrice = unitPrice * quantity;

  // Validation: required variant group must be selected
  const hasRequiredVariantGroup = product.variantGroups?.some((g) => g.required);
  const isValid = !hasRequiredVariantGroup || selectedVariant !== null;

  const handleToggleAddon = (addon: ProductAddon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleAddToCart = () => {
    if (!isValid || !product.isAvailable) return;

    const variantInfo: CartVariantInfo | undefined = selectedVariant && product.variantGroups?.[0]
      ? {
          groupId: product.variantGroups[0].id,
          groupName: product.variantGroups[0].name,
          variant: selectedVariant,
        }
      : undefined;

    const addonInfos: CartAddonInfo[] = selectedAddons.map((addon) => ({
      groupId: 'ag-addons',
      groupName: 'Add-ons',
      addon,
    }));

    dispatch(
      addToCartCustomized({
        menuItem: product,
        quantity,
        selectedVariant: variantInfo,
        selectedAddons: addonInfos,
        specialInstructions: specialInstructions.trim(),
      })
    );

    toast.success('Added to Order', `${quantity}x ${product.name} customized and added.`);
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={product.name}>
      <div className="space-y-5 pb-6">
        {/* Product Image Header */}
        <div className="relative rounded-2xl overflow-hidden h-52 bg-stone-100">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          {product.dietaryTags?.includes('chef-special') && (
            <span className="absolute top-3 left-3 bg-amber-600 text-white text-xs font-extrabold px-3 py-1 rounded-xl shadow-md flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Chef Special
            </span>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h2 className="text-xl font-black text-stone-900">{product.name}</h2>
          <p className="text-xs text-stone-500 mt-1 leading-relaxed">{product.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="font-black text-stone-900 text-xl">
              {formatCurrency(product.price)}
            </span>
            {product.preparationTimeMinutes && (
              <span className="text-xs text-stone-400 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> ~{product.preparationTimeMinutes} min prep
              </span>
            )}
          </div>
        </div>

        {/* 1. Variants Selection */}
        {product.variantGroups && product.variantGroups.length > 0 && (
          <div className="space-y-3">
            {product.variantGroups.map((group) => (
              <VariantSelector
                key={group.id}
                group={group}
                selectedVariant={selectedVariant}
                onSelectVariant={(v) => setSelectedVariant(v)}
              />
            ))}
          </div>
        )}

        {/* 2. Add-ons Selection */}
        {product.addonGroups && product.addonGroups.length > 0 && (
          <AddonSelector
            groups={product.addonGroups}
            selectedAddons={selectedAddons}
            onToggleAddon={handleToggleAddon}
          />
        )}

        {/* 3. Special Instructions */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
          <label className="block text-xs font-bold text-stone-900 mb-1.5 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-amber-600" /> Special Instructions
          </label>
          <textarea
            rows={2}
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Less spicy, no onion, extra crispy..."
            className="w-full p-3 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* 4. Bottom Footer: Quantity & Add Button */}
        <div className="sticky bottom-0 pt-4 border-t border-stone-200 bg-white flex items-center justify-between gap-4">
          <QuantitySelector
            quantity={quantity}
            onIncrease={() => setQuantity(quantity + 1)}
            onDecrease={() => setQuantity(Math.max(1, quantity - 1))}
          />

          <Button
            onClick={handleAddToCart}
            disabled={!isValid || !product.isAvailable}
            variant="primary"
            className="flex-1 py-3.5 rounded-2xl font-extrabold text-sm shadow-md"
          >
            Add to Order ({formatCurrency(totalPrice)})
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
