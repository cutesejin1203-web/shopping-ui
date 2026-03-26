import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, Edit3 } from 'lucide-react';
import {useAuth} from "@/context/AuthContext";

// ==========================================
// 🎨 Styled Components (다크 모드 게시판)
// ==========================================
const BoardContainer = styled.div`
  background: #000; color: #fff; min-height: 100vh;
  display: flex; flex-direction: column; align-items: center; padding-top: 120px;
`;

const BoardWrapper = styled.div`
  width: 100%; max-width: 800px; padding: 20px;
`;

const HeaderArea = styled.div`
  display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px;
  border-bottom: 2px solid #333; padding-bottom: 15px;
`;

const Title = styled.h2`
  font-family: 'Playfair Display', serif; font-size: 2.5rem; letter-spacing: 2px; margin: 0;
`;

const WriteButton = styled.button`
  background: #fff; color: #000; border: none; padding: 10px 20px; font-weight: bold;
  cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s;
  &:hover { background: #ccc; }
`;

const BoardListUl = styled.ul`
  list-style: none; padding: 0; margin: 0;
`;

// 🚀 [중요 수정] 부모 태그를 column으로 세우고, 정렬 방식 변경
const BoardItem = styled.li`
  display: flex; 
  flex-direction: column; /* 💡 원글과 답변을 위아래로 배치 */
  padding: 20px 10px; border-bottom: 1px solid #222; cursor: pointer; transition: 0.2s;
  &:hover { background: rgba(255,255,255,0.05); }
`;

// [중요 수정] 원글(제목/작성자/날짜) 영역을 위한 새로운 스타일 추가
const BoardMainRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ItemTitle = styled.div`
  font-size: 1.1rem; display: flex; align-items: center; gap: 10px;
  color: ${props => props.$isSecret ? '#888' : '#fff'};
`;

const ItemInfo = styled.div`
  font-size: 0.85rem; color: #666; display: flex; gap: 20px;
`;

// 🚀 [중요 수정] 답변 영역 스타일 (들여쓰기 및 CSS 처리)
const AnswerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 0 0 25px; /* 💡 왼쪽 들여쓰기 25px */
  color: #888;
  font-size: 0.9rem;
  width: 100%; /* 너비 꽉 차게 */
`;

const ReplyIcon = styled.span`
  color: #555;
  font-weight: bold;
  font-size: 1.2rem;
  line-height: 1;
`;

// ==========================================
// 🎨 Modal Styled Components (동일)
// ==========================================
const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.8); backdrop-filter: blur(5px);
  display: flex; justify-content: center; align-items: center; z-index: 9999;
`;

const ModalBox = styled.div`
  background: #111; border: 1px solid #333; padding: 40px; width: 100%; max-width: 400px;
  display: flex; flex-direction: column; gap: 20px; text-align: center;
`;

const ModalInput = styled.input`
  background: transparent; border: 1px solid #444; color: #fff; padding: 15px;
  font-size: 1rem; text-align: center; letter-spacing: 3px;
  &:focus { outline: none; border-color: #fff; }
`;

const ModalBtnGroup = styled.div`
  display: flex; gap: 10px;
`;

const ModalBtn = styled.button`
  flex: 1; padding: 15px; cursor: pointer; font-weight: bold; border: none;
  background: ${props => props.$primary ? '#fff' : '#333'};
  color: ${props => props.$primary ? '#000' : '#fff'};
  &:hover { opacity: 0.8; }
`;

// ==========================================
// 🚀 Main Component
// ==========================================
const BoardList = () => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const { isAdmin } = useAuth(); // 관리자 체크

  // 모달 상태 관리
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');

  // 1. 게시글 목록 불러오기
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/boards`);
        setBoards(res.data);
      } catch (error) {
        console.error("게시글을 불러오지 못했습니다.", error);
      }
    };
    fetchBoards();
  }, []);

  // 2. 글 클릭 시 (관리자 프리패스 로직 동일)
  const handleBoardClick = (board) => {
    if (isAdmin) {
      navigate(`/board/${board.id}`);
      return;
    }

    if (board.secret) {
      setSelectedBoardId(board.id);
      setPasswordInput('');
      setModalOpen(true);
    } else {
      navigate(`/board/${board.id}`);
    }
  };

  // 3. 비밀번호 확인 (로직 동일)
  const handleVerifyPassword = async () => {
    if (!passwordInput) return alert("비밀번호를 입력해주세요.");

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/boards/${selectedBoardId}/verify`, {
        password: passwordInput
      });

      if (res.data === true) {
        setModalOpen(false);
        navigate(`/board/${selectedBoardId}`);
      } else {
        alert("비밀번호가 일치하지 않습니다.");
        setPasswordInput('');
      }
    } catch (error) {
      console.error("비밀번호 확인 에러:", error);
      alert("오류가 발생했습니다.");
    }
  };

  return (
    <BoardContainer>
      <BoardWrapper>
        <HeaderArea>
          <Title>Q&A</Title>
          <WriteButton onClick={() => navigate('/board/write')}>
            <Edit3 size={18} /> WRITE
          </WriteButton>
        </HeaderArea>

        <BoardListUl>
          {boards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>등록된 문의글이 없습니다.</div>
          ) : (
            boards.map((board) => (
              <BoardItem key={board.id} onClick={() => handleBoardClick(board)}>

                {/* 🚀 [중요 수정] 원글 영역을 위한 Row 감싸기 */}
                <BoardMainRow>
                  <ItemTitle $isSecret={board.secret}>
                    {board.secret && <Lock size={16} color="#888" />}
                    {board.secret ? '비밀글입니다.' : board.title}
                  </ItemTitle>
                  <ItemInfo>
                    <span>{board.writer}</span>
                    <span>{board.regTime ? board.regTime.substring(0, 10) : ''}</span>
                  </ItemInfo>
                </BoardMainRow>

                {/* 🚀 [중요 수정] 답변 영역 (답변이 있을 때만 정확히 밑에 표시) */}
                {board.answer && (
                  <AnswerRow>
                    <ReplyIcon>└</ReplyIcon>
                    <div style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1 /* 남은 공간 차지 */
                    }}>
                      {/* 💡 보안 처리: 비밀글의 답변이면 내용을 숨김 */}
                      {board.secret && !isAdmin ? (
                        <span style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>비밀글의 답변입니다.</span>
                      ) : (
                        board.answer
                      )}
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      background: '#333',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: '#fff',
                      marginLeft: '5px',
                      whiteSpace: 'nowrap'
                    }}>
                      답변완료
                    </span>
                  </AnswerRow>
                )}
              </BoardItem>
            ))
          )}
        </BoardListUl>
      </BoardWrapper>

      {/* 🔒 비밀번호 모달 (동일) */}
      {modalOpen && (
        <ModalOverlay>
          <ModalBox>
            <h3 style={{ margin: 0, fontFamily: 'Playfair Display', letterSpacing: '2px' }}>SECRET POST</h3>
            <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>이 글의 비밀번호를 입력해주세요.</p>
            <ModalInput
              type="password"
              placeholder="PASSWORD"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
            />
            <ModalBtnGroup>
              <ModalBtn onClick={() => setModalOpen(false)}>CANCEL</ModalBtn>
              <ModalBtn $primary handleVerifyPassword>CONFIRM</ModalBtn>
            </ModalBtnGroup>
          </ModalBox>
        </ModalOverlay>
      )}
    </BoardContainer>
  );
};

export default BoardList;