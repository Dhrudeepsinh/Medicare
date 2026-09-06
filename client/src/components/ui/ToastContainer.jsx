import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const icons = {
  success: { icon: CheckCircle, bg: 'bg-green-50 border-green-200', text: 'text-green-800', icon_class: 'text-green-500' },
  error: { icon: XCircle, bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon_class: 'text-red-500' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', icon_class: 'text-amber-500' },
  info: { icon: Info, bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', icon_class: 'text-blue-500' },
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const config = icons[t.type] || icons.info;
        const Icon = config.icon;
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg pointer-events-auto animate-slideIn ${config.bg}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.icon_class}`} />
            <p className={`text-sm flex-1 font-medium ${config.text}`}>{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className={`flex-shrink-0 ${config.text} opacity-60 hover:opacity-100`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
