import { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = uuidv4();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 5000); // Auto-dismiss after 5 seconds
  }, []);

  const value = { addToast, toasts };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};