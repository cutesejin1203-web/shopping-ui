import axios from 'axios';

// 💡 [10년차 팁] API 인스턴스를 분리하고, 요청할 때마다 헤더에 토큰을 찔러넣어주게 인터셉터를 달았어.
const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api/cart`,
  headers: { 'Content-Type': 'application/json' }
});

// 로그인한 사용자라면 토큰을 헤더에 실어서 보냄
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const cartApi = {
  // 장바구니 목록 조회
  getCartItems: () => api.get('/'),
  
  // 장바구니 추가 (보통 백엔드에서 { itemId, quantity } 같은 DTO를 요구함)
  addToCart: (data) => api.post('/', data),
  
  // 수량 변경
  updateQuantity: (cartItemId, quantity) => api.put(`/${cartItemId}`, { quantity }),
  
  // 장바구니 삭제
  removeFromCart: (cartItemId) => api.delete(`/${cartItemId}`)
};