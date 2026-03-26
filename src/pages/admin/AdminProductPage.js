import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const AdminContainer = styled.div`
  background: #000; color: #fff; min-height: 100vh;
  display: flex; flex-direction: column; align-items: center; padding-top: 50px;
  padding-bottom: 50px;
`;

const FormWrapper = styled.form`
  position: relative; 
  width: 100%; max-width: 500px; display: flex; flex-direction: column; gap: 20px;
  background: rgba(255, 255, 255, 0.05); padding: 40px; border: 1px solid #333;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px; right: 20px; 
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
  // 🚀 1. URL 파라미터에서 id 가져오기 (id가 있으면 수정 모드!)
  const { id } = useParams();
  const isEditMode = !!id;

  const [product, setProduct] = useState({
    name: '', price: '', stockQuantity: '', description: '', category: 'TOP'
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // 🚀 2. 수정 모드일 경우, 마운트 시 기존 데이터 불러오기
  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          // 💡 1. 토큰 꺼내기!
          const token = localStorage.getItem('accessToken');

          // 💡 2. 헤더에 토큰 싣고 요청하기! (주소가 맞는지 꼭 백엔드랑 크로스 체크!)
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/items/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          const data = res.data;

          // 폼 상태에 기존 데이터 세팅
          setProduct({
            name: data.name || '',
            price: data.price || '',
            stockQuantity: data.stockQuantity || '',
            description: data.description || '',
            category: data.category || 'TOP'
          });

          // 기존 이미지가 있다면 미리보기에 띄워주기
          if (data.itemImgList && data.itemImgList.length > 0) {
            setPreviewUrls(data.itemImgList.map(img => img.imgUrl));
          }
        } catch (error) {
          // 💡 3. 에러 났을 때 콘솔에 뭐가 찍히는지 확인용 로그!
          console.error("🕵️‍♂️ 백엔드 응답 에러:", error.response || error);
          alert("상품 정보를 불러올 수 없습니다. 권한이나 API 주소를 확인해 주세요!");
          navigate('/');
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode, navigate]);

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
    // 🚀 새 파일 올리면 기존 미리보기 덮어쓰기
    setPreviewUrls(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product.name || !product.price || !product.stockQuantity) {
      alert("상품명, 가격, 수량은 필수입니다!"); return;
    }

    // 등록 모드일 때만 사진 필수, 수정 모드일 때는 사진 안 올리면 기존 사진 유지(백엔드 로직에 따라 다름)
    if (!isEditMode && imageFiles.length === 0) {
      alert("최소 1장 이상의 상품 사진을 등록해주세요!"); return;
    }

    try {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('price', product.price);
      formData.append('stockQuantity', product.stockQuantity);
      formData.append('description', product.description);
      formData.append('category', product.category);

      imageFiles.forEach((file) => {
        formData.append('imageFiles', file);
      });

      const token = localStorage.getItem('accessToken');

      // 🚀 3. 분기 처리: 수정 모드면 PUT (또는 POST), 등록 모드면 POST
      // 백엔드 API 명세에 따라 method가 다를 수 있으니 맞게 수정해! 보통 수정은 PUT이나 POST(id포함)을 써.
      const url = isEditMode
        ? `${process.env.REACT_APP_API_URL}/api/admin/items/${id}`
        : `${process.env.REACT_APP_API_URL}/api/admin/items`;

      const method = isEditMode ? 'put' : 'post';

      await axios({
        method: method,
        url: url,
        data: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      alert(isEditMode ? "상품이 성공적으로 수정되었습니다! 🛠️" : "상품이 성공적으로 등록되었습니다! 🎉");
      navigate(-1); // 수정 완료 후 뒤로 가기 (상세 페이지로 복귀)

    } catch (error) {
      console.error("상품 처리 실패:", error);
      if (error.response && error.response.status === 403) {
        alert("관리자 권한이 필요합니다.");
      } else {
        alert("상품 저장 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <AdminContainer>
      {/* 🚀 타이틀도 모드에 따라 다르게! */}
      <h2 style={{fontFamily: 'Playfair Display', marginBottom: '30px', letterSpacing: '2px'}}>
        {isEditMode ? 'EDIT PRODUCT' : 'REGISTER PRODUCT'}
      </h2>
      <FormWrapper onSubmit={handleSubmit}>
        <CloseButton type="button" onClick={() => navigate(-1)}>
          ✕
        </CloseButton>
        <FileInputWrapper>
          <label style={{fontSize: '0.8rem', color: '#888'}}>
            PRODUCT IMAGES (상품 사진 - 최대 5장) {isEditMode && "※ 미선택 시 기존 사진 유지"}
          </label>
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

        {/* 🚀 버튼 텍스트도 모드에 따라 다르게! */}
        <SubmitButton type="submit">
          {isEditMode ? '수정하기 (UPDATE PRODUCT)' : '등록하기 (ADD PRODUCT)'}
        </SubmitButton>
      </FormWrapper>
    </AdminContainer>
  );
};

export default AdminProductPage;