const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to make authenticated requests
const makeRequest = async (url: string, options: RequestInit = {}) => {
  const config: RequestInit = {
    credentials: 'include', // Include cookies for session authentication
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  return handleResponse(response);
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return makeRequest('/auth/users/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async () => {
    return makeRequest('/auth/users/logout/', { method: 'POST' });
  },

  getCurrentUser: async () => {
    return makeRequest('/auth/users/me/');
  },
};

// Products API
export const productsAPI = {
  getAll: async () => {
    return makeRequest('/products/');
  },

  getById: async (id: number) => {
    return makeRequest(`/products/${id}/`);
  },

  create: async (data: any) => {
    return makeRequest('/products/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any) => {
    return makeRequest(`/products/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return makeRequest(`/products/${id}/`, { method: 'DELETE' });
  },

  getStats: async () => {
    return makeRequest('/products/stats/');
  },

  getLowStock: async () => {
    return makeRequest('/products/low_stock/');
  },
};

// Suppliers API
export const suppliersAPI = {
  getAll: async () => {
    return makeRequest('/suppliers/');
  },

  getById: async (id: number) => {
    return makeRequest(`/suppliers/${id}/`);
  },

  create: async (data: any) => {
    return makeRequest('/suppliers/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any) => {
    return makeRequest(`/suppliers/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return makeRequest(`/suppliers/${id}/`, { method: 'DELETE' });
  },
};

// Orders API
export const ordersAPI = {
  getAll: async (status?: string) => {
    const url = status ? `/orders/?status=${status}` : '/orders/';
    return makeRequest(url);
  },

  getById: async (id: number) => {
    return makeRequest(`/orders/${id}/`);
  },

  create: async (data: any) => {
    return makeRequest('/orders/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any) => {
    return makeRequest(`/orders/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return makeRequest(`/orders/${id}/`, { method: 'DELETE' });
  },

  getStats: async () => {
    return makeRequest('/orders/stats/');
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    return makeRequest('/auth/users/');
  },

  getById: async (id: number) => {
    return makeRequest(`/auth/users/${id}/`);
  },

  create: async (data: any) => {
    return makeRequest('/auth/users/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any) => {
    return makeRequest(`/auth/users/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return makeRequest(`/auth/users/${id}/`, { method: 'DELETE' });
  },
};