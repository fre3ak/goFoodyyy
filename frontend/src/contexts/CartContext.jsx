// src/context/CartContext.jsx
import { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Add item to cart
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
};

    // Get total items in cart
    const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Remove item from cart
    const removeFromCart = (productId) => {
      setCart(prev => prev.filter(item => item.id !== productId));
    };

    // Clear Cart function
    const clearCart = () => {
      setCart([]);
    };
    
    return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, cartQuantity }}>
        {children}
    </CartContext.Provider>
    );

    
};

export const useCart = () => useContext(CartContext);