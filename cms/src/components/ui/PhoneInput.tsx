'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

// Country codes for phone numbers
const COUNTRIES = [
  { code: 'BA', dialCode: '+387', flag: '🇧🇦', name: 'Bosnia' },
  { code: 'HR', dialCode: '+385', flag: '🇭🇷', name: 'Croatia' },
  { code: 'RS', dialCode: '+381', flag: '🇷🇸', name: 'Serbia' },
  { code: 'ME', dialCode: '+382', flag: '🇲🇪', name: 'Montenegro' },
  { code: 'SI', dialCode: '+386', flag: '🇸🇮', name: 'Slovenia' },
  { code: 'AT', dialCode: '+43', flag: '🇦🇹', name: 'Austria' },
  { code: 'DE', dialCode: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: 'US', dialCode: '+1', flag: '🇺🇸', name: 'USA' },
  { code: 'GB', dialCode: '+44', flag: '🇬🇧', name: 'UK' },
] as const;

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
}

// Format phone number for display (with spaces)
function formatPhoneDisplay(phone: string): string {
  // Remove all non-digits except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Check if it starts with a country code
  const country = COUNTRIES.find(c => cleaned.startsWith(c.dialCode));
  
  if (country) {
    const localNumber = cleaned.slice(country.dialCode.length);
    // Remove leading 0 if present
    const withoutLeadingZero = localNumber.startsWith('0') ? localNumber.slice(1) : localNumber;
    
    // Format based on length (Bosnian format: XX XXX XXX)
    if (withoutLeadingZero.length <= 2) return withoutLeadingZero;
    if (withoutLeadingZero.length <= 5) return `${withoutLeadingZero.slice(0, 2)} ${withoutLeadingZero.slice(2)}`;
    if (withoutLeadingZero.length <= 8) return `${withoutLeadingZero.slice(0, 2)} ${withoutLeadingZero.slice(2, 5)} ${withoutLeadingZero.slice(5)}`;
    return `${withoutLeadingZero.slice(0, 2)} ${withoutLeadingZero.slice(2, 5)} ${withoutLeadingZero.slice(5, 8)}`;
  }
  
  return phone;
}

// Parse phone to get country and local number
function parsePhone(phone: string): { country: typeof COUNTRIES[number] | null; localNumber: string } {
  if (!phone) return { country: COUNTRIES[0], localNumber: '' };
  
  const cleaned = phone.replace(/[^\d+]/g, '');
  const country = COUNTRIES.find(c => cleaned.startsWith(c.dialCode));
  
  if (country) {
    let localNumber = cleaned.slice(country.dialCode.length);
    // Remove leading 0 if present
    if (localNumber.startsWith('0')) localNumber = localNumber.slice(1);
    return { country, localNumber };
  }
  
  // Default to Bosnia if no country code found
  let localNumber = cleaned.replace(/^\+/, '');
  if (localNumber.startsWith('0')) localNumber = localNumber.slice(1);
  return { country: COUNTRIES[0], localNumber };
}

export function PhoneInput({ 
  value, 
  onChange, 
  label, 
  placeholder = '61 234 567',
  error,
  className 
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  const { country, localNumber } = parsePhone(value);
  const [selectedCountry, setSelectedCountry] = React.useState(country || COUNTRIES[0]);
  
  // Update selected country when value changes externally
  React.useEffect(() => {
    const { country: parsedCountry } = parsePhone(value);
    if (parsedCountry) {
      setSelectedCountry(parsedCountry);
    }
  }, [value]);
  
  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleCountrySelect = (c: typeof COUNTRIES[number]) => {
    setSelectedCountry(c);
    setIsOpen(false);
    // Update the full value with new country code
    const newValue = localNumber ? `${c.dialCode}${localNumber}` : '';
    onChange(newValue);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    
    // Remove all non-digits
    input = input.replace(/\D/g, '');
    
    // Remove leading 0 if present
    if (input.startsWith('0')) {
      input = input.slice(1);
    }
    
    // Limit to 8 digits (Bosnian phone format)
    input = input.slice(0, 8);
    
    // Create full phone number with country code
    const fullNumber = input ? `${selectedCountry.dialCode}${input}` : '';
    onChange(fullNumber);
  };
  
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="flex">
        {/* Country selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'flex items-center gap-1 px-3 py-2.5 bg-slate-50 border border-r-0 rounded-l-lg text-sm',
              'hover:bg-slate-100 transition-colors',
              error ? 'border-red-300' : 'border-slate-200'
            )}
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-slate-600 font-medium">{selectedCountry.dialCode}</span>
            <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform', isOpen && 'rotate-180')} />
          </button>
          
          {isOpen && (
            <div className="absolute z-50 top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 max-h-60 overflow-y-auto">
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleCountrySelect(c)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 transition-colors',
                    selectedCountry.code === c.code && 'bg-blue-50 text-blue-700'
                  )}
                >
                  <span className="text-lg">{c.flag}</span>
                  <span className="flex-1 text-left">{c.name}</span>
                  <span className="text-slate-500">{c.dialCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Phone input */}
        <input
          type="tel"
          value={formatPhoneDisplay(value)}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(
            'flex-1 px-3 py-2.5 border rounded-r-lg text-sm',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            error ? 'border-red-300' : 'border-slate-200'
          )}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

export default PhoneInput;
