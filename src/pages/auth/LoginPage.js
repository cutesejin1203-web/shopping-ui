import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const AuthContainer = styled.div`
  background: #000; color: #fff; min-height: 100vh;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
`;

const Input = styled.input`
  width: 100%; max-width: 400px; background: transparent; border: none; 
  border-bottom: 1px solid #444; padding: 15px 5px; color: #fff; margin-bottom: 20px;
  &:focus { outline: none; border-bottom: 1px solid #fff; }
`;

// [수정 1] 여기에 있던 컴포넌트 밖 useNavigate()는 삭제했어!

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // 잘 선언된 네비게이트!

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
        // [수정 2] setEmail(함수) 대신 email(값)을 보냄!
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
            email: email,
            password: password
        }, {
            // 💡 포인트 1: 브라우저 캐시 무시하고 무조건 서버에서 찐 데이터 가져오게 강제!
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

        const token = res.data.token;
        const userName = res.data.name;
        const userRole = res.data.role;

        // 브라우저 지갑에 출입증 보관!
        localStorage.setItem('accessToken', token);
        localStorage.setItem('userName', userName);
        localStorage.setItem('userRole', userRole);

        alert(`${userName}님, 환영합니다! 쇼핑을 시작해볼까요?`);
        window.location.replace('/'); // 💡 포인트 2: 라우터 대신 브라우저 찐 이동! (리액트 메모리 리셋 + 뒤로 가기 방지)

    } catch (error) {
        console.error("로그인 실패:", error);
        alert("아이디나 비밀번호를 다시 확인해주세요.");
    }
  };

  return (
    <AuthContainer>
      <h1 style={{fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '50px'}}>SIGN IN</h1>
      <div style={{width: '400px', display: 'flex', flexDirection: 'column'}}>
        <Input placeholder="EMAIL" onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="PASSWORD" onChange={(e) => setPassword(e.target.value)} />
        <button
          onClick={handleLogin}
          style={{background: '#fff', color: '#000', padding: '20px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px'}}
        >
          LOG IN
        </button>
        <Link to="/register" style={{color: '#888', textAlign: 'center', marginTop: '20px', fontSize: '0.9rem'}}>
          New to GCP STORE? Create an account
        </Link>
      </div>
    </AuthContainer>
  );
};

export default LoginPage;