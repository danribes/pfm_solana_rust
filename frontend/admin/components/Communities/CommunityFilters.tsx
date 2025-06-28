import React, { useState } from 'react';
import type { CommunityFilters as Filters } from '../../types/community';

interface CommunityFiltersProps {
  onApply: (filters: Filters) => void;
  onCancel: () => void;
  initialFilters?: Filters;
}

const CommunityFilters: React.FC<CommunityFiltersProps> = ({
  onApply,
  onCancel,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(filters);
  };

  const handleReset = () => {
    setFilters({});
  };

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={filters.is_active === undefined ? '' : filters.is_active.toString()}
            onChange={(e) => {
              const value = e.target.value;
              updateFilter('is_active', value === '' ? undefined : value === 'true');
            }}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Minimum Members */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Min Members
          </label>
          <input
            type="number"
            min="0"
            value={filters.min_members || ''}
            onChange={(e) => updateFilter('min_members', e.target.value ? parseInt(e.target.value) : undefined)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="0"
          />
        </div>

        {/* Maximum Members */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Max Members
          </label>
          <input
            type="number"
            min="0"
            value={filters.max_members || ''}
            onChange={(e) => updateFilter('max_members', e.target.value ? parseInt(e.target.value) : undefined)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="No limit"
          />
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sort By
          </label>
          <select
            value={filters.sort_by || 'created_at'}
            onChange={(e) => updateFilter('sort_by', e.target.value as any)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="name">Name</option>
            <option value="created_at">Created Date</option>
            <option value="updated_at">Updated Date</option>
            <option value="member_count">Member Count</option>
          </select>
        </div>
      </div>

      {/* Sort Order */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Sort Order:</span>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="sort_order"
              value="asc"
              checked={filters.sort_order === 'asc'}
              onChange={(e) => updateFilter('sort_order', e.target.value as 'asc' | 'desc')}
              className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
            />
            <span className="ml-2 text-sm text-gray-700">Ascending</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="sort_order"
              value="desc"
              checked={filters.sort_order === 'desc' || !filters.sort_order}
              onChange={(e) => updateFilter('sort_order', e.target.value as 'asc' | 'desc')}
              className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
            />
            <span className="ml-2 text-sm text-gray-700">Descending</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Apply Filters
        </button>
      </div>
    </form>
  );
};

export default CommunityFilters; 