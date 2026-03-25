import { useState, useEffect } from 'react';

export const useCart = () => {
  const [cartItems, setCartItems] = useState(() => {
    // [포인트] 초기값은 LocalStorage에서 읽어와서 새로고침해도 유지되게!
    const savedCart = localStorage.getItem('premium_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('premium_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems(prev => {
      const isExist = prev.find(item => item.itemId === product.itemId);
      if (isExist) {
        return prev.map(item =>
          item.itemId === product.itemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    alert(`${product.name}이 장바구니에 담겼습니다.`);
  };

  return { cartItems, addToCart, cartCount: cartItems.length };
};