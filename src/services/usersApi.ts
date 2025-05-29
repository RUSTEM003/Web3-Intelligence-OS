import api from './api';

interface UserCredentials {
  username: string;
  password: string;
}

interface UserRegistration {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  role: string;
  department?: string;
}

interface UserUpdate {
  email?: string;
  full_name?: string;
  department?: string;
  role?: string;
}

export const registerUser = async (userData: UserRegistration) => {
  try {
    const response = await api.post('/api/users/', userData);
    return response.data;
  } catch (error: any) {
    console.error('Error registering user:', error);
    throw new Error(error.response?.data?.detail || 'Registration failed');
  }
};

export const loginUser = async (credentials: UserCredentials) => {
  try {
    const response = await api.post('/api/users/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
      localStorage.setItem('user_logged_in', 'true');
    }
    return response.data;
  } catch (error: any) {
    console.error('Error logging in:', error);
    throw new Error(error.response?.data?.detail || 'Login failed');
  }
};

export const logoutUser = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_logged_in');
  localStorage.removeItem('user_data');
};

export const getCurrentUser = async () => {
  const isLoggedIn = localStorage.getItem('user_logged_in') === 'true';
  if (!isLoggedIn) {
    throw new Error('User not logged in');
  }
  
  try {
    const response = await api.get('/api/users/');
    return response.data[0];
  } catch (error: any) {
    console.error('Error fetching current user:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch user data');
  }
};

export const getUsers = async () => {
  try {
    const response = await api.get('/api/users/');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching users:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch users');
  }
};

export const getUserById = async (id: string) => {
  try {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching user ${id}:`, error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch user');
  }
};

export const updateUser = async (id: string, userData: UserUpdate) => {
  try {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating user ${id}:`, error);
    throw new Error(error.response?.data?.detail || 'Failed to update user');
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getUsers,
  getUserById,
  updateUser
};
