import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useItems } from '@/hooks/useItems';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext'; // 🚀 [핵심 추가] 인증 컨텍스트 가져오기!
import { ArrowLeft, Settings, Trash2 } from 'lucide-react';

// ==========================================
// 🎨 Styled Components
// ==========================================
const DetailWrapper = styled.div`
  background: #000; color: #fff; min-height: 100vh; padding: 100px 10%;
  display: grid; grid-template-columns: 1fr 1fr; gap: 50px;
`;

const CarouselContainer = styled.div`
  width: 100%;
  aspect-ratio: 3/4;
  overflow: hidden;
  position: relative;
`;

const Slider = styled(motion.div)`
  display: flex;
  width: 100%;
  height: 100%;
`;

const Slide = styled.div`
  min-width: 100%;
  height: 100%;
`;

const SlideImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DotContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
`;

const Dot = styled.div`
  width: 10px; height: 10px; border-radius: 50%;
  background: ${props => props.$active ? '#fff' : '#444'};
  cursor: pointer; transition: background 0.3s ease;
`;

// ==========================================
// 🚀 Main Component
// ==========================================
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, loading } = useItems();
  const { addToCart } = useCart();

  // 🚀 [변경] 하드코딩 지우고 AuthContext에서 진짜 관리자 여부 뽑아오기!
  const { isAdmin } = useAuth();

  const product = items?.find(item => item.itemId === parseInt(id));

  // 🚀 삭제 핸들러
  const handleDelete = async () => {
    if (window.confirm("정말로 이 상품을 아카이브에서 삭제하시겠습니까?")) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/items/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        alert("상품이 성공적으로 삭제되었습니다.");
        navigate('/'); // 삭제 후 메인 화면으로 복귀
      } catch (error) {
        console.error("상품 삭제 에러:", error);
        alert("삭제 중 오류가 발생했습니다. 권한을 확인해 주세요.");
      }
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
  };

  const [currentIndex, setCurrentIndex] = useState(0);

  const images = product?.itemImgList && product.itemImgList.length > 0
    ? product.itemImgList
    : [{ imgUrl: product?.imgUrl || '/assets/no-image.png' }];

  // 3초 자동 슬라이드 타이머
  useEffect(() => {
    if (!images || images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (loading) return <div style={{color:'#fff', padding:'100px'}}>Loading Archive...</div>;
  if (!product) return <div style={{color:'#fff', padding:'100px'}}>존재하지 않거나 삭제된 상품입니다.</div>;

  return (
    <DetailWrapper>
      {/* 뒤로 가기 버튼 */}
      <ArrowLeft
        onClick={() => navigate(-1)}
        style={{ position:'fixed', top:'40px', left:'40px', cursor:'pointer', zIndex:10 }}
      />

      {/* 좌측: 이미지 슬라이더 영역 */}
      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
        <CarouselContainer>
          <Slider
            animate={{ x: `-${currentIndex * 100}%` }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          >
            {images.map((img, index) => (
              <Slide key={index}>
                <SlideImage
                  src={img.imgUrl}
                  alt={`${product.name} 상세 이미지 ${index + 1}`}
                />
              </Slide>
            ))}
          </Slider>
        </CarouselContainer>

        {images.length > 1 && (
          <DotContainer>
            {images.map((_, index) => (
              <Dot
                key={index}
                $active={index === currentIndex}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </DotContainer>
        )}
      </motion.div>

      {/* 우측: 상품 정보 및 버튼 영역 */}
      <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
        <p style={{ letterSpacing: '5px', color: '#888' }}>PREMIUM ARCHIVE</p>
        <h1 style={{ fontSize: '3.5rem', fontFamily: 'Playfair Display', margin: '20px 0' }}>{product.name}</h1>

        {product.description && (
          <p style={{ fontSize: '1.2rem', color: '#ccc', marginBottom: '30px', lineHeight: '1.6' }}>{product.description}</p>
        )}

        <p style={{ fontSize: '1.5rem', marginBottom: '40px' }}>₩ {product.price?.toLocaleString()}</p>

        {/* 장바구니 버튼 */}
        <button
          onClick={handleAddToCart}
          style={{
            width: '100%', padding: '20px', background: '#fff', color: '#000',
            border: 'none', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '2px'
          }}
        >
          ADD TO CART
        </button>

        {/* 🚀 관리자 전용 버튼 영역 (수정 & 삭제 가로 배치) */}
        {isAdmin && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            {/* 수정 버튼 */}
            <button
              onClick={() => navigate(`/admin/product/edit/${product.itemId}`)}
              style={{
                flex: 1, padding: '20px', background: 'transparent', color: '#888',
                border: '1px solid #444', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: '0.3s'
              }}
              onMouseOver={(e) => { e.target.style.color = '#fff'; e.target.style.borderColor = '#fff'; }}
              onMouseOut={(e) => { e.target.style.color = '#888'; e.target.style.borderColor = '#444'; }}
            >
              <Settings size={18} /> EDIT
            </button>

            {/* 삭제 버튼 */}
            <button
              onClick={handleDelete}
              style={{
                flex: 1, padding: '20px', background: 'transparent', color: '#888',
                border: '1px solid #444', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: '0.3s'
              }}
              onMouseOver={(e) => { e.target.style.color = '#ff4d4f'; e.target.style.borderColor = '#ff4d4f'; }}
              onMouseOut={(e) => { e.target.style.color = '#888'; e.target.style.borderColor = '#444'; }}
            >
              <Trash2 size={18} /> DELETE
            </button>
          </div>
        )}
      </motion.div>
    </DetailWrapper>
  );
};

export default ProductDetail;