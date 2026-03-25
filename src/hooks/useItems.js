import { useState, useEffect } from 'react';
import { itemApi } from '../api/itemApi';

export const useItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      // [수정 포인트] { data } 대신 response 전체를 받고,
      // 로그에 찍혔던 그 'data' 배열을 꺼내서 넣어줘.
      const response = await itemApi.getItems();

      console.log("실제 데이터 배열 확인:", response.data); // 여기서 배열이 나오면 성공!
      setItems(response.data || []);

    } catch (err) {
      console.error("데이터 로드 실패", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  return { items, loading, refetch: fetchItems };
};