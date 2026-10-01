import React from 'react';
import { Category } from '../../types/menu';

export interface CategoryTabsProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
          selectedCategoryId === null
            ? 'bg-amber-600 text-white shadow-md'
            : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
        }`}
      >
        All Dishes
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategoryId === cat.id
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};
