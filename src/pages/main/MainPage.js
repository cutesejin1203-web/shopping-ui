import React from 'react';
import styled from 'styled-components';
import HeroSection from './HeroSection';
import ProductList from './ProductList';

const PageWrapper = styled.div`
  background: #000;
  overflow-x: hidden;
`;

const MainPage = () => {
  return (
    <PageWrapper>
      {/* 화려한 인트로 */}
      <HeroSection />

      {/* 상품 목록 리스트 */}
      <ProductList />

      {/* 푸터 (여백의 미) */}
      <footer style={{
        padding: '120px 0',
        textAlign: 'center',
        borderTop: '1px solid #222',
        color: '#444',
        fontSize: '11px',
        letterSpacing: '3px'
      }}>
        © 2026 PREMIUM GCP STORE. ALL RIGHTS RESERVED.
      </footer>
    </PageWrapper>
  );
};

export default MainPage;