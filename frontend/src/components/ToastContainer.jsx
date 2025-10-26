import { useToast } from '../contexts/ToastContext';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const icons = {
  success: <CheckCircle size={20} />,
  error: <XCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <Info size={20} />,
};

const toastStyles = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
};

export default function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-8 right-8 z-[100] space-y-3">
      {toasts.map((toast) => (
        <div key={toast.id} className={`flex items-center gap-3 p-4 rounded-lg shadow-lg animate-fade-in-right ${toastStyles[toast.type]}`}>
          {icons[toast.type]}
          <span className="font-medium">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}