import React from 'react';
import { MenuItem } from '../../types/menu';
import { ProductCard } from './ProductCard';

export interface ProductGridProps {
  products: MenuItem[];
  onAddToCart: (product: MenuItem) => void;
  onViewDetails?: (product: MenuItem) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onAddToCart,
  onViewDetails,
}) => {
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};
