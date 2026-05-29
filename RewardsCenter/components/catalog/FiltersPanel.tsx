'use client'

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { categories, currencies, productTypes } from "@/lib/mock-data";
import { useTranslation } from "@/lib/i18n";

export interface FilterState {
  type: string;
  category: string;
  currency: string;
  maxPrice: number;
}

interface FiltersPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onApply: () => void;
  isMobile?: boolean;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

function CustomSelect({ value, onChange, options }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-slate-800/50 px-3 py-2.5 text-sm text-white transition hover:border-white/20 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      >
        <span>{selectedOption?.label || 'Select...'}</span>
        <ChevronDown size={16} className={`text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/10 bg-slate-900 p-1 shadow-xl">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition ${
                value === option.value 
                  ? 'bg-brand-500/20 text-brand-400' 
                  : 'text-white/80 hover:bg-white/5'
              }`}
            >
              <span>{option.label}</span>
              {value === option.value && <Check size={14} className="text-brand-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function FiltersPanel({ filters, onFilterChange, onApply, isMobile }: FiltersPanelProps) {
  const { t } = useTranslation();
  
  return (
    <div className={isMobile ? "flex flex-col gap-4" : "hidden w-64 shrink-0 flex-col gap-4 rounded-3xl border border-white/5 bg-white/5 p-5 lg:flex h-fit"}>
      {!isMobile && (
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">{t.catalog.filters}</p>
          <h4 className="text-lg font-semibold text-white">{t.catalog.refineCatalog}</h4>
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="text-sm text-white/60">{t.catalog.maxPrice}</label>
          <input 
            type="range" 
            min={0} 
            max={50000000} 
            step={100000}
            value={filters.maxPrice} 
            onChange={(e) => onFilterChange({ ...filters, maxPrice: parseInt(e.target.value) })}
            className="w-full accent-brand-500" 
          />
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>0</span>
            <span className="text-brand-400 font-medium">{filters.maxPrice.toLocaleString()}</span>
            <span>50M</span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-white/60">{t.catalog.productType}</label>
          <CustomSelect
            value={filters.type}
            onChange={(value) => onFilterChange({ ...filters, type: value })}
            options={productTypes}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-white/60">{t.catalog.category}</label>
          <CustomSelect
            value={filters.category}
            onChange={(value) => onFilterChange({ ...filters, category: value })}
            options={categories}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-white/60">{t.catalog.currency}</label>
          <CustomSelect
            value={filters.currency}
            onChange={(value) => onFilterChange({ ...filters, currency: value })}
            options={currencies}
          />
        </div>
      </div>
      <button 
        onClick={onApply}
        className="rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-500"
      >
        {t.catalog.applyFilters}
      </button>
      <button 
        onClick={() => {
          onFilterChange({ type: 'all', category: 'all', currency: 'all', maxPrice: 50000000 });
          onApply();
        }}
        className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/5"
      >
        {t.catalog.clearFilters}
      </button>
    </div>
  );
}
