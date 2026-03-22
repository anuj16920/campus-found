import { api } from './api.service';

const TOKEN_KEY = 'campusfind_token';
const USER_KEY = 'campusfind_user';

export const authService = {
  register: async (email, password, name) => {
    const { data } = await api.post('/auth/register', { email, password, name });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getSession: () => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  getToken: () => localStorage.getItem(TOKEN_KEY),
};

export default authService;
