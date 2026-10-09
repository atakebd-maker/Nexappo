import React, { useState } from 'react';
import { DeviceType, Category } from '../types';

interface FilterBarProps {
  onDeviceChange: (device: DeviceType | 'All') => void;
  onCategoryChange: (category: Category | 'All') => void;
  selectedDevice: DeviceType | 'All';
  selectedCategory: Category | 'All';
}

const devices: (DeviceType | 'All')[] = ['All', 'Android Phone', 'Tablet', 'Android TV', 'Wear OS', 'Chromebook'];
const categories: (Category | 'All')[] = ['All', 'Tools', 'Productivity', 'Social', 'Photography', 'Music', 'Video', 'Education', 'Business', 'Finance', 'Health', 'Lifestyle', 'Shopping', 'Communication', 'Entertainment', 'Action', 'Adventure', 'Arcade', 'Puzzle', 'Racing', 'Sports', 'Strategy', 'Simulation', 'Casual', 'Role Playing'];

const FilterBar: React.FC<FilterBarProps> = ({ onDeviceChange, onCategoryChange, selectedDevice, selectedCategory }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pb-2">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-4">
        {/* Device Filter */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-3 mb-2 border-b border-slate-100 dark:border-slate-800/50 snap-x">
          {devices.map((device) => (
            <button
              key={device}
              onClick={() => onDeviceChange(device)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors snap-center ${
                selectedDevice === device
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {device}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 snap-x">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors snap-center ${
                selectedCategory === category
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
