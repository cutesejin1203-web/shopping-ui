import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api/product`,
  headers: { 'Content-Type': 'application/json' }
});

export const itemApi = {
  getItems: () => api.get('/items'),
  createItem: (data) => api.post('/items', data),
  deleteItem: (id) => api.delete(`/items/${id}`)
};

 console.log('getItems', itemApi.getItems());