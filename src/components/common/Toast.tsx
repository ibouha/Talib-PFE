import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const toastColors: Record<ToastType, string> = {
  success: 'bg-success-100 text-success-800',
  error: 'bg-error-100 text-error-800',
  info: 'bg-primary-100 text-primary-800',
  warning: 'bg-warning-100 text-warning-800',
};

const Toast = ({ message, type = 'info', duration = 3000, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center space-x-2 ${toastColors[type]}`}
      role="alert"
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-lg font-bold text-gray-400 hover:text-gray-700 focus:outline-none"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
