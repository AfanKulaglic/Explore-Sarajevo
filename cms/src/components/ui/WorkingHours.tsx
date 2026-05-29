'use client';

import * as React from 'react';
import { Clock, Calendar, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

const DAYS = [
  { key: 'monday', label: 'Ponedjeljak', short: 'Pon' },
  { key: 'tuesday', label: 'Utorak', short: 'Uto' },
  { key: 'wednesday', label: 'Srijeda', short: 'Sri' },
  { key: 'thursday', label: 'Četvrtak', short: 'Čet' },
  { key: 'friday', label: 'Petak', short: 'Pet' },
  { key: 'saturday', label: 'Subota', short: 'Sub' },
  { key: 'sunday', label: 'Nedjelja', short: 'Ned' }
] as const;

type DayKey = typeof DAYS[number]['key'];

interface DayHours {
  is_open: boolean;
  open: string;
  close: string;
}

export interface WorkingHoursData {
  is_24_7: boolean;
  not_applicable?: boolean;
  days: Record<DayKey, DayHours>;
}

export interface WorkingHoursProps {
  value: WorkingHoursData | string | null;
  onChange: (value: WorkingHoursData) => void;
  label?: string;
  error?: string;
  className?: string;
}

const DEFAULT_HOURS: WorkingHoursData = {
  is_24_7: false,
  days: {
    monday: { is_open: true, open: '08:00', close: '17:00' },
    tuesday: { is_open: true, open: '08:00', close: '17:00' },
    wednesday: { is_open: true, open: '08:00', close: '17:00' },
    thursday: { is_open: true, open: '08:00', close: '17:00' },
    friday: { is_open: true, open: '08:00', close: '17:00' },
    saturday: { is_open: false, open: '10:00', close: '14:00' },
    sunday: { is_open: false, open: '10:00', close: '14:00' }
  }
};

// Parse legacy string format into structured data
function parseWorkingHours(input: WorkingHoursData | string | null): WorkingHoursData {
  if (!input) return DEFAULT_HOURS;
  
  // If it's already the new format object, return it
  if (typeof input === 'object' && 'is_24_7' in input && 'days' in input) {
    return input;
  }
  
  // Parse string format - could be JSON or legacy
  if (typeof input === 'string') {
    const str = input.trim();
    
    // Try to parse as JSON first (new format stored as string)
    if (str.startsWith('{')) {
      try {
        const parsed = JSON.parse(str);
        if (parsed && 'is_24_7' in parsed && 'days' in parsed) {
          return parsed;
        }
      } catch {
        // Not valid JSON, continue to legacy parsing
      }
    }
    
    const strLower = str.toLowerCase();
    
    // Check for 24/7
    if (strLower === '24/7' || strLower.includes('24 sata') || strLower.includes('non-stop')) {
      return { ...DEFAULT_HOURS, is_24_7: true };
    }
    
    // For other legacy strings, return defaults (manual fix needed)
    return DEFAULT_HOURS;
  }
  
  return DEFAULT_HOURS;
}

// Time options from 00:00 to 23:30 in 30-minute increments
const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
  }
}
TIME_OPTIONS.push('24:00'); // Allow closing at midnight

export function WorkingHours({
  value,
  onChange,
  label,
  error,
  className
}: WorkingHoursProps) {
  const [expanded, setExpanded] = React.useState(false);
  const hours = React.useMemo(() => parseWorkingHours(value), [value]);
  
  const updateHours = (updates: Partial<WorkingHoursData>) => {
    onChange({ ...hours, ...updates });
  };
  
  const updateDay = (day: DayKey, updates: Partial<DayHours>) => {
    onChange({
      ...hours,
      days: {
        ...hours.days,
        [day]: { ...hours.days[day], ...updates }
      }
    });
  };
  
  const setAllDays = (isOpen: boolean) => {
    const newDays = { ...hours.days };
    DAYS.forEach(({ key }) => {
      newDays[key] = { ...newDays[key], is_open: isOpen };
    });
    onChange({ ...hours, days: newDays, is_24_7: false });
  };
  
  const setWeekdaysOpen = () => {
    const newDays = { ...hours.days };
    DAYS.forEach(({ key }) => {
      const isWeekday = !['saturday', 'sunday'].includes(key);
      newDays[key] = { ...newDays[key], is_open: isWeekday };
    });
    onChange({ ...hours, days: newDays, is_24_7: false });
  };
  
  const setMondayToSaturday = () => {
    const newDays = { ...hours.days };
    DAYS.forEach(({ key }) => {
      const isOpen = key !== 'sunday';
      newDays[key] = { ...newDays[key], is_open: isOpen };
    });
    onChange({ ...hours, days: newDays, is_24_7: false });
  };
  
  const setDefaultHoursForAll = (open: string, close: string) => {
    const newDays = { ...hours.days };
    DAYS.forEach(({ key }) => {
      newDays[key] = { ...newDays[key], open, close };
    });
    onChange({ ...hours, days: newDays });
  };
  
  const copyToAll = (sourceDay: DayKey) => {
    const source = hours.days[sourceDay];
    const newDays = { ...hours.days };
    DAYS.forEach(({ key }) => {
      if (key !== sourceDay) {
        newDays[key] = { ...source };
      }
    });
    onChange({ ...hours, days: newDays });
  };

  // Calculate summary for collapsed view
  const getSummary = (): string => {
    if (hours.not_applicable) return 'Not applicable';
    if (hours.is_24_7) return '24/7 (Non-stop)';
    
    const openDays = DAYS.filter(d => hours.days[d.key].is_open);
    if (openDays.length === 0) return 'Zatvoreno';
    
    // Check if all open days have same hours
    const firstOpen = openDays[0];
    const sameHours = openDays.every(d => 
      hours.days[d.key].open === hours.days[firstOpen.key].open &&
      hours.days[d.key].close === hours.days[firstOpen.key].close
    );
    
    if (openDays.length === 7 && sameHours) {
      return `Svaki dan ${hours.days[firstOpen.key].open} - ${hours.days[firstOpen.key].close}`;
    }
    
    // Check for Mon-Sat pattern
    if (openDays.length === 6 && sameHours) {
      const monToSat = DAYS.slice(0, 6);
      if (monToSat.every(d => hours.days[d.key].is_open) && !hours.days.sunday.is_open) {
        return `Pon-Sub ${hours.days[firstOpen.key].open} - ${hours.days[firstOpen.key].close}`;
      }
    }
    
    // Check for Mon-Fri pattern
    if (openDays.length === 5 && sameHours) {
      const weekdays = DAYS.slice(0, 5);
      if (weekdays.every(d => hours.days[d.key].is_open) && 
          !hours.days.saturday.is_open && 
          !hours.days.sunday.is_open) {
        return `Pon-Pet ${hours.days[firstOpen.key].open} - ${hours.days[firstOpen.key].close}`;
      }
    }
    
    return `${openDays.length} dana otvoreno`;
  };
  
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className={cn(
        'border rounded-xl overflow-hidden',
        error ? 'border-red-300' : 'border-slate-200'
      )}>
        {/* Header / Summary - Always visible */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-slate-700">{getSummary()}</span>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>
        
        {expanded && (
          <div className="p-4 space-y-4 bg-white">
            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-100">
              <Button
                type="button"
                size="sm"
                variant={hours.not_applicable ? 'primary' : 'outline'}
                onClick={() => updateHours({ not_applicable: !hours.not_applicable, is_24_7: false })}
                className="text-xs"
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                N/A
              </Button>
              <Button
                type="button"
                size="sm"
                variant={hours.is_24_7 ? 'primary' : 'outline'}
                onClick={() => updateHours({ is_24_7: !hours.is_24_7, not_applicable: false })}
                className="text-xs"
              >
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                24/7
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={setWeekdaysOpen}
                className="text-xs"
              >
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                Pon-Pet
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={setMondayToSaturday}
                className="text-xs"
              >
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                Pon-Sub
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setAllDays(true)}
                className="text-xs"
              >
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Svi dani
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setAllDays(false)}
                className="text-xs"
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                Zatvoreno
              </Button>
            </div>
            
            {!hours.is_24_7 && !hours.not_applicable && (
              <>
                {/* Default hours setter */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-xs font-medium text-blue-700 mb-2">
                    Postavi zadano radno vrijeme za sve dane:
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="text-sm border border-blue-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      defaultValue="08:00"
                      id="default-open"
                    >
                      {TIME_OPTIONS.slice(0, -1).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <span className="text-slate-500">-</span>
                    <select
                      className="text-sm border border-blue-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      defaultValue="17:00"
                      id="default-close"
                    >
                      {TIME_OPTIONS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      className="text-xs ml-2"
                      onClick={() => {
                        const openEl = document.getElementById('default-open') as HTMLSelectElement;
                        const closeEl = document.getElementById('default-close') as HTMLSelectElement;
                        setDefaultHoursForAll(openEl.value, closeEl.value);
                      }}
                    >
                      Primijeni
                    </Button>
                  </div>
                </div>
                
                {/* Day-by-day editor */}
                <div className="space-y-2">
                  {DAYS.map(({ key, short }) => {
                    const day = hours.days[key];
                    return (
                      <div
                        key={key}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-lg transition-colors',
                          day.is_open ? 'bg-green-50' : 'bg-slate-50'
                        )}
                      >
                        {/* Day toggle */}
                        <button
                          type="button"
                          onClick={() => updateDay(key, { is_open: !day.is_open })}
                          className={cn(
                            'w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center transition-colors',
                            day.is_open 
                              ? 'bg-green-500 text-white' 
                              : 'bg-slate-300 text-slate-500'
                          )}
                        >
                          {day.is_open ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                        </button>
                        
                        {/* Day name - always show short on small screens */}
                        <span className="font-medium text-sm text-slate-700 w-8 flex-shrink-0">{short}</span>
                        
                        {/* Time selectors */}
                        {day.is_open ? (
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            <select
                              value={day.open}
                              onChange={(e) => updateDay(key, { open: e.target.value })}
                              className="text-xs border border-slate-200 rounded px-1 py-1 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-[70px] flex-shrink-0"
                            >
                              {TIME_OPTIONS.slice(0, -1).map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <span className="text-slate-400 text-xs">-</span>
                            <select
                              value={day.close}
                              onChange={(e) => updateDay(key, { close: e.target.value })}
                              className="text-xs border border-slate-200 rounded px-1 py-1 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-[70px] flex-shrink-0"
                            >
                              {TIME_OPTIONS.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            
                            {/* Copy to all button - hidden on mobile */}
                            <button
                              type="button"
                              onClick={() => copyToAll(key)}
                              className="ml-auto text-[10px] text-blue-600 hover:text-blue-800 hover:underline hidden md:block whitespace-nowrap"
                            >
                              Kopiraj na sve
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Zatvoreno</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            
            {hours.is_24_7 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <span className="text-green-700 font-medium">
                  Ovaj objekt je otvoren 24 sata dnevno, 7 dana u tjednu
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// Utility to format WorkingHoursData for display
export function formatWorkingHours(hours: WorkingHoursData | string | null): string {
  if (!hours) return 'Radno vrijeme nije postavljeno';
  
  // If string (legacy), return as-is
  if (typeof hours === 'string') return hours;
  
  if (hours.is_24_7) return '24/7';
  
  const lines: string[] = [];
  DAYS.forEach(({ key, short }) => {
    const day = hours.days[key];
    if (day.is_open) {
      lines.push(`${short}: ${day.open}-${day.close}`);
    }
  });
  
  return lines.join(', ') || 'Zatvoreno';
}

export default WorkingHours;
