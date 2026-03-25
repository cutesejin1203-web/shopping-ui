import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Check, Mail, KeyRound, User, MapPin, Phone, CalendarDays, Instagram } from 'lucide-react'; // 아이콘 추가
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// 🚀 고급스러운 다크 모드 스타일 (Styled Components)
// ==========================================

const AuthContainer = styled.div`
  background: #000; color: #fff; min-height: 100vh;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 100px 20px; /* 여유로운 상하 패딩 */
`;

const Form = styled.div`
  width: 100%; max-width: 450px; display: flex; flex-direction: column; 
  gap: 35px; /* 🚀 필드 간 간격 대폭 확대 */
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

// 스텝 인디케이터 (더 세련된 디자인으로 변경)
const StepIndicator = styled.div`
  display: flex; justify-content: center; align-items: center; gap: 15px; margin-bottom: 50px;
  border-bottom: 1px solid #222; padding-bottom: 20px;
`;

const StepItem = styled.div`
  display: flex; align-items: center; gap: 8px; font-size: 0.9rem; letter-spacing: 1px;
  color: ${props => props.$active ? '#fff' : '#555'};
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  transition: 0.3s;
`;

const StepNumber = styled.div`
  width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-family: 'Playfair Display', serif; font-style: italic; font-size: 0.8rem;
  background: ${props => props.$active ? '#fff' : 'transparent'};
  color: ${props => props.$active ? '#000' : '#555'};
  border: 1px solid ${props => props.$active ? '#fff' : '#444'};
  transition: 0.3s;
`;

const TermsBox = styled.div`
  background: rgba(255,255,255,0.03); border: 1px solid #333; padding: 25px;
  height: 160px; overflow-y: auto; font-size: 0.85rem; color: #aaa; line-height: 1.7;
  margin-bottom: 10px;
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: #666; }
`;

// 체크박스 라벨 (더 세련되게 다듬음)
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

// 🚀 입력창 스타일 (선 처리 -> 은은한 면 처리로 고급화)
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
  padding: 15px 15px 15px 45px; /* 아이콘 공간 패딩 추가 */
  color: #fff; 
  font-size: 1rem; 
  width: 100%; 
  letter-spacing: 1px;
  color-scheme: dark;
  transition: 0.3s;
  
  /* 🚀 이 줄을 추가해 줘! */
  box-sizing: border-box; 

  &:focus { outline: none; border-color: #fff; background: rgba(255,255,255,0.06); }
  &::placeholder { color: #555; letter-spacing: 0px; }
`;

const SmallButton = styled.button`
  background: transparent; color: #fff; border: 1px solid #444; padding: 0 15px;
  height: 50px; cursor: pointer; white-space: nowrap; font-size: 0.85rem; transition: 0.2s;
  letter-spacing: 1px;
  &:hover { background: #fff; color: #000; border-color: #fff; }
  &:disabled { color: #444; border-color: #333; cursor: not-allowed; }
`;

const Button = styled.button`
  background: #fff; color: #000; border: none; padding: 22px;
  font-weight: bold; cursor: pointer; margin-top: 25px; letter-spacing: 3px; font-size: 0.9rem;
  transition: 0.3s;
  &:hover { background: #ccc; }
  &:disabled { background: #333; color: #666; cursor: not-allowed; }
`;

const Divider = styled.div`
  display: flex; align-items: center; text-align: center; color: #666; margin: 40px 0; font-size: 0.8rem; letter-spacing: 2px;
  &::before, &::after { content: ''; flex: 1; border-bottom: 1px solid #222; }
  &::before { margin-right: 15px; }
  &::after { margin-left: 15px; }
`;

// 가로로 나란히 배치하고 중앙 정렬
const SocialButtonGroup = styled.div`
  display: flex; justify-content: center; gap: 20px; align-items: center;
`;

// 동그란 아이콘 버튼 공통 스타일
const SocialIconButton = styled.button`
  width: 56px; height: 56px; border-radius: 50%; 
  display: flex; justify-content: center; align-items: center; 
  border: none; cursor: pointer; transition: 0.3s ease;
  font-family: Arial, sans-serif; font-weight: bold; font-size: 1.5rem;
  &:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(255,255,255,0.1); }
`;

// 개별 브랜드 스타일
const KakaoBtn = styled(SocialIconButton)`
  background: #FEE500; color: #000;
`;
const GoogleBtn = styled(SocialIconButton)`
  background: #fff; color: #000; border: 1px solid #ddd;
`;
const InstaBtn = styled(SocialIconButton)`
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  color: #fff;
`;
const XBtn = styled(SocialIconButton)`
  background: #000; color: #fff; border: 1px solid #444;
`;

const ValidationText = styled(motion.span)`
  font-size: 0.8rem; margin-top: -10px;
  color: ${props => props.$isValid ? '#4caf50' : '#ff4d4f'};
`;

// 마케팅 동의 박스 (더 세련되게 분리)
const MarketingConsentBox = styled.div`
  margin-top: 15px; padding: 20px; border: 1px solid #333; background: rgba(255,255,255,0.02);
  display: flex; flex-direction: column; gap: 18px;
`;


const RegisterPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const [user, setUser] = useState({
    name: '', email: '', password: '', passwordConfirm: '',
    zipCode: '', address: '', detailAddress: '', phone: '',
    birthdate: '', smsConsent: false, emailConsent: false,
  });

  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  // ==========================================
  // Mock(가짜) 검증 함수들 (추후 실제 API 연동)
  // ==========================================
  const handleEmailCheck = () => {
    if (!user.email.includes('@')) {
      alert("올바른 이메일 형식을 입력해주세요.");
      return;
    }
    alert("사용 가능한 이메일입니다.");
    setIsEmailChecked(true);
  };

  const handleZipCodeSearch = () => {
    alert("우편번호 찾기 팝업 (임시 주소 입력됩니다.)");
    setUser({ ...user, zipCode: "06236", address: "서울 강남구 테헤란로 123" });
  };

  const handlePhoneVerify = () => {
    if (user.phone.length < 10) {
      alert("올바른 휴대폰 번호를 입력해주세요.");
      return;
    }
    alert("휴대폰 인증이 완료되었습니다.");
    setIsPhoneVerified(true);
  };

  const handleRegister = async () => {
    if (!user.name || !user.email || !user.password || !user.phone || !user.birthdate || !user.zipCode) {
      alert("모든 필수 정보를 입력해주세요.");
      return;
    }
    if (user.password !== user.passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!isEmailChecked) {
      alert("이메일 중복확인을 완료해주세요.");
      return;
    }
    if (!isPhoneVerified) {
      alert("휴대폰 인증을 완료해주세요.");
      return;
    }

    try {
      // 1. 서버에 보낼 데이터 정제 (DB에 필요 없는 '비밀번호 확인' 필드는 제외)
      const { passwordConfirm, ...requestData } = user;

      console.log("🚀 백엔드로 전송할 데이터:", requestData);
debugger
      // 2. 백엔드(스프링 부트) API 호출
      const response = await axios.post('/api/auth/join', requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // 3. 성공 처리 (HTTP 상태 코드가 200번대일 경우)
      if (response.status === 200 || response.status === 201) {
        setStep(3); // 성공 시 완료 화면으로 이동
      }

    } catch (err) {
      console.error("🚨 회원가입 에러:", err);

      // 4. 에러 핸들링 (백엔드에서 보내주는 에러 메시지가 있으면 출력, 없으면 기본 메시지)
      const errorMessage = err.response?.data?.message || "가입 처리 중 문제가 발생했습니다. 다시 시도해 주세요.";
      alert(errorMessage);
    }
  };

  return (
    <AuthContainer>
      <Form>
        <TitleArea>
          <Title>JOIN THE CLUB</Title>
          <Subtitle>GCP ARCHIVE STORE</Subtitle>
        </TitleArea>

        {/* 🚀 상단 스텝 인디케이터 (세련된 버전) */}
        <StepIndicator>
          <StepItem $active={step >= 1}><StepNumber $active={step >= 1}>1</StepNumber> TERMS</StepItem>
          <StepItem $active={step >= 2}><StepNumber $active={step >= 2}>2</StepNumber> INFO</StepItem>
          <StepItem $active={step === 3}><StepNumber $active={step === 3}>3</StepNumber> COMPLETE</StepItem>
        </StepIndicator>

        <AnimatePresence mode="wait">
        {/* ==========================================
            STEP 1: 약관 동의
        ========================================== */}
        {step === 1 && (
          <motion.div initial={{opacity:0, x:30}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-30}} transition={{duration: 0.4}}>
            <h3 style={{marginBottom:'20px', fontSize:'1.2rem', fontWeight:400, color: '#fff'}}>서비스 이용 약관</h3>
            <TermsBox>
              제1조 (목적) GCP STORE(이하 "회사")가 제공하는 프리미엄 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다. <br/><br/>
              제2조 (회원의 의무) 회원은 본인의 계정 정보를 안전하게 관리할 책임이 있으며...
            </TermsBox>
            <CheckboxLabel onClick={() => setTermsAgreed(!termsAgreed)}>
              <CheckboxSquare $checked={termsAgreed}>
                {termsAgreed && <Check size={14} color="#000" />}
              </CheckboxSquare>
              (필수) 이용약관에 동의합니다.
            </CheckboxLabel>

            <TermsBox>
              개인정보 수집 및 이용 목적: 회원가입, 주문배송, 회원제 서비스 이용에 따른 본인 식별 등 <br/><br/>
              수집하는 개인정보 항목: 이름, 이메일, 비밀번호, 주소, 연락처 등 <br/><br/>
              보유 및 이용기간: 회원 탈퇴 시까지
            </TermsBox>
            <CheckboxLabel onClick={() => setPrivacyAgreed(!privacyAgreed)}>
              <CheckboxSquare $checked={privacyAgreed}>
                {privacyAgreed && <Check size={14} color="#000" />}
              </CheckboxSquare>
              (필수) 개인정보 수집 및 이용에 동의합니다.
            </CheckboxLabel>

            <Button onClick={() => setStep(2)} disabled={!(termsAgreed && privacyAgreed)} style={{width: '100%'}}>
              NEXT: ENTER INFORMATION
            </Button>

            <Divider>OR</Divider>
            <SocialButtonGroup>
              {/* 카카오: 심플하게 K 텍스트 활용 */}
              <KakaoBtn type="button" onClick={() => alert('카카오 연동 준비중!')}>
                K
              </KakaoBtn>

              {/* 구글: 심플하게 G 텍스트 활용 */}
              <GoogleBtn type="button" onClick={() => alert('구글 연동 준비중!')}>
                G
              </GoogleBtn>

              {/* 인스타그램: Lucide 아이콘 활용 */}
              <InstaBtn type="button" onClick={() => alert('인스타그램 연동 준비중!')}>
                <Instagram size={24} />
              </InstaBtn>

              {/* X(트위터): 특수문자 𝕏 활용 */}
              <XBtn type="button" onClick={() => alert('X(Twitter) 연동 준비중!')}>
                𝕏
              </XBtn>
            </SocialButtonGroup>
          </motion.div>
        )}

        {/* ==========================================
            STEP 2: 정보 입력
        ========================================== */}
        {step === 2 && (
          <motion.div initial={{opacity:0, x:30}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-30}} transition={{duration: 0.4}} style={{display:'flex', flexDirection:'column', gap:'30px'}}>
            <h3 style={{fontSize:'1.2rem', fontWeight:400, color: '#fff', marginBottom: '10px'}}>회원 정보 입력</h3>

            {/* 1. 이름 */}
            <InputWrapper>
              <InputIcon><User size={18} /></InputIcon>
              <Input
                placeholder="이름 (Full Name) *"
                value={user.name}
                onChange={(e) => setUser({...user, name: e.target.value})}
              />
            </InputWrapper>

            {/* 2. 이메일 및 중복확인 */}
            <InputGroup>
              <InputWrapper style={{flex: 1}}>
                <InputIcon><Mail size={18} /></InputIcon>
                <Input
                  placeholder="이메일 주소 *" type="email" value={user.email}
                  onChange={(e) => {
                    setUser({...user, email: e.target.value});
                    setIsEmailChecked(false);
                  }}
                />
              </InputWrapper>
              <SmallButton type="button" onClick={handleEmailCheck} disabled={isEmailChecked}>
                {isEmailChecked ? '확인완료' : '중복확인'}
              </SmallButton>
            </InputGroup>

            {/* 3. 비밀번호 */}
            <InputWrapper>
              <InputIcon><KeyRound size={18} /></InputIcon>
              <Input
                type="password" placeholder="비밀번호 *"
                value={user.password}
                onChange={(e) => setUser({...user, password: e.target.value})}
              />
            </InputWrapper>

            {/* 4. 비밀번호 확인 */}
            <InputWrapper>
              <InputIcon><Check size={18} /></InputIcon>
              <Input
                type="password" placeholder="비밀번호 확인 *"
                value={user.passwordConfirm}
                onChange={(e) => setUser({...user, passwordConfirm: e.target.value})}
              />
            </InputWrapper>
            {user.passwordConfirm && (
              <AnimatePresence>
                <ValidationText $isValid={user.password === user.passwordConfirm} initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}}>
                  {user.password === user.passwordConfirm ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
                </ValidationText>
              </AnimatePresence>
            )}

            {/* 5. 주소 (우편번호) */}
            <InputGroup>
              <InputWrapper style={{flex: 1}}>
                <InputIcon><MapPin size={18} /></InputIcon>
                <Input placeholder="우편번호 *" value={user.zipCode} readOnly />
              </InputWrapper>
              <SmallButton type="button" onClick={handleZipCodeSearch}>우편번호 찾기</SmallButton>
            </InputGroup>
            <Input
              placeholder="기본 주소 *"
              value={user.address}
              readOnly
              style={{paddingLeft: '15px'}} /* 기본주소는 아이콘 없이 padding 조정 */
            />
            <Input
              placeholder="상세 주소를 입력해주세요."
              value={user.detailAddress}
              onChange={(e) => setUser({...user, detailAddress: e.target.value})}
              style={{paddingLeft: '15px'}}
            />

            {/* 6. 휴대폰 번호 및 인증 */}
            <InputGroup>
              <InputWrapper style={{flex: 1}}>
                <InputIcon><Phone size={18} /></InputIcon>
                <Input
                  placeholder="휴대폰 번호 (숫자만 입력) *" type="tel" value={user.phone}
                  onChange={(e) => {
                    setUser({...user, phone: e.target.value.replace(/[^0-9]/g, '')});
                    setIsPhoneVerified(false);
                  }}
                />
              </InputWrapper>
              <SmallButton type="button" onClick={handlePhoneVerify} disabled={isPhoneVerified}>
                {isPhoneVerified ? '인증완료' : '인증받기'}
              </SmallButton>
            </InputGroup>

            {/* 7. 생년월일 */}
            <InputWrapper>
              <InputIcon><CalendarDays size={18} /></InputIcon>
              <Input
                type="text"
                placeholder="생년월일 (YYYY-MM-DD) *"
                value={user.birthdate}
                onFocus={(e) => (e.target.type = 'date')}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = 'text';
                }}
                onChange={(e) => setUser({...user, birthdate: e.target.value})}
              />
            </InputWrapper>

            {/* 8. 수신 여부 체크박스 (세련된 면 처리 분리) */}
            <MarketingConsentBox>
              <span style={{fontSize: '0.9rem', color: '#888', letterSpacing: '1px'}}>마케팅 정보 수신 동의 (선택)</span>
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

            {/* 하단 네비게이션 버튼 (마진 추가) */}
            <div style={{display:'flex', gap:'10px', marginTop:'40px'}}>
              <Button style={{flex:1, background:'#222', color:'#fff', marginTop: 0}} onClick={() => setStep(1)}>
                BACK
              </Button>
              <Button style={{flex:2, marginTop: 0}} onClick={handleRegister}>
                CREATE ACCOUNT
              </Button>
            </div>
          </motion.div>
        )}

        {/* ==========================================
            STEP 3: 가입 완료
        ========================================== */}
        {step === 3 && (
          <motion.div initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{duration: 0.5}} style={{textAlign:'center', padding:'60px 0'}}>
            <motion.div initial={{scale: 0}} animate={{scale: 1}} transition={{type: 'spring', stiffness: 200, delay: 0.2}} style={{marginBottom: '30px'}}>
              <Check size={80} color="#4caf50" style={{background: 'rgba(76, 175, 80, 0.1)', borderRadius: '50%', padding: '20px'}} />
            </motion.div>
            <h2 style={{fontFamily:'Playfair Display', fontSize: '2.5rem', marginBottom:'15px'}}>WELCOME TO GCP</h2>
            <p style={{color:'#888', marginBottom:'50px', lineHeight:'1.8', fontSize: '1rem', letterSpacing: '0.5px'}}>
              회원가입이 성공적으로 완료되었습니다.<br/>
              이제 GCP의 프리미엄 아카이브를 마음껏 즐겨보세요.
            </p>
            <Button style={{width:'100%', marginTop: 0}} onClick={() => navigate('/login')}>
              GO TO LOGIN
            </Button>
          </motion.div>
        )}
        </AnimatePresence>

      </Form>
    </AuthContainer>
  );
};

export default RegisterPage;