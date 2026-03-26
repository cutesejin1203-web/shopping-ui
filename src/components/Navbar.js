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
  flex: 1; 
`;

const CategoryMenu = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  flex: 2; 

  @media (max-width: 768px) {
    display: none; 
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
  flex: 1; 
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
  const location = useLocation();
  const { isLoggedIn, isAdmin, userName, logout } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const currentCategory = queryParams.get('category') || 'ALL';

  const handleLogout = () => {
    logout();
    alert('안전하게 로그아웃 되었습니다.');
    navigate('/');
  };

  const handleCategoryClick = (category) => {
    navigate(`/?category=${category}`);
    if(location.pathname === '/') {
        window.scrollTo({ top: 800, behavior: 'smooth' });
    }
  };

  const categories = ['ALL', 'TOP', 'BOTTOM', 'OUTER', 'ACCESSORY'];

  return (
    <Nav>
      <Logo to="/">GCP STORE</Logo>

      <CategoryMenu>
        {categories.map(cat => (
          <CategoryLink
            key={cat}
            $active={currentCategory === cat && location.pathname === '/'}
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </CategoryLink>
        ))}
      </CategoryMenu>

      <RightMenu>
        {/* 누구나 볼 수 있는 Q&A 게시판 */}
        <AuthLink to="/board" style={{ fontWeight: location.pathname.includes('/board') ? 'bold' : '300' }}>
          Q&A
        </AuthLink>

        {/* 로그인 상태에 따른 렌더링 */}
        {!isLoggedIn ? (
          <AuthLink to="/login">SIGN IN</AuthLink>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {isAdmin && (
              <AuthLink to="/admin/product/new" style={{ color: '#ffcc00', fontWeight: 'bold' }}>
                ADD PRODUCT
              </AuthLink>
            )}

            {/* 🚀 [핵심 추가] 주문 내역 (ORDERS) 링크 - 현재 경로가 /orders 이면 굵게 표시 */}
            <AuthLink to="/orders" style={{ fontWeight: location.pathname === '/orders' ? 'bold' : '300' }}>
              ORDERS
            </AuthLink>

            {/* 유저 프로필(인사말) */}
            <AuthLink to="/profile" style={{ color: '#fff', fontSize: '0.85rem', letterSpacing: '1.5px', fontWeight: 300, borderBottom: '1px solid #fff' }}>
              HELLO, {userName}
            </AuthLink>

            {/* 로그아웃 버튼 */}
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