// Auth service - uses localStorage for demo/simple auth (no Supabase auth)

const USER_KEY = 'campusfind_user';

export const authService = {
  register: async (email, password, name) => {
    const user = { id: Date.now().toString(), email, name: name || email.split('@')[0] };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  login: async (email, password) => {
    const user = { id: Date.now().toString(), email, name: email.split('@')[0] };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  logout: async () => {
    localStorage.removeItem(USER_KEY);
  },

  getSession: () => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
};

export default authService;
