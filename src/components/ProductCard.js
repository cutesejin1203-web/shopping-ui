import React from 'react';
import styled from 'styled-components';
// Swiper 리액트 컴포넌트 가져오기
import { Swiper, SwiperSlide } from 'swiper/react';
// 사용할 Swiper 모듈 (자동재생, 밑에 점찍기)
import { Autoplay, Pagination } from 'swiper/modules';

// [필수] Swiper 기본 CSS 스타일 불러오기! (이거 없으면 화면 다 깨짐)
import 'swiper/css';
import 'swiper/css/pagination';

const Card = styled.div`
  position: relative; /* 💡 삭제 버튼의 위치 기준점! */
  width: 100%; 
  max-width: 320px; 
  background: #000; 
  color: #fff;
  border: 1px solid #333; 
  overflow: hidden; 
  cursor: pointer;
  transition: transform 0.3s ease;
  &:hover { transform: translateY(-5px); border-color: #fff; }
`;

const Info = styled.div`
  padding: 20px; 
  text-align: center;
`;

// 🗑️ 관리자용 삭제 버튼 스타일 
const DeleteBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  z-index: 10; /* 사진(Swiper)보다 위에 보이게! */
  &:hover { background: #d9363e; }
`;

// 백엔드에서 넘어온 상품 데이터 하나(product)를 받아서 그림
const ProductCard = ({ item, isAdmin, onDelete, onClick }) => { // 👈 onClick 프롭스 추가!
  // 사진 배열이 없으면 기본 이미지 하나 띄우기
  const images = item.itemImgList && item.itemImgList.length > 0
    ? item.itemImgList
    : [{ imgUrl: '/assets/no-image.png' }];

  return (
    <Card onClick={onClick}> {/* 👈 카드 전체 영역에 클릭 이벤트 연결! */}
      {/* 👑 관리자일 때만 삭제 버튼이 짠! 나타남 */}
      {isAdmin && (
        <DeleteBtn onClick={(e) => {
          e.stopPropagation(); // 카드 클릭 시 상세페이지로 넘어가는 것 방지!
          if (window.confirm('이 상품을 정말 삭제할까요?')) {
            onDelete(item.id); // 부모 컴포넌트에 삭제할 상품의 ID 전달
          }
        }}>
          삭제
        </DeleteBtn>
      )}

      {/* 🚀 여기가 바로 사진이 실시간으로 넘어가는 마법의 구역! */}
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1} // 한 번에 한 장씩 보여줌
        pagination={{ clickable: true }} // 밑에 동그란 점 누르면 이동 가능
        autoplay={{ delay: 3000, disableOnInteraction: false }} // 3초마다 알아서 다음 사진으로!
        style={{ width: '100%', height: '350px' }}
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <img
              // 백엔드 서버 주소 + 이미지 경로
                src={item.imgUrl || "/assets/no-image.png"} /* 💡 10년 차 매의 눈: map의 'img' 객체에서 URL을 꺼내야 해! */
                alt={item.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 상품명 & 가격 정보 */}
      <Info>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: 500 }}>
          {item.name}
        </h3>
        <p style={{ margin: 0, color: '#aaa', letterSpacing: '1px' }}>
          {item.price.toLocaleString()} 원
        </p>
      </Info>
    </Card>
  );
};

export default ProductCard;