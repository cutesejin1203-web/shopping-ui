import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Check, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

// ==========================================
// 🎨 Styled Components
// ==========================================
const WriteContainer = styled.div`
  background: #000; color: #fff; min-height: 100vh;
  display: flex; flex-direction: column; align-items: center; padding-top: 120px;
  padding-bottom: 50px;
`;

const FormWrapper = styled.div`
  width: 100%; max-width: 700px; padding: 40px;
  background: rgba(255, 255, 255, 0.03); border: 1px solid #333;
`;

const Title = styled.h2`
  font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 30px; letter-spacing: 2px;
  border-bottom: 1px solid #444; padding-bottom: 15px;
`;

const InputGroup = styled.div`
  display: flex; flex-direction: column; gap: 20px; margin-bottom: 30px;
`;

const Input = styled.input`
  background: transparent; border: none; border-bottom: 1px solid #444; 
  padding: 15px 5px; color: #fff; font-size: 1rem; transition: 0.3s;
  &:focus { outline: none; border-bottom: 1px solid #fff; }
  &::placeholder { color: #666; letter-spacing: 1px; }
  &:disabled { color: #888; border-bottom: 1px dashed #444; }
`;

const TextArea = styled.textarea`
  background: transparent; border: 1px solid #444; padding: 15px; color: #fff; 
  font-size: 1rem; min-height: 250px; resize: none; transition: 0.3s; line-height: 1.6;
  &:focus { outline: none; border: 1px solid #fff; }
  &::placeholder { color: #666; letter-spacing: 1px; }
`;

// 고급스러운 체크박스
const CheckboxLabel = styled.label`
  display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.95rem; color: #aaa;
  transition: 0.2s; &:hover { color: #fff; }
`;

const CheckboxSquare = styled.div`
  width: 20px; height: 20px; border: 1px solid #fff; display: flex; align-items: center; justify-content: center;
  background: ${props => props.$checked ? '#fff' : 'transparent'}; transition: 0.2s ease;
`;

const ButtonGroup = styled.div`
  display: flex; gap: 10px; margin-top: 20px;
`;

const Button = styled.button`
  flex: ${props => props.$primary ? 2 : 1};
  padding: 18px; font-weight: bold; cursor: pointer; letter-spacing: 2px; border: none; transition: 0.3s;
  background: ${props => props.$primary ? '#fff' : '#222'};
  color: ${props => props.$primary ? '#000' : '#fff'};
  &:hover { background: ${props => props.$primary ? '#ddd' : '#444'}; }
`;

// ==========================================
// 🚀 Main Component
// ==========================================
const BoardWrite = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userName } = useAuth(); // 현재 로그인한 사람 정보 가져오기

  const [form, setForm] = useState({
    title: '',
    content: '',
    writer: '',
    secret: false,
    password: ''
  });

  // 1. 페이지 켜질 때 로그인되어 있으면 작성자에 이름 쾅 박아주기!
  useEffect(() => {
    if (isLoggedIn && userName) {
      setForm((prev) => ({ ...prev, writer: userName }));
    }
  }, [isLoggedIn, userName]);

  // 2. 입력 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // 3. 🚀 폼 전송 (백엔드로 쏘기!)
  const handleSubmit = async () => {
    if (!form.title || !form.content || !form.writer) {
      alert("제목, 내용, 작성자를 모두 입력해주세요.");
      return;
    }

    if (form.secret && !form.password) {
      alert("비밀글로 설정하시려면 비밀번호를 입력해주세요.");
      return;
    }

    try {
      // 💡 아까 만들어둔 백엔드 POST API 호출!
      await axios.post(`${process.env.REACT_APP_API_URL}/api/boards`, form);
      alert("문의글이 성공적으로 등록되었습니다. 🎉");
      navigate('/board'); // 다 쓰면 목록으로 이동!
    } catch (error) {
      console.error("게시글 등록 실패:", error);
      alert("게시글 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <WriteContainer>
      <FormWrapper>
        <Title>WRITE Q&A</Title>

        <InputGroup>
          {/* 작성자 (로그인 상태면 자동 입력, 아니면 직접 입력) */}
          <Input
            name="writer" placeholder="작성자 이름 *"
            value={form.writer} onChange={handleChange}
            disabled={isLoggedIn} // 로그인했으면 이름 못 바꾸게 막음!
            title={isLoggedIn ? "로그인한 사용자의 이름이 자동 입력됩니다." : ""}
          />

          <Input
            name="title" placeholder="제목 *"
            value={form.title} onChange={handleChange}
          />

          <TextArea
            name="content" placeholder="문의하실 내용을 자세히 적어주세요. *"
            value={form.content} onChange={handleChange}
          />
        </InputGroup>

        {/* 🔒 비밀글 설정 영역 */}
        <div style={{ marginBottom: '20px', padding: '20px', background: 'rgba(0,0,0,0.5)', border: '1px solid #222' }}>
          <CheckboxLabel>
            <Input
              type="checkbox" name="secret"
              checked={form.secret} onChange={handleChange}
              style={{ display: 'none' }}
            />
            <CheckboxSquare $checked={form.secret}>
              {form.secret && <Check size={14} color="#000" />}
            </CheckboxSquare>
            비밀글로 문의하기 (작성자와 관리자만 볼 수 있습니다.)
          </CheckboxLabel>

          {/* 비밀글 체크했을 때만 스르륵 나타나는 비밀번호 입력창! */}
          <AnimatePresence>
            {form.secret && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 15 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Lock size={16} color="#888" />
                  <Input
                    type="password" name="password" placeholder="비밀번호 4자리 입력 *"
                    value={form.password} onChange={handleChange}
                    style={{ width: '200px', borderBottom: '1px solid #888' }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ButtonGroup>
          <Button onClick={() => navigate(-1)}>CANCEL</Button>
          <Button $primary onClick={handleSubmit}>SUBMIT POST</Button>
        </ButtonGroup>
      </FormWrapper>
    </WriteContainer>
  );
};

export default BoardWrite;