import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminContainer = styled.div`
  background: #000; color: #fff; min-height: 100vh;
  display: flex; flex-direction: column; align-items: center; padding-top: 50px;
  padding-bottom: 50px;
`;

// 기존 FormWrapper 스타일에 position: relative; 추가 (버튼 위치 잡기 위함)
const FormWrapper = styled.form`
  position: relative; /* 🚀 이거 꼭 추가해야 닫기 버튼이 폼 안에서 자리 잡아! */
  width: 100%; max-width: 500px; display: flex; flex-direction: column; gap: 20px;
  background: rgba(255, 255, 255, 0.05); padding: 40px; border: 1px solid #333;
`;

// 닫기 버튼 스타일 새로 추가
const CloseButton = styled.button`
  position: absolute;
  top: 20px; right: 20px; /* 우측 상단 여백 */
  background: transparent; border: none;
  color: #888; font-size: 1.5rem; cursor: pointer;
  transition: all 0.3s ease;
  display: flex; align-items: center; justify-content: center;
  &:hover { color: #fff; transform: scale(1.1); }
`;

const Input = styled.input`
  width: 100%; background: transparent; border: none; 
  border-bottom: 1px solid #444; padding: 10px 5px; color: #fff; font-size: 1rem;
  &:focus { outline: none; border-bottom: 1px solid #fff; }
`;

const Select = styled.select`
  width: 100%; background: #111; border: 1px solid #444; 
  padding: 10px 5px; color: #fff; font-size: 1rem;
  &:focus { outline: none; border-color: #fff; }
`;

const TextArea = styled.textarea`
  width: 100%; background: transparent; border: 1px solid #444; 
  padding: 10px; color: #fff; font-size: 1rem; min-height: 100px; resize: none;
  &:focus { outline: none; border: 1px solid #fff; }
`;

const SubmitButton = styled.button`
  background: #fff; color: #000; padding: 15px; border: none; 
  font-weight: bold; cursor: pointer; margin-top: 20px; font-size: 1.1rem;
  transition: all 0.3s ease;
  &:hover { background: #ddd; }
`;

const FileInputWrapper = styled.div`
  display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const FileLabel = styled.label`
  background: transparent; color: #fff; padding: 12px; border: 1px dashed #666;
  text-align: center; cursor: pointer; font-size: 0.9rem; transition: all 0.3s ease;
  &:hover { border-color: #fff; background: rgba(255, 255, 255, 0.1); }
`;

const PreviewContainer = styled.div`
  display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;
`;

const PreviewImage = styled.img`
  width: 80px; height: 80px; object-fit: cover; border: 1px solid #444; border-radius: 4px;
`;

const AdminProductPage = () => {
  const navigate = useNavigate();

  // 1. 기존 상품 정보 상태에 카테고리(category) 추가!
  const [product, setProduct] = useState({
    name: '', price: '', stockQuantity: '', description: '', category: 'TOP' // 기본값 설정
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 5) {
      alert("사진은 최대 5장까지 업로드 가능합니다.");
      return;
    }

    setImageFiles(files);
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product.name || !product.price || !product.stockQuantity) {
      alert("상품명, 가격, 수량은 필수입니다!"); return;
    }

    if (imageFiles.length === 0) {
      alert("최소 1장 이상의 상품 사진을 등록해주세요!"); return;
    }

    try {
      const formData = new FormData();

      formData.append('name', product.name);
      formData.append('price', product.price);
      formData.append('stockQuantity', product.stockQuantity);
      formData.append('description', product.description);
      // 🚀 카테고리 정보도 백엔드로 같이 넘겨주자!
      formData.append('category', product.category);

      imageFiles.forEach((file) => {
        formData.append('imageFiles', file);
      });

      // API 요청 시 헤더에 토큰 실어주기 (Admin 인증 필요)
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/items`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
      });

      alert("상품이 성공적으로 등록되었습니다! 🎉");
      navigate('/');

    } catch (error) {
      console.error("상품 등록 실패:", error);
      if (error.response && error.response.status === 403) {
        alert("관리자 권한이 필요합니다.");
      } else {
        alert("상품 등록 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <AdminContainer>
      <h2 style={{fontFamily: 'Playfair Display', marginBottom: '30px', letterSpacing: '2px'}}>REGISTER PRODUCT</h2>
      <FormWrapper onSubmit={handleSubmit}>
<       CloseButton type="button" onClick={() => navigate('/')}>
          ✕
        </CloseButton>
        <FileInputWrapper>
          <label style={{fontSize: '0.8rem', color: '#888'}}>PRODUCT IMAGES (상품 사진 - 최대 5장)</label>
          <FileLabel htmlFor="file-upload">📸 사진 선택하기 (CHOOSE PHOTOS)</FileLabel>
          <HiddenFileInput
            id="file-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />

          {previewUrls.length > 0 && (
            <PreviewContainer>
              {previewUrls.map((url, index) => (
                <PreviewImage key={index} src={url} alt={`preview-${index}`} />
              ))}
            </PreviewContainer>
          )}
        </FileInputWrapper>

        {/* 🚀 카테고리 선택 영역 추가 */}
        <label style={{fontSize: '0.8rem', color: '#888'}}>CATEGORY (카테고리)</label>
        <Select name="category" value={product.category} onChange={handleChange}>
            <option value="TOP">Top (상의)</option>
            <option value="BOTTOM">Bottom (하의)</option>
            <option value="OUTER">Outer (아우터)</option>
            <option value="ACCESSORY">Accessory (액세서리)</option>
        </Select>

        <label style={{fontSize: '0.8rem', color: '#888'}}>PRODUCT NAME (상품명)</label>
        <Input name="name" placeholder="예: 럭셔리 블랙 티셔츠" value={product.name} onChange={handleChange} required />

        <label style={{fontSize: '0.8rem', color: '#888'}}>PRICE (가격)</label>
        <Input type="number" name="price" placeholder="예: 50000" value={product.price} onChange={handleChange} required />

        <label style={{fontSize: '0.8rem', color: '#888'}}>STOCK (수량)</label>
        <Input type="number" name="stockQuantity" placeholder="예: 100" value={product.stockQuantity} onChange={handleChange} required />

        <label style={{fontSize: '0.8rem', color: '#888'}}>DESCRIPTION (설명)</label>
        <TextArea name="description" placeholder="상품에 대한 상세 설명을 적어주세요." value={product.description} onChange={handleChange} />

        <SubmitButton type="submit">등록하기 (ADD PRODUCT)</SubmitButton>
      </FormWrapper>
    </AdminContainer>
  );
};

export default AdminProductPage;