// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { CartProvider } from './contexts/CartContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* AuthProvider and ToastProvider are now in App.jsx */}
    {/* CartProvider needs to wrap the App to provide cart context */}
      <CartProvider>
        <App />
      </CartProvider>
  </React.StrictMode>
);
