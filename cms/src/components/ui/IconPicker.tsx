'use client';

import * as React from 'react';
import { CmsThumbnail } from '@/components/ui/CmsThumbnail';
import * as LucideIcons from 'lucide-react';
import { X, Search, Upload, Palette, Image as ImageIcon, LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

// Type for Lucide icon components
type LucideIcon = React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;

// Get all icon names from lucide-react
const allIconNames = Object.keys(LucideIcons).filter(
  (key) => key !== 'createLucideIcon' && key !== 'default' && !key.startsWith('Lucide') && typeof (LucideIcons as Record<string, unknown>)[key] === 'object'
);

// Popular icons for quick access
const popularIcons = [
  'Star', 'Heart', 'Home', 'Settings', 'User', 'Search', 'Menu', 'X', 'Check', 'Plus',
  'Minus', 'ChevronRight', 'ChevronLeft', 'ChevronDown', 'ChevronUp', 'ArrowRight', 'ArrowLeft',
  'Mail', 'Phone', 'MapPin', 'Calendar', 'Clock', 'Bell', 'Gift', 'ShoppingCart', 'ShoppingBag',
  'CreditCard', 'Wallet', 'Tag', 'Percent', 'Sparkles', 'Zap', 'Trophy', 'Award', 'Crown',
  'Coffee', 'Utensils', 'Pizza', 'Wine', 'Beer', 'Cake', 'IceCream', 'Apple',
  'Car', 'Bus', 'Plane', 'Train', 'Bike', 'Ship',
  'Building', 'Store', 'Hospital', 'School', 'Church', 'Factory',
  'Sun', 'Moon', 'Cloud', 'CloudRain', 'Snowflake', 'Wind',
  'Music', 'Film', 'Camera', 'Image', 'Video', 'Mic', 'Headphones',
  'Gamepad2', 'Dice1', 'Puzzle', 'Target',
  'Wifi', 'Bluetooth', 'Battery', 'Monitor', 'Smartphone', 'Tablet', 'Laptop',
  'Globe', 'Map', 'Compass', 'Navigation', 'Route',
  'FileText', 'Folder', 'Download', 'Upload', 'Share', 'Link', 'ExternalLink',
  'Eye', 'EyeOff', 'Lock', 'Unlock', 'Key', 'Shield',
  'MessageCircle', 'MessageSquare', 'Send', 'Inbox',
  'ThumbsUp', 'ThumbsDown', 'Smile', 'Frown', 'Meh',
  'Flame', 'Droplet', 'Leaf', 'Flower', 'Tree',
];

export interface IconPickerProps {
  value?: string | null;
  onChange: (value: string) => void;
  imageValue?: string | null;
  onImageChange?: (value: string) => void;
  label?: string;
  allowImage?: boolean;
  className?: string;
}

type PickerMode = 'icon' | 'image';

const IconPicker: React.FC<IconPickerProps> = ({
  value,
  onChange,
  imageValue,
  onImageChange,
  label,
  allowImage = true,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [mode, setMode] = React.useState<PickerMode>(imageValue ? 'image' : 'icon');
  const [isUploading, setIsUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Filter icons based on search
  const filteredIcons = React.useMemo(() => {
    if (!search) return popularIcons;
    const searchLower = search.toLowerCase();
    return allIconNames.filter((name) => name.toLowerCase().includes(searchLower)).slice(0, 100);
  }, [search]);

  // Get the icon component
  const IconComponent = value ? (LucideIcons as unknown as Record<string, LucideIcon>)[value] : null;

  const handleUpload = async (files: FileList) => {
    const file = files[0];
    if (!file || !onImageChange) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/cms/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        onImageChange(data.url);
        onChange(''); // Clear icon when using image
        setIsOpen(false);
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectIcon = (iconName: string) => {
    onChange(iconName);
    if (onImageChange) onImageChange(''); // Clear image when selecting icon
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    if (onImageChange) onImageChange('');
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}

      {/* Preview / Trigger Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors w-full text-left"
        >
          {/* Preview */}
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
            {imageValue ? (
              <CmsThumbnail
                src={imageValue}
                alt="Ikona"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : IconComponent ? (
              <IconComponent className="w-6 h-6 text-gray-700" />
            ) : (
              <Palette className="w-5 h-5 text-gray-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {imageValue ? (
              <span className="text-sm text-gray-700">Prilagođena slika</span>
            ) : value ? (
              <span className="text-sm text-gray-700">{value}</span>
            ) : (
              <span className="text-sm text-gray-400">Odaberi ikonu ili sliku...</span>
            )}
          </div>

          <Search className="w-4 h-4 text-gray-400" />
        </button>

        {(value || imageValue) && (
          <button
            type="button"
            onClick={handleClear}
            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Odaberi ikonu</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Mode Tabs */}
            {allowImage && (
              <div className="flex border-b">
                <button
                  type="button"
                  onClick={() => setMode('icon')}
                  className={cn(
                    'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                    mode === 'icon'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Palette className="w-4 h-4 inline mr-2" />
                  Lucide Ikone
                </button>
                <button
                  type="button"
                  onClick={() => setMode('image')}
                  className={cn(
                    'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                    mode === 'image'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <ImageIcon className="w-4 h-4 inline mr-2" />
                  Upload Slika
                </button>
              </div>
            )}

            {/* Content */}
            {mode === 'icon' ? (
              <>
                {/* Search */}
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Pretraži ikone..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                  {!search && (
                    <p className="text-xs text-gray-500 mt-2">
                      Popularne ikone • Pretraži za {allIconNames.length}+ ikona
                    </p>
                  )}
                </div>

                {/* Icons Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                    {filteredIcons.map((iconName) => {
                      const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName];
                      if (!Icon) return null;

                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => handleSelectIcon(iconName)}
                          className={cn(
                            'aspect-square rounded-lg flex flex-col items-center justify-center p-2 transition-all',
                            value === iconName
                              ? 'bg-blue-100 border-2 border-blue-500 text-blue-600'
                              : 'bg-gray-50 hover:bg-gray-100 border border-transparent text-gray-700'
                          )}
                          title={iconName}
                        >
                          <Icon className="w-5 h-5" />
                        </button>
                      );
                    })}
                  </div>

                  {filteredIcons.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      Nema rezultata za &quot;{search}&quot;
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Image Upload Mode */
              <div className="flex-1 p-6">
                <div
                  className={cn(
                    'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                    isUploading
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  )}
                  onClick={() => !isUploading && inputRef.current?.click()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && handleUpload(e.target.files)}
                    disabled={isUploading}
                  />

                  {isUploading ? (
                    <div className="space-y-3">
                      <div className="animate-spin w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
                      <p className="text-sm text-gray-600">Uploading...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-700 font-medium">Upload prilagođenu ikonu</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Drag & drop ili klikni za odabir
                      </p>
                      <p className="text-xs text-gray-400 mt-3">
                        PNG, SVG, JPG (preporučeno: 64x64px ili više)
                      </p>
                    </>
                  )}
                </div>

                {imageValue && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-3">Trenutna slika:</p>
                    <div className="flex items-center gap-4">
                      <CmsThumbnail
                        src={imageValue}
                        alt="Trenutna ikona"
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-lg object-cover border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">{imageValue}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconPicker;
export { IconPicker };
