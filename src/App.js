import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';

import MainPage from '@/pages/main/MainPage';
import ProductDetail from '@/pages/main/ProductDetail';
import Navbar from '@/components/Navbar';
import { CartProvider } from '@/context/CartContext';
import CartPage from '@/pages/main/cart/CartPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import AdminProductPage from '@/pages/admin/AdminProductPage'
import { AuthProvider } from '@/context/AuthContext';
import Profile from "@/pages/Profile";
import OrderHistoryPage from "@/pages/OrderHistoryPage";
import BoardList from '@/pages/main/board/BoardList';
import BoardWrite from '@/pages/main/board/BoardWrite';
import BoardDetail from '@/pages/main/board/BoardDetail';


// [환경 분리] 리액트가 실행된 환경에 따라 알아서 로컬 주소 or GCP 주소가 들어감!
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

// [10년 차 사수의 비기] Axios Interceptor (요청 가로채기)
// App 컴포넌트 '바깥'에 선언해서 리액트 앱이 켜질 때 딱 한 번만 세팅되게 합니다.
axios.interceptors.request.use(
  (config) => {
    // 1. 브라우저 지갑에서 출입증(토큰) 꺼내기
    const token = localStorage.getItem('accessToken');

    // 2. 출입증이 존재하면 무조건 헤더에 달아주기
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config; // 출입증 달고 무사히 백엔드로 출발~
  },
  (error) => {
    return Promise.reject(error);
  }
);

function App() {
  return (
    <AuthProvider> {/* 👈 AuthProvider가 제일 바깥에서 전체를 감싸줌! */}
    <CartProvider>
      <Router>
        <div style={{ paddingTop: '80px' }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/admin/product/edit/:id" element={<AdminProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/board" element={<BoardList />} />
            <Route path="/board/write" element={<BoardWrite />} />
            <Route path="/board/:id" element={<BoardDetail />} />
            <Route path="/orders" element={<OrderHistoryPage />} />

              {/* [추가] 관리자 전용 상품 등록 페이지 */}
            <Route path="/admin/product/new" element={<AdminProductPage />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
    </AuthProvider>
  );
}

export default App;