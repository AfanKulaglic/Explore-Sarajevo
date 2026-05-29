'use client';

import * as React from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CmsThumbnail } from '@/components/ui/CmsThumbnail';

export interface ImageUploadProps {
  value?: string | string[] | null;
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  label?: string;
  error?: string;
  className?: string;
  /**
   * Single-image only: no full-width banner preview — one small crop in `previewClassName` (e.g. slot aspect).
   * Use for CMS rows where a separate thumbnail already must not duplicate a huge preview.
   */
  compact?: boolean;
  /** Tailwind classes for the preview frame (single image or empty slot), e.g. `w-28 aspect-[9/16] max-h-44` */
  previewClassName?: string;
  /** With `compact`: show replace/remove as full-width buttons under the thumb instead of a tiny hover overlay */
  compactActions?: 'overlay' | 'below';
  /** Labels for `compactActions="below"` (e.g. from CMS language) */
  compactActionLabels?: { replace: string; remove: string };
  /** Supabase Storage bucket name (e.g. 'sarayaconnect-hotspot'). Defaults to 'sarayaconnect-es'. */
  uploadBucket?: string;
  /** Folder path within the bucket (e.g. 'hero-banners'). */
  uploadFolder?: string;
}

// Helper to normalize image URLs from various database formats
function normalizeImageUrls(value: string | string[] | null | undefined): string[] {
  if (!value) return [];
  
  // If already an array
  if (Array.isArray(value)) {
    // Filter out empty strings and parse any JSON strings within
    return value.flatMap(item => {
      if (!item) return [];
      if (typeof item === 'string') {
        // Check if the string is a JSON array
        if (item.startsWith('[') && item.endsWith(']')) {
          try {
            const parsed = JSON.parse(item);
            if (Array.isArray(parsed)) return parsed;
          } catch {
            // Not valid JSON, treat as URL
          }
        }
        return [item];
      }
      return [];
    }).filter(Boolean);
  }
  
  // If string
  if (typeof value === 'string') {
    // Check if it's a JSON array string
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is string => typeof item === 'string' && item.length > 0);
        }
      } catch {
        // Not valid JSON, treat as single URL
      }
    }
    
    // Single URL
    return value ? [value] : [];
  }
  
  return [];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  multiple = false,
  label,
  error,
  className,
  compact = false,
  previewClassName,
  compactActions = 'overlay',
  compactActionLabels,
  uploadBucket,
  uploadFolder,
}) => {
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);

  const images = React.useMemo(() => normalizeImageUrls(value), [value]);

  const compactFrameClass =
    previewClassName ||
    'w-28 max-h-44 aspect-square sm:w-32';

  const handleUpload = async (files: FileList) => {
    setIsUploading(true);
    setUploadError(null);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        if (uploadBucket) formData.append('bucket', uploadBucket);
        if (uploadFolder) formData.append('folder', uploadFolder);

        const response = await fetch('/api/cms/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
          console.error('[ImageUpload] Server error:', response.status, errorData);
          setUploadError(errorData.details || errorData.error || `Upload failed (${response.status})`);
        }
      }
      
      if (multiple) {
        onChange([...images, ...uploadedUrls]);
      } else {
        onChange(uploadedUrls[0] || '');
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemove = (index: number) => {
    if (multiple) {
      const newImages = images.filter((_, i) => i !== index);
      onChange(newImages);
    } else {
      onChange('');
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length) {
      handleUpload(files);
    }
  };
  
  const shrinkToThumb =
    !multiple && compact && compactActions === 'below' && images.length > 0;

  return (
    <div className={cn(shrinkToThumb ? 'w-max max-w-full' : 'w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      {/* Upload error display */}
      {uploadError && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          <strong>Greška pri uploadu:</strong> {uploadError}
        </div>
      )}
      
      {/* Single image mode — default: wide preview; compact: one aspect-locked thumb (no second huge banner) */}
      {!multiple && images.length > 0 && !compact && (
        <div className="relative group mb-3">
          <CmsThumbnail
            src={images[0]}
            alt="Glavna slika"
            width={960}
            height={384}
            className="w-full h-48 object-cover rounded-lg border"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Upload className="w-4 h-4 inline mr-1" />
              Zamijeni
            </button>
            <button
              type="button"
              onClick={() => handleRemove(0)}
              className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4 inline mr-1" />
              Ukloni
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
        </div>
      )}

      {!multiple && images.length > 0 && compact && compactActions === 'overlay' && (
        <div className={cn('relative group mb-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50', compactFrameClass)}>
          <CmsThumbnail
            src={images[0]}
            alt=""
            width={400}
            height={400}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded bg-white/95 px-2 py-1 text-[11px] font-medium text-slate-800 shadow hover:bg-white"
            >
              <Upload className="mr-0.5 inline h-3 w-3" />
              Promijeni
            </button>
            <button
              type="button"
              onClick={() => handleRemove(0)}
              className="rounded bg-red-600 px-2 py-1 text-[11px] font-medium text-white shadow hover:bg-red-700"
            >
              <X className="mr-0.5 inline h-3 w-3" />
              Ukloni
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
        </div>
      )}

      {!multiple && images.length > 0 && compact && compactActions === 'below' && (
        <div className="w-full">
          <div
            className={cn(
              'overflow-hidden rounded-md border border-slate-200 bg-slate-50',
              compactFrameClass
            )}
          >
            <CmsThumbnail
              src={images[0]}
              alt=""
              width={400}
              height={400}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mt-2 flex w-full flex-col gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50"
            >
              <Upload className="h-3.5 w-3.5 shrink-0" />
              {compactActionLabels?.replace ?? 'Replace'}
            </button>
            <button
              type="button"
              onClick={() => handleRemove(0)}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
            >
              <X className="h-3.5 w-3.5 shrink-0" />
              {compactActionLabels?.remove ?? 'Remove'}
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
        </div>
      )}
      
      {/* Multiple images mode - gallery display */}
      {multiple && images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <CmsThumbnail
                src={url}
                alt={`Slika ${index + 1}`}
                width={96}
                height={96}
                className="w-24 h-24 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Show upload zone: always for multiple, or when no image for single */}
      {(multiple || images.length === 0) && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            !multiple && compact
              ? cn(
                  'flex cursor-pointer flex-col items-center justify-center border-2 border-dashed text-center transition-colors',
                  compactFrameClass,
                  'min-h-[5rem] p-2',
                  error ? 'border-red-300' : 'border-gray-300 hover:border-blue-400'
                )
              : cn(
                  'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                  error ? 'border-red-300' : 'border-gray-300 hover:border-blue-400'
                )
          )}
          onClick={() => galleryInputRef.current?.click()}
        >
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2" />
              <p className="text-sm text-gray-500">Učitavanje...</p>
            </div>
          ) : (
            <div className={cn('flex flex-col items-center', compact && 'gap-1')}>
              <Upload className={cn('text-gray-400', compact ? 'h-6 w-6' : 'w-8 h-8 mb-2')} />
              <p className={cn('text-gray-500', compact ? 'text-[10px] leading-tight px-1' : 'text-sm')}>
                {multiple 
                  ? 'Povucite slike ovdje ili kliknite za odabir'
                  : compact
                    ? 'Dodaj sliku'
                    : 'Povucite sliku ovdje ili kliknite za odabir'
                }
              </p>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export { ImageUpload };
