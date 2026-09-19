import React from 'react';
import { useData } from '../context/DataContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = () => {
  const { toasts, removeToast } = useData();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let color = '#34d399';
        if (toast.type === 'error') {
          Icon = AlertCircle;
          color = '#f87171';
        } else if (toast.type === 'info') {
          Icon = Info;
          color = '#60a5fa';
        }

        return (
          <div key={toast.id} className="toast" role="alert">
            <Icon size={20} color={color} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.92rem', fontWeight: 600, flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-subtle)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px'
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
