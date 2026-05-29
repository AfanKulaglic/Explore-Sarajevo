'use client';

import * as React from 'react';
import { Upload, X, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VideoUploadProps {
  value?: string | null;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  className?: string;
  accept?: string;
  /** Supabase Storage bucket name (e.g. 'sarayaconnect-hotspot'). Defaults to 'sarayaconnect-es'. */
  uploadBucket?: string;
  /** Folder path within the bucket (e.g. 'hero-videos'). */
  uploadFolder?: string;
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  value,
  onChange,
  label,
  error,
  className,
  accept = 'video/*',
  uploadBucket,
  uploadFolder,
}) => {
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
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
        onChange(data.url);
        setUploadProgress(100);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        console.error('[VideoUpload] Server error:', response.status, errorData);
        setUploadError(errorData.details || errorData.error || `Upload failed (${response.status})`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('Network error during upload');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemove = () => {
    onChange('');
    setUploadProgress(0);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length) {
      handleUpload(files);
    }
  };
  
  return (
    <div className={cn('w-full', className)}>
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
      
      {/* Video preview when we have a URL */}
      {value && (
        <div className="relative group mb-3">
          <video
            src={value}
            className="w-full h-48 object-cover rounded-lg border bg-black"
            controls
            preload="metadata"
          />
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
              onClick={handleRemove}
              className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4 inline mr-1" />
              Ukloni
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
        </div>
      )}
      
      {/* Upload zone when no video */}
      {!value && (
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            isUploading 
              ? 'border-blue-300 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          )}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !isUploading && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div className="space-y-2">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              <Video className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Klikni za upload ili drag & drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                MP4, WebM, MOV (max 100MB)
              </p>
            </>
          )}
        </div>
      )}
      
      {/* Show URL if available */}
      {value && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 truncate" title={value}>
            URL: {value}
          </p>
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default VideoUpload;
export { VideoUpload };
