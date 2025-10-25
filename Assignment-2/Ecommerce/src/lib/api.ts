const API_URL = 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const api = {
  products: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    getById: async (id: string) => {
      const response = await fetch(`${API_URL}/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return response.json();
    },
  },

  cart: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/cart`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch cart');
      return response.json();
    },
    add: async (productId: string, quantity: number) => {
      const response = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId, quantity }),
      });
      if (!response.ok) throw new Error('Failed to add to cart');
      return response.json();
    },
    update: async (id: string, quantity: number) => {
      const response = await fetch(`${API_URL}/cart/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity }),
      });
      if (!response.ok) throw new Error('Failed to update cart');
      return response.json();
    },
    delete: async (id: string) => {
      const response = await fetch(`${API_URL}/cart/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete from cart');
      return response.json();
    },
    getCount: async () => {
      const response = await fetch(`${API_URL}/cart/count`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch cart count');
      return response.json();
    },
  },

  orders: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/orders`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    create: async (orderData: any) => {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error('Failed to create order');
      return response.json();
    },
  },

  profile: {
    get: async () => {
      const response = await fetch(`${API_URL}/profile`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
    update: async (profileData: any) => {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
  },
};
