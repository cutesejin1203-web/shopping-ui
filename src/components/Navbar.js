import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Nav = styled.nav`
  position: fixed; 
  top: 0; 
  left: 0;
  width: 100%; 
  box-sizing: border-box; 
  height: 80px;
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  padding: 0 50px; 
  z-index: 99999; 
  background: rgba(0, 0, 0, 0.9); 
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px); 
`;

const Logo = styled(Link)`
  color: #ffffff !important; 
  text-decoration: none; 
  font-family: 'Playfair Display', serif; 
  font-size: 1.5rem; 
  letter-spacing: 4px; 
  font-weight: 900;
  flex: 1; /* 왼쪽 영역 차지 */
`;

// 🚀 [추가] 중앙 카테고리 메뉴 영역
const CategoryMenu = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  flex: 2; /* 중앙 영역 차지 */

  @media (max-width: 768px) {
    display: none; /* 모바일에서는 숨김 처리 (필요시 햄버거 메뉴로 빼야함) */
  }
`;

const CategoryLink = styled.span`
  color: #fff;
  font-size: 0.9rem;
  letter-spacing: 2px;
  cursor: pointer;
  position: relative;
  font-weight: ${props => props.$active ? 'bold' : '300'};
  opacity: ${props => props.$active ? 1 : 0.7};
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: ${props => props.$active ? '100%' : '0'};
    height: 2px;
    background-color: #fff;
    transition: width 0.3s ease;
  }
`;

const RightMenu = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 30px;
  flex: 1; /* 오른쪽 영역 차지 */
`;

const CartLink = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  color: #ffffff !important; 
  text-decoration: none;
  padding: 10px;
`;

const Badge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background: #ff4d4d;
  color: white;
  font-size: 11px;
  font-weight: bold;
  min-width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #000;
`;

const AuthLink = styled(Link)`
  color: #fff;
  text-decoration: none;
  font-size: 0.85rem;
  letter-spacing: 1.5px;
  font-weight: 300;
  &:hover { opacity: 0.7; }
`;

const Navbar = () => {
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation(); // 현재 경로 파악을 위해 추가
  const { isLoggedIn, isAdmin, userName, logout } = useAuth();

  // URL 쿼리 스트링에서 현재 카테고리 읽어오기 (기본값 ALL)
  const queryParams = new URLSearchParams(location.search);
  const currentCategory = queryParams.get('category') || 'ALL';

  const handleLogout = () => {
    logout();
    alert('안전하게 로그아웃 되었습니다.');
    navigate('/');
  };

  const handleCategoryClick = (category) => {
    // 💡 네비바에서 카테고리 누르면, 메인 페이지(/)로 이동하면서 파라미터로 카테고리를 넘김!
    navigate(`/?category=${category}`);
    
    // 만약 이미 메인페이지라면 스크롤을 상품 목록 쪽으로 살짝 내려주는 센스도 좋음 (선택)
    if(location.pathname === '/') {
        window.scrollTo({ top: 800, behavior: 'smooth' }); // 히어로 섹션 아래쯤으로 이동
    }
  };

  const categories = ['ALL', 'TOP', 'BOTTOM', 'OUTER', 'ACCESSORY'];

  return (
    <Nav>
      <Logo to="/">GCP STORE</Logo>
      
      {/* 🚀 [추가] 상단 중앙 카테고리 메뉴 */}
      <CategoryMenu>
        {categories.map(cat => (
          <CategoryLink 
            key={cat}
            $active={currentCategory === cat && location.pathname === '/'} // 메인페이지면서 해당 카테고리일 때만 밑줄!
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </CategoryLink>
        ))}
      </CategoryMenu>

      <RightMenu>
        {!isLoggedIn ? (
          <AuthLink to="/login">SIGN IN</AuthLink>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {isAdmin && (
              <AuthLink to="/admin/product/new" style={{ color: '#ffcc00', fontWeight: 'bold' }}>
                ADD PRODUCT
              </AuthLink>
            )}

            <span style={{ color: '#fff', fontSize: '0.85rem', letterSpacing: '1.5px', fontWeight: 300 }}>
              HELLO, {userName}
            </span>
            <AuthLink
              as="button"
              onClick={handleLogout}
              style={{background:'none', border:'none', cursor:'pointer', color:'#fff', fontFamily:'inherit', padding:0}}
            >
              LOGOUT
            </AuthLink>
          </div>
        )}

        <CartLink to="/cart">
          <ShoppingBag size={24} />
          {cartCount > 0 && <Badge>{cartCount}</Badge>}
        </CartLink>
      </RightMenu>
    </Nav>
  );
};

export default Navbar;