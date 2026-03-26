import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Check, Mail, KeyRound, User, MapPin, Phone, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext'; // 로그아웃 처리를 위해 가져옴

// ==========================================
// 🎨 기존 가입 페이지의 고급스러운 스타일 그대로 가져옴!
// ==========================================
const AuthContainer = styled.div`
  background: #000; color: #fff; min-height: 100vh;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 120px 20px;
`;

const Form = styled.div`
  width: 100%; max-width: 450px; display: flex; flex-direction: column; gap: 35px;
`;

const TitleArea = styled.div`
  text-align: center; margin-bottom: 30px;
`;

const Title = styled.h1`
  font-family: 'Playfair Display', serif; font-size: 3rem; margin-bottom: 10px; font-weight: 500;
  letter-spacing: -1px;
`;

const Subtitle = styled.p`
  color: #888; font-size: 1rem; letter-spacing: 2px;
`;

const InputGroup = styled.div`
  display: flex; gap: 10px; align-items: center;
`;

const InputWrapper = styled.div`
  position: relative; width: 100%;
`;

const InputIcon = styled.div`
  position: absolute; left: 15px; top: 50%; transform: translateY(-50%);
  color: #666;
`;

const Input = styled.input`
  background: rgba(255,255,255,0.03); 
  border: 1px solid #333;
  padding: 15px 15px 15px 45px; 
  color: #fff; font-size: 1rem; width: 100%; letter-spacing: 1px;
  color-scheme: dark; transition: 0.3s; box-sizing: border-box; 

  &:focus { outline: none; border-color: #fff; background: rgba(255,255,255,0.06); }
  &::placeholder { color: #555; letter-spacing: 0px; }
  
  /* 🚀 수정 불가 필드(이메일 등) 시각적 처리 */
  &:disabled { 
    color: #666; cursor: not-allowed; border-color: #222; background: transparent;
  }
`;

const SmallButton = styled.button`
  background: transparent; color: #fff; border: 1px solid #444; padding: 0 15px;
  height: 50px; cursor: pointer; white-space: nowrap; font-size: 0.85rem; transition: 0.2s;
  letter-spacing: 1px;
  &:hover { background: #fff; color: #000; border-color: #fff; }
`;

const Button = styled.button`
  background: #fff; color: #000; border: none; padding: 22px;
  font-weight: bold; cursor: pointer; margin-top: 10px; letter-spacing: 3px; font-size: 0.9rem;
  transition: 0.3s;
  &:hover { background: #ccc; }
`;

const ValidationText = styled(motion.span)`
  font-size: 0.8rem; margin-top: -10px;
  color: ${props => props.$isValid ? '#4caf50' : '#ff4d4f'};
`;

const MarketingConsentBox = styled.div`
  margin-top: 10px; padding: 20px; border: 1px solid #333; background: rgba(255,255,255,0.02);
  display: flex; flex-direction: column; gap: 18px;
`;

const CheckboxLabel = styled.label`
  display: flex; align-items: center; gap: 12px; cursor: pointer; font-size: 0.95rem;
  margin-bottom: ${props => props.$noMargin ? '0' : '25px'};
  &:hover { color: #fff; }
`;

const CheckboxSquare = styled.div`
  width: 20px; height: 20px; border: 1px solid #fff; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: ${props => props.$checked ? '#fff' : 'transparent'};
  transition: 0.2s ease;
`;

// ==========================================
// 🚀 Main Component
// ==========================================
const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // 비밀번호 변경 시 강제 로그아웃용

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    name: '', email: '', password: '', passwordConfirm: '',
    zipCode: '', address: '', detailAddress: '', phone: '',
    birthdate: '', smsConsent: false, emailConsent: false,
  });

  // 1. 마운트 시 기존 내 정보 불러오기
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        // 💡 백엔드 GET API 주소 매칭 확인!
        const response = await axios.get('/api/members/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = response.data;
        setUser({
          ...user,
          name: data.name || '',
          email: data.email || '', // 이메일은 보여주기만 하고 disabled 처리할 것
          zipCode: data.zipCode || '',
          address: data.address || '',
          detailAddress: data.detailAddress || '',
          phone: data.phone || '',
          birthdate: data.birthdate || '',
          smsConsent: data.smsConsent || false,
          emailConsent: data.emailConsent || false,
          password: '', // 비밀번호는 안 불러옴 (새로 입력할 때만 사용)
          passwordConfirm: '',
        });
      } catch (err) {
        console.error("정보 불러오기 실패:", err);
        alert("로그인 정보가 만료되었습니다. 다시 로그인해주세요.");
        logout();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleZipCodeSearch = () => {
    alert("우편번호 찾기 팝업 (임시 주소 입력됩니다.)");
    setUser({ ...user, zipCode: "06236", address: "서울 강남구 테헤란로 123" });
  };

  // 2. 폼 제출 (정보 수정 요청)
  const handleUpdate = async () => {
    if (!user.name || !user.phone || !user.birthdate || !user.zipCode) {
      alert("필수 정보를 모두 입력해주세요.");
      return;
    }

    // 비밀번호를 입력했다면, 확인과 일치하는지 체크
    if (user.password && user.password !== user.passwordConfirm) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const { passwordConfirm, email, ...requestData } = user;
      const token = localStorage.getItem('accessToken');

      // 💡 백엔드 PUT API 호출!
      await axios.put('/api/members/me', requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
      });

      alert("회원 정보가 성공적으로 수정되었습니다! 🎉");

      // 비밀번호를 변경했다면 안전을 위해 로그아웃 처리
      if (user.password) {
        alert("비밀번호가 변경되어 다시 로그인해야 합니다.");
        logout();
        navigate('/login');
      } else {
        navigate('/'); // 메인으로
      }

    } catch (err) {
      console.error("수정 실패:", err);
      alert("정보 수정 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', padding: '100px' }}>Loading Profile...</div>;

  return (
    <AuthContainer>
      <Form>
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration: 0.5}} style={{display:'flex', flexDirection:'column', gap:'30px'}}>

          <TitleArea>
            <Title>MY PROFILE</Title>
            <Subtitle>EDIT YOUR INFORMATION</Subtitle>
          </TitleArea>

          {/* 1. 이메일 (수정 불가 - readOnly & disabled) */}
          <InputWrapper>
            <InputIcon><Mail size={18} /></InputIcon>
            <Input value={user.email} disabled title="이메일은 변경할 수 없습니다." />
          </InputWrapper>

          {/* 2. 이름 */}
          <InputWrapper>
            <InputIcon><User size={18} /></InputIcon>
            <Input
              placeholder="이름 (Full Name) *"
              value={user.name}
              onChange={(e) => setUser({...user, name: e.target.value})}
            />
          </InputWrapper>

          {/* 3. 비밀번호 (변경할 때만 입력) */}
          <InputWrapper>
            <InputIcon><KeyRound size={18} /></InputIcon>
            <Input
              type="password" placeholder="새 비밀번호 (변경 시에만 입력)"
              value={user.password}
              onChange={(e) => setUser({...user, password: e.target.value})}
            />
          </InputWrapper>

          {/* 4. 비밀번호 확인 (새 비밀번호 입력 시에만 나타남) */}
          <AnimatePresence>
            {user.password && (
              <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}}>
                <InputWrapper>
                  <InputIcon><Check size={18} /></InputIcon>
                  <Input
                    type="password" placeholder="새 비밀번호 확인 *"
                    value={user.passwordConfirm}
                    onChange={(e) => setUser({...user, passwordConfirm: e.target.value})}
                  />
                </InputWrapper>
                {user.passwordConfirm && (
                  <ValidationText $isValid={user.password === user.passwordConfirm} initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}}>
                    {user.password === user.passwordConfirm ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
                  </ValidationText>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 5. 주소 */}
          <InputGroup>
            <InputWrapper style={{flex: 1}}>
              <InputIcon><MapPin size={18} /></InputIcon>
              <Input placeholder="우편번호 *" value={user.zipCode} readOnly />
            </InputWrapper>
            <SmallButton type="button" onClick={handleZipCodeSearch}>우편번호 찾기</SmallButton>
          </InputGroup>
          <Input
            placeholder="기본 주소 *" value={user.address} readOnly
            style={{paddingLeft: '15px'}}
          />
          <Input
            placeholder="상세 주소를 입력해주세요." value={user.detailAddress}
            onChange={(e) => setUser({...user, detailAddress: e.target.value})}
            style={{paddingLeft: '15px'}}
          />

          {/* 6. 휴대폰 번호 */}
          <InputWrapper>
            <InputIcon><Phone size={18} /></InputIcon>
            <Input
              placeholder="휴대폰 번호 (숫자만 입력) *" type="tel" value={user.phone}
              onChange={(e) => setUser({...user, phone: e.target.value.replace(/[^0-9]/g, '')})}
            />
          </InputWrapper>

          {/* 7. 생년월일 */}
          <InputWrapper>
            <InputIcon><CalendarDays size={18} /></InputIcon>
            <Input
              type="text" placeholder="생년월일 (YYYY-MM-DD) *" value={user.birthdate}
              onFocus={(e) => (e.target.type = 'date')}
              onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
              onChange={(e) => setUser({...user, birthdate: e.target.value})}
            />
          </InputWrapper>

          {/* 8. 마케팅 동의 */}
          <MarketingConsentBox>
            <span style={{fontSize: '0.9rem', color: '#888', letterSpacing: '1px'}}>마케팅 정보 수신 설정</span>
            <CheckboxLabel $noMargin onClick={() => setUser({...user, smsConsent: !user.smsConsent})}>
              <CheckboxSquare $checked={user.smsConsent}>
                {user.smsConsent && <Check size={14} color="#000" />}
              </CheckboxSquare>
              SMS 및 카카오톡 수신 동의
            </CheckboxLabel>
            <CheckboxLabel $noMargin onClick={() => setUser({...user, emailConsent: !user.emailConsent})}>
              <CheckboxSquare $checked={user.emailConsent}>
                {user.emailConsent && <Check size={14} color="#000" />}
              </CheckboxSquare>
              이메일 수신 동의
            </CheckboxLabel>
          </MarketingConsentBox>

          <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
            <Button style={{flex:1, background:'#222', color:'#fff'}} onClick={() => navigate(-1)}>
              CANCEL
            </Button>
            <Button style={{flex:2}} onClick={handleUpdate}>
              SAVE CHANGES
            </Button>
          </div>

        </motion.div>
      </Form>
    </AuthContainer>
  );
};

export default Profile;