import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext'; // 경로 주의!
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 🚀 백엔드 통신을 위해 추가!

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
  // 💡 장바구니 비우기 함수(clearCart)가 Context에 있다면 꺼내 쓰는 걸 추천!
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  // 총 합계 금액 계산
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // 🚀 [핵심] 결제 처리 로직
  const handleCheckout = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert("결제를 위해 로그인이 필요합니다.");
      navigate('/login');
      return;
    }

    try {
      // 🚀 [STEP 1. 사전 검증] 백엔드에 결제 대기(READY) 주문 생성 요청
      // 클라이언트의 총 결제 금액을 백엔드에 보내서 조작이 없는지 확인받음
      const readyResponse = await axios.post(`${process.env.REACT_APP_API_URL || ''}/api/orders/ready`, {
        requestAmount: totalPrice // 백엔드의 ReadyRequest DTO 필드명과 일치해야 함
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 백엔드가 확인해준 안전한 데이터 꺼내기
      const { merchantUid, amount, buyerEmail, buyerName } = readyResponse.data;

      // 🚀 [STEP 2. 결제창 호출] 포트원(Iamport) 객체 초기화
      const { IMP } = window;
      if (!IMP) {
        alert("결제 모듈을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.");
        return;
      }

      // 💡 포트원 관리자 콘솔 -> 내 정보 -> '가맹점 식별코드' (imp... 로 시작하는 값 입력 필수!)
      IMP.init('imp_00000000'); // TODO: 본인의 진짜 가맹점 식별코드로 변경!

      const payData = {
        pg: 'html5_inicis',         // PG사 세팅 (테스트용 이니시스)
        pay_method: 'card',         // 결제 수단
        merchant_uid: merchantUid,  // [중요] 백엔드에서 생성해준 주문번호
        name: 'GCP ARCHIVE 프리미엄 상품 결제', // 결제창에 뜰 상품명
        amount: amount,             // [중요] 백엔드에서 픽스해준 진짜 금액
        buyer_email: buyerEmail,
        buyer_name: buyerName,
      };

      // 포트원 결제창 띄우기
      IMP.request_pay(payData, async (rsp) => {
        if (rsp.success) {
          // 🚀 [STEP 3. 사후 검증] 결제가 정상 승인되면 우리 백엔드에 한 번 더 확인!
          try {
            await axios.post(`${process.env.REACT_APP_API_URL || ''}/api/orders/verify`, {
              impUid: rsp.imp_uid,           // 포트원이 발급한 고유 결제번호
              merchantUid: rsp.merchant_uid  // 우리가 만든 주문번호
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });

            alert("결제가 성공적으로 완료되었습니다! 🎉");

            // 💡 실무 팁: 여기서 장바구니를 비워주는 로직(clearCart)을 실행해줘
            // if (clearCart) clearCart();

            navigate('/'); // 결제 성공 시 메인화면(또는 주문 내역 페이지)으로 이동

          } catch (verifyError) {
            console.error("결제 사후 검증 실패:", verifyError);
            alert("결제는 승인되었으나 서버 검증에 실패했습니다. 관리자에게 문의하세요.");
            // 💡 실무에선 이 상황이 오면 백엔드가 알아서 포트원 환불 API를 쏴야 해.
          }
        } else {
          // 사용자가 결제창을 닫거나 한도 초과 등 실패한 경우
          alert(`결제 실패: ${rsp.error_msg}`);
        }
      });

    } catch (error) {
      console.error("결제 준비 중 오류:", error);
      alert("주문 생성 중 문제가 발생했습니다. (금액 변조 위심 또는 서버 오류)");
    }
  };

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

      {cartItems.map((item) => {
        // 이미지 방어 로직 (itemImgList 구조 대비)
        const displayImg = item.itemImgList && item.itemImgList.length > 0
          ? item.itemImgList[0].imgUrl
          : (item.imgUrl || '/assets/no-image.png');

        return (
          <motion.div key={item.cartItemId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CartItem>
              <img
                src={displayImg}
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
        );
      })}

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