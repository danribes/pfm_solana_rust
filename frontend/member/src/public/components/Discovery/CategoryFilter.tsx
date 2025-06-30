// Task 4.5.2: Category Filter Component
// Filter interface for community categories

import React from "react";
import { CommunityCategory } from "../../types/public";
import { useComponentAnalytics } from "../../hooks/useAnalytics";
import { getCategoryInfo } from "../../services/discovery";

// ============================================================================
// CATEGORY FILTER COMPONENT
// ============================================================================

export interface CategoryFilterProps {
  selectedCategories: CommunityCategory[];
  onCategoryChange: (categories: CommunityCategory[]) => void;
  showCounts?: boolean;
  layout?: "grid" | "list" | "pills";
  className?: string;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategories,
  onCategoryChange,
  showCounts = false,
  layout = "grid",
  className = "",
}) => {
  // ========================================================================
  // HOOKS
  // ========================================================================

  const { trackClick } = useComponentAnalytics("CategoryFilter");

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleCategoryToggle = (category: CommunityCategory) => {
    const isSelected = selectedCategories.includes(category);
    let newCategories: CommunityCategory[];

    if (isSelected) {
      newCategories = selectedCategories.filter(c => c !== category);
    } else {
      newCategories = [...selectedCategories, category];
    }

    onCategoryChange(newCategories);
    
    trackClick("category_toggle", {
      category,
      action: isSelected ? "remove" : "add",
      totalSelected: newCategories.length,
    });
  };

  const handleClearAll = () => {
    onCategoryChange([]);
    trackClick("clear_all_categories");
  };

  const handleSelectAll = () => {
    const allCategories = Object.values(CommunityCategory);
    onCategoryChange(allCategories);
    trackClick("select_all_categories");
  };

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  const renderCategoryButton = (category: CommunityCategory, count?: number) => {
    const categoryInfo = getCategoryInfo(category);
    const isSelected = selectedCategories.includes(category);

    return (
      <button
        key={category}
        onClick={() => handleCategoryToggle(category)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
          isSelected
            ? `bg-${categoryInfo.color}-100 border-${categoryInfo.color}-300 text-${categoryInfo.color}-700 dark:bg-${categoryInfo.color}-900 dark:border-${categoryInfo.color}-600 dark:text-${categoryInfo.color}-300`
            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
        }`}
        aria-label={`Toggle ${categoryInfo.label} category filter`}
        title={categoryInfo.description}
      >
        <span>{categoryInfo.icon}</span>
        <span>{categoryInfo.label}</span>
        {showCounts && count !== undefined && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            isSelected
              ? `bg-${categoryInfo.color}-200 text-${categoryInfo.color}-800 dark:bg-${categoryInfo.color}-800 dark:text-${categoryInfo.color}-200`
              : "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300"
          }`}>
            {count}
          </span>
        )}
      </button>
    );
  };

  const renderGridLayout = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {Object.values(CommunityCategory).map(category => 
        renderCategoryButton(category)
      )}
    </div>
  );

  const renderListLayout = () => (
    <div className="space-y-2">
      {Object.values(CommunityCategory).map(category => {
        const categoryInfo = getCategoryInfo(category);
        const isSelected = selectedCategories.includes(category);
        
        return (
          <label
            key={category}
            className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleCategoryToggle(category)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <div className="ml-3 flex items-center gap-3 flex-1">
              <span className="text-lg">{categoryInfo.icon}</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {categoryInfo.label}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {categoryInfo.description}
                </div>
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );

  const renderPillsLayout = () => (
    <div className="flex flex-wrap gap-2">
      {Object.values(CommunityCategory).map(category => 
        renderCategoryButton(category)
      )}
    </div>
  );

  const renderControls = () => {
    if (selectedCategories.length === 0) return null;

    return (
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {selectedCategories.length} category{selectedCategories.length !== 1 ? "ies" : ""} selected
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleClearAll}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Clear All
          </button>
          {selectedCategories.length < Object.values(CommunityCategory).length && (
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium ml-2"
            >
              Select All
            </button>
          )}
        </div>
      </div>
    );
  };

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Categories
        </h3>
        {renderControls()}
      </div>
      
      {layout === "grid" && renderGridLayout()}
      {layout === "list" && renderListLayout()}
      {layout === "pills" && renderPillsLayout()}
    </div>
  );
};

export default CategoryFilter;
