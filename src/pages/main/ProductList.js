import React, { useState, useEffect } from 'react'; // 🚀 [추가] useState, useEffect 불러오기
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useItems } from '../../hooks/useItems';
// import ProductCard from '../../components/ProductCard'; // 👈 외부 컴포넌트 안 쓰고 여기에 직접 정의할게!
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trash2 } from 'lucide-react'; // 👈 삭제 아이콘용

const Section = styled.section`
  padding: 150px 5vw;
  background: #000;
`;

const SectionTitle = styled(motion.h2)`
  font-family: 'Playfair Display', serif;
  font-size: 3.5rem;
  margin-bottom: 80px;
  font-weight: 700;
  color: #fff;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 100px 50px;
`;

// ==========================================
// 🚀 [추가] 슬라이더 기능이 장착된 새로운 상품 카드 스타일 정의
// ==========================================
const Card = styled.div`
  cursor: pointer;
  position: relative;
`;

// [캐러셀 창문] 비율을 딱 잡아주고 튀어나가는 사진 가림! (핵심!)
const ImageWindow = styled.div`
  width: 100%;
  aspect-ratio: 1/1; /* 메인 목록은 1:1 비율 감성 */
  overflow: hidden;
  position: relative;
  background-color: #1a1a1a; /* 로딩 전 배경색 */
`;

// [슬라이더 트랙] 가로로 기차처럼 쫙 세움!
const SliderTrack = styled(motion.div)`
  display: flex; 
  width: 100%;
  height: 100%;
`;

const Slide = styled.div`
  min-width: 100%; /* 부모 너비를 꽉 채움 (한 장씩 보임) */
  height: 100%;
  position: relative; /* 💡 사진 위에 뱃지를 띄우기 위해 필요! */
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DotIndicator = styled.div`
  position: absolute; bottom: 15px; left: 50%;
  transform: translateX(-50%);
  display: flex; gap: 8px;
`;

const Dot = styled.div`
  width: 8px; height: 8px; border-radius: 50%;
  background: ${props => props.$active ? '#fff' : 'rgba(255,255,255,0.3)'};
  transition: background 0.3s;
`;

const TextInfo = styled.div`
  margin-top: 25px;
  text-align: center;
  font-family: 'Playfair Display', serif;
`;

const ProductName = styled.p`
  font-size: 1.1rem; color: #fff; letter-spacing: 1px;
  display: flex; align-items: center; justify-content: center; gap: 10px;
`;

const ProductPrice = styled.p`
  font-size: 1rem; color: #888; margin-top: 5px;
`;

// 🚀 [추가] 카테고리 뱃지 스타일
const CategoryBadge = styled.span`
  background: #333; color: #fff; font-size: 0.7rem; padding: 3px 8px;
  border-radius: 12px; font-family: sans-serif; letter-spacing: 0;
`;

// 🚀 [추가] NEW 뱃지 스타일 (사진 위에 띄울 거면 position: absolute 필요할 수도 있지만 요청대로 추가!)
const NewBadge = styled.span`
  position: absolute; 
  top: 15px; 
  left: 15px;
  background: #ff4d4f; color: #fff; font-size: 0.7rem; padding: 3px 8px;
  border-radius: 12px; font-family: sans-serif; font-weight: bold; letter-spacing: 1px;
  z-index: 10;
`;

// 🚀 [추가] 관리자 전용 삭제 아이콘 (빨간색 휴지통)
const AdminDeleteIcon = styled.div`
  position: absolute; top: 15px; right: 15px;
  background: rgba(0,0,0,0.6); color: #ff4444; border-radius: 50%;
  width: 40px; height: 40px;
  display: flex; justify-content: center; align-items: center;
  z-index: 10;
  cursor: pointer;
  transition: background 0.3s;
  &:hover { background: rgba(0,0,0,1); }
`;
// ==========================================

// ==========================================
// 🚀 [추가] 3초 자동 슬라이더가 탑재된 미니 상품 카드 컴포넌트
// ==========================================
const LuxProductCard = ({ item, isAdmin, onDelete, onClick }) => {
    console.log('item:',item);
  // 사진 여러 장 가져오기 (배열이 없으면 기본 이미지 처리)
  const images = item.itemImgList && item.itemImgList.length > 0
    ? item.itemImgList
    : [{ imgUrl: item.imgUrl || '/assets/no-image.png' }];

  // 현재 인덱스 상태
  const [currentIndex, setCurrentIndex] = useState(0);

  // 3초 자동 타이머 마법!
  useEffect(() => {
    if (!images || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <Card onClick={onClick}>

      {/* 관리자일 때만 휴지통 아이콘 표시 */}
      {isAdmin && (
        <AdminDeleteIcon onClick={(e) => {
          e.stopPropagation(); // 🚀 부모 클릭 방지
          onDelete();
        }}>
          <Trash2 size={20} />
        </AdminDeleteIcon>
      )}

      {/* [캐러셀 창문 영역] */}
      <ImageWindow>
        <SliderTrack
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }} // 스와이프 감성
        >
          {images.map((img, index) => (
            <Slide key={index}>
              {/* 🚀 요청하신 NEW 뱃지를 사진(Slide) 안으로 쏙! */}
              {item.new && <NewBadge>NEW</NewBadge>}
              <ProductImage
                src={img.imgUrl}
                alt={`${item.name} 사진 ${index + 1}`}
              />
            </Slide>
          ))}
        </SliderTrack>

        {images.length > 1 && (
          <DotIndicator>
            {images.map((_, index) => (
              <Dot key={index} $active={index === currentIndex} />
            ))}
          </DotIndicator>
        )}
      </ImageWindow>

      {/* 텍스트 정보 */}
      <TextInfo>
        <ProductName>
            {item.category && <CategoryBadge>{item.category}</CategoryBadge>}
            {item.name}
        </ProductName>
        <ProductPrice>₩ {item.price?.toLocaleString()}</ProductPrice>
      </TextInfo>
    </Card>
  );
};
// ==========================================


// 🚀 [추가] 카테고리 탭 버튼 디자인
const CategoryTabContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 50px;
`;

const CategoryTab = styled.button`
  background: none;
  border: none;
  color: ${props => props.$active ? '#fff' : '#888'};
  font-size: 1.2rem;
  font-family: 'Playfair Display', serif;
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  cursor: pointer;
  padding-bottom: 5px;
  border-bottom: 2px solid ${props => props.$active ? '#fff' : 'transparent'};
  transition: all 0.3s ease;

  &:hover {
    color: #fff;
  }
`;


const ProductList = () => {
  const { items, loading } = useItems();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 🚀 URL에서 category 파라미터 읽어오기 (기본값 ALL)
  const queryParams = new URLSearchParams(location.search);
  const currentCategory = queryParams.get('category') || 'ALL';

  // 삭제 
  const handleDelete = async (itemId) => {
    try {
      await axios.delete(`/api/admin/items/${itemId}`);
      alert('상품이 깔끔하게 삭제됐어! 🗑️');
      window.location.reload();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('상품 삭제 중 문제가 발생했어. 서버 상태를 확인해 봐!');
    }
  };

  // 카테고리 탭 클릭 시 파라미터 변경
  const handleCategoryChange = (cat) => {
    navigate(`/?category=${cat}`);
  };

  if (loading) return <div style={{color: '#fff', padding: '150px 5vw'}}>Loading Archive...</div>;

  // 🚀 선택된 카테고리에 따라 아이템 필터링
  const filteredItems = items?.filter(item => 
    currentCategory === 'ALL' ? true : item.category === currentCategory
  );

  return (
    <Section>
      <SectionTitle
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{ textAlign: 'center' }} 
      >
        PREMIUM ARCHIVE
      </SectionTitle>

      {/* 🚀 카테고리 탭 영역 */}
      <CategoryTabContainer>
        {['ALL', 'TOP', 'BOTTOM', 'OUTER', 'ACCESSORY'].map((cat) => (
          <CategoryTab
            key={cat}
            $active={currentCategory === cat}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </CategoryTab>
        ))}
      </CategoryTabContainer>

      <Grid>
        {filteredItems && filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <LuxProductCard
              key={item.itemId}
              item={item}
              isAdmin={isAdmin}
              onDelete={() => handleDelete(item.itemId)}
              onClick={() => navigate(`/product/${item.itemId}`)}
            />
          ))
        ) : (
          <div style={{color: '#fff', gridColumn: '1 / -1', textAlign: 'center', marginTop: '50px', fontSize: '1.2rem'}}>
            해당 카테고리의 상품이 아직 없습니다.
          </div>
        )}
      </Grid>
    </Section>
  );
};

export default ProductList;