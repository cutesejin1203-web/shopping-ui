import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowRight, ChevronRight } from 'lucide-react';
import axios from 'axios';

// ==========================================
// 🎨 Styled Components
// ==========================================
const HistoryWrapper = styled.div`
  background: #000; color: #fff; min-height: 100vh; padding: 150px 10% 100px;
`;

const EmptyBox = styled.div`
  text-align: center; display: flex; flex-direction: column; 
  align-items: center; justify-content: center; margin-top: 100px;
`;

const OrderCard = styled(motion.div)`
  border: 1px solid #333; margin-bottom: 40px; padding: 30px;
  background: rgba(255, 255, 255, 0.02);
`;

const OrderHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid #333; padding-bottom: 20px; margin-bottom: 20px;
  @media (max-width: 768px) { flex-direction: column; align-items: flex-start; gap: 10px; }
`;

const OrderDate = styled.div`
  font-size: 1.1rem; font-weight: bold;
  span { color: #888; font-size: 0.9rem; font-weight: normal; margin-left: 10px; }
`;

const StatusBadge = styled.div`
  padding: 8px 15px; font-size: 0.85rem; font-weight: bold; letter-spacing: 1px;
  background: ${(props) => {
    switch(props.$status) {
      case 'PAID': return '#fff';
      case 'READY': return '#444';
      case 'CANCELLED': return '#ff4d4d';
      default: return '#333';
    }
  }};
  color: ${(props) => props.$status === 'PAID' ? '#000' : '#fff'};
`;

const OrderItem = styled.div`
  display: flex; align-items: center; gap: 30px; margin-bottom: 20px;
  &:last-child { margin-bottom: 0; }
  @media (max-width: 768px) { flex-direction: column; align-items: flex-start; }
`;

const ItemInfo = styled.div`
  flex: 2;
  h3 { font-family: 'Playfair Display', serif; font-size: 1.5rem; margin-bottom: 10px; }
  p { color: #888; letter-spacing: 1px; font-size: 0.9rem; }
`;

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert("로그인이 필요한 서비스입니다.");
        navigate('/login');
        return;
      }

      try {
        // 🚀 [실무 적용 시 주석 해제] 백엔드에서 주문 내역 가져오기

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data);


        // 💡 [디자인 확인용 Mock 데이터] 백엔드 붙이기 전까지 화면 보려고 임시로 넣은 데이터야!
        setTimeout(() => {
          setOrders([
            {
              orderId: 1,
              orderDate: '2026. 03. 25',
              merchantUid: 'ORD-1711335001',
              status: 'PAID',
              totalAmount: 125000,
              items: [
                { name: 'PREMIUM ARCHIVE JACKET', price: 125000, quantity: 1, imgUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=200' }
              ]
            },
            {
              orderId: 2,
              orderDate: '2026. 03. 20',
              merchantUid: 'ORD-1711281000',
              status: 'READY',
              totalAmount: 45000,
              items: [
                { name: 'ESSENTIAL COTTON TEE', price: 45000, quantity: 1, imgUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200' }
              ]
            }
          ]);
          setLoading(false);
        }, 500); // 0.5초 로딩 효과

      } catch (error) {
        console.error("주문 내역 불러오기 실패:", error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading) return <HistoryWrapper style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading Archive...</HistoryWrapper>;

  return (
    <HistoryWrapper>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontFamily: 'Playfair Display', fontSize: '3.5rem', marginBottom: '60px' }}
      >
        ORDER HISTORY
      </motion.h1>

      {orders.length === 0 ? (
        <EmptyBox>
          <Package size={80} style={{ marginBottom: '30px', opacity: 0.2 }} />
          <h1 style={{ fontSize: '2.5rem', marginBottom: '30px', fontWeight: '300' }}>No orders found.</h1>
          <button
            onClick={() => navigate('/')}
            style={{ background: '#fff', color: '#000', padding: '15px 40px', border: 'none', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '2px' }}
          >
            START SHOPPING
          </button>
        </EmptyBox>
      ) : (
        orders.map((order) => (
          <OrderCard key={order.orderId} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            {/* 주문 헤더: 날짜, 주문번호, 상태 */}
            <OrderHeader>
              <OrderDate>
                {order.orderDate} <span>| No. {order.merchantUid}</span>
              </OrderDate>
              <StatusBadge $status={order.status}>
                {order.status === 'PAID' ? '결제 완료' : order.status === 'READY' ? '입금 대기' : '주문 취소'}
              </StatusBadge>
            </OrderHeader>

            {/* 주문 상품 목록 */}
            {order.items.map((item, idx) => (
              <OrderItem key={idx}>
                <img
                  src={item.imgUrl || '/assets/no-image.png'}
                  alt={item.name}
                  style={{ width: '100px', height: '120px', objectFit: 'cover' }}
                />
                <ItemInfo>
                  <h3>{item.name}</h3>
                  <p>QTY : {item.quantity}</p>
                </ItemInfo>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  ₩ {(item.price * item.quantity).toLocaleString()}
                </div>
              </OrderItem>
            ))}

            {/* 총 합계 및 상세보기 버튼 */}
            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px dashed #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ color: '#888', letterSpacing: '1px' }}>TOTAL</p>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem' }}>₩ {order.totalAmount.toLocaleString()}</h3>
            </div>
          </OrderCard>
        ))
      )}
    </HistoryWrapper>
  );
};

export default OrderHistoryPage;