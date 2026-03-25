import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useCart } from '../../../context/CartContext'; // 경로 주의!
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartWrapper = styled.div`
  background: #000; color: #fff; min-height: 100vh; padding: 150px 10% 100px;
`;

const CartItem = styled.div`
  display: flex; align-items: center; padding: 30px 0; border-bottom: 1px solid #222;
  gap: 30px;
  @media (max-width: 768px) { flex-direction: column; align-items: flex-start; }
`;

const ItemInfo = styled.div`
  flex: 2;
  h3 { font-family: 'Playfair Display', serif; font-size: 1.8rem; margin-bottom: 10px; }
  p { color: #888; letter-spacing: 1px; }
`;

const QuantityControl = styled.div`
  display: flex; align-items: center; gap: 20px; border: 1px solid #444; padding: 10px 20px;
`;

const CheckoutBox = styled.div`
  margin-top: 80px; padding: 40px; border: 1px solid #fff;
  display: flex; justify-content: space-between; align-items: center;
  @media (max-width: 768px) { flex-direction: column; gap: 30px; text-align: center; }
`;

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
console.log('cartItems :',cartItems);
  const handleCheckout = () => {
    // 결제 전에 로그인 여부 확인
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert("결제를 위해 로그인이 필요합니다.");
      navigate('/login');
      return;
    }
    alert("결제 페이지로 이동합니다.");
    // 실제 결제 로직 또는 결제 페이지 이동 추가
  };

  // 총 합계 금액 계산
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (cartItems.length === 0) {
    return (
      <CartWrapper style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <ShoppingBag size={80} style={{ marginBottom: '30px', opacity: 0.2 }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '40px', fontWeight: '300' }}>Your bag is empty.</h1>
        <button
          onClick={() => navigate('/')}
          style={{ background: '#fff', color: '#000', padding: '15px 40px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
        >
          CONTINUE SHOPPING
        </button>
      </CartWrapper>
    );
  }

  return (
    <CartWrapper>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontFamily: 'Playfair Display', fontSize: '3.5rem', marginBottom: '60px' }}
      >
        SHOPPING BAG
      </motion.h1>

      {cartItems.map((item) => (
        <motion.div key={item.cartItemId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <CartItem>
            <img
              src={item.imgUrl}
                //src={`https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200&sig=${item.itemId}`}
              alt={item.name}
              style={{ width: '120px', height: '150px', objectFit: 'cover' }}
            />

            <ItemInfo>
              <h3>{item.name}</h3>
              <p>PREMIUM SELECTION</p>
            </ItemInfo>

            <QuantityControl>
              <Minus size={16} cursor="pointer" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} />
              <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
              <Plus size={16} cursor="pointer" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} />
            </QuantityControl>

            <div style={{ flex: 1, textAlign: 'right', fontSize: '1.2rem', fontWeight: 'bold' }}>
              ₩ {(item.price * item.quantity).toLocaleString()}
            </div>

            <Trash2
              size={20}
              color="#666"
              cursor="pointer"
              onClick={() => { if(window.confirm('삭제하시겠습니까?')) removeFromCart(item.cartItemId); }}
              onMouseOver={(e) => e.target.style.color = '#ff4d4d'}
              onMouseOut={(e) => e.target.style.color = '#666'}
            />
          </CartItem>
        </motion.div>
      ))}

      <CheckoutBox>
        <div>
          <p style={{ color: '#888', marginBottom: '10px', fontSize: '0.9rem', letterSpacing: '2px' }}>TOTAL ESTIMATE</p>
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display' }}>₩ {totalPrice.toLocaleString()}</h2>
        </div>
        <button
          onClick={handleCheckout}
          style={{
            background: '#fff', color: '#000', padding: '25px 60px', border: 'none',
            fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer',
            fontSize: '1rem', letterSpacing: '2px'
          }}
        >
          PROCEED TO CHECKOUT <ArrowRight size={20} />
        </button>
      </CheckoutBox>
    </CartWrapper>
  );
};

export default CartPage;