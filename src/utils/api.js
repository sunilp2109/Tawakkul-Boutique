const API_BASE_URL = 'http://localhost:5000/api';

export const fetchProducts = async (params = {}) => {
  // Remove undefined/null params
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null)
  );
  const query = new URLSearchParams(cleanParams).toString();
  const res = await fetch(`${API_BASE_URL}/products?${query}`);
  const data = await res.json();
  return data;
};

export const fetchCategories = async () => {
  const res = await fetch(`${API_BASE_URL}/categories`);
  const data = await res.json();
  return data;
};

export const fetchProductById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`);
  const data = await res.json();
  return data;
};

export const createOrder = async (orderData) => {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });
  const data = await res.json();
  return data;
};

export const getImageUrl = (path) => {
  if (!path) return '/images/placeholder.png';
  if (path.startsWith('http')) return path;
  
  // If it's a frontend asset (in public/images)
  if (path.startsWith('/images/')) {
    return path;
  }
  
  // If it's a backend upload
  return `http://localhost:5000${path}`;
};
