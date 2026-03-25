import React, { createContext, useContext, useState, useEffect } from 'react';

// 1️⃣ 빈 창고 만들기
const AuthContext = createContext();

// 2️⃣ 창고 관리자(Provider) 만들기
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');

  // 💡 앱이 켜질 때 딱 한 번! 로컬스토리지에서 정보 가져와서 세팅
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');

    if (token) {
      setIsLoggedIn(true);
      setIsAdmin(role === 'ADMIN' || role === 'ROLE_ADMIN');
      setUserName(name || '');
    }
  }, []);

  // 🚪 로그아웃 함수도 여기서 통합 관리!
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');

    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserName('');
  };

  // 📦 다른 컴포넌트들이 가져다 쓸 수 있게 포장
  return (
    <AuthContext.Provider value={{ isLoggedIn, isAdmin, userName, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3️⃣ 남들이 쉽게 꺼내 쓸 수 있게 커스텀 훅 만들기
export const useAuth = () => {
  return useContext(AuthContext);
};
