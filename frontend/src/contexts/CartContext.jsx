import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const localData = localStorage.getItem('gofoodyyy_cart');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('gofoodyyy_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartQuantity = cart.reduce((total, item) => total + item.quantity, 0);

  const value = { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartQuantity };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}