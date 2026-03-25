import React, { useState, useEffect } from 'react'; // 🚀 [추가] useState와 useEffect 불러오기!
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useItems } from '../../hooks/useItems';
// 🚨 주의: hooks/useCart.js 가 아니라 context/CartContext.js 의 useCart를 가져와야 해!
import { useCart } from '../../context/CartContext';
import { ArrowLeft } from 'lucide-react';

const DetailWrapper = styled.div`
  background: #000; color: #fff; min-height: 100vh; padding: 100px 10%;
  display: grid; grid-template-columns: 1fr 1fr; gap: 50px;
`;

// ==========================================
// 🚀 [추가] 슬라이더(캐러셀)를 위한 전용 스타일
// ==========================================
const CarouselContainer = styled.div`
  width: 100%;
  aspect-ratio: 3/4; /* 기존 사진 비율 유지 */
  overflow: hidden; /* 창문 밖으로 나가는 사진들 숨기기! */
  position: relative;
`;

const Slider = styled(motion.div)`
  display: flex; /* 사진들을 가로로 한 줄로 기차처럼 쫙 세우기 */
  width: 100%;
  height: 100%;
`;

const Slide = styled.div`
  min-width: 100%; /* 부모(창문) 너비를 꽉 채우기 */
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
  background: ${props => props.$active ? '#fff' : '#444'}; /* 현재 사진만 하얗게 불 켜기! */
  cursor: pointer; transition: background 0.3s ease;
`;
// ==========================================

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, loading } = useItems();
  const { addToCart } = useCart(); // 이제 DB 연동되는 진짜 장바구니 훅이야!

  const product = items?.find(item => item.itemId === parseInt(id));

  const handleAddToCart = () => {
    // 💡 로그인 여부는 CartContext 내부 addToCart에서도 검사하니까 그냥 호출하면 돼!
    addToCart(product);
  };

  // 🚀 [추가] 현재 몇 번째 사진을 보고 있는지 기억하는 State
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = product?.itemImgList && product.itemImgList.length > 0
    ? product.itemImgList
    : [{ imgUrl: product?.imgUrl || '/assets/no-image.png' }];

  // 🚀 [핵심 추가] 3초마다 자동으로 사진 넘겨주는 마법의 타이머!
  useEffect(() => {
    // 사진이 1장 이하면 슬라이드 할 필요가 없으니 탈출!
    if (!images || images.length <= 1) return;

    // 3초(3000ms)마다 인덱스 1씩 증가 (마지막 사진이면 다시 0번으로!)
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    // 컴포넌트 꺼질 때 타이머 정리(메모리 누수 방지)
    return () => clearInterval(timer);
  }, [images.length]);

  if (loading) return <div style={{color:'#fff', padding:'100px'}}>Loading Archive...</div>;
  if (!product) return <div style={{color:'#fff', padding:'100px'}}>존재하지 않거나 삭제된 상품입니다.</div>;

  return (
    <DetailWrapper>
      <ArrowLeft
        onClick={() => navigate(-1)}
        style={{ position:'fixed', top:'40px', left:'40px', cursor:'pointer', zIndex:10 }}
      />

      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
        {/* 🚀 [변경] 위아래로 뿌리던 <img> 태그들을 지우고 슬라이더로 교체! */}
        <CarouselContainer>
          <Slider
            // 현재 인덱스(0, 1, 2...)에 따라 가로(x축)로 -100%, -200%씩 이동시킴!
            animate={{ x: `-${currentIndex * 100}%` }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }} // 부드러운 스와이프 감성
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

        {/* 🚀 [추가] 사진이 2장 이상일 때만 하단 동그라미(인디케이터) 띄우기 */}
        {images.length > 1 && (
          <DotContainer>
            {images.map((_, index) => (
              <Dot
                key={index}
                $active={index === currentIndex}
                onClick={() => setCurrentIndex(index)} // 동그라미 누르면 그 사진으로 휙!
              />
            ))}
          </DotContainer>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
        <p style={{ letterSpacing: '5px', color: '#888' }}>PREMIUM ARCHIVE</p>
        <h1 style={{ fontSize: '3.5rem', fontFamily: 'Playfair Display', margin: '20px 0' }}>{product.name}</h1>

        {product.description && (
          <p style={{ fontSize: '1.2rem', color: '#ccc', marginBottom: '30px', lineHeight: '1.6' }}>{product.description}</p>
        )}

        <p style={{ fontSize: '1.5rem', marginBottom: '40px' }}>₩ {product.price?.toLocaleString()}</p>

        <button
          onClick={handleAddToCart}
          style={{
            width: '100%', padding: '20px', background: '#fff', color: '#000',
            border: 'none', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '2px'
          }}
        >
          ADD TO CART
        </button>
      </motion.div>
    </DetailWrapper>
  );
};

export default ProductDetail;