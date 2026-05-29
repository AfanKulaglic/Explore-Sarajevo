'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  message: string;
  onClose?: () => void;
  duration?: number;
  className?: string;
}

const Toast: React.FC<ToastProps> = ({
  type = 'info',
  message,
  onClose,
  duration = 3000,
  className
}) => {
  React.useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const styles = {
    info: {
      bg: 'bg-blue-600',
      text: 'text-white',
      icon: Info
    },
    success: {
      bg: 'bg-emerald-600',
      text: 'text-white',
      icon: CheckCircle
    },
    warning: {
      bg: 'bg-amber-500',
      text: 'text-white',
      icon: AlertCircle
    },
    error: {
      bg: 'bg-red-600',
      text: 'text-white',
      icon: XCircle
    }
  };
  
  const style = styles[type];
  const Icon = style.icon;
  
  return (
    <div className={cn(
      'flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg',
      style.bg,
      style.text,
      className
    )}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 p-0.5 rounded hover:bg-white/20 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

// Toast Container - renders toasts in a fixed position without affecting layout
export interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastProps['type'];
    message: string;
  }>;
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  position = 'top-right'
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  if (toasts.length === 0) return null;

  return (
    <div className={cn(
      'fixed z-50 flex flex-col gap-2',
      positionClasses[position]
    )}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = React.useState<Array<{
    id: string;
    type: ToastProps['type'];
    message: string;
  }>>([]);

  const addToast = React.useCallback((message: string, type: ToastProps['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = React.useCallback((message: string) => addToast(message, 'success'), [addToast]);
  const error = React.useCallback((message: string) => addToast(message, 'error'), [addToast]);
  const info = React.useCallback((message: string) => addToast(message, 'info'), [addToast]);
  const warning = React.useCallback((message: string) => addToast(message, 'warning'), [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };
}

export { Toast, ToastContainer };
