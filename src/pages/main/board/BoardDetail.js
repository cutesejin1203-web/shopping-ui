import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Calendar, ArrowLeft, Lock, MessageSquare, Trash2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext'; // 🚀 @ 절대경로 사용!

// ==========================================
// 🎨 Styled Components
// ==========================================
const DetailContainer = styled.div`
  background: #000; color: #fff; min-height: 100vh;
  display: flex; flex-direction: column; align-items: center; padding-top: 120px; padding-bottom: 100px;
`;

const ContentWrapper = styled(motion.div)`
  width: 100%; max-width: 800px; padding: 40px;
  background: rgba(255, 255, 255, 0.02); border: 1px solid #222;
`;

const DetailHeader = styled.div`
  border-bottom: 1px solid #333; padding-bottom: 30px; margin-bottom: 40px;
`;

const DetailTitle = styled.h1`
  font-family: 'Playfair Display', serif; font-size: 2.2rem; margin-bottom: 25px;
  display: flex; align-items: center; gap: 15px;
`;

const DetailContent = styled.div`
  font-size: 1.1rem; line-height: 1.8; color: #ccc; min-height: 200px; white-space: pre-wrap;
`;

// 🚀 [추가] 답변 섹션 스타일
const AnswerSection = styled.div`
  margin-top: 50px; padding: 40px; background: rgba(255, 255, 255, 0.04);
  border-left: 4px solid #fff; position: relative;
`;

const AnswerTitle = styled.h3`
  display: flex; align-items: center; gap: 10px; font-size: 1.1rem; 
  letter-spacing: 2px; margin-bottom: 25px; color: #fff;
`;

const AnswerTextArea = styled.textarea`
  width: 100%; background: #000; border: 1px solid #333; color: #fff;
  padding: 20px; font-size: 1rem; min-height: 150px; resize: none; margin-bottom: 15px;
  &:focus { outline: none; border-color: #fff; }
`;

const BottomActions = styled.div`
  width: 100%; max-width: 800px; margin-top: 40px;
  display: flex; justify-content: space-between; border-top: 1px solid #222; padding-top: 30px;
`;

const ActionButton = styled.button`
  background: ${props => props.$primary ? '#fff' : 'transparent'};
  border: 1px solid ${props => props.$primary ? '#fff' : '#444'};
  color: ${props => props.$primary ? '#000' : '#fff'};
  padding: 12px 25px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s;
  font-size: 0.9rem; font-weight: bold;
  &:hover { opacity: 0.8; }
`;

// ==========================================
// 🚀 Main Component
// ==========================================
const BoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth(); // 관리자 여부 체크

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answerInput, setAnswerInput] = useState(''); // 답변 입력 상태

  // 1. 게시글 상세 정보 불러오기
  const fetchDetail = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/boards/${id}`);
      setBoard(res.data);
      if (res.data.answer) setAnswerInput(res.data.answer); // 기존 답변 있으면 세팅
    } catch (error) {
      alert("글을 불러올 수 없습니다.");
      navigate('/board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // 2. 🚀 [관리자용] 답변 저장 함수
  const handleSaveAnswer = async () => {
    if (!answerInput.trim()) return alert("답변 내용을 입력해주세요.");

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/boards/${id}/answer`, {
        answer: answerInput
      });
      alert("답변이 성공적으로 등록되었습니다! 🎉");
      fetchDetail(); // 화면 갱신
    } catch (error) {
      alert("답변 등록 중 오류가 발생했습니다.");
    }
  };

  // 3. 🚀 [관리자용] 게시글 삭제 함수
  const handleDelete = async () => {
    if (window.confirm("정말 이 게시글을 삭제하시겠습니까? 관리자 권한으로 삭제됩니다.")) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/boards/${id}`);
        alert("게시글이 삭제되었습니다.");
        navigate('/board');
      } catch (error) {
        alert("삭제 실패!");
      }
    }
  };

  if (loading) return <DetailContainer><p>Loading...</p></DetailContainer>;
  if (!board) return null;

  return (
    <DetailContainer>
      <ContentWrapper initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <DetailHeader>
          <DetailTitle>
            {board.secret && <Lock size={24} color="#888" />}
            {board.title}
          </DetailTitle>
          <div style={{ display: 'flex', gap: '20px', color: '#666', fontSize: '0.9rem' }}>
            <span><User size={14} /> {board.writer}</span>
            <span><Calendar size={14} /> {board.regTime?.substring(0, 10)}</span>
          </div>
        </DetailHeader>

        <DetailContent>{board.content}</DetailContent>

        {/* ========================================== */}
        {/* 🚀 [답변 영역] 관리자 vs 유저 분기 처리 */}
        {/* ========================================== */}
        <AnswerSection>
          <AnswerTitle>
            <MessageSquare size={18} />
            {isAdmin ? "MANAGE ANSWER" : "OFFICIAL REPLY"}
          </AnswerTitle>

          {isAdmin ? (
            // 관리자: 입력창 + 저장버튼
            <>
              <AnswerTextArea
                placeholder="답변 내용을 작성하세요..."
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ActionButton $primary onClick={handleSaveAnswer}>
                  <Save size={18} /> SAVE ANSWER
                </ActionButton>
              </div>
            </>
          ) : (
            // 일반 유저: 답변이 있으면 보여주고, 없으면 대기 메시지
            <div style={{ lineHeight: '1.7', color: board.answer ? '#ddd' : '#666' }}>
              {board.answer ? (
                board.answer
              ) : (
                <span style={{ fontStyle: 'italic' }}>문의하신 내용에 대해 관리자가 확인 중입니다.</span>
              )}
            </div>
          )}
        </AnswerSection>
      </ContentWrapper>

      <BottomActions>
        <ActionButton onClick={() => navigate('/board')}>
          <ArrowLeft size={18} /> BACK TO LIST
        </ActionButton>

        {/* 관리자에게만 보이는 비밀의 삭제 버튼 */}
        {isAdmin && (
          <ActionButton onClick={handleDelete} style={{ color: '#ff4d4d', borderColor: '#ff4d4d' }}>
            <Trash2 size={18} /> DELETE (ADMIN)
          </ActionButton>
        )}
      </BottomActions>
    </DetailContainer>
  );
};

export default BoardDetail;