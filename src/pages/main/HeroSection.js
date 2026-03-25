import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Hero = styled.section`
  /* 기존 100vh에서 네비게이션 높이(80px)만큼 빼줘서 정확히 화면에 맞게 조절 */
  height: calc(100vh - 80px);
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), 
              url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  background-attachment: fixed; 
`;

const Content = styled(motion.div)`
  text-align: center;
  color: #fff;
  h1 { 
    font-family: 'Playfair Display', serif; 
    font-size: clamp(3rem, 12vw, 9rem); 
    margin: 0; 
    font-weight: 900;
    letter-spacing: -2px;
  }
  p { 
    font-size: 1.2rem; 
    letter-spacing: 8px; 
    margin-top: 20px; 
    font-weight: 300; 
    text-transform: uppercase;
    opacity: 0.8;
  }
`;

const HeroSection = () => (
  <Hero>
    <Content
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, ease: "anticipate" }}
    >
      <p>Luxury Archive</p>
      <h1>PREMIUM</h1>
    </Content>
  </Hero>
);

export default HeroSection;
