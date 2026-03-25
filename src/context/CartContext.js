import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartApi } from '../api/cartApi';
import { useAuth } from './AuthContext';

// 1. 컨텍스트 생성 (데이터 보관함)
const CartContext = createContext();

// 2. 공급자(Provider) 컴포넌트
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { isLoggedIn } = useAuth(); // 로그인 상태 구독

  // 💡 [핵심] 로그인 했을 때만 DB에서 장바구니를 가져오고, 로그아웃 되면 싹 비운다!
  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [isLoggedIn]);

  // DB에서 내 장바구니 리스트 불러오기
  const fetchCart = async () => {
    try {
      const response = await cartApi.getCartItems();
      setCartItems(response.data);
    } catch (error) {
      console.error('장바구니 로딩 실패 🥲', error);
    }
  };

  // [기능 1] 장바구니 추가 (DB 연동)
  const addToCart = async (product) => {
    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다! 🔒');
      return;
    }

    try {
      // 백엔드 API 맞춰서 DTO 보내기 (itemId, quantity)
      await cartApi.addToCart({ itemId: product.itemId, quantity: 1 });
      
      // DB에 반영 성공하면 내 리스트 다시 갱신 (서버가 주는 ID값들이 필요하니까)
      fetchCart();
      alert(`${product.name}이 장바구니에 담겼습니다. 🛒`);
    } catch (error) {
      console.error('장바구니 추가 에러 💥', error);
      alert('장바구니에 담지 못했어요.');
    }
  };

  // [기능 2] 장바구니 삭제 (DB 연동)
  const removeFromCart = async (cartItemId) => {
    try {
      await cartApi.removeFromCart(cartItemId);
      // 지우고 나서 리스트 다시 그리기
      fetchCart();
    } catch (error) {
      console.error('장바구니 삭제 에러 💥', error);
    }
  };

  // [기능 3] 수량 조절 (DB 연동)
  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // UI 먼저 빠르게 쓱 바꿔주기 (Optimistic UI) - 답답함 방지용
    setCartItems(prev => prev.map(item =>
      item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
    ));

    try {
      await cartApi.updateQuantity(cartItemId, newQuantity);
    } catch (error) {
      // 실패하면 다시 원복하거나 재조회
      console.error('수량 변경 에러 💥', error);
      fetchCart();
    }
  };

  // 실시간 개수 계산
  const cartCount = cartItems.length;

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

// 3. 커스텀 훅 (다른 파일에서 편하게 쓰기 위해)
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
