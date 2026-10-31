import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = {
            success: {
              icon: CheckCircle,
              border: 'border-toxic/40',
              bg: 'bg-ink-elevated/95',
              text: 'text-toxic',
            },
            warning: {
              icon: AlertCircle,
              border: 'border-pumpkin/40',
              bg: 'bg-ink-elevated/95',
              text: 'text-pumpkin',
            },
            error: {
              icon: AlertCircle,
              border: 'border-magenta/40',
              bg: 'bg-ink-elevated/95',
              text: 'text-magenta',
            },
            info: {
              icon: Info,
              border: 'border-witchy/40',
              bg: 'bg-ink-elevated/95',
              text: 'text-witchy-light',
            },
          }[toast.type];

          const Icon = config.icon;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto p-4 rounded-xl border ${config.border} ${config.bg} backdrop-blur-md shadow-2xl flex items-start gap-3`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.text}`} />
              <div className="flex-1">
                <h4 className="font-sans font-semibold text-sm text-moonlight">{toast.title}</h4>
                {toast.message && (
                  <p className="font-sans text-xs text-moonlight-muted mt-0.5">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-moonlight-muted hover:text-moonlight p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
